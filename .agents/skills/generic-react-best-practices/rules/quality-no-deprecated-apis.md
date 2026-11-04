---
title: Avoid Deprecated APIs
impact: HIGH
tags: typescript, dependencies, maintenance
---

## Avoid Deprecated APIs

**Rule:** Replace deprecated APIs with their supported alternatives before using them in project code.

Use the installed dependency versions and their official migration guidance to identify the replacement. Preserve behavior, event cleanup, accessibility, and visual styling during migration. This applies to application code, tests, and configuration, including imported components and deprecated props, not only method calls.

### Applies When

- The resolved API or overload has a JSDoc `@deprecated` annotation.
- The installed API's official documentation marks it deprecated even if its types do not yet carry the annotation.

**Incorrect:**
```typescript
const breakpoint = window.matchMedia('(min-width: 768px)')
const handleChange = (event: MediaQueryListEvent) => console.log(event.matches)

breakpoint.addListener(handleChange)
breakpoint.removeListener(handleChange)
```

**Correct:**
```typescript
const breakpoint = window.matchMedia('(min-width: 768px)')
const handleChange = (event: MediaQueryListEvent) => console.log(event.matches)

breakpoint.addEventListener('change', handleChange)
breakpoint.removeEventListener('change', handleChange)
```

### Exceptions

- Third-party declarations and generated or vendored files are not migration targets; their usage in authored project code still must follow this rule.
- A matching name alone does not establish deprecation: inspect the resolved symbol and applicable overload rather than banning unrelated APIs by name.

### References

- [typescript-eslint: no-deprecated](https://typescript-eslint.io/rules/no-deprecated/)
- [typescript-eslint: typed linting](https://typescript-eslint.io/getting-started/typed-linting/)

### Detection

Use `@typescript-eslint/no-deprecated` with type information for authored TypeScript, including tests and configuration. Do not retain a deprecated call through an allowlist or suppression. Annotated aliased symbols are detectable; manually consult the installed version's official documentation when declarations lack the annotation. A clean lint run does not prove the absence of unannotated deprecations.
