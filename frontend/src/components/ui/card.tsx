import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl border bg-white text-gray-900 shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-gray-200",
        elevated: "border-transparent shadow-lg hover:shadow-xl",
        outline: "border-gray-300",
        ghost: "border-transparent bg-gray-50",
        gradient: "border-transparent bg-gradient-to-br from-white to-gray-50",
      },
      padding: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-gray-500", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center pt-4", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

// Stat Card Component for Dashboard
interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, description, trend, trendValue, icon, loading, ...props }, ref) => {
    const trendColors = {
      up: "text-green-600",
      down: "text-red-600",
      neutral: "text-gray-500",
    };

    return (
      <Card variant="elevated" className={cn("relative overflow-hidden", className)} ref={ref} {...props}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {loading ? (
              <div className="h-8 w-20 animate-pulse bg-gray-200 rounded" />
            ) : (
              <p className="text-2xl font-bold tracking-tight">{value}</p>
            )}
            {description && (
              <p className="text-xs text-gray-400">{description}</p>
            )}
            {trend && trendValue && (
              <div className={cn("flex items-center gap-1 text-xs font-medium", trendColors[trend])}>
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              {icon}
            </div>
          )}
        </div>
        {/* Decorative gradient bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
      </Card>
    );
  }
);
StatCard.displayName = "StatCard";

// Metric Card for detailed metrics
interface MetricCardProps extends StatCardProps {
  progress?: number;
  maxValue?: number;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, progress, maxValue, ...props }, ref) => {
    return (
      <StatCard ref={ref} className={className} {...props}>
        {progress !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progresso</span>
              <span>{maxValue ? `${Math.round(progress / maxValue * 100)}%` : `${progress}%`}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${maxValue ? (progress / maxValue * 100) : progress}%` }}
              />
            </div>
          </div>
        )}
      </StatCard>
    );
  }
);
MetricCard.displayName = "MetricCard";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, StatCard, MetricCard, cardVariants };