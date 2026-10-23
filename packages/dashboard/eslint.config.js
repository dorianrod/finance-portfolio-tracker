import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import componentRole from './eslint-rules/component-role.js'
import maxHooksPerComponent from './eslint-rules/max-hooks-per-component.js'
import noComplexJsxCondition from './eslint-rules/no-complex-jsx-condition.js'
import noComplexJsxMap from './eslint-rules/no-complex-jsx-map.js'
import noComponentModuleLogic from './eslint-rules/no-component-module-logic.js'
import noEffectsInComponents from './eslint-rules/no-effects-in-components.js'
import noPropDrilling from './eslint-rules/no-prop-drilling.js'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['eslint-rules/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      local: {
        rules: {
          'component-role': componentRole,
          'max-hooks-per-component': maxHooksPerComponent,
          'no-complex-jsx-condition': noComplexJsxCondition,
          'no-complex-jsx-map': noComplexJsxMap,
          'no-component-module-logic': noComponentModuleLogic,
          'no-effects-in-components': noEffectsInComponents,
          'no-prop-drilling': noPropDrilling,
        },
      },
    },
    rules: {
      'default-case-last': 'error',
      eqeqeq: ['error', 'smart'],
      'no-alert': 'error',
      'no-else-return': 'error',
      'no-lonely-if': 'error',
      'no-negated-condition': 'error',
      'no-nested-ternary': 'error',
      'no-restricted-properties': ['error',
        { property: 'toFixed', message: 'Format display values through a formatter hook.' },
        { property: 'toLocaleDateString', message: 'Format dates through useFormatDate.' },
        { property: 'toLocaleString', message: 'Format display values through a formatter hook.' },
        { property: 'toLocaleTimeString', message: 'Format dates through useFormatDate.' },
      ],
      'no-restricted-syntax': ['error',
        {
          selector: "NewExpression[callee.object.name='Intl'][callee.property.name='DateTimeFormat']",
          message: 'Format dates through useFormatDate.',
        },
        {
          selector: "NewExpression[callee.object.name='Intl'][callee.property.name='NumberFormat']",
          message: 'Format display values through a formatter hook.',
        },
      ],
      'no-unneeded-ternary': 'error',
      'object-shorthand': 'error',
      'prefer-object-spread': 'error',
      'prefer-template': 'error',
      radix: 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'local/component-role': 'error',
      'local/max-hooks-per-component': ['warn', { max: 6 }],
      'local/no-complex-jsx-condition': 'warn',
      'local/no-complex-jsx-map': 'warn',
      'local/no-component-module-logic': 'warn',
      'local/no-effects-in-components': 'warn',
      'local/no-prop-drilling': 'warn',
    },
  },
  {
    files: ['src/shared/helpers/formatters/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-properties': 'off',
      'no-restricted-syntax': 'off',
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/domains/**'],
          message: 'Shared code must not depend on business domains.',
        }],
      }],
    },
  },
  {
    files: ['src/domains/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/app/**'],
          message: 'Business domains must not depend on the application shell.',
        }],
      }],
    },
  },
])
