import { promises as fs } from 'fs';
import { ITool, ToolInfo, ToolResult } from './Tool';
import { Config } from '../types';
import { safePath } from '../security/sandbox';

export class ListDirTool implements ITool {
  info(): ToolInfo {
    return {
      name: 'list_dir',
      description: 'Lists the contents of a directory',
      args: { path: 'The path to the directory to list' },
    };
  }

  validate(args: { [key: string]: any }): void {
    if (typeof args.path !== 'string') {
      throw new Error("Argument 'path' must be a string.");
    }
  }

  async execute(args: { [key: string]: any }, config: Config): Promise<ToolResult> {
    try {
      const targetPath = await safePath(config.rootDir, args.path);
      const entries = await fs.readdir(targetPath, { withFileTypes: true });
      const output = entries.map(e => e.isDirectory() ? `${e.name}/` : e.name).join('\n');
      return { status: 'success', output };
    } catch (error: any) {
      return { status: 'error', output: error.message, error: error.message };
    }
  }
}
