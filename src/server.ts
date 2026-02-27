import express, { Request, Response } from 'express';
import cors from 'cors';
import { Config } from './types';
import { Executor } from './executor';
import { authMiddleware } from './security/auth';
import os from 'os';

function buildSystemInfo(rootDir: string): string {
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    const now = new Date().toISOString();
    return `- OS: ${platform}/${arch}\n- Working Directory: ${rootDir}\n- Hostname: ${hostname}\n- Current Time: ${now}`;
}

export class Server {
  private app = express();
  private executor: Executor;

  constructor(private config: Config) {
    this.executor = new Executor(config);
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use((req, res, next) => {
        console.log(`[Local App][${new Date().toISOString()}] Received ${req.method} request for ${req.path}`);
        next();
    });
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(authMiddleware(this.config.token));
  }

  private setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', dir: this.config.rootDir, version: '1.0.0' });
    });

    this.app.post('/auth', (req, res) => {
        console.log(`[Local App][${new Date().toISOString()}] Handling /auth. Payload:`, req.body);
        const { token } = req.body;
        const valid = token === this.config.token;
        console.log(`[Local App][${new Date().toISOString()}] /auth validation result: ${valid}`);
        res.json({ valid });
    });

    this.app.get('/config', (req, res) => {
        res.json({ rootDir: this.config.rootDir, timeout: this.config.timeout });
    });

    this.app.get('/tools', (req, res) => {
        res.json({ tools: this.executor.listTools() });
    });

    this.app.post('/exec', async (req, res) => {
        console.log(`[Local App][${new Date().toISOString()}] Handling /exec. Payload:`, req.body);
        // The Go version has a custom unmarshaller for ToolRequest.
        // We handle it here by checking for 'arguments' and renaming to 'args'.
        if (req.body.arguments && !req.body.args) {
            req.body.args = req.body.arguments;
            delete req.body.arguments;
        }
        const response = await this.executor.execute(req.body);
        console.log(`[Local App][${new Date().toISOString()}] Responding to /exec. Payload:`, response);
        res.json(response);
    });

    this.app.get('/prompt', async (req, res) => {
        try {
            let content = this.config.defaultPrompt;
            content = content.replace('{{SYSTEM_INFO}}', buildSystemInfo(this.config.rootDir));
            // Simplified skill listing for the prompt
            content += '\n\n你好，请问有什么可以帮你？';
            res.type('text/plain').send(content);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });
  }

  public start() {
    this.app.listen(this.config.port, '127.0.0.1', () => {
      console.log(`\nAuthentication URL: http://127.0.0.1:${this.config.port}/auth?token=${this.config.token}`);
      console.log('Please enter this URL in your browser extension\n');
      console.log(`Server listening on http://127.0.0.1:${this.config.port}`);
    });
  }
}
