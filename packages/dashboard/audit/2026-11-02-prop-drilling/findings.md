# Audit findings

## F-001 — Account selection

- Kind: violation
- Rule IDs and actual impact: arch-no-prop-drilling (CRITICAL)
- Affected files, symbols and callers: [complete location inventory](evidence/suppression-review.json), family Account selection; caller/receiver details in plan.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-001; preserve prepared-asset-irr-results.

### Requirement and evidence

Existing line suppressions and lifted diagnostics identify forwarding or parent-derived feature props. Inspection confirms a conforming composition/raw-input alternative; the current ownership description does not establish that suppression is unavoidable. Compose account rows at the picker boundary; groups consume their bulk-selection inputs and children, with no forwarding of labels or row state.

### Why this matters

The suppression hides a removable intermediate dependency and weakens the active ownership check.

### Alternatives considered

Keep the ignore: rejected because no demonstrated constraint prevents correction. Introduce shared atoms: appropriate for actual shared client state, unnecessary for display composition or raw server history. Prefer direct composition and raw inputs while preserving existing business owners and callbacks.

### Proposed corrective plan

Compose account rows at the picker boundary; groups consume their bulk-selection inputs and children, with no forwarding of labels or row state.

### Decision or clarification required

User has requested these corrections and selected avoiding exceptions. No exception currently proposed; seek approval before retaining one if evidence changes.

### Acceptance and prevention

No local/no-prop-drilling suppression or diagnostic in the corrected family, unchanged observable selection/tooltip/navigation/status behavior, active lint and type constraints, regression checks. Comment rationale semantics require human review rather than a keyword detector.

### Implementation disposition

All 6 original directives in this family are corrected without exception; see the [individual ledger](evidence/suppression-review.json) and [results](results.md). Verification gates are tracked centrally in verification.md.

## F-002 — Tooltip composition

- Kind: violation
- Rule IDs and actual impact: arch-no-prop-drilling (CRITICAL)
- Affected files, symbols and callers: [complete location inventory](evidence/suppression-review.json), family Tooltip composition; caller/receiver details in plan.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-002; preserve prepared-asset-irr-results.

### Requirement and evidence

Existing line suppressions and lifted diagnostics identify forwarding or parent-derived feature props. Inspection confirms a conforming composition/raw-input alternative; the current ownership description does not establish that suppression is unavoidable. Replace scoped text wrappers at affected call sites with InfoTooltip views and directly composed FilterScopeBadges features; pass scalar raw badge inputs. MetricLabel becomes a real label view accepting tooltip children.

### Why this matters

The suppression hides a removable intermediate dependency and weakens the active ownership check.

### Alternatives considered

Keep the ignore: rejected because no demonstrated constraint prevents correction. Introduce shared atoms: appropriate for actual shared client state, unnecessary for display composition or raw server history. Prefer direct composition and raw inputs while preserving existing business owners and callbacks.

### Proposed corrective plan

Replace scoped text wrappers at affected call sites with InfoTooltip views and directly composed FilterScopeBadges features; pass scalar raw badge inputs. MetricLabel becomes a real label view accepting tooltip children.

### Decision or clarification required

User has requested these corrections and selected avoiding exceptions. No exception currently proposed; seek approval before retaining one if evidence changes.

### Acceptance and prevention

No local/no-prop-drilling suppression or diagnostic in the corrected family, unchanged observable selection/tooltip/navigation/status behavior, active lint and type constraints, regression checks. Comment rationale semantics require human review rather than a keyword detector.

### Implementation disposition

All 9 original directives in this family are corrected without exception; see the [individual ledger](evidence/suppression-review.json) and [results](results.md). Verification gates are tracked centrally in verification.md.

## F-003 — Contribution lists

- Kind: violation
- Rule IDs and actual impact: arch-no-prop-drilling (CRITICAL)
- Affected files, symbols and callers: [complete location inventory](evidence/suppression-review.json), family Contribution lists; caller/receiver details in plan.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-003; preserve prepared-asset-irr-results.

### Requirement and evidence

Existing line suppressions and lifted diagnostics identify forwarding or parent-derived feature props. Inspection confirms a conforming composition/raw-input alternative; the current ownership description does not establish that suppression is unavoidable. Render existing ContributionListView directly and compose its tooltip at the rankings boundary, removing the intermediate feature.

### Why this matters

The suppression hides a removable intermediate dependency and weakens the active ownership check.

### Alternatives considered

Keep the ignore: rejected because no demonstrated constraint prevents correction. Introduce shared atoms: appropriate for actual shared client state, unnecessary for display composition or raw server history. Prefer direct composition and raw inputs while preserving existing business owners and callbacks.

### Proposed corrective plan

Render existing ContributionListView directly and compose its tooltip at the rankings boundary, removing the intermediate feature.

### Decision or clarification required

User has requested these corrections and selected avoiding exceptions. No exception currently proposed; seek approval before retaining one if evidence changes.

### Acceptance and prevention

No local/no-prop-drilling suppression or diagnostic in the corrected family, unchanged observable selection/tooltip/navigation/status behavior, active lint and type constraints, regression checks. Comment rationale semantics require human review rather than a keyword detector.

### Implementation disposition

All 3 original directives in this family are corrected without exception; see the [individual ledger](evidence/suppression-review.json) and [results](results.md). Verification gates are tracked centrally in verification.md.

## F-004 — Overview card shell

- Kind: violation
- Rule IDs and actual impact: arch-no-prop-drilling (CRITICAL)
- Affected files, symbols and callers: [complete location inventory](evidence/suppression-review.json), family Overview card shell; caller/receiver details in plan.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-004; preserve prepared-asset-irr-results.

### Requirement and evidence

Existing line suppressions and lifted diagnostics identify forwarding or parent-derived feature props. Inspection confirms a conforming composition/raw-input alternative; the current ownership description does not establish that suppression is unavoidable. Keep navigation in the shell and move its presentation-only header into a view composed by the owning metric card.

### Why this matters

The suppression hides a removable intermediate dependency and weakens the active ownership check.

### Alternatives considered

Keep the ignore: rejected because no demonstrated constraint prevents correction. Introduce shared atoms: appropriate for actual shared client state, unnecessary for display composition or raw server history. Prefer direct composition and raw inputs while preserving existing business owners and callbacks.

### Proposed corrective plan

Keep navigation in the shell and move its presentation-only header into a view composed by the owning metric card.

### Decision or clarification required

User has requested these corrections and selected avoiding exceptions. No exception currently proposed; seek approval before retaining one if evidence changes.

### Acceptance and prevention

No local/no-prop-drilling suppression or diagnostic in the corrected family, unchanged observable selection/tooltip/navigation/status behavior, active lint and type constraints, regression checks. Comment rationale semantics require human review rather than a keyword detector.

### Implementation disposition

All 3 original directives in this family are corrected without exception; see the [individual ledger](evidence/suppression-review.json) and [results](results.md). Verification gates are tracked centrally in verification.md.

## F-005 — Three-year IRR

- Kind: violation
- Rule IDs and actual impact: arch-no-prop-drilling (CRITICAL)
- Affected files, symbols and callers: [complete location inventory](evidence/suppression-review.json), family Three-year IRR; caller/receiver details in plan.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-005; preserve prepared-asset-irr-results.

### Requirement and evidence

Existing line suppressions and lifted diagnostics identify forwarding or parent-derived feature props. Inspection confirms a conforming composition/raw-input alternative; the current ownership description does not establish that suppression is unavoidable. Pass raw history to the KPI and contribution card; each owns latest-value selection. Preserve availability/status behavior.

### Why this matters

The suppression hides a removable intermediate dependency and weakens the active ownership check.

### Alternatives considered

Keep the ignore: rejected because no demonstrated constraint prevents correction. Introduce shared atoms: appropriate for actual shared client state, unnecessary for display composition or raw server history. Prefer direct composition and raw inputs while preserving existing business owners and callbacks.

### Proposed corrective plan

Pass raw history to the KPI and contribution card; each owns latest-value selection. Preserve availability/status behavior.

### Decision or clarification required

User has requested these corrections and selected avoiding exceptions. No exception currently proposed; seek approval before retaining one if evidence changes.

### Acceptance and prevention

No local/no-prop-drilling suppression or diagnostic in the corrected family, unchanged observable selection/tooltip/navigation/status behavior, active lint and type constraints, regression checks. Comment rationale semantics require human review rather than a keyword detector.

### Implementation disposition

All 2 original directives in this family are corrected without exception; see the [individual ledger](evidence/suppression-review.json) and [results](results.md). Verification gates are tracked centrally in verification.md.

## F-006 — Quality KPI adapters

- Kind: violation
- Rule IDs and actual impact: arch-no-prop-drilling (CRITICAL)
- Affected files, symbols and callers: [complete location inventory](evidence/suppression-review.json), family Quality KPI adapters; caller/receiver details in plan.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-006; preserve prepared-asset-irr-results.

### Requirement and evidence

Existing line suppressions and lifted diagnostics identify forwarding or parent-derived feature props. Inspection confirms a conforming composition/raw-input alternative; the current ownership description does not establish that suppression is unavoidable. Call the existing compact view directly; adapters own navigation callbacks and compose live filter badges. Remove the forwarding compact feature.

### Why this matters

The suppression hides a removable intermediate dependency and weakens the active ownership check.

### Alternatives considered

Keep the ignore: rejected because no demonstrated constraint prevents correction. Introduce shared atoms: appropriate for actual shared client state, unnecessary for display composition or raw server history. Prefer direct composition and raw inputs while preserving existing business owners and callbacks.

### Proposed corrective plan

Call the existing compact view directly; adapters own navigation callbacks and compose live filter badges. Remove the forwarding compact feature.

### Decision or clarification required

User has requested these corrections and selected avoiding exceptions. No exception currently proposed; seek approval before retaining one if evidence changes.

### Acceptance and prevention

No local/no-prop-drilling suppression or diagnostic in the corrected family, unchanged observable selection/tooltip/navigation/status behavior, active lint and type constraints, regression checks. Comment rationale semantics require human review rather than a keyword detector.

### Implementation disposition

All 5 original directives in this family are corrected without exception; see the [individual ledger](evidence/suppression-review.json) and [results](results.md). Verification gates are tracked centrally in verification.md.

## F-007 — Position breakdown

- Kind: violation
- Rule IDs and actual impact: arch-no-prop-drilling (CRITICAL)
- Affected files, symbols and callers: [complete location inventory](evidence/suppression-review.json), family Position breakdown; caller/receiver details in plan.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-007; preserve prepared-asset-irr-results.

### Requirement and evidence

Existing line suppressions and lifted diagnostics identify forwarding or parent-derived feature props. Inspection confirms a conforming composition/raw-input alternative; the current ownership description does not establish that suppression is unavoidable. Read preview selection in the existing preview-owning cell and supply the existing status button view directly; remove the intermediate control.

### Why this matters

The suppression hides a removable intermediate dependency and weakens the active ownership check.

### Alternatives considered

Keep the ignore: rejected because no demonstrated constraint prevents correction. Introduce shared atoms: appropriate for actual shared client state, unnecessary for display composition or raw server history. Prefer direct composition and raw inputs while preserving existing business owners and callbacks.

### Proposed corrective plan

Read preview selection in the existing preview-owning cell and supply the existing status button view directly; remove the intermediate control.

### Decision or clarification required

User has requested these corrections and selected avoiding exceptions. No exception currently proposed; seek approval before retaining one if evidence changes.

### Acceptance and prevention

No local/no-prop-drilling suppression or diagnostic in the corrected family, unchanged observable selection/tooltip/navigation/status behavior, active lint and type constraints, regression checks. Comment rationale semantics require human review rather than a keyword detector.

### Implementation disposition

All 1 original directives in this family are corrected without exception; see the [individual ledger](evidence/suppression-review.json) and [results](results.md). Verification gates are tracked centrally in verification.md.

## F-008 — Exception rationale

- Kind: prevention-gap
- Rule IDs and actual impact: quality-eslint-disable-scoped (HIGH)
- Affected files, symbols and callers: [complete location inventory](evidence/suppression-review.json), family Exception rationale; caller/receiver details in plan.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-008; preserve prepared-asset-irr-results.

### Requirement and evidence

Existing line suppressions and lifted diagnostics identify forwarding or parent-derived feature props. Inspection confirms a conforming composition/raw-input alternative; the current ownership description does not establish that suppression is unavoidable. The skill currently requires a technical reason but does not explicitly require rejected compliant alternatives in the comment.

### Why this matters

The suppression hides a removable intermediate dependency and weakens the active ownership check.

### Alternatives considered

Keep the ignore: rejected because no demonstrated constraint prevents correction. Introduce shared atoms: appropriate for actual shared client state, unnecessary for display composition or raw server history. Prefer direct composition and raw inputs while preserving existing business owners and callbacks.

### Proposed corrective plan

Clarify that exceptions require evidence explaining why conforming alternatives cannot satisfy the requirement; mere descriptions of current ownership are insufficient. Prefer removal and require user approval where requested.

### Decision or clarification required

User has requested these corrections and selected avoiding exceptions. No exception currently proposed; seek approval before retaining one if evidence changes.

### Acceptance and prevention

No local/no-prop-drilling suppression or diagnostic in the corrected family, unchanged observable selection/tooltip/navigation/status behavior, active lint and type constraints, regression checks. Comment rationale semantics require human review rather than a keyword detector.

### F-008 implementation disposition

Entry point, exception policy and prop-drilling alternatives updated; compiled guide rebuilt. Rationale meaning remains a technical-review obligation. No detector was weakened.
