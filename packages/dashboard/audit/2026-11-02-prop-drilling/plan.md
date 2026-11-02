# Corrective plan

- P-001 — Account selection: Compose account rows at the picker boundary; groups consume their bulk-selection inputs and children, with no forwarding of labels or row state. Status: complete; verified in verification.md. Acceptance: full lint/type checks and affected behavior tests; no retained exception.
- P-002 — Tooltip composition: Replace scoped text wrappers at affected call sites with InfoTooltip views and directly composed FilterScopeBadges features; pass scalar raw badge inputs. MetricLabel becomes a real label view accepting tooltip children. Status: complete; verified in verification.md. Acceptance: full lint/type checks and affected behavior tests; no retained exception.
- P-003 — Contribution lists: Render existing ContributionListView directly and compose its tooltip at the rankings boundary, removing the intermediate feature. Status: complete; verified in verification.md. Acceptance: full lint/type checks and affected behavior tests; no retained exception.
- P-004 — Overview card shell: Keep navigation in the shell and move its presentation-only header into a view composed by the owning metric card. Status: complete; verified in verification.md. Acceptance: full lint/type checks and affected behavior tests; no retained exception.
- P-005 — Three-year IRR: Pass raw history to the KPI and contribution card; each owns latest-value selection. Preserve availability/status behavior. Status: complete; verified in verification.md. Acceptance: full lint/type checks and affected behavior tests; no retained exception.
- P-006 — Quality KPI adapters: Call the existing compact view directly; adapters own navigation callbacks and compose live filter badges. Remove the forwarding compact feature. Status: complete; verified in verification.md. Acceptance: full lint/type checks and affected behavior tests; no retained exception.
- P-007 — Position breakdown: Read preview selection in the existing preview-owning cell and supply the existing status button view directly; remove the intermediate control. Status: complete; verified in verification.md. Acceptance: full lint/type checks and affected behavior tests; no retained exception.
- P-008 — Exception rationale: Clarify that exceptions require evidence explaining why conforming alternatives cannot satisfy the requirement; mere descriptions of current ownership are insufficient. Prefer removal and require user approval where requested. Status: complete; verified in verification.md. Acceptance: full lint/type checks and affected behavior tests; no retained exception.

No user decision pending. Preserve unrelated ignores and do not increase the warning ceiling. Lower the ceiling by the number of removed tracking warnings once final lint confirms the result.

## Implementation refinements

P-001: groups prepare checked flags, formatted labels and onToggle callbacks; AccountSelectionRows is a genuine presentation contract, removing all three forwarded feature props in both pickers.

P-002/P-004: useFilterScopeContext supplies raw data; FilterScopePresentation formats badge labels at component scope. MetricLabel and OverviewCardShell are provider-free views. Owners compose tooltip slots and retain reporting-date selection. Existing feature API remains available to unrelated callers.

P-005: latest three-year selection is in a pure selector called by the KPI and contribution feature; empty/missing latest data never reuses older returns. Existing statuses still hide stale IRR values.

P-006/P-007: quality navigation callbacks and position-preview subscriptions moved to existing business owners; forwarding features removed.

P-008: skill entry point and owning policies updated, compiled catalog regenerated. No keyword-based rationale detector added: explaining why alternatives cannot work requires technical review. Existing prop-drilling errors and unused-ignore checks remain enabled. Added meaningful sibling tests for all seven new runtime owners; fixture review records eight explicit configuration/state arguments and preserves the previous 16 decisions. The integration check now verifies complete review coverage using the actual inventory size.

## Closure

P-001–P-008 complete; all 29 source directives corrected, policy updated, checks pass. No retained exception or pending approval.
