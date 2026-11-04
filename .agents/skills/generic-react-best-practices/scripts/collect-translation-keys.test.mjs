import { describe, expect, it } from 'vitest'

import { collectTranslationKeys } from './collect-translation-keys.mjs'

describe('catalog translation key collection', () => {
  it('collects keys from a project outside the calling directory', () => {
    expect([
      ...collectTranslationKeys(
        "import {t} from 'i18next'; t('invoice.amount')",
        '/another-project/src/labels.ts',
      ),
    ]).toEqual(['invoice.amount'])
  })
  it('collects both literal branches of a translated choice', () => {
    expect([
      ...collectTranslationKeys(
        `import {t} from 'i18next'; t(active ? 'first' : 'second')`,
        'labels.ts',
      ),
    ]).toEqual(['first', 'second'])
  })

  it.each([
    `import i18n from '@/i18n/i18n'; i18n.t('used')`,
    `import translation from '@/i18n/i18n'; const translate = translation.t; translate('used')`,
    `import {t as translate} from 'i18next'; translate('used')`,
    `import {useTranslation} from 'react-i18next'; function Label() {const {t} = useTranslation(); return <p>{t('used')}</p>}`,
    `import {useTranslation as useLabels} from 'react-i18next'; function Label() {const {t: translate} = useLabels(); const label = translate; return label('used', {value: 'data'})}`,
  ])('recognizes translation bindings: %s', (code) => {
    expect([...collectTranslationKeys(code, 'Label.tsx')]).toEqual(['used'])
  })

  it.each([
    `const i18n = {t: (key: string) => key}; i18n.t('unused')`,
    `import i18n from '@/i18n/i18n'; function helper(i18n: {t: (key: string) => string}) {return i18n.t('unused')}`,
    `import {t} from 'i18next'; function helper(t: (key: string) => string) {return t('unused')}`,
    `const source = "i18n.t('unused')"`,
  ])('ignores unrelated calls, shadowing and source examples: %s', (code) => {
    expect([...collectTranslationKeys(code, 'helper.ts')]).toEqual([])
  })

  it('reports invalid source instead of silently losing keys', () => {
    expect(() =>
      collectTranslationKeys('export const =', 'invalid.ts'),
    ).toThrow('invalid.ts:')
  })
})
