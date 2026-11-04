import type { Plugin } from 'vite'

import { PAGE_THEME_COLORS } from './src/shared/theme/pageThemeColors'

/*
 * @architecture-decision prepaint-theme-token-source
 * @rules ui-semantic-colors
 * @choice Generate synchronous bootstrap metadata from the canonical theme map.
 * @reason Initial paint and React synchronization must use the same colors.
 * @alternative A React-only effect updates metadata after the first paint.
 * @revisit The HTML/bootstrap pipeline or theme storage protocol changes.
 */
export function themeHtmlPlugin(
  colors: Readonly<
    Record<keyof typeof PAGE_THEME_COLORS, string>
  > = PAGE_THEME_COLORS,
): Plugin {
  return {
    name: 'canonical-theme-bootstrap',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html
          .replaceAll('__FINANCE_DEFAULT_THEME_COLOR__', colors.light)
          .replaceAll('__FINANCE_THEME_COLORS__', JSON.stringify(colors)),
    },
  }
}
