import { promises as fs } from 'fs';
import { ITool, ToolInfo, ToolResult } from './Tool';
import { Config } from '../types';
import { safePath } from '../security/sandbox';

export class EditTool implements ITool {
  info(): ToolInfo {
    return {
      name: 'edit',
      description: 'Replaces a string in a file with a new string',
      args: {
        path: 'The path to the file to edit',
        old_str: 'The string to be replaced',
        new_str: 'The new string to replace with',
      },
    };
  }

  validate(args: { [key: string]: any }): void {
    if (typeof args.path !== 'string' || !args.path) {
      throw new Error("Argument 'path' must be a non-empty string.");
    }
    if (typeof args.old_str !== 'string') {
      throw new Error("Argument 'old_str' must be a string.");
    }
    if (typeof args.new_str !== 'string') {
      throw new Error("Argument 'new_str' must be a string.");
    }
  }

  async execute(args: { [key: string]: any }, config: Config): Promise<ToolResult> {
    try {
      const targetPath = await safePath(config.rootDir, args.path);
      const content = await fs.readFile(targetPath, 'utf-8');
      const newContent = content.replace(args.old_str, args.new_str);

      if (content === newContent) {
        return { status: 'error', output: 'Old string not found in file.', error: 'Old string not found' };
      }

      await fs.writeFile(targetPath, newContent, 'utf-8');
      return { status: 'success', output: `File ${args.path} has been edited.` };
    } catch (error: any) {
      return { status: 'error', output: error.message, error: error.message };
    }
  }
}
