import { DecorativeBlock } from '@/shared/ui/controls/DecorativeBlock.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { TreeConnector } from '@/shared/ui/TreeConnector.view'

export function AllocationCoverageConnectors({
  hasUnmappedGap,
}: {
  hasUnmappedGap: boolean
}) {
  return (
    <>
      <Layout placement="inset" height="connector">
        <DecorativeBlock>
          <Layout flow="block" hiddenUntil="small">
            <TreeConnector position="stem">
              <Surface variant="centeredConnector" />
            </TreeConnector>
            <TreeConnector position="bridge">
              <Surface variant="highlighted" />
            </TreeConnector>
            <TreeConnector position="left">
              <Surface variant="positiveConnector" />
            </TreeConnector>
            <TreeConnector position="center">
              <Surface
                variant={
                  hasUnmappedGap ? 'warningConnector' : 'positiveConnector'
                }
              />
            </TreeConnector>
            <TreeConnector position="right">
              <Surface variant="neutralConnector" />
            </TreeConnector>
          </Layout>
        </DecorativeBlock>
      </Layout>
      <Layout height="icon" width="divider" hideFrom="small">
        <DecorativeBlock variant="highlighted">
          <Layout></Layout>
        </DecorativeBlock>
      </Layout>
    </>
  )
}
