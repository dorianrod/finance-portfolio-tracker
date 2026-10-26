import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  SVGProps,
} from 'react'

import {
  BUTTON_VARIANTS,
  getButtonClassName,
  NAVIGATION_STATES,
} from './buttonAppearance'
import type { ControlProps } from './controlProps'
import { FIELD_VARIANTS } from './fieldAppearance'
import { BUTTON_SIZES } from './layoutAppearance'
import { STATUS_VARIANTS } from './statusAppearance'
import { SURFACE_VARIANTS } from './surfaceAppearance'
import {
  TEXT_ALIGNMENTS,
  TEXT_TONES,
  TEXT_VARIANTS,
  type TextTone,
} from './textAppearance'

export function Button({
  label,
  onIntent,
  type = 'button',
  variant = 'plain',
  selected = false,
  dimmed = false,
  size = 'default',
  ...props
}: ButtonProps) {
  const nativeProps = props as Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'className'
  >
  return (
    <button
      {...props}
      type={type}
      className={[
        getButtonClassName(variant, selected),
        BUTTON_SIZES[size],
        'gap-2',
        dimmed && 'opacity-[0.35]',
      ]
        .filter(Boolean)
        .join(' ')}
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
  return <Button {...props} selected={active} aria-pressed={active} />
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
  variant = 'plain',
  selected = false,
  size = 'default',
  ...props
}: ButtonProps & { active: boolean }) {
  const stateClass =
    variant === 'tab' || variant === 'separatedTab'
      ? NAVIGATION_STATES[variant][active ? 'active' : 'inactive']
      : undefined
  return (
    <button
      {...props}
      type="button"
      className={
        [
          getButtonClassName(variant, selected),
          BUTTON_SIZES[size],
          'gap-2',
          stateClass,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onFocus={onIntent}
      onMouseEnter={onIntent}
    />
  )
}

export function Input({
  label,
  variant = 'plain',
  ...props
}: ControlProps<InputHTMLAttributes<HTMLInputElement>> & {
  label: string
  variant?: keyof typeof FIELD_VARIANTS
}) {
  return (
    <input
      {...props}
      aria-label={label}
      className={
        [FIELD_VARIANTS[variant]].filter(Boolean).join(' ') || undefined
      }
    />
  )
}

export function Select({
  label,
  variant = 'plain',
  ...props
}: ControlProps<SelectHTMLAttributes<HTMLSelectElement>> & {
  label: string
  variant?: keyof typeof FIELD_VARIANTS
}) {
  return (
    <select
      {...props}
      aria-label={label}
      className={
        [FIELD_VARIANTS[variant]].filter(Boolean).join(' ') || undefined
      }
    />
  )
}

export function Group({
  label,
  variant,
  ...props
}: ContentProps & { label: string; variant?: keyof typeof SURFACE_VARIANTS }) {
  return (
    <div
      {...props}
      className={['size-full', variant && SURFACE_VARIANTS[variant]]
        .filter(Boolean)
        .join(' ')}
      role="group"
      aria-label={label}
    />
  )
}

export function InlineGroup({
  label,
  ...props
}: InlineProps & { label: string }) {
  return <span {...props} role="group" aria-label={label} />
}

export function Navigation({
  label,
  variant = 'plain',
  ...props
}: ContentProps & { label: string; variant?: 'plain' | 'tabs' }) {
  return (
    <nav
      {...props}
      aria-label={label}
      className={
        [variant === 'tabs' && 'border-b border-border']
          .filter(Boolean)
          .join(' ') || undefined
      }
    />
  )
}

export function Region({ label, ...props }: ContentProps & { label: string }) {
  return <section {...props} aria-label={label} />
}

export function StatusMessage({
  urgent = false,
  as: Tag = 'p',
  variant = 'plain',
  tone,
  align,
  ...props
}: ContentProps & {
  urgent?: boolean
  as?: 'p' | 'div'
  variant?: keyof typeof STATUS_VARIANTS
  tone?: TextTone
  align?: keyof typeof TEXT_ALIGNMENTS
}) {
  return (
    <Tag
      {...props}
      role={urgent ? 'alert' : 'status'}
      className={
        [
          STATUS_VARIANTS[variant],
          tone && TEXT_TONES[tone],
          align && TEXT_ALIGNMENTS[align],
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
    />
  )
}

export function Progress({
  label,
  value,
  variant,
  ...props
}: ContentProps & { label: string; value: number; variant?: 'track' }) {
  return (
    <div
      {...props}
      className={[
        'size-full',
        variant === 'track' && 'rounded-full bg-surface-raised',
      ]
        .filter(Boolean)
        .join(' ')}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    />
  )
}

export function Decorative({
  tone,
  variant,
  ...props
}: InlineProps & { tone?: TextTone; variant?: keyof typeof TEXT_VARIANTS }) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={
        [tone && TEXT_TONES[tone], variant && TEXT_VARIANTS[variant]]
          .filter(Boolean)
          .join(' ') || undefined
      }
    />
  )
}

export function DecorativeBlock({
  variant,
  ...props
}: ContentProps & { variant?: keyof typeof SURFACE_VARIANTS }) {
  return (
    <div
      {...props}
      className={['size-full', variant && SURFACE_VARIANTS[variant]]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    />
  )
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

export type ButtonProps = ControlProps<
  ButtonHTMLAttributes<HTMLButtonElement>
> & {
  label?: string
  onIntent?: () => void
  ref?: React.Ref<HTMLButtonElement>
  variant?: keyof typeof BUTTON_VARIANTS
  selected?: boolean
  dimmed?: boolean
  size?: keyof typeof BUTTON_SIZES
}

type ContentProps = ControlProps<HTMLAttributes<HTMLDivElement>>
type InlineProps = ControlProps<HTMLAttributes<HTMLSpanElement>>
