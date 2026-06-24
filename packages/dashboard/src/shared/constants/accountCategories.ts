// Fixed, code-controlled account categories (see account_groups.csv
// "category" column / src/ports/account_groups.py on the pipeline side).
// Display order used for sorting and as a fallback when assigning colors
// to literal account "type" values that don't have a dedicated color.
export const CATEGORY_ORDER: Record<string, number> = {
  brokerage: 0,
  private_equity: 1,
  employer_savings: 2,
  retirement: 3,
  savings: 4,
  checking: 5,
}

// Suffix appended to a brokerage account's real "type" label to build the
// synthetic pseudo-type for its uninvested cash position.
export const CASH_SUFFIX = ' – Cash'
