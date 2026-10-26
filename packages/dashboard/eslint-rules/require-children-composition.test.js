import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const dashboardDirectory = resolve(import.meta.dirname, '..')
const eslint = new ESLint({ cwd: dashboardDirectory })

async function lint(code) {
  const [result] = await eslint.lintText(code, {
    filePath: resolve(dashboardDirectory, 'src/main.tsx'),
  })
  return result.messages.filter(
    (message) =>
      message.fatal || message.ruleId === 'local/require-children-composition',
  )
}

describe('configured children composition enforcement', () => {
  it.each([
    ['JSX', '<Panel header={<Header />} />'],
    ['a fragment', '<Panel header={<><Header /></>} />'],
    ['a JSX variable', 'const header = <Header />; <Panel header={header} />'],
    ['a component', '<Panel header={Header} />'],
    [
      'an async component',
      'async function AsyncHeader() { return <Header /> }; <Panel header={AsyncHeader} />',
    ],
    [
      'a class component',
      'class ClassHeader extends Component { render() { return <Header /> } }; <Panel header={ClassHeader} />',
    ],
    [
      'a memoized component',
      'const MemoHeader = memo(Header); <Panel header={MemoHeader} />',
    ],
    [
      'an inline renderer',
      '<Panel renderItem={(item) => <Header item={item} />} />',
    ],
    [
      'a named renderer',
      'const render = () => <Header />; <Panel renderItem={render} />',
    ],
    ['a conditional', '<Panel header={visible ? <Header /> : null} />'],
    ['an element array', '<Panel header={[<Header />]} />'],
    ['an asserted value', '<Panel header={(<Header />) as unknown} />'],
    ['a spread', '<Panel {...{ header: <Header /> }} />'],
    [
      'a named spread',
      'const props = { header: Header }; <Panel {...props} />',
    ],
    [
      'a nested spread',
      'const props = { header: <Header /> }; <Panel {...{ ...props }} />',
    ],
  ])(
    'rejects %s in a project-owned prop',
    async (_name, expression) => {
      const messages = await lint(`
      import { Component, memo } from 'react'
      function Header() { return <span /> }
      function Panel(props) { return <section>{props.children}</section> }
      ${expression}
    `)
      expect(messages.map(({ messageId }) => messageId)).toEqual([
        'composeChildren',
      ])
      expect(messages[0].severity).toBe(2)
    },
    20_000,
  )

  it.each([
    '<Panel children={<Header />} />',
    '<div children="hello" />',
    'const props = { children: <Header /> }; <Panel {...props} />',
    'const children = <Header />; <Panel {...{ children }} />',
    '<div {...{ children: <Header /> }} />',
  ])('rejects explicit children: %s', async (expression) => {
    expect(
      (await lint(`function Header() { return <span /> }; ${expression}`)).map(
        ({ messageId }) => messageId,
      ),
    ).toEqual(['nestedChildren'])
  })

  it.each([
    '<Panel><Header /></Panel>',
    '<Panel title="hello" count={3} visible={true} />',
    '<Panel onClick={() => select()} formatter={(value) => String(value)} />',
    'const props = { title: "hello", onClick: () => {} }; <Panel {...props} />',
    '<div title="hello" aria-label="hello" />',
    '<Panel model={{ name: "hello" }} />',
  ])('accepts children, data and event handlers: %s', async (expression) => {
    expect(await lint(expression)).toEqual([])
  })

  it.each([
    [
      'an inline shape',
      "import { Bar } from 'recharts'; <Bar shape={(props) => <Shape {...props} />} />",
    ],
    [
      'an aliased dependency',
      "import { Bar as Series } from 'recharts'; <Series shape={() => <Shape />} />",
    ],
    [
      'a namespace dependency',
      "import * as Charts from 'recharts'; <Charts.Bar shape={() => <Shape />} />",
    ],
    [
      'a block renderer',
      "import { Bar } from 'recharts'; <Bar shape={(props) => { if (!props.payload) return null; return <Shape {...props} /> }} />",
    ],
    [
      'a render-local component',
      "import { Bar } from 'recharts'; function Chart() { const Shape = () => <rect />; return <Bar shape={Shape} /> }",
    ],
    [
      'a render-local component element',
      "import { Bar } from 'recharts'; function Chart() { const Shape = () => <rect />; return <Bar shape={<Shape />} /> }",
    ],
    [
      'a render-local function declaration',
      "import { Bar } from 'recharts'; function Chart() { function Shape() { return <rect /> }; return <Bar shape={Shape} /> }",
    ],
    [
      'a render-local shorthand spread',
      "import { Bar } from 'recharts'; function Chart() { const shape = () => <rect />; return <Bar {...{ shape }} /> }",
    ],
    [
      'an optional render-local renderer',
      "import { Bar } from 'recharts'; function Chart({ visible }: { visible: boolean }) { const shape = visible ? () => <rect /> : false; return <Bar shape={shape} /> }",
    ],
    [
      'a conditional renderer',
      "import { Bar } from 'recharts'; <Bar shape={visible ? () => <Shape /> : false} />",
    ],
    [
      'an inline spread renderer',
      "import { Bar } from 'recharts'; const props = { shape: () => <Shape /> }; <Bar {...props} />",
    ],
  ])('requires an extracted component for %s', async (_name, code) => {
    const messages = await lint(code)
    expect(messages.map(({ messageId }) => messageId)).toEqual([
      'extractRenderer',
    ])
  })

  it.each([
    "import { Bar } from 'recharts'; function Shape() { return <rect /> }; <Bar shape={Shape} />",
    "import { Bar } from 'recharts'; function Shape() { return <rect /> }; <Bar shape={<Shape />} />",
    "import { Bar } from 'recharts'; const Shape = () => <rect />; <Bar shape={Shape} />",
    "import { Bar } from 'recharts'; function Shape() { return <rect /> }; const shape = Shape; <Bar {...{ shape }} />",
    "import { Bar } from 'recharts'; function Shape() { return <rect /> }; function Chart() { const shape = <Shape />; return <Bar shape={shape} /> }",
    "import { Tooltip } from 'recharts'; <Tooltip content={<CustomTooltip items={items} />} />",
    "import { Bar } from 'recharts'; function Shape() { return <rect /> }; <Bar {...{ shape: Shape }} />",
    "import { XAxis } from 'recharts'; <XAxis tickFormatter={(value) => String(value)} />",
    "import { Suspense } from 'react'; <Suspense fallback={<Loading />}><Content /></Suspense>",
  ])('accepts external boundary contracts: %s', async (code) => {
    expect(await lint(code)).toEqual([])
  })

  it('does not grant the external exception to a project wrapper', async () => {
    const messages = await lint(`
      import { Bar as ExternalBar } from 'recharts'
      function Bar(props) { return <ExternalBar {...props} /> }
      function Shape() { return <rect /> }
      <Bar shape={Shape} />
    `)
    expect(messages.map(({ messageId }) => messageId)).toEqual([
      'composeChildren',
    ])
  })

  it('resolves local import aliases as project-owned components', async () => {
    const messages = await lint(
      `\n      import { Kpi } from '@/domains/portfolio/shared/components/kpis/kpi/Kpi.view'\n      <Kpi header={<strong />} />\n    `,
    )
    expect(messages.map(({ messageId }) => messageId)).toEqual([
      'composeChildren',
    ])
  })

  it('checks annotated ReactNode and ComponentType values', async () => {
    const messages = await lint(`
      import type { ComponentType, ReactNode } from 'react'
      function Panel(props) { return <section>{props.children}</section> }
      function Example({ header, Item }: { header: ReactNode; Item: ComponentType }) {
        return <Panel header={header} item={Item} />
      }
    `)
    expect(messages.map(({ messageId }) => messageId)).toEqual([
      'composeChildren',
      'composeChildren',
    ])
  })
})
