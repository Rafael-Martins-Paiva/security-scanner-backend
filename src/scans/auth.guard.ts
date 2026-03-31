import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ClerkClient, createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  private clerkClient: ClerkClient;

  constructor(private configService: ConfigService) {
    this.clerkClient = createClerkClient({
      secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      // Valida o token JWT enviado pelo Frontend (Clerk Session Token)
      const sessionClaims = await this.clerkClient.verifyToken(token);
      
      // Anexa os dados do usuário à requisição
      request['auth'] = {
        userId: sessionClaims.sub,
        claims: sessionClaims,
      };
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
