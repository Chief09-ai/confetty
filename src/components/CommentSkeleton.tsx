import { Skeleton } from "@/components/ui/skeleton";

export function CommentSkeleton() {
  return (
    <div className="mb-4">
      <div className="bg-card rounded-lg p-3 md:p-4">
        <div className="flex items-start gap-2 md:gap-3">
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5 mb-3" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
