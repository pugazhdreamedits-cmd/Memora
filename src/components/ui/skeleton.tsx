import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton rounded-md bg-bg-elevated/40", className)}
      role="status"
      aria-live="polite"
      {...props}
    />
  )
}

export { Skeleton }
