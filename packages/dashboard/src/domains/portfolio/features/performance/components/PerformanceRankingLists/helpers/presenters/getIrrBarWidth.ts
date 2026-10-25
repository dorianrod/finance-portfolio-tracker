export function getIrrBarWidth(irr: number, strongestIrr: number): string {
  return `${strongestIrr > 0 ? (Math.abs(irr) / strongestIrr) * 100 : 0}%`
}
