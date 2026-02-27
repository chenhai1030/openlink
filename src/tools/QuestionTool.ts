import { ITool, ToolInfo, ToolResult } from './Tool';
import { Config } from '../types';

export class QuestionTool implements ITool {
  info(): ToolInfo {
    return {
      name: 'question',
      description: 'Asks a question to the user and expects a response',
      args: { question: 'The question to ask' },
    };
  }

  validate(args: { [key: string]: any }): void {
    if (typeof args.question !== 'string' || !args.question) {
      throw new Error("Argument 'question' must be a non-empty string.");
    }
  }

  async execute(args: { [key: string]: any }, config: Config): Promise<ToolResult> {
    // In this implementation, we just return the question as output.
    // A more complex system might pause and wait for user input.
    return Promise.resolve({
      status: 'success',
      output: `QUESTION: ${args.question}`,
      stopStream: true, // Indicates that the system should wait for a response.
    });
  }
}
