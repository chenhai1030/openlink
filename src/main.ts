import { Server } from './server';
import { Config } from './types';
import { loadOrCreateToken } from './security/auth';
import { promises as fs } from 'fs';
import path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name: string, defaultValue: string): string => {
    const arg = args.find(a => a.startsWith(`--${name}=`));
    return arg ? arg.split('=')[1] : defaultValue;
  };

  const dir = getArg('dir', process.cwd());
  const port = parseInt(getArg('port', '39527'), 10);
  const timeout = parseInt(getArg('timeout', '60'), 10);

  let defaultPrompt = 'You are openlink, a helpful assistant.';
  try {
    defaultPrompt = await fs.readFile(path.join(__dirname, '../prompts/init_prompt.txt'), 'utf-8');
  } catch (e) {
    console.warn('Could not load init_prompt.txt, using default prompt.');
  }

  try {
    const token = await loadOrCreateToken();

    const config: Config = {
      rootDir: dir,
      port,
      timeout,
      token,
      defaultPrompt,
    };

    const server = new Server(config);
    server.start();

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
