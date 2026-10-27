import type { PieLabelRenderProps, PieSectorShapeProps } from 'recharts'
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { resolveAccountTypeLabelPositions } from '@/domains/portfolio/features/wealth/components/AccountTypeBreakdownChart/helpers/presenters/resolveAccountTypeLabelPositions'
import { AccountTypeTooltip } from '@/domains/portfolio/features/wealth/components/wealthChartTooltips/AccountTypeTooltip.feature'
import type { AccountTypePoint } from '@/domains/portfolio/features/wealth/types/accountTypePoint.type'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import { getAllocationTone } from '@/domains/portfolio/shared/helpers/presenters/getPortfolioSeriesTone/getAllocationTone'
import i18n from '@/i18n/i18n'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartLabel } from '@/shared/ui/chartLabel/ChartLabel.view'
import { ChartLeaderLine } from '@/shared/ui/chartLabel/ChartLeaderLine.view'
import { ChartSector } from '@/shared/ui/ChartSector.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { buildAccountTypePieData } from './helpers/presenters/buildAccountTypePieData'
import { getAccountTypeLeaderLine } from './helpers/presenters/getAccountTypeLeaderLine'
import { getAccountTypeSplitRadius } from './helpers/presenters/getAccountTypeSplitRadius'

export function AccountTypeBreakdownChart({
  data,
}: {
  data: AccountTypePoint[]
}) {
  const pieData = buildAccountTypePieData(data)

  return (
    <div className="flex-1">
      <Surface variant="chart">
        <Text as="h2" variant="label" tone="muted">
          <Inline as="span" align="center">
            {i18n.t('ui.accounttypebreakdownchart.breakdownByAccountType')}
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.accounttypebreakdownchart.eachSliceIsAnAccountTypeTheRadialSplit',
              )}
              scope={{ account: 'filterable', period: 'as-of' }}
            />
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
            <Tooltip content={<AccountTypeTooltip portfolio={data} />} />
          </PieChart>
        </ResponsiveContainer>
      </Surface>
    </div>
  )
}

// eslint-disable-next-line complexity -- Optional Recharts coordinates and row index guard one account label; collision geometry is already delegated.
function AccountTypeLabel({
  data,
  ...props
}: Partial<PieLabelRenderProps> & { data: AccountTypePoint[] }) {
  const formatPercentage = useFormatPercentage()
  const { cx, cy, midAngle, outerRadius, payload, percent, index } = props
  if (
    typeof cx !== 'number' ||
    typeof cy !== 'number' ||
    typeof midAngle !== 'number' ||
    typeof outerRadius !== 'number' ||
    typeof index !== 'number'
  )
    return null
  const point = payload as AccountTypePoint
  const position = resolveAccountTypeLabelPositions(data, cx, cy, outerRadius)[
    index
  ]
  if (position == null) return null

  const leaderLine = getAccountTypeLeaderLine(
    cx,
    cy,
    midAngle,
    outerRadius,
    position,
  )

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
}: PieSectorShapeProps) {
  const point = payload as AccountTypePoint
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
        <ChartSector
          {...sectorBase}
          innerRadius={0}
          outerRadius={radius}
          tone={getAllocationTone(point.account_type)}
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
        <ChartSector
          {...sectorBase}
          innerRadius={0}
          outerRadius={splitRadius}
          tone={getAllocationTone(point.account_type)}
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
