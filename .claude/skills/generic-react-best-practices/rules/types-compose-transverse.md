---
title: Compose Transverse Types, Reference Foreign Entities by ID
impact: MEDIUM
impactDescription: avoids duplicated shapes and cross-domain coupling
tags: types, composition, transverse, boundaries
---

## Compose Transverse Types, Reference Foreign Entities by ID

**Impact: MEDIUM (avoids duplicated shapes and cross-domain coupling)**

Reuse the types of transverse domains (e.g. `documents`) and of the app-wide shared types directly: import them, extend them with `&`, or nest them as a field. Do not copy their fields. Never import an entity from a non-transverse or sibling sub-domain. Reference it by its id (`invoiceUuid: string`) instead. Duplicate a shape only when it really differs or will evolve on its own, and say why in a comment.

**Incorrect (copies a transverse shape and imports a sibling entity):**

```typescript
// domains/sales/orders/types/orderRejection.type.ts
import type { Invoice } from '@/domains/sales/invoices/types/invoice.type'

export type OrderRejection = {
  uuid: string
  userName: string
  createdAt: Date
  comment: string // same fields as the documents domain's RejectionHistories
  antivirusStatus?: 'NOT_RUN' | 'ERROR' | 'VIRUS_FREE' // re-typed AntivirusStatus
  relatedInvoice: Invoice // couples orders to invoices
}
```

**Correct (compose the transverse type, link the foreign entity by id):**

```typescript
import type { AntivirusStatus, RejectionHistories } from '@/domains/documents/types/document.type'

export type OrderRejection = RejectionHistories & {
  antivirusStatus?: AntivirusStatus
  relatedInvoiceUuid: string | null
}
```

A justified duplicate is fine. For example, an `OrderAddress` type can exist because the order API returns `street1/street2`, while the shared `Address` uses `line1/line2`; a comment on the type explains this. To show a domain object in a transverse component, map it to the transverse type in a helper (`toOrderDocumentFile` → `DocumentFile`). Compose and import types from a transverse domain, but keep your own types one entity per file (see `types-file-per-entity`).
