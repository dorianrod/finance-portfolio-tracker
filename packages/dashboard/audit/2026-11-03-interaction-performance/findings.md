# Audit findings

Measurements use Chromium headless at 1440 × 1000 without CPU throttling. Production durations measure a programmatic click through two animation frames, not standardized INP or a guarantee for another device. All reported warm-navigation measurements use already loaded modules/data. See [reproduction and measurements](evidence/performance-review.md).

## F-001 — Expanding one issuer rebuilds the entire exposure model

- Kind: suggestion
- Rule IDs and actual impact: related `ui-vercel-responsive-rendering` (MEDIUM); no specific catalog violation asserted.
- Affected files, symbols and callers: `useFundExposureViewModel.ts:25–35` → `buildFundExposureViewModel.ts:43–88` → `buildIssuerExposures`; `IssuerRow` and the virtualized explorer consume the result. Full paths are in the source manifest.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-001; proposed `exposure-aggregation-independent-of-disclosure`.

### Requirement and evidence

The model's single `useMemo` depends on `expanded`, `query` and `sort` along with financial source inputs. Every disclosure click therefore reruns position selection, parent indexing, issuer canonicalization, aggregation, filtering, sorting and row flattening. A source-only Node probe also confirms that an unchanged issuer's object reference changes after expansion; `memo(IssuerRow)` cannot skip it on props equality.

Production expansion median: **99.4 ms** (98.5–105.8, n=3); collapse: **102.6 ms** (99.6–115.2, n=3). Development CPU sampling locates the dominant cost in issuer construction, not DOM row count. Virtualization already limits mounted rows.

### Why this matters

A local disclosure action blocks on a computation that does not depend on disclosure state. Search and sort also invalidate that same expensive computation. Exact fund-name search is special: it changes the financial scope, so aggregation must still depend on the selected fund rather than ignoring search entirely.

### Alternatives considered

Keep the monolithic memo: preserves behavior but repeats unrelated work. Add more row `memo` wrappers: insufficient while issuer references are recreated. Defer only the existing computation: cannot interrupt its synchronous loop and external Jotai writes do not become nonblocking through `startTransition`. Prefer staged derivation with stable input/output references; it preserves the existing domain ownership and source cache.

### Proposed corrective plan

Separate applicable positions/fund selection, aggregated exposures, search/sort selection and flattened disclosure rows. Expansion should invalidate only flattening; sort should invalidate ordering and rows; ordinary text search should filter existing exposures; exact fund selection should rebuild the correct scoped aggregate. Keep `IssuerExposure` and `SecurityExposure` references stable during disclosure.

### Decision or clarification required

No business decision needed. This is a proposal under the analysis request.

### Acceptance and prevention

Regression scenarios: expand/collapse, source detail, issuer/security/fund text search, exact fund selection, empty search result, sorting and changed financial inputs. Add a narrowly scoped derivation/invalidation regression where useful; repeat production profiling. Do not use timing thresholds in ordinary unit tests or add a generic lint rule that guesses expensive work.

## F-002 — Canonical issuer matching performs over ten million pair checks

- Kind: suggestion
- Rule IDs and actual impact: related `helpers-vercel-indexed-lookups` (MEDIUM). Prefix matching is not an exact-key lookup, so a direct Map replacement is not a proven rule requirement.
- Affected files, symbols and callers: `helpers/transformers/issuerExposures/buildIssuerExposures.ts:112–148`, `createCanonicalIssuerResolver`; called from F-001 and on every underlying-page remount.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-002; proposed `canonical-issuer-prefix-index`.

### Requirement and evidence

For each of 3,234 normalized issuer IDs, `.filter()` traverses all 3,234 candidates: **10,458,756 pair checks** per resolver build. Matching deliberately merges strong normalized prefixes while excluding ISIN-shaped identifiers. Existing behavior selects the longest matching ID; equal-length candidates retain input order.

An isolated prototype using a prefix tree produced identical canonical IDs on every local identifier and a small synthetic prefix/tie/short-name set. Across eight runs, the original resolver took **95.91–109.02 ms** and the prefix index **2.82–8.72 ms**. This measures identifier resolution only; it is not an integrated application speedup claim.

### Why this matters

P-001 removes this cost from disclosure actions. This action also reduces first entry, exact-fund scope changes and warm remounts that still need a new aggregate.

### Alternatives considered

Keep quadratic matching and cache it per source snapshot: helps repeated inputs but preserves slow cold computation. Use exact-key Map lookups: changes truncated-name merging and is unsuitable. Use an indexed prefix algorithm (recommended) or sorted prefix ranges: both can preserve semantics; compare complexity and allocation cost during implementation. The existing financial grouping policy is retained.

### Proposed corrective plan

Extract a pure prefix resolver under the existing issuer transformer owner. Index normalized IDs once per holdings snapshot, preserving short-ID exclusion, longest match, input-order ties, name selection and authoritative market identifiers. Integrate with issuer aggregation and retain its existing outputs.

### Decision or clarification required

No grouping-policy change or user arbitration is needed. The concrete algorithm remains an implementation choice.

### Acceptance and prevention

Add behavior tests for truncated names, unrelated shared prefixes, fewer than 12 characters, multiple longest candidates, ISIN exclusions, missing issuer fallback, duplicates and special source keys. Compare complete exposure outputs on local inputs without committing those inputs. The prototype's limited equivalence is supporting evidence, not complete regression coverage. Algorithmic performance remains a benchmark obligation rather than an unreliable syntax detector.

## F-003 — Returning to Overview rebuilds a complete historical concentration series

- Kind: suggestion
- Rule IDs and actual impact: related `ui-vercel-responsive-rendering` (MEDIUM); no specific scheduling violation asserted.
- Affected files, symbols and callers: `buildOverviewComparison.ts:70–80`, `useOverviewComparison.ts:19`, `buildHistoricalLookThroughConcentration`, `concentrationPoint`; `App.feature.tsx:67` and `DashboardContent.feature.tsx:13–18` define remount behavior.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-003; proposed `overview-concentration-at-comparison-dates`.

### Requirement and evidence

`buildOverviewComparison` constructs complete held and look-through concentration histories, then `concentrationComparison` consumes only the latest eligible points at the current and previous period ends. The history source contains 145,248 holdings rows. Construction groups snapshots, iterates dated positions and creates/sorts per-date holdings arrays.

Switching tabs conditionally removes the old page. The error boundary is also keyed by active tab. Consequently page-local `useMemo` values are lost and recalculated on return, even with warm JavaScript and query caches. Production return to Overview: **137.1 ms median** (112.3–213.7, n=5); return to underlying: **118.6 ms** (108.7–129.3, n=5). Development CPU samples locate Overview work in historical concentration accumulation/ranking/indexing. The corresponding duplicate scope work in navigation/reliability is much smaller in the sampled interactions and is secondary.

### Why this matters

Code preloading and network caching cannot retain page-local calculated results. Rebuilding full historical detail for a two-point comparison increases warm-navigation cost. Diversification also uses this history, but needs its actual series.

### Alternatives considered

Keep full reconstruction: simple but repeats substantial work. Keep all visited tab trees mounted: may retain memoized work but retains chart DOM, subscriptions and memory; removing only the boundary key does not stop conditional unmounting. Prefer compute only the comparison points for Overview, preserving full-series behavior for diversification. A bounded derived-query cache keyed by source revision and actual filters is a possible subsequent optimization; do not move server sources into Jotai or restore shell-wide model prop forwarding.

### Proposed corrective plan

Select the latest eligible concentration dates at/before both comparison endpoints before expensive expansion/ranking. Preserve account/type filters, history effective dates, the absence of applicable compositions and fallback to an earlier eligible point. Reuse the existing snapshot index within one computation. Reprofile warm navigation before adding a derived cache or worker.

### Decision or clarification required

No product choice required. Historical comparison results must remain identical. Any cache added later needs explicit invalidation and memory bounds; no cache design is assumed complete here.

### Acceptance and prevention

Compare old/new overview results for current/previous endpoints, missing dates, absent/partial historical compositions, account/type scope and ties. Preserve diversification's full series. Repeat production navigation measurements. Keep the keyed error-reset behavior unless a replacement demonstrably preserves recovery. No static lint rule can establish historical equivalence or appropriate cache lifetime.

## Implementation outcome

P-001, P-002 and P-003 are implemented and verified under the subsequent user request. The baseline findings above remain the diagnostic record. Final production medians: expand 8.3 ms, collapse 7.9 ms, return Overview 67.4 ms, return underlying 43.9 ms. Complete model, overview and resolver equivalence probes pass on local data; this is bounded evidence alongside the committed regression tests. No financial policy, source ownership or page recovery choice changed. See the plan and retained implementation review for commands, input deltas and limits.
