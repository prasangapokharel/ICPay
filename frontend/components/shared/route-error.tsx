"use client"

import { Button } from "@/components/ui/button"

type RouteErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
}

export function RouteError({
  error,
  reset,
  title = "Something went wrong",
}: RouteErrorProps) {
  return (
    <div className="mx-auto flex min-h-[40vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-lg font-medium text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred. You can try again."}
      </p>
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
