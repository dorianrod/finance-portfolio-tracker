# Sections

This file defines rule categories, their order, and their filename prefixes.

When adding the first rule, create only the category needed for it. Use a short, stable prefix and document the category's scope precisely enough to prevent unrelated rules from being routed there.

| Order | Category | Prefix | Scope |
| --- | --- | --- | --- |
| 1 | Styling Boundaries | `styling-` | Keep feature and domain components decoupled from raw visual values and design-token implementation. |
| 2 | Component Composition | `composition-` | Require nested children and compound components for caller-supplied UI structure instead of content props. |
| 3 | Component Logic | `architecture-` | Keep compound derivations in explicitly owned helpers, display fallbacks in existing formatters, and components focused on hooks and rendering. |
| 4 | API Maintenance | `quality-` | Keep authored code on supported APIs and prevent deprecated dependency or platform API usage. |
