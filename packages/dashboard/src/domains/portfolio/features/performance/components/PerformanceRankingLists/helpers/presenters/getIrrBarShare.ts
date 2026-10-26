export function getIrrBarShare(irr: number, strongestIrr: number): number {
  return strongestIrr > 0 ? (Math.abs(irr) / strongestIrr) * 100 : 0
}
