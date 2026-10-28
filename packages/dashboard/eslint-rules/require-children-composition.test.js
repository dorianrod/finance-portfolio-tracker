import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const dashboardDirectory = resolve(import.meta.dirname, '..')
const eslint = new ESLint({ cwd: dashboardDirectory })

async function lint(code, file = 'src/main.tsx') {
  const [result] = await eslint.lintText(code, {
    filePath: resolve(dashboardDirectory, file),
  })
  return result.messages.filter(
    (message) =>
      message.fatal || message.ruleId === 'local/require-children-composition',
  )
}

describe('configured children composition enforcement', () => {
  const isolatedWrapper = `
    import {renderHook as mount} from '@testing-library/react'
    import {createStore, Provider} from 'jotai'
    function mountIsolated() {
      const store = createStore()
      function Wrapper({children}: {children: React.ReactNode}) {return <Provider store={store}>{children}</Provider>}
      return mount(() => true, {wrapper: Wrapper})
    }
  `

  it.each(['wrapper', '"wrapper"'])(
    'preserves per-test isolation through the Testing Library %s contract',
    async (property) => {
      expect(
        await lint(
          isolatedWrapper.replace('wrapper:', `${property}:`),
          'src/app/services/useResetDashboardFilters.test.tsx',
        ),
      ).toEqual([])
    },
    30_000,
  )

  it('keeps render-local wrapper components forbidden in application code', async () => {
    expect(await lint(isolatedWrapper)).toEqual([
      expect.objectContaining({ messageId: 'extractRenderer', severity: 2 }),
    ])
  }, 30_000)

  it.each([
    "const columns = createColumnHelper<{id: string}>(); columns.display({id: 'name', header: () => <span>Title</span>})",
    "const columns = createColumnHelper<{id: string}>(); const display = columns['display']; display({id: 'name', header: () => <span>Title</span>})",
    "const columns = createColumnHelper<{id: string}>(); columns.display({id: 'name', header() {return <span>Title</span>}})",
  ])(
    'rejects inline UI renderers in external configuration: %s',
    async (expression) => {
      const messages = await lint(
        `import {createColumnHelper} from '@tanstack/react-table'; ${expression}`,
      )
      expect(messages).toEqual([
        expect.objectContaining({ messageId: 'extractRenderer', severity: 2 }),
      ])
    },
    30_000,
  )

  it.each([
    "const columns = createColumnHelper<{id: string}>(); function Header() {return <span>Title</span>}; columns.display({id: 'name', header: Header})",
    "const columns = createColumnHelper<{id: string}>(); columns.display({id: 'name', header: () => 'Title'})",
    'function configure(options: {renderer: () => React.ReactNode}) {return options}; configure({renderer: () => <span/>})',
    'function run(createColumnHelper: () => {display: (options: {header: () => React.ReactNode}) => unknown}) {createColumnHelper().display({header: () => <span/>})}',
  ])(
    'preserves named renderers, scalar callbacks and local APIs: %s',
    async (expression) => {
      expect(
        await lint(
          `import {createColumnHelper} from '@tanstack/react-table'; ${expression}`,
        ),
      ).toEqual([])
    },
    30_000,
  )

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
      'contentProp',
      'contentProp',
      'composeChildren',
      'composeChildren',
    ])
  })

  it.each([
    `import type { ReactNode } from 'react'; export function Panel({header}: {header?: ReactNode}) {return <div>{header}</div>}`,
    `import type { ReactElement } from 'react'; type Props = {header: ReactElement}; const Panel = ({header}: Props) => <div>{header}</div>; export {Panel}`,
    `import {memo, type ComponentType} from 'react'; export const Panel = memo(({Header}: {Header: ComponentType}) => <Header />)`,
    `import {forwardRef, type ReactNode} from 'react'; export const Panel = forwardRef<HTMLDivElement, {header: ReactNode}>((props, ref) => <div ref={ref}>{props.header}</div>)`,
    `import type {ReactNode} from 'react'; export default function({header}: {header: ReactNode}) {return <div>{header}</div>}`,
    `import {Component, type ReactNode} from 'react'; export class Panel extends Component<{header: ReactNode}> {render() {return this.props.header}}`,
    `import type {ReactNode} from 'react'; export function Panel<T extends ReactNode>({header}: {header: T}) {return <div>{header}</div>}`,
    `import type {ReactNode} from 'react'; export function Panel(props: {header: string} | {header: ReactNode; expanded: true}) {return <div>{props.header}</div>}`,
    `import type {ReactNode} from 'react'; export function Panel() {return null}; Panel.Header = ({content}: {content: ReactNode}) => <div>{content}</div>`,
  ])('rejects a UI-valued API without any caller: %s', async (code) => {
    expect((await lint(code)).map(({ messageId }) => messageId)).toEqual([
      'contentProp',
    ])
  })

  it.each([
    `import type {ReactNode} from 'react'; export function Panel({children, label, onSave, format}: {children: ReactNode; label: string; onSave: () => void; format: (value: number) => string}) {return <div>{children}</div>}`,
    `import {Bar, type BarShapeProps} from 'recharts'; function Shape(props: BarShapeProps) {return <rect />}; <Bar shape={Shape} />`,
    `export function readData({content}: {content: string}) {return content}`,
  ])(
    'preserves children, scalar contracts and injected renderer props: %s',
    async (code) => {
      expect(await lint(code)).toEqual([])
    },
  )

  it.each([
    `import {createElement} from 'react'; function Panel(props) {return <div />}; createElement(Panel, {header: <span />})`,
    `import {createElement as element} from 'react'; function Panel(props) {return <div />}; const props = {header: <span />}; element(Panel, props)`,
    `import * as React from 'react'; function Panel(props) {return <div />}; React.cloneElement(<Panel />, {header: <span />})`,
    `import {createElement} from 'react'; function Panel(props) {return <div />}; const element = createElement; element(Panel, {header: <span />})`,
  ])('checks UI-valued props in React factories: %s', async (code) => {
    expect((await lint(code)).map(({ messageId }) => messageId)).toEqual([
      'composeChildren',
    ])
  })

  it('checks explicit factory children while preserving positional composition', async () => {
    expect(
      (
        await lint(
          `import {createElement} from 'react'; createElement('div', {children: 'text'})`,
        )
      ).map(({ messageId }) => messageId),
    ).toEqual(['nestedChildren'])
    expect(
      await lint(
        `import {createElement} from 'react'; createElement('div', null, createElement('span'))`,
      ),
    ).toEqual([])
  })

  it('keeps external factory contracts and renderer extraction', async () => {
    const imports = `import {createElement, cloneElement} from 'react'; import {Bar} from 'recharts'; function Shape() {return <rect />};`
    expect(await lint(`${imports} createElement(Bar, {shape: Shape})`)).toEqual(
      [],
    )
    expect(
      (
        await lint(`${imports} cloneElement(<Bar />, {shape: () => <rect />})`)
      ).map(({ messageId }) => messageId),
    ).toEqual(['extractRenderer'])
    expect(
      await lint(
        `function createElement(type, props) {return props}; createElement('div', {children: 'data'})`,
      ),
    ).toEqual([])
    expect(
      await lint(
        `import {createElement} from 'react'; let element = createElement; element = (type, props) => props; element('div', {children: 'data'})`,
      ),
    ).toEqual([])
  })
})
