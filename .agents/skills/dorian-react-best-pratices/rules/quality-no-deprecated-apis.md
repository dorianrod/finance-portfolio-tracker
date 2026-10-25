---
title: Avoid Deprecated APIs
summary: Replace deprecated APIs with their supported alternatives before using them in project code.
impact: HIGH
tags:
  - typescript
  - dependencies
  - maintenance
patterns:
  - A method, function, component, prop, type, or other API is marked with @deprecated in its declaration or official documentation.
  - The request asks to detect, prohibit, or migrate deprecated API usage.
---

## Avoid Deprecated APIs

**Rule:** Replace deprecated APIs with their supported alternatives before using them in project code.

Use the installed dependency versions and their official migration guidance to identify the replacement. Preserve behavior, event cleanup, accessibility, and visual styling during migration. This applies to application code, tests, and configuration, including imported components and deprecated props, not only method calls.

### Applies When

- The resolved API or overload has a JSDoc `@deprecated` annotation.
- The installed API's official documentation marks it deprecated even if its types do not yet carry the annotation.

### Incorrect

```typescript
const breakpoint = window.matchMedia('(min-width: 768px)')
const handleChange = (event: MediaQueryListEvent) => console.log(event.matches)

breakpoint.addListener(handleChange)
breakpoint.removeListener(handleChange)
```

### Correct

```typescript
const breakpoint = window.matchMedia('(min-width: 768px)')
const handleChange = (event: MediaQueryListEvent) => console.log(event.matches)

breakpoint.addEventListener('change', handleChange)
breakpoint.removeEventListener('change', handleChange)
```

### Enforcement

Enable `@typescript-eslint/no-deprecated` at error level with type information for every checked TypeScript file, including TSX, tests, and configuration. In this dashboard, ESLint uses `parserOptions.projectService` and the application and tooling TSConfigs. Do not add an allowlist or suppress the rule to retain a deprecated call.

The rule detects annotated symbols, including aliased imports. Manually review official documentation when a dependency has incomplete types; a clean lint run cannot detect an undocumented or unannotated deprecation.

### Exceptions

- Third-party declarations and generated or vendored files are not migration targets; their usage in authored project code still must follow this rule.
- A matching name alone does not establish deprecation: inspect the resolved symbol and applicable overload rather than banning unrelated APIs by name.

### References

- [typescript-eslint: no-deprecated](https://typescript-eslint.io/rules/no-deprecated/)
- [typescript-eslint: typed linting](https://typescript-eslint.io/getting-started/typed-linting/)
