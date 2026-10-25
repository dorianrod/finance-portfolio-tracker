# Rule Routing

Use this table to select candidate rule files from observable code patterns or an explicit review intent. Then read the selected files and confirm their applicability and exceptions.

Routing rules:

- Load only the files linked by a matching signal.
- When several distinct signals match, load every corresponding file.
- Prefer the most specific signal when routes overlap.
- A keyword alone is not a match unless its route explicitly says so.
- If nothing matches, the Dorian catalog has no applicable rule.
- Ignore files beginning with `_`; they are maintenance material.

| Observable pattern or intent | Section prefix | Rule file |
| --- | --- | --- |
| A React feature or domain component contains a literal color (`#…`, `rgb(…)`, `hsl(…)`, `oklch(…)`, or a concrete CSS color name such as `red`), including in inline styles or SVG attributes. | `styling-` | [`styling-semantic-colors.md`](styling-semantic-colors.md) |
| A React feature or domain component uses an arbitrary or palette-specific Tailwind color such as `text-[#b91c1c]`, `bg-red-500`, or `border-slate-300`. | `styling-` | [`styling-semantic-colors.md`](styling-semantic-colors.md) |
| The request asks to introduce, review, centralize, or name colors used by business UI. | `styling-` | [`styling-semantic-colors.md`](styling-semantic-colors.md) |
| A component accepts or forwards UI slots as named ReactNode/ReactElement props (title, header, actions, footer, tooltip, etc.), or callers pass JSX, a JSX-valued variable, or static render callbacks through those props. | `composition-` | [`composition-required-children.md`](composition-required-children.md) |
| JSX supplies an explicit children attribute, spreads an object containing UI slots, or the request asks to enforce or audit mandatory composition. | `composition-` | [`composition-required-children.md`](composition-required-children.md) |
| A resolved method, function, component, prop, type, or other API carries `@deprecated`, or its official documentation marks it deprecated for the installed version. | `quality-` | [`quality-no-deprecated-apis.md`](quality-no-deprecated-apis.md) |
| The request asks to detect, prohibit, or migrate deprecated API usage. | `quality-` | [`quality-no-deprecated-apis.md`](quality-no-deprecated-apis.md) |
