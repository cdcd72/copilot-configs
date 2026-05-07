---
name: implementation-orchestrator
description: Orchestrate engineering implementation planning from user-provided context into reviewable plans, complexity assessment, task breakdowns, execution briefs for coding agents, QA verification, and final delivery artifacts. use when the user wants to turn a software task, tracked issue, review request, bug report, feature request, refactor, or technical change into an implementation plan; split implementation work into delegated coding-agent tasks; or validate completed implementation work before delivery.
---

# Implementation Orchestrator

## Overview

Use this skill to turn user-provided engineering context into a controlled, reviewable implementation plan. Prioritize understanding the available context, defining a feasible plan, decomposing the work into low-coupling implementation tasks, and preparing execution-ready briefs for coding agents or human executors.

This skill owns the planning and coordination flow. It may produce execution briefs for delegated implementation work, but delegation applies to implementation workstreams, not to the skill's orchestration responsibilities. After the delegated implementation tasks are reported as complete, use this skill to consolidate the results, verify them against the approved plan and QA criteria, and then produce final delivery artifacts when needed.

## Core Principles

- Treat the implementation plan as the primary output of the planning phase.
- Treat delivery summaries and status-update comments as final byproducts, not as the main workflow.
- Do not generate execution briefs before producing a context pack and an implementation plan.
- Keep human review gates explicit. Non-trivial tasks should pause for user confirmation after context collection, after the initial implementation plan, and after QA verification.
- Prefer fewer, clearer artifacts over many loosely related notes.
- Keep delegated implementation tasks low-coupling. Each task should have explicit inputs, expected outputs, ownership boundaries, and validation criteria.
- Delegate implementation work only after the plan has been reviewed or is sufficiently clear to execute.
- For low-complexity tasks, the assistant may execute implementation directly only when it has direct access to the required codebase, editing tools, and validation commands.
- For medium or high complexity tasks, or when direct implementation access is unavailable, stop after producing execution briefs and wait for the user, human executor, or coding agent to provide implementation results.
- Enter the verification phase only after implementation tasks have been reported as complete or implementation evidence is available.
- Update the implementation plan whenever new information invalidates earlier assumptions.
- Make uncertainty visible. Track open questions, assumptions, and risks separately.

## Output Language Rule

Generate workflow artifacts in the user's requested language. If no output language is specified, use the language of the user's task description. Keep artifact filenames such as `context.md`, `implementation-plan.md`, `task-breakdown.md`, `execution-briefs.md`, `qa-checklist.md`, and `final-verification.md` in English unless the user explicitly requests localized filenames.

Prefer keeping technical section headings in English for consistency across coding agents and review artifacts, while writing the section content in the selected output language. If the user asks for fully localized documents, localize both headings and content.

## Workflow

### 1. Intake

Collect the task objective and all available source material.

Look for:

- User request, issue, ticket, or task summary
- Business or product intent
- Current behavior and expected behavior
- Relevant repositories, branches, files, logs, docs, tickets, existing review requests, or screenshots
- Known constraints, deadlines, compatibility requirements, rollout expectations, and testing expectations
- User preferences regarding models, tools, or execution style

If the core objective and expected outcome are clear enough to draft a plan, but some non-blocking details are missing, record those gaps as open questions with suggested defaults instead of blocking the workflow. If the objective, expected outcome, or success criteria are unclear, ask the user for clarification before planning.

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

### 4. Complexity Assessment and Routing

After the implementation plan draft is created, assess the task complexity before deciding how to execute it. This step is not only a Low / Medium / High label. It is an execution strategy assessment based on four dimensions:

```text
Overall Complexity Profile =
Implementation Complexity
+ Coordination Complexity
+ Verification Complexity
+ Requirement Volatility
```

Evaluate each dimension separately, then use the resulting profile to decide task decomposition, execution parallelism, verification depth, and human review frequency.

#### 4.1 Implementation Complexity

Assess how difficult the actual implementation is.

Consider:

- Architecture complexity
- Algorithm or data-flow complexity
- Migration or compatibility requirements
- Performance sensitivity
- Security or privacy sensitivity
- Unfamiliar technologies or fragile legacy code

Default levels:

| Level  | Indicators                                                                                                        |
| ------ | ----------------------------------------------------------------------------------------------------------------- |
| Low    | Narrow scoped change, small refactor, simple UI or CRUD adjustment, no contract change                            |
| Medium | Cross-module business logic, shared utilities, cache/config behavior, moderate compatibility concerns             |
| High   | Distributed systems, concurrency, event ordering, migration, security-sensitive flows, performance-critical paths |

#### 4.2 Coordination Complexity

Assess how difficult it is to coordinate implementation across people, agents, modules, or workstreams.

Consider:

- Number of workstreams
- Dependency graph complexity
- Merge conflict risk
- Ownership boundaries
- Shared contracts or APIs
- Integration sequencing

Default levels:

| Level  | Indicators                                                                               |
| ------ | ---------------------------------------------------------------------------------------- |
| Low    | A single executor can complete the work with minimal coordination                        |
| Medium | 2-3 workstreams with clear dependencies and manageable integration risk                  |
| High   | Cross-team, cross-service, schema/API coordination, or high parallel implementation risk |

#### 4.3 Verification Complexity

Assess how difficult it is to prove the implementation is correct after completion.

Consider:

- Regression surface
- Integration or E2E test requirements
- Manual QA burden
- Async or timing-sensitive behavior
- Observability or logging requirements
- Rollback validation
- Production-only failure modes

Default levels:

| Level  | Indicators                                                                                                                  |
| ------ | --------------------------------------------------------------------------------------------------------------------------- |
| Low    | Unit tests or simple manual checks can verify the change                                                                    |
| Medium | Integration tests, E2E tests, or coordinated manual QA are needed                                                           |
| High   | Distributed async behavior, race conditions, production-only risks, broad regression surface, or hard-to-reproduce behavior |

#### 4.4 Requirement Volatility

Assess how stable the requirement is.

Consider:

- Clarity of objective and expected outcome
- Stability of acceptance criteria
- Unresolved product, UX, or technical decisions
- Exploratory nature of the work
- Likelihood that implementation discoveries will change the plan

Default levels:

| Level  | Indicators                                                                                          |
| ------ | --------------------------------------------------------------------------------------------------- |
| Low    | Objective, desired state, and acceptance criteria are clear and stable                              |
| Medium | Some details are unresolved but suggested defaults are reasonable                                   |
| High   | The work is exploratory, acceptance criteria are unclear, or product/technical direction may change |

#### 4.5 Complexity Profile Output

Always include the complexity profile and recommended execution strategy in `implementation-plan.md`.

If `task-breakdown.md` is generated, repeat the approved complexity profile at the beginning of the document as a short reference so the decomposition remains traceable to the routing decision.

Use this structure:

```yaml
Complexity Profile:
  implementation_complexity: Low | Medium | High
  coordination_complexity: Low | Medium | High
  verification_complexity: Low | Medium | High
  requirement_volatility: Low | Medium | High

Rationale:
  implementation_complexity: [Reason]
  coordination_complexity: [Reason]
  verification_complexity: [Reason]
  requirement_volatility: [Reason]
```

#### 4.6 Routing Rules

Use the profile to decide the execution strategy.

```yaml
Recommended Execution Strategy:
  planning_mode: direct | iterative
  task_decomposition: none | light | aggressive
  execution_parallelism: none | limited | parallelizable
  verification_mode: focused | consolidated | rigorous
  human_review_frequency: normal | increased | high
```

Apply these routing rules:

- If all dimensions are Low, use direct planning, no task breakdown, one execution brief, and focused QA.
- If Implementation Complexity is Medium or High, make the implementation plan more explicit before producing execution briefs.
- If Coordination Complexity is Medium or High, create `task-breakdown.md` and define dependencies, boundaries, and integration sequence.
- If Verification Complexity is Medium or High, define QA criteria early and require stronger implementation evidence before final verification.
- If Requirement Volatility is Medium or High, use iterative planning, narrower workstreams, and more frequent human review gates.
- If any dimension is High, explain why the workflow is being made heavier and what risk it reduces.

Do not use complexity assessment as bureaucracy. Use it to choose the minimum orchestration required to execute safely.

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

Produce `execution-briefs.md` for coding agents or human executors after the implementation plan has been reviewed or is sufficiently clear to execute.

Low complexity work should generate one brief. Medium or high complexity work should generate one brief per workstream. These briefs are intended for delegated implementation work; they do not delegate the orchestration flow itself.

For low-complexity tasks, if the current assistant has direct access to the codebase, editing tools, and validation commands required to safely complete the work, it may execute the task directly using the approved plan and then report implementation evidence. Otherwise, stop after producing execution briefs and wait for completion evidence from the user, human executor, or coding agent before entering QA verification.

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

Define `qa-checklist.md` during planning so the execution briefs have clear validation expectations. Do not enter the active verification phase until implementation tasks have been reported as complete or implementation evidence is available.

Acceptable implementation evidence includes code diffs, commits, review links, test results, logs, screenshots, implementation summaries, or coding agent handoff notes.

Low complexity tasks may be verified by the same assistant after implementation. Medium or high complexity tasks should include a QA consolidation step that compares all completed workstreams against the approved plan, task breakdown, and QA criteria.

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

Human review gate: for tasks with meaningful scope or risk, ask the user to confirm the final verification before producing polished delivery artifacts.

### 9. Final Delivery Artifacts

Only after final verification should the following byproducts be generated.

#### `delivery-summary.md`

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

Status-update comments should stay concise and status-oriented. Do not paste the full implementation plan into the target tracking system unless explicitly requested.

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
Please confirm the final verification results. Once confirmed, I will generate the delivery summary and status-update comment.
```

## Quality Bar

Before considering orchestration complete, verify that:

- The context pack explains why the task exists and what success means.
- The implementation plan is specific enough to execute.
- Complexity routing has clear justification.
- Delegated workstreams are low-coupling when decomposition is used.
- Execution briefs are tightly scoped and include validation instructions.
- Verification occurs after implementation completion evidence is available.
- The QA checklist maps back to acceptance criteria.
- Final delivery artifacts are derived from verified facts, not assumptions.
