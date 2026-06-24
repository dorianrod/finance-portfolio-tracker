# Golden regression snapshots

`tests/golden/test_main_regression.py` runs `python src/ingest_portfolio.py`
against your real data (`../../data/input/`, at the repo root, above
`packages/pipeline/`) and compares every file in `../../data/output/` against
the snapshots in `tests/golden/snapshots/`.

These snapshots are derived from personal financial data, so — like
`data/output/` itself — `tests/golden/snapshots/` is gitignored and never
committed. Each contributor (in practice: you, on this machine) regenerates
it locally before relying on the golden tests.

## Regenerating the snapshots

Run from inside `packages/pipeline/`:

```bash
.venv/bin/python src/ingest_portfolio.py
cp ../../data/output/*.csv tests/golden/snapshots/
```

Then run `pytest tests/golden` to confirm they match (they will, since you
just copied them — this just checks the test setup itself is sane).

## When to regenerate

Only when you **intend** to change the pipeline's output (e.g. a genuine
calculation fix, a new output column). If `pytest tests/golden` fails
unexpectedly after a refactor, that's a regression to investigate — not a
reason to regenerate the snapshots.
