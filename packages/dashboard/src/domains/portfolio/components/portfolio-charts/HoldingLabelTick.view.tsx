interface HoldingLabelTickProps {
  x?: number
  y?: number
  payload?: { value?: string | number }
}

export const HOLDING_LABEL_WIDTH = 260

export function HoldingLabelTick({ x = 0, y = 0, payload }: HoldingLabelTickProps) {
  const label = String(payload?.value ?? '')

  return (
    <foreignObject
      x={x - HOLDING_LABEL_WIDTH}
      y={y - 10}
      width={HOLDING_LABEL_WIDTH - 10}
      height={20}
      style={{ overflow: 'visible' }}
    >
      <div
        className="truncate pr-2 text-right text-[11px] leading-5"
        style={{ color: 'var(--chart-tick)' }}
        title={label}
      >
        {label}
      </div>
    </foreignObject>
  )
}
