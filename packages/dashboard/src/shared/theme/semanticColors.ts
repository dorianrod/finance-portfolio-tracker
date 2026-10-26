export const SEMANTIC_COLORS = {
  netContributions: '#3b82f6',
  netContributionsText: '#60a5fa',
  netContributionsDetail: '#93c5fd',
  outflowText: '#f87171',
  costBasis: '#818cf8',
  costBasisText: '#a5b4fc',
  performance: '#10b981',
  performancePositive: '#22c55e',
  performancePositiveText: '#4ade80',
  performanceNegative: '#ef4444',
  performanceNegativeText: '#f87171',
  passiveIncome: '#8b5cf6',
  passiveIncomeSecondary: '#c084fc',
  returnRate: '#14b8a6',
  portfolioValue: '#06b6d4',
  portfolioValueText: '#22d3ee',
  totalChange: '#f59e0b',
  risk: '#f97316',
  riskSecondary: '#fb923c',
  neutralSeries: '#64748b',
  mutedIndicator: 'var(--color-content-muted)',
  coverage: '#10b981',
  coverageGap: '#f59e0b',
  transactionBuy: '#3b82f6',
  transactionBuyStroke: '#1d4ed8',
  transactionSell: '#f97316',
  transactionSellStroke: '#c2410c',
  transactionIncome: '#a855f7',
  transactionIncomeStroke: '#7c3aed',
  transactionMixed: '#a855f7',
  transactionMixedStroke: '#7c3aed',
} as const

export type SemanticColorKey = keyof typeof SEMANTIC_COLORS

export const SEMANTIC_TEXT_CLASSES = {
  netContributions: 'text-accent',
  netContributionsDetail: 'text-accent',
  netContributionsDecoration: 'decoration-accent/50',
  performancePositive: 'text-positive',
  performanceNegative: 'text-danger',
  outflowDetail: 'text-danger',
  passiveIncome: 'text-income',
  passiveIncomeDetail: 'text-income',
  risk: 'text-risk',
  riskSecondary: 'text-risk',
  coverage: 'text-positive',
  warning: 'text-warning',
  error: 'text-danger',
} as const

export const SEMANTIC_BADGE_CLASSES = {
  transactionBuy: 'bg-accent-muted text-accent',
  transactionSell: 'bg-risk-muted text-risk',
  transactionOther: 'bg-income-muted text-income',
} as const

export const SEMANTIC_STATUS_BADGE_CLASSES = {
  critical: 'bg-danger-muted/60 text-danger',
  warning: 'bg-warning-muted/60 text-warning',
} as const

export const SEMANTIC_ACCENT_CLASSES = {
  coverage: { border: 'border-l-positive', dot: 'bg-positive' },
  warning: { border: 'border-l-warning', dot: 'bg-warning' },
  error: { border: 'border-l-danger', dot: 'bg-danger' },
} as const
