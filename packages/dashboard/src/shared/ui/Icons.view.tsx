import { DecorativeSvg } from './Controls.view'

export function GridIcon() {
  return (
    <DecorativeSvg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <rect x="1" y="1" width="6" height="6" rx="1" opacity=".7" />
      <rect x="9" y="1" width="6" height="6" rx="1" opacity=".7" />
      <rect x="1" y="9" width="6" height="6" rx="1" opacity=".7" />
      <rect x="9" y="9" width="6" height="6" rx="1" opacity=".7" />
    </DecorativeSvg>
  )
}

export function DisclosureChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <DecorativeSvg
      className={`h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </DecorativeSvg>
  )
}

export function NextIcon() {
  return (
    <DecorativeSvg
      className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M7.22 14.78a.75.75 0 0 1 0-1.06L10.94 10 7.22 6.28a.75.75 0 0 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z"
        clipRule="evenodd"
      />
    </DecorativeSvg>
  )
}

export function TreeChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <DecorativeSvg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-content-subtle"
    >
      <path d={expanded ? 'M5 8l5 5 5-5' : 'M8 5l5 5-5 5'} />
    </DecorativeSvg>
  )
}

export function HierarchyIcon() {
  return (
    <DecorativeSvg
      viewBox="0 0 20 20"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="7" y="2.25" width="6" height="4" rx="1" />
      <path
        d="M10 6.25v3.25M4.5 9.5h11M4.5 9.5v2.25M10 9.5v2.25M15.5 9.5v2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="2.25" y="11.75" width="4.5" height="4" rx="1" />
      <rect x="7.75" y="11.75" width="4.5" height="4" rx="1" />
      <rect x="13.25" y="11.75" width="4.5" height="4" rx="1" />
    </DecorativeSvg>
  )
}

export function AllocationIcon() {
  return (
    <DecorativeSvg viewBox="0 0 20 20" className="size-5">
      <circle
        cx="10"
        cy="10"
        r="7.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M10 2.25A7.75 7.75 0 0 1 17.75 10H10Z" fill="currentColor" />
      <path
        d="M10 10 4.52 15.48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </DecorativeSvg>
  )
}

export function PeriodFilterIcon() {
  return (
    <DecorativeSvg
      viewBox="0 0 20 20"
      fill="none"
      className="h-3.5 w-3.5 shrink-0 text-content-subtle transition-colors group-hover:text-content-muted"
    >
      <path
        d="M4 5h12M6.5 10h7M8.5 15h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </DecorativeSvg>
  )
}
