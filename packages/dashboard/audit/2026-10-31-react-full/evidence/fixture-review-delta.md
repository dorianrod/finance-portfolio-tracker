# Current fixture review

E25 analyzed the final source after sorting/formatting: 245 test files, 75 canonical contracts, 15 candidates and 136 exclusions. All 15 candidate objects, consumers, locations and reviewed test hashes are identical to E06; each original explicit scenario/action/policy or raw transport reason remains valid. No candidate was bulk-approved or assigned a generated reason.

The source delta adds two chart preparation features, two amount aggregators and the pure data-quality assessment plus their five tests; it updates typed prepared totals and explanatory absence comments. It does not change any candidate API request/response or test scenario meaning. The additional excluded record is the explicit Partial<RawIsinData> override passed to the existing owning rawData mock for the multi-dimension assessment test; it is deliberately one case's weights rather than a maintained fixture default. Other new samples use the existing owning typed factories, and expected records remain assertion output.

After this semantic review, only analysis.sourceSha256 was refreshed in the versioned fixture ledger. The 15 review decisions, their rationale and individual test fingerprints remain unchanged. This metadata refresh is not an ESLint suppression or an expansion of excluded source. E34 must verify the resulting ledger against the same current inputs.
