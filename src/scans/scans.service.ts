import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ManifestParserFactory } from '../parsers/parser-factory';
import { ManifestType } from '../parsers/interfaces';
import { OsvScanner } from '../scanners/osv-scanner';
import { RiskScorer } from '../scoring/risk-scorer';
import { ScannerResult } from '../scanners/interfaces';
import { ScanStatus, ManifestType as PrismaManifestType } from '@prisma/client';

@Injectable()
export class ScansService {
  private readonly osvScanner = new OsvScanner();
  private readonly riskScorer = new RiskScorer();

  constructor(private readonly prisma: PrismaService) {}

  async processScan(scanId: string, content: string, type: ManifestType) {
    await this.prisma.scan.update({
      where: { id: scanId },
      data: { status: ScanStatus.PROCESSING }
    });

    try {
      const parser = ManifestParserFactory.getParser(type);
      const dependencies = parser.parse(content);
      const scannerResults: ScannerResult[] = [];

      for (const dep of dependencies) {
        const ecosystem = type === ManifestType.PACKAGE_JSON ? 'npm' : 'pypi';
        const res = await this.osvScanner.scan(dep.name, dep.version, ecosystem);
        scannerResults.push(res);

        const scanResult = await this.prisma.scanResult.create({
          data: {
            libraryName: dep.name,
            libraryVersion: dep.version,
            scanId: scanId
          }
        });

        if (res.vulnerabilities.length > 0) {
          await this.prisma.vulnerability.createMany({
            data: res.vulnerabilities.map(v => ({
              externalId: v.externalId,
              title: v.title,
              description: v.description,
              severity: v.severity,
              cvssScore: v.cvssScore,
              scanResultId: scanResult.id
            }))
          });
        }

        if (res.malwareReports.length > 0) {
          await this.prisma.malwareReport.createMany({
            data: res.malwareReports.map(m => ({
              engine: m.engine,
              result: m.result,
              scanResultId: scanResult.id
            }))
          });
        }
      }

      const riskScore = this.riskScorer.calculate(scannerResults);

      await this.prisma.scan.update({
        where: { id: scanId },
        data: {
          status: ScanStatus.COMPLETED,
          riskScore: riskScore
        }
      });
    } catch (error) {
      console.error(`Error processing scan ${scanId}:`, error);
      await this.prisma.scan.update({
        where: { id: scanId },
        data: { status: ScanStatus.FAILED }
      });
    }
  }

  async createScan(userId: string, type: ManifestType) {
    return this.prisma.scan.create({
      data: {
        userId,
        manifestType: type as unknown as PrismaManifestType,
        status: ScanStatus.PENDING
      }
    });
  }

  async getScan(id: string) {
    return this.prisma.scan.findUnique({
      where: { id },
      include: {
        results: {
          include: {
            vulnerabilities: true,
            malwareReports: true
          }
        }
      }
    });
  }

  async getHistory(userId: string) {
    return this.prisma.scan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
