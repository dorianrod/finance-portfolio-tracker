---
title: Keep className Out of Shared UI Component APIs
impact: HIGH
impactDescription: prevents caller style overrides and keeps layout with the parent
tags: ui, design-system, props, className, layout, composition
---

## Keep className Out of Shared UI Component APIs

**Impact: HIGH (prevents caller style overrides and keeps layout with the parent)**

Components and compound slots in `shared/ui` must neither expose nor accept `className` or `style` props. This includes inherited props from `HTMLAttributes`, `ComponentProps`, `ComponentPropsWithoutRef` and similar React types. Omit both properties when composing these types; forwarding or merging caller classes still exposes an override channel. Passing classes through spreads or React element factories follows the same rule.

The parent owns the surrounding layout, including margins, widths and flex placement. Put layout classes on a parent container, even when a class would only add spacing. Appearance and internal layout belong to the shared component and its semantic variants. Do not rename the override prop to bypass this boundary.

**Incorrect (the shared component exposes classes and its caller controls spacing):**

```tsx
import type { ComponentPropsWithoutRef } from 'react'

function Button({ className, ...props }: ComponentPropsWithoutRef<'button'>) {
  return <button {...props} className={`rounded px-3 py-2 ${className}`} />
}

<Button className="mt-2">{t('sales.orders.save')}</Button>
```

**Correct (internal classes define the component; the parent handles layout):**

```tsx
import type { ReactNode } from 'react'

type ButtonProps = { children: ReactNode; label: string; onClick?: () => void }

function Button({ label, ...props }: ButtonProps) {
  return <button {...props} aria-label={label} className="rounded px-3 py-2" />
}

<div className="mt-2">
  <Button label={t('sales.orders.save')}>{t('sales.orders.save')}</Button>
</div>
```

- Internal classes on native elements or third-party primitives remain necessary to implement the design system. Calls from one shared UI component to another still cannot supply `className`.
- Caller-authored children must not inject layout classes or styles, including padding, margins, gap, flex/grid or dimensions. `<Button><span className="px-3 py-2">Save</span></Button>` still bypasses spacing standards. Use the button's closed size variants and supply its content directly.
- This boundary also applies to surfaces, cards, dialogs and slots, extracted child components, JSX variables, fragments, spreads and React factories. Compose complex content with shared UI structure primitives and closed spacing tokens.
- Do not expose equivalent escape hatches such as free-form padding, body classes or inline layout styles. Ancestor selectors must not restyle UI descendants.
- Shared UI implementations own their native classes. Context-only providers without a visual box do not create an internal layout boundary.
- Preserve compound slot discovery: never insert a layout wrapper between a compound component and its direct slots. External layout wraps the whole component; content slots compose standardized shared UI. Follow `ui-compound-slots-direct-children`.
- Existing components may still expose classes during migration. Follow this API boundary for new code and record existing violations without copying the legacy pattern.

Chart geometry supplied as data is distinct from caller-authored CSS layout. Apply `ui-centralize-accessibility` to inherited native props as well; public UI contracts expose semantic labels and behavior instead of raw ARIA or focus/keyboard wiring.

### ESLint Enforcement

Use the custom ESLint rules `local/no-shared-ui-classname` to protect the public API and `local/no-shared-ui-internal-layout` to report injected classes and inline layout styles, including through statically resolvable extracted components. Apply the same composition rules to tests and Storybook usages. Neither rule should autofix composition or be suppressed merely to complete a migration.
