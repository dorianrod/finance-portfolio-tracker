import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import componentRole from './eslint-rules/component-role.js'
import featureFolderLayout from './eslint-rules/feature-folder-layout.js'
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
import noSharedUiClassname from './eslint-rules/no-shared-ui-classname.js'
import noSharedUiInternalLayout from './eslint-rules/no-shared-ui-internal-layout.js'
import publicApiFirst from './eslint-rules/public-api-first.js'
import requireChildrenComposition from './eslint-rules/require-children-composition.js'
import sharedFeatureUsage from './eslint-rules/shared-feature-usage.js'
import singlePublicExport from './eslint-rules/single-public-export.js'
import stateComponentContract from './eslint-rules/state-component-contract.js'
import { eslintProjectFingerprint } from './scripts/eslint-project-fingerprint.mjs'

export default defineConfig([
  globalIgnores(['dist', 'storybook-static']),
  {
    settings: {
      'local/project-fingerprint': eslintProjectFingerprint(
        import.meta.dirname,
      ),
    },
  },
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
          'feature-folder-layout': featureFolderLayout,
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
          'no-shared-ui-classname': noSharedUiClassname,
          'no-shared-ui-internal-layout': noSharedUiInternalLayout,
          'public-api-first': publicApiFirst,
          'require-children-composition': requireChildrenComposition,
          'shared-feature-usage': sharedFeatureUsage,
          'single-public-export': singlePublicExport,
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
      'local/feature-folder-layout': 'error',
      'local/i18n-consistency': 'error',
      'local/import-boundaries': 'error',
      'local/max-hooks-per-component': ['error', { max: 6 }],
      'local/no-complex-component-calculation': 'error',
      'local/no-complex-jsx-condition': 'error',
      'local/no-complex-jsx-map': 'error',
      'local/no-component-module-logic': 'error',
      'local/no-domain-accessibility': 'error',
      'local/no-domain-styling': 'error',
      'local/no-effects-in-components': 'error',
      'local/no-hardcoded-ui-strings': 'error',
      'local/no-inline-format-fallback': 'error',
      'local/no-prop-drilling': 'error',
      'local/no-shared-ui-classname': 'error',
      'local/no-shared-ui-internal-layout': 'error',
      'local/require-children-composition': 'error',
      'local/shared-feature-usage': 'error',
      'local/state-component-contract': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['**/*.{test,spec,stories}.{ts,tsx}', '**/__tests__/**'],
    rules: {
      // Branching and size are independent signals, including in JSX.
      complexity: ['error', { max: 8, variant: 'modified' }],
      'max-lines-per-function': [
        'error',
        { max: 150, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      '**/*.{test,spec,stories}.{ts,tsx}',
      '**/__tests__/**',
      '**/*.d.ts',
      'src/shared/ui/storybook/**',
    ],
    rules: {
      'local/public-api-first': 'error',
      'local/single-public-export': 'error',
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
  {
    files: ['src/shared/ui/storybook/**/*.stories.tsx'],
    rules: {
      // CSF modules intentionally export story objects and demo renderers.
      'local/component-role': 'off',
      'local/no-hardcoded-ui-strings': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
])
