import * as React from "react"

export function FontSizeIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M4 20h16" />
      <path d="M6 16l6-12 6 12" />
      <path d="M8 12h8" />
      <path d="M12 4v16" />
    </svg>
  )
}

