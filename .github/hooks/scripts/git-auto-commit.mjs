#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import process from 'node:process';

const MODE_CONFIG = {
    'before-edit': {
        message: 'backup: before Copilot edit'
    },
    'session-stop': {
        message: 'feat: Copilot Code auto-commit',
        allowEmpty: true
    }
};

const EXCLUDED_PATHS = ['logs/prompt_logs.jsonl'];

function runGit(args, options = {}) {
    const command = process.platform === 'win32' ? 'git.exe' : 'git';

    return spawnSync(command, args, {
        encoding: 'utf8',
        shell: false,
        stdio: 'pipe',
        windowsHide: true,
        ...options
    });
}

function buildTrackedPathspec() {
    return ['--', '.', ...EXCLUDED_PATHS.map((filePath) => `:(exclude)${filePath}`)];
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

function hasRelevantChanges() {
    const result = runGit(['status', '--porcelain', ...buildTrackedPathspec()]);

    if (result.status !== 0) {
        return false;
    }

    return result.stdout.trim().length > 0;
}

function commitRelevantChanges(message) {
    if (!hasRelevantChanges()) {
        return;
    }

    runGit(['add', '-A', ...buildTrackedPathspec()]);
    runGit(['commit', '-m', message]);
}

function createFinalCommit(message, allowEmpty = false) {
    runGit(['add', '-A', ...buildTrackedPathspec()]);

    const commitArgs = ['commit', '-m', message];
    if (allowEmpty) {
        commitArgs.push('--allow-empty');
    }

    runGit(commitArgs);
}

async function main() {
    const mode = process.argv[2] ?? 'before-edit';
    const config = MODE_CONFIG[mode];

    if (!config) {
        process.exit(0);
    }

    if (mode === 'before-edit') {
        await readStdinJson();
    }

    if (mode === 'session-stop') {
        createFinalCommit(config.message, config.allowEmpty);
        process.exit(0);
    }

    commitRelevantChanges(config.message);
    process.exit(0);
}

main().catch(() => {
    process.exit(0);
});
