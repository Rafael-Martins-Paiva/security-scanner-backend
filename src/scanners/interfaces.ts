export interface Vulnerability {
  externalId: string;
  title?: string;
  description?: string;
  severity?: string;
  cvssScore?: number;
}

export interface MalwareReport {
  engine: string;
  result: string;
}

export interface ScannerResult {
  vulnerabilities: Vulnerability[];
  malwareReports: MalwareReport[];
}

export interface Scanner {
  scan(name: string, version: string, type: 'npm' | 'pypi'): Promise<ScannerResult>;
}
