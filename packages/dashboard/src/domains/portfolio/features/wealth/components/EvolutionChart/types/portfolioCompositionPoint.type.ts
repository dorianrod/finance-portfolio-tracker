import type { computePortfolioComposition } from '@/domains/portfolio/features/wealth/components/EvolutionChart/helpers/transformers/computePortfolioComposition'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

export type PortfolioCompositionPoint = Pick<PortfolioHistoryPoint, 'date'> & {
  composition: ReturnType<typeof computePortfolioComposition>
}
