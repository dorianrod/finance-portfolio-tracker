# Current semantic review and retained evidence

## Review method and limits

The current manifest matches all 1,364 authored non-cache files in the preceding
final manifest. All 110 rule hashes match. Retain the preceding per-file review
and its final delta for those identical inputs, with current check results and
the explicit corrections below. This is an incremental revalidation of a full
scope, not a claim to have reread 1,364 files. References identify the original
evidence rather than copying prior dossiers. Five additional manifest entries
are the reviewed `.gitignore`, three static assets and generated
`.ruff_cache/.gitignore` (no React applicability). The preceding
`.pytest_cache/README.md` is generated and excluded.

The selective historical question was whether current ownership, contracts and
completed corrections remained supported. Consulted the latest dossier's F-001,
P-001–P-004, exact affected per-file rows and the five linked semantic summaries;
the 2026-10-31 full dossier's F-001/F-002/F-003 and P-001/P-003; and
2026-10-31-react-2 F-001–F-004 with their action outcomes. No older dossier was
opened for semantic history. File names in a formatting diagnostic are not
historical content reviews.

## Architecture, API, security and state

The README capability map still describes a single portfolio domain with scope
selection, overview, wealth, performance, diversification, holdings and data
quality. No new hierarchy or transverse owner is warranted. Current architecture
inventory has 43 candidates, matching the preceding reviewed family: 11 feature
boundaries and 32 local support contracts. Shell/App/source boundaries compose
business surfaces; navigation owns navigation and preload; account selection
owns membership changes; position cells own quantity visibility/preview actions;
fund rows derive exposure. The feature composition and support-type dispositions
in the preceding architecture/type summaries remain supported. JSX counts alone
do not justify extraction. F-001 supplies new contradictory evidence for views
outside this feature-only inventory.

Read DashboardSources, DashboardSourceBoundary, dashboard load-state mapping,
source query options, filtered-history request/response and keys together.
Sibling Suspense consumers start independent required reads; the persistent
shell observes their caches. Common sources validate in schemas, filtered reads
validate requests/responses and propagate cancellation, and query keys normalize
scope. Cached observers do not duplicate transport. Existing source-boundary,
request/schema and filter-transition tests run in the fresh suite. The central
normalizer distinguishes missing data/access errors. ExternalLink permits
http(s), supplies noopener/noreferrer and keeps malformed URLs readable. No
auth/logout, protected-file primitive, write mutation or optimistic update
capability is present. No such capabilities were inferred from installed tools.

Client atoms remain filter/navigation/sort/selection/UI state. Theme persistence
validates storage reads/events and handles unavailable or full storage. Read its
implementation and existing tests; no server-data mirror or render-created atom
was introduced. Existing code-local decisions remain valid, as enumerated in
coverage. The proposal preserves source sharing, page assessment extraction and
all previously corrected formatter ownership.

## Presenters and financial calculations

Enumerated the 50 non-test/non-type domain presenter implementations/constants;
inspected their source results and meaningful callers. The complete file list
and individual dispositions are retained in presenter-review.json. The exact
independent calculations in F-001 were missed by prior broad clean summaries.

Distinguishing evidence: computePortfolioComposition returns a monetary total
`cost + gain`, used as the tooltip's displayed Total. Overview driver preparation
returns gross period changes used as currency values. Look-through preparation
derives reliable, other-source, identified and unresolved monetary exposure, with
business-defined confidence limits. Pipeline counts classify canonical
PipelineError.level values and are independently calculated in the existing
buildDataQualitySummary transformer. These results remain meaningful without a
chart, tone, expansion state, formatter or translated label. They belong to
transformers. The three views calling the evolution/error adapters consequently
own hidden domain derivation. This is an ownership defect; no incorrect money
amount or observed production crash is asserted.

The same review finds four adjacent-snapshot concentration threshold deltas in
buildConcentrationChartRows. These compare required position counts and feed
textual threshold change indicators; their meaning is independent of chart
coordinates. Separate those calculations while retaining timestamp adaptation,
the component owner and the existing absence rationale. This brings the family
to six independent calculation owners, plus their affected view/adaptor chains.

Preserve the existing geometry/series contracts: axis domains, label placement,
stack percentages, small-value grouping for a chart, normalized bar widths,
crosshair coordinates, animation frames, library tooltip extraction and chart
row expansion remain presenters. Prepared account-type totals retain their
existing feature owners. Their payload extraction, ratios, clamp/coordinate
adaptation and direct rendering are not reopened merely because they contain
arithmetic. Scope narratives and headings remain UI configuration; the recent
domain-value label formatters remain context-aware hooks. Localized table sort
and UI row selection stay with the table adapter; severity statistics are
separated. Existing indexing in buildHoverChartSeries is adequate: it groups
operations by month before processing individual buckets, rather than repeatedly
scanning the full operation history.

## Shared UI, accessibility and performance

Read ControlProps/Button/Popover/Preview/SidePanel/ExternalLink, their state/focus
helpers and interaction tests. Closed semantic variants retain appearance inside
shared UI; public contracts remove CSS/ARIA/keyboard escape props. Native event
handlers are invoked before cancelable built-in activation. Existing tests cover
pointer and keyboard cancellation, outside dismissal/reopening, Escape, both
Tab directions, modal containment, unavailable controls and ref composition.
All pass in the fresh suite. Dialogs remain controlled, slots remain direct and
renderable, and content is composed through children. No form capability exists.
Tailwind tokens and UI variant ownership are unchanged; the companion is limited
to shared UI. No real-browser/assistive-technology certification is claimed.

Lazy tab loaders and retained boundaries preserve optional chunks in the current
build. Virtual rows and existing chart/UI state remain appropriate. There is no
measurement establishing a new offscreen-containment or transition obligation;
no optimization requirement is invented from file size.

## Types, schemas, helpers, translations, tests and prevention

Retain unchanged canonical entity/support/nullability/schema evidence; current
strict compiler and typed lint pass. Read the current nullable PipelineError
contract and corrected formatter hooks. The 32 architecture support contracts
remain local input/output/payload contracts, not newly duplicated entities.
Financial values remain numeric and calendar data is validated into Date;
technical month/control keys are distinct. Immutable collection/index semantics
and schema coercion remain protected by existing cases and rules.

Current fixture gate has 16 fresh, explicit keep decisions and no pending/stale
entry. Retained per-candidate reasons, source fingerprints, canonical types and
consumers remain identical; the complete source/test fingerprint matches the
ledger. Fresh application/integration and generic suites cover real schemas,
network-boundary mocks, isolated Jotai/QueryClient state, behavior and edge cases.
New/extracted-owner colocation is a phase-2 obligation; none was introduced here.

The normal lint and configured invalid/valid integration cases calibrate naming,
imports, roles, aliases/reexports, schemas, formats/fallbacks, types, slots/events,
styles, i18n, tests and suppression metadata. The additional in-memory probe
confirms local/component-role rejects a real transformer dependency at severity
2, accepts a display-only neighbor and accepts the current misclassified
presenter chain. That last acceptance is an explicitly demonstrated semantic
limit. Broad arithmetic bans would reject the valid geometry cases above.
Propose required prepared-data types plus bad/good compiler/ESLint cases and
behavior tests; no sound new business-classifier detector is established.

Only one English translation catalog is configured. Static keys, interpolation,
known errors and the catalog gate pass; provider-specific formatter regressions
still pass. Existing suppression metadata/unused checks pass. Their 142 inline
technical justifications are not renewed. One existing sharing review warning
retains its README/source consumer evidence. The warning ceiling remains 143.

## Formatting scope delta

The fresh full formatter finds 79 previously authored audit records plus one
new scratch JSON. None of its failures is application source. HEAD 444f8b4 made
durable audit files visible by replacing the blanket Git ignore; Prettier's
committed check and CI command now include them. Retain `.gitignore` policy.
F-002 covers deterministic layout only for the 79 enumerated records; their
hash manifest supplements the initial inventory. Historical prose, decisions
and metric values are not semantically reopened. Format this audit's own
artifacts before the final check to distinguish its output from the original
79 failures. Do not broaden ignores or silently rewrite prior reports in phase 1.
