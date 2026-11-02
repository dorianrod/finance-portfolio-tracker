# Audit coverage

## File review

All 1351 authored/support targets have a row in [file-review.json](evidence/file-review.json), with project-relative path, content hash, rule group, inspection evidence, linked findings and status. The closed source manifest is [files.json](evidence/files.json). Named eligible targets are in [target-groups.json](evidence/target-groups.json).

Unchanged previous review is retained explicitly after exact content/contract/configuration comparison; it is not presented as a new line-by-line read. [Semantic review](evidence/semantic-review.md) describes fresh traces and limits. F-001 supersedes the prior clean fixture-placement conclusion. All 57 current complete-shape candidates have individual reasons in [fixture-review.json](evidence/fixture-review.json); the composed-input supplement has [five explicit dispositions](evidence/intersection-input-review.json). The [16 location references](evidence/fixture-locations.json) overlap for outer/nested data and are one violation family, not 16 independent defects.

## Rule review

The [machine-readable rule ledger](evidence/rule-review.json) retains actual impact, eligible group, configured detectors, prior requirement-specific semantic evidence, current checks, limits and findings for each rule. The table below summarizes current disposition. Every selected rule is included; not-applicable reasons and analysis limits remain explicit in the ledger.

| Rule | Actual impact | Eligible targets | Current evidence / outcome | Status |
| --- | --- | --- | --- | --- |
| `arch-component-roles` | CRITICAL | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `arch-domain-first-layout` | CRITICAL | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `arch-transverse-only-imports` | CRITICAL | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `arch-shared-no-domain-knowledge` | CRITICAL | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `arch-feature-slice-layout` | CRITICAL | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `arch-no-prop-drilling` | CRITICAL | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `arch-decompose-hook-heavy-components` | HIGH | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `arch-business-capability-boundaries` | HIGH | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `arch-feature-flags` | HIGH | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `arch-isolate-effects-in-hooks` | HIGH | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `arch-feature-hierarchy` | HIGH | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `arch-component-module-boundaries` | HIGH | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `arch-thin-components` | HIGH | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `arch-no-visual-logic-below-page` | HIGH | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `arch-stores-no-index` | HIGH | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `arch-component-complexity` | HIGH | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `arch-helpers-vs-services` | HIGH | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `arch-subdomain-decision` | MEDIUM | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `api-use-transformation` | CRITICAL | `apis` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `api-wrap-in-domain-hooks` | CRITICAL | `apis` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `api-central-url-constants` | HIGH | `apis` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `api-mutation-three-types` | HIGH | `apis` | No triggering capability; reason in retained requirement-specific evidence | not applicable |
| `api-error-message-helper` | HIGH | `apis` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `api-suspense-error-boundary` | HIGH | `apis` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `api-query-hook-choice` | HIGH | `apis` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `api-return-result-as-is` | HIGH | `apis` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `api-vercel-parallel-work` | HIGH | `apis` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `api-typed-entity-generic` | HIGH | `apis` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `api-optimistic-update` | MEDIUM | `apis` | No triggering capability; reason in retained requirement-specific evidence | not applicable |
| `api-void-mutation` | MEDIUM | `apis` | No triggering capability; reason in retained requirement-specific evidence | not applicable |
| `api-business-destructuring` | LOW-MEDIUM | `apis` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `api-naming` | LOW-MEDIUM | `apis` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `security-clear-cache-on-logout` | CRITICAL | `production` | No triggering capability; reason in retained requirement-specific evidence | not applicable |
| `security-window-open-noopener` | HIGH | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `security-authorized-file-access` | HIGH | `production` | No triggering capability; reason in retained requirement-specific evidence | not applicable |
| `cache-invalidate-exactly` | HIGH | `apis` | No triggering capability; reason in retained requirement-specific evidence | not applicable |
| `cache-one-key-convention` | HIGH | `apis` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `types-consume-entity` | HIGH | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `types-explicit-nullability` | HIGH | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `types-entity-vs-response` | HIGH | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `types-closed-values-not-string` | HIGH | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `types-dates-as-date` | HIGH | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `types-literal-unions-no-enum` | HIGH | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `types-compose-transverse` | MEDIUM | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `types-file-per-entity` | MEDIUM | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `types-amounts-as-number` | MEDIUM | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `types-no-any-or-wide` | LOW-MEDIUM | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `types-no-dead-record-fallback` | LOW-MEDIUM | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `yup-no-oneof-on-display-enums` | HIGH | `schemas` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `yup-last-coercion-barrier` | HIGH | `schemas` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `yup-no-cast-bypass` | HIGH | `schemas` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `yup-tolerant-response-schema` | HIGH | `schemas` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `yup-form-schema-hook` | MEDIUM | `schemas` | No triggering capability; reason in retained requirement-specific evidence | not applicable |
| `yup-module-level-schemas` | LOW-MEDIUM | `schemas` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `ui-centralize-accessibility` | HIGH | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `ui-delegate-mapped-jsx` | HIGH | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `ui-no-classname-on-shared-ui` | HIGH | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `ui-semantic-colors` | HIGH | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `ui-compound-slots-direct-children` | HIGH | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `ui-dialog-controlled` | HIGH | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `ui-vercel-lazy-loading` | HIGH | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `ui-name-compound-render-conditions` | HIGH | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `ui-no-nested-form` | HIGH | `components` | No triggering capability; reason in retained requirement-specific evidence | not applicable |
| `ui-required-children` | HIGH | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `ui-form-wraps-dialog` | HIGH | `components` | No triggering capability; reason in retained requirement-specific evidence | not applicable |
| `ui-vercel-offscreen-content` | MEDIUM-HIGH | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `ui-no-adhoc-styling` | MEDIUM-HIGH | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `ui-accessible-names` | MEDIUM | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `ui-vercel-responsive-rendering` | MEDIUM | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `ui-vercel-explicit-variants` | MEDIUM | `components` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `state-module-level-atoms` | MEDIUM-HIGH | `stores` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `state-server-state-in-react-query` | MEDIUM-HIGH | `stores` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `state-domain-vs-page-location` | MEDIUM-HIGH | `stores` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `state-prefer-factories` | MEDIUM-HIGH | `stores` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `state-derived-atoms` | MEDIUM | `stores` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `state-atom-with-storage` | MEDIUM | `stores` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `state-explicit-types-defaults` | MEDIUM | `stores` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `state-vercel-functional-updates` | MEDIUM | `stores` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `state-atom-naming` | LOW-MEDIUM | `stores` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `state-hook-variants` | LOW | `stores` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `helpers-formatter-hooks` | MEDIUM-HIGH | `helpers` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `helpers-business-rules-pure` | MEDIUM-HIGH | `helpers` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `helpers-no-context-params` | MEDIUM-HIGH | `helpers` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `helpers-vercel-immutable-collections` | MEDIUM-HIGH | `helpers` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `helpers-categories` | MEDIUM-HIGH | `helpers` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `helpers-vercel-indexed-lookups` | MEDIUM | `helpers` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `i18n-interpolation` | MEDIUM | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `i18n-no-default-value` | MEDIUM | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `i18n-no-hardcoded-strings` | MEDIUM | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `i18n-static-keys` | MEDIUM | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `test-behavior-not-implementation` | MEDIUM | `tests` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `test-mock-data` | MEDIUM | `tests` | F-001; full fixture definition/ownership review + typed/clock lint; 12 test files | automatically checked; manually reviewed |
| `test-colocated-tests` | MEDIUM | `tests` | Previous seven sibling corrections retained; current provenance comparison has zero introduced/missing/pending owners; fresh behavior tests | manually reviewed |
| `test-jotai-provider-isolation` | MEDIUM | `tests` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `test-mock-network-not-internals` | MEDIUM | `tests` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `test-semantic-queries` | MEDIUM | `tests` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `test-renderhook` | MEDIUM | `tests` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `quality-no-deprecated-apis` | HIGH | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `quality-eslint-warning-budget` | HIGH | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `quality-eslint-disable-scoped` | HIGH | `production` | Metadata/unused checks active; 142 existing directives not technically revalidated | automatically checked; manually reviewed |
| `quality-single-public-export` | MEDIUM | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `quality-no-hook-factory` | MEDIUM | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `quality-no-noop-link` | MEDIUM | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `quality-public-api-first` | MEDIUM | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `quality-vercel-ref-as-prop` | MEDIUM | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `quality-usecallback-for-functions` | MEDIUM | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `quality-english-only` | MEDIUM | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `quality-formatting-and-sorting` | LOW | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | automatically checked; manually reviewed |
| `quality-jsdoc-minimal` | LOW | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |
| `quality-no-nested-ternary` | LOW | `production` | Exact unchanged inputs + retained requirement-specific review; fresh applicable baseline checks | manually reviewed |

## Existing decisions and ignores

All [eight architecture comments](evidence/decisions.json), [94 feature-boundary decisions](evidence/feature-boundaries.json) and [43 architecture candidates](evidence/architecture-review.json) retain their supported production choices. [Candidate comparison](evidence/architecture-comparison.json) and source hashes show no relevant input change. Their previous source/caller reasoning remains the evidence; fresh source/cache/UI traces and current tests supplement it. F-001 concerns test sample ownership and does not reopen those runtime structures.

All [142 directives](evidence/exceptions.json) remain **existing ignore not revalidated**. Full lint retains metadata validation, unused-disable checking and tracking; it does not renew technical approval. No new or modified exception was introduced. The existing sharing-review warning is unchanged. Configured exclusions retain their prior limits.

## Pending inspection

None in the declared catalog scope. All current candidates are dispositioned. At phase 1, optional prevention P-002 was a proposal; its authorized implementation is verified in the delta below. No performance timing, cross-browser or screen-reader certification, Python behavior, live endpoint availability or remote CI run is claimed.

## Implementation delta and current obligations (2026-10-31)

The original phase-1 rows above preserve the diagnosis, including F-001. Current [1358-file review](evidence/phase2-file-review.json) and [input deltas](evidence/phase2-input-deltas.json) account for the six introduced fixture owners and one application integration test. [New-owner review](evidence/phase2-introduced-owner-review.json) distinguishes app runtime obligations from fixtures/tooling: the app colocation check has six fixture-only additions and zero missing/pending; the new generic runtime collector has its own sibling suite, CLI regression and real consumer integration.

Current fixture typing and determinism pass their unchanged configured checks; ownership is established separately by migration review, [16 exact input comparisons](evidence/phase2-fixture-input-equivalence.json), [all 15 residual candidate dispositions](evidence/phase2-fixture-review.json) and [135 supported exclusion dispositions](evidence/phase2-exclusion-review.json). Historical replay detects 18/18 confirmed references, including the two additional F-001 input fixtures hidden inside assertions. No new runtime feature, schema, store or visual API changes applicability for other catalog rules.

The existing test-mock-data contract gains a documented reusable inventory; the substantive ownership requirement and MEDIUM impact remain unchanged. The generic script's supported syntax is regression-tested with unrelated vocabulary, aliases/shadowing, valid neighbors and unavailable/invalid inputs. No detector purity/ownership claim is inferred from zero candidates or a green exit. Existing 142 directives and eight architecture comments remain unchanged and not technically revalidated. All required implementation gates pass; no semantic candidate, user arbitration or implementation obligation remains pending.
