import { Skeleton } from "@/components/ui/skeleton"

export function AppRouteLoading() {
  return (
    <div className="space-y-6 pt-2">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-40 w-full rounded-3xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  )
}

export function DashboardRouteLoading() {
  return (
    <div className="space-y-6 pt-2">
      <Skeleton className="h-40 w-full rounded-3xl" />
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-9 rounded-full" />
        <Skeleton className="h-9 rounded-full" />
        <Skeleton className="h-9 rounded-full" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  )
}

export function FormRouteLoading() {
  return (
    <div className="space-y-6 pt-2">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  )
}

export function ListRouteLoading() {
  return (
    <div className="space-y-4 pt-2">
      <Skeleton className="h-8 w-36" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProfileRouteLoading() {
  return (
    <div className="flex flex-col items-center pt-8">
      <Skeleton className="size-24 rounded-full" />
      <Skeleton className="mt-4 h-6 w-32" />
      <Skeleton className="mt-2 h-4 w-40" />
      <Skeleton className="mt-6 h-12 w-56 rounded-full" />
    </div>
  )
}
