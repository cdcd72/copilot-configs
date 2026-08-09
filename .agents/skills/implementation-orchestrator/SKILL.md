---
name: implementation-orchestrator
description: Turn engineering work into a reviewed execution baseline with a context pack, implementation plan, complexity routing, optional workstream breakdowns, execution briefs for coding agents or human executors, QA verification, and optional delivery updates. Use when the user wants to turn a bug, feature, refactor, review request, or technical task into an implementation plan, coordinate work across coding agents or human executors, or verify completed implementation against the approved plan.
---

# Implementation Orchestrator

Use this skill to convert engineering context into a controlled implementation workflow. The skill owns planning, routing, QA consolidation, and final verification. It may create execution briefs for coding agents or human executors, but it does not delegate its orchestration responsibilities.

## At a Glance

1. Gather context and produce `context.md`.
2. Stop for confirmation unless the user explicitly asks to skip review gates.
3. Produce `implementation-plan.md`, including complexity routing.
4. Stop for plan approval unless the user explicitly asks to skip review gates.
5. Always produce `execution-briefs.md` after plan approval, using `task-breakdown.md` when decomposition is required.
6. Implement directly or delegate according to the approved routing and execution briefs.
7. Verify completed work with `qa-checklist.md` and `final-verification.md`.
8. Ask whether optional delivery artifacts are needed.

## Operating Rules

- Treat `implementation-plan.md` as the execution baseline.
- Treat the complexity profile and recommended execution strategy as part of `implementation-plan.md`, not as a later-phase artifact.
- Keep human review gates explicit unless the user clearly asks to skip them.
- Prefer the lightest workflow that safely covers implementation risk, coordination risk, and verification risk.
- Always create `execution-briefs.md` after plan approval.
- Create `task-breakdown.md` only when routing calls for decomposition, and use it as the source for workstream-level execution briefs.
- Do not enter active verification until implementation evidence is available.
- Treat `delivery-summary.md` and `status-update.md` as optional byproducts, not mandatory workflow outputs.
- Update the plan when new information invalidates earlier assumptions, and regenerate dependent artifacts when needed.
- Keep uncertainty visible through assumptions, open questions, risks, and plan deviations.

## Review Gates

Human review gates are mandatory workflow boundaries unless the user explicitly asks to skip them or requests an end-to-end draft without pauses.

Acceptable confirmations include:

- approved
- confirmed
- looks good
- continue
- proceed
- go ahead

If confirmation is missing, stop at the current gate.

Use these prompts when pausing:

```text
Please confirm whether this context pack is correct, especially the Objective, Desired State, Constraints, and Open Questions. Once confirmed, I will generate the implementation plan.
```

```text
Please confirm whether this implementation plan can be used as the execution baseline. Once approved, I will generate the execution artifacts required by the approved routing.
```

```text
Please confirm the final verification result. Once confirmed, I will ask whether you want optional delivery artifacts.
```

## Output Language

Generate workflow artifacts in the user's requested language. If no output language is specified, use the language of the user's task description.

Keep artifact filenames such as `context.md`, `implementation-plan.md`, `task-breakdown.md`, `execution-briefs.md`, `qa-checklist.md`, and `final-verification.md` in English unless the user explicitly requests localized filenames.

Prefer keeping technical section headings in English for consistency across coding agents and review artifacts. If the user asks for fully localized documents, localize both headings and content.

## Workflow

### 1. Intake

Collect enough context to define the objective, desired outcome, and success criteria.

Look for:

- user request, issue, ticket, or task summary
- business or product intent
- current behavior and expected behavior
- relevant repositories, branches, files, logs, docs, tickets, review requests, or screenshots
- known constraints, deadlines, compatibility requirements, rollout expectations, and testing expectations
- user preferences about tools, models, or execution style

If the objective and desired outcome are mostly clear, capture non-blocking gaps as open questions with suggested defaults. If the objective, expected outcome, or success criteria remain unclear, ask for clarification before planning.

### 2. Context Pack

The first primary artifact is `context.md`.

Default structure:

```markdown
# Context Pack

## Objective

[What this task is trying to achieve]

## Background

[Relevant product, technical, or ticket background]

## Current State

[Current implementation or behavior; include relevant files/modules/docs when available]

## Desired State

[Expected outcome or behavior]

## Relevant Sources

- [Source/file/doc/ticket]: [Why it matters]

## Constraints

- [Technical/product/process constraints]

## Assumptions

- [Current reasonable assumptions and rationale]

## Open Questions

- [Question, impact if unresolved, suggested default behavior]

## Initial Risks

- [Risk and possible mitigation]
```

Required stop: after producing `context.md`, ask the user to confirm or revise it. Do not produce `implementation-plan.md` until the user explicitly confirms, unless the user explicitly asks to skip review gates.

### 3. Implementation Plan

Once the context pack is sufficiently clear, produce `implementation-plan.md`.

This artifact must include both the plan itself and the complexity routing that determines how execution should proceed.

Default structure:

````markdown
# Implementation Plan

## Goal

[Concise implementation goal]

## Non-goals

[Explicitly out-of-scope areas]

## Proposed Approach

[Primary approach and rationale]

## Alternatives Considered

- [Alternative]: [Reason not selected]

## Impacted Areas

- [Module/service/file/API/data/test/docs]

## Step-by-step Plan

1. [Action]
2. [Action]
3. [Action]

## Data / API / Contract Changes

[If applicable]

## Rollout / Migration Plan

[If applicable]

## Testing Strategy

- Unit:
- Integration:
- E2E/manual:
- Regression:

## QA Criteria

- [Conditions required for completion]

## Risks and Mitigations

- [Risk]: [Mitigation]

## Open Questions

- [Question and suggested default]

## Complexity Profile

```yaml
Complexity Profile:
  implementation_complexity:
    level: Low | Medium | High
    rationale: [Reason]
  coordination_complexity:
    level: Low | Medium | High
    rationale: [Reason]
  verification_complexity:
    level: Low | Medium | High
    rationale: [Reason]
  requirement_volatility:
    level: Low | Medium | High
    rationale: [Reason]
```

## Recommended Execution Strategy

```yaml
Recommended Execution Strategy:
  planning_mode: direct | iterative
  task_decomposition: none | light | aggressive
  execution_mode: direct | delegated
  execution_parallelism: none | limited | parallelizable
  verification_mode: focused | consolidated | rigorous
  human_review_frequency: normal | increased | high
```

## Plan Version Log

- v1: Initial draft
````

Required stop: after producing `implementation-plan.md`, ask the user to approve, reject, or revise it. Do not produce `task-breakdown.md`, `execution-briefs.md`, or `qa-checklist.md` until the user explicitly confirms, unless the user explicitly asks to skip review gates.

### 4. Complexity Routing Guidance

Assess four dimensions and include the result in `implementation-plan.md`.

#### Implementation Complexity

Use Low for narrow, low-risk changes with limited compatibility impact. Use Medium for cross-module logic, shared utilities, or moderate compatibility concerns. Use High for migrations, distributed behavior, concurrency, security-sensitive flows, or performance-critical paths.

#### Coordination Complexity

Use Low when a single executor can complete the work. Use Medium for 2-3 coordinated workstreams with manageable dependencies. Use High for cross-team, cross-service, or shared-contract changes with meaningful integration sequencing risk.

#### Verification Complexity

Use Low when unit tests or simple manual checks can verify the change. Use Medium when integration tests, E2E coverage, or coordinated manual QA are needed. Use High when the regression surface is broad, timing-sensitive, production-sensitive, or difficult to reproduce locally.

#### Requirement Volatility

Use Low when the objective and acceptance criteria are stable. Use Medium when some details remain unresolved but reasonable defaults exist. Use High when the work is exploratory or likely to change based on implementation discovery.

Apply these routing rules:

- If all dimensions are Low, prefer direct planning, no task breakdown, direct or single-threaded execution, and focused QA.
- If `implementation_complexity` is Medium or High, make the implementation steps and acceptance criteria more explicit before execution.
- If `coordination_complexity` is Medium or High, create `task-breakdown.md` and define dependencies, boundaries, and integration sequence before writing workstream-level execution briefs.
- If `coordination_complexity` is Low, skip `task-breakdown.md` and derive a single execution brief directly from `implementation-plan.md`.
- If `verification_complexity` is Medium or High, strengthen QA criteria early and require stronger implementation evidence before final verification.
- If `requirement_volatility` is Medium or High, use iterative planning and more frequent review gates.
- If any dimension is High, explain why the heavier workflow is necessary and what risk it reduces.

### 5. Task Breakdown

Produce `task-breakdown.md` when the approved routing calls for decomposition, especially when coordination complexity is Medium or High.

This artifact is optional, but when it exists it becomes the source document for workstream-level execution briefs.

Default structure:

```markdown
# Task Breakdown

## Complexity Profile Reference

[Short restatement of the approved complexity profile]

## Workstreams

### Workstream 1: [Name]

**Purpose:** [Why this workstream exists]
**Inputs:** [Required context/files/contracts]
**Expected Outputs:** [Concrete deliverables]
**Dependencies:** [None or specific dependencies]
**Boundaries:** [What this workstream must not modify]
**Validation:** [How to verify completion]

### Workstream 2: [Name]

...

## Integration Sequence

1. [Merge/integration order]

## Coordination Risks

- [Risk and mitigation]
```

Split workstreams by responsibility boundary, dependency boundary, or validation boundary rather than by file count alone.

### 6. Execution Briefs

Always produce `execution-briefs.md` after the implementation plan is approved.

If `task-breakdown.md` is not needed, create a single execution brief derived directly from `implementation-plan.md`.

If `task-breakdown.md` exists, create one execution brief per workstream and keep each brief aligned with the approved dependencies, boundaries, and validation steps.

If the approved routing supports `execution_mode: direct`, the brief may be addressed to the active agent and used to guide direct implementation.

If the approved routing supports `execution_mode: delegated`, address the brief or briefs to the coding agents or human executors responsible for each scoped task.

Each brief should contain:

```markdown
# Execution Brief: [Name]

## Role

You are responsible only for the scoped task below. Do not expand scope without explicit approval.

## Context

[Condensed context required for this executor]

## Task

[Specific implementation task]

## Files / Areas to Inspect

- [File/module/path]

## Required Changes

- [Concrete required changes]

## Boundaries

- Do not modify [out-of-scope area]
- Preserve [behavior/API/compatibility]

## Validation

- [Tests/checks to execute]

## Expected Output

- [Code changes, notes, test results, unresolved issues]

## Handoff Notes

[What the executor must report back]
```

Execution briefs should avoid unrelated context, remain tightly scoped, and map cleanly back to either the implementation plan or the task breakdown.

### 7. QA Checklist

This artifact defines the verification requirements and evidence expectations for implementation and final verification. It is not the verification result itself.

Produce `qa-checklist.md` after plan approval, based on the approved QA criteria and routing. Use it to define what evidence is required before final verification.

Acceptable implementation evidence includes code diffs, commits, review links, test results, logs, screenshots, implementation summaries, or coding agent handoff notes.

Default structure:

```markdown
# QA Checklist

## Acceptance Criteria

- [Acceptance criterion]

## Implementation Verification

- [ ] Required files/modules changed as planned
- [ ] No out-of-scope changes introduced
- [ ] Edge cases handled
- [ ] Error states handled
- [ ] Backward compatibility considered

## Test Verification

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated where needed
- [ ] Existing relevant tests pass
- [ ] Manual checks documented where automated tests are unavailable

## Risk Review

- [ ] Security/privacy impact reviewed
- [ ] Performance impact reviewed
- [ ] Migration/rollback path reviewed where applicable

## Evidence

- Commands run:
- Test results:
- Screenshots/logs/links:

## QA Decision

[Pass / Pass with follow-ups / Blocked]

## Remaining Follow-ups

- [Follow-up item]
```

Do not enter active verification until implementation evidence is available.

### 8. Final Verification

After implementation and QA evidence are available, produce `final-verification.md`.

Default structure:

```markdown
# Final Verification

## Summary

[What was completed]

## Plan Deviations

[Differences from the approved plan and why]

## Verification Evidence

- [Test/check/evidence]

## Known Limitations

- [Known limitations, if any]

## Follow-up Tasks

- [Follow-up tasks, optionally with owners]

## Ready for Delivery

[Yes / No, with rationale]
```

Required stop: after producing `final-verification.md`, ask the user to confirm the verification result. Do not generate delivery artifacts until the user explicitly chooses them.

After confirmation, ask whether the user wants:

- `delivery-summary.md`
- `status-update.md`
- both
- none; end the workflow

### 9. Optional Delivery Artifacts

Final delivery artifacts are optional communication byproducts. Generate them only when the user explicitly requests them after final verification, or when the user asked for delivery-ready materials earlier and the verification result is confirmed.

These artifacts are not required for orchestration completion. The workflow may end after `final-verification.md` if no delivery communication is needed.

Generate them only from verified facts in `final-verification.md` and available QA evidence. Do not introduce new assumptions.

#### `delivery-summary.md`

Use this for merge request or pull request descriptions.

```markdown
# Summary

- [Summary of changes]

# Implementation Notes

- [Important technical decisions]

# Testing

- [Executed tests/checks]

# Risk / Impact

- [Risk level and impacted areas]

# Related Issue / Ticket

- [Ticket, issue, or work item link/key if available]

# Follow-ups

- [Follow-up items if any]
```

#### `status-update.md`

Use this for issue tracker or ticket comments.

```markdown
Completed:

- [Completed items]

Verification:

- [Tests/checks performed]

Impact Scope:

- [Affected modules/behaviors]

Risks / Notes:

- [Known risks or none]

Follow-ups:

- [Items requiring follow-up]
```

Keep status updates concise and status-oriented. Do not paste the full implementation plan unless explicitly requested.

## Plan Update Rules

When new information invalidates earlier assumptions or changes the execution path:

1. Identify which artifact is affected.
2. Update that artifact instead of silently continuing with stale assumptions.
3. Add or update the version log when `implementation-plan.md` changes.
4. Explain what changed and why.
5. Regenerate dependent artifacts when necessary.

Use this pattern:

```markdown
## Plan Version Log

- v1: Initial draft based on [context]
- v2: Updated after user confirmation: [change]
- v3: Updated after implementation discovery: [change]
```

## Quality Bar

Before considering orchestration complete, verify that:

- the context pack explains why the task exists and what success means
- the implementation plan is specific enough to execute
- the complexity profile and routing are justified and consistent with the approved plan
- delegated workstreams are low-coupling when decomposition is used
- execution briefs are always produced, are tightly scoped, and include validation instructions
- verification occurs only after implementation evidence is available
- the QA checklist maps back to acceptance criteria
- `final-verification.md` clearly states whether the work is ready for delivery
- optional delivery artifacts are generated only from verified facts, not assumptions
