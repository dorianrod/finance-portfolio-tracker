import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function isFundPosition(position: Pick<PositionRow, 'name'>): boolean {
  return (
    FUND_NAME_PATTERN.test(position.name) ||
    FUND_PROVIDER_PATTERN.test(position.name.trim())
  )
}

// Match the fund and wrapper vocabulary used by the pipeline's composition fetcher.
const FUND_NAME_PATTERN =
  /\b(?:ETF|UCITS|FUND|FCP|FCPE|SICAV|OPCVM|PEE|PEI|PERCO|PRIVATE EQUITY|ASSURANCE VIE|LIFE INSURANCE|SCPI|OPCI|FONDS)\b/i
const FUND_PROVIDER_PATTERN =
  /^(?:Amundi|BNP Paribas Easy|Global X|iShares|L&G|Xtrackers|DWS|SPDR|Vanguard|Invesco|UBS|HSBC|Legal & General)\b/i
