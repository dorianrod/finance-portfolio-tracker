import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import apiBusinessDestructuring from './eslint-rules/api-business-destructuring.js'
import apiHookContract from './eslint-rules/api-hook-contract.js'
import componentRole from './eslint-rules/component-role.js'
import entityTypeFiles from './eslint-rules/entity-type-files.js'
import eslintSuppressionProcessor from './eslint-rules/eslint-suppression-processor.js'
import featureFolderLayout from './eslint-rules/feature-folder-layout.js'
import formatterContract from './eslint-rules/formatter-contract.js'
import i18nConsistency from './eslint-rules/i18n-consistency.js'
import importBoundaries from './eslint-rules/import-boundaries.js'
import maxHooksPerComponent from './eslint-rules/max-hooks-per-component.js'
import noBrowserInPureHelpers from './eslint-rules/no-browser-in-pure-helpers.js'
import noComplexComponentCalculation from './eslint-rules/no-complex-component-calculation.js'
import noComplexJsxCondition from './eslint-rules/no-complex-jsx-condition.js'
import noComplexJsxMap from './eslint-rules/no-complex-jsx-map.js'
import noComponentDataPipeline from './eslint-rules/no-component-data-pipeline.js'
import noComponentModuleLogic from './eslint-rules/no-component-module-logic.js'
import noConditionalTestAssertions from './eslint-rules/no-conditional-test-assertions.js'
import noDomainAccessibility from './eslint-rules/no-domain-accessibility.js'
import noDomainStyling from './eslint-rules/no-domain-styling.js'
import noEffectsInComponents from './eslint-rules/no-effects-in-components.js'
import noHardcodedColors from './eslint-rules/no-hardcoded-colors.js'
import noHardcodedUiStrings from './eslint-rules/no-hardcoded-ui-strings.js'
import noHelperContextParams from './eslint-rules/no-helper-context-params.js'
import noInlineFormatFallback from './eslint-rules/no-inline-format-fallback.js'
import noLossyBooleanTransform from './eslint-rules/no-lossy-boolean-transform.js'
import noNumberStringRoundtrip from './eslint-rules/no-number-string-roundtrip.js'
import noOverwrittenUiProps from './eslint-rules/no-overwritten-ui-props.js'
import noPropDrilling from './eslint-rules/no-prop-drilling.js'
import noReactContext from './eslint-rules/no-react-context.js'
import noReturnedLocalState from './eslint-rules/no-returned-local-state.js'
import noServicePresentation from './eslint-rules/no-service-presentation.js'
import noSharedUiClassname from './eslint-rules/no-shared-ui-classname.js'
import noSharedUiInternalLayout from './eslint-rules/no-shared-ui-internal-layout.js'
import noSortForExtremum from './eslint-rules/no-sort-for-extremum.js'
import noTestStyleAssertions from './eslint-rules/no-test-style-assertions.js'
import noUiStringConcat from './eslint-rules/no-ui-string-concat.js'
import preferFunctionalStateUpdate from './eslint-rules/prefer-functional-state-update.js'
import preferSemanticTestQueries from './eslint-rules/prefer-semantic-test-queries.js'
import publicApiFirst from './eslint-rules/public-api-first.js'
import requireChildrenComposition from './eslint-rules/require-children-composition.js'
import requireReviewedEslintSuppression from './eslint-rules/require-reviewed-eslint-suppression.js'
import reviewSharedFeatureSharing from './eslint-rules/review-shared-feature-sharing.js'
import reviewedEslintSuppression from './eslint-rules/reviewed-eslint-suppression.js'
import sharedFeatureUsage from './eslint-rules/shared-feature-usage.js'
import singlePublicExport from './eslint-rules/single-public-export.js'
import stateComponentContract from './eslint-rules/state-component-contract.js'
import testFixtureContract from './eslint-rules/test-fixture-contract.js'
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
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    processor: eslintSuppressionProcessor,
    plugins: {
      local: {
        rules: {
          'api-hook-contract': apiHookContract,
          'api-business-destructuring': apiBusinessDestructuring,
          'component-role': componentRole,
          'entity-type-files': entityTypeFiles,
          'feature-folder-layout': featureFolderLayout,
          'formatter-contract': formatterContract,
          'i18n-consistency': i18nConsistency,
          'import-boundaries': importBoundaries,
          'max-hooks-per-component': maxHooksPerComponent,
          'no-browser-in-pure-helpers': noBrowserInPureHelpers,
          'no-complex-component-calculation': noComplexComponentCalculation,
          'no-conditional-test-assertions': noConditionalTestAssertions,
          'no-complex-jsx-condition': noComplexJsxCondition,
          'no-complex-jsx-map': noComplexJsxMap,
          'no-component-module-logic': noComponentModuleLogic,
          'no-component-data-pipeline': noComponentDataPipeline,
          'no-domain-accessibility': noDomainAccessibility,
          'no-domain-styling': noDomainStyling,
          'no-effects-in-components': noEffectsInComponents,
          'no-hardcoded-ui-strings': noHardcodedUiStrings,
          'no-hardcoded-colors': noHardcodedColors,
          'no-helper-context-params': noHelperContextParams,
          'no-inline-format-fallback': noInlineFormatFallback,
          'no-lossy-boolean-transform': noLossyBooleanTransform,
          'no-number-string-roundtrip': noNumberStringRoundtrip,
          'no-overwritten-ui-props': noOverwrittenUiProps,
          'no-prop-drilling': noPropDrilling,
          'no-react-context': noReactContext,
          'no-returned-local-state': noReturnedLocalState,
          'no-service-presentation': noServicePresentation,
          'no-shared-ui-classname': noSharedUiClassname,
          'no-shared-ui-internal-layout': noSharedUiInternalLayout,
          'no-sort-for-extremum': noSortForExtremum,
          'no-test-style-assertions': noTestStyleAssertions,
          'no-ui-string-concat': noUiStringConcat,
          'prefer-functional-state-update': preferFunctionalStateUpdate,
          'prefer-semantic-test-queries': preferSemanticTestQueries,
          'public-api-first': publicApiFirst,
          'require-children-composition': requireChildrenComposition,
          'require-reviewed-eslint-suppression':
            requireReviewedEslintSuppression,
          'reviewed-eslint-suppression': reviewedEslintSuppression,
          'review-shared-feature-sharing': reviewSharedFeatureSharing,
          'shared-feature-usage': sharedFeatureUsage,
          'single-public-export': singlePublicExport,
          'state-component-contract': stateComponentContract,
          'test-fixture-contract': testFixtureContract,
        },
      },
      'simple-import-sort': simpleImportSort,
    },
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
      'react-hooks/unsupported-syntax': 'error',
      'react-hooks/incompatible-library': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
      'local/api-hook-contract': 'error',
      'local/api-business-destructuring': 'error',
      'local/entity-type-files': 'error',
      'local/formatter-contract': 'error',
      'local/no-lossy-boolean-transform': 'error',
      'local/no-number-string-roundtrip': 'error',
      'local/no-returned-local-state': 'error',
      'local/no-service-presentation': 'error',
      'local/no-overwritten-ui-props': 'error',
      'local/no-sort-for-extremum': 'error',
      'local/prefer-functional-state-update': 'error',
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
          allowAny: true,
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
