import { type QualityTheme } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/mappers/buildDataQualityViewModel'

export function QualityThemeOption({ theme }: { theme: QualityTheme }) {
  return (
    <option value={theme.id}>
      {theme.label} · {theme.metric} {theme.metricLabel}
    </option>
  )
}
