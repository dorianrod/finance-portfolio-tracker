// ─── Allocation dimension colors (geo / sector / currency / asset class names) ──

const ALLOCATION_PALETTE = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6',
  '#a855f7', '#f43f5e',
]
const NC_COLOR = '#374151'
const AUTRE_COLOR = '#6b7280'

const ALLOCATION_CATEGORY_COLORS: Record<string, string> = {
  'actions': '#3b82f6', 'taux': '#10b981', 'cash / monétaire': '#f59e0b',
  'immobilier': '#f97316', 'private equity': '#8b5cf6', 'commodities': '#84cc16',
  'crypto': '#06b6d4',
  'france': '#3b82f6', 'europe': '#06b6d4', 'amérique du nord': '#ef4444',
  'japon': '#f59e0b', 'chine': '#e879f9', 'asie': '#8b5cf6',
  'océanie': '#14b8a6', 'emergent': '#84cc16',
  'eur': '#06b6d4', 'usd': '#ef4444',
  'tech': '#3b82f6', 'finance': '#f59e0b', 'santé': '#10b981',
  'conso cyclique': '#f97316', 'conso défensive': '#84cc16', 'industrie': '#06b6d4',
  'energie': '#ef4444', 'service': '#a855f7', 'telecom': '#ec4899',
  'services publics': '#f43f5e',
}

function hashColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  return ALLOCATION_PALETTE[Math.abs(h) % ALLOCATION_PALETTE.length]
}

export function catColor(name: string): string {
  if (name === 'nc') return NC_COLOR
  if (name === 'autre' || name === 'Autre' || name.startsWith('others (')) return AUTRE_COLOR
  return ALLOCATION_CATEGORY_COLORS[name] ?? hashColor(name)
}

// ─── Account-type colors (keyed by the fixed account "category") ────────────────

const ACCOUNT_CATEGORY_COLORS: Record<string, string> = {
  brokerage:        '#3b82f6',
  private_equity:   '#8b5cf6',
  employer_savings: '#10b981',
  retirement:       '#f59e0b',
  savings:          '#06b6d4',
  checking:         '#6b7280',
}
const ACCOUNT_TYPE_FALLBACK_COLORS = ['#ec4899', '#14b8a6', '#a855f7', '#f43f5e']

export function typeColor(t: string, i: number, typeCategories: Record<string, string>): string {
  return ACCOUNT_CATEGORY_COLORS[typeCategories[t] ?? ''] ?? ACCOUNT_TYPE_FALLBACK_COLORS[i % ACCOUNT_TYPE_FALLBACK_COLORS.length]
}
