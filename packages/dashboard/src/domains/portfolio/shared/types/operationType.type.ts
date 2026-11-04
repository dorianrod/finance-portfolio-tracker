export const ALL_OPERATION_TYPES = [
  'BUY',
  'SELL',
  'DIVIDEND',
  'INTEREST',
  'DEPOSIT',
  'WITHDRAWAL',
] as const
export type OperationType = (typeof ALL_OPERATION_TYPES)[number]
