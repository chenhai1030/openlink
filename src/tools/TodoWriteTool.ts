import { promises as fs } from 'fs';
import path from 'path';
import { ITool, ToolInfo, ToolResult } from './Tool';
import { Config } from '../types';
import { safePath } from '../security/sandbox';

export class TodoWriteTool implements ITool {
  info(): ToolInfo {
    return {
      name: 'TodoWrite',
      description: 'Writes or appends to a TODO.md file',
      args: { content: 'The content to add to the TODO list' },
    };
  }

  validate(args: { [key: string]: any }): void {
    if (typeof args.content !== 'string' || !args.content) {
      throw new Error("Argument 'content' must be a non-empty string.");
    }
  }

  async execute(args: { [key: string]: any }, config: Config): Promise<ToolResult> {
    try {
      const todoPath = await safePath(config.rootDir, 'TODO.md');
      await fs.appendFile(todoPath, `\n- ${args.content}\n`);
      return { status: 'success', output: 'TODO list updated.' };
    } catch (error: any) {
      return { status: 'error', output: error.message, error: error.message };
    }
  }
}
