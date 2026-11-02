# Semantic review evidence

## Capability and ownership map

Portfolio is the single business domain: users choose a scope, inspect current/recent wealth, evaluate performance, inspect allocation/concentration, inspect held/underlying positions and diagnose source quality. README's capability map matches the implementation. Diversification owns allocation and concentration; holdings owns positions and fund look-through; data quality owns assessment and pipeline-error inspection. Period/dimension/current/history are variants within these owners. Common validated positions, history, fund and account protocols feed several children through application composition. No new sub-domain or generic feature wrapper is justified.

## Components and UI boundaries

[Every feature decision](component-boundaries.md) records the owning calls, composition and split/keep conclusion. F-006 identifies three independent visual contracts: MiniDonut's prepared pie/legend, OverviewPeriodFilter's two-period comparison control, and AssetIrrView's prepared results/rankings. Keeping workflow composition in App, DataQualityTab, WealthTab and PerformanceTab is distinct from keeping a standalone plot mixed with its transformation.

Both state renderers were read: DashboardLoadState renders loading/error/ready, while ClassificationCoverageState renders loading/empty/not-applicable/ready. Their unions are built outside, branches exhaustively narrow to never and no state/query hook runs in the renderer. Composing AllocationCoverageCard.feature in a ready branch is explicitly allowed feature composition, not acquisition in the renderer.

All declared views received resolved runtime import checks and the component inventory. The only direct retired-category dependency from a view is generic getOwnValue in AccountTypeHistoryChart; it is a business-agnostic own-property accessor, not domain aggregation. Preserve that behavior during F-005 and calibrate any canonical-path diagnostic rather than manufacturing business knowledge from a folder name.

The 59 architecture candidates include local helper/renderer support contracts, not 59 violations. Local row/tooltip/virtual-item contracts serve their declared functions; RawCashRow is aggregateBrokerageCash's input, and historical snapshot types belong to their owning transformation. Tree account rows calculate selection/toggle decisions; tax/exposure cells calculate business values. No blanket role rename follows from opaque calls.

Shared UI uses semantic variants and ControlProps excludes ARIA/keyboard/focus/style escape hatches. SidePanel, Preview, Popover, Tooltip and their lifecycle hooks were read with interaction tests: caller cancellation, modal/nonmodal Tab behavior, unavailable focus targets and outside dismissal/reopen/Escape are exercised. UserEvent and role/name queries inspect actual behavior. These jsdom checks do not establish cross-browser or screen-reader certification. Shared tokens/styles and Storybook preserve Tailwind v4 infrastructure; no new theme/appearance convention is proposed.

## API and cache

[All 19 query hook decisions](query-access-patterns.json) distinguish eleven required fixed-key source reads from parameter-driven requests, cache observers and optional projections/previews. F-001 is a catalog access-pattern mismatch; existing explicit loading/error behavior is tested and must be preserved. It is not evidence that useQuery is generally invalid React. The correction must preserve concurrent starts, module/code-split boundaries, independent query caches, error normalization, 404 meaning and the persistent filter/navigation shell.

CSV reads go through loadCsv, parseCsv and row schemas. In-flight CSV deduplication is released in finally; query caches own server data. Optional CSV 404 is absence, other failures propagate. JSON calculation requests validate body and response; readJsonResponse preserves backend messages/status and useFormatErrorMessage translates known semantic codes. POST calculation reads are not mutations. Every key has the common portfolio/data/resource prefix and normalized scopes. No authentication/logout, protected file primitive, optimistic write or mutation invalidation applies.

## Helpers, types and state

The [165-file migration ledger](migration-ledger.md) lists all category failures and actual local consumers. Seven hooks acquire data directly or through useAccountTypeHistory and belong to services. Four mapper functions perform wire-name adaptation and belong in owning API schemas. Thirteen display-dependent or visual-selection helpers require presenters/splits rather than a mechanical transformers rename. Other helpers derive strict data or domain decisions; support types/constants move with their owner.

Quality healthy/warning/critical/unavailable values are business diagnostic severities used in quality prioritization, not concrete colors. Preserve those transformers. Source labels, IDs and month/control keys are distinguished from translated human-readable text. resolveAssetName participates in normalized domain identity; its name alone does not make it a display-only formatter. Computed timestamp dates and mathematical rounding are not raw API coercion.

Schema/type inventories show numeric amounts, Date-valued domain dates, explicit nullable reasons and closed unions for operation/category/quality/validation logic. Descriptive source metadata remains tolerant. Support-contract inventory does not establish duplicated entities. Raw-prefixed types are not automatically wire DTOs when their values are already strictly validated. Pure helpers use copied arrays/toSorted and fresh accumulators; source dictionaries use Map or own-property checks. Existing regression tests cover literal-key and synthetic aggregate collisions.

Atoms hold client UI state; common filters and navigation serve multiple features. Holdings search serves look-through and the positions open-complete-holdings action. The actual useAtom sites read and write. Effects are isolated in nine intent owners, with subscription/timer cleanup and correctly scoped playback EffectEvent. Theme persistence validates storage, handles read/write/remove failures and initializes before dependent rendering. No factory is invented merely because states share a primitive type.

## Tests, i18n and quality

All 261 application/integration test files plus 28 packaged tooling files passed. No internal-module mock or skipped-test pattern was found in source test inventory. Provider/query wrappers isolate stores and caches; fetch stubs exercise real hooks/schemas. Existing tests sometimes cover adjacent related modules together. The new-file colocation requirement is prospective for phase-2 source additions; phase 1 adds no source modules and does not claim one sibling test exists for every historical constant/view.

The independent catalog usage command succeeded after audit:i18n's preliminary lint failed. Static keys, interpolation and user-facing text checks have no additional diagnostics. Technical CSS/keys/source messages and deterministic fictional fixtures are distinguished from product copy.

Typed deprecation/safety, export ordering, import sorting, callable memo, strict booleans and reviewed-suppression metadata checks ran on authored source/tests/config. Existing exceptions remain technically unreviewed. No unannotated third-party API candidate was identified; the audit does not claim exhaustive external-documentation deprecation coverage. A passing build/test/lint subset cannot prove semantic ownership or unmeasured latency.

## Supplemental frontend integration and bootstrap

On 2026-10-30, frontend sections of three repository CI/deploy/release workflows were read and fingerprinted as explicit supplemental inputs. Dashboard CI uses the versioned lint warning gate but omits Prettier (F-007); release/demo jobs use the dashboard install/build path. Python packaging and deployment authorization are outside this React source audit. The workflows were not executed remotely. index.html was read separately: storage reads are a prepaint hint rather than a second persistence writer; concrete browser metadata colors duplicate shared/theme (F-008). Four dedicated SVG assets were parsed for tags/event attributes/external references; all are static assets under the color exception.
