---
name: implementation-orchestrator
description: orchestrate engineering implementation work from context collection and implementation planning through human review gates, task decomposition, execution brief generation, QA verification, and final delivery artifacts. use when the user asks to plan or coordinate a software implementation task, convert a Jira/GitHub/MR request into an executable plan, split complex engineering work into low-coupling subtasks, prepare prompts for coding agents, verify implementation completeness, or generate final MR descriptions and Jira comments as end-of-work artifacts.
---

# Implementation Orchestrator

## Overview

Use this skill to turn an engineering implementation request into a controlled, reviewable, and deliverable workflow. Prioritize high-quality context, explicit human review gates, low-coupling task decomposition, execution-ready briefs, and QA verification before producing final MR or Jira artifacts.

This skill is responsible for planning and coordinating engineering implementation workflows. When multiple coding agents or executors are available, produce low-coupling execution briefs that can be delegated independently. When only a single assistant or executor is available, follow the same workflow sequentially and verify each step before moving on.

## Core Principles

* Treat MR descriptions and Jira comments as final byproducts, not as the main workflow.
* Do not start implementation before producing a context pack and an implementation plan.
* Keep human review gates explicit. Non-trivial tasks should pause for user confirmation after context collection, after the initial implementation plan, and after QA verification.
* Prefer fewer, clearer artifacts over many loosely related notes.
* Keep task decomposition low-coupling. Each subtask should have explicit inputs, expected outputs, ownership boundaries, and validation criteria.
* Update the implementation plan whenever new information invalidates earlier assumptions.
* Make uncertainty visible. Track open questions, assumptions, and risks separately.
* For complex work, define QA criteria before execution begins, not only after implementation ends.

## Workflow

### 1. Intake

Collect the task objective and all available source material.

Look for:

* User request or Jira issue summary
* Business or product intent
* Current behavior and expected behavior
* Relevant repositories, branches, files, logs, docs, tickets, existing MRs, or screenshots
* Known constraints, deadlines, compatibility requirements, rollout expectations, and testing expectations
* User preferences regarding models, tools, or execution style

If important context is missing but the workflow can still continue, record the gap as an open question instead of immediately blocking the workflow.

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

Human review gate: for non-trivial work, ask the user to confirm or revise the context pack before finalizing the implementation plan.

### 3. Implementation Plan Draft

Once the context pack is sufficiently clear, produce `implementation-plan.md`.

Default structure:

```markdown
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

## Plan Version Log
- v1: Initial draft
```

Human review gate: ask the user to approve, reject, or revise the implementation plan before generating execution briefs.

### 4. Complexity Routing

Classify task complexity after the implementation plan draft.

Use this rubric:

| Complexity | Indicators                                                                                                                          | Execution Route                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Low        | Single module or narrow scoped change; no schema/API contract changes; limited test surface; low rollback risk                      | Single executor brief with focused QA checklist                                                       |
| Medium     | Crosses 2-3 modules; requires test updates; impacts configuration, shared utilities, or API behavior                                | Split into a small number of sequenced subtasks with dependency notes                                 |
| High       | Cross-service/system changes; schema or migration work; security/performance risk; uncertain requirements; broad regression surface | Decompose into low-coupling workstreams, generate multiple execution briefs, require QA consolidation |

If the classification is uncertain, choose the higher complexity route and explain why.

### 5. Task Breakdown

For medium or high complexity work, produce `task-breakdown.md`.

Default structure:

```markdown
# Task Breakdown

## Complexity Classification
[Low / Medium / High and rationale]

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

Split workstreams by responsibility boundary, dependency boundary, or validation boundary instead of arbitrary file count.

### 6. Execution Briefs

Produce `execution-briefs.md` for executor models, coding agents, or human engineers.

Low complexity work should generate one brief. Medium or high complexity work should generate one brief per workstream.

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

Execution briefs should avoid unrelated context. Keep them executable and tightly scoped.

### 7. QA Verification

Produce `qa-checklist.md` before or alongside execution, then update it after implementation evidence is available.

Low complexity tasks may be verified by the same assistant after implementation. High complexity tasks should include a dedicated QA consolidation step.

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

### 8. Final Verification

After execution and QA evidence are available, produce `final-verification.md`.

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

Human review gate: for tasks with meaningful scope or risk, ask the user to confirm the final verification before producing polished MR/Jira artifacts.

### 9. Final Delivery Artifacts

Only after final verification should the following byproducts be generated.

#### `mr-description.md`

```markdown
# Summary
- [Summary of changes]

# Implementation Notes
- [Important technical decisions]

# Testing
- [Executed tests/checks]

# Risk / Impact
- [Risk level and impacted areas]

# Related Jira
- [Ticket link/key if available]

# Follow-ups
- [Follow-up items if any]
```

#### `jira-comment.md`

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

Jira comments should stay concise and status-oriented. Do not paste the full implementation plan into Jira unless explicitly requested.

## Plan Update Rules

When new information appears:

1. Identify which artifact is affected.
2. Update the plan version log.
3. Explain what changed and why.
4. Preserve earlier decisions only if they are still valid.
5. Regenerate dependent artifacts when necessary.

Use this plan version pattern:

```markdown
## Plan Version Log
- v1: Initial draft based on [context]
- v2: Updated after user confirmation to [change]
- v3: Updated after implementation discovery: [change]
```

## Human Review Gate Prompts

Use direct review prompts such as:

```text
Please confirm whether this context pack is correct, especially the Objective, Desired State, Constraints, and Open Questions. Once confirmed, I will generate the implementation plan.
```

```text
Please confirm whether this implementation plan can be used as the execution baseline. Once approved, I will perform complexity routing and generate execution briefs and a QA checklist.
```

```text
Please confirm the final verification results. Once confirmed, I will generate the MR description and Jira comment.
```

## Quality Bar

Before considering orchestration complete, verify that:

* The context pack explains why the task exists and what success means.
* The implementation plan is specific enough to execute.
* Complexity routing has clear justification.
* Workstreams are low-coupling when decomposition is used.
* Execution briefs are tightly scoped and include validation instructions.
* The QA checklist maps back to acceptance criteria.
* Final MR/Jira artifacts are derived from verified facts, not assumptions.
