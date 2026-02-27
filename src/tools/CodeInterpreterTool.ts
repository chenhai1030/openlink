import { exec } from 'child_process';
import { ITool, ToolInfo, ToolResult } from './Tool';
import { Config } from '../types';

export class CodeInterpreterTool implements ITool {
  info(): ToolInfo {
    return {
      name: 'CodeInterpreter',
      description: 'Executes a Python code snippet',
      args: { code: 'The Python code to execute' },
    };
  }

  validate(args: { [key: string]: any }): void {
    if (!args.code || typeof args.code !== 'string') {
      throw new Error("Argument 'code' must be a non-empty string.");
    }
  }

  async execute(args: { [key: string]: any }, config: Config): Promise<ToolResult> {
    // For security, it's better to use a dedicated python execution command.
    // Here we use `python -c` for simplicity.
    const command = `python -c "${args.code.replace(/"/g, '\\"')}"`;

    console.log(`[CodeInterpreterTool] Executing command: ${command}`);

    return new Promise((resolve) => {
      exec(command, { cwd: config.rootDir, timeout: config.timeout * 1000 }, (error, stdout, stderr) => {
        if (error) {
          console.error(`[CodeInterpreterTool] Execution failed:`, error);
          resolve({ status: 'error', output: stderr, error: error.message });
        } else {
          console.log(`[CodeInterpreterTool] Execution successful. Output:`, stdout);
          resolve({ status: 'success', output: stdout });
        }
      });
    });
  }
}
