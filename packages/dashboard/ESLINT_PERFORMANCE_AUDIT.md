# ESLint execution time

Measured on 2026-10-26 with Node 22.22.0, on this development machine.
Times vary with machine load; individual measurements are not a statistical
benchmark. No rules were disabled or downgraded for this optimization.

## Results

| Run                                | Wall time | Outcome                              |
| ---------------------------------- | --------: | ------------------------------------ |
| Initial full lint, no result cache |   30.64 s | 648 files, 0 errors, 431 warnings    |
| Full profiling after changes       |   31.02 s | 651 files, 0 errors, 409 warnings    |
| Native cache population            |   34.31 s | 651 files, 0 errors, 409 warnings    |
| Repeated lint, unchanged inputs    |    2.11 s | Same diagnostics as cache population |

Other work changed rule severities and application files during the audit,
accounting for the changed diagnostic counts. Local rule optimizations were
also checked before those edits: diagnostics were identical across all 648
original files. There is no demonstrated improvement to the full analysis time;
the main gain is about 93% on repeated checks without input changes.

A full profile attributed 6.43 s to parsing and TypeScript program setup,
and 20.39 s to rules. The most expensive rules were:

| Rule                                 |   Time |
| ------------------------------------ | -----: |
| `@typescript-eslint/no-deprecated`   | 6.86 s |
| `react-hooks/static-components`      | 5.97 s |
| `local/no-shared-ui-internal-layout` | 2.62 s |
| `local/require-children-composition` | 1.13 s |
| `local/no-shared-ui-classname`       | 0.90 s |
| `local/shared-feature-usage`         | 0.19 s |
| `local/import-boundaries`            | 0.16 s |

The first typed rule pays for shared TypeScript initialization. Likewise, the
React compiler rules share their compiler run, attributed here to
`react-hooks/static-components`. These timings do not represent independent
potential savings. See [typescript-eslint's performance guidance](https://typescript-eslint.io/troubleshooting/typed-linting/performance/).

## Retained changes

`npm run lint` uses ESLint's native content cache under
`node_modules/.cache/eslint/results.cache`. `format` and `format:check` reuse
that command. The configuration includes a SHA-256 fingerprint of all files
and directory names under `src`, `eslint-rules` and `scripts`, plus root
JavaScript, TypeScript and JSON inputs (including TSConfigs, manifests and
the dependency lockfile). Any input change invalidates all results, including
unchanged files that consume changed types or shared code. Cache files and
build outputs are excluded from the fingerprint; calculating it took about
34 ms.

This conservative invalidation is necessary because
[ESLint's own cache does not track dependencies between files](https://eslint.org/docs/latest/use/command-line-interface#--cache).
It also protects catalog checks and shared consumer counts after additions,
deletions and directory layout changes. A fresh process computes the key for
each CLI invocation. A changed input still requires a full lint; this is not an
incremental dependency analysis.

The i18n rule reads the catalog lazily, once per file that actually calls
`i18n.t`. It still reloads the catalog across files and editor lint runs.
Its measured cost fell from 0.47 s to about 0.12 s.

The shared consumer graph already uses TypeScript and a per-program cache. At
0.19 s, replacing it with another dependency analysis library would not address
the main costs. Its existing handling of aliases, type-only imports, facade
exports, production consumers and business ownership remains in place.

Two workers took 32.31 s and approximately doubled CPU time, so parallel
linting was not enabled. A larger Node semi-space and extra internal analysis
caches did not demonstrate a stable full-pass gain and were not retained.

## Reproduce

From `packages/dashboard`:

```sh
npm run lint
npm run lint
npm run lint -- --no-cache
npm run lint:profile
npm run lint:profile -- src
```

The profile command always performs an uncached analysis and prints parsing
time, rule costs, slow files and diagnostic counts. It exits unsuccessfully
when ESLint reports errors.

Targeted validation covered catalog loading, catalog edits, ownership analysis,
input additions/edits/deletions, cache hits and rechecking an unchanged file
after another input changes. The wider rule suite had 780 passing tests and
30 failures in assertions that still expected warnings after concurrent changes
promoted those rules to errors; these assertions were left to that separate work.

A subsequent concurrent refactoring expanded the workspace to 1,010 files; a
check during that transition reported 291 errors, mostly import sorting. To
validate the final changes independently, commit `5172f50` was extracted to a
temporary directory and the retained lint changes applied there. Full lint
passed with 651 files, 0 errors and 409 warnings; the cached run returned
identical diagnostics in 2.30 s. That isolated full run took 97.79 s, so its
timing is recorded separately rather than compared with the workspace baseline.
All 34 catalog and cache tests passed in both the workspace and this snapshot.
These tests are included in CI. A full check of the working tree should be
repeated once the separate refactoring is complete.
