import { OsvScanner } from './osv-scanner';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OsvScanner', () => {
  let scanner: OsvScanner;

  beforeEach(() => {
    scanner = new OsvScanner();
  });

  it('should return vulnerabilities from OSV API for npm package', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        vulns: [
          {
            id: 'GHSA-abcd-1234',
            summary: 'A critical vulnerability',
            details: 'Something bad',
            severity: [{ type: 'CVSS_V3', score: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H' }]
          }
        ]
      }
    });

    const result = await scanner.scan('lodash', '4.17.21', 'npm');

    expect(result.vulnerabilities.length).toBe(1);
    expect(result.vulnerabilities[0].externalId).toBe('GHSA-abcd-1234');
  });

  it('should handle packages with no vulnerabilities', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {}
    });

    const result = await scanner.scan('clean-pkg', '1.0.0', 'npm');

    expect(result.vulnerabilities.length).toBe(0);
  });
});
