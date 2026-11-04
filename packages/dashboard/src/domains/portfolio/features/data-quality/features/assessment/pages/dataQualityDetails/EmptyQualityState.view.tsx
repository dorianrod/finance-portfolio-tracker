import { Surface } from '@/shared/ui/Surface.view'

export function EmptyQualityState({ message }: { message: string }) {
  return (
    <Surface variant="insetContent" tone="subtle" align="center">
      {message}
    </Surface>
  )
}
