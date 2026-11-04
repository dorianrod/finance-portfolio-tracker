import type { ComponentProps } from 'react'
import { ResponsiveContainer } from 'recharts'

import { useChartViewport } from './services/useChartViewport'

/*
 * @architecture-decision chart-viewport-mounting
 * @rules ui-vercel-offscreen-content, ui-vercel-responsive-rendering
 * @choice Mount a chart on its first viewport intersection, retaining it thereafter and reserving its configured height throughout.
 * @reason Wealth mounts seven Recharts surfaces on entry; offscreen chart construction dominates navigation rather than layout alone.
 * @alternative CSS content visibility does not avoid React construction; unmounting on every scroll loses chart state and repeats that work.
 * @revisit Charts require immediate offscreen interaction or the chart library gains native visibility scheduling.
 */
export function ChartViewport({
  height,
  label,
  children,
  onResize,
}: ChartViewportProps) {
  const { ref, ready, reveal } = useChartViewport()
  return (
    <div
      ref={ref}
      className="w-full min-w-0"
      style={{ height }}
      role="group"
      aria-label={label}
      tabIndex={ready ? undefined : 0}
      onFocus={reveal}
    >
      {ready && (
        <ResponsiveContainer width="100%" height={height} onResize={onResize}>
          {children}
        </ResponsiveContainer>
      )}
    </div>
  )
}

type ChartViewportProps = Pick<
  ComponentProps<typeof ResponsiveContainer>,
  'children' | 'onResize'
> & {
  height: number
  label: string
}
