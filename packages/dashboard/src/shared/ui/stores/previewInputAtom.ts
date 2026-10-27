import { atom } from 'jotai'

import type { PreviewState } from '@/shared/ui/usePreviewState'

const DEFAULT_PREVIEW_INPUT = null

export const previewInputAtom = atom<PreviewState | null>(DEFAULT_PREVIEW_INPUT)
