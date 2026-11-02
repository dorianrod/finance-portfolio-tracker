import type { ReactNode } from 'react'
import type { PieLabelRenderProps, PieSectorShapeProps } from 'recharts'
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { AccountTypeTooltip } from '@/domains/portfolio/features/wealth/components/AccountTypeBreakdownChart/AccountTypeTooltip.view'
import type { AccountTypePoint } from '@/domains/portfolio/features/wealth/types/accountTypePoint.type'
import { AllocationCategory } from '@/domains/portfolio/shared/components/AllocationCategory/AllocationCategory.view'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartLabel } from '@/shared/ui/chartLabel/ChartLabel.view'
import { ChartLeaderLine } from '@/shared/ui/chartLabel/ChartLeaderLine.view'
import { ChartSector } from '@/shared/ui/ChartSector.view'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { buildAccountTypePieData } from './helpers/presenters/buildAccountTypePieData'
import { getAccountTypeSplitRadius } from './helpers/presenters/getAccountTypeSplitRadius'
import { resolveAccountTypeLabel } from './helpers/presenters/resolveAccountTypeLabel'

export function AccountTypeBreakdownChartView({
  data,
  portfolioTotal,
  children,
}: {
  data: AccountTypePoint[]
  portfolioTotal: number
  children: ReactNode
}) {
  const pieData = buildAccountTypePieData(data)

  return (
    <div className="flex-1">
      <Surface variant="chart">
        <Text as="h2" variant="label" tone="muted">
          <Inline as="span" align="center">
            {i18n.t('ui.accounttypebreakdownchart.breakdownByAccountType')}
            {children}
          </Inline>
        </Text>
        <Layout spaceBefore="compact">
          <Text as="p" variant="caption" tone="subtle">
            {i18n.t(
              'ui.accounttypebreakdownchart.eachSliceIsAnAccountTypeRadialSplitCost',
            )}
          </Text>
        </Layout>

        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="total_value"
              nameKey="account_type"
              innerRadius={0}
              outerRadius="63%"
              paddingAngle={0.25}
              startAngle={90}
              endAngle={-270}
              shape={AccountTypeSector}
              label={<AccountTypeLabel data={data} />}
              labelLine={false}
            />
            <Tooltip
              content={<AccountTypeTooltip portfolioTotal={portfolioTotal} />}
            />
          </PieChart>
        </ResponsiveContainer>
      </Surface>
    </div>
  )
}

function AccountTypeLabel({
  data,
  ...props
}: Partial<ChartShapeProps<PieLabelRenderProps, AccountTypePoint>> & {
  data: AccountTypePoint[]
}) {
  const formatPercentage = useFormatPercentage()
  const label = resolveAccountTypeLabel(data, props)
  if (!label) return null
  const { point, position, leaderLine } = label
  const { percent } = props

  return (
    <g>
      <ChartLeaderLine points={leaderLine} />
      <ChartLabel
        x={position.x}
        y={position.y}
        align={position.isRight ? 'start' : 'end'}
      >
        {point.account_type} ·{' '}
        {formatPercentage((percent ?? 0) * 100, { decimals: 0 })}
      </ChartLabel>
    </g>
  )
}

function AccountTypeSector({
  cx,
  cy,
  startAngle,
  endAngle,
  outerRadius,
  payload,
}: ChartShapeProps<PieSectorShapeProps, AccountTypePoint>) {
  if (!payload) return null
  const point = payload
  const radius = outerRadius ?? 0
  const splitRadius = getAccountTypeSplitRadius(point, radius)
  const sectorBase = {
    cx,
    cy,
    startAngle,
    endAngle,
  }

  if (point.unrealized_gain < 0) {
    return (
      <g>
        <AllocationCategory.Sector
          {...sectorBase}
          innerRadius={0}
          outerRadius={radius}
          category={point.account_type}
          variant="splitBase"
        />
        <ChartSector
          {...sectorBase}
          innerRadius={splitRadius}
          outerRadius={radius}
          tone={PORTFOLIO_CHART_TONES.performanceNegative}
          variant="splitOverlay"
        />
      </g>
    )
  }

  return (
    <g>
      {splitRadius > 0 && (
        <AllocationCategory.Sector
          {...sectorBase}
          innerRadius={0}
          outerRadius={splitRadius}
          category={point.account_type}
          variant="splitBase"
        />
      )}
      {point.unrealized_gain > 0 && (
        <ChartSector
          {...sectorBase}
          innerRadius={splitRadius}
          outerRadius={radius}
          tone={PORTFOLIO_CHART_TONES.performancePositive}
          variant="splitOverlay"
        />
      )}
    </g>
  )
}
