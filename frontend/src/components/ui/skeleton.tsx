import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const skeletonVariants = cva(
  "animate-pulse rounded-md bg-gray-200",
  {
    variants: {
      variant: {
        default: "bg-gray-200",
        primary: "bg-blue-200",
        secondary: "bg-gray-300",
        gradient: "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div className={cn(skeletonVariants({ variant }), className)} {...props} />
  );
}

// Skeleton for text lines
interface SkeletonTextProps extends SkeletonProps {
  lines?: number;
  lastLineWidth?: string;
}

function SkeletonText({ className, lines = 3, lastLineWidth = "60%", ...props }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? `w-[${lastLineWidth}]` : "w-full")}
        />
      ))}
    </div>
  );
}

// Skeleton for cards
interface SkeletonCardProps extends SkeletonProps {
  hasImage?: boolean;
  hasFooter?: boolean;
}

function SkeletonCard({ className, hasImage, hasFooter, ...props }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-lg border bg-white p-4 space-y-4", className)} {...props}>
      {hasImage && <Skeleton className="h-40 w-full rounded-lg" />}
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      {hasFooter && (
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      )}
    </div>
  );
}

// Skeleton for table rows
interface SkeletonTableProps extends SkeletonProps {
  rows?: number;
  columns?: number;
}

function SkeletonTable({ className, rows = 5, columns = 4, ...props }: SkeletonTableProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Skeleton for avatars
interface SkeletonAvatarProps extends SkeletonProps {
  size?: "sm" | "md" | "lg" | "xl";
}

function SkeletonAvatar({ className, size = "md", ...props }: SkeletonAvatarProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <Skeleton className={cn("rounded-full", sizes[size], className)} {...props} />
  );
}

// Skeleton for stats
interface SkeletonStatsProps extends SkeletonProps {
  count?: number;
}

function SkeletonStats({ className, count = 4, ...props }: SkeletonStatsProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-lg border bg-white space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonAvatar, SkeletonStats };