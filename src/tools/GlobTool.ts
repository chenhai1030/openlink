import { glob } from 'glob';
import { ITool, ToolInfo, ToolResult } from './Tool';
import { Config } from '../types';

export class GlobTool implements ITool {
  info(): ToolInfo {
    return {
      name: 'glob',
      description: 'Finds files matching a glob pattern',
      args: { pattern: 'The glob pattern to match' },
    };
  }

  validate(args: { [key: string]: any }): void {
    if (typeof args.pattern !== 'string' || !args.pattern) {
      throw new Error("Argument 'pattern' must be a non-empty string.");
    }
  }

  async execute(args: { [key: string]: any }, config: Config): Promise<ToolResult> {
    try {
      const files = await glob(args.pattern, { cwd: config.rootDir, nodir: true });
      return { status: 'success', output: files.join('\n') };
    } catch (error: any) {
      return { status: 'error', output: error.message, error: error.message };
    }
  }
}
