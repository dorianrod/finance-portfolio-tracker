import { Surface } from '@/shared/ui/Surface.view'

export function EmptyClassificationState({ message }: { message: string }) {
  return (
    <Surface variant="insetContent" tone="subtle" align="center">
      {message}
    </Surface>
  )
}
