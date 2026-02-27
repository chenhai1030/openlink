import { exec } from 'child_process';
import { ITool, ToolInfo, ToolResult } from './Tool';
import { Config } from '../types';
import { isDangerousCommand } from '../security/sandbox';

export class ExecCmdTool implements ITool {
  info(): ToolInfo {
    return {
      name: 'exec_cmd',
      description: 'Executes a shell command in the sandboxed directory',
      args: { command: 'The shell command to execute' },
    };
  }

  validate(args: { [key: string]: any }): void {
    if (!args.command || typeof args.command !== 'string') {
      throw new Error("Argument 'command' must be a non-empty string.");
    }
    if (isDangerousCommand(args.command)) {
      throw new Error(`Command "${args.command}" is on the denylist and cannot be executed.`);
    }
  }

  async execute(args: { [key: string]: any }, config: Config): Promise<ToolResult> {
    return new Promise((resolve) => {
      exec(args.command, { cwd: config.rootDir, timeout: config.timeout * 1000 }, (error, stdout, stderr) => {
        if (error) {
          resolve({ status: 'error', output: stderr, error: error.message });
        } else {
          resolve({ status: 'success', output: stdout });
        }
      });
    });
  }
}
