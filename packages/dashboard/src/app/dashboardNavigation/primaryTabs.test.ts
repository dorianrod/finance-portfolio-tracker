import { afterEach, describe, expect, it } from 'vitest'

import i18n from '@/i18n/i18n'

import { PRIMARY_TABS } from './primaryTabs'

afterEach(async () => {
  await i18n.changeLanguage('en')
  i18n.removeResourceBundle('regression', 'translation')
})

describe('navigation translations', () => {
  it('resolves labels after a language change without reimporting the configuration', async () => {
    const overview = PRIMARY_TABS.find((tab) => tab.id === 'overview')!
    const original = overview.label
    i18n.addResourceBundle('regression', 'translation', {
      'ui.app.overview': 'Updated overview',
    })
    await i18n.changeLanguage('regression')
    expect(overview.label).toBe('Updated overview')
    await i18n.changeLanguage('en')
    expect(overview.label).toBe(original)
  })
})
