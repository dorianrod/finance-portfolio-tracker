# Previous misses and deterministic prevention

The earlier audits are preserved. The first corrected runtime/query/schema/helper problems. The second exposed typed inline defaults. The third replayed missed intersections, small/generated rows and business inputs hidden by assertion ancestry. The latest added filesystem/test completeness and a versioned review gate. Exact hashes establish that the current failures are remaining analysis gaps, rather than a source regression or changed business requirement.

Three properties were not calibrated before closure:

1. Availability covered tests but not the canonical types defining the matching universe. An excluded, unimported domain type therefore made the known sample invisible. P-001 reconciles both input sets rather than assuming compiler success implies input completeness.
2. Nearest-call handling was tested for assertion ancestors only. Case/validation/mock exclusions continued walking across a business consumer. P-002 applies the same bounded call boundary to those families, keeping direct valid controls.
3. Freshness tests varied candidate files and non-test sources. Another analyzed test could be a real imported consumer yet was absent from every binding. P-003 fingerprints all analyzed in-source files and makes the conservative re-review cost explicit.

The process improvement is to define a property matrix across each boundary, rather than add isolated examples only for the last observed spelling: present/missing tests and contracts; direct/wrapped/shadowed supported APIs; changed candidate/other test/production/config inputs. Verify actual exit 2 for unavailable analysis, exit 1 for missing/stale review, and exit 0 for fresh valid neighbors through the installed package. Preserve the before/after reproductions and avoid equating candidate counts, a green gate or a nominal test title with exhaustive coverage.

No static structural matcher can prove business ownership, unique IDs or the semantic truth of a keep reason. Those remain explicit manual obligations; no broad automatic approval is added.

## An application violation missed by retained reviews

F-004 demonstrates a separate manual-coverage error. The first audit's formatter coverage states that nullable values and configurable fallback policies were reviewed; later audits retained those exact conclusions. The existing detector checks guards/defaults on formatter inputs, not fallbacks on formatted outputs. WealthComparisonKpi's unchanged `currentLabel || translatedText` therefore stayed green, and aggregate helper/consumer review did not inspect that missing property. Exact input equality proves that earlier evidence remains applicable; it cannot turn an originally incomplete conclusion into complete coverage.

P-004 adds result-fallback calibration to the existing check and uses the existing formatter option. Future formatter review must inventory both input guards and output fallbacks, including immutable result aliases, while preserving business/structure conditions. Keep formatter implementation contracts and consumer display policy as separate obligations.

## Explicit project root versus invoking directory

The new relocated check initially failed because it ran from the repository
root, which has no dashboard node_modules. The previous relocation evidence used
the dashboard as cwd, so compiler ambient-type lookup could accidentally succeed
there. The parser received the configuration's contents and base directory but
not its filename; TypeScript therefore fell back to host.getCurrentDirectory for
default type roots. Passing the selected filename anchors them to the project
without changing process.cwd. A portable CLI case now supplies a project-local
ambient library and invokes from an unrelated empty directory. Retain both the
failed actual relocation and the successful corrected check. This is a further
P-001 calibration dimension, not a financial-runtime defect.

## Optional follow-up

Run the existing catalog compiler with --check explicitly in CI when changing
the reusable skill. Current application tests/lint do not substitute for that
documentation-generation check. This audit also corrected equivalent generic
configuration wording that tripped its pre-existing portability guard and
regenerated AGENTS.md; the guard itself remains unchanged. This optional CI
wiring is a separate proposal, not an unfinished authorized correction above.
