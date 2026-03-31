import { NpmParser } from './npm-parser';

describe('NpmParser', () => {
  let parser: NpmParser;

  beforeEach(() => {
    parser = new NpmParser();
  });

  it('should extract dependencies from a package.json content', () => {
    const content = JSON.stringify({
      dependencies: {
        lodash: '^4.17.21',
        express: '4.18.2'
      },
      devDependencies: {
        typescript: '^4.9.5'
      }
    });

    const result = parser.parse(content);

    expect(result).toContainEqual({ name: 'lodash', version: '4.17.21' });
    expect(result).toContainEqual({ name: 'express', version: '4.18.2' });
    expect(result).toContainEqual({ name: 'typescript', version: '4.9.5' });
  });

  it('should handle versions with prefixes like ^ or ~', () => {
    const content = JSON.stringify({
      dependencies: {
        'my-lib': '~1.2.3',
        'another-lib': '>=2.0.0'
      }
    });

    const result = parser.parse(content);

    expect(result).toContainEqual({ name: 'my-lib', version: '1.2.3' });
    expect(result).toContainEqual({ name: 'another-lib', version: '2.0.0' });
  });

  it('should return empty array if no dependencies found', () => {
    const content = JSON.stringify({});
    const result = parser.parse(content);
    expect(result).toEqual([]);
  });
});
