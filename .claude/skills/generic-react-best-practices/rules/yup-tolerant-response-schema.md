---
title: Write Tolerant Response Schemas
impact: HIGH
impactDescription: one null field must not crash a Suspense page
tags: yup, response-schema, nullability, legacy-data
---

## Write Tolerant Response Schemas

**Impact: HIGH (one null field must not crash a Suspense page)**

A response schema that validates strictly throws inside `queryFn` on a single failing field, and takes the whole Suspense boundary down. Mark only identifiers and fields the logic truly depends on as `.required()`. Default display strings with `.ensure()` (`null` → `''`), optional values with `.nullable().default(null)`, and arrays with `.transform(value => value ?? []).default([])`. A bare `.optional()` rejects an explicit `null`: use `.nullable()` or a transform that maps `null` to `undefined`.

**Incorrect (strict everywhere, `null` from legacy rows breaks the page):**

```tsx
const LIST_ITEM_SCHEMA = yup.object({
  uuid: yup.string().required(),
  title: yup.string().required(),
  publicationDate: yup.date().optional(), // throws on null
  products: yup.array().of(PRODUCT_SCHEMA.required()).required(), // throws on null
})
```

**Correct (strict on identity, tolerant on the rest):**

```tsx
const nullToUndefined = <T,>(value: T | null) => value ?? undefined

const LIST_ITEM_SCHEMA = yup.object({
  uuid: yup.string().required(),
  title: yup.string().ensure(),
  publicationDate: yup.date().nullable().default(null),
  label: yup.string().transform(nullToUndefined).optional(),
  products: yup
    .array()
    .of(PRODUCT_SCHEMA.required())
    .transform(value => value ?? [])
    .default([])
    .required(),
})
```

Calibrate against a real payload, and add a short comment when a field is deliberately tolerant.

See also: `types-explicit-nullability`
