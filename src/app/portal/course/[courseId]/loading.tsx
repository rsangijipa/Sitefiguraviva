import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Cover Image Skeleton */}
        <div className="w-full md:w-1/3 aspect-video rounded-xl overflow-hidden border bg-muted/10 relative">
          <Skeleton className="absolute inset-0 w-full h-full" />
        </div>

        {/* Info Skeleton */}
        <div className="flex-1 space-y-6 w-full">
          <div className="space-y-4">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-10 w-3/4 md:w-1/2" />
            <Skeleton className="h-6 w-full md:w-2/3" />
          </div>

          <div className="flex gap-4 pt-4">
            <Skeleton className="h-12 w-40 rounded-full" />
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </div>
      </div>

      {/* Content Tabs Skeleton */}
      <div className="space-y-6 pt-8">
        <div className="flex gap-4 border-b">
          <Skeleton className="h-10 w-32 rounded-t-lg" />
          <Skeleton className="h-10 w-32 rounded-t-lg" />
        </div>

        {/* Module List Skeleton */}
        <div className="space-y-4 max-w-3xl">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
              {/* Lessons */}
              <div className="pl-12 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
