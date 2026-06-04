import { cn } from "@/lib/utils";

interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SkeletonLoader({ className, ...props }: SkeletonLoaderProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50 overflow-hidden relative",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-5 rounded-xl space-y-4">
      <SkeletonLoader className="h-40 w-full rounded-lg" />
      <div className="space-y-2">
        <SkeletonLoader className="h-6 w-2/3" />
        <SkeletonLoader className="h-4 w-full" />
        <SkeletonLoader className="h-4 w-4/5" />
      </div>
      <div className="flex justify-between pt-4">
        <SkeletonLoader className="h-8 w-20 rounded-md" />
        <SkeletonLoader className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-4 rounded-xl flex items-center gap-4">
          <SkeletonLoader className="h-12 w-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader className="h-5 w-1/3" />
            <SkeletonLoader className="h-4 w-1/2" />
          </div>
          <SkeletonLoader className="h-8 w-20 rounded-md hidden sm:block" />
        </div>
      ))}
    </div>
  );
}
