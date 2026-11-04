export const LAYOUT_PRESETS = {
  labelTwoValues: 'grid-cols-[minmax(0,1fr)_4rem_6rem]',
  labelThreeValues: 'grid-cols-[minmax(0,1fr)_140px_90px_minmax(0,220px)]',
  sidebar: 'grid-cols-1 md:grid-cols-[14rem_minmax(0,1fr)]',
  comparison: 'grid-cols-2',
  pairSmall: 'grid-cols-1 sm:grid-cols-2',
  pairLarge: 'grid-cols-1 lg:grid-cols-2',
  pairExtraLarge: 'grid-cols-1 xl:grid-cols-2',
  weightedPairExtraLarge:
    'grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]',
  charts: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  thirdsSmall: 'grid-cols-1 sm:grid-cols-3',
  thirdsMedium: 'grid-cols-1 md:grid-cols-3',
  quartersMedium: 'grid-cols-1 md:grid-cols-4',
} as const
