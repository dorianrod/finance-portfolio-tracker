---
title: Consume Domain Entities, Never Redefine Them Locally
impact: HIGH
impactDescription: keeps one source of truth per entity shape
tags: types, entity, shared, placement, signatures
---

## Consume Domain Entities, Never Redefine Them Locally

**Impact: HIGH (keeps one source of truth per entity shape)**

Helpers, hooks, services and component props import the entity exported from the domain `types/`. Never declare a local structural copy (`type Address = {...}`, an inline `{ uuid: string; file: ... }`): it drifts silently when the entity changes and duplicates the nullability decisions the entity already made. To narrow a dependency, derive it with `Pick<Entity, ...>`.

Before you create a type, search where it would already live, and put a new one at the narrowest level that fits:

- the domain `types/` folder, for anything owned by one sub-domain;
- `domains/[domain]/shared/types/` (e.g. `sales/shared/types/sales.type.ts` with `GlobalStatus`), for a type shared by sibling sub-domains;
- `src/shared/types/`, only for a type no business domain owns and that carries no domain vocabulary.

**Incorrect (helper redeclares the entity shape):**

```typescript
// domains/sales/orders/pages/detail/helpers/toOrderDocumentFile.ts
type OrderDocument = {
  uuid: string
  file?: { uuid: string; url: string; name: string }
  customerComment?: string
}

export function toOrderDocumentFile(item: OrderDocument, label: string) { /* ... */ }
```

**Correct (import the entity; Pick when only a slice is needed):**

```typescript
import type { DocumentFile } from '@/domains/documents/types/document.type'
import type { OrderDocument } from '@/domains/sales/orders/types/orderDocument.type'

export function toOrderDocumentFile(
  item: Pick<OrderDocument, 'uuid' | 'file' | 'customerComment'>,
  label: string,
): DocumentFile | null {
  if (!item.file) return null
  return { uuid: item.uuid, label, comment: item.customerComment, file: item.file }
}
```

When a near-generic shape really differs from the shared one (the order API returns `street1/street2` while the shared `Address` uses `line1/line2`), declare a domain type (`OrderAddress`) with a comment saying why; do not bend the shared type.
