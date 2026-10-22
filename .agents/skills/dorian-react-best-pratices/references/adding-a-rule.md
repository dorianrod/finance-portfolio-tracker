# Adding a Rule

Use this workflow only when asked to add or change a Dorian React rule. A code sample is evidence for a general pattern; it is not itself a rule.

## 1. Identify the Pattern

- State the behavior to detect in concrete terms: syntax, API usage, component shape, data flow, or a combination of these.
- Remove project-specific names and incidental details from the supplied code.
- Check existing active files in `rules/` for duplicates, overlap, or conflicts.
- Do not add a rule when the example is too ambiguous to generalize safely.

## 2. Write the Synthetic Rule

Express the rule as one short, imperative sentence. It must say what to do and remain narrower than the evidence supports.

Record separately:

- why the rule matters;
- when it applies;
- exceptions or counterexamples;
- precise routing signals that distinguish it from neighboring rules.

## 3. Choose a Section and Filename

Reuse a prefix from `rules/_sections.md` when its scope fits. Otherwise add a focused section there before adding the rule.

Name the file `<prefix>-<descriptive-slug>.md`, using lowercase kebab case. One file contains one rule. Files beginning with `_` are never active.

## 4. Create the Rule File

Copy `rules/_template.md` and replace every placeholder. Keep the example small enough that the relevant difference is obvious.

- Use `tsx` for React examples and `typescript` for framework-independent code.
- Include an incorrect example and a corrected example when code clarifies the rule.
- Change only the behavior addressed by the rule between paired examples.
- Prefer generic names over identifiers copied from the source project.
- Put lengthy background or multiple independent patterns in separate rules.

See `rules/_example.md` for a complete but non-active example.

## 5. Register Routing

Add a row to `rules/_routing.md` containing:

1. the observable pattern or request intent;
2. the section prefix;
3. a link to the individual rule file.

Use specific signals such as “a state setter reads the same state solely to compute its next value.” Avoid broad signals such as “React component” that would load unrelated rules. Add more than one row only when genuinely different patterns lead to the same rule.

Then add a one-line entry to the `Quick Reference` in `SKILL.md`. Keep the rule file as the source of truth; the index and routing table should only summarize and link to it.

## 6. Verify

- The rule is generalizable from the supplied evidence.
- The frontmatter is complete and the synthetic rule is one sentence.
- Every route points to an existing active rule file.
- Every active rule appears in both routing and the quick reference.
- The incorrect and corrected examples isolate the intended pattern.
- Exceptions prevent unsafe or over-broad application.
- The skill validator passes.

Run:

```bash
python3 <local-home>/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/dorian-react-best-pratices
```
