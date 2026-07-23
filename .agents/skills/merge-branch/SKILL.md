---
name: merge-branch
description: "Merge one local Git branch into another through a guarded workflow: inspect repository state, fetch remote references, analyze divergence, perform the local merge, resolve conflicts according to both branches' intent, run project validation, and report the result. Use when the user asks to merge source branch X into target branch Y, integrate one branch into another, or resolve conflicts caused by that local branch merge. Operate only with local Git commands. Never handle pull requests or merge requests. Never push unless the user gives a separate explicit instruction after reviewing the local result."
---

# Merge Branch

Merge a source branch into a target branch using this workflow:

`Inspect -> Fetch -> Analyze divergence -> Merge -> Resolve conflicts by intent -> Validate -> Report -> Optional push`

## Required input

Identify both values before modifying the repository:

- `source_branch`: branch whose changes will be incorporated
- `target_branch`: branch that will receive the changes

Interpret "merge X into Y" as:

```text
source_branch = X
target_branch = Y
```

Do not infer a missing branch when multiple reasonable candidates exist. Ask for the missing branch name.

## Safety boundaries

- Use only local `git` commands and commands already available in the repository.
- Do not create, inspect, update, or merge a PR or MR.
- Treat the user's merge request as permission to perform the local merge only.
- Do not push unless the user gives a separate explicit push instruction after the local merge result is reported.
- Never force push.
- Never delete local or remote branches.
- Never discard unrelated working-tree changes.
- Never use `git reset --hard`, `git clean -fd`, `git checkout -- .`, or equivalent destructive commands.
- Never bypass hooks with `--no-verify` unless the user explicitly requests it and understands the consequence.
- Do not resolve semantic ambiguity by choosing `ours` or `theirs` wholesale.
- Stop and ask the user when both valid intentions cannot be preserved confidently.

## 1. Inspect

Run read-only checks first:

```bash
git rev-parse --show-toplevel
git status --short --branch
git branch --show-current
git branch --list --all
git remote -v
git log -1 --oneline --decorate
```

Confirm:

1. The current directory belongs to a Git repository.
2. The source and target branches exist locally or have an unambiguous remote-tracking counterpart.
3. No merge, rebase, cherry-pick, or revert is already in progress.
4. The working tree has no unrelated uncommitted changes that could be overwritten or mixed into the merge.

If the working tree is dirty:

- Continue only when the changes are clearly unrelated and Git can safely switch branches without modifying them.
- Prefer stopping and reporting the affected paths.
- Do not auto-commit or stash changes unless the user explicitly authorizes that action.

If a previous Git operation is in progress, stop and report it instead of starting another operation.

## 2. Fetch

Refresh remote references without changing working files:

```bash
git fetch --all --prune
```

If no remotes exist, continue using local branches and state that fetch was skipped.

A fetch failure is not automatically permission to merge stale references. Report the failure and continue only when both requested branches are local and the user did not require current remote state.

Do not pull. Fetch and merge are intentionally separate.

## 3. Analyze divergence

Resolve each requested branch to a commit and inspect the relationship before checkout or merge:

```bash
git rev-parse --verify <source_branch>^{commit}
git rev-parse --verify <target_branch>^{commit}
git merge-base <target_branch> <source_branch>
git rev-list --left-right --count <target_branch>...<source_branch>
git log --oneline --left-right --cherry-pick <target_branch>...<source_branch>
git diff --stat <target_branch>...<source_branch>
git diff --name-status <target_branch>...<source_branch>
```

Classify the relationship:

- **Already merged**: target contains source. Make no merge commit; proceed to validation or report no-op.
- **Fast-forward possible**: target is an ancestor of source.
- **Diverged**: both branches have unique commits.
- **Unrelated histories**: no merge base exists. Stop unless the user explicitly authorizes merging unrelated histories.

Review changed files and recent commits to anticipate conflicts, generated files, migrations, lockfiles, and validation scope.

## 4. Merge

Switch to the target branch:

```bash
git switch <target_branch>
```

Verify status again. Then merge the source branch:

```bash
git merge --no-edit <source_branch>
```

Use normal Git behavior:

- Allow fast-forward when Git determines it is valid.
- Create a merge commit when branches have diverged.
- Do not force `--no-ff` or squash unless the user explicitly requests that strategy.
- Do not pull or merge another remote branch implicitly.

If checkout or merge fails before conflicts are created, stop and report the exact reason.

## 5. Resolve conflicts by intent

When conflicts occur, list and inspect every conflicted path:

```bash
git status --short
git diff --name-only --diff-filter=U
git diff --cc -- <path>
git log --oneline -n 10 <target_branch> -- <path>
git log --oneline -n 10 <source_branch> -- <path>
git show <relevant_commit> -- <path>
```

For each file:

1. Determine what the target branch changed and why.
2. Determine what the source branch changed and why.
3. Preserve both intentions whenever they are compatible.
4. Adapt surrounding code so the integrated result is coherent, compilable, and consistent with current project conventions.
5. Remove every conflict marker.
6. Stage only resolved merge paths with `git add <path>`.
7. Recheck unresolved paths before continuing.

### Conflict-specific rules

- **Imports and declarations**: preserve declarations required by retained usages; remove imports made obsolete by the final integrated code.
- **Renames and moves**: follow the current target structure while incorporating source behavior, unless commit history clearly indicates a different intended destination.
- **Configuration**: preserve compatible settings from both sides; do not silently weaken security, validation, or environment constraints.
- **Generated files**: prefer regenerating them with the repository's documented command instead of manually combining generated output.
- **Dependency lockfiles**: resolve the manifest first, then regenerate the lockfile using the repository's existing package manager and locked tool version when available.
- **Database migrations**: do not reorder, rename, or combine migrations without understanding framework ordering and deployment consequences. Ask when two migrations compete for the same schema transition.
- **Tests**: retain meaningful tests from both sides and update them only when integrated behavior intentionally changes.
- **Formatting-only conflicts**: reconstruct the intended source, then run the repository formatter; do not select a whole side merely because formatting differs.

Stop for user decision when:

- Requirements represented by the two branches are mutually exclusive.
- Choosing one behavior would remove a valid feature or security control.
- Public API, persisted data, migration order, or protocol compatibility is uncertain.
- A binary file conflict has no clear authoritative version.
- The repository history does not provide enough evidence for a safe semantic decision.

When stopping, keep the merge in progress, identify the files and exact decision required, and do not abort unless the user asks.

After all conflicts are resolved:

```bash
git diff --check
git diff --cached --check
git status --short
```

Complete the merge commit using Git's prepared merge message:

```bash
git commit --no-edit
```

Do not amend unrelated commits.

## 6. Validate

Discover validation commands from repository-owned sources such as:

- `AGENTS.md`, `CONTRIBUTING.md`, or `README.md`
- package scripts and task runners
- CI workflow files
- solution, workspace, or project configuration
- Git hooks already configured by the repository

Run the broadest practical validation appropriate to the changed files. Prefer this order when commands exist:

1. Formatting or formatting check
2. Lint or static analysis
3. Type checking or compilation
4. Relevant tests
5. Full test suite
6. Build

Do not invent commands. Use the package manager and tooling already selected by the repository.

Run lint, tests, and build when the repository defines them and they are reasonably executable in the current environment. If a full command is unavailable, too expensive, credential-dependent, or platform-incompatible, run the strongest available subset and report the limitation.

If validation modifies files:

1. Inspect the modifications.
2. Include only changes caused by required formatting or generated artifacts relevant to the merge.
3. Re-run the affected validation.
4. Commit them only when they are necessary to complete the merge result; report the extra commit or amended merge clearly. Prefer including conflict-resolution formatting before the merge commit whenever possible.

Never hide failing validation. Distinguish:

- Failure introduced by the merge
- Pre-existing failure reproducible on the target branch
- Environmental or dependency failure
- Validation not run

Do not push a result with unresolved or unexplained failures.

## 7. Report

Always finish with a structured report:

```markdown
## Merge result

- Source: `<source_branch>` (`<source_sha>`)
- Target: `<target_branch>` (`<target_sha_before>` -> `<target_sha_after>`)
- Result: fast-forward | merge commit | already merged | stopped | failed
- Merge commit: `<sha>` or `none`
- Push: not performed

## Conflicts

- None

or, for each conflict:

- `<path>`: what each branch intended and how the final resolution preserves or chooses that intent

## Validation

- `<command>`: passed | failed | not run

## Remaining concerns

- None

or list unresolved decisions, failures, skipped checks, dirty files, or environment limitations.
```

Include `git status --short --branch` and the final local branch state in the report. State explicitly that no push occurred.

## 8. Optional push

Do not enter this stage as part of the original merge request.

Only after reporting the local merge, accept a new explicit instruction to push. Before pushing:

1. Confirm the current branch is the target branch.
2. Confirm no unresolved conflicts remain.
3. Confirm required validation passed or disclose failures and obtain explicit instruction to proceed despite them.
4. Show which remote and ref will be updated.
5. Use a normal push only:

```bash
git push <remote> <target_branch>
```

Never use `--force`, `--force-with-lease`, branch deletion, or remote cleanup.
