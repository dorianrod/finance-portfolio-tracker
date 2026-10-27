# Audit React Dorian — 26 octobre 2026

Périmètre : code React/TypeScript de `src`, application, sept capacités de premier niveau du domaine portfolio, sous-features, design system, tests et configuration ESLint. Référence principale : [dorian-react-best-pratices](../../.agents/skills/dorian-react-best-pratices/SKILL.md), version 0.11.0. Les conventions techniques génériques de dossiers, rôles et imports complètent ses décisions métier.

Le contrôle automatique porte sur tout le dashboard. La revue manuelle complète ces contrôles par l'examen des calculs répartis entre variables et callbacks, des fallbacks cachés dans les helpers, des contrats UI et des données qui transitent par le shell. Ce rapport conserve les corrections du premier audit et présente en premier le contre-audit effectué sur son résultat.

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
