// Recharts keeps the source datum on each animated shape, even after chart data changes.
export type ChartShapeProps<TShape, TPayload> = Omit<TShape, 'payload'> & {
  payload?: TPayload
}
