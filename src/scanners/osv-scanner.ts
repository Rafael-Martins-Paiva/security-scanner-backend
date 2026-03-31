import axios from 'axios';
import { Scanner, ScannerResult, Vulnerability } from './interfaces';

export class OsvScanner implements Scanner {
  private readonly baseUrl = 'https://api.osv.dev/v1/query';

  async scan(name: string, version: string, type: 'npm' | 'pypi'): Promise<ScannerResult> {
    const ecosystem = type === 'npm' ? 'npm' : 'PyPI';
    
    try {
      const response = await axios.post(this.baseUrl, {
        version,
        package: {
          name,
          ecosystem
        }
      });

      const vulns = response.data.vulns || [];
      const vulnerabilities: Vulnerability[] = vulns.map((v: any) => ({
        externalId: v.id,
        title: v.summary,
        description: v.details,
        severity: this.extractSeverityLabel(v.severity),
        cvssScore: this.extractCvssScore(v.severity)
      }));

      return {
        vulnerabilities,
        malwareReports: []
      };
    } catch (error) {
      console.error(`OSV Scan error for ${name}@${version}:`, error.message);
      return { vulnerabilities: [], malwareReports: [] };
    }
  }

  private extractSeverityLabel(severity: any[]): string | undefined {
    // If multiple severities, just pick the first one's score or a generic label
    if (!severity || !severity.length) return undefined;
    return severity[0].type;
  }

  private extractCvssScore(severity: any[]): number | undefined {
    if (!severity || !severity.length) return undefined;
    // Attempt to extract score from vector or direct score if available
    // For simplicity, we just return a placeholder or check if score is there
    // In a production app, we'd use a CVSS parser
    const first = severity[0];
    if (first.score && typeof first.score === 'string' && first.score.includes('CVSS:')) {
      // In OSV, sometimes the score is the vector string
      return undefined; // We'll need a real parser for this
    }
    return undefined;
  }
}
