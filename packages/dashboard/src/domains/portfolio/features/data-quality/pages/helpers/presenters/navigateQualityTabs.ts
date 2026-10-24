import type { KeyboardEvent } from 'react'

export function navigateQualityTabs(event: KeyboardEvent<HTMLButtonElement>): void {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
  const tabs = Array.from(
    event.currentTarget
      .closest('[role="tablist"]')
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
  )
  if (tabs.length === 0) return
  event.preventDefault()
  const current = tabs.indexOf(event.currentTarget)
  let next = (current + (event.key === 'ArrowDown' ? 1 : -1) + tabs.length) % tabs.length
  if (event.key === 'Home') next = 0
  if (event.key === 'End') next = tabs.length - 1
  tabs[next].focus()
  tabs[next].click()
}
