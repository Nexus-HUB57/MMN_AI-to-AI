import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

const SelectTrigger = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type="button" className={cn("flex items-center justify-between w-full px-3 py-2 border rounded-md bg-white text-sm", className)} {...props}>
    {children}
  </button>
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span {...props}>{children}</span>
);
SelectValue.displayName = "SelectValue";

const SelectContent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="absolute mt-1 w-full bg-white border rounded-md shadow-lg z-50">{children}</div>
);
SelectContent.displayName = "SelectContent";

const SelectItem = ({ children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
  <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer" {...props}>{children}</li>
);
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };