# Audit de maintenabilité du dashboard — 25 octobre 2026

Le gain principal vient de contrôles ESLint mieux ciblés et de responsabilités mieux délimitées. Le catalogue Dorian contient déjà les règles de composition, de calcul, de formatage et d’accessibilité importantes. Il manque surtout une protection automatique des couleurs sémantiques, une couverture des renderers déclarés dans des configurations de bibliothèques et quelques décisions d’architecture que le lint ne peut pas prendre seul.

Ce document contient des constats et des propositions. Les configurations, les règles actives du skill et le code applicatif n’ont pas été modifiés pendant cet audit.

**Périmètre et méthode**

- Inventaire AST des 327 fichiers TypeScript/TSX de production : 28 029 lignes, 1 284 imports locaux statiques.
- Revue transversale des six sections : overview, wealth, performance, allocation/concentration, holdings/positions/look-through et data quality/errors.
- Analyse des composants, services, helpers, types, schémas, stores, primitives UI, traductions, configuration et règles ESLint. Lecture complémentaire du lanceur Python, de son packaging et de la CI.
- Comparaison avec les six règles actives de `dorian-react-best-pratices`, les règles génériques React applicables et les recommandations Vercel adaptées à cette SPA Vite.
- Exécution du lint, de tous les tests, des contrôles TypeScript et du catalogue i18n. Essais de règles supplémentaires via des configurations ESLint temporaires, sans modifier le dépôt.

L’inventaire couvre tous les modules de production ; les constats ci-dessous proviennent de contrôles automatisés sur l’ensemble et de lectures ciblées des responsabilités et dépendances. Cet audit de code ne comprend pas de nouvelle validation visuelle dans un navigateur ni de profilage des performances.

**État vérifié**

| Contrôle                                                         | Résultat                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| ESLint actuel                                                    | 0 erreur, 1 avertissement sur `AccountTypeBreakdownChart.feature.tsx:175` |
| Suite Vitest complète                                            | 103 fichiers, 733 tests réussis                                           |
| Tests du lanceur Python                                          | 6 tests réussis                                                           |
| TypeScript application et tooling, avec `--strict` explicite     | Réussite                                                                  |
| Audit du catalogue i18n                                          | Réussite                                                                  |
| Cycles dans le graphe des imports statiques locaux, types inclus | Aucun détecté                                                             |
| Imports directs entre les six features sœurs                     | Aucun détecté                                                             |

TypeScript installé : **6.0.3**. `strict`, `strictNullChecks` et `noImplicitAny` sont déjà effectifs : TypeScript 6 active `strict` par défaut. L’absence de cette propriété dans les TSConfigs ne constitue donc pas un défaut de typage. [Notes officielles TypeScript 6](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html).

**Ordre recommandé**

| Priorité | Chantier                                                            | Premier moyen de contrôle                                                              | Place du skill                                                     |
| -------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| P1       | Fermer les fuites de `any`                                          | Règles typées `no-unsafe-*` existantes dans typescript-eslint                          | Déjà couvert par le skill générique ; pas de nouvelle règle Dorian |
| P1       | Protéger les couleurs sémantiques                                   | Nouvelle règle locale ciblée sur les couleurs                                          | Compléter l’enforcement de `styling-semantic-colors`               |
| P1       | Corriger les dépendances vers des fichiers de composants            | Restrictions d’imports par couche, y compris les imports de types                      | Déjà couvert génériquement ; préciser les exceptions utiles        |
| P1       | Découper les renderers et la table des positions                    | Étendre le contrôle de composition aux configurations externes ; mesurer la complexité | Étendre `composition-required-children`                            |
| P1       | Faire exécuter les contrôles existants par la CI                    | Suite complète, audit i18n et politique explicite sur les warnings                     | Configuration du projet                                            |
| P2       | Donner une responsabilité identifiable aux gros helpers et services | `complexity`, puis contrôle ciblé des exports de helpers                               | Appliquer les règles génériques existantes                         |
| P2       | Représenter les overlays exclusifs par un seul état                 | Union discriminée + contrôle d’exhaustivité                                            | Nouvelle règle d’architecture proposée                             |
| P2       | Centraliser les politiques de présentation réellement communes      | Réutilisation de formatters et presenters ; restrictions ciblées                       | Distinguer politique commune et rendu local                        |
| P2       | Séparer chargement commun et chargement des panneaux                | Tests de comportement et de réseau                                                     | Nouvelle règle d’architecture proposée                             |
| P2       | Traiter les promesses lancées en arrière-plan                       | `no-floating-promises` avec `ignoreVoid: false`                                        | Pas besoin d’une règle spécifique à ce projet                      |

**1. Le typage strict laisse encore passer des `any` issus des bibliothèques et de l’inférence — P1**

Dans [eslint.config.js](eslint.config.js#L45), `projectService` fournit déjà les types, mais la configuration étend `tseslint.configs.recommended`, pas la variante typée. `no-explicit-any` n’empêche ni les valeurs `any` de Recharts/Yup, ni certaines inférences de collections.

Les essais ont produit les diagnostics suivants. Ce sont des points de contrôle à traiter, pas autant de bugs d’exécution démontrés ; certains portent sur la même origine de données.

| Règle essayée                                      | Production | Tests |
| -------------------------------------------------- | ---------: | ----: |
| `@typescript-eslint/no-unsafe-argument`            |         25 |     0 |
| `@typescript-eslint/no-unsafe-return`              |         10 |     1 |
| `@typescript-eslint/no-unsafe-assignment`          |          2 |     3 |
| `@typescript-eslint/no-unsafe-member-access`       |          1 |     3 |
| `@typescript-eslint/no-unsafe-call`                |          0 |     0 |
| `@typescript-eslint/consistent-type-imports`       |          2 |     0 |
| `@typescript-eslint/no-unnecessary-type-assertion` |          3 |     0 |

Exemples concrets :

- [PassiveIncomeChart.feature.tsx:47](src/domains/portfolio/features/performance/components/PassiveIncomeChart.feature.tsx#L47) reçoit un argument Recharts non sûr et le passe au formatter. Le même motif traverse les graphiques de patrimoine, performance et allocation.
- [AccountTypeBreakdownChart.feature.tsx:21](src/domains/portfolio/features/wealth/components/AccountTypeBreakdownChart/AccountTypeBreakdownChart.feature.tsx#L21) récupère un `payload` insuffisamment typé.
- [buildConcentrationTrend.ts:150](src/domains/portfolio/shared/helpers/calculators/buildConcentrationTrend.ts#L150) utilise `?? new Map()`. Le fallback produit ici un `Map<any, any>` qui contamine `current`, puis `current.value` et le stockage dans la collection typée. Fournir les paramètres génériques du `Map` corrige cette origine.
- [csvData.ts:43](src/shared/csv/csvData.ts#L43) et les callbacks `transform` de Yup méritent une frontière générique explicitement typée.

Activer d’abord les règles individuellement permet de corriger ces frontières sans adopter un preset plus large à l’aveugle. `recommendedTypeChecked` reste une cible possible après examen de son ensemble de règles. La documentation confirme que les règles `no-unsafe-*` contrôlent l’utilisation de valeurs `any` avec les types résolus. [Configurations typescript-eslint](https://typescript-eslint.io/users/configs/), [no-unsafe-argument](https://typescript-eslint.io/rules/no-unsafe-argument/).

Éviter de remplacer chaque diagnostic par `as number`, `as Entity` ou une désactivation. Adapter les contrats externes à leur frontière et conserver `unknown` tant que la valeur n’a pas été vérifiée. Les règles génériques `types-no-any-or-wide` et `yup-last-coercion-barrier` expriment déjà cette intention.

**2. La règle de couleurs du skill n’est pas protégée par ESLint — P1**

[styling-semantic-colors.md](../../.agents/skills/dorian-react-best-pratices/rules/styling-semantic-colors.md) impose les couleurs sémantiques. Aucun des 14 contrôles locaux ne vérifie cette règle. Une sonde avec `text-red-500`, `bg-[#ff0000]` et `style={{ color: '#b91c1c' }}` passe sans diagnostic dans un fichier de production.

Créer `local/no-raw-domain-colors` : détecter les classes de palette et les couleurs littérales dans les propriétés qui représentent une couleur, sous `src/app` et `src/domains`. Exempter explicitement les déclarations du thème, les tests et les éléments autorisés par la règle existante, notamment `currentColor`, `transparent` et les variables sémantiques.

Le contrôle doit accepter `text-[11px]`, les tailles SVG, les pourcentages et les couleurs venues des données déjà résolues. Interdire toutes les classes Tailwind arbitraires ferait perdre cette précision. Les propriétés de couleur des configurations Recharts doivent être couvertes aussi.

Ajouter à la règle du skill une section Enforcement indiquant le nom réel du contrôle, son périmètre et ses limites. Le texte de la règle métier est déjà présent ; sa duplication dans un autre fichier n’apporterait rien.

**3. Des services, stores et helpers dépendent de fichiers appartenant aux composants — P1**

Les restrictions actuelles ne couvrent que quelques chemins avec l’alias `@/`. Une sonde important un type métier via un chemin relatif depuis `src/shared/http` passe sans diagnostic. Le graphe actuel ne révèle pas de cycle, mais le garde-fou est contournable.

Les dépendances inversées existent déjà à une échelle plus locale :

- [dashboardFilters.atoms.ts:3](src/domains/portfolio/shared/stores/dashboardFilters.atoms.ts#L3), `useAccountFilterLabels`, `usePortfolioFilterOptions`, `useDashboardFilters` et `accountTreeSelection` importent la logique située dans `shared/components/filters/helpers/filters/portfolioFilters.ts`.
- [portfolioFilterScopes.ts:1](src/domains/portfolio/shared/helpers/filters/portfolioFilterScopes.ts#L1) dépend aussi de ce dossier pour un type.
- Trois services d’allocation importent `ConcentrationMode` depuis [ConcentrationModeToggle.view.tsx](src/domains/portfolio/shared/components/ConcentrationModeToggle.view.tsx#L7).
- [usePositionTableOverlays.ts:4](src/domains/portfolio/features/holdings/features/positions/services/usePositionTableOverlays.ts#L4) et [positionUnderlyingPopover.atoms.ts:3](src/domains/portfolio/features/holdings/features/positions/stores/positionUnderlyingPopover.atoms.ts#L3) importent leurs contrats depuis des composants.
- [resolveDashboardLoadState.ts:1](src/app/helpers/mappers/resolveDashboardLoadState.ts#L1) importe son union d’état depuis le renderer qui la consomme.

Déplacer les types partagés dans `types/` au niveau propriétaire. Remonter les fonctions de filtres utilisées hors du composant dans `portfolio/shared/helpers/<catégorie>/`. Garder les fonctions propres au rendu du filtre dans son dossier.

Renforcer les imports interdits, y compris les imports de types, puis vérifier leur destination résolue si l’on veut couvrir proprement les chemins relatifs et les alias. Des restrictions textuelles suffisent pour les cas simples, mais ne constituent pas à elles seules un contrôle complet du graphe. [no-restricted-imports](https://eslint.org/docs/latest/rules/no-restricted-imports).

Commencer par les couches pures (`types`, `stores`, helpers non visuels, schémas). Un service qui pilote une mesure DOM peut légitimement dépendre d’un contrat UI neutre ; l’interdire sans exception ferait déplacer artificiellement les fichiers. Ne pas recopier `arch-shared-no-domain-knowledge` et `types-consume-entity` dans le catalogue Dorian : leur application et leur contrôle manquent davantage que leur formulation.

**4. Les renderers dans les configurations externes échappent au contrôle de composition — P1**

[PositionsTable.feature.tsx](src/domains/portfolio/features/holdings/features/positions/components/PositionsTable.feature.tsx#L252) fait 1 002 lignes. `PositionsTable` en occupe 751 et son callback `useMemo` des colonnes 552. Les `cell` et `header` mêlent JSX, choix de présentation, formatage, calculs et ouverture d’overlays.

`local/require-children-composition` contrôle les props JSX, mais une sonde `col.display({ cell: ({ row }) => <span>...</span> })` est acceptée. Le catalogue décrit les renderers imposés par une dépendance sans rendre explicite le cas des objets de configuration.

Extraire les cellules et en-têtes en composants nommés, puis conserver des définitions de colonnes lisibles. Les données et actions nécessaires peuvent être fournies par un contexte de table typé, ses métadonnées ou un petit adaptateur explicite. Déplacer le même bloc de 550 lignes dans un hook ne suffirait pas à clarifier les responsabilités.

Étendre la règle de composition et son lint aux champs de configuration dont le contrat est celui d’un renderer externe, par exemple `ColumnDef.cell` et `ColumnDef.header`. Se baser sur la bibliothèque et le type résolu ; ne pas interdire toutes les propriétés appelées `cell`, tous les callbacks ni les fonctions scalaires de formatage. TanStack distingue bien ces fonctions de rendu dans ses définitions de colonnes. [Guide officiel des colonnes](https://tanstack.com/table/v8/docs/guide/column-defs).

**5. La CI ne valide pas l’ensemble des garanties déjà disponibles — P1**

[ci.yml:60](../../.github/workflows/ci.yml#L60) lance seulement le test de frontière d’accessibilité et les tests `src/shared/ui`. Les autres règles ESLint, calculs financiers, requêtes, schémas et services ne sont pas exécutés par ce job. `npm run audit:i18n` et la vérification Prettier n’y figurent pas non plus.

Remplacer le sous-ensemble par `npm test`, ajouter le contrôle du catalogue et une vérification de formatage adaptée. Éviter de relancer tout ESLint plusieurs fois si les scripts sont réorganisés.

`npm run lint` réussit actuellement malgré son avertissement. Résoudre d’abord [AccountTypeBreakdownChart.feature.tsx:175](src/domains/portfolio/features/wealth/components/AccountTypeBreakdownChart/AccountTypeBreakdownChart.feature.tsx#L175), puis rendre explicite la politique de CI avec `--max-warnings 0` pour les règles retenues. Les mesures de taille exploratoires ne doivent pas devenir bloquantes avant leur triage.

Le lint rapporte également **38 diagnostics supprimés** pour `local/no-prop-drilling`. Ils mélangent plusieurs intentions : chaînes de props, construction d’état et dérivation de présentation. [AnalysisReliabilityKpi.feature.tsx:129](src/domains/portfolio/shared/components/quality/AnalysisReliabilityKpi.feature.tsx#L129) justifie notamment une présentation calculée par le parent.

Revoir la classification de ces composants et les exceptions avant de durcir ce contrôle. Un renderer local comme `AccountTypeLabel` peut appartenir à un module `.view.tsx`. La création de tableaux de libellés pour un enfant n’est pas toujours une perte de propriété métier. Ne pas déplacer des calculs dans Jotai pour faire disparaître les messages.

**6. Plusieurs helpers regroupent des responsabilités indépendantes — P2**

| Fichier                                                                                                                             | Observation                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| [calculatePortfolioCharts.ts](src/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts.ts)                         | 640 lignes, 14 fonctions publiques : sélection de périodes, agrégation, concentration, performance, données de graphique et géométrie de crosshair |
| [allocationChartCalculations.ts](src/domains/portfolio/features/diversification/helpers/calculators/allocationChartCalculations.ts) | 8 fonctions publiques, dont domaines visuels, sélection et agrégation                                                                              |
| [portfolioDataFilters.ts](src/domains/portfolio/shared/helpers/filters/portfolioDataFilters.ts)                                     | 7 fonctions publiques : qualité, filtres, agrégation et tri                                                                                        |
| [portfolioFilters.ts](src/domains/portfolio/shared/components/filters/helpers/filters/portfolioFilters.ts)                          | 9 fonctions publiques : labels, options, visibilité, état initial et dates prédéfinies                                                             |

Appliquer `helpers-categories` et `arch-component-module-boundaries` du skill générique : responsabilités nommées, catégorie conforme à l’entrée/sortie, emplacement au plus petit périmètre commun. Par exemple `cumulativeConcentrationCrosshair` relève de la présentation, `filterPointsByPeriod` de la sélection et `computeTrailing12mIncome` du calcul métier.

Une règle locale peut vérifier les catégories autorisées et le nom du helper public dans un fichier de helpers. La décision de partager un algorithme ou de séparer un groupe cohérent reste une revue d’architecture. Ne pas appliquer « un seul export » aux modules de types, registres, schémas et constantes ; ne pas créer un hook par ligne d’orchestration.

Le sondage avec `complexity: { max: 15, variant: 'modified' }` produit 22 diagnostics de production ; `max-lines-per-function: 150`, hors blancs/commentaires, en produit 22 autres. Aucun dépassement avec `max-depth: 4`. Les seuils sont exploratoires.

Exemples : `buildPositionRows` a une complexité de 51, `computePerformanceContributions` de 40 et `PositionBodyRow` de 38. `useDashboardViewModel` approche 300 lignes mais ne dépasse pas ce seuil de complexité : la taille et le couplage restent deux questions différentes. Préférer `complexity` pour guider les premières extractions ; utiliser la taille comme indicateur, sans découper mécaniquement un JSX cohérent. [complexity](https://eslint.org/docs/latest/rules/complexity), [max-lines-per-function](https://eslint.org/docs/latest/rules/max-lines-per-function).

**7. Quatre états indépendants représentent un seul overlay exclusif — P2**

[usePositionTableOverlays.ts:11](src/domains/portfolio/features/holdings/features/positions/services/usePositionTableOverlays.ts#L11) expose `chart`, `savingsChart`, `allocationHover` et `underlyingPopover`, ainsi que leurs setters. Les handlers de [PositionsTable.feature.tsx:139](src/domains/portfolio/features/holdings/features/positions/components/PositionsTable.feature.tsx#L139) doivent effacer plusieurs états avant d’en ouvrir un.

Le comportement attendu est exclusif, alors que le modèle autorise plusieurs valeurs actives. Employer une union discriminée :

```typescript
type PositionOverlay =
  | { kind: 'closed' }
  | { kind: 'price'; target: ChartTarget }
  | { kind: 'savings'; target: SavingsChartTarget }
  | { kind: 'allocation'; target: AllocationHoverTarget }
  | { kind: 'underlying'; target: FundPositionPopoverTarget }
```

Le service expose des actions sémantiques (`showPrice`, `showUnderlying`, `dismiss`). Préserver l’accès externe aujourd’hui assuré par l’atom de sous-jacents, les délais de fermeture et la restauration du focus ; le nouveau modèle doit avoir un propriétaire unique malgré ces différents points d’entrée.

`@typescript-eslint/switch-exhaustiveness-check` peut ensuite protéger les `switch` sur cette union, mais aucun lint généraliste ne peut déduire que ces quatre overlays sont exclusifs. La règle de skill proposée est : **“Represent mutually exclusive UI modes with one discriminated state and expose semantic transitions from its owner.”** Le signal de routage serait une action qui réinitialise plusieurs états concurrents avant d’en activer un. Des panneaux réellement simultanés sont une exception explicite. [switch-exhaustiveness-check](https://typescript-eslint.io/rules/switch-exhaustiveness-check/).

**8. Le formatage et les politiques de présentation restent partiellement dispersés — P2**

[formatOverviewPeriodRange.ts:4](src/domains/portfolio/features/overview/helpers/formatters/formatOverviewPeriodRange.ts#L4), `formatPerformanceDateRange`, `formatExactPerformanceDateRange` et [formatIrrKpiValue.ts:5](src/domains/portfolio/shared/components/kpis/helpers/formatters/formatIrrKpiValue.ts#L5) reçoivent un formatter issu d’un autre hook. `formatIrrKpiValue` refait aussi le fallback `null → '—'` déjà géré par `useFormatPercentage`. À l’inverse, [useFormatMonthRange.ts](src/domains/portfolio/features/wealth/helpers/formatters/useFormatMonthRange.ts) possède son formatter.

Suivre `helpers-no-context-params` et `helpers-formatter-hooks` : un formatter de domaine possède les dépendances de contexte dont il a besoin et renvoie une fonction mémorisée. Garder les états métier comme « calculating » dans leur propriétaire ; confier le simple fallback numérique au formatter existant. Le contrôle actuel des fallbacks se concentre sur les fichiers TSX et ne détecte pas ce wrapper `.ts`.

Il existe aussi deux `OP_LABELS`, dans `FilterBar.feature.tsx:41` et `portfolioFilters.ts:72`, et plusieurs politiques de signe voisines : `getPerformanceColor`, `getOverviewPerformanceTone`, `gainClass`, puis des ternaires dans les graphiques et classements.

Centraliser les labels d’opérations et la décision sémantique commune (`positive`, `negative`, `neutral`, éventuellement `unavailable`), puis laisser les presenters locaux choisir les classes ou couleurs appropriées. Conserver les différences intentionnelles : absence, zéro, baisse de concentration et gain financier ne partagent pas toujours le même sens. Aujourd’hui `getPerformanceColor(null)` est positif tandis que deux autres presenters utilisent une couleur neutre ; ce choix doit être explicite avant toute fusion.

Les axes, grilles et tooltips répètent également des configurations malgré `CHART_THEME` et `TooltipBox`. Partager les paramètres stables et les petites structures utiles, en préservant le contrat de rendu Recharts. Un wrapper universel de graphique à dizaines de props complexifierait la lecture.

Une éventuelle nouvelle règle Dorian peut porter sur la politique plutôt que sur chaque fragment JSX : **“Centralize repeated semantic presentation decisions while preserving local rendering and explicit missing-value policies.”** Le routage doit exiger une décision réellement répétée, et exclure les simples ressemblances visuelles. Les règles génériques couvrent déjà l’emplacement des formatters ; inutile de les recopier.

**9. Les panneaux chargés à la demande partagent encore un chargement et un modèle globaux — P2**

[App.feature.tsx:46](src/app/App.feature.tsx#L46) charge les composants avec `lazy`, mais [useDashboardViewModel.ts:77](src/app/services/useDashboardViewModel.ts#L77) lance les sources et assemble les calculs des différentes sections. [useDashboardViewModel.ts:212](src/app/services/useDashboardViewModel.ts#L212) agrège douze états de chargement/erreur dans un état global. Une erreur de source utilisée par une autre section peut donc rendre indisponible tout le contenu sous `DashboardLoadState`.

Définir les données indispensables à toute l’application, puis confier aux panneaux leur modèle et leur état de données spécifique. Partager les queries sources avec des options identiques et le cache existant. Certaines données de qualité servent volontairement aux indicateurs de toutes les sections : elles peuvent rester communes, avec une présentation explicite de leur indisponibilité.

Les observateurs `useQuery({ queryFn: skipToken })` dans `useAccountFilterLabels` et `usePortfolioFilterOptions` ne créent pas une deuxième requête réseau ; ce sont des lecteurs du cache. Leur contrat de lecture gagnerait néanmoins à appartenir à l’API du domaine plutôt qu’à être redéclaré par ses consommateurs.

La nouvelle règle proposée est : **“Keep application-wide data prerequisites minimal and let each independently rendered panel own its specific derivations and load state.”** Les signaux seraient des résultats réservés à un panneau assemblés par le shell, ou une erreur de panneau qui remplace toute l’application. Les données véritablement communes et les exigences de cohérence globale sont des exceptions. Tester la navigation et les erreurs réseau d’un panneau sans casser les autres est plus probant qu’un quota de hooks.

Le plugin officiel TanStack Query peut compléter les contrôles de clés et de dépendances (`exhaustive-deps`, `stable-query-client`, `no-unstable-deps`), mais il ne choisit pas cette architecture. Il n’est pas installé et n’a pas été essayé dans cet audit ; vérifier sa compatibilité avec ESLint 10 avant son ajout. [Plugin officiel TanStack Query](https://tanstack.com/query/latest/docs/eslint/eslint-plugin-query).

**10. `void` laisse des rejets de promesse sans gestion explicite — P2**

[dashboardTabLoaders.ts:35](src/app/services/dashboardTabLoaders.ts#L35) précharge les chunks avec `void DASHBOARD_TAB_LOADERS[tab]()`. Un échec de téléchargement peut rejeter cette promesse ; `void` n’en traite pas l’erreur. [i18n.ts:6](src/i18n/i18n.ts#L6) présente aussi une promesse d’initialisation ignorée. Un rejet réel n’a pas été reproduit pendant cet audit.

`no-floating-promises` avec ses options par défaut ne signale aucun cas. Avec `ignoreVoid: false`, il signale exactement ces deux lignes. Définir le traitement attendu : un échec de préchargement opportuniste doit conserver la navigation et laisser le chargement réel utiliser sa frontière d’erreur ; une initialisation doit avoir une politique explicite d’échec. Ne pas ajouter un `.catch(() => {})` systématique aux promesses métier. [no-floating-promises et option ignoreVoid](https://typescript-eslint.io/rules/no-floating-promises/).

**Configuration ESLint initiale proposée, sans nouvelle dépendance**

Ce fragment s’ajoute au bloc TypeScript existant ; il n’a pas été activé dans le dépôt. Les corrections des diagnostics précèdent son passage en CI.

```javascript
rules: {
  '@typescript-eslint/no-unsafe-assignment': 'error',
  '@typescript-eslint/no-unsafe-argument': 'error',
  '@typescript-eslint/no-unsafe-call': 'error',
  '@typescript-eslint/no-unsafe-member-access': 'error',
  '@typescript-eslint/no-unsafe-return': 'error',
  '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: false }],
  '@typescript-eslint/no-misused-promises': 'error',
  '@typescript-eslint/await-thenable': 'error',
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  '@typescript-eslint/consistent-type-imports': 'error',
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
}
```

`no-misused-promises`, `await-thenable` et `switch-exhaustiveness-check` n’ont pas produit de diagnostic dans le sondage : ils apportent surtout une prévention. En parallèle, développer les contrôles locaux de couleurs et de renderers, puis renforcer les frontières d’imports. Réutiliser les utilitaires AST et les tests de configuration déjà présents dans `eslint-rules`.

**Ce que je changerais dans le skill Dorian**

| Élément du catalogue                                  | Évolution proposée                                                                                                                                                            |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `styling-semantic-colors`                             | Ajouter l’enforcement, son périmètre et ses exceptions après implémentation du contrôle                                                                                       |
| `composition-required-children`                       | Inclure les renderers dans les objets de configuration externes, leur typage et la transmission explicite de leurs données                                                    |
| `architecture-extract-component-calculations`         | Ajouter un petit exemple de dérivation répartie entre variables, `map`/`filter` et callback ; la limite numérique du lint ne définit pas à elle seule la bonne responsabilité |
| `architecture-formatter-fallbacks`                    | Clarifier le cas d’un wrapper formatter `.ts` qui réimplémente un fallback déjà disponible, sans interdire les statuts métier                                                 |
| Nouvelle règle : état exclusif                        | Union discriminée et transitions sémantiques pour des modes réellement exclusifs                                                                                              |
| Nouvelle règle : périmètre des panneaux               | Données communes minimales et état de chargement propre aux panneaux indépendants                                                                                             |
| Nouvelle règle éventuelle : politique de présentation | Centraliser la décision répétée, en conservant les variantes locales et les différences d’absence/zéro                                                                        |
| Workflow de maintenance                               | Chercher d’abord un contrôle ESLint/TypeScript existant ; compléter une règle existante avant d’en ajouter une ; documenter ce que le contrôle ne prouve pas                  |

Ce sont des propositions fondées sur le code observé, pas de nouvelles conventions déjà approuvées. Les noms de nouveaux fichiers restent à choisir. Pour chaque règle retenue, suivre `references/adding-a-rule.md` : phrase impérative, applicabilité, exceptions, exemple isolé, routage précis et entrée dans le Quick Reference. Une règle automatisable doit pointer vers son enforcement réel ; une règle architecturale doit expliquer les décisions qu’un lint ne sait pas vérifier.

**Contrôles à ne pas durcir mécaniquement**

- `no-unnecessary-condition` produit 42 diagnostics, dont des gardes sur des données de bibliothèques, des schémas et des accès indexés. Les supprimer en masse ferait disparaître des défenses utiles. Corriger d’abord les contrats et examiner chaque cas.
- L’essai de `noUncheckedIndexedAccess` produit 167 erreurs TypeScript, tests compris. Cette option mérite un chantier distinct ; elle explique notamment pourquoi certains accès indexés paraissent aujourd’hui plus sûrs au compilateur qu’ils ne le sont à l’exécution.
- `no-param-reassign` avec `props: true` produit un diagnostic dans un algorithme de placement. La mutation d’un objet local ne justifie pas à elle seule une interdiction générale.
- `no-console` signale le journal d’erreur de la frontière React. Définir la stratégie de diagnostic avant d’interdire ce cas utile.
- Les traductions au niveau module ne réagissent pas à un changement de langue, mais le dashboard ne propose actuellement qu’un catalogue anglais. Ce n’est pas un défaut fonctionnel actuel ni une raison de réécrire tous ces modules.
- La clé et la logique de thème présentes dans `index.html` évitent un changement visuel au démarrage. Leur ressemblance avec le store ne suffit pas à justifier une dépendance bloquante au bundle React.
- Ne pas recopier les 89 règles génériques dans Dorian, ajouter du `useMemo` partout, imposer des tests miroirs à chaque helper ou promouvoir toute répétition dans `src/shared`. Le choix du propriétaire et le maintien du comportement priment.

**Ordre de réalisation concret**

1. Corriger les frontières `any`, l’avertissement existant et les deux promesses ; activer les règles typées sélectionnées et faire exécuter la suite complète en CI.
2. Ajouter les contrôles de couleurs et de renderers, corriger les imports inversés et découper les cellules de `PositionsTable` avec une union d’overlay unique.
3. Réorganiser les gros helpers par responsabilité, mutualiser les labels/formatters et isoler progressivement les modèles et erreurs spécifiques aux panneaux.
4. Mettre à jour les règles existantes du skill puis ajouter uniquement les décisions architecturales retenues qui ne sont couvertes ni par les contrôles ni par le skill générique.
