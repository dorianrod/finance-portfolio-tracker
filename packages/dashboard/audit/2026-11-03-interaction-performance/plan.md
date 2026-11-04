# Corrective plan

## Implementation scope and authorization

Phase 1 completed before source edits. The subsequent user “implémente” authorizes P-001–P-003. Phase 2 is complete. No commit, deployment or release requested.

## Prioritized actions

| Action | Finding and option                       | Status   | Authorization / dependencies             | Implementation and acceptance                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------ | ---------------------------------------- | -------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P-001  | F-001: staged exposure derivation        | verified | User “implémente”; independent of P-002  | `selectExposureFund`, `buildFundIssuerExposures`, the presentation selector and `buildExposureRows` have separate memo dependencies. Disclosure/sort/ordinary search preserve financial entity references; exact fund selection still changes the scope. Decision `exposure-aggregation-independent-of-disclosure` records the invariant. Hook/helper regressions, 16 local complete-model equivalence cases and production disclosure measurements pass.                           |
| P-002  | F-002: indexed canonical issuer matching | verified | Same request; independent of P-001       | `createCanonicalIssuerResolver` indexes longest IDs by prefixes, then restricts lookup to known non-ISIN identifiers. Input-order ties and last-name handling remain intact. Decision `canonical-issuer-prefix-index`, sibling edge regressions, complete local resolver/model equivalence and benchmarks support acceptance. A Map of prefix strings was chosen over the prototype's per-character tree to keep the implementation small and preserve UTF-16 startsWith semantics. |
| P-003  | F-003: endpoint concentration snapshots  | verified | Same request; independent of P-001/P-002 | Shared builders accept optional endpoint dates. Eligible history is determined before selecting each latest snapshot, so missing/future composition and earlier-point fallback stay intact. Overview supplies two endpoints; diversification keeps full-series output. Decision `overview-concentration-at-comparison-dates`, endpoint/filter tests, nine complete local overview equivalence cases and production navigation measurements pass.                                    |

## User decisions

No pending arbitration or implementation action. All corrections preserve financial and filtering semantics. Acceptance details: [verification](verification.md), [implementation evidence](evidence/implementation-review.md).

## Rule and enforcement feedback

No ESLint, TypeScript, skill or warning-ceiling change was needed. Existing lint/type protections remain active. Added behavior regressions cover entity-reference stability, exact-fund scoping, prefix policy and endpoint fallback rather than unstable wall-clock assertions. Every new runtime owner has a meaningful sibling test. The existing fixture review gate was refreshed after checking 24 unchanged candidate locations/test hashes and one new explicit direct-source delta; see the retained fixture-review delta.

## Follow-ups and plan changes

No server sources were copied into atoms, no broad shell prop forwarding was restored, and no page/error-boundary lifecycle was changed. The measured gains satisfy this plan without adding a cache or worker. Production timings remain local rendering proxies, not standardized INP guarantees. Broader tab/device matrices and optional subtab preloading remain outside this change.
