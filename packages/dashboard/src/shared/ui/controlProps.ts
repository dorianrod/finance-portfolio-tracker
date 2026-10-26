import type { AriaAttributes } from 'react'

/** Behavior and ARIA wiring belong to UI primitives, never their callers. */
export type ControlProps<Props> = Omit<
  Props,
  | 'className'
  | keyof AriaAttributes
  | 'role'
  | 'tabIndex'
  | 'autoFocus'
  | 'onKeyDown'
  | 'onKeyDownCapture'
  | 'onKeyUp'
  | 'onKeyUpCapture'
  | 'onKeyPress'
  | 'onKeyPressCapture'
  | 'onFocus'
  | 'onFocusCapture'
  | 'onBlur'
  | 'onBlurCapture'
  | 'onOpenAutoFocus'
  | 'onCloseAutoFocus'
  | 'onEscapeKeyDown'
  | 'onFocusOutside'
  | 'onInteractOutside'
  | 'onPointerDownOutside'
>
