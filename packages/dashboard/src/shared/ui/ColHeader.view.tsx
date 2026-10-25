import { useId, useState } from 'react'
import { createPortal } from 'react-dom'

import i18n from '@/i18n/i18n'

// eslint-disable-next-line local/component-role -- This UI service only positions the visual tooltip.
import { useTooltipPosition } from './services/useTooltipPosition'

type Props = {
  label: string
  columnName?: string
  content: string
}

export function ColHeader({ label, columnName = label, content }: Props) {
  const [visible, setVisible] = useState(false)
  const { anchorRef, tooltipRef, position } = useTooltipPosition(visible)
  const tooltipId = useId()

  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <button
        type="button"
        ref={anchorRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={(event) => {
          if (document.activeElement !== event.currentTarget) setVisible(false)
        }}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && visible) {
            event.stopPropagation()
            setVisible(false)
          }
        }}
        aria-label={i18n.t('ui.colheader.moreInformationAbout', {
          column: columnName || i18n.t('ui.colheader.thisColumn'),
        })}
        aria-describedby={visible ? tooltipId : undefined}
        aria-expanded={visible}
        className="grid size-5 cursor-help place-items-center rounded-full text-[10px] leading-none text-content-subtle transition-colors hover:bg-surface-raised hover:text-content-secondary"
      >
        ⓘ
      </button>
      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            style={{ top: position.top, left: position.left }}
            className="pointer-events-none fixed z-[9999] w-72 max-w-[calc(100vw-1rem)] rounded-control border border-border-strong bg-surface-raised p-3 text-xs leading-relaxed text-content-secondary shadow-xl"
          >
            {content}
          </div>,
          document.body,
        )}
    </span>
  )
}
