export const portfolioQueryKeys = {
  all: ['portfolio'] as const,
  data: (resource: string, ...scope: ReadonlyArray<unknown>) => (
    ['portfolio', 'data', resource, ...scope] as const
  ),
}
