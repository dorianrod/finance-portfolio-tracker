# Generic React Best Practices

An opinionated set of rules for React applications adopting React 19, TanStack Query, Jotai, Yup, react-i18next and Jest + React Testing Library, optimized for agents and LLMs. It owns architecture, composition and client-side performance guidance; apply it alongside `tailwind-design-system` and other relevant skills. This catalog takes precedence over conflicting companion guidance. Rules use portable examples and own shared UI contracts and associated ESLint enforcement, including review thresholds, warning policies and static-analysis limits. Identifiers prefixed with `local/` name custom ESLint rules to register in the consuming application's lint configuration. Application-specific implementation details belong in the consuming application's documentation. The `.agents/skills/generic-react-best-practices` entry is a symlink to this canonical `.claude/skills/` catalog.

Rules with a `<category>-vercel-` id adapt selected Vercel guidance to this catalog. Their source links record provenance without requiring another React skill. Extend existing rules when they already own the decision; retain framework-specific, server-rendering and alternative state-library guidance outside this catalog.

## Structure

- `rules/` - Individual rule files (one per rule)
  - `_sections.md` - Section metadata (titles, prefixes, impacts, descriptions)
  - `_template.md` - Template for creating new rules
  - `<prefix>-<description>.md` - Individual rule files
- `scripts/build.mjs` - Zero-dependency build and validation script
- `rules/_routing.md` - Focused observable signals for business architecture and UI boundaries; the Quick Reference covers all other topics
- `references/project-enforcement.md` - Minimal note; all conventions and ESLint requirements live in the rules
- `agents/openai.yaml` - Discovery metadata and invocation prompt
- `metadata.json` - Document metadata (version, title, abstract, skills this one may reference)
- `SKILL.md` - Skill entry point (sections table and Quick Reference)
- __`AGENTS.md`__ - Compiled output (generated, never edit by hand)

## Build and Validate

From the repository root:

```bash
# Validate rule files and regenerate AGENTS.md
node .agents/skills/generic-react-best-practices/scripts/build.mjs

# Validate only, and fail if AGENTS.md is outdated (use before committing)
node .agents/skills/generic-react-best-practices/scripts/build.mjs --check
```

The validation checks:

- frontmatter fields (`title`, `impact`, `tags`) and impact levels
- the filename prefix matches a section in `_sections.md`
- the `## <title>` heading matches the frontmatter title
- presence of **Incorrect** and **Correct** examples and balanced code fences
- every `See also: <skill> → <rule-id>` points to an existing rule of an allowed skill
- a rule's impact never exceeds its section impact, and the `**Impact: …**` body line matches the frontmatter
- backticked mentions of rule ids point to existing rules
- every rule is listed in the `SKILL.md` Quick Reference (and nothing else is), in the same order as `AGENTS.md` (section, then impact, then title)
- portability guards: declared companion skills and cross-skill links, no `Reference:` line and no recognized host-repository references; manual review still checks semantic portability
- in `--check` mode, `AGENTS.md` is up to date

The compiler also rebases relative rule links for `AGENTS.md`, so the source rules and compiled guide both link to the same files.

## Creating a New Rule

1. State the observable pattern, applicability and exceptions. Check existing catalog rules and companion skills for overlap; extend the owning rule instead of duplicating it. Use a pointer for guidance already owned by a companion skill. Keep rules reusable across applications adopting these conventions.
2. Copy `rules/_template.md` to `rules/<prefix>-<description>.md` with one of the prefixes of `rules/_sections.md` (`arch`, `api`, `security`, `cache`, `types`, `yup`, `ui`, `state`, `helpers`, `i18n`, `test`, `quality`).
3. Use real library APIs and generic business vocabulary (`sales/orders`, `sales/invoices`, `contracts`, `projects`, `directory/contacts`…). Custom hooks, UI primitives and ESLint checks are valid when their reusable contract is defined or illustrated. Explain required tooling rather than presenting custom behavior as a library default. Keep application-specific names, paths, configuration and implementation status in the consuming application's documentation. Declare companion skills in `metadata.json` before linking to them. Do not add ticket numbers or `Reference:` lines to rules.
4. Add the rule id to the Quick Reference of `SKILL.md`, at the position given by its section, impact and title.
5. Add precise routing signals to `rules/_routing.md` when the rule refines a business or UI boundary. For other topics, the categorized Quick Reference is sufficient. Keep reusable ESLint behavior and analysis limits in the owning rule.
6. Run the build script to regenerate `AGENTS.md`, then run its `--check` mode and the skill validator.

## Impact Levels

A rule's impact is capped by its section impact (see `rules/_sections.md`).

- `CRITICAL` - Breaks architecture boundaries, data integrity or security
- `HIGH` - Causes bugs or significant maintenance cost
- `MEDIUM-HIGH` - Strong consistency or correctness concern
- `MEDIUM` - Consistency and maintainability
- `LOW-MEDIUM` - Readability and conventions
- `LOW` - Incremental improvements
