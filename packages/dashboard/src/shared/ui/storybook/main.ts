import { resolve } from 'node:path'

import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: resolve(import.meta.dirname, 'vite.config.ts'),
      },
    },
  },
  stories: ['./stories/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-themes'],
  core: { disableTelemetry: true },
}

export default config
