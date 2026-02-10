import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container py-8 max-w-7xl mx-auto space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div className="space-y-3 w-full md:w-1/2">
          <Skeleton className="h-10 w-48 md:w-64" />
          <Skeleton className="h-5 w-full md:w-96" />
        </div>
        <Skeleton className="h-10 w-full md:w-40 rounded-full" />
      </div>

      {/* Grid of Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col space-y-4 rounded-xl border p-4 shadow-sm bg-card/50"
          >
            {/* Image placeholder */}
            <Skeleton className="h-48 w-full rounded-lg" />

            <div className="space-y-2 flex-1 pt-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            <div className="flex items-center justify-between pt-4">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
