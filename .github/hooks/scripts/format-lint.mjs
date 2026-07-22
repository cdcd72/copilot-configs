#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function quoteWindowsArg(value) {
  if (typeof value !== "string") {
    return "";
  }

  if (!/[\s"]/u.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
}

function spawnCommand(command, args, options = {}) {
  if (process.platform === "win32") {
    const commandLine = [command, ...args].map(quoteWindowsArg).join(" ");

    return spawnSync(commandLine, [], {
      shell: true,
      windowsHide: true,
      ...options,
    });
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

function parseMaybeJson(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    if (!value.trim()) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
}

function normalizePath(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return value.replace(/^['"]|['"]$/g, "");
}

function collectPathsFromPatch(patchText) {
  if (typeof patchText !== "string" || patchText.trim() === "") {
    return [];
  }

  const filePaths = new Set();

  const customPatchMatches = patchText.matchAll(
    /^\*\*\* (?:Add|Update) File: (.+)$/gm,
  );

  for (const match of customPatchMatches) {
    const filePath = normalizePath(match[1]);
    if (filePath) {
      filePaths.add(filePath);
    }
  }

  const unifiedDiffMatches = patchText.matchAll(
    /^(?:\+\+\+|---)\s+(?:a\/|b\/)?(.+)$/gm,
  );

  for (const match of unifiedDiffMatches) {
    const filePath = normalizePath(match[1]);

    if (filePath && filePath !== "/dev/null") {
      filePaths.add(filePath);
    }
  }

  return [...filePaths];
}

function extractCandidatePaths(toolInput) {
  if (!toolInput) {
    return [];
  }

  if (typeof toolInput === "string") {
    return collectPathsFromPatch(toolInput);
  }

  if (typeof toolInput !== "object") {
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

  const patchSources = [
    toolInput.input,
    toolInput.patch,
    toolInput.patchText,
    toolInput.patch_text,
  ];

  for (const patchSource of patchSources) {
    if (typeof patchSource === "string") {
      candidates.push(...collectPathsFromPatch(patchSource));
    }
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

function getToolInput(input) {
  if (!input) return null;
  return (
    parseMaybeJson(input.toolArgs) ??
    parseMaybeJson(input.tool_input) ??
    parseMaybeJson(input.toolInput) ??
    input
  );
}

function formatLintErrors(fileReport) {
  return fileReport.messages
    .filter((message) => message.severity === 2)
    .slice(0, 10)
    .map(
      (message) =>
        `  L${message.line}:${message.column} [${message.ruleId ?? "unknown-rule"}] ${message.message}`,
    )
    .join("\n");
}

async function main() {
  const input = await readStdinJson();
  const toolInput = getToolInput(input);
  const projectRoot = process.cwd();
  const filePaths = dedupeExistingFiles(
    projectRoot,
    extractCandidatePaths(toolInput),
  );

  if (filePaths.length === 0) {
    return;
  }

  const hasPackageJson = fs.existsSync(path.join(projectRoot, "package.json"));
  const pnpmExists = runCommand("pnpm", ["--version"], {
    stdio: "ignore",
  });

  if (!hasPackageJson || !pnpmExists) {
    console.error("[format-lint] package.json or pnpm not found");
    return;
  }

  const prettierOptions = {
    stdio: "ignore",
  };
  const eslintOptions = {
    stdio: "pipe",
  };

  for (const absolutePath of filePaths) {
    const relativePath = path.relative(projectRoot, absolutePath);
    const isFormatTarget =
      /\.(js|jsx|ts|tsx|mjs|cjs|json|css|scss|html|md|mdx|yaml|yml|svelte)$/i.test(
        relativePath,
      );
    const isLintTarget = /\.(js|jsx|ts|tsx|svelte)$/i.test(relativePath);

    if (isFormatTarget) {
      spawnCommand(
        "pnpm",
        ["prettier", "--write", relativePath],
        prettierOptions,
      );
    }

    if (isLintTarget) {
      const eslintResult = spawnCommand(
        "pnpm",
        ["eslint", "--fix", "--format", "json", relativePath],
        eslintOptions,
      );

      let lintReports = [];
      try {
        const stdout = eslintResult.stdout;
        const jsonString =
          typeof stdout === "string"
            ? stdout
            : stdout
              ? stdout.toString()
              : "[]";
        lintReports = JSON.parse(jsonString);
      } catch (err) {
        if (eslintResult.stderr) {
          console.error(
            `[format-lint] eslint 執行異常：${eslintResult.stderr.slice(0, 500)}`,
          );
        }

        continue;
      }

      const normalizedAbsolutePath = path.normalize(absolutePath);
      const fileReport =
        lintReports.find(
          (report) =>
            path.normalize(report.filePath) === normalizedAbsolutePath,
        ) ?? lintReports[0];

      if (fileReport && fileReport.errorCount > 0) {
        const summary = formatLintErrors(fileReport);

        process.stdout.write(
          JSON.stringify({
            additionalContext: `格式化後仍有 ESLint 無法自動修復的錯誤：\n${summary}\n請修正這些錯誤。`,
          }),
        );
        process.exit(0);
      }
    }
  }
}

main().catch((error) => {
  console.error(`[format-lint Hook Error] ${error.message}`);
  process.exit(1);
});
