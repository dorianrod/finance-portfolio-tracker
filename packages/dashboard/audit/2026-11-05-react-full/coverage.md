# Audit coverage

## File review

The frozen [1,500-file manifest](evidence/baseline-files.json) retains the starting revision and hashes. The individual [file dispositions](evidence/file-dispositions.json) link applicable rule groups, automatic evidence and findings; automatic coverage is not represented as reading every source body. There are 1,008 production/support source files, 345 tests, 75 owning fixtures, 51 isolated story/support files and 21 package/support files. The prevention delta covers the existing CI dashboard job (hash in [configuration inputs](evidence/rule-contracts-and-config.json)).

All 105 feature modules have explicit [responsibility/boundary decisions](evidence/component-review.json). Their complete non-import statements and private components were read in domain batches, with relevant source/type/API/view callers examined for the noted decisions. Both state renderers were read with their union builders and exhaustive branches. Views also receive resolved dependency/composition/typed-API checking; display-specific sites, numeric fallbacks, shared primitive contracts and accessibility sequences receive targeted semantic review.

## Rule review

The [110 individual rule rows](evidence/rule-review.json) state actual impact, eligible target families, checked obligations, evidence and limits. Ten rules have an absent-capability reason; the other 100 were reviewed using configured checks plus named semantic families. No pending rule is silently counted as passed. The [frozen contracts/configuration](evidence/rule-contracts-and-config.json) preserve rule content fingerprints and actual versions. Detailed semantic conclusions and check results are retained in [semantic review](evidence/semantic-review.md) and [verification](verification.md).

The audit does not claim exhaustive functional correctness, a new production performance measurement or an approval of existing ignores. Complete catalog coverage means the eligible convention/ownership obligations were accounted for with the recorded automatic/manual boundaries.

## Existing decisions and ignores

The three most recent prior audit directory names are 2026-11-04-shared-placement (no scope/findings/plan available), 2026-11-04-personal-data (verification only; unrelated personal-data scope skipped) and 2026-11-04-navigation-renders. No older dossier was substituted.

Consulted navigation dossier: `findings.md` F-001/F-002 and Implementation outcome; `plan.md` P-001/P-002 and Implementation completion. Reused conclusion: retain the header/panel memo boundaries and the single reliability model consumer. Current source and caller review confirms their inputs/lifecycles remain intact; passing prior checks alone was not reused as proof. Its raw performance evidence was not reopened because no present question requires it.

All source `@architecture-decision` owners and identifiers are enumerated in the retained semantic review. Assumptions remain consistent with current consumers; no concrete reopening trigger was found. Correction history: row `49ff887b`, `bbded428`, `309c9f02`; catalog `91571196`, `45beef80`, `b9d6a7da`; detector examples `c800e284`; source type `5590cc7f`; CI `cbfc5844`/`f3065b04`. Staged/unstaged patches for all proposed owners were empty before corrections.

One existing line suppression in PositionsTable for `react-hooks/incompatible-library` remains **existing ignore not revalidated**. Its metadata and unused-suppression checks run normally. Existing configuration exclusions, severity reductions and compiler migration decisions are recorded without technically reapproving them. No new suppression is proposed; the ceiling remains one tracking warning.

## Pending inspection

None in phase 1. F-001/F-002 remain proven open corrections; F-003 is a prevention gap. Implementation acceptance and the introduced-test/fixture-fingerprint delta are closed by I-01 through I-11 in verification.md.

## Implementation delta

[Exact changes and hashes](evidence/implementation-review.json): one existing row calculation, five removed catalog entries, five detector-example key replacements, one new sibling behavior test, one CI gate and the reviewed fixture metadata update. No runtime extraction, move or new entity/store/API. The new test uses owning typed mocks and unconditional parametrized content assertions, with no internal mocks or shared client state. [Fixture reconciliation](evidence/fixture-refresh-review.json) preserves all 25 candidate rationales after comparing source deltas, candidate keys, contracts/compiler and reviewed test hashes. No new exception was added.
