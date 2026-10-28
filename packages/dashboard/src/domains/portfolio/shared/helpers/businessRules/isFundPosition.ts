import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function isFundPosition(position: PositionRow): boolean {
  return (
    /\b(?:ETF|UCITS|FUND)\b/i.test(position.name) ||
    /^(?:Amundi|BNP Paribas Easy|Global X|iShares|L&G|Xtrackers)\b/i.test(
      position.name,
    )
  )
}
