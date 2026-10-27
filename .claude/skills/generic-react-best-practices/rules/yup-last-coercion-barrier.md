---
title: Make Yup the Last Coercion Point
impact: HIGH
impactDescription: removes defensive parsing and truthy-string bugs downstream
tags: yup, coercion, entities, response-schema, boolean
---

## Make Yup the Last Coercion Point

**Impact: HIGH (removes defensive parsing and truthy-string bugs downstream)**

All conversion of raw API values (string → number/boolean/Date, `null` → default, `'YES'` → `true`, empty string → `null`) happens once in the hook's response schema. Downstream code receives strict entity types and never re-coerces with `Number(...)`, `=== 'true'`, `new Date(...)` or `?? ''`. If a consumer needs to repair an unexpected missing value, the schema or the entity type is wrong. A formatter's display fallback for a legitimately nullable value is a separate presentation rule (see `helpers-formatter-hooks`); it leaves the domain value unchanged.

Textual booleans are the classic trap: when the domain meaning is yes/no, the entity field is `boolean`, never `string` nor `'YES' | 'NO'`. A non-empty string such as `'NO'` is truthy, so any `if (value)` on it is a silent bug.

**Incorrect (raw values leak, every consumer re-parses):**

```tsx
const LIST_ITEM_SCHEMA = yup.object({
  uuid: yup.string().required(),
  hasVatNumber: yup.string(), // 'YES' | 'NO' | 'true' | 'false'
  numberOfDocuments: yup.mixed(),
})

// component
const hasVat = item.hasVatNumber === 'YES' || item.hasVatNumber === 'true'
const count = Number(item.numberOfDocuments ?? 0)
```

**Correct (coerced once, consumed as-is):**

```tsx
const LIST_ITEM_SCHEMA = yup.object({
  uuid: yup.string().required(),
  publishedOn: yup.date().nullable().default(null),
  numberOfDocuments: yup.number().default(0).required(),
  hasVatNumber: yup
    .boolean()
    .transform((_value, original) => original === true || original === 'true' || original === 'YES')
    .required(),
})

// component
<span>{item.numberOfDocuments}</span>
{item.hasVatNumber && <VatNumberField />}
```

Normalize other API quirks in the schema with `.transform()` too (e.g. `value === '' ? null : value` before `.oneOf`). Two exceptions keep a union instead of a boolean: a yes/no value that is an API filter option sent back as-is (`HasVatNumber = 'YES' | 'NO'` in filter payloads), and answers with more than two choices (`'YES' | 'NO' | 'ABSTAINS'`). Both are still normalized in the schema, never typed `string`.
