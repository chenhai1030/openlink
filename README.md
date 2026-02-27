# OpenLink (TypeScript-Version)

This project is a TypeScript re-implementation of the Go-based `openlink` server.

## Description

The server provides a set of tools that can be executed via an HTTP API. It is designed to work within a sandboxed directory to ensure safety. Authentication is handled via a bearer token.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

## Running the Server

### Production Mode

```bash
npm start
```

### Development Mode (with hot-reloading)

```bash
npm run dev
```

The server supports the following command-line arguments:

- `--dir=<path>`: The working directory (sandbox). Defaults to the current directory.
- `--port=<port>`: The port to listen on. Defaults to `39527`.
- `--timeout=<seconds>`: The timeout for command execution. Defaults to `60`.

Example:
```bash
npm start -- --dir=/path/to/your/workspace --port=8080
```

## Authentication

On the first run, a `settings.json` file will be created in the `.config` directory of the project. This file contains the authentication token.

The server will print an authentication URL to the console. Use this URL or the token to configure your client.

All API requests (except for `/health` and `/auth`) must include the `Authorization` header:

`Authorization: Bearer <your-token>`

## Available Tools

The following tools are available via the `/exec` endpoint:

- `ExecCmd`: Executes a shell command.
- `ListDir`: Lists directory contents.
- `ReadFile`: Reads a file.
- `WriteFile`: Writes to a file.
- `Glob`: Finds files using a glob pattern.
- `Grep`: Searches for a pattern in files.
- `Edit`: Replaces a string in a file.
- `WebFetch`: Fetches content from a URL.
- `Question`: Asks a question (for interactive scenarios).
- `Skill`: Lists available skills.
- `TodoWrite`: Appends a task to `TODO.md`.
