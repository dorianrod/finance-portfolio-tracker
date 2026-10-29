import apiBusinessDestructuring from './api-business-destructuring.js'
import apiHookContract from './api-hook-contract.js'
import atomContract from './atom-contract.js'
import componentRole from './component-role.js'
import entityTypeFiles from './entity-type-files.js'
import eslintSuppressionProcessor from './eslint-suppression-processor.js'
import explicitNullability from './explicit-nullability.js'
import featureFolderLayout from './feature-folder-layout.js'
import formatterContract from './formatter-contract.js'
import i18nConsistency from './i18n-consistency.js'
import importBoundaries from './import-boundaries.js'
import maxHooksPerComponent from './max-hooks-per-component.js'
import noBrowserInPureHelpers from './no-browser-in-pure-helpers.js'
import noComplexComponentCalculation from './no-complex-component-calculation.js'
import noComplexJsxCondition from './no-complex-jsx-condition.js'
import noComplexJsxMap from './no-complex-jsx-map.js'
import noComponentDataPipeline from './no-component-data-pipeline.js'
import noComponentModuleLogic from './no-component-module-logic.js'
import noConditionalTestAssertions from './no-conditional-test-assertions.js'
import noDomainAccessibility from './no-domain-accessibility.js'
import noDomainStyling from './no-domain-styling.js'
import noEffectsInComponents from './no-effects-in-components.js'
import noHardcodedColors from './no-hardcoded-colors.js'
import noHardcodedUiStrings from './no-hardcoded-ui-strings.js'
import noHelperContextParams from './no-helper-context-params.js'
import noInlineFormatFallback from './no-inline-format-fallback.js'
import noInlineNumberDisplay from './no-inline-number-display.js'
import noLossyBooleanTransform from './no-lossy-boolean-transform.js'
import noMemoOnlyService from './no-memo-only-service.js'
import noNumberStringRoundtrip from './no-number-string-roundtrip.js'
import noOverwrittenUiProps from './no-overwritten-ui-props.js'
import noPropDrilling from './no-prop-drilling.js'
import noReactContext from './no-react-context.js'
import noReturnedLocalState from './no-returned-local-state.js'
import noServicePresentation from './no-service-presentation.js'
import noSharedUiClassname from './no-shared-ui-classname.js'
import noSharedUiInternalLayout from './no-shared-ui-internal-layout.js'
import noSortForExtremum from './no-sort-for-extremum.js'
import noTestStyleAssertions from './no-test-style-assertions.js'
import noUiStringConcat from './no-ui-string-concat.js'
import preferFunctionalStateUpdate from './prefer-functional-state-update.js'
import preferSemanticTestQueries from './prefer-semantic-test-queries.js'
import preferUsecallback from './prefer-usecallback.js'
import publicApiFirst from './public-api-first.js'
import requireChildrenComposition from './require-children-composition.js'
import requireReviewedEslintSuppression from './require-reviewed-eslint-suppression.js'
import reviewSharedFeatureSharing from './review-shared-feature-sharing.js'
import reviewedEslintSuppression from './reviewed-eslint-suppression.js'
import sharedFeatureUsage from './shared-feature-usage.js'
import singlePublicExport from './single-public-export.js'
import stateComponentContract from './state-component-contract.js'
import testFixtureContract from './test-fixture-contract.js'

export default {
  processors: { suppressions: eslintSuppressionProcessor },
  rules: {
    'api-hook-contract': apiHookContract,
    'api-business-destructuring': apiBusinessDestructuring,
    'atom-contract': atomContract,
    'component-role': componentRole,
    'entity-type-files': entityTypeFiles,
    'explicit-nullability': explicitNullability,
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
    'no-inline-number-display': noInlineNumberDisplay,
    'no-lossy-boolean-transform': noLossyBooleanTransform,
    'no-memo-only-service': noMemoOnlyService,
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
    'prefer-usecallback': preferUsecallback,
    'public-api-first': publicApiFirst,
    'require-children-composition': requireChildrenComposition,
    'require-reviewed-eslint-suppression': requireReviewedEslintSuppression,
    'reviewed-eslint-suppression': reviewedEslintSuppression,
    'review-shared-feature-sharing': reviewSharedFeatureSharing,
    'shared-feature-usage': sharedFeatureUsage,
    'single-public-export': singlePublicExport,
    'state-component-contract': stateComponentContract,
    'test-fixture-contract': testFixtureContract,
  },
}
