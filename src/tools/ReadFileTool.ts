import { promises as fs } from 'fs';
import { ITool, ToolInfo, ToolResult } from './Tool';
import { Config } from '../types';
import { safePath } from '../security/sandbox';

export class ReadFileTool implements ITool {
  info(): ToolInfo {
    return {
      name: 'read_file',
      description: 'Reads the content of a file',
      args: { path: 'The path to the file to read' },
    };
  }

  validate(args: { [key: string]: any }): void {
    if (typeof args.path !== 'string' || !args.path) {
      throw new Error("Argument 'path' must be a non-empty string.");
    }
  }

  async execute(args: { [key: string]: any }, config: Config): Promise<ToolResult> {
    try {
      const targetPath = await safePath(config.rootDir, args.path);
      const content = await fs.readFile(targetPath, 'utf-8');
      return { status: 'success', output: content };
    } catch (error: any) {
      return { status: 'error', output: error.message, error: error.message };
    }
  }
}
