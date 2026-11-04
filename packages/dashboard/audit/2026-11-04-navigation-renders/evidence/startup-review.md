# Cold Overview startup follow-up

2026-11-04. User reports several-second initial Overview loading and confirms the local development server. This ordinary startup/configuration fix is separate from the completed warm-navigation audit; its original baseline remains preserved.

## Diagnosis

The all-source gate waits for the current/historical fund CSV query. Its historical file is about 34 MiB; parsing and schema work dominate the cold path. A Chromium worker lifecycle probe measures about seven seconds before its reply under full validation. The previous revision `ea6cd3f` is similarly slow, so the last navigation-retention change is not established as the principal cause of the multi-second cold load.

The existing documented DEBUG=false setting was not exposed by Vite's default VITE_ prefix. The command environment also sets DEBUG=release, which overrides a file value under normal process/environment precedence. Final configuration now explicitly defines only the boolean DEBUG decision for both client and worker code. No other unprefixed environment value is exposed. Missing/unrecognized settings keep validation enabled; only exact false disables schema tests. Parsing, mapping/coercion and existing error contracts remain owned by the unchanged CSV readers and schemas.

A dedicated VITE_VALIDATE_CSV option was explored, then removed by concurrent workspace edits. Those edits are preserved: the **final implementation supports DEBUG only**, keeps the existing README/env example and local .env convention, and is measured with `DEBUG=false` explicitly in the server command. An env-file-only or unprefixed define-only attempt from a shell carrying DEBUG=release did not disable validation and is excluded from the final-fix measurement.

## Local development measurements

Three fresh browser contexts per variant, Chromium headless, 1440x1000, local data, no CPU throttle. Metric: time to the Overview underlying-assets heading plus 150 ms settling. This is a startup proxy, not standardized Web Vitals. Exact samples, worker durations and final configuration/test hashes are in startup-review.json.

- Previous revision/local development: median about **9.0 seconds**.
- Final configuration/local development launched with DEBUG=false: median about **5.4 seconds**.

A multi-second cold wait remains because the 34 MiB history must still be read, parsed, cast and transferred; there is no new persistent data cache or partial financial display. First dependency optimization, an env-triggered server restart and runs overlapping heavier checks are excluded from the final pair. Development StrictMode starts/cancels an initial worker; only completed worker durations are recorded. Other concurrent holdings/overlay changes were left untouched; exact total UI timings are local observations, not controlled performance claims about those edits.

Production-preview exploration independently found about 8 seconds for the previous revision and 8.5 seconds for the current navigation revision under full validation. Those runs support the shared cold-source bottleneck but are not the user's local-server acceptance measurement.

## Verification

- `npx vitest run tests/viteDebugEnv.test.js src/shared/csv/csvData/readCsvValue.test.ts src/domains/portfolio/shared/apis/queries/portfolioSourceQueries/requestPortfolioFundHoldings.test.ts`: exit 0, three files / **23 tests**. Covers default/explicit settings, file/mode/local/process precedence, private-value exclusion, actual client/worker bundles, coercion and error behavior.
- `DEBUG=false npm run build`: exit 0. Final helper included in tsconfig.node.json and applied to the real Vite client/worker build.
- `npx eslint csvValidationDefines.ts vite.config.ts tests/viteDebugEnv.test.js`: exit 0. Earlier global lint also passed with the one existing reviewed TanStack warning; the targeted final run covers the final concurrently adjusted helper/tests. No lint or compiler policy was weakened.
- Prettier and `git diff --check`: pass. Final own-file hashes were verified after measurement. No new application-source fixture candidate is introduced: the implementation is build tooling outside src, and financial schemas are unchanged.

Local supplementary evidence: /tmp/finance-startup-probe.mjs and corresponding JSON/logs. Temporary reference checkout and own measurement servers are removed after use. Restart the user's local server after the configuration change; if the terminal has another DEBUG value, use `DEBUG=false npm run dev` (dashboard directory) or the equivalent environment prefix with the normal launcher.
