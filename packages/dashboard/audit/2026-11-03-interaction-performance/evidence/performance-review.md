# Runtime performance evidence

Reference date: 2026-11-03, Europe/Paris. Revision `cb107d0`; unchanged source/configuration. Local Chromium headless, 1440 × 1000, no CPU throttling. Personal CSV inputs stay local and ignored.

## Production observations

Build with `npm run build`, run `npm run preview -- --host 127.0.0.1 --port 4174`. Open dashboard, wait for the Overview charts, visit Holdings then Underlying exposure, and wait for its search field. Measure `performance.now()` immediately before a disclosure/navigation button's `.click()`, await two nested `requestAnimationFrame` callbacks and record elapsed time. Wait 250 ms between observations. Select disclosure buttons only inside the section containing the underlying searchbox. Navigation uses the Overview and Holdings buttons; the underlying subview remains selected across returns.

This measures a repeatable rendering proxy, including frame scheduling. It is not INP, trusted pointer input timing, cold network latency or a cross-device performance guarantee. Modules/data were warm; initial source acquisition is excluded.

| Interaction                 | Observations, ms                  | Median, ms |
| --------------------------- | --------------------------------- | ---------: |
| Expand issuer               | 99.4, 105.8, 98.5                 |       99.4 |
| Collapse issuer             | 99.6, 115.2, 102.6                |      102.6 |
| Underlying → Overview       | 213.7, 114.3, 112.3, 137.1, 144.2 |      137.1 |
| Overview → underlying, warm | 129.3, 111.0, 108.7, 123.8, 118.6 |      118.6 |

## CPU attribution

Development-only sampling: Chromium DevTools Protocol `Profiler` at a requested 100 μs interval, begin before click, stop after rendering plus 500 ms. Aggregate sampled self time by source function/URL. Development StrictMode, JIT inlining and profiler overhead prevent direct interpretation as production per-function timing; source line references in samples are transformed Vite locations.

- Disclosure: `buildIssuerExposures` dominates, about 156.5 ms sampled self time in one profiled development expansion; source analysis identifies all-pairs canonicalization. The click-to-two-frames observation was 268.8 ms in this profiled development run.
- Warm return to underlying: same issuer construction dominates, about 149.5–151.1 ms sampled self time in two runs.
- Return to Overview: `concentrationPoint` 55.8 ms, `historicalFundExposure` 35.4 ms, `historicalSnapshotsByParent` 18.0 ms and `buildHistoricalLookThroughConcentration` 17.6 ms sampled self time in one development run. These are distinct sampled frames, not inclusive call durations.
- Position/quality scope reconstruction exists but was much smaller in the sampled navigation paths; it is not the primary priority established here.

Cold lazy navigation may paint a fallback before its destination; the two-frame proxy does not measure destination readiness in that case. Consequently cold navigation numbers from the exploratory profile are deliberately not used as production comparisons.

## Canonicalization prototype

Read unique issuer IDs from local `fund_holdings.csv` using Papa Parse, falling back from `issuer_id` to `holding_id`, and exclude identifiers matching `/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/`. There are 3,234 eligible identifiers; the current nested traversal performs 3,234² = 10,458,756 candidate checks.

Compare the current filter/reduce resolver with a prefix tree built in input order. Every node stores the longest descendant ID; retain the first on equal length. For IDs shorter than 12 characters return the original ID. For each other ID, traverse its characters and return that prefix node's longest descendant. An ancestor cannot beat the ID's own length, so the longest matching descendant preserves the original longest-prefix choice. Keep ISIN exclusions and issuer-name selection outside this ID-only probe.

Use `assert.deepEqual` on all local outputs and on `short`, `abcdefghijkl`, two equal-length descendants, a longer descendant, `constructor`, and `__proto__`. Equality passed. The synthetic cases are limited and do not replace the broader tests proposed in P-002.

| Run | Existing resolver, ms | Prefix prototype, ms |
| --- | --------------------: | -------------------: |
| 1   |                103.77 |                 4.46 |
| 2   |                100.14 |                 6.68 |
| 3   |                100.97 |                 7.64 |
| 4   |                109.02 |                 7.12 |
| 5   |                103.80 |                 8.72 |
| 6   |                 96.05 |                 3.16 |
| 7   |                 95.91 |                 6.36 |
| 8   |                 97.31 |                 2.82 |

These are Node-only resolver timings and do not measure the rest of aggregation, React rendering, memory overhead or integration. They support feasibility of an indexed algorithm; no application speedup is claimed achieved.

## Final artifact checks

The final checks cover formatting of the six dossier Markdown files and an exact comparison of all 39 source hashes against the frozen manifest. Source, tests, rules and check configuration remain unchanged; only the audit dossier is added. See verification for the completed build and 38 passing baseline tests.
