import { ManifestType, ManifestParser } from './interfaces';
import { NpmParser } from './npm-parser';
import { PipParser } from './pip-parser';

export class ManifestParserFactory {
  static getParser(type: ManifestType): ManifestParser {
    switch (type) {
      case ManifestType.PACKAGE_JSON:
        return new NpmParser();
      case ManifestType.REQUIREMENTS_TXT:
        return new PipParser();
      default:
        throw new Error(`Unsupported manifest type: ${type}`);
    }
  }
}
