---
title: Query by Role and Label, Interact with userEvent
impact: MEDIUM
impactDescription: tests double as accessibility checks and survive markup refactors
tags: test, rtl, queries, user-event, accessibility
---

## Query by Role and Label, Interact with userEvent

**Impact: MEDIUM (tests double as accessibility checks and survive markup refactors)**

Find elements the way a user or a screen reader does: `getByRole` (with `name`), then `getByLabelText`, then `getByText` for static content. Do not use `getByTestId`, `container.querySelector` or `.tagName` checks. Drive interactions with `userEvent.setup()`, not `fireEvent`: `userEvent` fires the full focus, pointer and keyboard sequence that Radix-based components rely on.

**Incorrect (test ids and synthetic events):**

```tsx
render(<ReminderModal {...props} />)

fireEvent.change(screen.getByTestId('reminder-message'), { target: { value: 'Please review' } })
fireEvent.click(screen.getByTestId('confirm-button'))

expect(screen.getByTestId('reminder-message').tagName).toBe('TEXTAREA')
```

**Correct (accessible queries and real user interactions):**

```tsx
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()
render(<ReminderModal {...props} />)

const message = screen.getByLabelText('Message')
await user.type(message, 'Please review')
await user.click(screen.getByRole('button', { name: 'Confirm' }))

expect(message).toHaveValue('Please review')
```

If `react-i18next` is mocked globally with an identity `t`, accessible names are the i18n keys rather than the translated text; query with the key. If a query fails, the component may be missing its accessible name: fix the component (see `ui-accessible-names`), do not fall back to a test id.
