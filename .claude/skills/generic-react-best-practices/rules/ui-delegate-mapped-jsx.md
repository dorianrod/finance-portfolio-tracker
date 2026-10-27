---
title: Delegate Mapped JSX to a Component
impact: HIGH
impactDescription: keeps list rendering declarative and isolates per-item decisions
tags: ui, components, lists, jsx, eslint
---

## Delegate Mapped JSX to a Component

**Impact: HIGH (keeps list rendering declarative and isolates per-item decisions)**

When `map` produces JSX, its callback only renders one named component and passes source values to it. Put branching, derived values, event-handler construction, styling decisions and element structure inside that item component. Data-only transformations that do not produce JSX are unaffected.

Enforce this convention with the custom ESLint rule `local/no-complex-jsx-map` when the project provides it. Treat a warning from that rule as a request to extract or simplify the mapped item, not as a reason to disable the rule.

**Incorrect (the map callback owns conditions and markup):**

```tsx
<div>
  {categories.map((category) => {
    const isActive = category.id === activeCategoryId
    if (category.isOther) return <span key={category.id}>{category.label}</span>

    return (
      <button key={category.id} onClick={() => selectCategory(category.id)}>
        <Text tone={isActive ? 'accent' : 'default'}>{category.label}</Text>
      </button>
    )
  })}
</div>
```

**Correct (the map delegates each item without inline logic):**

```tsx
type CategoryItemProps = {
  activeCategoryId: string | null
  category: Category
  onSelect: (categoryId: string) => void
}

function CategoryItem({ activeCategoryId, category, onSelect }: CategoryItemProps) {
  const isActive = category.id === activeCategoryId

  if (category.isOther) return <span>{category.label}</span>

  return (
    <button onClick={() => onSelect(category.id)}>
      <Text tone={isActive ? 'accent' : 'default'}>{category.label}</Text>
    </button>
  )
}

<div>
  {categories.map((category) => (
    <CategoryItem
      key={category.id}
      activeCategoryId={activeCategoryId}
      category={category}
      onSelect={selectCategory}
    />
  ))}
</div>
```

The item component must be declared at module scope, never inside its parent component.

See also: `arch-component-module-boundaries`
