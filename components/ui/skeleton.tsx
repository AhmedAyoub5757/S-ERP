import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("ui-skeleton animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
