import type { AnchorHTMLAttributes } from 'react'

type ExternalLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'target' | 'rel'
> & {
  href: string
}

export function ExternalLink({
  href,
  children,
  className,
  ...props
}: ExternalLinkProps) {
  let safeUrl: URL | null = null
  try {
    const url = new URL(href)
    if (url.protocol === 'https:' || url.protocol === 'http:') safeUrl = url
  } catch {
    // Missing or malformed source URLs remain readable as plain text.
  }
  if (!safeUrl) return <span className={className}>{children}</span>
  return (
    <a
      {...props}
      href={safeUrl.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  )
}
