import path from 'path';
import { promises as fs } from 'fs';

/**
 * Joins rootDir and targetPath and validates the result stays within rootDir.
 * The targetPath must be relative.
 * This function is the equivalent of Go's `security.SafePath`.
 */
export async function safePath(rootDir: string, targetPath: string): Promise<string> {
    // First, resolve the root directory to an absolute path.
    const absRoot = path.resolve(rootDir);

    // Join the root directory with the target path.
    const joinedPath = path.join(absRoot, targetPath);

    // Resolve the joined path to get the absolute path, which also handles `..` etc.
    const absTarget = path.resolve(joinedPath);

    // Check if the resolved target path is still within the root directory.
    if (!absTarget.startsWith(absRoot + path.sep) && absTarget !== absRoot) {
        throw new Error('Path is outside the sandboxed directory');
    }

    return absTarget;
}


export const DANGEROUS_COMMANDS = [
    'rm -rf', 'rm -fr', 'mkfs', 'dd', 'format',
    '> /dev/', 'curl', 'wget', 'nc', 'netcat',
    'sudo', 'chmod 777', 'kill -9', 'reboot', 'shutdown',
];

/**
 * Checks if a command string contains any of the dangerous command patterns.
 * This is a basic security measure.
 */
export function isDangerousCommand(cmd: string): boolean {
    const lowerCmd = cmd.toLowerCase();
    for (const dangerous of DANGEROUS_COMMANDS) {
        if (lowerCmd.includes(dangerous)) {
            return true;
        }
    }
    return false;
}
