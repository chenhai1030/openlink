import { promises as fs } from 'fs';
import { glob } from 'glob';
import { ITool, ToolInfo, ToolResult } from './Tool';
import { Config } from '../types';
import { safePath } from '../security/sandbox';

export class GrepTool implements ITool {
  info(): ToolInfo {
    return {
      name: 'grep',
      description: 'Searches for a pattern in files matching a glob',
      args: {
        pattern: 'The regex pattern to search for',
        glob: 'The glob pattern to find files to search in',
      },
    };
  }

  validate(args: { [key: string]: any }): void {
    if (typeof args.pattern !== 'string' || !args.pattern) {
      throw new Error("Argument 'pattern' must be a non-empty string.");
    }
    if (typeof args.glob !== 'string' || !args.glob) {
      throw new Error("Argument 'glob' must be a non-empty string.");
    }
  }

  async execute(args: { [key: string]: any }, config: Config): Promise<ToolResult> {
    try {
      const files = await glob(args.glob, { cwd: config.rootDir, nodir: true });
      const regex = new RegExp(args.pattern);
      let results: string[] = [];

      for (const file of files) {
        const filePath = await safePath(config.rootDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line, i) => {
          if (regex.test(line)) {
            results.push(`${file}:${i + 1}: ${line}`);
          }
        });
      }

      return { status: 'success', output: results.join('\n') };
    } catch (error: any) {
      return { status: 'error', output: error.message, error: error.message };
    }
  }
}
