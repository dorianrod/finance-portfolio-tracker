import '@/index.css'
import '@/i18n/i18n'

import { withThemeByDataAttribute } from '@storybook/addon-themes'
import type { Preview } from '@storybook/react-vite'
import { createElement } from 'react'

import { Surface } from '../Surface.view'

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    (Story) =>
      createElement(
        Surface,
        { variant: 'canvas', tone: 'default', className: 'p-4' },
        createElement(Story),
      ),
    withThemeByDataAttribute({
      themes: { dark: 'dark', light: 'light' },
      defaultTheme: 'dark',
      attributeName: 'data-theme',
      parentSelector: 'html',
    }),
  ],
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    options: {
      storySort: {
        order: [
          'Controls',
          'Typography',
          'Surfaces',
          'Badges',
          'Navigation',
          'Panels',
          'Tables',
          'Icons',
          'Charts',
        ],
      },
    },
  },
}

export default preview
