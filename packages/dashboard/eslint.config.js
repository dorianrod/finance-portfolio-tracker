import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import componentRole from './eslint-rules/component-role.js'
import i18nConsistency from './eslint-rules/i18n-consistency.js'
import importBoundaries from './eslint-rules/import-boundaries.js'
import maxHooksPerComponent from './eslint-rules/max-hooks-per-component.js'
import noComplexComponentCalculation from './eslint-rules/no-complex-component-calculation.js'
import noComplexJsxCondition from './eslint-rules/no-complex-jsx-condition.js'
import noComplexJsxMap from './eslint-rules/no-complex-jsx-map.js'
import noComponentModuleLogic from './eslint-rules/no-component-module-logic.js'
import noDomainAccessibility from './eslint-rules/no-domain-accessibility.js'
import noDomainStyling from './eslint-rules/no-domain-styling.js'
import noEffectsInComponents from './eslint-rules/no-effects-in-components.js'
import noHardcodedUiStrings from './eslint-rules/no-hardcoded-ui-strings.js'
import noInlineFormatFallback from './eslint-rules/no-inline-format-fallback.js'
import noPropDrilling from './eslint-rules/no-prop-drilling.js'
import requireChildrenComposition from './eslint-rules/require-children-composition.js'
import stateComponentContract from './eslint-rules/state-component-contract.js'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
    },
  },
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
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      local: {
        rules: {
          'component-role': componentRole,
          'i18n-consistency': i18nConsistency,
          'import-boundaries': importBoundaries,
          'max-hooks-per-component': maxHooksPerComponent,
          'no-complex-component-calculation': noComplexComponentCalculation,
          'no-complex-jsx-condition': noComplexJsxCondition,
          'no-complex-jsx-map': noComplexJsxMap,
          'no-component-module-logic': noComponentModuleLogic,
          'no-domain-accessibility': noDomainAccessibility,
          'no-domain-styling': noDomainStyling,
          'no-effects-in-components': noEffectsInComponents,
          'no-hardcoded-ui-strings': noHardcodedUiStrings,
          'no-inline-format-fallback': noInlineFormatFallback,
          'no-prop-drilling': noPropDrilling,
          'require-children-composition': requireChildrenComposition,
          'state-component-contract': stateComponentContract,
        },
      },
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'default-case-last': 'error',
      eqeqeq: ['error', 'smart'],
      'no-alert': 'error',
      'no-else-return': 'error',
      'no-lonely-if': 'error',
      'no-negated-condition': 'error',
      'no-nested-ternary': 'error',
      'no-restricted-properties': [
        'error',
        {
          property: 'toFixed',
          message: 'Format display values through a formatter hook.',
        },
        {
          property: 'toLocaleDateString',
          message: 'Format dates through useFormatDate.',
        },
        {
          property: 'toLocaleString',
          message: 'Format display values through a formatter hook.',
        },
        {
          property: 'toLocaleTimeString',
          message: 'Format dates through useFormatDate.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "NewExpression[callee.object.name='Intl'][callee.property.name='DateTimeFormat']",
          message: 'Format dates through useFormatDate.',
        },
        {
          selector:
            "NewExpression[callee.object.name='Intl'][callee.property.name='NumberFormat']",
          message: 'Format display values through a formatter hook.',
        },
      ],
      'no-unneeded-ternary': 'error',
      'object-shorthand': 'error',
      'prefer-object-spread': 'error',
      'prefer-template': 'error',
      radix: 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-deprecated': 'error',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
      'local/component-role': 'error',
      'local/i18n-consistency': 'error',
      'local/import-boundaries': 'error',
      'local/max-hooks-per-component': ['warn', { max: 6 }],
      'local/no-complex-component-calculation': 'error',
      'local/no-complex-jsx-condition': 'warn',
      'local/no-complex-jsx-map': 'warn',
      'local/no-component-module-logic': 'warn',
      'local/no-domain-accessibility': 'error',
      'local/no-domain-styling': 'warn',
      'local/no-effects-in-components': 'warn',
      'local/no-hardcoded-ui-strings': 'error',
      'local/no-inline-format-fallback': 'error',
      'local/no-prop-drilling': 'warn',
      'local/require-children-composition': 'error',
      'local/state-component-contract': 'error',
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
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      'local/no-hardcoded-ui-strings': 'off',
    },
  },
])
