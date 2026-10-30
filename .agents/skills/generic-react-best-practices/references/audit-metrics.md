# Audit volumes and score

Every dossier reports baseline volumes and a score; implementation adds final
results without overwriting the original inputs. Use the packaged calculator,
not a hand-edited number. These are audit observations, not a universal quality
or safety certification.

## Fixed formula: weighted-rule-compliance/v1

| Actual rule impact | Weight |
| ------------------ | -----: |
| CRITICAL           |     32 |
| HIGH               |     16 |
| MEDIUM-HIGH        |      8 |
| MEDIUM             |      4 |
| LOW-MEDIUM         |      2 |
| LOW                |      1 |

`score = round(100 × (1 − W_open / W_applicable), 2)`

- W_applicable is the sum of actual impacts of selected applicable rules.
- W_open sums each rule with an open, proven violation once. Splitting, merging
  or repeating findings for the same violated rule cannot change the score.
- Not-applicable rules are excluded. Pending inspection withholds the numeric
  score rather than treating unknown coverage as a pass; an empty denominator
  also produces no score.
- Ambiguities, suggestions, prevention opportunities, tool candidates and
  historical exceptions are not invented confirmed violations. Report them
  separately. Put only actually violated rule IDs on a scored finding, excluding
  correction constraints or merely related rules.
- A resolved violation remains in baseline/resolved volumes but no longer adds
  an open penalty. Verified resolution needs actual acceptance evidence.

Weights and rounding are versioned conventions, not empirically calibrated defect
probabilities. Change the formula only under a new version. Compare results only
for comparable scope, rules, coverage and exception policy. A large number of
lower-impact instances still needs correction even if its weighted rule penalty
is small; the score does not reorder catalog priorities.

## Reported volumes and limits

Include all six impacts, including zero rows, with counts of baseline, open and
resolved confirmed violation families. A family affecting several violated rules
uses their highest actual impact once for its volume. Show affected-file counts
separately; location references or lint lines are not independent defect counts.
Keep the underlying family grouping stable and explain later regrouping/deltas.

Display the formula/version, scope, reviewed/applicable/pending rule counts and
unrevalidated exception count beside the score. A score of 100 means no remaining
proven violation in the reviewed scope; it does not approve existing ignores or
claim missing findings are impossible. Preserve source/config fingerprints and
the machine-readable input/result for each snapshot.

## Calculator input

Run `react-best-practices-audit-metrics --input <file.json>`:

```json
{
  "schemaVersion": 1,
  "scope": "example/full",
  "unreviewedExceptions": 0,
  "rules": [
    { "id": "test-mock-data", "impact": "MEDIUM", "coverage": "complete" }
  ],
  "findings": [
    {
      "id": "F-001",
      "kind": "violation",
      "status": "open",
      "ruleIds": ["test-mock-data"],
      "files": ["src/example.test.ts"]
    }
  ]
}
```

Rule coverage is complete, pending or not-applicable. Finding kinds are violation,
ambiguity, prevention-gap or suggestion; status is open or resolved. Validation
rejects duplicate IDs, unknown impacts/rules and non-applicable violated rules.
This validates arithmetic and metadata, not whether inspection was substantive.
