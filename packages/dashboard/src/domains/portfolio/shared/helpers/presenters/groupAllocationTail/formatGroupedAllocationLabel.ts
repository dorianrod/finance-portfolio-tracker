import i18n from '@/i18n/i18n'

export function formatGroupedAllocationLabel(count: number): string {
  return i18n.t('ui.groupallocationtail.othersCount', { count })
}
