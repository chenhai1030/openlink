import { promises as fs } from 'fs';
import path from 'path';
import { ITool, ToolInfo, ToolResult } from './Tool';
import { Config } from '../types';
import { safePath } from '../security/sandbox';

export class SkillTool implements ITool {
  info(): ToolInfo {
    return {
      name: 'Skill',
      description: 'Lists or executes a skill',
      args: { name: 'The name of the skill to execute (optional)' },
    };
  }

  validate(args: { [key: string]: any }): void {
    // For now, no validation is needed as we only list skills.
  }

  async execute(args: { [key: string]: any }, config: Config): Promise<ToolResult> {
    const skillsDir = path.join(config.rootDir, 'skills');
    try {
      const entries = await fs.readdir(skillsDir, { withFileTypes: true });
      const skills = entries.filter(e => e.isFile()).map(e => e.name);
      if (skills.length === 0) {
        return { status: 'success', output: 'No skills found.' };
      }
      return { status: 'success', output: `Available skills:\n- ${skills.join('\n- ')}` };
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return { status: 'success', output: 'No skills directory found.' };
        }
        return { status: 'error', output: error.message, error: error.message };
    }
  }
}
