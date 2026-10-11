export default function StatusIcon({
  included = true,
}: {
  included?: boolean
}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={included ? 'M5 12l4 4L19 6' : 'M6 6l12 12M18 6L6 18'} />
    </svg>
  )
}
