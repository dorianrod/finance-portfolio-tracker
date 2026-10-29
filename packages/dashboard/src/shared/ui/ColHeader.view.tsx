import i18n from '@/i18n/i18n'

import { Decorative } from './controls/Decorative.view'
import { Tooltip } from './Tooltip.view'

export function ColHeader({ label, columnName = label, content }: Props) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <Tooltip>
        <Tooltip.Trigger
          label={i18n.t('ui.colheader.moreInformationAbout', {
            column: columnName || i18n.t('ui.colheader.thisColumn'),
          })}
          variant="columnHelp"
        >
          <Decorative>ⓘ</Decorative>
        </Tooltip.Trigger>
        <Tooltip.Content variant="info">
          <div className="w-72">{content}</div>
        </Tooltip.Content>
      </Tooltip>
    </span>
  )
}

type Props = { label: string; columnName?: string; content: string }
