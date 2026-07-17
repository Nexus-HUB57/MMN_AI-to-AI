import { cn } from "@/lib/utils";
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-slate-700/40", className)} {...props} />;
}
export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-700/40 bg-slate-900/40 p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
export function PageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {Array.from({ length: rows }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  );
}
export default Skeleton;
