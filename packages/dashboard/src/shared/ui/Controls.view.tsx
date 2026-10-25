import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  SVGProps,
} from 'react'

import type { ControlProps } from './controlProps'

export type ButtonProps = ControlProps<
  ButtonHTMLAttributes<HTMLButtonElement>
> & {
  label?: string
  onIntent?: () => void
  ref?: React.Ref<HTMLButtonElement>
}

export function Button({
  label,
  onIntent,
  type = 'button',
  ...props
}: ButtonProps) {
  const nativeProps = props as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button
      {...props}
      type={type}
      aria-label={label ?? nativeProps['aria-label']}
      onFocus={(event) => {
        nativeProps.onFocus?.(event)
        onIntent?.()
      }}
      onMouseEnter={(event) => {
        props.onMouseEnter?.(event)
        onIntent?.()
      }}
    />
  )
}

export function ToggleButton({
  active,
  ...props
}: ButtonProps & { active: boolean }) {
  return <Button {...props} aria-pressed={active} />
}

export function DisclosureButton({
  expanded,
  ...props
}: ButtonProps & { expanded: boolean }) {
  return <Button {...props} aria-expanded={expanded} />
}

export function DialogButton({
  expanded,
  ...props
}: ButtonProps & { expanded: boolean }) {
  return <Button {...props} aria-haspopup="dialog" aria-expanded={expanded} />
}

export function NavigationButton({
  active,
  onIntent,
  label,
  ...props
}: ButtonProps & { active: boolean }) {
  return (
    <button
      {...props}
      type="button"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onFocus={onIntent}
      onMouseEnter={onIntent}
    />
  )
}

export function Input({
  label,
  ...props
}: ControlProps<InputHTMLAttributes<HTMLInputElement>> & { label: string }) {
  return <input {...props} aria-label={label} />
}

export function Select({
  label,
  ...props
}: ControlProps<SelectHTMLAttributes<HTMLSelectElement>> & { label: string }) {
  return <select {...props} aria-label={label} />
}

type ContentProps = ControlProps<HTMLAttributes<HTMLDivElement>>
type InlineProps = ControlProps<HTMLAttributes<HTMLSpanElement>>

export function Group({ label, ...props }: ContentProps & { label: string }) {
  return <div {...props} role="group" aria-label={label} />
}

export function InlineGroup({
  label,
  ...props
}: InlineProps & { label: string }) {
  return <span {...props} role="group" aria-label={label} />
}

export function Navigation({
  label,
  ...props
}: ContentProps & { label: string }) {
  return <nav {...props} aria-label={label} />
}

export function Region({ label, ...props }: ContentProps & { label: string }) {
  return <section {...props} aria-label={label} />
}

export function StatusMessage({
  urgent = false,
  as: Tag = 'p',
  ...props
}: ContentProps & { urgent?: boolean; as?: 'p' | 'div' }) {
  return <Tag {...props} role={urgent ? 'alert' : 'status'} />
}

export function Progress({
  label,
  value,
  ...props
}: ContentProps & { label: string; value: number }) {
  return (
    <div
      {...props}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    />
  )
}

export function Decorative(props: InlineProps) {
  return <span {...props} aria-hidden="true" />
}

export function DecorativeBlock(props: ContentProps) {
  return <div {...props} aria-hidden="true" />
}

export function DecorativeSvg(props: ControlProps<SVGProps<SVGSVGElement>>) {
  return <svg {...props} aria-hidden="true" focusable="false" />
}

export function NamedSymbol({
  label,
  ...props
}: InlineProps & { label: string }) {
  return <span {...props} role="img" aria-label={label} />
}
