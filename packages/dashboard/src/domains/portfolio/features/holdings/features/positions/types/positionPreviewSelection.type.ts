export type PositionPreviewSelection = {
  kind: 'chart' | 'savings' | 'allocation' | 'underlying'
  positionId: string
  buttonRect: DOMRect
}
