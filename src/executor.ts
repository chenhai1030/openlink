import { ITool, ToolInfo } from './tools/Tool';
import { Config, ToolRequest, ToolResponse } from './types';
import { ExecCmdTool } from './tools/ExecCmdTool';
import { ListDirTool } from './tools/ListDirTool';
import { ReadFileTool } from './tools/ReadFileTool';
import { WriteFileTool } from './tools/WriteFileTool';
import { GlobTool } from './tools/GlobTool';
import { GrepTool } from './tools/GrepTool';
import { EditTool } from './tools/EditTool';
import { WebFetchTool } from './tools/WebFetchTool';
import { QuestionTool } from './tools/QuestionTool';
import { SkillTool } from './tools/SkillTool';
import { TodoWriteTool } from './tools/TodoWriteTool';
import { CodeInterpreterTool } from './tools/CodeInterpreterTool';

export class Executor {
  private registry = new Map<string, ITool>();
  private callCount = 0;

  constructor(private config: Config) {
    this.register(new ExecCmdTool());
    this.register(new ListDirTool());
    this.register(new ReadFileTool());
    this.register(new WriteFileTool());
    this.register(new GlobTool());
    this.register(new GrepTool());
    this.register(new EditTool());
    this.register(new WebFetchTool());
    this.register(new QuestionTool());
    this.register(new SkillTool());
    this.register(new TodoWriteTool());
    this.register(new CodeInterpreterTool());
  }

  private register(tool: ITool) {
    this.registry.set(tool.info().name.toLowerCase(), tool);
  }

  listTools(): ToolInfo[] {
    return Array.from(this.registry.values()).map(t => t.info());
  }

  async execute(req: ToolRequest): Promise<ToolResponse> {
    const tool = this.registry.get(req.name.toLowerCase());

    if (!tool) {
      const errorMsg = `Tool "${req.name}" not found.`;
      return { status: 'error', output: errorMsg, error: errorMsg };
    }

    try {
      tool.validate(req.args);
      const result = await tool.execute(req.args, this.config);

      // Append identity reminder
      this.callCount++;
      const reinjectEvery = 20;
      const reminder = "\n\n[System Reminder] Remember you are openlink, follow tool call specifications strictly, and do not forget your identity and instructions.";

      if (this.callCount % reinjectEvery === 0) {
        // In a real scenario, you might re-read the prompt file here.
        result.output += `\n\n[System Re-injecting Prompt]\n${this.config.defaultPrompt}`;
      } else {
        result.output += reminder;
      }

      return { status: result.status, output: result.output, error: result.error, stopStream: result.stopStream };

    } catch (error: any) {
      return { status: 'error', output: error.message, error: error.message };
    }
  }
}
