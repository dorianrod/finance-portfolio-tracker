# Previous misses and deterministic prevention

The first audit corrected runtime/query/schema/helper issues. The second uncovered typed local fixture factories. The third uncovered local values, intersections, small records, generated rows and input records hidden by assertion ancestry. Its explicit root-causes.md shows why: restrictive type flags and field-count thresholds plus conflating typing/determinism with ownership. Those were missed obligations under an unchanged convention.

This audit does not overturn those fixes. All prior final source/contracts match, and the complete current fixture output matches exactly. Two remaining process/tool boundaries are now demonstrated:

1. The collector fails for missing configuration and syntax-invalid tests, but accepts unresolved imports, invalid contract types and tests omitted by tsconfig. Previous calibration exercised the first pair, not this negative matrix. Full-project typecheck happened to protect the current project, but did not validate the reusable CLI's standalone availability claim. P-001 makes this observable and fail closed.
2. Retrospective replay proves that the collector finds known historical misses; it does not require review of the next new candidate. Previous CI tests assert selected known locations, while the 15 complete semantic dispositions live in ignored evidence. P-002 persists fingerprinted decisions in versioned project data and adds an explicit CI review gate.

Implemented/proposed controls must keep three outcomes distinct: invalid/unavailable analysis (exit 2), available inventory awaiting fresh semantic decisions (exit 1 in review mode), and available reviewed inventory (exit 0). Inventory-only success continues to mean collection only. A changed input never renews an old decision automatically. Tests must exercise rejected input and a valid neighbor through the packaged CLI; a count or unrelated diagnostic is not proof.

Remaining proposals: keep a reviewed historical replay corpus in regression tests when adding an observed failure shape; preserve obligation-specific coverage rather than aggregate green commands; inspect opaque builders and local support contracts manually when their responsibilities change. Business ownership cannot be inferred universally from structural assignability, so these are explicit limits rather than a promise of exhaustive automated compliance.


The new completeness assertion found an actual previously silent omission: the Storybook catalog test is excluded from tsconfig.app.json and compiled separately. Previous inventory equality and candidate replay compared only the program's included tests; neither reconciled that list with filesystem tests. A dedicated analysis project now includes all 240 source tests, and installed integration explicitly asserts the formerly omitted file is present. Its unchanged code has no domain defaults; this does not invent a fixture defect there.
