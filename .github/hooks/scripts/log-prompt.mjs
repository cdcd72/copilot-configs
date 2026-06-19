#!/usr/bin/env node

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const LOG_LEVELS = {
  OFF: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
};

async function readStdinJson() {
  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString().trim();

  if (!raw) {
    return { raw: '', payload: null, parseError: false };
  }

  try {
    return { raw, payload: JSON.parse(raw), parseError: false };
  } catch {
    return { raw, payload: null, parseError: true };
  }
}

function normalizeLogLevel(value) {
  if (typeof value !== 'string') {
    return 'INFO';
  }

  const normalized = value.trim().toUpperCase();
  return LOG_LEVELS[normalized] === undefined ? 'INFO' : normalized;
}

function shouldWriteLog(configuredLevel, entryLevel) {
  return LOG_LEVELS[configuredLevel] >= LOG_LEVELS[entryLevel];
}

function getFirstValue(input, keys) {
  if (!input || typeof input !== 'object') {
    return null;
  }

  for (const key of keys) {
    const value = input[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value);
    }
  }

  return null;
}

function getPromptText(payload) {
  const directPrompt = getFirstValue(payload, [
    'prompt',
    'userPrompt',
    'message',
    'text',
  ]);
  if (directPrompt) {
    return directPrompt;
  }

  if (payload?.message && typeof payload.message === 'object') {
    const nestedPrompt = getFirstValue(payload.message, ['text', 'content']);
    if (nestedPrompt) {
      return nestedPrompt;
    }
  }

  if (typeof process.env.COPILOT_USER_PROMPT === 'string') {
    return process.env.COPILOT_USER_PROMPT;
  }

  return '';
}

function getStringHash(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function ensureDirectory(logDir) {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

function appendJsonLine(filePath, record) {
  fs.appendFileSync(filePath, `${JSON.stringify(record)}\n`, 'utf8');
}

async function main() {
  const configuredLogLevel = normalizeLogLevel(process.env.LOG_LEVEL);
  const includePromptContent =
    process.env.LOG_INCLUDE_PROMPT_CONTENT === 'true';
  const includeRawPayload = process.env.LOG_INCLUDE_RAW_PAYLOAD === 'true';

  const scriptDir = path.dirname(process.argv[1]);
  const defaultLogDir = path.resolve(scriptDir, '..', 'logs');
  const logDir =
    process.env.LOG_DIR || process.env.COPILOT_HOOK_LOG_DIR || defaultLogDir;
  const logFile = path.join(logDir, 'prompt_logs.jsonl');

  try {
    const { raw, payload, parseError } = await readStdinJson();
    const eventName =
      getFirstValue(payload, [
        'eventName',
        'event',
        'type',
        'hook_event_name',
      ]) || 'userPromptSubmitted';
    const workspacePath =
      getFirstValue(payload, ['workspacePath', 'workspace', 'cwd']) ||
      process.env.GITHUB_WORKSPACE ||
      process.cwd();
    const promptText = getPromptText(payload);
    const sessionId = getFirstValue(payload, [
      'sessionId',
      'session_id',
      'conversationId',
      'chatId',
    ]);
    const requestId = getFirstValue(payload, ['requestId', 'request_id', 'id']);
    const promptLength = promptText.length;
    const promptHash = promptLength > 0 ? getStringHash(promptText) : null;
    const promptPreview =
      promptLength > 200 ? promptText.slice(0, 200) : promptText;
    const entryLevel = parseError ? 'WARN' : 'INFO';

    if (!shouldWriteLog(configuredLogLevel, entryLevel)) {
      return;
    }

    ensureDirectory(logDir);

    const record = {
      timestampUtc: new Date().toISOString(),
      level: entryLevel,
      event: eventName,
      user: process.env.USERNAME || process.env.USER || null,
      machine: process.env.COMPUTERNAME || null,
      processId: process.pid,
      workspace: workspacePath,
      script: process.argv[1],
      sessionId,
      requestId,
      promptLength,
      promptHash,
      promptPreview,
    };

    if (includePromptContent) {
      record.prompt = promptText;
    }

    if (includeRawPayload) {
      record.rawPayload = raw;
    }

    if (configuredLogLevel === 'DEBUG') {
      record.debug = {
        stdinLength: raw.length,
        includePromptContent,
        includeRawPayload,
        hasPayload: payload !== null,
      };
    }

    appendJsonLine(logFile, record);
  } catch (error) {
    if (!shouldWriteLog(configuredLogLevel, 'ERROR')) {
      return;
    }

    try {
      ensureDirectory(logDir);
      appendJsonLine(logFile, {
        timestampUtc: new Date().toISOString(),
        level: 'ERROR',
        event: 'logFailure',
        error: error instanceof Error ? error.message : String(error),
        script: process.argv[1],
        processId: process.pid,
      });
    } catch {
      // Ignore fallback logging failures.
    }
  }
}

main().catch(() => {
  process.exit(0);
});
