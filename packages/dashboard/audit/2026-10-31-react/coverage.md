# Audit coverage

## File review

[Per-file ledger](evidence/file-review.json), [closed hashes](evidence/files.json) and [exact prior comparison](evidence/comparison-to-prior.json) account for all 1,358 files. Unchanged business/UI semantics explicitly retain the three previous dossiers' linked reviews; fresh inspection covers the fixture collector, tests, installed CLI, commands and CI wiring. No application runtime change or new source module is proposed.

## Rule review

[110-rule ledger](evidence/rule-review.json): 101 applicable, nine not applicable, no pending obligation. Automatic results supplement retained semantic evidence. Fresh fixture ownership review matches the previous 15-case ledger exactly ([comparison](evidence/fixture-comparison.json), [dispositions](evidence/fixture-review.json)); 70 expected outputs, 58 Partial overrides and seven scalar parameter rows also match. Typing, placement, determinism and identifiers remain distinct obligations; unchanged mocks retain their prior review. Architecture inventory and existing configured regression examples retain their bounded detector meaning.

F-001 records unavailable type/scope evidence incorrectly reported as successful inventory. F-002 records the absence of an enforceable reviewed-candidate gate. Neither invents a new application ownership violation.

## Existing decisions and ignores

All code and rule/config fingerprints used by the preceding architecture decisions match; their recorded owners, consumer scope and revisit conditions are retained. The 142 unchanged suppressions receive no technical revalidation. Lint still exposes the additional unsuppressed sharing warning; ceiling remains 143. No new exception, severity change or broadened ignore is proposed.

## Pending inspection

None in phase 1. Semantic interpretation of future new candidates remains a review task; P-002 makes missing or stale reviews fail automatically within the inventory's declared limits. Opaque builders, arbitrary computed keys and noncanonical local support types remain manual limits and are not certified by this gate.

## Phase-2 coverage delta

[Final per-file review](evidence/phase2-file-review.json), [target groups](evidence/phase2-target-groups.json), [110-rule review](evidence/phase2-rule-review.json) and [input deltas](evidence/phase2-input-deltas.json) preserve the original scope and add tsconfig.fixtures.json plus tests/fixtures/ownership-review.json. These are analysis configuration and review data, outside runtime sibling-test obligations. New generic runtime owner fixture-review.mjs has fixture-review.test.mjs; generic collector has its existing strengthened sibling plus installed CLI coverage. Actual source colocation comparison has zero introduced/missing/pending rows.

Current analysis includes the formerly omitted Storybook catalog test. Its unchanged AST/catalog responsibilities have no canonical domain fixture defaults. All 15 candidate decisions and 135 exclusion verdicts remain unchanged. One exclusion's TypeScript union display order changed when the complete project was selected; [exact delta](evidence/phase2-inventory-delta.json) records this representation-only difference. No diagnostic or candidate was hidden to retain equality. Fresh nominal/error and stale-review behavior is covered by 27 added generic cases and strengthened packaged/project CLI assertions.

Every current authorized obligation is closed. Opaque builders, dynamic fields, local support contracts and the truth of a future keep reason remain semantic review obligations when those inputs change. No fresh technical approval of the 142 existing directives is implied.
