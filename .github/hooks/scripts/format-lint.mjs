#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function quoteWindowsArg(value) {
  if (typeof value !== 'string') {
    return '';
  }

  if (!/[\s"]/u.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
}

function spawnCommand(command, args, options = {}) {
  if (process.platform === 'win32') {
    const commandLine = [command, ...args].map(quoteWindowsArg).join(' ');

    return spawnSync(
      process.env.ComSpec ?? 'cmd.exe',
      ['/d', '/s', '/c', commandLine],
      {
        shell: false,
        windowsHide: true,
        ...options,
      },
    );
  }

  return spawnSync(command, args, {
    shell: false,
    windowsHide: true,
    ...options,
  });
}

async function readStdinJson() {
  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString().trim();

  if (!raw) {
    return {};
  }

  return JSON.parse(raw);
}

function normalizePath(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  return value.replace(/^['"]|['"]$/g, '');
}

function collectPathsFromPatch(patchText) {
  if (typeof patchText !== 'string' || patchText.trim() === '') {
    return [];
  }

  const matches = patchText.matchAll(/^\*\*\* (?:Add|Update) File: (.+)$/gm);
  const filePaths = [];

  for (const match of matches) {
    const filePath = normalizePath(match[1]);
    if (filePath) {
      filePaths.push(filePath);
    }
  }

  return filePaths;
}

function extractCandidatePaths(toolInput) {
  if (!toolInput || typeof toolInput !== 'object') {
    return [];
  }

  const candidates = [
    toolInput.filePath,
    toolInput.path,
    toolInput.target_file,
    toolInput.file_path,
  ]
    .map(normalizePath)
    .filter(Boolean);

  if (typeof toolInput.input === 'string') {
    candidates.push(...collectPathsFromPatch(toolInput.input));
  }

  return candidates;
}

function toAbsoluteRepoPath(projectRoot, filePath) {
  if (!filePath) {
    return null;
  }

  return path.isAbsolute(filePath)
    ? filePath
    : path.join(projectRoot, filePath);
}

function dedupeExistingFiles(projectRoot, filePaths) {
  const uniquePaths = new Set();

  for (const filePath of filePaths) {
    const absolutePath = toAbsoluteRepoPath(projectRoot, filePath);
    if (!absolutePath || !fs.existsSync(absolutePath)) {
      continue;
    }

    uniquePaths.add(absolutePath);
  }

  return [...uniquePaths];
}

function runCommand(command, args, options) {
  const result = spawnCommand(command, args, options);
  if (result.error) {
    return false;
  }

  return result.status === 0;
}

async function main() {
  const input = await readStdinJson();
  const toolInput = input.tool_input ?? input.toolArgs;
  const projectRoot = process.cwd();
  const filePaths = dedupeExistingFiles(
    projectRoot,
    extractCandidatePaths(toolInput),
  );

  if (filePaths.length === 0) {
    return;
  }

  const hasPackageJson = fs.existsSync(path.join(projectRoot, 'package.json'));
  const pnpmExists = runCommand('pnpm', ['--version'], {
    stdio: 'ignore',
  });

  if (!hasPackageJson || !pnpmExists) {
    return;
  }

  const options = {
    stdio: 'inherit',
  };

  for (const absolutePath of filePaths) {
    const relativePath = path.relative(projectRoot, absolutePath);
    const isFormatTarget =
      /\.(js|jsx|ts|tsx|mjs|cjs|json|css|scss|html|md|mdx|yaml|yml|svelte)$/i.test(
        relativePath,
      );
    const isLintTarget = /\.(js|jsx|ts|tsx|svelte)$/i.test(relativePath);

    if (isFormatTarget) {
      spawnCommand('pnpm', ['prettier', '--write', relativePath], options);
    }

    if (isLintTarget) {
      spawnCommand('pnpm', ['eslint', '--fix', relativePath], options);
    }
  }
}

main().catch((error) => {
  console.error(`[format-lint Hook Error] ${error.message}`);
  process.exit(0);
});
