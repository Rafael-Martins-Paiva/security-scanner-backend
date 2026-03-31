import { ScannerResult } from '../scanners/interfaces';

export class RiskScorer {
  /**
   * Calculates a risk score from 0 to 10.
   * Logic:
   * - 10 if any malware is detected.
   * - Maximum CVSS score among all vulnerabilities.
   * - 0 if clean.
   */
  calculate(results: ScannerResult[]): number {
    let maxScore = 0;

    for (const res of results) {
      // Check for malware
      if (res.malwareReports.length > 0) {
        return 10.0;
      }

      // Check for vulnerabilities
      for (const vuln of res.vulnerabilities) {
        const score = vuln.cvssScore ?? 0;
        if (score > maxScore) {
          maxScore = score;
        }

        // If no score but exists, we might give a default for "Low/Medium/High"
        // For simplicity, we just handle provided scores here.
        if (vuln.severity === 'CRITICAL') maxScore = Math.max(maxScore, 9.0);
        else if (vuln.severity === 'HIGH') maxScore = Math.max(maxScore, 7.0);
        else if (vuln.severity === 'MEDIUM') maxScore = Math.max(maxScore, 4.0);
        else if (vuln.severity === 'LOW') maxScore = Math.max(maxScore, 1.0);
      }
    }

    return parseFloat(maxScore.toFixed(1));
  }
}
