import { ITool, ToolInfo, ToolResult } from './Tool';
import { Config } from '../types';

export class WebFetchTool implements ITool {
  info(): ToolInfo {
    return {
      name: 'WebFetch',
      description: 'Fetches the content of a URL',
      args: { url: 'The URL to fetch' },
    };
  }

  validate(args: { [key: string]: any }): void {
    if (typeof args.url !== 'string' || !args.url) {
      throw new Error("Argument 'url' must be a non-empty string.");
    }
    try {
      new URL(args.url);
    } catch (e) {
      throw new Error("Argument 'url' must be a valid URL.");
    }
  }

  async execute(args: { [key: string]: any }, config: Config): Promise<ToolResult> {
    try {
      const response = await fetch(args.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }
      const text = await response.text();
      return { status: 'success', output: text };
    } catch (error: any) {
      return { status: 'error', output: error.message, error: error.message };
    }
  }
}
