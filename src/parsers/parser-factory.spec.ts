import { ManifestParserFactory } from './parser-factory';
import { NpmParser } from './npm-parser';
import { PipParser } from './pip-parser';
import { ManifestType } from './interfaces';

describe('ManifestParserFactory', () => {
  it('should return NpmParser for PACKAGE_JSON', () => {
    const parser = ManifestParserFactory.getParser(ManifestType.PACKAGE_JSON);
    expect(parser).toBeInstanceOf(NpmParser);
  });

  it('should return PipParser for REQUIREMENTS_TXT', () => {
    const parser = ManifestParserFactory.getParser(ManifestType.REQUIREMENTS_TXT);
    expect(parser).toBeInstanceOf(PipParser);
  });
});
