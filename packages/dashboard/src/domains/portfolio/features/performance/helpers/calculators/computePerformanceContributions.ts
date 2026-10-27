import { accountFilterId } from '@/domains/portfolio/shared/helpers/filters/accountFilter/accountFilterId'
import { resolveAssetName } from '@/domains/portfolio/shared/helpers/mappers/resolveAssetName'
import type { RawOperation } from '@/domains/portfolio/shared/types/rawOperation.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

export function computePerformanceContributions(
  rawPositions: RawPosition[],
  rawOperations: RawOperation[],
  horizon: ContributionHorizon,
  asOfDate: Date | undefined,
  filters: PerformanceContributionFilters,
): PerformanceContributionSummary {
  if (!asOfDate) return unavailableSummary(horizon)

  const requestedEnd = datePart(asOfDate)
  const positionsThroughEnd = rawPositions.filter(
    (row) => datePart(row.snapshot_date) <= requestedEnd,
  )
  const scope = buildContributionScope(positionsThroughEnd)

  const positions = positionsThroughEnd.filter((row) =>
    isPositionInScope(row, filters),
  )
  const snapshotDates = [
    ...new Set(positions.map((row) => datePart(row.snapshot_date))),
  ].toSorted((left, right) => left - right)
  const endDate = snapshotDates.at(-1)
  if (endDate == null) return unavailableSummary(horizon)

  const period = resolveContributionPeriod(
    positions,
    snapshotDates,
    endDate,
    horizon,
  )
  if (!period) return unavailableSummary(horizon)
  const { startDate } = period

  const contributions = new Map<string, ContributionAccumulator>()
  const touch = (
    key: string,
    name: string,
    ticker: string,
    account: string,
  ): ContributionAccumulator => {
    const current = contributions.get(key) ?? {
      key,
      name: resolveAssetName({ name, ticker }, key),
      ticker,
      amount: 0,
      accounts: new Set<string>(),
    }
    if (!current.ticker && ticker) current.ticker = ticker
    if ((!current.name || current.name === current.key) && name)
      current.name = name
    current.accounts.add(account)
    contributions.set(key, current)
    return current
  }

  addPositionContributions(positions, period, touch)
  addOperationContributions(rawOperations, period, scope, filters, touch)

  const nonZero = [...contributions.values()].filter(
    (item) => Math.abs(item.amount) >= 0.005,
  )
  const positiveTotal = nonZero.reduce(
    (sum, item) => sum + Math.max(item.amount, 0),
    0,
  )
  const negativeTotal = nonZero.reduce(
    (sum, item) => sum + Math.max(-item.amount, 0),
    0,
  )
  const contributors = nonZero
    .filter((item) => item.amount > 0)
    .toSorted((left, right) => right.amount - left.amount)
    .slice(0, 5)
    .map((item) => makeContribution(item, positiveTotal))
  const detractors = nonZero
    .filter((item) => item.amount < 0)
    .toSorted((left, right) => left.amount - right.amount)
    .slice(0, 5)
    .map((item) => makeContribution(item, negativeTotal))

  return {
    horizon,
    available: true,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    netContribution: Math.round((positiveTotal - negativeTotal) * 100) / 100,
    positiveTotal: Math.round(positiveTotal * 100) / 100,
    negativeTotal: Math.round(negativeTotal * 100) / 100,
    contributors,
    detractors,
  }
}

export type ContributionHorizon = 'since-tracking' | 'trailing-3y'

export type PerformanceContribution = {
  key: string
  label: string
  name: string
  amount: number
  share: number
  accounts: string[]
}

export type PerformanceContributionSummary = {
  horizon: ContributionHorizon
  available: boolean
  startDate: Date | null
  endDate: Date | null
  netContribution: number
  positiveTotal: number
  negativeTotal: number
  contributors: PerformanceContribution[]
  detractors: PerformanceContribution[]
}

export type PerformanceContributionFilters = {
  accounts: Set<string>
  accountTypes: Set<string>
}

type AssetMeta = {
  key: string
  name: string
  ticker: string
  account: string
  accountType: string
  filterId: string
}

type ContributionAccumulator = {
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

function assetKey(
  row: Pick<RawPosition | RawOperation, 'isin' | 'ticker' | 'name'>,
): string {
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

function datePart(value: Date): number {
  return value.getTime()
}

function subtractDays(date: number, days: number): number {
  return date - days * DAY_MS
}

function unavailableSummary(
  horizon: ContributionHorizon,
): PerformanceContributionSummary {
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

function isPositionInScope(
  row: RawPosition,
  filters: PerformanceContributionFilters,
): boolean {
  if (
    filters.accountTypes.size > 0 &&
    !filters.accountTypes.has(clean(row.account_type))
  )
    return false
  if (filters.accounts.size > 0 && !filters.accounts.has(accountFilterId(row)))
    return false
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
  return (
    types !== undefined &&
    [...types].some((type) => filters.accountTypes.has(type))
  )
}

function makeContribution(
  item: ContributionAccumulator,
  denominator: number,
): PerformanceContribution {
  return {
    key: item.key,
    label: resolveAssetName(item, item.key),
    name: item.name,
    amount: Math.round(item.amount * 100) / 100,
    share: denominator > 0 ? (Math.abs(item.amount) / denominator) * 100 : 0,
    accounts: [...item.accounts].toSorted(),
  }
}

function buildContributionScope(positionsThroughEnd: RawPosition[]) {
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

  return { metaByAccountAsset, accountTypes }
}

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Since-tracking and three-year bounds are the two modes of the same contribution-period policy.
function resolveContributionPeriod(
  positions: RawPosition[],
  snapshotDates: number[],
  endDate: number,
  horizon: ContributionHorizon,
) {
  const startsByFilterId = new Map<string, number>()
  let startDate: number | null
  if (horizon === 'since-tracking') {
    startDate = null
    for (const row of positions) {
      const filterId = accountFilterId(row)
      const rowDate = datePart(row.snapshot_date)
      const current = startsByFilterId.get(filterId)
      if (current == null || rowDate < current)
        startsByFilterId.set(filterId, rowDate)
      startDate = startDate == null ? rowDate : Math.min(startDate, rowDate)
    }
  } else {
    const firstSnapshot = snapshotDates[0]
    const cutoff = subtractDays(endDate, THREE_YEAR_DAYS)
    if (endDate - firstSnapshot < THREE_YEAR_DAYS * DAY_MS) {
      return null
    }
    startDate = snapshotDates.filter((date) => date <= cutoff).at(-1) ?? null
  }

  if (startDate == null) return null

  return { startDate, startsByFilterId, endDate, horizon }
}

type TouchContribution = (
  key: string,
  name: string,
  ticker: string,
  account: string,
) => ContributionAccumulator
type ContributionPeriod = NonNullable<
  ReturnType<typeof resolveContributionPeriod>
>
// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Opening and closing unrealized values feed one per-position contribution update.
function addPositionContributions(
  positions: RawPosition[],
  period: ContributionPeriod,
  touch: TouchContribution,
) {
  const { horizon, endDate, startDate, startsByFilterId } = period
  for (const row of positions) {
    const key = assetKey(row)
    if (!key) continue
    const rowDate = datePart(row.snapshot_date)
    const endValue = rowDate === endDate ? (row.unrealized_gain ?? 0) : 0
    const isOpeningRow =
      horizon === 'since-tracking'
        ? rowDate === startsByFilterId.get(accountFilterId(row))
        : rowDate === startDate
    const openingValue = isOpeningRow ? (row.unrealized_gain ?? 0) : 0
    if (endValue === 0 && openingValue === 0) continue
    touch(key, clean(row.name), clean(row.ticker), row.account).amount +=
      endValue - openingValue
  }
}
// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Realized sales and income operations feed the same scoped contribution ledger with identical identity fallback.
function addOperationContributions(
  rawOperations: RawOperation[],
  period: ContributionPeriod,
  scope: ReturnType<typeof buildContributionScope>,
  filters: PerformanceContributionFilters,
  touch: TouchContribution,
) {
  for (const operation of rawOperations) {
    const eligible = selectContributionOperation(
      operation,
      period,
      scope,
      filters,
    )
    if (!eligible) continue
    const { key, meta } = eligible
    const amount =
      operation.operation_type === 'SELL'
        ? operation.realized_gain
        : operation.total_amount
    if (amount === 0) continue
    touch(
      key,
      meta?.name || clean(operation.name),
      meta?.ticker || clean(operation.ticker),
      operation.account,
    ).amount += amount
  }
}

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Operation kind, date, asset and account bounds form one contribution eligibility decision.
function selectContributionOperation(
  operation: RawOperation,
  period: ContributionPeriod,
  scope: ReturnType<typeof buildContributionScope>,
  filters: PerformanceContributionFilters,
): { key: string; meta: AssetMeta | undefined } | null {
  const { horizon, endDate, startDate, startsByFilterId } = period
  const { metaByAccountAsset, accountTypes } = scope
  if (!['SELL', 'DIVIDEND', 'INTEREST'].includes(operation.operation_type))
    return null
  const operationDate = datePart(operation.date)
  if (operationDate > endDate) return null
  const key = assetKey(operation)
  if (!key) return null
  const meta = metaByAccountAsset.get(accountAssetKey(operation.account, key))
  if (!operationIsInScope(operation, meta, filters, accountTypes)) return null

  let lowerBound: number | undefined = startDate
  if (horizon === 'since-tracking') {
    lowerBound = startsByFilterId.get(meta?.filterId ?? operation.account)
  }
  if (lowerBound == null || operationDate <= lowerBound) return null

  return { key, meta }
}
