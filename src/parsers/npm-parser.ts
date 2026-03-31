import { Dependency, ManifestParser } from './interfaces';

export class NpmParser implements ManifestParser {
  parse(content: string): Dependency[] {
    try {
      const json = JSON.parse(content);
      const dependencies = {
        ...(json.dependencies || {}),
        ...(json.devDependencies || {})
      };

      return Object.entries(dependencies).map(([name, version]) => ({
        name,
        version: this.cleanVersion(version as string)
      }));
    } catch (e) {
      return [];
    }
  }

  private cleanVersion(version: string): string {
    // Basic version cleaning for security scanning
    return version.replace(/[\^~>=]/g, '').trim();
  }
}
