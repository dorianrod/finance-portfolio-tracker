import { readFileSync } from 'node:fs'

import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'

import { PAGE_THEME_COLORS } from '../src/shared/theme/pageThemeColors'
import { themeHtmlPlugin } from '../themeHtmlPlugin'

const template = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

function bootstrap(
  { stored, legacy, prefersDark = false, blocked = false },
  colors = PAGE_THEME_COLORS,
) {
  const plugin = themeHtmlPlugin(colors)
  const html = plugin.transformIndexHtml.handler(template)
  const dom = new JSDOM(html, {
    url: 'https://dashboard.example',
    runScripts: 'dangerously',
    beforeParse(window) {
      window.matchMedia = () => ({ matches: prefersDark })
      if (stored !== undefined)
        window.localStorage.setItem('finance-dashboard-theme:v1', stored)
      if (legacy !== undefined)
        window.localStorage.setItem('finance-dashboard-theme', legacy)
      if (blocked)
        Object.defineProperty(window, 'localStorage', {
          get() {
            throw new Error('Storage unavailable')
          },
        })
    },
  })
  const result = {
    theme: dom.window.document.documentElement.dataset.theme,
    color: dom.window.document
      .getElementsByName('theme-color')[0]
      .getAttribute('content'),
  }
  dom.window.close()
  return result
}

describe('prepaint theme metadata', () => {
  it.each([
    [{}, 'light'],
    [{ prefersDark: true }, 'dark'],
    [{ stored: '"light"', prefersDark: true }, 'light'],
    [{ stored: '"dark"' }, 'dark'],
    [{ stored: 'broken', prefersDark: true }, 'dark'],
    [{ stored: '"unknown"', prefersDark: true }, 'dark'],
    [{ legacy: 'dark' }, 'dark'],
    [{ stored: '"light"', legacy: 'dark' }, 'light'],
    [{ blocked: true, prefersDark: true }, 'dark'],
  ])('selects %s before React starts', (input, theme) => {
    expect(bootstrap(input)).toEqual({ theme, color: PAGE_THEME_COLORS[theme] })
  })

  it('generates both metadata branches from the supplied canonical tokens', () => {
    const colors = { light: 'light-token', dark: 'dark-token' }
    expect(bootstrap({}, colors)).toEqual({
      theme: 'light',
      color: colors.light,
    })
    expect(bootstrap({ prefersDark: true }, colors)).toEqual({
      theme: 'dark',
      color: colors.dark,
    })
    expect(
      themeHtmlPlugin(colors).transformIndexHtml.handler(template),
    ).toContain('content="light-token"')
  })
})
