# Audit coverage

## File review

The [frozen manifest](evidence/source-manifest.json) contains 1,369 entries:
1,368 authored frontend files/assets/configuration and one explicitly inapplicable
generated `.ruff_cache/.gitignore`. The preceding cache README was excluded.
[Current file review](evidence/file-review.json) names every target, rule group,
evidence, finding and status. A formatting-only supplement accounts for 79
historical audit records; [their hashes](evidence/format-target-manifest.json)
preserve the original state. No historical semantic inventory is reopened.

[Comparison](evidence/comparison-review.json) proves that all 1,364 files common
with the preceding final source inventory are byte-identical, as are all 110
rule contracts. Its final per-file review/delta is retained by explicit file key,
with fresh applicable lint/compiler/tests/builds and this audit's semantic delta.
This is full-scope incremental revalidation, not a claim to reread every unchanged
file. Static PNG/SVG assets have no executable React obligations. `.gitignore`
was freshly read with Git history; the cache metadata is explicitly not authored
React code. Relevant CI inputs are separately hashed in contracts-and-config.

The [current semantic review](evidence/semantic-review.md) identifies responsibility,
API/schema/cache/security, state, helper, UI/accessibility, translation and testing
obligations and remaining detector limits. The [50-presenter review](evidence/presenter-review.json)
provides file-specific dispositions. Six calculation owners and their view/adapter
chains expose F-001 in ten files; 79 formatting targets expose F-002. These
supersede only the corresponding earlier clean conclusions. No source was edited.

## Rule review

[Machine-readable rule review](evidence/rule-review.json) records all 110 actual
impacts, eligibility groups, retained source rows, current findings, applicability
and limits. [Explicit target lists](evidence/eligible-targets-review.json) avoid
relying on directory names alone. The rows below link their distinct retained
obligations with current semantic evidence and checks. All 99 applicable rules
are accounted for, with 11 capability/measurement-dependent non-applicabilities;
no pending inspection is represented as compliance. Existing bypasses remain
outside technical revalidation, even for otherwise checked rules.

| Rule                                   | Actual impact | Eligible targets and evidence                                                                         | Status/findings                                                                                                                     |
| -------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `api-business-destructuring`           | LOW-MEDIUM    | `api` in explicit target inventory; prior coverage row 13; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `api-central-url-constants`            | HIGH          | `api` in explicit target inventory; prior coverage row 14; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `api-error-message-helper`             | HIGH          | `api` in explicit target inventory; prior coverage row 15; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `api-mutation-three-types`             | HIGH          | `api` in explicit target inventory; prior coverage row 16; semantic-review and verification           | not applicable: No write-mutation hooks/endpoints.                                                                                  |
| `api-naming`                           | LOW-MEDIUM    | `api` in explicit target inventory; prior coverage row 17; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `api-optimistic-update`                | MEDIUM        | `api` in explicit target inventory; prior coverage row 18; semantic-review and verification           | not applicable: No write/optimistic-update workflow.                                                                                |
| `api-query-hook-choice`                | HIGH          | `api` in explicit target inventory; prior coverage row 19; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `api-return-result-as-is`              | HIGH          | `api` in explicit target inventory; prior coverage row 20; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `api-suspense-error-boundary`          | HIGH          | `api` in explicit target inventory; prior coverage row 21; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `api-typed-entity-generic`             | HIGH          | `api` in explicit target inventory; prior coverage row 22; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `api-use-transformation`               | CRITICAL      | `api` in explicit target inventory; prior coverage row 23; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `api-vercel-parallel-work`             | HIGH          | `api` in explicit target inventory; prior coverage row 24; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `api-void-mutation`                    | MEDIUM        | `api` in explicit target inventory; prior coverage row 25; semantic-review and verification           | not applicable: No write-mutation hooks/endpoints.                                                                                  |
| `api-wrap-in-domain-hooks`             | CRITICAL      | `api` in explicit target inventory; prior coverage row 26; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `arch-business-capability-boundaries`  | HIGH          | `architecture` in explicit target inventory; prior coverage row 27; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `arch-component-complexity`            | HIGH          | `architecture` in explicit target inventory; prior coverage row 28; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `arch-component-module-boundaries`     | HIGH          | `architecture` in explicit target inventory; prior coverage row 29; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `arch-component-roles`                 | CRITICAL      | `architecture` in explicit target inventory; prior coverage row 30; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation); F-001                                           |
| `arch-decompose-hook-heavy-components` | HIGH          | `architecture` in explicit target inventory; prior coverage row 31; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `arch-domain-first-layout`             | CRITICAL      | `architecture` in explicit target inventory; prior coverage row 32; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `arch-feature-flags`                   | HIGH          | `architecture` in explicit target inventory; prior coverage row 33; semantic-review and verification  | not applicable: No experimental feature/flag capability; tabs and static-demo deployment mode are released behavior.                |
| `arch-feature-hierarchy`               | HIGH          | `architecture` in explicit target inventory; prior coverage row 34; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `arch-feature-slice-layout`            | CRITICAL      | `architecture` in explicit target inventory; prior coverage row 35; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `arch-helpers-vs-services`             | HIGH          | `architecture` in explicit target inventory; prior coverage row 36; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `arch-isolate-effects-in-hooks`        | HIGH          | `architecture` in explicit target inventory; prior coverage row 37; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `arch-no-prop-drilling`                | CRITICAL      | `architecture` in explicit target inventory; prior coverage row 38; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `arch-no-visual-logic-below-page`      | HIGH          | `architecture` in explicit target inventory; prior coverage row 39; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `arch-shared-no-domain-knowledge`      | CRITICAL      | `architecture` in explicit target inventory; prior coverage row 40; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `arch-stores-no-index`                 | HIGH          | `architecture` in explicit target inventory; prior coverage row 41; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `arch-subdomain-decision`              | MEDIUM        | `architecture` in explicit target inventory; prior coverage row 42; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `arch-thin-components`                 | HIGH          | `architecture` in explicit target inventory; prior coverage row 43; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `arch-transverse-only-imports`         | CRITICAL      | `architecture` in explicit target inventory; prior coverage row 44; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `cache-invalidate-exactly`             | HIGH          | `cache` in explicit target inventory; prior coverage row 45; semantic-review and verification         | not applicable: Read-only sources; no mutation-driven invalidation.                                                                 |
| `cache-one-key-convention`             | HIGH          | `cache` in explicit target inventory; prior coverage row 46; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `helpers-business-rules-pure`          | MEDIUM-HIGH   | `helpers` in explicit target inventory; prior coverage row 47; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `helpers-categories`                   | MEDIUM-HIGH   | `helpers` in explicit target inventory; prior coverage row 48; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation); F-001                                           |
| `helpers-formatter-hooks`              | MEDIUM-HIGH   | `helpers` in explicit target inventory; prior coverage row 49; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `helpers-no-context-params`            | MEDIUM-HIGH   | `helpers` in explicit target inventory; prior coverage row 50; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `helpers-vercel-immutable-collections` | MEDIUM-HIGH   | `helpers` in explicit target inventory; prior coverage row 51; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `helpers-vercel-indexed-lookups`       | MEDIUM        | `helpers` in explicit target inventory; prior coverage row 52; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `i18n-interpolation`                   | MEDIUM        | `i18n` in explicit target inventory; prior coverage row 53; semantic-review and verification          | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `i18n-no-default-value`                | MEDIUM        | `i18n` in explicit target inventory; prior coverage row 54; semantic-review and verification          | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `i18n-no-hardcoded-strings`            | MEDIUM        | `i18n` in explicit target inventory; prior coverage row 55; semantic-review and verification          | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `i18n-static-keys`                     | MEDIUM        | `i18n` in explicit target inventory; prior coverage row 56; semantic-review and verification          | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `quality-english-only`                 | MEDIUM        | `quality` in explicit target inventory; prior coverage row 57; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `quality-eslint-disable-scoped`        | HIGH          | `quality` in explicit target inventory; prior coverage row 58; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `quality-eslint-warning-budget`        | HIGH          | `quality` in explicit target inventory; prior coverage row 59; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `quality-formatting-and-sorting`       | LOW           | `quality` in explicit target inventory; prior coverage row 60; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation); F-002                                           |
| `quality-jsdoc-minimal`                | LOW           | `quality` in explicit target inventory; prior coverage row 61; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `quality-no-deprecated-apis`           | HIGH          | `quality` in explicit target inventory; prior coverage row 62; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `quality-no-hook-factory`              | MEDIUM        | `quality` in explicit target inventory; prior coverage row 63; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `quality-no-nested-ternary`            | LOW           | `quality` in explicit target inventory; prior coverage row 64; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `quality-no-noop-link`                 | MEDIUM        | `quality` in explicit target inventory; prior coverage row 65; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `quality-public-api-first`             | MEDIUM        | `quality` in explicit target inventory; prior coverage row 66; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `quality-single-public-export`         | MEDIUM        | `quality` in explicit target inventory; prior coverage row 67; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `quality-usecallback-for-functions`    | MEDIUM        | `quality` in explicit target inventory; prior coverage row 68; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `quality-vercel-ref-as-prop`           | MEDIUM        | `quality` in explicit target inventory; prior coverage row 69; semantic-review and verification       | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `security-authorized-file-access`      | HIGH          | `security` in explicit target inventory; prior coverage row 70; semantic-review and verification      | not applicable: No protected bearer-file retrieval, object URLs or downloads.                                                       |
| `security-clear-cache-on-logout`       | CRITICAL      | `security` in explicit target inventory; prior coverage row 71; semantic-review and verification      | not applicable: No authentication/logout/user-identity transition.                                                                  |
| `security-window-open-noopener`        | HIGH          | `security` in explicit target inventory; prior coverage row 72; semantic-review and verification      | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `state-atom-naming`                    | LOW-MEDIUM    | `state` in explicit target inventory; prior coverage row 73; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `state-atom-with-storage`              | MEDIUM        | `state` in explicit target inventory; prior coverage row 74; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `state-derived-atoms`                  | MEDIUM        | `state` in explicit target inventory; prior coverage row 75; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `state-domain-vs-page-location`        | MEDIUM-HIGH   | `state` in explicit target inventory; prior coverage row 76; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `state-explicit-types-defaults`        | MEDIUM        | `state` in explicit target inventory; prior coverage row 77; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `state-hook-variants`                  | LOW           | `state` in explicit target inventory; prior coverage row 78; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `state-module-level-atoms`             | MEDIUM-HIGH   | `state` in explicit target inventory; prior coverage row 79; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `state-prefer-factories`               | MEDIUM-HIGH   | `state` in explicit target inventory; prior coverage row 80; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `state-server-state-in-react-query`    | MEDIUM-HIGH   | `state` in explicit target inventory; prior coverage row 81; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `state-vercel-functional-updates`      | MEDIUM        | `state` in explicit target inventory; prior coverage row 82; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `test-behavior-not-implementation`     | MEDIUM        | `tests` in explicit target inventory; prior coverage row 83; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `test-colocated-tests`                 | MEDIUM        | `tests` in explicit target inventory; prior coverage row 84; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `test-jotai-provider-isolation`        | MEDIUM        | `tests` in explicit target inventory; prior coverage row 85; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `test-mock-data`                       | MEDIUM        | `tests` in explicit target inventory; prior coverage row 86; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `test-mock-network-not-internals`      | MEDIUM        | `tests` in explicit target inventory; prior coverage row 87; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `test-renderhook`                      | MEDIUM        | `tests` in explicit target inventory; prior coverage row 88; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `test-semantic-queries`                | MEDIUM        | `tests` in explicit target inventory; prior coverage row 89; semantic-review and verification         | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `types-amounts-as-number`              | MEDIUM        | `domain-types` in explicit target inventory; prior coverage row 90; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `types-closed-values-not-string`       | HIGH          | `domain-types` in explicit target inventory; prior coverage row 91; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `types-compose-transverse`             | MEDIUM        | `domain-types` in explicit target inventory; prior coverage row 92; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `types-consume-entity`                 | HIGH          | `domain-types` in explicit target inventory; prior coverage row 93; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `types-dates-as-date`                  | HIGH          | `domain-types` in explicit target inventory; prior coverage row 94; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `types-entity-vs-response`             | HIGH          | `domain-types` in explicit target inventory; prior coverage row 95; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `types-explicit-nullability`           | HIGH          | `domain-types` in explicit target inventory; prior coverage row 96; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `types-file-per-entity`                | MEDIUM        | `domain-types` in explicit target inventory; prior coverage row 97; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `types-literal-unions-no-enum`         | HIGH          | `domain-types` in explicit target inventory; prior coverage row 98; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `types-no-any-or-wide`                 | LOW-MEDIUM    | `domain-types` in explicit target inventory; prior coverage row 99; semantic-review and verification  | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `types-no-dead-record-fallback`        | LOW-MEDIUM    | `domain-types` in explicit target inventory; prior coverage row 100; semantic-review and verification | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `ui-accessible-names`                  | MEDIUM        | `ui` in explicit target inventory; prior coverage row 101; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `ui-centralize-accessibility`          | HIGH          | `ui` in explicit target inventory; prior coverage row 102; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `ui-compound-slots-direct-children`    | HIGH          | `ui` in explicit target inventory; prior coverage row 103; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `ui-delegate-mapped-jsx`               | HIGH          | `ui` in explicit target inventory; prior coverage row 104; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `ui-dialog-controlled`                 | HIGH          | `ui` in explicit target inventory; prior coverage row 105; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `ui-form-wraps-dialog`                 | HIGH          | `ui` in explicit target inventory; prior coverage row 106; semantic-review and verification           | not applicable: No submit-form/dialog workflow.                                                                                     |
| `ui-name-compound-render-conditions`   | HIGH          | `ui` in explicit target inventory; prior coverage row 107; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `ui-no-adhoc-styling`                  | MEDIUM-HIGH   | `ui` in explicit target inventory; prior coverage row 108; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `ui-no-classname-on-shared-ui`         | HIGH          | `ui` in explicit target inventory; prior coverage row 109; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `ui-no-nested-form`                    | HIGH          | `ui` in explicit target inventory; prior coverage row 110; semantic-review and verification           | not applicable: No form elements.                                                                                                   |
| `ui-required-children`                 | HIGH          | `ui` in explicit target inventory; prior coverage row 111; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `ui-semantic-colors`                   | HIGH          | `ui` in explicit target inventory; prior coverage row 112; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `ui-vercel-explicit-variants`          | MEDIUM        | `ui` in explicit target inventory; prior coverage row 113; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `ui-vercel-lazy-loading`               | HIGH          | `ui` in explicit target inventory; prior coverage row 114; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `ui-vercel-offscreen-content`          | MEDIUM-HIGH   | `ui` in explicit target inventory; prior coverage row 115; semantic-review and verification           | not applicable: No measured costly offscreen layout/paint path establishing a containment obligation; existing virtual rows remain. |
| `ui-vercel-responsive-rendering`       | MEDIUM        | `ui` in explicit target inventory; prior coverage row 116; semantic-review and verification           | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `yup-form-schema-hook`                 | MEDIUM        | `schemas` in explicit target inventory; prior coverage row 117; semantic-review and verification      | not applicable: No translated submit/form schema.                                                                                   |
| `yup-last-coercion-barrier`            | HIGH          | `schemas` in explicit target inventory; prior coverage row 118; semantic-review and verification      | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `yup-module-level-schemas`             | LOW-MEDIUM    | `schemas` in explicit target inventory; prior coverage row 119; semantic-review and verification      | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `yup-no-cast-bypass`                   | HIGH          | `schemas` in explicit target inventory; prior coverage row 120; semantic-review and verification      | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `yup-no-oneof-on-display-enums`        | HIGH          | `schemas` in explicit target inventory; prior coverage row 121; semantic-review and verification      | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |
| `yup-tolerant-response-schema`         | HIGH          | `schemas` in explicit target inventory; prior coverage row 122; semantic-review and verification      | automatically checked + manually reviewed (retained evidence/current revalidation)                                                  |

## Existing decisions and ignores

The three newest prior scopes were selected, newest first:

- [2026-11-02-react-full](../2026-11-02-react-full/scope.md): relevant full audit.
  F-001/P-001–P-004 establish corrected domain label hooks/provider fallback
  behavior; fresh runtime regressions preserve them. Exact affected file rows
  and their linked semantic summaries answer whether old clean helper/role
  conclusions covered the newly demonstrated chains. They do not invalidate F-001.
- [2026-10-31-react-full](../2026-10-31-react-full/scope.md): relevant full audit.
  F-001/P-001 establish feature-owned chart reporting totals; F-002/P-003 establish
  pure diagnostics before visual themes; F-003/P-002 explain nullability.
  Preserve those corrections and their decisions. Current omissions are related
  remaining calculations, not a justification to reverse the corrected owners.
- [2026-10-31-react-2](../2026-10-31-react-2/scope.md): relevant fixture/formatter
  audit. F-001–F-003/P-001–P-003 establish complete type-program availability,
  nearest-call exclusion and source-fingerprint freshness; F-004/P-004 place
  month fallback inside the existing formatter. Fresh 16-candidate gate and
  application/generic tests preserve those guarantees.

No older dossier was consulted for semantic history. The formatting tool reports
older filenames without reopening their contents. Retained references are keyed
in file-review/rule-review; whole dossiers were not copied or preloaded.

Git history consulted before recommendations: 6cea357c (original composition
calculator and feature/view moves, error-controller extraction, concentration
owner); f9709dd4 (original composition helper); 34d269ec (error-controller role,
legacy mapper/category moves); fccef5f0 (original overview driver arithmetic);
b8b22712 (evolution callback typing/type imports); ab9e8b68 (coverage helper
imports); e271d108 (page-assessment extraction and concentration absence comments).
HEAD 444f8b4 and fb592299 establish the exact Git-ignore policy change causing
F-002. Relevant staged/unstaged source patches are empty. F-001 identifies the
prior classification and concrete contradictory calculation chain before proposing
any replacement. No settled conforming code decision is reversed.

All ten code-local decisions remain supported:

| Decision                                      | Current owner                                                                                                                             | Assumption checked / result                                                                     |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `comparison-period-control`                   | `src/domains/portfolio/features/overview/pages/OverviewPeriodFilter/OverviewPeriodFilter.feature.tsx`                                     | Feature owns filter action; supplied ranges and callback remain a useful view contract; retain. |
| `prepared-allocation-chart`                   | `src/domains/portfolio/features/holdings/features/positions/components/MiniDonut/MiniDonut.feature.tsx`                                   | Feature groups allocation and supplies plot/tooltip data; retain.                               |
| `prepared-asset-irr-results`                  | `src/domains/portfolio/features/performance/components/performanceContributionCard/AssetIrrView.feature.tsx`                              | Feature resolves availability/ranking before view; retain.                                      |
| `feature-source-acquisition`                  | `src/domains/portfolio/features/wealth/services/useAccountTypeHistory.ts`                                                                 | Wealth observes coordinated positions cache without shell suspension; retain.                   |
| `prepared-account-type-breakdown`             | `src/domains/portfolio/features/wealth/components/AccountTypeBreakdownChart/AccountTypeBreakdownChart.feature.tsx`                        | Raw reporting denominator remains distinct from clamped geometry; retain.                       |
| `prepared-account-type-history`               | `src/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/AccountTypeHistoryChart.feature.tsx`                            | Reporting totals prepared before visual series/tooltip mapping; retain.                         |
| `data-quality-assessment-before-presentation` | `src/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/helpers/presenters/useBuildDataQualityViewModel.ts` | Pure assessment remains separate; new severity extraction preserves it; retain.                 |
| `shared-historical-fund-response`             | `src/domains/portfolio/shared/apis/schemas/historicalFundHoldingSchema.ts`                                                                | One common validated response supplies holdings/overview/diversification; retain.               |
| `account-scope-data-and-labels`               | `src/domains/portfolio/shared/helpers/transformers/portfolioFilters/useBuildAccountFilterLabels.ts`                                       | Account identity/labels feed several capabilities through the shell; retain.                    |
| `persistent-dashboard-query-boundary`         | `src/app/DashboardSources.feature.tsx`                                                                                                    | Sibling acquisition and persistent shell cache observers remain; retain.                        |

[Decision inventory](evidence/decisions-review.json) preserves identifiers and
owners; no revisit trigger is established. Proposed new comments are in the plan.

Unrevalidated exception units: 142 existing inline suppression directives,
four global ignore patterns including the dependency default, two scoped
exclusion groups and six rule-off entries: 154. Normal lint retains unused-disable
errors, dated-metadata validation and 142 tracking warnings; one additional shared
ownership review warning makes the full total 143. These are not new approvals,
and no date, ignore, severity or budget was changed. Prettier's generated/cache
exclusions remain separately visible in `.prettierignore`.

## Pending inspection

None for phase 1. F-001/F-002 remain open proven violations with complete proposed
actions; none is a pending inspection or required arbitration. Implementation is
not requested. Runtime/assistive-technology combinations and measurement-based
performance changes beyond the existing evidence are not claimed certified.

## Phase-2 current coverage delta

The user “corrige” authorized P-001–P-005. Original phase-1 inventories, rows,
score and limitations above remain historical baseline evidence. Current
[source manifest](evidence/source-manifest-final.json),
[actual path delta](evidence/phase2-delta-review.json),
[moves/provenance](evidence/phase2-provenance-review.json) and
[introduced-owner review](evidence/introduced-owner-review.md) account for the
final source, rather than reusing N/A reasons for newly extracted code.

Six new runtime owners have meaningful siblings. Eight reviewed moves account
for all deleted paths; existing siblings move with their owners. A new derived
point type and deterministic owning fixture are separately reviewed. All 12
code-local decisions (ten retained, two added) have actual current owners and
supported assumptions. The original 43 architecture inventory candidates remain
43; new/moved helper result types are local input/output support, not hidden
independent entities. No additional feature hierarchy, API, form, authentication,
file-download, store, effect or shared-UI capability is introduced.

The explicit current obligations include component roles and private imports,
narrow component/shared ownership, one public value, pure immutable calculations,
closed source severity values, numeric money, Date preservation, nullable
threshold/share semantics, prepared-data typing, required children, formatter
ownership, typed deterministic fixtures, sibling placement and meaningful error/
edge behavior. Existing warning/suppression policy remains unchanged. These
obligations and their concrete cases are in introduced-owner-review.md; full
compiler/lint/integration/runtime checks supplement semantic review.

The invalid/valid compiler case requires a composition on every view input:
a complete raw PortfolioHistoryPoint is rejected with TS2322, while prepared
numbers and source Date compile. The new tooltip regression fails once against
the original implementation when handed the newly required prepared contract
(Total 0 rather than 100), and passes against the corrected view. Temporary
probe files were removed before the full run. Existing role/import checks now
protect explicit transformer boundaries; no heuristic business classifier was
added or new suppression justified.

The [fixture delta](evidence/fixture-review-delta.md) revalidates all 16 original
candidates and unchanged reasons, plus new factory/scenario exclusions. The
fresh gate reports no pending/stale item. Colocation reports missing=0/pending=0
with six introduced runtime owners and eight reviewed path moves. Formatting
review proves JSON equality and Markdown AST equality for all 79 exact
historical targets; their content/decisions remain unchanged.

Final check outcomes and current implementation status are in verification.md.
Unrevalidated exceptions remain 154 units/142 inline directives; full lint
still has 0 errors and 143 warnings. There is no pending semantic inspection or
required user choice. Final full tests and whole-project formatting closure are
recorded separately from the earlier diagnostic run.
