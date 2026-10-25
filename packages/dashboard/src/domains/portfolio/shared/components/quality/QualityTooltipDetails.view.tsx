import i18n from '@/i18n/i18n'
import { Decorative } from '@/shared/ui/Controls.view'

import {
  type QualityTooltipRow,
  RELIABILITY_TONES,
} from './helpers/presenters/qualityReliabilityPresentation'

export function InfoIcon() {
  return (
    <Decorative className="flex h-4 w-4 items-center justify-center rounded-full border border-border-strong text-[10px] font-bold leading-none">
      {i18n.t('ui.analysisreliabilitykpi.i')}
    </Decorative>
  )
}

export function QualityTooltipMetricRow({ row }: { row: QualityTooltipRow }) {
  const rowStyles = RELIABILITY_TONES[row.tone]
  return (
    <span className="flex items-center justify-between gap-4 py-1.5">
      <span className="flex min-w-0 items-center gap-2">
        <Decorative
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${rowStyles.dot}`}
        />
        <span className="text-[11px] text-content-secondary">{row.label}</span>
      </span>
      <span className="shrink-0 text-right">
        <span
          className={`block text-xs font-semibold tabular-nums ${rowStyles.value}`}
        >
          {row.value}
        </span>
        {row.secondary && (
          <span className="mt-0.5 block text-[10px] tabular-nums text-content-subtle">
            {row.secondary}
          </span>
        )}
      </span>
    </span>
  )
}
