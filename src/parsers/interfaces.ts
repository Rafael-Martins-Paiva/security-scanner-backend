export enum ManifestType {
  PACKAGE_JSON = 'PACKAGE_JSON',
  REQUIREMENTS_TXT = 'REQUIREMENTS_TXT',
}

export interface Dependency {
  name: string;
  version: string;
}

export interface ManifestParser {
  parse(content: string): Dependency[];
}
