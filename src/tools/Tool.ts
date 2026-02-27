import { Config } from '../types';

export interface ToolInfo {
  name: string;
  description: string;
  args: { [key: string]: string };
}

export interface ToolResult {
  status: 'success' | 'error';
  output: string;
  error?: string;
  stopStream?: boolean;
}

export interface ITool {
  info(): ToolInfo;
  validate(args: { [key: string]: any }): void;
  execute(args: { [key: string]: any }, config: Config): Promise<ToolResult>;
}
