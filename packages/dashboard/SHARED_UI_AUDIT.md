# Audit de l'indépendance métier de shared/ui

Date : 26 octobre 2026. État : **écarts corrigés**.

Règle : [`arch-shared-no-domain-knowledge`](../../.agents/skills/generic-react-best-practices/rules/arch-shared-no-domain-knowledge.md).

L'audit initial avait identifié cinq groupes de couplages. La nouvelle revue couvre les **72 modules de production** de `src/shared/ui`, leurs quatre dépendances TypeScript locales hors du dossier, les consommateurs métier, les **23 fichiers de tests UI** et les **50 fichiers Storybook**. Aucun écart restant à cette règle n'a été relevé dans ce périmètre.

## Corrections réalisées

| Couplage initial                                                                      | Résultat                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primitives interprétant `buy`, `sell`, `mixed`, une position ou sa clôture            | [`ChartMarker`](src/shared/ui/ChartMarker.view.tsx) reçoit des rôles de palette, un contour et une taille génériques. [`TableRowSurface` et `InlineBadge`](src/shared/ui/TableRow.view.tsx) reçoivent une variante, une atténuation ou un ton UI. Les contrats de positions et d'opérations restent dans [`PositionTableAppearance`](src/domains/portfolio/features/holdings/features/positions/components/PositionTableAppearance.view.tsx) et les renderers de la feature. |
| Résolution implicite des catégories d'allocation et de comptes dans les graphiques    | [`getPortfolioSeriesTone`](src/domains/portfolio/shared/helpers/presenters/getPortfolioSeriesTone.ts) et les [correspondances de catégories](src/domains/portfolio/shared/constants/portfolioCategoryTones.ts) appartiennent au domaine. Les primitives reçoivent uniquement `tone` ; leurs anciennes props `category` et `group` ont été supprimées.                                                                                                                        |
| Tokens de métriques financières dans les types et les valeurs par défaut de shared UI | La [palette partagée](src/shared/theme/chartColors.ts) expose des séries et rôles UI génériques, réutilisés entre métriques, catégories et comptes. Les [correspondances des métriques](src/domains/portfolio/shared/constants/portfolioChartTones.ts) appartiennent au portefeuille. L'ancien module `semanticColors.ts`, ses contrats métier et ses exports inutilisés ont été supprimés.                                                                                  |
| Variantes et hooks CSS portant les noms de features                                   | Les contrats décrivent les capacités visuelles : `splitAction`, `outlinedDetail`, `indicatorCard`, `stacked`, `labelThreeValues`, etc. Les tons de texte et de cartes sont génériques. Les hooks CSS deviennent `ui-card-group`, `ui-indicator-card`, `ui-help-trigger` et `ui-split-action`. L'icône de camembert est nommée `PieChartIcon`.                                                                                                                                |
| Sélecteur d'échelle affichant systématiquement `€`                                    | [`ChartScaleToggle`](src/shared/ui/ChartScaleToggle.view.tsx) exige `valueLabel`. Les vues du portefeuille fournissent `€` ; le composant est aussi testé avec `Units` et `$`.                                                                                                                                                                                                                                                                                               |

Les noms `ReliabilityBadge` et `ScopeBadge` ont également été remplacés par `StatusBadge` et `CompactBadge`. Le domaine traduit les états de filtres `applied` / `ignored` vers des tons UI avant de les transmettre.

Les consommateurs, les tests de rendu, les stories et les fixtures du contrôle ESLint de style utilisent les nouveaux contrats. Les styles, les attributs SVG et l'implémentation de l'accessibilité restent dans `shared/ui` ; aucun dictionnaire métier n'a été déplacé derrière une dépendance partagée pour masquer le couplage.

## Préservation du comportement

Une comparaison des valeurs avant/après confirme la conservation exacte des **31 correspondances de couleurs de métriques**, des **27 couleurs fixes de catégories d'allocation** et des **6 couleurs fixes de catégories de comptes**. Le hachage des catégories inconnues, la rotation de secours des comptes et les cas `nc`, `Not concerned`, `Autre` / `others (…)` restent couverts par les tests du domaine.

Les tests vérifient aussi les rayons et contours des marqueurs, l'apparence des lignes actives et clôturées, les tons des opérations, les gradients, les swatches, les interactions du sélecteur et la couverture des composants publics dans Storybook.

La suite complète a également détecté un fallback manquant dans le mapper de fonds en cours de refactorisation : `source_tier` absent doit rester `''`. Ce fallback a été rétabli pour préserver le contrat de normalisation existant.

## Revue finale de la frontière

- Aucun import de production de `shared/ui`, direct ou transitif dans les modules TypeScript locaux, vers `app` ou `domains` n'a été relevé. Les dépendances hors UI sont la configuration i18n, `partitionSlot` et les deux modules de thème génériques.
- Aucun contrat de position, opération, compte, allocation ou métrique financière ne subsiste dans les modules de production UI et leurs modules de thème.
- Les états `selected` / `expanded`, l'accessibilité, le focus, les délais de fermeture, les proportions, les géométries et la pondération temporelle générique de `ChartAge` restent des responsabilités UI valides.
- Les libellés et contenus métier fournis par l'appelant, ainsi que les exemples réalistes dans les tests et stories, restent autorisés ; les primitives ne les interprètent pas.

Cette conclusion repose sur la revue des noms publics, types, unions, branches, valeurs par défaut, correspondances et chemins d'import. Une simple recherche de mots-clés ne suffit pas : `position` peut aussi désigner une coordonnée, et le catalogue i18n peut contenir du texte métier sans que la primitive le connaisse.

## Vérifications

- `npm test -- --maxWorkers=4` : **127 fichiers et 1 193 tests réussis**. La limite de workers évite la saturation et le timeout observé dans un test de configuration ESLint lors du premier passage concurrent avec les builds.
- Build Storybook : **réussi**, avec les avertissements de directives de modules des dépendances.
- `npm run build` : **réussi**, typage de l'application et de Storybook inclus, puis bundle de production.
- Lint des primitives, thèmes et nouveaux adaptateurs/correspondances : **152 fichiers, aucune erreur**. Sept avertissements de complexité subsistent dans des primitives existantes (`ChartLabel`, `ChartRectangle`, `NavigationButton`, `Layout`, `PreviewTrigger`, `Surface`, `Text`) ; ils relèvent du chantier de complexité distinct.
- Validation du skill et comparaison des palettes : **réussies**.

Le **lint global reste en échec** sur la refactorisation menée parallèlement : huit erreurs d'organisation de modules et de tri d'imports dans les colonnes/prévisualisations de positions et la légende d'épargne mensuelle. Les frontières concernées sont notamment [`buildPositionColumns.tsx`](src/domains/portfolio/features/holdings/features/positions/helpers/presenters/buildPositionColumns.tsx) et [`usePositionGroupPreviews.ts`](src/domains/portfolio/features/holdings/features/positions/services/usePositionGroupPreviews.ts). Ces diagnostics sont distincts de l'indépendance métier de `shared/ui` ; le contrôle global n'est pas déclaré validé.

Le contrôle `local/import-boundaries` reste actif, notamment pour les imports de types, réexports et accès à Storybook depuis la production. Il ne peut pas déduire à lui seul la signification d'une union ou d'un dictionnaire local ; la revue sémantique de cette règle reste nécessaire.
