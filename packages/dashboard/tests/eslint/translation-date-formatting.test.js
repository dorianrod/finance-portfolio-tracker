import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '../..')
const eslint = new ESLint({ cwd: directory })

async function lint(code) {
  const [result] = await eslint.lintText(code, {
    filePath: resolve(directory, 'src/app/App.feature.tsx'),
  })
  return result.messages.filter(
    (message) => message.fatal || message.ruleId === 'local/i18n-consistency',
  )
}

describe('translation date formatting through the application configuration', () => {
  it.each([
    "import i18n from '@/i18n/i18n'; function title(date: Date | null) { return i18n.t('ui.fundqualitybadge.compositionDate', {date}) }",
    "import text from '@/i18n/i18n'; function title(value: Date) { const date = value; return text.t('ui.fundqualitybadge.compositionDate', {date}) }",
    "import {useTranslation as useText} from 'react-i18next'; function useTitle(date: Date | undefined) { const {t: translate} = useText(); return translate('ui.fundqualitybadge.compositionDate', {date}) }",
  ])(
    'rejects a raw Date interpolation: %s',
    async (code) => {
      expect(await lint(code)).toMatchObject([
        {
          ruleId: 'local/i18n-consistency',
          messageId: 'unformattedDate',
          severity: 2,
        },
      ])
    },
    30_000,
  )

  it.each([
    "import i18n from '@/i18n/i18n'; import {useFormatDate} from '@/shared/helpers/formatters/useFormatDate'; function useTitle(date: Date | null) { const formatDate = useFormatDate(); return i18n.t('ui.fundqualitybadge.compositionDate', {date: formatDate(date)}) }",
    "import i18n from '@/i18n/i18n'; function title(date: string) { return i18n.t('ui.fundqualitybadge.compositionDate', {date}) }",
    "function title(text: { t: (key: string, options: {date: Date}) => string }, date: Date) { return text.t('unrelated', {date}) }",
    "import i18n from '@/i18n/i18n'; type Date = {label: string}; function title(date: Date) { return i18n.t('ui.fundqualitybadge.compositionDate', {date}) }",
  ])(
    'preserves formatted values and unrelated bindings: %s',
    async (code) => {
      expect(await lint(code)).toEqual([])
    },
    30_000,
  )
})
