import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  private clerkClient;

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
      // No SDK v3+, usamos verifyToken diretamente do client ou verifyJwt
      const sessionClaims = await this.clerkClient.verifyToken(token);
      
      request['auth'] = {
        userId: sessionClaims.sub,
        claims: sessionClaims,
      };
      
      return true;
    } catch (error) {
      console.error('Auth Error:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
