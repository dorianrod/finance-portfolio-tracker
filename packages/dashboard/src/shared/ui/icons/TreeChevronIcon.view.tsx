export function TreeChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
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
    </svg>
  )
}
