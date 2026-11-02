# Audit findings

## F-001 — Shell distributes common sources and feature models

- Kind: violation
- Rule IDs and actual impact: arch-no-prop-drilling (CRITICAL), quality-eslint-disable-scoped (HIGH). Related ownership correction constraint: arch-shared-no-domain-knowledge.
- Affected files, symbols and callers: Portfolio shared sources, schemas, history, positions, savings and filter options; app model and consuming feature services; exact baseline files in evidence/baseline-diagnostics.json.
- Proposed action: fix
- Plan actions: P-001

### Requirement and evidence

useDashboardViewModel reads all caches, derives all feature models and forwards them through DashboardContent and route wrappers. Original suppressions describe sharing through props without a blocking constraint. Source requests and data transformation can remain cached while each capability subscribes to its inputs.

### Why this matters

The existing arrangement obscures real shared consumers and retains avoidable exceptions. A static review candidate does not by itself prove invalid business ownership.

### Alternatives considered

Retain the comments: rejected because there is no demonstrated blocker. Store server models in Jotai or add React Context: rejected because server state belongs to React Query. Use focused source subscriptions, owning services and composition: selected because these preserve cached data, scope and persistent loading/error behavior. No artificial imports or detector weakening.

### Proposed corrective plan

P-001: separate source query options from passive cache reads; retain sibling Suspense loading in app; feature services read source caches/atoms themselves; remove the broad shell distribution and obsolete suppressions.

### Decision or clarification required

None for conforming corrections; explicit user authorization. Any later necessary exception requires a concrete rationale and user approval before acceptance.

### Acceptance and prevention

No sharing warnings/suppressions, preserved business results and filter changes, initial load/errors/parallel requests, actual graph consumers. Existing lint and typed query contracts suffice; no broadened lint exemption planned.

## F-002 — Diversification scope belongs to its actual consumers

- Kind: violation
- Rule IDs and actual impact: arch-shared-no-domain-knowledge and arch-no-prop-drilling (CRITICAL), quality-eslint-disable-scoped (HIGH).
- Affected files, symbols and callers: prepareDiversificationScope, scopeRawAllocationData, excludeNonApplicableAllocationData, app/DashboardDiversification and allocation/concentration sections; exact baseline files in evidence/baseline-diagnostics.json.
- Proposed action: fix
- Plan actions: P-002

### Requirement and evidence

The app computes and distributes both applicable positions and allocation data; the graph cannot establish child ownership. Allocation scoping is allocation-specific; applicable-position selection is also used by concentration.

### Why this matters

The existing arrangement obscures real shared consumers and retains avoidable exceptions. A static review candidate does not by itself prove invalid business ownership.

### Alternatives considered

Retain the comments: rejected because there is no demonstrated blocker. Store server models in Jotai or add React Context: rejected because server state belongs to React Query. Use focused source subscriptions, owning services and composition: selected because these preserve cached data, scope and persistent loading/error behavior. No artificial imports or detector weakening.

### Proposed corrective plan

P-002: move allocation-specific scoping to allocation; let allocation/concentration read their own common inputs and prepare their own scope; retain the app availability gate with actual scope consumers.

### Decision or clarification required

None for conforming corrections; explicit user authorization. Any later necessary exception requires a concrete rationale and user approval before acceptance.

### Acceptance and prevention

No sharing warnings/suppressions, preserved business results and filter changes, initial load/errors/parallel requests, actual graph consumers. Existing lint and typed query contracts suffice; no broadened lint exemption planned.

## F-003 — Navigation facade combines shell state and overview actions

- Kind: violation
- Rule IDs and actual impact: quality-eslint-disable-scoped (HIGH). Ownership and direct-state rules constrain the correction.
- Affected files, symbols and callers: shared/services/actions/useDashboardNavigation, app navigation/holdings tabs, overview summary cards; exact baseline files in evidence/baseline-diagnostics.json.
- Proposed action: fix
- Plan actions: P-003

### Requirement and evidence

Only overview and app use this facade. The held-view setter is shell-only. Overview navigation is a legitimate direct action on the shared tab atom; no wrapper is needed in shared.

### Why this matters

The existing arrangement obscures real shared consumers and retains avoidable exceptions. A static review candidate does not by itself prove invalid business ownership.

### Alternatives considered

Retain the comments: rejected because there is no demonstrated blocker. Store server models in Jotai or add React Context: rejected because server state belongs to React Query. Use focused source subscriptions, owning services and composition: selected because these preserve cached data, scope and persistent loading/error behavior. No artificial imports or detector weakening.

### Proposed corrective plan

P-003: move overview action to its leaf owner and let shell controls write their own navigation atoms. Remove the shared facade suppression.

### Decision or clarification required

None for conforming corrections; explicit user authorization. Any later necessary exception requires a concrete rationale and user approval before acceptance.

### Acceptance and prevention

No sharing warnings/suppressions, preserved business results and filter changes, initial load/errors/parallel requests, actual graph consumers. Existing lint and typed query contracts suffice; no broadened lint exemption planned.

### Implementation clarification for F-001

Consumer review found no production use of total_broker_cash. Keeping a shared cash-enriched history facade would invent reuse of dead data. Remove that acquisition, its types/schema/aggregation, and its unused field instead; retain original portfolio value/IRR history and account/period semantics. Existing independent-source tests now omit that unused endpoint. Required sources still start in parallel.

### Implementation clarification for F-002

The original combined diversification result mixes allocation-only scoping with position applicability. Calling that combined object from concentration merely to use its position field would preserve hidden exclusive ownership. Allocation now owns prepareAllocationScope, scopeRawAllocationData and excludeNonApplicableAllocationData; concentration filters applicable positions itself using the common domain predicate.
