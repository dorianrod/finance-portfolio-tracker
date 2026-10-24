import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export function IncomeSavingsTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: AnnualIncomeSavingsPoint }>
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  const suffix =
    point.incomeStatus === 'forecast'
      ? i18n.t('ui.annualincomesavingschart.forecast')
      : ''
  const savingsSuffix =
    point.savingsStatus === 'partial'
      ? i18n.t('ui.annualincomesavingschart.ytdThrough', {
          date: point.savingsThrough,
        })
      : ''
  return (
    <TooltipBox minWidth={235}>
      <div
        style={{
          color: 'var(--tooltip-text)',
          fontWeight: 600,
          marginBottom: 7,
        }}
      >
        {point.year}
        {suffix}
      </div>
      <div style={{ color: SEMANTIC_COLORS.costBasisText }}>
        {i18n.t('ui.annualincomesavingschart.netSalary')}{' '}
        {formatMoney(point.netSalary, { style: 'full' })}
      </div>
      <div style={{ color: SEMANTIC_COLORS.passiveIncomeSecondary }}>
        {i18n.t('ui.annualincomesavingschart.otherIncome')}{' '}
        {formatMoney(point.otherIncome, { style: 'full' })}
      </div>
      <div style={{ color: 'var(--tooltip-label)', marginTop: 4 }}>
        {i18n.t('ui.annualincomesavingschart.totalNetIncome')}{' '}
        {formatMoney(point.totalIncome, { style: 'full' })}
      </div>
      <div
        style={{ color: SEMANTIC_COLORS.netContributionsText, marginTop: 7 }}
      >
        {i18n.t('ui.annualincomesavingschart.netContributions')}{' '}
        {point.placedSavings == null
          ? '—'
          : formatMoney(point.placedSavings, { style: 'full' })}
        {savingsSuffix}
      </div>
      <div style={{ color: SEMANTIC_COLORS.returnRate, marginTop: 4 }}>
        {i18n.t('ui.annualincomesavingschart.placementRate')}{' '}
        {point.placementRate == null
          ? i18n.t('ui.annualincomesavingschart.notComparable')
          : formatPercentage(point.placementRate)}
      </div>
      <div
        style={{
          color: 'var(--tooltip-dim)',
          marginTop: 7,
          borderTop: '1px solid var(--tooltip-border)',
          paddingTop: 7,
        }}
      >
        {i18n.t('ui.annualincomesavingschart.unplacedIncomeProxy')}{' '}
        {point.unplacedIncomeProxy == null
          ? '—'
          : formatMoney(point.unplacedIncomeProxy, { style: 'full' })}
      </div>
    </TooltipBox>
  )
}
