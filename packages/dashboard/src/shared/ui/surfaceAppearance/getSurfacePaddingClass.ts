import type { SURFACE_VARIANTS } from './surfaceVariants'

export function getSurfacePaddingClass(variant: keyof typeof SURFACE_VARIANTS) {
  return [
    [
      'chart',
      'card',
      'panel',
      'contentCard',
      'smallCard',
      'subduedCard',
      'indicatorCard',
      'inset',
      'insetContent',
      'canvasOutline',
      'raisedInset',
    ].includes(variant) && 'p-4',
    ['empty', 'compactEmpty', 'emptyCaption'].includes(variant) && 'p-6',
    variant === 'formSection' && 'px-4 py-5',
    variant === 'responsiveInset' && 'px-3 py-1.5',
    [
      'microFooter',
      'captionFooter',
      'sectionStart',
      'strongSectionStart',
    ].includes(variant) && 'pt-3',
    ['sectionEnd', 'strongSectionEnd'].includes(variant) && 'pb-3',
    [
      'quietChip',
      'highlightedChip',
      'quietCount',
      'errorCount',
      'warningCount',
      'warningLabel',
    ].includes(variant) && 'px-2 py-1',
  ]
    .filter(Boolean)
    .join(' ')
}
