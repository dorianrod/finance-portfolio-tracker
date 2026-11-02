# Audit coverage

## File review

All 61 baseline files are automatically checked and manually reviewed with their source/caller family. Exact locations and original rationale are preserved in baseline-diagnostics.json. Portfolio source/schema/position/history/savings files map to F-001; diversification prepare/scope helpers to F-002; navigation to F-003. Newly changed owners will be recorded in the final delta.

## Rule review

| Rule                            | Impact   | Coverage                                                              | Finding     |
| ------------------------------- | -------- | --------------------------------------------------------------------- | ----------- |
| arch-shared-no-domain-knowledge | CRITICAL | automatic graph plus actual producer/consumer review                  | F-001–F-003 |
| arch-no-prop-drilling           | CRITICAL | manual shell/source/model and feature consumer traces                 | F-001–F-002 |
| quality-eslint-disable-scoped   | HIGH     | all 60 requested suppressions, actual configured diagnostic confirmed | F-001–F-003 |

Static import ambiguity alone is not a proven ownership error. The removable source-distribution design and inadequate exception rationales are the confirmed corrections. Existing cached readers preserve shell loading and error behavior.

## Existing decisions and ignores

Consulted the three latest prior dossiers: 2026-11-02-prop-drilling (findings/plan: direct composition and raw history, no retained exceptions); 2026-11-02-react-full-2 (scope/findings/plan: component ownership and presentation); 2026-11-02-react-full (scope/findings/plan: formatters; unrelated decisions preserved). No prior dossier establishes that shell distribution is unavoidable. Git history reviewed: 34d269e introduces sibling Suspense sources and passive cache observers; 2be1ba2 only extracts fallback resolvers. Preserve persistent-dashboard-query-boundary and direct-filter-scope-inputs decisions. Explicit user request reopens the 2026-10-27 sharing suppressions. Other exceptions remain outside technical revalidation.

## Pending inspection

No baseline candidate remains undiagnosed. At phase-1 closure, phase 2 still had to inspect owner moves, new APIs and final consumers. That work is now complete below.

## Final file review

Every original diagnostic is individually reconciled in [sharing-reconciliation.json](evidence/sharing-reconciliation.json): 42 retained shared modules have at least two immediate capability consumers; eight modules moved to actual capability owners; four dead cash-source modules were removed; seven source wrappers were replaced by canonical options/required-source query batches. The cash property had no production reader; the network request, schema, aggregation and field are removed. No query or component was added solely to create an import edge: required-source batches enforce the existing dashboard readiness prerequisite and protect independently mounted entrypoints from rendering unavailable data as empty results. Cold-cache and failure regressions exercise this runtime responsibility.

Allocation-only transformations and their tests now live in allocation. Concentration independently selects applicable positions from the common position scope, so its import graph does not falsely claim allocation scoping. Quality issue scopers remain shared because assessment and issue inspection both use their results. Fund-specific Suspense reads moved to holdings/shared, serving position previews and fund exploration. Raw fund options remain common inputs to overview, holdings, diversification and assessment.

[New shared consumers](evidence/new-shared-consumers.json) lists actual immediate feature scopes and external shell consumers. Typed query-options keys connect passive observations to the canonical validated sources. No server data moved into Jotai, no Context was introduced and no rule configuration was weakened.

New owners, role dispositions and exact move provenance are closed by [colocation-final.json](evidence/colocation-final.json) and [colocation-provenance.json](evidence/colocation-provenance.json). Source-option descriptors are runtime request services, with sibling transport/validation/error tests. Required-source hooks cover cache reuse and HTTP failures. Model services cover direct atom/cache changes and missing or empty inputs. Entry components cover cached business output and suspension on absent sources. Navigation covers multiple destinations while preserving the holdings subview. The unchanged filter-options service and diversification atom are genuine moves; the fund hook retains its original network tests and result contract.

Existing unrelated TanStack Table suppression is unchanged and not technically revalidated. No sharing suppression remains; no exception approval is pending. Prior persistent-dashboard-query-boundary remains valid: common sources use parallel useSuspenseQueries batches under sibling shell boundaries; passive observers preserve navigation and editable filters.

Final responsibility trace also separates demo-preset account acquisition/choice/selection into scope-selection and period-only operation-filter removal into performance. Their prior appearance as fields in broader history/position results did not establish real reuse. Existing pure contracts move unchanged; the new demo service has direct-source/selection and absent-preset regressions.

Final pending inspection: none. Final introduced-owner, source/caller, consumer and exception obligations are complete.
