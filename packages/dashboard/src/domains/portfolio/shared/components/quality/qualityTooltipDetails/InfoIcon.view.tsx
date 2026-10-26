import i18n from '@/i18n/i18n'
import { Decorative } from '@/shared/ui/controls/Decorative.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'

export function InfoIcon() {
  return (
    <Layout as="span" flow="inline" height="icon" width="icon">
      <Decorative variant="infoSymbol">
        <Inline as="span" align="center" justify="center">
          {i18n.t('ui.analysisreliabilitykpi.i')}
        </Inline>
      </Decorative>
    </Layout>
  )
}
