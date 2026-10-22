# Generic React Best Practices

An opinionated set of rules for any React front (React 19, TanStack Query, Jotai, Yup, react-i18next, Jest + React Testing Library), optimized for agents and LLMs. It follows the layout of `vercel-react-best-practices` and is meant to be applied **on top of it**: Vercel covers generic React and performance advice, this skill holds our own conventions. Rules never reference custom code of a given repository.

## Structure

- `rules/` - Individual rule files (one per rule)
  - `_sections.md` - Section metadata (titles, prefixes, impacts, descriptions)
  - `_template.md` - Template for creating new rules
  - `<prefix>-<description>.md` - Individual rule files
- `scripts/build.mjs` - Zero-dependency build and validation script
- `metadata.json` - Document metadata (version, title, abstract, skills this one may reference)
- `SKILL.md` - Skill entry point (sections table and Quick Reference)
- __`AGENTS.md`__ - Compiled output (generated, never edit by hand)

## Build and Validate

From the repository root:

```bash
# Validate rule files and regenerate AGENTS.md
node .github/skills/generic-react-best-practices/scripts/build.mjs

# Validate only, and fail if AGENTS.md is outdated (use before committing)
node .github/skills/generic-react-best-practices/scripts/build.mjs --check
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
- portability: no reference to a skill other than the allowed ones, no `Reference:` line, no custom code, repository path or tooling of a host repository
- in `--check` mode, `AGENTS.md` is up to date

## Creating a New Rule

1. Check that the rule is **not** already covered by `vercel-react-best-practices` (if it is, add at most a `See also` pointer) and that it is **not** specific to an admin app.
2. Copy `rules/_template.md` to `rules/<prefix>-<description>.md` with one of the prefixes of `rules/_sections.md` (`arch`, `api`, `security`, `cache`, `types`, `yup`, `ui`, `state`, `helpers`, `i18n`, `test`, `quality`).
3. Write it with framework APIs only (React, TanStack Query, Jotai, Yup, react-i18next, Radix, Jest, RTL…) and generic business vocabulary (`sales/orders`, `sales/invoices`, `contracts`, `projects`, `directory/contacts`…). No custom shared hook or component of a repository, no ticket number, no link to another skill (only `vercel-react-best-practices`), no `Reference:` line.
4. Add the rule id to the Quick Reference of `SKILL.md`, at the position given by its section, impact and title.
5. Run the build script to regenerate `AGENTS.md`.

## Impact Levels

A rule's impact is capped by its section impact (see `rules/_sections.md`).

- `CRITICAL` - Breaks architecture boundaries, data integrity or security
- `HIGH` - Causes bugs or significant maintenance cost
- `MEDIUM-HIGH` - Strong consistency or correctness concern
- `MEDIUM` - Consistency and maintainability
- `LOW-MEDIUM` - Readability and conventions
- `LOW` - Incremental improvements
