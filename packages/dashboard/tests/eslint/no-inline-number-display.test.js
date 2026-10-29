import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '../..')
const eslint = new ESLint({ cwd: directory })

async function diagnostics(code) {
  const [result] = await eslint.lintText(
    code,
    {
      filePath: resolve(directory, 'src/app/App.feature.tsx'),
    },
    30_000,
  )
  return result.messages.filter(
    (message) =>
      message.fatal || message.ruleId === 'local/no-inline-number-display',
  )
}

describe('numeric display through the application configuration', () => {
  it.each([
    'export function Total({value}: {value: number}) {return <span>{value}</span>}',
    'export function Total({value}: {value: number | null}) {return <span>{value}</span>}',
    'export function Total({value}: {value: number}) {return <span>{String(value)}</span>}',
    'const text = String; export function Total({value}: {value: number}) {return <span>{text(value)}</span>}',
    'export function Total({value}: {value: number}) {return <span>{value.toString()}</span>}',
    'export function Total({ready, value}: {ready: boolean; value: number}) {return <span>{ready ? value : null}</span>}',
    'export function Total({ready, value}: {ready: boolean; value: number}) {return <span>{ready && value}</span>}',
    'export function Total({value}: {value: number}) {return <span>{`${value}`}</span>}',
    'export function Total({value}: {value: number}) {const label = String(value); return <span>{label}</span>}',
  ])(
    'rejects raw numeric text: %s',
    async (code) => {
      expect(await diagnostics(code)).toEqual([
        expect.objectContaining({
          ruleId: 'local/no-inline-number-display',
          messageId: 'formatter',
          severity: 2,
        }),
      ])
    },
    30_000,
  )

  it.each([
    "import {useFormatNumber as useCount} from '@/shared/helpers/formatters/useFormatNumber'; export function Total({value}: {value: number | null}) {const format = useCount();return <span>{format(value)}</span>}",
    'export function Total({value}: {value: number}) {return <input value={String(value)}/>} ',
    'export function Total({value}: {value: number}) {return <span id={String(value)}/>}',
    'export function Total({value}: {value: string}) {return <span>{String(value)}</span>}',
    'export function Total({value, String}: {value: number; String: (value: number) => string}) {return <span>{String(value)}</span>}',
    'export function Total({value}: {value: number}) {return <span>{value > 0 && <Detail/>}</span>}',
    'export function Total({value}: {value: number}) {return <Meter value={value}/>}',
  ])('preserves formatted text and technical values: %s', async (code) => {
    expect(await diagnostics(code)).toEqual([])
  })
})
