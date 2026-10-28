import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { beforeAll, describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '..')
const filePath = resolve(
  directory,
  'src/domains/portfolio/shared/services/useDashboardHistory.ts',
)
const eslint = new ESLint({ cwd: directory })
const imports = `
import {useGetFilteredPortfolioHistoryQuery as useOrdersQuery} from '@/domains/portfolio/shared/apis/queries/useGetFilteredPortfolioHistoryQuery/useGetFilteredPortfolioHistoryQuery';
import {useMutation} from '@tanstack/react-query';
`

beforeAll(async () => {
  await eslint.lintText('', { filePath })
}, 20_000)

async function lint(body, setup = 'const query = useOrdersQuery(new Set());') {
  const [result] = await eslint.lintText(
    `${imports} export function useDashboardHistory() {${setup} ${body}}`,
    { filePath },
  )
  return result.messages.filter(
    (message) =>
      message.fatal || message.ruleId === 'local/api-business-destructuring',
  )
}

describe('business aliases for TanStack consumers', () => {
  it.each([
    `return query.data`,
    `return query?.data`,
    `return query['data']`,
    `const key = 'data'; return query[key]`,
    `const alias = query; return alias.data`,
    `const {data: orders} = query; return query.data`,
  ])('rejects a direct query-data read: %s', async (body) => {
    expect(await lint(body)).toMatchObject([
      { messageId: 'member', severity: 2 },
    ])
  })
  it.each([
    `const {data} = query; return data`,
    `const {data: data} = query; return data`,
    `const {data = []} = query; return data`,
    `const key = 'data'; const {[key]: data} = query; return data`,
    `let data; ({data} = query); return data`,
  ])('rejects an unnamed data binding: %s', async (body) => {
    expect(await lint(body)).toMatchObject([
      { messageId: 'alias', severity: 2 },
    ])
  })
  it.each([
    `const {data: orders} = query; return orders`,
    `const {data: orders = []} = query; return orders`,
    `const alias = query; const {data: orders} = alias; return orders`,
    `const {isPending, error} = query; return {isPending, error}`,
    `return query.isPlaceholderData`,
    `return query`,
    `const key: string = 'unknown'; return query[key as 'status']`,
  ])(
    'allows business aliases, metadata and unchanged results: %s',
    async (body) => {
      expect(await lint(body)).toEqual([])
    },
  )
  it.each([`return query.data`, `const {data} = query; return data`])(
    'preserves unrelated data objects: %s',
    async (body) => {
      expect(
        await lint(
          body,
          `const query = {data: 'ordinary data', isPending: false};`,
        ),
      ).toEqual([])
    },
  )
  it('rejects direct mutation execution', async () => {
    expect(
      await lint(
        'return mutation.mutateAsync',
        `const mutation = useMutation({mutationFn: async (id: string) => id});`,
      ),
    ).toMatchObject([{ messageId: 'member', severity: 2 }])
  })
  it('requires a verb alias for mutateAsync', async () => {
    expect(
      await lint(
        'const {mutateAsync} = mutation; return mutateAsync',
        `const mutation = useMutation({mutationFn: async (id: string) => id});`,
      ),
    ).toMatchObject([{ messageId: 'alias', severity: 2 }])
  })
  it('allows named mutation actions', async () => {
    expect(
      await lint(
        'const {mutateAsync: closeOrder} = mutation; return closeOrder',
        `const mutation = useMutation({mutationFn: async (id: string) => id});`,
      ),
    ).toEqual([])
  })
})
