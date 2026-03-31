import { Dependency, ManifestParser } from './interfaces';

export class PipParser implements ManifestParser {
  parse(content: string): Dependency[] {
    const lines = content.split('\n');
    const dependencies: Dependency[] = [];

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#')) continue;

      // Extract library name and version
      // Handles ==, >=, <=, ~=, > , <
      const match = line.split(/[=<>~ ]+/);
      const name = match[0].trim();
      let version = 'latest';

      if (match.length > 1 && match[1]) {
        version = match[1].trim();
      }

      if (name) {
        dependencies.push({ name, version });
      }
    }

    return dependencies;
  }
}
