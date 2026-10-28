import { resolve } from 'node:path'

import { ESLint, Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import noDomainStyling from './no-domain-styling.js'
import { isLayoutClass, isLayoutProperty } from './styling-layout.js'

const directory = resolve(import.meta.dirname, '..')
const eslint = new ESLint({ cwd: directory })

async function lint(code, file = 'src/main.tsx') {
  const [result] = await eslint.lintText(code, {
    filePath: resolve(directory, file),
  })
  return result.messages.filter(
    (message) => message.fatal || message.ruleId === 'local/no-domain-styling',
  )
}

describe('imperative DOM styling boundary', () => {
  it.each([
    `document.body.style.opacity = '0.5'`,
    `const style = document.body.style; style['fontSize'] = '12px'`,
    `const property = 'border-radius'; document.body.style.setProperty(property, '4px')`,
    `document.body.style.removeProperty('opacity')`,
    `document.body.style.cssText = 'width: 20px; opacity: .5'`,
    `document.body.setAttribute('style', 'padding: 2px; font-weight: bold')`,
    `document.body.className = 'flex font-bold'`,
    `document.body.classList.add('font-bold')`,
    `const list = document.body.classList; list.toggle('opacity-50', true)`,
    `document.body.setAttribute('class', 'flex shadow-sm')`,
    `document.querySelector('svg')?.setAttribute('stroke-width', '2')`,
  ])(
    'rejects visual DOM writes: %s',
    async (code) => {
      const messages = await lint(code)
      expect(messages).toHaveLength(1)
      expect(['nonLayoutStyle', 'nonLayoutClass']).toContain(
        messages[0].messageId,
      )
    },
    20_000,
  )

  it.each([
    `declare const property: string; document.body.style.setProperty(property, '1')`,
    `declare const css: string; document.body.style.cssText = css`,
    `declare const property: string; document.body.style[property] = '1'`,
  ])('reports opaque styling explicitly: %s', async (code) => {
    expect((await lint(code)).map(({ messageId }) => messageId)).toEqual([
      'unverifiableStyle',
    ])
  })

  it.each([
    `document.body.style.width = '20px'`,
    `document.body.style.setProperty('padding-inline', '2px')`,
    `document.body.style.cssText = 'display: flex; width: calc(100% - 2px)'`,
    `document.body.classList.toggle('hidden', true)`,
    `document.body.setAttribute('class', 'flex gap-2')`,
    `const model = {style: {opacity: '1'}}; model.style.opacity = '0.5'`,
    `const model = {setProperty(name: string, value: string) {}}; model.setProperty('opacity', '0.5')`,
    `const link = document.createElement('a'); link.relList.add('noreferrer')`,
    `document.body.setAttribute('data-tone', 'positive')`,
  ])(
    'preserves layout, unrelated data and non-class DOM tokens: %s',
    async (code) => {
      expect(await lint(code)).toEqual([])
    },
  )

  it('permits visual DOM integration inside shared UI', async () => {
    expect(
      await lint(
        `document.body.style.opacity = '0.5'`,
        'src/shared/ui/Popover.view.tsx',
      ),
    ).toEqual([])
  })
})

describe('layout classification', () => {
  it.each([
    'flex',
    'inline-grid',
    'hidden',
    'grid-cols-2',
    'col-span-full',
    'auto-rows-fr',
    'flex-col',
    'flex-1',
    'grow',
    'shrink-0',
    'basis-1/2',
    'items-center',
    'content-between',
    'justify-items-center',
    'place-self-start',
    'gap-x-2',
    'space-y-1.5',
    'space-x-reverse',
    '-mt-2',
    'mx-auto',
    'p-4',
    'px-3',
    'ps-2',
    'w-full',
    'min-w-0',
    'max-h-screen',
    'size-4',
    'aspect-square',
    'overflow-x-auto',
    'relative',
    'inset-x-0',
    'top-2',
    'z-10',
    'order-last',
    'sm:hover:!mt-4',
    'md:gap-2!',
    'w-[calc(100%-2rem)]',
    'w-(--panel-width)',
    '[&:nth-child(2)]:grid-cols-[1fr_2fr]',
    '[@supports(display:grid)]:grid',
    '[width:calc(100%-2rem)]',
    '[padding-inline:1rem]',
  ])('allows layout utility %s', (value) =>
    expect(isLayoutClass(value)).toBe(true),
  )

  it.each([
    'bg-surface',
    'text-content',
    'border-border',
    'hover:text-positive',
    'md:dark:bg-[#123456]',
    'text-[length:12px]',
    'font-semibold',
    'rounded-xl',
    'shadow-sm',
    'opacity-50',
    'transition-colors',
    'animate-spin',
    'cursor-pointer',
    'pointer-events-none',
    'sr-only',
    'group',
    "content-['hello']",
    'content-none',
    '[&:nth-child(2)]:text-red-500',
    '[color:var(--color-positive)]',
    '[--color:red]',
    '[width:1px;color:red]',
    'w-[1px;color:red]',
    'w-[broken',
    'quality-indicator-card',
  ])('rejects non-layout utility %s', (value) =>
    expect(isLayoutClass(value)).toBe(false),
  )

  it.each([
    'paddingInline',
    'margin-block-end',
    'gridTemplateColumns',
    'zIndex',
    'height',
    'overflowX',
  ])('allows layout property %s', (name) =>
    expect(isLayoutProperty(name)).toBe(true),
  )
  it.each([
    'color',
    'backgroundColor',
    'fontSize',
    'borderWidth',
    '--layout-color',
  ])('rejects visual or opaque property %s', (name) =>
    expect(isLayoutProperty(name)).toBe(false),
  )
})

describe('configured styling boundary', () => {
  it.each([
    '<div className="flex items-center gap-2 p-4 md:grid-cols-2" />',
    '<div style={{ width: dynamicWidth, paddingInline: 12, display: "grid", gap: 8 }} />',
    '<div className={active ? "flex gap-2" : "grid p-4"} />',
    '<div className={active && "flex p-4"} />',
    'const { className } = { className: "flex p-4" }; <div className={className} />',
    'const source = { className: "grid gap-2" }; const { className: layout } = source; <div className={layout} />',
    'const classes = "flex"; let copied = classes; copied = "text-positive"; <div className={classes} />',
    'const spacing = "gap-2"; <div className={`flex ${spacing}`} />',
    'const spacing = "2" as const; <div className={"gap-" + spacing} />',
    '<div className={["flex", active && "gap-2"].filter(Boolean).join(" ")} />',
    'const styles = { width: dynamicWidth, padding: 8 }; <div style={styles} />',
    'const props = { className: "flex", style: { width: dynamicWidth } }; <div {...props} />',
    'const className = "flex"; <div {...{ className }} />',
    'const geometry = { width: value }; <div style={{ ...geometry, marginTop: 2 }} />',
    'function Example(props: { width: number }) { return <div style={props} /> }',
    '<Badge tone={positive ? "positive" : "negative"} variant="subtle">Value</Badge>',
    '<Widget color="positive" size="small" />',
    '<Widget color={userProvidedColor} accent="value" tone="positive" />',
    'function Example(props: { color?: string; tone?: "positive" | "negative"; accent?: "value" }) { return <Widget {...props} /> }',
    '<Widget tick={{ fill: "data", fontSize: 12 }} />',
    '<svg fill={undefined} stroke={null} />',
    '<div style={{ color: undefined, backgroundColor: null, width: 4 }} />',
    'const data = { color: "red", style: "some business data" }; save(data)',
    'import { Bar } from "recharts"; <Bar dataKey="value" width={width} dot={false} />',
    'import { XAxis } from "recharts"; <XAxis tick={<CustomTick />} />',
    'import { XAxis } from "recharts"; <XAxis tick={renderTick} />; function renderTick() { return <span /> }',
    'import { Line } from "recharts"; <Line activeDot={{ r: 4 }} />',
    'import { Bar } from "recharts"; <Bar label="Revenue" />',
    'import { Bar } from "recharts"; <Bar label={4} />',
    'import { Bar } from "recharts"; <Bar label={{ value: "Revenue", position: "top", offset: 4 }} />',
    'import { XAxis } from "recharts"; import type { ReactElement } from "react"; declare function getTick(): ReactElement; <XAxis tick={getTick()} />',
    'import { createElement } from "react"; createElement("div", { className: "grid gap-2" })',
  ])(
    'accepts layout and semantic APIs: %s',
    async (code) => {
      expect(await lint(code)).toEqual([])
    },
    20_000,
  )

  it.each([
    '<div className="flex bg-surface text-content rounded-xl" />',
    '<div className={active ? "text-positive" : "text-danger"} />',
    '<div className={active && "bg-surface"} />',
    '<div className="md:hover:[&>span]:text-positive" />',
    'const styles = "text-content"; <div className={styles} />',
    '<Widget color="text-positive" />',
    '<Card accent="bg-positive" />',
    'import { TEXT_TONES } from "@/shared/ui/textAppearance/textTones"; <Widget color={TEXT_TONES.positive} />',
    'const style = { badge: "text-positive" }; <div className={style.badge} />',
    'const tone = "positive" as const; <div className={`text-${tone}`} />',
    '<div className={["flex", active && "bg-surface"].filter(Boolean).join(" ")} />',
    'import { clsx as classes } from "clsx"; <div className={classes("flex", { "bg-surface": active })} />',
    'import { TEXT_TONES } from "@/shared/ui/textAppearance/textTones"; <div className={TEXT_TONES.positive} />',
    'import { DATA_TABLE_STYLES } from "@/shared/ui/tableStyles"; <div className={DATA_TABLE_STYLES.panel} />',
    'const props = { className: "text-content" }; <div {...props} />',
    'const className = "text-content"; <div {...{ className }} />',
    'const props = visible ? { className: "text-content" } : {}; <div {...props} />',
    'const props = { className: "text-content" } as unknown; <div {...props} />',
    'const props = { className: "text-content" }; <div {...{ ...props }} />',
    'import { createElement as element } from "react"; element("div", { className: "text-content" })',
    'import * as React from "react"; React.cloneElement(<div />, { className: "text-content" })',
    'import { createElement as h } from "react"; const element = h; element("div", { className: "text-content" })',
    'import * as React from "react"; React["createElement"]("div", { className: "text-content" })',
    'import * as React from "react"; const method = "cloneElement"; React[method](<div />, { className: "text-content" })',
    'import { twMerge as merge } from "tailwind-merge"; const classes = ["text-content"]; <div className={merge(...classes)} />',
    'function Example({ className }: { className: "flex" | "text-positive" }) { return <div className={className} /> }',
    'import type { HTMLAttributes } from "react"; const props: HTMLAttributes<HTMLDivElement> = { className: "text-content" }; <div {...props} />',
  ])('identifies non-layout classes: %s', async (code) => {
    const messages = await lint(code)
    expect(messages).toHaveLength(1)
    expect(messages[0].messageId).toBe('nonLayoutClass')
    expect(messages[0].severity).toBe(2)
    expect(messages[0].message).toContain('[ui-no-adhoc-styling]')
    expect(messages[0]).not.toHaveProperty('fix')
  })

  it.each([
    '<div style={{ color: "var(--color-positive)", width: 4, backgroundColor: color }} />',
    'const style = { fontSize: 12, fontWeight: 600 }; <div style={style} />',
    'const style = { color: "red" }; <div style={{ ...style, padding: 4 }} />',
    '<div {...{ style: { color: "red", width: 4 } }} />',
    'const key = "color"; <div style={{ [key]: value }} />',
    '<svg fill={value} stroke="currentColor" />',
    '<stop stopColor="red" stopOpacity={0.3} />',
    '<feFlood floodColor="#123456" />',
    '<Widget color="#123456" />',
    '<Widget color="var(--color-positive)" />',
    '<svg stroke-width={2} font-size="12" />',
    'import { Bar as ChartBar } from "recharts"; <ChartBar fill={color} />',
    'import { Line } from "recharts"; <Line isAnimationActive={true} animationDuration={300} />',
    'import * as Charts from "recharts"; <Charts.Bar strokeWidth={2} />',
    'import { Bar } from "recharts"; const RenamedBar = Bar; <RenamedBar radius={[3, 3, 0, 0]} />',
    'import { XAxis } from "recharts"; <XAxis tick={{ fill: color, fontSize: 11 }} />',
    'import { Line } from "recharts"; <Line activeDot={{ r: 4, fill: color }} />',
    'import { Tooltip } from "recharts"; <Tooltip contentStyle={{ color: "red", padding: 4 }} />',
    'import { Bar } from "recharts"; const props = { fill: "red", strokeWidth: 2 }; <Bar {...props} />',
    'import { createElement } from "react"; import { Bar as B } from "recharts"; createElement(B, { fill: "red" })',
    'import { cloneElement } from "react"; cloneElement(<svg />, { fill: "red" })',
    'function Example(style: { color: string; width: number }) { return <div style={style} /> }',
  ])('identifies visual properties: %s', async (code) => {
    const messages = await lint(code)
    expect(messages.length).toBeGreaterThan(0)
    expect(
      messages.every(({ messageId }) => messageId === 'nonLayoutStyle'),
    ).toBe(true)
  })

  it.each([
    '<div className={getClasses()} />',
    'function Example({ className }: { className: string }) { return <div className={className} /> }',
    '<div className={`mt-${spacing}`} />',
    '<div className={"gap-" + spacing} />',
    '<div style={getStyles()} />',
    'import type { CSSProperties } from "react"; const style: CSSProperties = { width: 4 }; style.color = "red"; <div style={style} />',
    'const props: { className?: string } = {}; props.className = "bg-surface"; <div {...props} />',
    'const classes = ["flex"]; classes.push("bg-surface"); <div className={classes.join(" ")} />',
    'import type { CSSProperties } from "react"; const style: CSSProperties = { width: 4 }; const copy = style; copy.color = "red"; <div style={style} />',
    'import type { CSSProperties } from "react"; const style: CSSProperties = { width: 4 }; Object.assign(style, { color: "red" }); <div style={style} />',
    'const source = { join: () => "bg-surface" }; <div className={source.join(" ")} />',
    'const a = b; const b = a; <div style={a} />',
    '<div style={{ ...getStyles(), width: 4 }} />',
    '<div style={{ [unknownKey]: value }} />',
    '<div {...getProps()} />',
    '<div {...{ get className() { return getClasses() } }} />',
    'function Example(style: Record<string, string>) { return <div style={style} /> }',
    'function Example(props: { className?: string }) { return <div {...props} /> }',
    'import type { CSSProperties } from "react"; function Example(style: CSSProperties) { return <div style={style} /> }',
    'let classes = "flex"; classes = getClasses(); <div className={classes} />',
  ])(
    'reports unverifiable values without asserting visual styling: %s',
    async (code) => {
      const messages = await lint(code)
      expect(messages).toHaveLength(1)
      expect(messages[0].messageId).toBe('unverifiableStyle')
    },
  )

  it('reports known classes separately from opaque template parts', async () => {
    const messages = await lint(
      '<div className={`flex text-sm ${getClasses()}`} />',
    )
    expect(messages.map(({ messageId }) => messageId)).toEqual([
      'nonLayoutClass',
      'unverifiableStyle',
    ])
    expect(messages[0].message).toContain('"text-sm"')
  })

  it('retains resolved template values when another interpolation is opaque', async () => {
    const messages = await lint(
      'const tone = "text-positive"; <div className={`${tone} ${getClasses()}`} />',
    )
    expect(messages.map(({ messageId }) => messageId)).toEqual([
      'nonLayoutClass',
      'unverifiableStyle',
    ])
    expect(messages[0].message).toContain('"text-positive"')
  })

  it('separates a known visual style from an opaque spread', async () => {
    expect(
      (await lint('<div style={{ color, ...getStyles() }} />')).map(
        ({ messageId }) => messageId,
      ),
    ).toEqual(['nonLayoutStyle', 'unverifiableStyle'])
  })

  it('groups and deduplicates all visual properties in one style usage', async () => {
    const [message] = await lint(
      '<div style={{ color, backgroundColor: color, fontSize: 12 }} />',
    )
    expect(message.message).toContain(
      '"style.backgroundColor", "style.color", "style.fontSize"',
    )
  })

  it.each([
    'src/shared/ui/ColHeader.view.tsx',
    'src/shared/ui/SidePanel.view.test.tsx',
    'src/app/DashboardPanelErrorBoundary.view.test.tsx',
  ])('exempts styling in %s', async (file) => {
    expect(
      await lint(
        '<div className="text-red-500" style={{ color: "red" }} />',
        file,
      ),
    ).toEqual([])
  })

  it.each([
    'src/app/App.feature.tsx',
    'src/domains/portfolio/features/data-quality/features/assessment/helpers/formatters/dataQualityDimensionLabels.ts',
    'src/shared/helpers/presenters/getErrorMessage.ts',
  ])(
    'also checks application, helper and utility styling in %s',
    async (file) => {
      expect(
        (
          await lint(
            'import { createElement } from "react"; createElement("div", { style: { color: "red" } })',
            file,
          )
        ).map(({ messageId }) => messageId),
      ).toEqual(['nonLayoutStyle'])
    },
  )

  it.each([
    'import "@/domains/portfolio/feature.css"',
    'import "./feature.module.scss?inline"',
    'export * from "@/app/styles.css"',
    'const styles = import("@/app/styles.css")',
  ])(
    'reports local stylesheets outside the design system: %s',
    async (code) => {
      expect((await lint(code)).map(({ messageId }) => messageId)).toEqual([
        'outsideStylesheet',
      ])
    },
  )

  it.each([
    'import "./index.css"',
    'import "@/index.css?inline"',
    'import "@/shared/ui/component.css"',
    'import "@/shared/theme/tokens.css"',
    'import "some-library/styles.css"',
  ])('accepts design-system infrastructure: %s', async (code) => {
    expect(await lint(code)).toEqual([])
  })

  it('does not exempt a domain stylesheet imported by shared UI', async () => {
    expect(
      (
        await lint(
          'import "@/domains/portfolio/styles.css"',
          'src/shared/ui/ColHeader.view.tsx',
        )
      ).map(({ messageId }) => messageId),
    ).toEqual(['outsideStylesheet'])
  })
})

describe('styling boundary file guards', () => {
  const linter = new Linter({ cwd: '/workspace' })
  it.each([
    '/workspace/src/example.test.tsx',
    '/workspace/src/example.spec.tsx',
    '/workspace/src/example.generated.tsx',
    '/workspace/src/example.gen.tsx',
    '/workspace/src/__tests__/Example.tsx',
    '/workspace/src/generated/Example.tsx',
    '/workspace/src/__generated__/Example.tsx',
    '/workspace/src/shared/ui/Example.tsx',
    '/workspace/src/shared/theme/Example.tsx',
    '/workspace/scripts/Example.tsx',
  ])('does not require type services for exempt file %s', (filename) => {
    expect(
      linter.verify(
        '<div className="text-red-500" />',
        {
          files: ['**/*.tsx'],
          languageOptions: {
            parser: tseslint.parser,
            parserOptions: { ecmaFeatures: { jsx: true } },
          },
          plugins: {
            local: { rules: { 'no-domain-styling': noDomainStyling } },
          },
          rules: { 'local/no-domain-styling': 'warn' },
        },
        { filename },
      ),
    ).toEqual([])
  })
})
