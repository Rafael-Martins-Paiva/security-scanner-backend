import { Module } from '@nestjs/common';
import { ScansService } from './scans.service';
import { ScansController } from './scans.controller';
import { PrismaService } from '../prisma.service';
import { BullModule } from '@nestjs/bullmq';
import { ScanWorker } from '../workers/scan.worker';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'scans',
    }),
  ],
  controllers: [ScansController],
  providers: [ScansService, PrismaService, ScanWorker],
  exports: [ScansService],
})
export class ScansModule {}
