import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { beforeAll, describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '../..')
const filePath = resolve(directory, 'src/shared/ui/Tooltip.view.tsx')
const eslint = new ESLint({ cwd: directory })
const imports = `import type {ComponentProps} from 'react';`

beforeAll(async () => {
  await eslint.lintText('', { filePath })
}, 20_000)

async function lint(
  handler,
  prelude = '',
  parameter = 'props: ComponentProps<"button">',
) {
  const [result] = await eslint.lintText(
    `${imports} function Trigger(${parameter}) {const activate = () => {}; ${prelude} return <button {...props} onClick={${handler}}/>}`,
    { filePath },
  )
  return result.messages.filter(
    (message) =>
      message.fatal || message.ruleId === 'local/no-overwritten-ui-props',
  )
}

describe('caller event composition', () => {
  it.each([
    `event => {void props.onClick; activate()}`,
    `event => {if (props.onClick) activate()}`,
    `event => () => props.onClick?.(event)`,
    `event => {const deferred = () => props.onClick?.(event); activate()}`,
    `event => {if (false) props.onClick?.(event)}`,
    `event => false && props.onClick?.(event)`,
    `event => true ? undefined : props.onClick?.(event)`,
  ])('rejects a reference without invocation: %s', async (handler) => {
    expect(await lint(handler)).toMatchObject([
      { messageId: 'overwritten', severity: 2 },
    ])
  })
  it.each([
    `event => {activate(); props.onClick?.(event)}`,
    `event => props.onClick?.(activate())`,
    `event => {if (enabled) props.onClick?.(event); if (event.defaultPrevented) return; activate()}`,
  ])(
    'requires forwarding before built-in work on every path: %s',
    async (handler) => {
      expect(await lint(handler)).toMatchObject([
        { messageId: 'callerFirst', severity: 2 },
      ])
    },
  )
  it.each([
    `event => {props.onClick?.(event); activate()}`,
    `event => {if (event.defaultPrevented) return; props.onClick?.(event); activate()}`,
    `event => {props.onClick?.(event); if (other.defaultPrevented) return; activate()}`,
    `event => {props.onClick?.(event); event.defaultPrevented && activate()}`,
    `event => {props.onClick?.(event); if (event.defaultPrevented) {} activate()}`,
    `event => {props.onClick?.(event); if (event.defaultPrevented) return; props.onClick?.(event); activate()}`,
  ])('requires a cancellation check after the caller: %s', async (handler) => {
    expect(await lint(handler)).toMatchObject([
      { messageId: 'cancellation', severity: 2 },
    ])
  })
  it.each([
    `props.onClick`,
    `event => props.onClick?.(event)`,
    `event => {props.onClick?.(event); if (event.defaultPrevented) return; activate()}`,
    `event => {props.onClick?.(event); if (!event.defaultPrevented) activate()}`,
    `event => {props.onClick?.(event); if (event.defaultPrevented === false) activate()}`,
    `event => {props.onClick?.(event); if (true === event.defaultPrevented) return; activate()}`,
    `event => {props.onClick?.(event); !event.defaultPrevented && activate()}`,
    `event => {props.onClick?.(event); event.defaultPrevented || activate()}`,
    `event => {props.onClick?.(event); return event.defaultPrevented ? undefined : activate()}`,
    `event => {event.stopPropagation(); props.onClick?.(event); if(event.defaultPrevented) return; activate()}`,
    `event => {const input = event; props.onClick?.(input); if(input.defaultPrevented) return; activate()}`,
    `event => {if (enabled) {props.onClick?.(event); if(event.defaultPrevented) return; activate()}}`,
    `event => {if (!document.body.contains(event.relatedTarget as Node)) props.onClick?.(event)}`,
    `event => {true && props.onClick?.(event); if(event.defaultPrevented) return; activate()}`,
  ])(
    'allows forwarding, native event mechanics and guarded work: %s',
    async (handler) => {
      expect(await lint(handler)).toEqual([])
    },
  )
  it('follows an immutable callback alias', async () => {
    expect(
      await lint(
        `event => {click?.(event); if(event.defaultPrevented) return; activate()}`,
        'const click = props.onClick;',
      ),
    ).toEqual([])
  })
  it('follows a props alias', async () => {
    expect(
      await lint(
        `event => {inherited.onClick?.(event); if(event.defaultPrevented) return; activate()}`,
        'const inherited = props;',
      ),
    ).toEqual([])
  })
  it('follows a static computed callback key', async () => {
    expect(
      await lint(
        `event => {props[key]?.(event); activate()}`,
        `const key = 'onClick';`,
      ),
    ).toMatchObject([{ messageId: 'cancellation', severity: 2 }])
  })
  it('checks computed destructured callbacks', async () => {
    expect(
      await lint(
        `event => {activate(); click?.(event)}`,
        '',
        '{["onClick"]: click, ...props}: ComponentProps<"button">',
      ),
    ).toMatchObject([{ messageId: 'callerFirst', severity: 2 }])
  })
  it('checks named local handlers', async () => {
    expect(
      await lint(
        'click',
        'function click(event: React.MouseEvent<HTMLButtonElement>) {activate(); props.onClick?.(event)}',
      ),
    ).toMatchObject([{ messageId: 'callerFirst', severity: 2 }])
  })
  it('checks destructured and renamed native handlers', async () => {
    expect(
      await lint(
        `event => {activate(); click?.(event)}`,
        '',
        '{onClick: click, ...props}: ComponentProps<"button">',
      ),
    ).toMatchObject([{ messageId: 'callerFirst', severity: 2 }])
  })
  it('honors callback removal from the public contract', async () => {
    expect(
      await lint(
        'event => activate()',
        '',
        'props: Omit<ComponentProps<"button">, "onClick">',
      ),
    ).toEqual([])
  })
})
