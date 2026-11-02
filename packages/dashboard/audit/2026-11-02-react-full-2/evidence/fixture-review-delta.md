# Phase-2 fixture review

All 16 candidate coordinates, definitions, test hashes and keep reasons are
unchanged. Revalidated their existing state/action inputs, component scope,
severity scenarios, filter arguments, unavailable comparisons and raw serialized
network responses against the unchanged canonical contracts/consumers. Shared
severity extraction preserves the closed error/warning meaning and source totals.
No candidate became a maintained inline sample default.

The new PortfolioCompositionPoint is component-owned derived data, uses Date and
a pure helper output, and has its typed deterministic factory in the owning
component mocks folder. Its prepared payloads in tests use that factory. Other
new tests reuse existing portfolio/report/concentration/pipeline/metric factories
with explicit scenario overrides. The five exclusions in changed/new test files
are four parametrized scenarios and one expected assertion value, not hidden
reusable fixtures. No casts, live clock, internal mocks or new fixture exceptions.

The complete inventory remains 16 candidates; no keep decision was fabricated or
new blanket exclusion introduced. Refresh only the ledger analysis fingerprint
after reviewing all changed/new source inputs and retaining every existing reason.
Current fixture inventory and subsequent review gate provide the exact evidence.
