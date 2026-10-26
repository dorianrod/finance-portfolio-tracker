# Sections

This file defines rule categories, their order, and their filename prefixes.

When adding the first rule, create only the category needed for it. Use a short, stable prefix and document the category's scope precisely enough to prevent unrelated rules from being routed there.

| Order | Category | Prefix | Scope |
| --- | --- | --- | --- |
| 1 | Styling Boundaries | `styling-` | Centralize appearance in shared UI primitives, allow only layout (including padding) elsewhere, and keep concrete colors behind semantic theme tokens. |
| 2 | Component Composition | `composition-` | Require nested children and compound components for caller-supplied UI structure instead of content props. |
| 3 | Business Architecture and Component Logic | `architecture-` | Define business capability boundaries, feature hierarchy and complete ownership; keep shared UI agnostic, calculations in owned helpers, display fallbacks in formatters, accessibility in shared UI, and components focused on hooks and rendering. |
| 4 | Code Quality and API Maintenance | `quality-` | Keep one public value per production file, place public callables before implementation details, and prevent deprecated dependency or platform API usage. |
