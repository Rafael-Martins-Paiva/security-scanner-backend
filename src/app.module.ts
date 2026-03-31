import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScansModule } from './scans/scans.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        
        if (redisUrl) {
          try {
            const url = new URL(redisUrl);
            return {
              connection: {
                host: url.hostname,
                port: parseInt(url.port, 10) || 6379,
                username: url.username || 'default',
                password: url.password,
                tls: url.protocol === 'rediss:' ? {} : undefined,
              },
            };
          } catch (e) {
            console.error('Invalid REDIS_URL provided');
          }
        }

        return {
          connection: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
        };
      },
      inject: [ConfigService],
    }),
    ScansModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
