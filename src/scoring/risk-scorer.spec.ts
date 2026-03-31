import { RiskScorer } from './risk-scorer';
import { ScannerResult } from '../scanners/interfaces';

describe('RiskScorer', () => {
  let scorer: RiskScorer;

  beforeEach(() => {
    scorer = new RiskScorer();
  });

  it('should return 0 for clean results', () => {
    const results: ScannerResult[] = [{ vulnerabilities: [], malwareReports: [] }];
    const score = scorer.calculate(results);
    expect(score).toBe(0);
  });

  it('should calculate score based on vulnerabilities', () => {
    const results: ScannerResult[] = [{
      vulnerabilities: [
        { externalId: 'CVE-1', cvssScore: 5.0 },
        { externalId: 'CVE-2', cvssScore: 9.0 }
      ],
      malwareReports: []
    }];
    const score = scorer.calculate(results);
    // Simple logic: return the maximum score found
    expect(score).toBe(9.0);
  });

  it('should return 10 if malware is detected', () => {
    const results: ScannerResult[] = [{
      vulnerabilities: [],
      malwareReports: [{ engine: 'VT', result: 'malicious' }]
    }];
    const score = scorer.calculate(results);
    expect(score).toBe(10);
  });
});
