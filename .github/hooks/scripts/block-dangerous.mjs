#!/usr/bin/env node

import process from 'node:process';

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

function isDangerousCommand(command) {
  const rules = [
    /\brm\s+(-[^\s]*r[^\s]*f|-.[^\s]*f[^\s]*r)\b/i,
    /\brm\s+-r\s+\/\b/i,
    /\brm\s+(-[^\s]*r[^\s]*f|-.[^\s]*f[^\s]*r)\s+\/\b/i,
    /\bsudo\s+rm\s+(-[^\s]*r[^\s]*f|-.[^\s]*f[^\s]*r)\b/i,
    /\bdd\s+.*\bof=\/dev\//i,
    /\bmkfs(\.\w+)?\b/i,
    /\bshutdown\b/i,
    /\breboot\b/i,
    /\bRemove-Item\b[^\r\n]*\s-(?:Recurse|r)\b[^\r\n]*\s-(?:Force|f)\b/i,
    /\bRemove-Item\b[^\r\n]*\s-(?:Force|f)\b[^\r\n]*\s-(?:Recurse|r)\b/i,
    /\bClear-Disk\b/i,
    /\bFormat-Volume\b/i,
    /\bStop-Computer\b/i,
    /\bRestart-Computer\b/i,
  ];

  return rules.some((rule) => rule.test(command));
}

function getCommand(payload) {
  if (
    payload?.tool_input?.command &&
    typeof payload.tool_input.command === 'string'
  ) {
    return payload.tool_input.command;
  }

  if (
    payload?.toolArgs?.command &&
    typeof payload.toolArgs.command === 'string'
  ) {
    return payload.toolArgs.command;
  }

  return '';
}

async function main() {
  const input = await readStdinJson();
  const command = getCommand(input);

  if (!command) {
    return;
  }

  if (isDangerousCommand(command)) {
    const response = {
      permissionDecision: 'deny',
      permissionDecisionReason: `禁止執行危險指令: ${command}`,
    };

    process.stdout.write(JSON.stringify(response));
  }
}

main().catch((error) => {
  console.error(`[block-dangerous Hook Error] ${error.message}`);
  process.exit(0);
});
