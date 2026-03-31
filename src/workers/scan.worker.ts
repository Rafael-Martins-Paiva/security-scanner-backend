import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ScansService } from '../scans/scans.service';
import { ManifestType } from '../parsers/interfaces';

@Processor('scans')
export class ScanWorker extends WorkerHost {
  constructor(private readonly scansService: ScansService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { scanId, content, manifestType } = job.data;
    console.log(`Processing scan ${scanId} of type ${manifestType}`);
    
    await this.scansService.processScan(scanId, content, manifestType as ManifestType);
    
    return { success: true };
  }
}
