import type { ComponentProps } from 'react'

import { ChartSector } from '@/shared/ui/ChartSector.view'
import { ChartText } from '@/shared/ui/ChartText.view'
import { SeriesArea } from '@/shared/ui/SeriesArea.view'
import { SeriesGradient } from '@/shared/ui/SeriesGradient.view'
import { SeriesSwatch } from '@/shared/ui/swatch/SeriesSwatch.view'
import type { TextTag } from '@/shared/ui/Text.view'

import { getAllocationTone } from './helpers/presenters/getAllocationTone'

export function AllocationCategory<T extends TextTag = 'span'>({
  category,
  aggregate = false,
  children,
  ...props
}: Omit<ComponentProps<typeof ChartText<T>>, 'tone' | 'series'> & CategoryProps) {
  return (
    <ChartText {...props} tone={aggregate ? 'dim' : getAllocationTone(category)}>
      {children}
    </ChartText>
  )
}

type CategoryProps = { category: string; aggregate?: boolean }

function CategorySwatch({
  category,
  aggregate = false,
  ...props
}: Omit<ComponentProps<typeof SeriesSwatch>, 'tone'> & CategoryProps) {
  return <SeriesSwatch {...props} tone={aggregate ? 'dim' : getAllocationTone(category)} />
}

function CategorySector({
  category,
  aggregate = false,
  ...props
}: Omit<ComponentProps<typeof ChartSector>, 'tone'> & CategoryProps) {
  return <ChartSector {...props} tone={aggregate ? 'dim' : getAllocationTone(category)} />
}

function CategoryGradient({
  category,
  aggregate = false,
  ...props
}: Omit<ComponentProps<typeof SeriesGradient>, 'tone'> & CategoryProps) {
  return <SeriesGradient {...props} tone={aggregate ? 'dim' : getAllocationTone(category)} />
}

function CategoryArea<TData = unknown>({
  category,
  aggregate = false,
  children,
  ...props
}: Omit<ComponentProps<typeof SeriesArea<TData>>, 'tone'> & CategoryProps) {
  return (
    <SeriesArea {...props} tone={aggregate ? 'dim' : getAllocationTone(category)}>
      {children}
    </SeriesArea>
  )
}

AllocationCategory.Swatch = CategorySwatch
AllocationCategory.Sector = CategorySector
AllocationCategory.Gradient = CategoryGradient
AllocationCategory.Area = CategoryArea
