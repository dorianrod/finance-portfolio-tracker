import type { AnchorHTMLAttributes } from 'react'

type ExternalLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'target' | 'rel'
> & {
  variant?: 'source'
  truncate?: boolean
  href: string
}

export function ExternalLink({
  href,
  children,
  className,
  variant,
  truncate = false,
  ...props
}: ExternalLinkProps) {
  const classes = [
    variant === 'source' && 'text-accent hover:underline',
    truncate && 'truncate',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  let safeUrl: URL | null = null
  try {
    const url = new URL(href)
    if (url.protocol === 'https:' || url.protocol === 'http:') safeUrl = url
  } catch {
    // Missing or malformed source URLs remain readable as plain text.
  }
  if (!safeUrl) return <span className={classes}>{children}</span>
  return (
    <a
      {...props}
      href={safeUrl.href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
    >
      {children}
    </a>
  )
}
