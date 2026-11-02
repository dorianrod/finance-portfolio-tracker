# Missed fixture ownership: causes and prevention

## What was missed

One MEDIUM `test-mock-data` family remained after the preceding correction: complete sample defaults in tests rather than owning mocks. The original diagnosis listed 16 overlapping source references in 12 files. Current implementation also found two equivalent transformer inputs inside assertions, bringing the reviewed correction to 18 references in 14 test files. Parent/nested references are not independent defects. Production behavior was not shown to be incorrect.

## Why the previous checks missed it

1. **Bounded ESLint coverage.** `test-fixture-contract` deliberately rejects unsafe casts, nondeterministic mock values and recognizable functions with explicit domain return types and a direct returned defaults object. Plain variable initializers, inferred builders and generated rows do not meet that factory shape. No existing preset/configuration promised complete placement detection. Typed values and fixed dates therefore passed correctly without proving where they belonged.
2. **Incomplete audit enumeration.** The previous isolated inventory required `type.flags & TypeFlags.Object`. An intersection's flag is `Intersection`, so `RawIsinData`, `CumulativeConcentrationPoint` and `WealthDriverPoint` were omitted. Its inferred structural search also required at least four matching fields, missing two-field filter defaults, two-field allocation points and three-field savings histories.
3. **Overbroad assertion exclusion.** Searching ancestors for `expect`/matchers hid input records in `expect(transformer(record))` as if they were expected output. The extra missing-ISIN row and empty allocation input demonstrate this distinction. A named input can be used both in a business call and an assertion; shorthand `{sample}` references must count as input uses too.
4. **Semantic audit closure was insufficient.** The prior review treated a partial inventory plus passing typing/determinism/factory checks as enough placement evidence. That was an audit error: the unchanged rule explicitly makes ownership a separate obligation. Tests do not inspect their own folder ownership, and TypeScript does not infer business ownership from paths. Neither could make that missing review fail automatically.

Original source/contracts, the previous verdict and the phase-1 metrics remain preserved. This is a missed family under an existing requirement, not a newly invented rule or a source regression.

## What now detects these forms

The portable `react-best-practices-fixtures` command, exposed locally as `npm run --silent audit:fixtures`, uses the consuming TypeScript project. It enumerates object/intersection/union/mapped/interface contracts, imported aliases, small records, variables and generated row expressions without a minimum field count. Composed contextual inputs are considered without rejecting valid extra fields against either constituent. Input calls inside assertions and shorthand references remain visible.

Expected assertion outputs, resolved aliases, built-in Partial overrides, owning-mock calls, parametrized rows and recognized Yup validation input are explicitly distinguished. A local type merely named Partial does not receive the built-in utility's exclusion. Missing projects, missing/non-directory/out-of-scope sources and syntax-invalid tests fail rather than yielding a misleading clean inventory.

The owning rule and tool binding now require this inventory for fixture-ownership audits. Existing ESLint rules remain at the same severity. No exception or warning budget was widened. The command outputs review candidates, not automatic ownership verdicts: opaque raw transport, explicit action/policy arguments and scalar scenario parameters need semantic interpretation.

## Evidence that it addresses the actual omission

- [Historical replay](evidence/phase2-fixture-replay-summary.json) runs the installed new collector on the frozen Git revision and the current tree: 33 baseline candidates, **all 18 confirmed references reproduced**, zero known missed references. The corrected tree has 15 remaining candidates; [every one is retained with a concrete reason](evidence/phase2-fixture-review.json).
- [Current exclusions](evidence/phase2-exclusion-review.json) account for 70 expected outputs, 58 typed mock overrides and seven parametrized scalar rows. Their distinct responsibilities are not converted into violations solely by assignability.
- The generic suite contains 31 new collector tests plus a packaged CLI symlink test. It uses unrelated rental/shipping vocabulary, exercises valid neighbors, aliases/shadowing, unions/intersections, generated rows, small records, actual-vs-expected inputs and unavailable/invalid analysis. These tests do not depend on ignored dossier files.
- `tests/eslint/fixture-candidates.integration.test.mjs` invokes the installed CLI with the actual dashboard configuration, checks content fingerprints, validates corrected sample owners, and preserves valid Partial/raw-transport behavior.
- [Sixteen exact input comparisons](evidence/phase2-fixture-input-equivalence.json) cover every migrated scenario, including monthly sequence values and shared allocation row references. The real application assertions remain unchanged.

## Remaining limits

Static assignability cannot decide the meaning of every raw response, action parameter or fixture profile. Arbitrary dynamic/opaque builders, noncanonical local contracts, computed keys and partial spreads remain documented manual obligations. A successful inventory or zero candidates does not certify ownership, unique identifiers or complete determinism. The current 15 candidates are reviewed; these limits do not represent unexamined current candidates or pending user decisions.
