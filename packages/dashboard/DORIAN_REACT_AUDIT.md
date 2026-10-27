# Audit React Dorian — 27 octobre 2026

Périmètre : code React/TypeScript de `src`, application, sept capacités de premier niveau du domaine portfolio, sous-features, design system, tests et configuration ESLint. Référence principale : [dorian-react-best-pratices](../../.agents/skills/dorian-react-best-pratices/SKILL.md), version 0.11.0. Les conventions techniques génériques de dossiers, rôles et imports complètent ses décisions métier.

Le contrôle automatique porte sur tout le dashboard. La revue manuelle complète ces contrôles par l'examen des calculs répartis entre variables et callbacks, des fallbacks cachés dans les helpers, des contrats UI et des données qui transitent par le shell. Ce rapport présente la revue du 27 octobre puis conserve les corrections et validations des audits du 26 octobre.

## Contre-audit des contrats publics du 27 octobre 2026

Cette passe reprend les 15 règles Dorian sur les **992 sources TypeScript/TSX**,
dont **818 modules de production hors catalogue**, **102 modules de feature** et
**178 modules de production du design system**. Le lint typé couvre tout le
dashboard, tests et configuration compris. La revue manuelle complète les
contrôles sur les contrats graphiques, les dépendances UI/thème, les calculs et
les valeurs de repli, ainsi que les chemins de composition décrits dans
[ARCHITECTURE.md](ARCHITECTURE.md). Point de départ : lint sans diagnostic et
**149 fichiers, 1 386 tests réussis**.

Trois écarts supplémentaires ont été corrigés :

| Constat                                                                                                                                                                                                                                                         | Correction                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Les séries `SeriesLine`, `SeriesBar`, `SeriesArea`, les deux axes, la grille et les lignes de référence exposaient encore `style` via leurs types Recharts. La règle interdisait uniquement `className`, et un de ses tests acceptait explicitement les styles. | Suppression de `style` des six listes de propriétés qui définissent ces sept contrats. Extension de `local/no-shared-ui-classname` aux API explicites et héritées, unions et génériques, puis aux appelants JSX, spreads et fabriques React. Les renderers de tests et de Storybook excluent aussi les deux propriétés. Les styles natifs internes et le layout externe restent autorisés. |
| La valeur précédente du TRI était encore protégée contre `null` dans `OverviewPerformanceCard`, au sein d'une condition sur l'état de la requête.                                                                                                               | La disponibilité métier reste déterminée par `irrStatus` ; le formatter de pourcentage décide seul du placeholder numérique. Cinq cas vérifient zéro, valeur négative, absence, chargement et erreur avec une ancienne valeur disponible.                                                                                                                                                  |
| La classe React `DashboardPanelErrorBoundary` suivait ses déclarations de types.                                                                                                                                                                                | La classe publique précède maintenant ses types privés. L'ordre des initialisations et le comportement restent identiques. Ce cas a été relevé manuellement : le contrôle d'ordre automatique porte sur les fonctions et composants fonctionnels.                                                                                                                                          |

### Décisions par règle

| Règle                                         | Résultat de la passe                                                                                                                                                                                                          |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `styling-external-layout-only`                | Contrats graphiques fermés aux styles arbitraires ; styles de positionnement laissés aux conteneurs externes. Les composants de layout partagés conservent leurs tokens fermés.                                               |
| `styling-centralize-in-shared-ui`             | Aucun style visuel relevé hors du design system après contrôle des JSX, spreads, propriétés graphiques et feuilles de style. Les géométries et le layout externe restent autorisés.                                           |
| `styling-semantic-colors`                     | Palette et thème centralisés ; recherche des couleurs littérales et revue des adaptations métier vers les tons UI. Aucun nouveau token métier dans les primitives.                                                            |
| `composition-required-children`               | Composition, slots directs et intégrations Recharts contrôlés ; les renderers externes restent des composants de module. Aucune nouvelle prop de rendu introduite.                                                            |
| `architecture-business-capability-boundaries` | Carte des sept capacités du portefeuille conservée. Le shell assemble leurs entrées et modèles ; aucun déplacement de responsabilité métier dans l'application.                                                               |
| `architecture-feature-hierarchy`              | Allocation/concentration, positions/look-through et assessment/errors conservent leurs parents métier. Dimensions, périodes et modes restent des variantes.                                                                   |
| `architecture-feature-ownership`              | Graphe résolu contrôlé ; les entrées communes distribuées par le shell restent justifiées dans [SHARED_OWNERSHIP_AUDIT.md](SHARED_OWNERSHIP_AUDIT.md). Aucun faux consommateur ni nouvelle dérogation ajouté.                 |
| `architecture-component-complexity`           | Seuils 8/150 conservés. Les décisions cohésives documentées restent dans leurs propriétaires ; les modifications n'introduisent aucun dépassement ni suppression.                                                             |
| `architecture-shared-ui-agnostic`             | Contrats, vocabulaire et dépendances UI/thème contrôlés ; aucun type ni choix financier introduit dans les primitives. Les données et labels fournis par les domaines restent opaques pour elles.                             |
| `architecture-centralize-accessibility`       | Aucun attribut ARIA, traitement clavier/focus ou import Radix relevé dans la production métier/application. Les comportements restent dans les primitives et leurs tests.                                                     |
| `architecture-extract-component-calculations` | Recherche AST des opérations et revue des variables/callbacks candidats. Les petits calculs indépendants de proportion ou de hauteur relèvent de l'exception prévue ; aucune nouvelle chaîne de calcul à extraire identifiée. |
| `architecture-formatter-fallbacks`            | Fallback du TRI précédent centralisé. Les gardes qui choisissent une structure, un état métier ou la visibilité des montants non positifs restent distinctes du formatage.                                                    |
| `quality-single-public-export`                | Contrôle de tous les modules de production ; aucun export multiple de valeur ni barrel introduit.                                                                                                                             |
| `quality-public-api-first`                    | Classe de la frontière d'erreur réordonnée manuellement ; fonctions et composants fonctionnels contrôlés automatiquement.                                                                                                     |
| `quality-no-deprecated-apis`                  | Contrôle typé actif, sans dérogation ; aucun usage annoté déprécié détecté dans le code, les tests ou les configurations installées.                                                                                          |

Les conventions React génériques et Vercel applicables à cette SPA complètent
ces décisions : requêtes indépendantes parallélisées, validation Yup aux entrées,
cache serveur dans TanStack Query, chargement des panneaux différé avec Suspense
et frontière d'erreur, effets isolés dans les hooks. Les graphiques qui adaptent
un modèle métier conservent leur configuration cohésive ; une extraction qui
recopierait seulement leurs props ne créerait pas de contrat visuel autonome.
Les règles serveur Next.js et les parcours absents de cette application ne
s'appliquent pas.

### Validation de cette passe

- Suite complète : **149 fichiers, 1 407 tests réussis**, soit 21 cas nets
  supplémentaires ; le contrôle des styles compte 87 tests.
- Lint complet sans cache, puis `npm run lint -- --max-warnings=0` : aucune
  erreur ni avertissement, aucun seuil modifié ni désactivation ajoutée.
- `npm run build` : typage de l'application et du catalogue, puis bundle de
  production réussis.
- `npm run build-storybook` : catalogue statique construit ; les diagnostics
  de bundling des dépendances et des chunks de documentation restent propres au
  catalogue.
- Prettier, catalogue i18n et `git diff --check` : conformes.

Cette passe vérifie le code, les contrats typés et les comportements testés ;
elle ne comprend pas de validation visuelle interactive en navigateur. Aucun
écart Dorian identifié par cette passe ne reste à corriger.

## Revue complète du 27 octobre 2026

Point de départ : lint complet sans diagnostic et **147 fichiers, 1 385 tests réussis**.
La revue couvre les 15 règles Dorian, complétées par les conventions techniques
React génériques et les règles Vercel applicables à cette SPA. Les règles serveur
Next.js, authentification, formulaires de mutation et fonctionnalités absentes ne
sont pas applicables.

### Écarts corrigés

| Constat                                                                                                                                                                | Correction                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Les primitives excluaient `className`, mais plusieurs contrats héritaient encore de `style`, et `Preview.Content` le déclarait explicitement.                          | Les props publiques des contrôles, textes, surfaces, badges, tables, swatches et labels SVG excluent désormais `style`. Le positionnement reste sur les conteneurs externes et les dimensions sémantiques restent dans les primitives.                                                                                    |
| `ChartText` et `SeriesSwatch` dépendaient du passage d'un objet CSS à une autre primitive.                                                                             | `Text` et `ChartText` partagent un presenter de typographie ; chaque renderer possède son élément natif et son apparence. `SwatchFrame` reçoit les données sémantiques de série et de sélection. Aucun objet CSS ne transite par leur API publique.                                                                       |
| Quatre helpers recevaient des fonctions de formatage de leurs appelants.                                                                                               | `useFilterSummaries`, `useFilterScopeBadges`, `useBuildDataQualityViewModel` et `useBuildPipelineErrorsViewModel` composent les formatters existants. Leurs signatures prennent uniquement les données nécessaires ; valeurs et fonctions retournées sont mémorisées. Les helpers privés reçoivent des valeurs formatées. |
| Le pourcentage d'une position filtrée, puis sa borne d'affichage, étaient calculés dans le composant.                                                                  | `getFilteredPositionShare`, presenter auprès de `FilteredPositionRow`, possède toute la dérivation. Le cas de valeur totale nulle et la borne de 100 restent identiques.                                                                                                                                                  |
| Le tick de concentration dérivait ses coordonnées et dimensions dans le JSX.                                                                                           | `getHoldingLabelGeometry` possède la géométrie au périmètre du composant.                                                                                                                                                                                                                                                 |
| L'aperçu de position décidait directement de la pertinence de l'historique de prix unitaire.                                                                           | `hasUnitPriceHistory`, prédicat auprès des graphiques de position, possède la règle métier et sa tolérance de 0,01.                                                                                                                                                                                                       |
| Le tooltip mensuel filtrait les opérations dans le composant et utilisait le compte comme clé React, alors qu'un même compte peut avoir plusieurs opérations par mois. | Un sélecteur local partitionne les opérations et conserve leur identité dans le snapshot. Le test de régression vérifie plusieurs dépôts et retraits du même compte, leur remplacement au changement de mois et l'absence de diagnostic React.                                                                            |
| Une plage de dates était assemblée directement dans un helper de présentation.                                                                                         | Le catalogue possède maintenant `ui.buildfilterscopebadges.dateRange`, avec interpolation des deux dates. Les labels d'opération des résumés sont également résolus au moment de l'appel.                                                                                                                                 |

Les trois tests des résumés ont été déplacés auprès du hook propriétaire et
exécutent ses vrais formatters. Aucun mock de formatter ni wrapper de fallback
n'a été ajouté.

### Couverture et décisions

- **Styles, couleurs et composition** : contrôle des contrats hérités, usages JSX,
  spreads et intégrations graphiques ; les primitives conservent les tokens et
  slots. Les props de géométrie des bibliothèques restent des données.
- **Frontières, hiérarchie et propriété** : la carte des capacités de
  [ARCHITECTURE.md](ARCHITECTURE.md) reste justifiée. Les extractions appartiennent
  à leur feature et, lorsqu'elles sont spécifiques à un composant, à son dossier.
  Les usages communs transmis par le shell conservent les preuves de
  [SHARED_OWNERSHIP_AUDIT.md](SHARED_OWNERSHIP_AUDIT.md).
- **Complexité et calculs** : les nouvelles frontières isolent une dérivation,
  une géométrie ou une sélection identifiable. Les opérations simples et
  autonomes autorisées par la règle restent locales. Le presenter de typographie
  représente un seul contrat de classes ; les builders de qualité et d'erreurs
  conservent leur responsabilité. Aucun seuil ni suppression ESLint ajouté.
- **Indépendance UI et accessibilité** : revue du vocabulaire et des dépendances
  UI/thème, contrôles des associations, clavier et restauration du focus via les
  tests existants. Aucune logique métier ni câblage ARIA ajouté aux primitives
  ou aux domaines respectivement.
- **Fallbacks, exports et dépréciations** : contrôles typés actifs ; les valeurs
  absentes restent traitées par les formatters numériques. Un export de valeur
  par module et API publique en tête restent vérifiés. La vérification de la
  [documentation Recharts sur `Cell`](https://recharts.github.io/guide/cell/)
  confirme sa dépréciation ; le projet ne l'utilise pas.
- **Conventions React complémentaires** : vérification des effets, imports,
  stores, chargements différés, frontières d'erreur et requêtes communes. Les
  helpers modifiés ne reçoivent plus de dépendance de contexte.

### Validation

- `npm test` : **149 fichiers, 1 386 tests réussis**. Les trois tests existants
  des résumés ont suivi leur hook ; un test de régression couvre les opérations
  répétées d'un compte et le changement de mois.
- `npm run lint -- --max-warnings=0` : aucune erreur ni avertissement, sans
  nouvelle désactivation de règle ni modification des seuils.
- `npm run build` : typage TypeScript, catalogue typé et bundle de production
  réussis.
- `npm run build-storybook` : catalogue statique construit. Le bundler signale
  des directives `use client` de dépendances Radix et la taille des chunks de
  documentation Storybook ; ces diagnostics concernent le catalogue et ne
  bloquent pas sa génération.
- `npx prettier --check .`, `node scripts/check-i18n-catalog.mjs` et
  `git diff --check` : conformes.

Cette revue de code ne comprend pas de validation visuelle interactive en
navigateur. Aucun écart Dorian identifié par cette passe ne reste à corriger.

## Contre-audit : corrections supplémentaires

Le contre-audit partait d'un lint sans diagnostic, d'un typage valide et de **143 fichiers, 1 339 tests réussis**. Il reprend les 15 règles du catalogue : styles et couleurs, composition, frontières métier et propriété, complexité, indépendance du design system, accessibilité, calculs, formatters, exports et dépréciations. Les conventions génériques complètent la revue technique ; la carte métier reste celle de [ARCHITECTURE.md](ARCHITECTURE.md).

| Constat                                                                                                      | Correction                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Des cellules choisissaient encore elles-mêmes `null/0 → —`, parfois à travers des éléments JSX.              | `GainCell`, les cellules de gain et de valeur, et `PreviousValue` utilisent les fallbacks des formatters existants. `GainCell` transmet explicitement la politique `zeroAsFallback` : un gain nul reste formaté ailleurs, et reste masqué pour les gains réalisés où c'était le comportement attendu. |
| La cellule TRI ne rendait le rendement glissant que si le rendement global était présent.                    | Le rendement glissant s'affiche indépendamment, y compris lorsqu'il vaut zéro ou est négatif. Le formatter de pourcentage possède un suffixe textuel générique : `/yr` s'ajoute aux nombres et jamais au placeholder. La traduction devenue inutilisée a été supprimée.                               |
| Le pourcentage non classifié était dérivé dans le composant par une somme puis un ratio dépendant.           | `getUnclassifiedAllocationPercentage`, dans les helpers de qualité d'assessment, possède la dérivation et son cas de total nul. Le composant conserve le choix du ton et le rendu.                                                                                                                    |
| `PieLabel` rejetait les coordonnées et angles valant zéro par des tests de truthiness.                       | Les coordonnées et l'angle sont vérifiés contre l'absence. Les étiquettes avec un angle de zéro ou un centre sur un axe s'affichent ; les données manquantes et parts trop petites restent masquées.                                                                                                  |
| La règle de fallback ne détectait ni les éléments JSX enveloppant le texte, ni les gardes de retour simples. | `local/no-inline-format-fallback` reconnaît les wrappers à contenu unique, fragments, traductions et retours adjacents ou `if/else`. Les branches structurelles, gardes métier, valeurs différentes et instructions intermédiaires restent exclues.                                                   |

### Décisions de revue

- La carte des capacités et les chemins de données du shell restent cohérents. Les entrées communes distribuées par props conservent les justifications de [SHARED_OWNERSHIP_AUDIT.md](SHARED_OWNERSHIP_AUDIT.md) ; aucun déplacement ni consommateur artificiel n'a été ajouté.
- Les opérations simples et autonomes autorisées par la règle de calcul restent dans les composants. La dérivation somme/ratio a été extraite dans son propriétaire. L'implémentation interne du formatter de pourcentage garde une responsabilité de formatage distincte de la résolution du fallback, sous les seuils de complexité.
- Les primitives existantes possèdent toujours l'apparence et les comportements d'accessibilité. Les contrôles couvrent les imports, props, spreads et usages JSX ; les tests des primitives vérifient notamment clavier, associations, dismissal et restauration du focus. Les changements n'ajoutent aucun style visuel ni câblage ARIA dans les features.
- Un export public de valeur par module et API callable en premier restent vérifiés. Le contrôle typé des dépréciations reste actif sur production, tests et configuration.
- Aucune désactivation ESLint, hausse de seuil ou dérogation d'architecture n'a été ajoutée. La garde géométrique de `PieLabel` conserve sa responsabilité unique et sa justification de complexité existante.

### Vérification du contre-audit

- `npm test` : **147 fichiers, 1 385 tests réussis**, soit **46 cas supplémentaires** couvrant fallbacks, zéro, pertes, rendements indépendants, couverture, géométrie nulle valide et diagnostics ESLint.
- `npm run build` : typage TypeScript et bundle de production réussis.
- `npm run lint -- --max-warnings=0` : aucune erreur ni avertissement.
- `npx prettier --check .`, `node scripts/check-i18n-catalog.mjs` et `git diff --check` : conformes.

La revue manuelle complète les contrôles automatiques sur les flux et motifs ci-dessus ; elle ne constitue pas une preuve d'absence de tout bug. Ces validations n'incluent pas une revue visuelle interactive en navigateur.

## Corrections du premier audit

Le premier audit partait de 1 312 tests réussis et d'un lint sans diagnostic. Les corrections historiques ci-dessous portaient également sur des écarts que ces contrôles ne détectaient pas.

| Écart                                                                                                                                | Correction et propriété finale                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| La préparation de la diversification était implémentée dans `app` et dépendait de helpers appartenant à son seul enfant allocation.  | `diversification/shared/helpers/filters/prepareDiversificationScope` prépare les entrées et indicateurs communs. Le shell compose allocation et concentration et conserve les mêmes états de chargement, d'inapplicabilité et d'absence de données.                           |
| `DonutCard` et `MiniDonut` répétaient sommes, regroupement et construction des secteurs.                                             | `portfolio/shared/helpers/presenters/groupAllocationTail/buildAllocationPieData` produit une seule représentation, utilisée par deux features distinctes : diversification/allocation et holdings/positions. Les catégories épinglées et les sous-catégories sont conservées. |
| La série d'épargne était calculée dans un callback `useMemo` du composant.                                                           | `buildSavingsHistorySeries` possède l'arrondi, les variations entre snapshots et le repli sur les opérations. Le composant conserve la requête et le rendu des états.                                                                                                         |
| Les rendements et variations de plus-value étaient calculés dans le graphique.                                                       | `performance/helpers/calculators/buildUnrealizedPnlHistory` possède ces métriques. Le contrat `UnrealizedPnlPoint` appartient à `types/`, plutôt qu'au module de tooltip.                                                                                                     |
| La couverture cumulait plusieurs sommes, un total et les pourcentages dans les composants.                                           | `summarizeAllocationCoverage` calcule le résumé utilisé pour le portefeuille et chaque compte. Les pourcentages d'affichage bornés passent par `normalizeCoveragePercentage`, presenter local à assessment.                                                                   |
| Les tooltips patrimoine dérivaient coûts, gains, totaux et ratios par plusieurs calculs dépendants.                                  | Calculateurs métier pour les métriques financières, presenter local pour les lignes de répartition par compte. Les tooltips qui interprètent ces métriques portent le rôle `.feature.tsx`. Les parts indisponibles passent comme valeurs nulles au formatter existant.        |
| La préparation du graphique de comptes et l'échelle des barres de classement étaient calculées dans le JSX ou le corps du composant. | Presenters nommés `buildAccountTypePieData` et `getIrrListScale`, à leur périmètre propriétaire.                                                                                                                                                                              |
| Des helpers produisant des coordonnées, une plage d'axe ou un crosshair étaient rangés dans `calculators/`.                          | `resolveAccountTypeLabelPositions`, `calculateYearLabelLayout`, `computeUnitPriceDomain`, `allocationTrendDomain` et `cumulativeConcentrationCrosshair` sont des presenters auprès de leur composant. Le service du graphique revenus/placements a suivi son propriétaire.    |
| Plusieurs affichages réimplémentaient le signe et le placeholder monétaire.                                                          | Option `signed` de `useFormatMoney`, utilisée par les badges, cartes et détails de comparaison. Zéro reste sans signe positif ; valeurs négatives et fallbacks sont conservés. Les parts de concentration absentes passent directement au formatter numérique.                |
| Des formatters de domaine recevaient les fonctions de formatage de leurs appelants ; certains réimplémentaient `null → —`.           | Hooks de formatage avec dépendances internes et fonction mémorisée. Les états métier « calcul en cours », « erreur » et « première observation comparable » conservent leur sens ; le formatter numérique possède le fallback de valeur.                                      |
| Les axes en pourcentage produisaient leurs chaînes directement.                                                                      | Les graphiques patrimoine utilisent `useFormatPercentage`, avec le même arrondi entier.                                                                                                                                                                                       |
| La synchronisation du thème définissait deux couleurs littérales dans l'application.                                                 | Valeurs centralisées dans `shared/theme/pageThemeColors`, conservées à l'identique.                                                                                                                                                                                           |

Le contrôle du catalogue a également identifié **19 clés `ui.kpibar.*` sans
consommateur**. Elles ont été supprimées après recherche des usages. La commande
de lint complet documentée dans le README devient `npx eslint .` : avec cette
version d'ESLint, ajouter `--no-cache` au script qui fixe aussi
`--cache-strategy` échoue avant l'analyse.

## Couverture des règles

| Règle Dorian                                  | Résultat de la revue                                                                                                                                                                                                                               |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `styling-external-layout-only`                | Vérification des appels, slots et descendants résolus par le lint ; aucune suppression ajoutée.                                                                                                                                                    |
| `styling-centralize-in-shared-ui`             | Apparence conservée dans les primitives ; les extractions métier n'introduisent ni classes visuelles ni attributs SVG d'apparence.                                                                                                                 |
| `styling-semantic-colors`                     | Recherche des couleurs littérales et palettes dans app, domaines et UI ; le seul écart supplémentaire concernait le thème du navigateur, désormais centralisé.                                                                                     |
| `composition-required-children`               | Contrôle typé des props de contenu, variables et spreads ; contrats Recharts conservés avec des renderers nommés au niveau module. Slots directs préservés.                                                                                        |
| `architecture-business-capability-boundaries` | Carte métier de [ARCHITECTURE.md](ARCHITECTURE.md) conservée ; la préparation commune de diversification revient dans son domaine.                                                                                                                 |
| `architecture-feature-hierarchy`              | Dimensions et modes restent des variantes ; aucun niveau de feature ajouté pour une extraction technique.                                                                                                                                          |
| `architecture-feature-ownership`              | Dépendances résolues et usages partagés contrôlés ; justification des trois entrées communes ci-dessous. Aucun consommateur artificiel ajouté.                                                                                                     |
| `architecture-component-complexity`           | Seuils de complexité 8 et de taille 150 actifs sur toute la production. Fonctions modifiées réexaminées ; les régions cohérentes et exceptions existantes restent documentées dans [COMPONENT_COMPLEXITY_AUDIT.md](COMPONENT_COMPLEXITY_AUDIT.md). |
| `architecture-shared-ui-agnostic`             | Contrats et dépendances UI/thème contrôlés, avec recherche du vocabulaire métier et revue des chemins indirects. Aucun type de portefeuille n'a été déplacé dans le design system.                                                                 |
| `architecture-centralize-accessibility`       | Contrôle des attributs, spreads, imports Radix et API DOM ; comportements laissés dans les primitives existantes et leurs tests.                                                                                                                   |
| `architecture-extract-component-calculations` | Extractions des dérivations multi-étapes et reclassification des sorties géométriques détaillées ci-dessus. Les petites expressions autonomes restent locales selon l'exception de la règle.                                                       |
| `architecture-formatter-fallbacks`            | Fallbacks monétaires, ratios et concentration centralisés. Les conditions qui choisissent une structure, un état métier ou masquent volontairement des montants non positifs restent des décisions métier.                                         |
| `quality-single-public-export`                | Un seul export de valeur par nouveau module ; types associés autorisés. Aucun barrel ajouté.                                                                                                                                                       |
| `quality-public-api-first`                    | API callable avant ses types, constantes et détails privés ; contrôle automatique sur toute la production.                                                                                                                                         |
| `quality-no-deprecated-apis`                  | Contrôle ESLint typé actif sur le code, les tests et les configurations ; aucune dérogation ajoutée.                                                                                                                                               |

## Justification des entrées communes de diversification

Les trois modules `prepareDiversificationScope`, `scopeRawAllocationData` et `excludeNonApplicableAllocationData` ont une exception locale à `local/shared-feature-usage`, documentée aussi dans [SHARED_OWNERSHIP_AUDIT.md](SHARED_OWNERSHIP_AUDIT.md). Le graphe d'imports seul ne prouve pas l'usage de données distribuées par props.

Le chemin réel est `DiversificationCharts` → `prepareDiversificationScope` → `AllocationSection` et `ConcentrationSection`. Allocation reçoit les dimensions filtrées ; concentration reçoit les positions applicables. Les deux partagent les gardes qui déterminent si ce périmètre permet l'analyse, notamment l'absence de breakdown courant. Les règles spécifiques de sélection des catégories et de calcul de concentration restent dans leurs enfants respectifs. L'application n'est pas comptée comme une feature supplémentaire.

## Vérification du premier audit

- Suite complète : **143 fichiers, 1 339 tests réussis**, contre 137 fichiers et
  1 312 tests au départ. Les 27 cas supplémentaires couvrent notamment les signes
  monétaires, snapshots et replis d'épargne, pertes et coût nul, conservation des
  allocations, périmètre épargne/investissement et totaux de tooltips.
- `npm run build` : typage TypeScript et bundle de production réussis.
- `npm run lint -- --max-warnings=0` : aucune erreur ni avertissement.
- `npx prettier --check .` : tous les fichiers conformes.
- `node scripts/check-i18n-catalog.mjs` : aucune clé inutilisée restante.
- `git diff --check` : aucun problème d'espaces ou de marqueurs de conflit.

Les tests ajoutés vérifient les comportements financiers et les cas limites ;
ils ne constituent pas une nouvelle validation visuelle en navigateur. Les
exceptions de partage ci-dessus restent des décisions de propriété documentées,
pas une preuve de partage obtenue par le seul lint.
