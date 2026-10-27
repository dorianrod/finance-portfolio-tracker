# React audit — 2026-10-27

Scope: dashboard production code, tests, shared UI, Storybook and configured
ESLint checks, using
[`generic-react-best-practices`](../../.agents/skills/generic-react-best-practices/SKILL.md).
Shared UI changes also follow
[`tailwind-design-system`](../../.agents/skills/tailwind-design-system/SKILL.md).
The capability map in [README.md](README.md) defines the business owners.

## Corrected findings

| Finding                                                                                                        | Correction                                                                                                                                                                                                                                                                               | Rules                                                                                  |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Filter-key changes discarded the previous query result and could remove the open filter panel.                 | Account savings, passive income, filtered history and asset IRR retain previous data. Navigation and filters live outside the source loading/error region. The shell announces previous-scope results while they are being replaced.                                                     | `api-query-hook-choice`, `ui-dialog-controlled`, `ui-vercel-responsive-rendering`      |
| Reusing previous query data could label an earlier selection's IRR as current.                                 | Account history and asset IRR distinguish placeholder data from the current scope. Pending history uses the current account fallback with a loading IRR status.                                                                                                                          | `api-query-hook-choice`                                                                |
| Filter actions copied the state captured during rendering.                                                     | Partial updates use Jotai's current-value callbacks, preserving other changes.                                                                                                                                                                                                           | `state-vercel-functional-updates`                                                      |
| Filter services declared their own TanStack cache observers and repeated the dashboard key.                    | A domain API hook owns the read-only dashboard observer. Services consume its named business data.                                                                                                                                                                                       | `api-wrap-in-domain-hooks`, `api-business-destructuring`                               |
| Endpoint query hook names omitted the read intent.                                                             | Endpoint hooks, supporting folders, callers and tests use `useGet<Entity>[Aspect]Query`.                                                                                                                                                                                                 | `api-naming`                                                                           |
| The common fund query and one type module owned assessment-only reports, manifests and unresolved diagnostics. | Assessment owns those three sources, their schemas, their entity types and `useGetFundDiagnosticsQuery`. Common holdings/history/statuses keep their shared query. The shell starts both groups independently and combines their results. Each main fund entity has an owning type file. | `arch-shared-no-domain-knowledge`, `types-file-per-entity`, `api-vercel-parallel-work` |
| CSV boolean transforms silently converted malformed flags to `false`.                                          | Shared required/optional boolean schemas normalize recognized values and reject malformed flags in fund diagnostics, fund statuses and annual income/savings.                                                                                                                            | `api-use-transformation`, `yup-last-coercion-barrier`, `yup-module-level-schemas`      |
| Network, timeout and malformed-response failures exposed browser/parser diagnostics.                           | Central error presentation translates recognized transport failures and malformed data while preserving readable backend messages and HTTP statuses.                                                                                                                                     | `api-error-message-helper`, `i18n-no-hardcoded-strings`                                |
| Annual income period filtering converted numeric years through strings.                                        | Filtering consumes `Date.getUTCFullYear()` directly.                                                                                                                                                                                                                                     | `yup-last-coercion-barrier`, `types-amounts-as-number`                                 |
| `Popover.Trigger` replaced its caller's ref with its internal ref.                                             | Composed refs preserve both refs and React 19 callback cleanups without replacing the element.                                                                                                                                                                                           | `quality-vercel-ref-as-prop`, `ui-centralize-accessibility`                            |
| `Tooltip.Trigger` replaced caller click and pointer-leave actions.                                             | The primitive invokes caller actions, respects canceled activation and retains its tooltip behavior.                                                                                                                                                                                     | `ui-centralize-accessibility`, `test-behavior-not-implementation`                      |

The filter-query strategy follows the documented
[TanStack Query previous-data contract](https://tanstack.com/query/v5/docs/framework/react/guides/paginated-queries).
The shell uses concurrent non-suspending source queries and its explicit aggregate
loading/error state. This multi-source orchestration remains an application
adaptation of the catalog's Suspense-first guidance for individual screen resources.
Lazy tab modules retain their Suspense and error boundaries.

## Review coverage

| Area                 | Evidence and result                                                                                                                                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture         | Domain import directions, component roles, shared ownership and feature depth are checked by the configured local rules. Assessment-only fund contracts and source parsing now reside in assessment. See [shared ownership evidence](SHARED_OWNERSHIP_AUDIT.md). |
| APIs and cache       | Reads stay in API hooks, use the endpoint registry and domain query-key namespace, and return TanStack results. Request/response schemas remain at the API boundary. Independent source groups start in parallel.                                                |
| Security             | External links remain centralized in the HTTP(S)-only primitive with `noopener noreferrer`. The dashboard has no login/logout lifecycle or protected-file workflow.                                                                                              |
| Types and schemas    | TypeScript strict checks cover production code, tests and Storybook. Calendar dates and finite numbers continue to be validated at ingestion. Logic-driving closed values remain strict; display-only snapshot statuses remain strings.                          |
| UI and accessibility | Shared UI owns styles, semantic tokens and accessibility behavior. Regression tests exercise filter-panel lifetime, keyboard dismissal, focus, controlled scopes, ref replacement and tooltip actions.                                                           |
| Client state         | Filter writes use current-value updates. Scoped inputs preserve instance isolation. Server data remains in TanStack Query.                                                                                                                                       |
| Helpers and i18n     | Existing formatter fallbacks remain centralized. Redundant year coercion was removed. New user-facing copy uses literal catalog keys; technical network signatures are used only for classification.                                                             |
| Tests and quality    | Added regressions use real hooks/schemas and network stubs, with fresh query clients and Jotai stores. Existing custom-rule tests run with the full suite.                                                                                                       |

## Warning budget

The ceiling decreased from **161 to 155**. Six shared-ownership directives were
removed: the replaced boolean factory, the three assessment-only schemas, and the
number/text schema helpers whose sharing is now statically proven by both source
groups. No new suppression or rule exclusion was introduced.

The remaining warnings track 56 cohesive-function exceptions, 63 common-source
ownership exceptions, 35 controlled-component/presentation adapters and one
TanStack Table v8 constraint. The function-length directive is part of one of the
56 complexity exceptions. Existing unaffected exceptions retain their recorded
technical rationales; this change does not bulk-date them.

## Validation

Verified on the final code: **179 test files and 1,853 tests passed**. Production
and Storybook builds passed, including TypeScript checking. Full-project ESLint
reported **0 errors and exactly 155 reviewed-suppression warnings**. The translation
catalog check, full Prettier check and `git diff --check` passed.

Run from `packages/dashboard`:

```sh
npm test
npm run build
npm run build-storybook
npm run lint
npm run audit:i18n
npx prettier --check .
```

These checks cover the code and integration regressions. They do not establish
that every possible runtime defect or visual issue has been eliminated.
