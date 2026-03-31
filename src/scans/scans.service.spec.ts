import { Test, TestingModule } from '@nestjs/testing';
import { ScansService } from './scans.service';
import { PrismaService } from '../prisma.service';
import { OsvScanner } from '../scanners/osv-scanner';
import { ManifestType } from '../parsers/interfaces';

jest.mock('../scanners/osv-scanner');

describe('ScansService', () => {
  let service: ScansService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScansService,
        {
          provide: PrismaService,
          useValue: {
            scan: {
              update: jest.fn().mockResolvedValue({ id: '1' }),
            },
            scanResult: {
              create: jest.fn().mockResolvedValue({ id: '1' }),
            },
            vulnerability: {
              createMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            malwareReport: {
              createMany: jest.fn().mockResolvedValue({ count: 0 }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ScansService>(ScansService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should process a scan and update DB', async () => {
    const scanId = '1';
    const content = JSON.stringify({ dependencies: { lodash: '4.17.21' } });
    const type = ManifestType.PACKAGE_JSON;

    const mockedOsvScanner = OsvScanner as jest.MockedClass<typeof OsvScanner>;
    mockedOsvScanner.prototype.scan.mockResolvedValue({
        vulnerabilities: [{ externalId: 'CVE-1', cvssScore: 5.0, severity: 'MEDIUM' }],
        malwareReports: []
    });

    await service.processScan(scanId, content, type);

    expect(prisma.scan.update).toHaveBeenCalled();
  });
});
