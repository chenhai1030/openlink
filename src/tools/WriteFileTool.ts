import { promises as fs } from 'fs';
import path from 'path';
import { ITool, ToolInfo, ToolResult } from './Tool';
import { Config } from '../types';
import { safePath } from '../security/sandbox';

export class WriteFileTool implements ITool {
  info(): ToolInfo {
    return {
      name: 'write_file',
      description: 'Writes content to a file',
      args: {
        path: 'The path to the file to write',
        content: 'The content to write into the file',
      },
    };
  }

  validate(args: { [key: string]: any }): void {
    if (typeof args.path !== 'string' || !args.path) {
      throw new Error("Argument 'path' must be a non-empty string.");
    }
    if (typeof args.content !== 'string') {
      throw new Error("Argument 'content' must be a string.");
    }
  }

  async execute(args: { [key:string]: any }, config: Config): Promise<ToolResult> {
    try {
      const targetPath = await safePath(config.rootDir, args.path);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, args.content, 'utf-8');
      return { status: 'success', output: `File written to ${args.path}`, stopStream: true };
    } catch (error: any) {
      return { status: 'error', output: error.message, error: error.message };
    }
  }
}
