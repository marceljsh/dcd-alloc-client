import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProjectPlannerSkeleton() {
  return (
    <div className="space-y-6">
      {/* Project Details Card Skeleton */}
      <Card className="mb-6 py-6">
        <CardHeader>
          <CardTitle className="text-lg">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Row 1: Project Name & Team */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <Skeleton className="h-4 w-28" /> {/* Label */}
              <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
            </div>
            <div className="space-y-2 col-span-1">
              <Skeleton className="h-4 w-20" /> {/* Label */}
              <Skeleton className="h-10 w-full rounded-md" /> {/* Select */}
            </div>
          </div>

          {/* Row 2: Budget, Priority, Category */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="space-y-2 md:col-span-4">
              <Skeleton className="h-4 w-24" /> {/* Label */}
              <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
            </div>
            <div className="space-y-2 md:col-span-1">
              <Skeleton className="h-4 w-20" /> {/* Label */}
              <Skeleton className="h-10 w-full rounded-md" /> {/* Select */}
            </div>
            <div className="space-y-2 md:col-span-1">
              <Skeleton className="h-4 w-24" /> {/* Label */}
              <Skeleton className="h-10 w-full rounded-md" /> {/* Select */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Planner Skeleton */}
      <div className="space-y-4">
        {/* Add Activity Button */}
        <Skeleton className="h-10 w-32 rounded-md" />

        {/* Planner Panels */}
        <div className="border rounded-lg overflow-hidden">
          <div className="h-[80vh] grid grid-cols-1 md:grid-cols-3">
            {/* Left Panel Skeleton */}
            <div className="col-span-1 border-r p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-12 w-full rounded-md" />
                  <div className="pl-4 space-y-2">
                    {[...Array(2)].map((_, j) => (
                      <Skeleton key={j} className="h-10 w-full rounded-md" />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Gantt Panel Skeleton */}
            <div className="col-span-2 p-4 space-y-4">
              {/* Timeline Header */}
              <div className="flex space-x-2">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24 rounded-md" />
                ))}
              </div>

              {/* Timeline Bars */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-10 w-full rounded-md" />{" "}
                  {/* Activity Bar */}
                  {[...Array(2)].map((_, j) => (
                    <Skeleton key={j} className="h-8 w-3/4 ml-8 rounded-md" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Skeleton className="w-32 h-8 rounded-md" />
        </div>
      </div>
    </div>
  );
}
