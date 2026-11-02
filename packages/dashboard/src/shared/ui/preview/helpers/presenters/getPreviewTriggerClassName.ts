import { getButtonClassName } from '@/shared/ui/buttonAppearance/getButtonClassName'
import type { ButtonProps } from '@/shared/ui/controls/controls.types'
import { BUTTON_SIZES } from '@/shared/ui/layoutAppearance/buttonSizes'
import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'
import { TEXT_TONES } from '@/shared/ui/textAppearance/textTones'

export function getPreviewTriggerClassName({
  variant = 'plain',
  selected = false,
  size = 'compact',
  dimmed,
  tone,
}: Pick<ButtonProps, 'variant' | 'selected' | 'size' | 'dimmed'> & {
  tone?: TextTone
}) {
  return [
    getButtonClassName(variant, selected),
    BUTTON_SIZES[size],
    'gap-2',
    dimmed && 'opacity-[0.35]',
    previewToneClasses(tone, selected),
  ]
    .filter(Boolean)
    .join(' ')
}

function previewToneClasses(tone: TextTone | undefined, selected: boolean) {
  if (!tone) return undefined
  return [
    TEXT_TONES[tone],
    'rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1',
    PREVIEW_TONES[tone],
    selected && 'bg-surface-raised ring-1 ring-current/40',
  ]
    .filter(Boolean)
    .join(' ')
}

const PREVIEW_TONES: Partial<Record<TextTone, string>> = {
  positive:
    'hover:bg-positive-muted/60 hover:text-positive focus-visible:ring-positive',
  warning:
    'hover:bg-warning-muted/60 hover:text-warning focus-visible:ring-warning',
  negative:
    'hover:bg-danger-muted/60 hover:text-danger focus-visible:ring-danger',
}
