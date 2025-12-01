import * as React from "react"

export const ChevronRightIcon = React.memo(
  ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
    return (
      <svg
        width="16"
        height="16"
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    )
  }
)

ChevronRightIcon.displayName = "ChevronRightIcon"

