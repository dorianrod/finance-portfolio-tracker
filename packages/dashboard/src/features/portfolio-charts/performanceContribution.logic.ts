import type { RawOperation, RawPosition } from '@/types/domain'
import { accountFilterId } from '@/shared/filters/accountFilter'
import { parseNum } from '@/shared/csv/parseNum'

export type ContributionHorizon = 'since-tracking' | 'trailing-3y'

export interface PerformanceContribution {
  key: string
  label: string
  name: string
  amount: number
  share: number
  accounts: string[]
}

export interface PerformanceContributionSummary {
  horizon: ContributionHorizon
  available: boolean
  startDate: string | null
  endDate: string | null
  netContribution: number
  positiveTotal: number
  negativeTotal: number
  contributors: PerformanceContribution[]
  detractors: PerformanceContribution[]
}

export interface PerformanceContributionFilters {
  accounts: Set<string>
  accountTypes: Set<string>
}

interface AssetMeta {
  key: string
  name: string
  ticker: string
  account: string
  accountType: string
  filterId: string
}

interface ContributionAccumulator {
  key: string
  name: string
  ticker: string
  amount: number
  accounts: Set<string>
}

const THREE_YEAR_DAYS = Math.round(3 * 365.25)
const DAY_MS = 24 * 60 * 60 * 1000

function clean(value: string | undefined): string {
  return (value ?? '').trim()
}

function assetKey(row: Pick<RawPosition | RawOperation, 'isin' | 'ticker' | 'name'>): string {
  const isin = clean(row.isin)
  if (isin) return `isin:${isin.toUpperCase()}`
  const ticker = clean(row.ticker)
  if (ticker) return `ticker:${ticker.toUpperCase()}`
  const name = clean(row.name)
  return name ? `name:${name.toLocaleLowerCase('en')}` : ''
}

function accountAssetKey(account: string, key: string): string {
  return `${account}\u0000${key}`
}

function datePart(value: string): string {
  return value.slice(0, 10)
}

function subtractDays(date: string, days: number): string {
  const timestamp = Date.parse(`${date}T00:00:00Z`)
  return new Date(timestamp - days * DAY_MS).toISOString().slice(0, 10)
}

function unavailableSummary(horizon: ContributionHorizon): PerformanceContributionSummary {
  return {
    horizon,
    available: false,
    startDate: null,
    endDate: null,
    netContribution: 0,
    positiveTotal: 0,
    negativeTotal: 0,
    contributors: [],
    detractors: [],
  }
}

function isPositionInScope(row: RawPosition, filters: PerformanceContributionFilters): boolean {
  if (filters.accountTypes.size > 0 && !filters.accountTypes.has(clean(row.account_type))) return false
  if (filters.accounts.size > 0 && !filters.accounts.has(accountFilterId(row))) return false
  return true
}

function buildMeta(row: RawPosition): AssetMeta | null {
  const key = assetKey(row)
  if (!key) return null
  return {
    key,
    name: clean(row.name) || clean(row.ticker) || key,
    ticker: clean(row.ticker),
    account: row.account,
    accountType: clean(row.account_type),
    filterId: accountFilterId(row),
  }
}

function operationIsInScope(
  operation: RawOperation,
  meta: AssetMeta | undefined,
  filters: PerformanceContributionFilters,
  accountTypes: Map<string, Set<string>>,
): boolean {
  if (filters.accounts.size > 0) {
    if (meta) {
      if (!filters.accounts.has(meta.filterId)) return false
    } else if (!filters.accounts.has(operation.account)) {
      return false
    }
  }

  if (filters.accountTypes.size === 0) return true
  if (meta) return filters.accountTypes.has(meta.accountType)
  const types = accountTypes.get(operation.account)
  return types !== undefined && [...types].some((type) => filters.accountTypes.has(type))
}

function makeContribution(
  item: ContributionAccumulator,
  denominator: number,
): PerformanceContribution {
  return {
    key: item.key,
    label: item.ticker || item.name.slice(0, 28),
    name: item.name,
    amount: Math.round(item.amount * 100) / 100,
    share: denominator > 0 ? Math.abs(item.amount) / denominator * 100 : 0,
    accounts: [...item.accounts].sort(),
  }
}

export function computePerformanceContributions(
  rawPositions: RawPosition[],
  rawOperations: RawOperation[],
  horizon: ContributionHorizon,
  asOfDate: string | undefined,
  filters: PerformanceContributionFilters,
): PerformanceContributionSummary {
  if (!asOfDate) return unavailableSummary(horizon)

  const requestedEnd = datePart(asOfDate)
  const positionsThroughEnd = rawPositions.filter((row) => datePart(row.snapshot_date) <= requestedEnd)
  const metaByAccountAsset = new Map<string, AssetMeta>()
  const accountTypes = new Map<string, Set<string>>()

  for (const row of positionsThroughEnd) {
    const meta = buildMeta(row)
    if (!meta) continue
    metaByAccountAsset.set(accountAssetKey(row.account, meta.key), meta)
    const types = accountTypes.get(row.account) ?? new Set<string>()
    if (meta.accountType) types.add(meta.accountType)
    accountTypes.set(row.account, types)
  }

  const positions = positionsThroughEnd.filter((row) => isPositionInScope(row, filters))
  const snapshotDates = [...new Set(positions.map((row) => datePart(row.snapshot_date)))].sort()
  const endDate = snapshotDates.at(-1)
  if (!endDate) return unavailableSummary(horizon)

  const startsByFilterId = new Map<string, string>()
  let startDate: string | null
  if (horizon === 'since-tracking') {
    for (const row of positions) {
      const filterId = accountFilterId(row)
      const rowDate = datePart(row.snapshot_date)
      const current = startsByFilterId.get(filterId)
      if (!current || rowDate < current) startsByFilterId.set(filterId, rowDate)
    }
    startDate = [...startsByFilterId.values()].sort()[0] ?? null
  } else {
    const firstSnapshot = snapshotDates[0]
    const cutoff = subtractDays(endDate, THREE_YEAR_DAYS)
    if (Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${firstSnapshot}T00:00:00Z`) < THREE_YEAR_DAYS * DAY_MS) {
      return unavailableSummary(horizon)
    }
    startDate = snapshotDates.filter((date) => date <= cutoff).at(-1) ?? null
  }

  if (!startDate) return unavailableSummary(horizon)

  const contributions = new Map<string, ContributionAccumulator>()
  const touch = (key: string, name: string, ticker: string, account: string): ContributionAccumulator => {
    const current = contributions.get(key) ?? {
      key,
      name: name || ticker || key,
      ticker,
      amount: 0,
      accounts: new Set<string>(),
    }
    if (!current.ticker && ticker) current.ticker = ticker
    if ((!current.name || current.name === current.key) && name) current.name = name
    current.accounts.add(account)
    contributions.set(key, current)
    return current
  }

  for (const row of positions) {
    const key = assetKey(row)
    if (!key) continue
    const rowDate = datePart(row.snapshot_date)
    const endValue = rowDate === endDate ? (parseNum(row.unrealized_gain) ?? 0) : 0
    const isOpeningRow = horizon === 'since-tracking'
      ? rowDate === startsByFilterId.get(accountFilterId(row))
      : rowDate === startDate
    const openingValue = isOpeningRow ? (parseNum(row.unrealized_gain) ?? 0) : 0
    if (endValue === 0 && openingValue === 0) continue
    touch(key, clean(row.name), clean(row.ticker), row.account).amount += endValue - openingValue
  }

  for (const operation of rawOperations) {
    if (!['SELL', 'DIVIDEND', 'INTEREST'].includes(operation.operation_type)) continue
    const operationDate = datePart(operation.date)
    if (operationDate > endDate) continue
    const key = assetKey(operation)
    if (!key) continue
    const meta = metaByAccountAsset.get(accountAssetKey(operation.account, key))
    if (!operationIsInScope(operation, meta, filters, accountTypes)) continue

    const lowerBound = horizon === 'since-tracking'
      ? meta ? startsByFilterId.get(meta.filterId) : startsByFilterId.get(operation.account)
      : startDate
    if (!lowerBound || operationDate <= lowerBound) continue

    const amount = operation.operation_type === 'SELL'
      ? (parseNum(operation.realized_gain) ?? 0)
      : (parseNum(operation.total_amount) ?? 0)
    if (amount === 0) continue
    touch(
      key,
      meta?.name || clean(operation.name),
      meta?.ticker || clean(operation.ticker),
      operation.account,
    ).amount += amount
  }

  const nonZero = [...contributions.values()].filter((item) => Math.abs(item.amount) >= 0.005)
  const positiveTotal = nonZero.reduce((sum, item) => sum + Math.max(item.amount, 0), 0)
  const negativeTotal = nonZero.reduce((sum, item) => sum + Math.max(-item.amount, 0), 0)
  const contributors = nonZero
    .filter((item) => item.amount > 0)
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 5)
    .map((item) => makeContribution(item, positiveTotal))
  const detractors = nonZero
    .filter((item) => item.amount < 0)
    .sort((left, right) => left.amount - right.amount)
    .slice(0, 5)
    .map((item) => makeContribution(item, negativeTotal))

  return {
    horizon,
    available: true,
    startDate,
    endDate,
    netContribution: Math.round((positiveTotal - negativeTotal) * 100) / 100,
    positiveTotal: Math.round(positiveTotal * 100) / 100,
    negativeTotal: Math.round(negativeTotal * 100) / 100,
    contributors,
    detractors,
  }
}
