import { HOLDING_LABEL_WIDTH } from '../../holdingLabelWidth'

export function getHoldingLabelGeometry(x: number, y: number) {
  return {
    x: x - HOLDING_LABEL_WIDTH,
    y: y - 10,
    width: HOLDING_LABEL_WIDTH - 10,
    height: 20,
  }
}
