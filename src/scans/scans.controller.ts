import { Controller, Post, Body, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ScansService } from './scans.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ManifestType } from '../parsers/interfaces';
import { AuthGuard } from './auth.guard';

@Controller('api/v1/scans')
@UseGuards(AuthGuard)
export class ScansController {
  constructor(
    private readonly scansService: ScansService,
    @InjectQueue('scans') private readonly scansQueue: Queue
  ) {}

  @Post('manifest')
  async scanManifest(@Body() body: { content: string, type: ManifestType }, @Req() req: any) {
    const userId = req.auth.userId;
    const scan = await this.scansService.createScan(userId, body.type);
...
    await this.scansQueue.add('process', {
      scanId: scan.id,
      content: body.content,
      manifestType: body.type
    });

    return { 
        id: scan.id, 
        status: 'PENDING',
        message: 'Scan job submitted' 
    };
  }

  @Get('history')
  async getHistory(@Req() req: any) {
    const userId = req.auth?.userId || 'anonymous-user';
    return this.scansService.getHistory(userId);
  }

  @Get(':id')
  async getScan(@Param('id') id: string) {
    return this.scansService.getScan(id);
  }
}
