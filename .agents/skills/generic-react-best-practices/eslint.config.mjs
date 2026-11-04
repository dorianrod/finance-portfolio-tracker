import { resolve } from 'node:path'

import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import local from './eslint-rules/index.js'
import { eslintProjectFingerprint } from './scripts/eslint-project-fingerprint.mjs'

export function createReactConfig({
  projectRoot,
  catalogFile,
  ignores = ['dist', 'storybook-static'],
}) {
  catalogFile = resolve(projectRoot, catalogFile)
  return defineConfig([
    globalIgnores(ignores),
    {
      settings: {
        'local/project-fingerprint': eslintProjectFingerprint(projectRoot, {
          extraFiles: [catalogFile],
        }),
        'react-best-practices/catalogFile': catalogFile,
      },
    },
    {
      files: ['**/*.{js,mjs,cjs,ts,tsx}'],
      linterOptions: {
        reportUnusedDisableDirectives: 'error',
      },
      processor: local.processors.suppressions,
      plugins: {
        local,
        'simple-import-sort': simpleImportSort,
      },
      rules: {
        'local/require-reviewed-eslint-suppression': 'error',
        'local/reviewed-eslint-suppression': 'warn',
        'local/no-conditional-test-assertions': 'error',
        'local/no-test-style-assertions': 'error',
        'local/prefer-semantic-test-queries': 'error',
        'local/test-fixture-contract': 'error',
        'local/helper-module-contract': 'error',
        'simple-import-sort/exports': 'error',
        'simple-import-sort/imports': 'error',
      },
    },
    {
      files: ['tests/**/*.{js,mjs}'],
      extends: [js.configs.recommended],
      languageOptions: { globals: globals.node },
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
          tsconfigRootDir: projectRoot,
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
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'react',
                importNames: ['forwardRef'],
                message: 'React 19 components accept ref as a typed prop.',
              },
            ],
          },
        ],
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
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/no-floating-promises': [
          'error',
          { ignoreVoid: false },
        ],
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/no-unsafe-argument': 'error',
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',
        '@typescript-eslint/no-unsafe-return': 'error',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/no-duplicate-type-constituents': 'error',
        '@typescript-eslint/no-redundant-type-constituents': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/prefer-promise-reject-errors': 'error',
        '@typescript-eslint/no-base-to-string': 'error',
        '@typescript-eslint/restrict-plus-operands': 'error',
        '@typescript-eslint/restrict-template-expressions': 'error',
        '@typescript-eslint/no-misused-spread': 'error',
        '@typescript-eslint/unbound-method': 'error',
        '@typescript-eslint/only-throw-error': 'error',
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/no-import-type-side-effects': 'error',
        '@typescript-eslint/no-unsafe-type-assertion': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-unnecessary-type-conversion': 'error',
        '@typescript-eslint/return-await': [
          'error',
          'error-handling-correctness-only',
        ],
        '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
        '@typescript-eslint/no-confusing-void-expression': [
          'error',
          { ignoreArrowShorthand: true },
        ],
        'react-hooks/unsupported-syntax': 'error',
        'react-hooks/incompatible-library': 'error',
        'react-hooks/exhaustive-deps': 'error',
        'simple-import-sort/exports': 'error',
        'simple-import-sort/imports': 'error',
        'local/api-hook-contract': 'error',
        'local/api-business-destructuring': 'error',
        'local/atom-contract': 'error',
        'local/entity-type-files': 'error',
        'local/explicit-nullability': 'error',
        'local/formatter-contract': 'error',
        'local/no-lossy-boolean-transform': 'error',
        'local/no-memo-only-service': 'error',
        'local/no-number-string-roundtrip': 'error',
        'local/no-returned-local-state': 'error',
        'local/no-service-presentation': 'error',
        'local/no-overwritten-ui-props': 'error',
        'local/no-sort-for-extremum': 'error',
        'local/prefer-functional-state-update': 'error',
        'local/prefer-usecallback': 'error',
        'local/component-role': 'error',
        'local/feature-folder-layout': ['error', { maxFeatureDepth: 2 }],
        'local/i18n-consistency': 'error',
        'local/import-boundaries': 'error',
        'local/max-hooks-per-component': ['error', { max: 6 }],
        'local/no-browser-in-pure-helpers': 'error',
        'local/no-complex-component-calculation': 'error',
        'local/no-complex-jsx-condition': 'error',
        'local/no-complex-jsx-map': 'error',
        'local/no-component-module-logic': 'error',
        'local/no-component-data-pipeline': 'error',
        'local/no-domain-accessibility': 'error',
        'local/no-domain-styling': 'error',
        'local/no-effects-in-components': 'error',
        'local/no-hardcoded-ui-strings': 'error',
        'local/no-hardcoded-colors': 'error',
        'local/no-helper-context-params': 'error',
        'local/no-inline-format-fallback': 'error',
        'local/no-inline-number-display': 'error',
        'local/no-prop-drilling': 'error',
        'local/no-react-context': 'error',
        'local/no-shared-ui-classname': 'error',
        'local/no-shared-ui-internal-layout': 'error',
        'local/no-ui-string-concat': 'error',
        'local/require-children-composition': 'error',
        'local/shared-feature-usage': 'error',
        'local/review-shared-feature-sharing': 'warn',
        'local/state-component-contract': 'error',
      },
    },
    {
      files: ['src/**/*.{ts,tsx}'],
      ignores: ['**/*.{test,spec,stories}.{ts,tsx}', '**/__tests__/**'],
      rules: {
        '@typescript-eslint/strict-boolean-expressions': [
          'error',
          {
            allowNumber: false,
            allowNullableNumber: false,
            allowString: true,
            allowNullableString: true,
            allowNullableBoolean: true,
            allowNullableObject: true,
            allowAny: false,
          },
        ],
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
}

export default defineConfig([
  {
    files: ['**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    processor: local.processors.suppressions,
    plugins: { local, 'simple-import-sort': simpleImportSort },
    rules: {
      'local/require-reviewed-eslint-suppression': 'error',
      'local/reviewed-eslint-suppression': 'warn',
      'local/no-conditional-test-assertions': 'error',
      'local/no-test-style-assertions': 'error',
      'local/prefer-semantic-test-queries': 'error',
      'local/test-fixture-contract': 'error',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
    },
  },
])
