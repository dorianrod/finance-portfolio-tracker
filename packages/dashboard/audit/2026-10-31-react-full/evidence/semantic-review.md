# Semantic review evidence

Baseline source/config hashes were checked unchanged before phase-2 authorization was applied. All named target groups are closed file lists in eligible-target-groups.json, not a source sample. Automatically checked files were not relabeled as line-by-line manual review; semantic review is organized by eligible contracts and data flows.

## Capability and component decisions

The application-owned capability map is the README table. The 94 feature modules and their runtime dependencies/call/JSX summaries are recorded in feature-review-input.json. Query/atom/action owners, autonomous data transformations and business composition justify the features; pure visual leaves stay views. Stateful children are not imported by views. The two state renderers receive externally constructed unions, have no hooks and exhaust branches with never. Large tab compositions arrange feature/state renderers and tightly coupled controls; another mirrored-prop view would not establish an independent contract. F-001 identifies the two explicit chart-view aggregation paths. Chart geometry (angle/radius/collision placement), clamped visual amounts and normalized series preparation remain valid UI calculations; this is not a blanket arithmetic or map ban.

The 43 E03 candidates were investigated. Substantial page trees (App, quality, allocation trends, performance, wealth, account selection) coordinate their own workflow/feature children. FundPositionHoldingRow calculates a position exposure, so is a feature. Local account rows toggle business selection; the group uses the controlled selection API itself. Existing complexity/prop-drilling suppressions are not reapproved. Support candidates are component/tooltip/virtual-row/aggregator input-output contracts and subshapes tied to their owning implementation, rather than independent entities exported beside unrelated helpers.

## Existing architecture choices

All seven baseline comments were inspected with implementations/callers: period action/view; prepared allocation chart; prepared asset IRR rankings; cache-only wealth source acquisition; common historical response schema; raw account identity/labels; persistent sibling query coordinator. Their same users/consumers/data flow persist. No new contradictory evidence reopens them. The new chart features follow, rather than supersede, the established prepared-chart convention.

## Data, state and error flows

The source coordinator reads required cached CSVs in sibling Suspense consumers. The persistent shell observes results using skipToken, handles loading/error precedence and keeps navigation/filter state alive. Domain JSON/CSV adapters validate at the API boundary, normalize finite numbers/booleans/calendar dates and handle optional 404 separately. Filtered history marks placeholder scope as updating and never treats it as the new request. Query options share immutable input caches; in-flight CSV entries are removed in finally. No authentication/logout, protected bearer file access or server write mutations exist.

Canonical domain types, nullable producers, schema enum consumers and source display taxonomies were distinguished. Dynamic source identifiers remain open; operation/category/validation states driving decisions are unions. Raw validated rows with original column names still hold Date/number/boolean and are not unparsed response DTO leaks. Calendar-month IDs are intentional technical keys. No entity casts or any propagation was found by typed lint; aliases/type-only dependencies retain their own limits.

All atom modules and action concerns use stable identities/functional copied updates. Persisted theme values are guarded and storage failure is tolerated. The playback Effect Event captures the latest point/index without hiding the timer's reactive playing/count dependencies. Layout/focus/resize/timeout owners clean up. Helpers' mutations are fresh accumulators; side effects/read acquisition stay services. F-002 is a pure independent diagnosis stage hidden in presentation, and is corrected before final closure.

## UI, fixtures and tests

Shared UI uses generic roles, semantic token definitions, typed refs/semantic labels and nested content; global source names/currencies are formatting data, not business UI discriminants. Compound slot callers preserve direct discoverable slots; tabs are lazy outside slot boundaries, and side panels stay mounted with boolean open. Overlay behavior evidence is E09's normal/cancel activation and keyboard tests; no comprehensive real-browser or screen-reader certification is claimed. Virtualized look-through rows already avoid offscreen DOM cost. Additional deferral/containment requires profiling.

Fixture E06's 15 candidates are exact scenario/action/policy inputs or deliberately raw JSON transport payloads. Their existing ledger reasons match consumers; 135 exclusions include Partial overrides, expected values, case tables and schema inputs. Typed mock factories own complete baselines, fixed dates and identifiers. No internal module mock, silent skipped test, conditional assertion or unsupported selector remained in ordinary checks. Query wrappers get independent clients/stores; mounted default Jotai Providers also isolate their stores. Existing legacy missing sibling tests are outside the introduced-file requirement; the actual phase-2 source delta must be checked.

## Enforcement limits and calibration

E01 and E09 exercise the actual configured check and integration suites, including invalid and valid neighboring examples for paths, API contracts, helper categories, atoms, types, UI composition, formatter/i18n, typed safety and test policy. E12 further rejects direct view-to-transformer imports at local/component-role error severity and accepts a formatted pure view. Its presenter-indirection probe did not produce a component-role diagnostic: the current check permits indirect pure helpers to preserve formatter classification. This is a real analysis limit, not a clean detection claim. Do not add a blanket reduce/transformer-transitivity ban: visual geometry and formatter classifications remain legitimate. Fix the explicit source ownership, expose required prepared data via TypeScript, and retain semantic review for aggregation hidden inline or in otherwise legitimate presenters.

143 baseline suppression tracking warnings retain their prior dates/rationales. Normal metadata and unused-directive checks passed. No technical exception revalidation, new suppression, broad ignore or warning headroom was authorized.
