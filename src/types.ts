export interface ToolRequest {
  name: string;
  args: { [key: string]: any };
  callId: string;
  reason?: string;
}

export interface ToolResponse {
  status: 'success' | 'error';
  output: string;
  error?: string;
  stopStream?: boolean;
}

export interface Config {
  rootDir: string;
  port: number;
  timeout: number;
  token: string;
  defaultPrompt: string;
}

export interface Settings {
  token: string;
  createdAt: string;
}
