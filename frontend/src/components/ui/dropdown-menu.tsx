import * as React from "react";

import { cn } from "@/lib/utils";

type DropdownMenuProps = {
  children: React.ReactNode;
};

type DropdownMenuTriggerProps = {
  children: React.ReactElement;
  asChild?: boolean;
};

type DropdownMenuContentProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end";
};

const alignClasses: Record<
  NonNullable<DropdownMenuContentProps["align"]>,
  string
> = {
  start: "left-0",
  center: "left-1/2 -translate-x-1/2",
  end: "right-0",
};

export const DropdownMenu = ({ children }: DropdownMenuProps) => (
  <div className="relative">{children}</div>
);

export const DropdownMenuTrigger = ({
  children,
  asChild,
}: DropdownMenuTriggerProps) => {
  if (asChild) {
    return children;
  }

  return <button type="button">{children}</button>;
};

export const DropdownMenuContent = ({
  children,
  align = "start",
  className,
  ...props
}: DropdownMenuContentProps) => (
  <div
    className={cn(
      "absolute top-full mt-2 min-w-48 rounded-md border bg-white shadow-lg z-50",
      alignClasses[align],
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const DropdownMenuItem = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("px-4 py-2 hover:bg-gray-100 cursor-pointer", className)}
    {...props}
  >
    {children}
  </div>
);

export const DropdownMenuSeparator = () => <div className="border-t my-1" />;
