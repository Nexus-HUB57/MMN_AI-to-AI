import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const progressVariants = cva(
  "h-2 w-full overflow-hidden rounded-full bg-gray-200 transition-all duration-500",
  {
    variants: {
      variant: {
        default: "bg-blue-600",
        success: "bg-green-600",
        warning: "bg-yellow-500",
        danger: "bg-red-600",
        gradient: "bg-gradient-to-r from-blue-600 to-purple-600",
      },
      size: {
        default: "h-2",
        sm: "h-1",
        lg: "h-3",
        xl: "h-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const indicatorVariants = cva(
  "h-full w-full flex-1 origin-left rounded-full",
  {
    variants: {
      variant: {
        default: "bg-blue-600",
        success: "bg-green-600",
        warning: "bg-yellow-500",
        danger: "bg-red-600",
        gradient: "bg-gradient-to-r from-blue-600 to-purple-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number;
  max?: number;
  showLabel?: boolean;
  animated?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, variant, size, value = 0, max = 100, showLabel, animated, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div className="space-y-1" ref={ref} {...props}>
        {showLabel && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Progresso</span>
            <span className="font-medium text-gray-700">{Math.round(percentage)}%</span>
          </div>
        )}
        <div className={cn(progressVariants({ variant, size }), className)}>
          <div
            className={cn(indicatorVariants({ variant }), animated && "transition-all duration-1000 ease-out")}
            style={{ transform: `scaleX(${percentage / 100})` }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = "Progress";

// Circular Progress for metrics
interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: "default" | "success" | "warning" | "danger" | "gradient";
  showValue?: boolean;
  label?: string;
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ className, value, max = 100, size = 120, strokeWidth = 8, variant = "default", showValue, label, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const colors = {
      default: "#2563eb",
      success: "#16a34a",
      warning: "#eab308",
      danger: "#dc2626",
      gradient: "url(#gradient)",
    };

    return (
      <div className={cn("relative inline-flex items-center justify-center", className)} ref={ref} {...props}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors[variant]}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        {showValue && (
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-900">{Math.round(percentage)}%</span>
            {label && <span className="text-xs text-gray-500">{label}</span>}
          </div>
        )}
      </div>
    );
  }
);
CircularProgress.displayName = "CircularProgress";

export { Progress, CircularProgress, progressVariants };