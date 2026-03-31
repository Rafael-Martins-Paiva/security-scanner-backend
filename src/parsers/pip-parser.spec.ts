import { PipParser } from './pip-parser';

describe('PipParser', () => {
  let parser: PipParser;

  beforeEach(() => {
    parser = new PipParser();
  });

  it('should extract dependencies from requirements.txt content', () => {
    const content = `
requests==2.28.1
flask>=2.0.0
django~=4.0.0
gunicorn
    `;

    const result = parser.parse(content);

    expect(result).toContainEqual({ name: 'requests', version: '2.28.1' });
    expect(result).toContainEqual({ name: 'flask', version: '2.0.0' });
    expect(result).toContainEqual({ name: 'django', version: '4.0.0' });
    expect(result).toContainEqual({ name: 'gunicorn', version: 'latest' });
  });

  it('should handle comments and empty lines', () => {
    const content = `
# This is a comment
requests==2.28.1

   # another comment
pandas==1.5.0
    `;

    const result = parser.parse(content);

    expect(result).toContainEqual({ name: 'requests', version: '2.28.1' });
    expect(result).toContainEqual({ name: 'pandas', version: '1.5.0' });
    expect(result.length).toBe(2);
  });
});
