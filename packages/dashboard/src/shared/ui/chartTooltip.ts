export interface NumericTooltipPayload<TPayload> {
  color?: string
  dataKey?: string | number
  name?: string | number
  payload?: TPayload
  value?: number
}

export interface NumericTooltipProps<TPayload> {
  active?: boolean
  label?: string | number
  payload?: ReadonlyArray<NumericTooltipPayload<TPayload>>
}

export function tooltipValue<TPayload>(
  payload: ReadonlyArray<NumericTooltipPayload<TPayload>>,
  dataKey: string,
): number {
  return payload.find((item) => item.dataKey === dataKey)?.value ?? 0
}
