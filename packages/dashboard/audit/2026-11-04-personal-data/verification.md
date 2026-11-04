# Audit evidence privacy review — 2026-11-04

Reviewed all **276 tracked audit files**, the **two untracked startup-review files**, and **344 historical blob versions** across the seven audit-changing commits reachable from the baseline revision recorded in [the file-by-file evidence](evidence/privacy-review.json). Each current file has its SHA-256, byte count and individual check results. The review's own artifacts are excluded from that inventory and separately checked with the hook.

## Results

- No local portfolio asset name, ticker or ISIN matches in current files or historical versions (178 locally derived tokens).
- The additional comparison against 23 local account names finds only the generic labels `PEA` and `CTO` in synthetic fixture reviews. No distinctive private account name matches.
- No email, IBAN or private-key marker detected. ISIN-like literals in `2026-10-30-react-2/evidence/fixture-review.json` come from public source test fixtures, including generic identifiers and an Apple concentration-test holding.
- Two local home-directory paths were found in `2026-10-30-react-3/evidence/effective-Preview.view.tsx.json`. Replaced both with repository-relative paths. This retained ESLint output is now explicitly sanitized rather than a verbatim absolute-path configuration dump.
- Rewrote the 15 affected local commits on `refactor/code-practises` and `refactor/code-practises-2`, sanitizing both historical blob versions. The recorded historical inventory now identifies sanitized blobs and rewritten revisions. No affected commit is present in the currently advertised GitHub branches or tags; no remote update is needed. A private recovery archive is retained outside the repository.
- The two startup-review files contain timings, configuration explanations, relative source paths and hashes; no detected personal data. Ignored raw browser captures, scripts and logs are outside this inventory.

## Hook coverage and corrections

`core.hooksPath` is already `.githooks`. Both content hooks scan added text regardless of directory or extension, so tracked audit Markdown and JSON were already included. Audit ignore patterns control what is normally added; they do not exempt force-added files from hook checks.

The scanner now decodes JSON escapes before matching and blocks the current local home directory, even without portfolio data. A cached combined-pattern prefilter speeds up scans of large clean manifests while preserving the existing per-token matching behavior.

Both content hooks force text diffs and disable external diff/text conversions, preventing binary attributes or NUL bytes from hiding report content. Pre-push now includes initial commits and merge resolutions, and no longer ignores a failed commit enumeration for a new branch. Commit-message scanning continues to use the same scanner.

## Verification

- `packages/pipeline/.venv/bin/python -m pytest packages/pipeline/tests/unit/test_scan_personal_data.py -q`: **15 passed**. Covers escaped JSON, overlapping tokens, home paths without local data, four audit file extensions with binary attributes/NUL content, staged versus unstaged contents, root commits, merge commits and a historical leak removed by a later commit.
- Ruff on the scanner and its tests: passed.
- Pipeline Pyright: zero errors or warnings.
- Bash syntax checks and `git diff --check`: passed.
- Real pre-commit hook against a temporary Git index containing the proposed changes and both startup-review files: passed; the user's index is preserved.

This check depends on available local identifiers and the recorded file contents. It does not establish exhaustive detection of standalone financial amounts, unknown identifiers or other encodings. Home-path matching follows the current local user's directory. The affected branch histories have been rewritten and their historical audit contents rescanned.

History remediation additionally verifies every rewritten parent link, preserved commit metadata, and tree changes limited to the sanitized evidence and this review. The existing 15 hook regression tests remain green.
