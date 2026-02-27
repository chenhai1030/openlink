import { Request, Response, NextFunction } from 'express';
import path from 'path';
import os from 'os';
import { promises as fs } from 'fs';
import crypto from 'crypto';
import { Settings } from '../types';

const settingsDir = path.join(process.cwd(), '.config');
const settingsPath = path.join(settingsDir, 'settings.json');

export async function loadOrCreateToken(): Promise<string> {
  try {
    await fs.mkdir(settingsDir, { recursive: true });
    const data = await fs.readFile(settingsPath, 'utf-8');
    const settings: Settings = JSON.parse(data);
    if (settings.token) {
      return settings.token;
    }
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error('Error reading settings file:', error);
    }
  }

  const token = crypto.randomBytes(32).toString('hex');
  const settings: Settings = {
    token,
    createdAt: new Date().toISOString(),
  };

  try {
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), { mode: 0o600 });
    return token;
  } catch (error) {
    throw new Error(`Failed to write token file: ${error}`);
  }
}

export function authMiddleware(token: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/health' || req.path === '/auth') {
      return next();
    }

    const authHeader = req.headers.authorization;
    const expected = `Bearer ${token}`;

    if (!authHeader) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    // Simple string comparison is not secure against timing attacks.
    // For a production system, a constant-time comparison is recommended.
    // Node.js crypto.timingSafeEqual is the equivalent of Go's subtle.ConstantTimeCompare.
    try {
        const untrusted = Buffer.from(authHeader);
        const trusted = Buffer.from(expected);
        if (crypto.timingSafeEqual(untrusted, trusted)) {
            return next();
        } else {
            return res.status(401).json({ error: 'unauthorized' });
        }
    } catch {
        return res.status(401).json({ error: 'unauthorized' });
    }
  };
}
