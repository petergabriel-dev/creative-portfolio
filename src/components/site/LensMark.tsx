/** Lens mark: two concentric circles in the current text colour. Decorative. */
export function LensMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeWidth="1.4"
      viewBox="0 0 26 26"
    >
      <circle cx="13" cy="13" r="11.5" />
      <circle cx="13" cy="13" r="5" />
    </svg>
  )
}
