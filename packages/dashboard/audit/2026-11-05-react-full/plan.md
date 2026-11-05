# Corrective plan

## Implementation scope and authorization

The explicit audit-and-fix request authorizes both phases. Phase 1 is complete before any application/test/configuration correction. Original inventory: 1,500 authored dashboard files. A necessary prevention input delta adds the existing dashboard CI job in `../../.github/workflows/ci.yml`; its baseline hash and history were captured before proposing P-003. Dependencies/lockfile remain fixed. No architectural arbitration is needed.

## Prioritized actions

| ID    | Finding / impact          | Action and selected option                                                                                     | Status | Dependencies                   | Acceptance                                                                                      |
| ----- | ------------------------- | -------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| P-001 | F-002 / HIGH              | Preserve the nullable derived fund exposure; add sibling null/zero/nonzero regression using existing fixtures. | ready  | None                           | Baseline fails null case; final test, callers, lint/type/build and introduced-code checks pass. |
| P-002 | F-001 / MEDIUM            | Replace obsolete loading key in five detector examples; remove exactly five orphan catalog entries.            | ready  | None                           | Catalog usage exits 0; detector calibration still rejects invalid and accepts valid examples.   |
| P-003 | F-003 / MEDIUM prevention | Add existing `npm run audit:i18n` to dashboard CI.                                                             | ready  | P-002 for a passing final gate | Local execution of the exact command passes; workflow retains all existing checks.              |

Each action is authorized by the original request. Implementation: change the existing row's nullable calculation, add its sibling behavior test, update only catalog/probe references, then wire the existing CI command. No extraction/move or new runtime API is planned. Re-review actual source deltas and existing callers; any newly triggered obligation joins this plan before closure.

## User decisions

None pending. The source's existing unknown-value invariant selects P-001. P-002/P-003 are deterministic cleanup/enforcement. No existing architecture choice is replaced.

## Rule and enforcement feedback

P-001 uses declared TypeScript nullability and a direct rendering regression. A generic ban on `?? 0` is unsound because some business calculations explicitly treat absent contributions as zero. No new lint exception or severity change is planned.

P-003 promotes the existing generic catalog-usage command into application CI. No custom detector, reusable rule change or new lint warning capacity is needed. Baseline scanner failure and final success are the invalid/valid gate calibration.

The source fingerprint in the fixture review ledger must be reconciled after P-001. Inspect the current inventory and preserve the 25 existing scenario/transport decisions only after confirming their test hashes/contracts/candidates are unchanged and the new test uses owning-mock overrides. Do not generate new keep reasons simply to make the check pass.

## Follow-ups and plan changes

Existing unsupported compiler migrations (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, broad unnecessary-condition migration), alternate conforming folder choices and new performance redesigns remain outside this corrective plan. Preserve the documented worker, Activity, memo, source-batch and chart preparation choices. No new architectural decision comment is warranted for these self-explanatory corrections.

## Verified outcomes

P-001: existing `FundPositionHoldingRow` preserves null through its derived amount; the new sibling test verifies null/zero/nonzero plus the known weight. Red run: one failed (null), two passed. Green targeted run: 58 tests pass including configured detector calibration. Full final suite: 3,370 tests pass. Existing formatter and popover caller contracts remain intact.

P-002: exactly five orphan keys removed, exactly five detector strings retargeted to the live loading key. The real catalog command now exits 0 and original intended detector messages/severity assertions pass. No live product wording changed.

P-003: dashboard CI runs the existing catalog gate after formatting/lint; workflow parses and its exact command passes locally. Existing CI steps and warning ceiling remain intact. No remote CI run is claimed.

Closure: build, lint, catalog, fixtures, formatting, cycles and source-snapshot checks pass. No missing/pending introduced runtime contract; only the sibling regression was added. The fixture ledger changes only sourceSha256 after comparing all 25 unchanged candidate identities, reviewed test hashes and contracts/compiler inputs; see evidence/fixture-refresh-review.json. No new ESLint rule, suppression, compiler relaxation or architecture comment was needed.
