import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'

export function getIrrKpiNote(status: IrrStatus): string | undefined {
  if (status === 'error')
    return i18n.t('ui.getirrkpinoteTs.filteredIrrUnavailable')
  return undefined
}
