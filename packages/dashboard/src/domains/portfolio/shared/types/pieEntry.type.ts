export type PieEntry = {
  name: string
  value: number
  total: number
  subItems?: Array<{ name: string; value: number }>
}
