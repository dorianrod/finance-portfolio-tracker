---
title: Build Translated Form Validation Schemas in a use[Form]Schema Hook
impact: MEDIUM
impactDescription: translated messages without rebuilding the schema each render
tags: yup, forms, i18n, validation, useMemo
---

## Build Translated Form Validation Schemas in a use[Form]Schema Hook

**Impact: MEDIUM (translated messages without rebuilding the schema each render)**

Form validation schemas need `t()` for their messages, so they cannot be module constants. Put each one in a `use[Form]Schema` hook in the page's forms folder. The hook calls `useTranslation()` and returns the Yup schema from `useMemo(() => …, [t])`, typed against the form values (`yup.ObjectSchema<FormValues>`). Compose section schemas in another memoized hook (spread their `.fields` into one `yup.object()`). Never hardcode messages, and never build the schema inline in the component, where it is recreated on every render.

**Incorrect (schema rebuilt every render, inline in the component):**

```tsx
export const TeamForm = () => {
  const { t } = useTranslation()
  const schema = yup.object({
    name: yup.string().required(t('common.form.error.required')),
  })
  const onSubmit = (values: TeamFormValues) => schema.validate(values)
  /* … */
}
```

**Correct (typed, translated, memoized on `t`):**

```ts
// directory/teams/pages/detail/forms/useTeamFormSchema.ts
const NAME_MAX = 100

export function useTeamFormSchema(): yup.ObjectSchema<TeamFormValues> {
  const { t } = useTranslation()

  return useMemo(() => {
    const required = t('common.form.error.required')
    return yup.object({
      name: yup
        .string()
        .trim()
        .required(required)
        .max(NAME_MAX, t('common.form.error.maxLength', { length: NAME_MAX })),
      catalogUuid: yup.string().required(required),
    })
  }, [t])
}

// combined form: useProjectFormSchema.ts
export function useProjectFormSchema() {
  const overviewSchema = useProjectOverviewSchema()
  const budgetSchema = useProjectBudgetSchema()
  return useMemo(
    () => yup.object({ ...overviewSchema.fields, ...budgetSchema.fields }),
    [overviewSchema, budgetSchema],
  )
}
```

A schema with no user-facing message can stay a typed module constant. Never rely on Yup's default English messages: provide every message through `t`, or configure them once with `yup.setLocale`. To test a schema without rendering a hook, export a pure `build[Form]Schema(t)` from the same file and wrap it in the hook: this is the one allowed exception to `helpers-no-context-params`, because a form schema is not a helper.
