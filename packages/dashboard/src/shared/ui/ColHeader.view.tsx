import i18n from '@/i18n/i18n'

import { Tooltip } from './Tooltip.view'

type Props = { label: string; columnName?: string; content: string }

export function ColHeader({ label, columnName = label, content }: Props) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <Tooltip>
        <Tooltip.Trigger
          label={i18n.t('ui.colheader.moreInformationAbout', {
            column: columnName || i18n.t('ui.colheader.thisColumn'),
          })}
          className="grid size-5 cursor-help place-items-center rounded-full text-[10px] leading-none text-content-subtle transition-colors hover:bg-surface-raised hover:text-content-secondary"
        >
          ⓘ
        </Tooltip.Trigger>
        <Tooltip.Content className="w-72 leading-relaxed">
          {content}
        </Tooltip.Content>
      </Tooltip>
    </span>
  )
}
