# Generic React Best Practices

An opinionated set of rules for React applications adopting React 19, TanStack Query, Jotai, Yup, react-i18next and Jest + React Testing Library, optimized for agents and LLMs. It owns architecture, composition and client-side performance guidance. Load `tailwind-design-system` only when implementing or reviewing code inside `shared/ui`, where advanced styling and design-system patterns belong. Composing shared UI primitives and using basic layout classes in domain code do not require that skill. This catalog takes precedence over conflicting companion guidance. Rules use portable examples and own shared UI contracts and associated ESLint enforcement, including review thresholds, warning policies and static-analysis limits. Identifiers prefixed with `local/` name custom ESLint rules to register in the consuming application's lint configuration. Application-specific implementation details belong in the consuming application's documentation.

The canonical catalog lives in `.agents/skills/generic-react-best-practices`. The `.claude/skills` directory is a relative symlink to `.agents/skills`, so Claude Code and Codex share the same files.

Rules with a `<category>-vercel-` id adapt selected Vercel guidance to this catalog. Their source links record provenance without requiring another React skill. Extend existing rules when they already own the decision; retain framework-specific, server-rendering and alternative state-library guidance outside this catalog.

## Structure

- `rules/` - Individual rule files (one per rule)
  - `_sections.md` - Section metadata (titles, prefixes, impacts, descriptions)
  - `_template.md` - Template for creating new rules
  - `<prefix>-<description>.md` - Individual rule files
- `scripts/build.mjs` - Zero-dependency build and validation script
- `eslint-rules/` - Packaged custom ESLint plugin, supporting analyses and generic unit tests; `index.js` exports the plugin
- `eslint.config.mjs` - `createReactConfig` consuming-project preset and the default lint configuration for the tooling itself
- `scripts/` - Packaged lint runner, profiler, architecture inventory, cycle checker, translation catalog checker and their generic regression tests
- `scripts/lint-counts.mjs` - Per-rule diagnostic counts with separate active/suppressed totals and optional JSON; see [tool usage](references/project-enforcement.md#runners-cache-and-regression-checks)
- `package.json` - Local npm package, exports, command entry points and peer dependency contract
- `vitest.config.mjs` - Generic tooling test suite, independent of a consuming application's source and setup files
- `rules/_routing.md` - Focused observable signals for business architecture and UI boundaries; the Quick Reference covers all other topics
- `references/project-enforcement.md` - Install the packaged tooling and select its ESLint/script bindings per rule; consumers configure project roots, catalogs and command aliases
- `references/audit-method.md` - Two-phase audits: review and propose, then implement authorized actions; stable verdicts, user arbitrations, opt-in ignore reviews and deterministic prevention
- `references/audit-output.md` - Required application `audit/` dossier: frozen scope, coverage, proven findings, alternatives, corrective plan, decisions and verification evidence
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
5. Add precise routing signals to `rules/_routing.md` when the rule refines a business or UI boundary. For other topics, the categorized Quick Reference is sufficient. Keep associated ESLint checks, complementary script capabilities, usage triggers and analysis limits in the owning rule alongside its examples. Implement reusable detectors and tests in this skill, maintain their bindings in `references/project-enforcement.md`, and keep application parameters in the consumer's adapter. A rule without automatic detection still requires semantic review at its own impact; a script must not introduce a parallel priority system.
6. Run the build script to regenerate `AGENTS.md`, then run its `--check` mode and the skill validator.

## Impact Levels

A rule's impact is capped by its section impact (see `rules/_sections.md`).

- `CRITICAL` - Breaks architecture boundaries, data integrity or security
- `HIGH` - Causes bugs or significant maintenance cost
- `MEDIUM-HIGH` - Strong consistency or correctness concern
- `MEDIUM` - Consistency and maintainability
- `LOW-MEDIUM` - Readability and conventions
- `LOW` - Incremental improvements
