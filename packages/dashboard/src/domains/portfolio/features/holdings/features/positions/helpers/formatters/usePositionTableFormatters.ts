import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { useMemo } from 'react'

export function usePositionTableFormatters() {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatNumber = useFormatNumber()
  const formatPercentage = useFormatPercentage()
  return useMemo(
    () => ({ formatDate, formatMoney, formatNumber, formatPercentage }),
    [formatDate, formatMoney, formatNumber, formatPercentage],
  )
}
