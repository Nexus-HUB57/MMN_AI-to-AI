import * as React from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full mx-4">{children}</div>
    </div>
  );
};

const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("", className)}>{children}</div>
);

const DialogHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("mb-4", className)}>{children}</div>
);

const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>
);

const DialogDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("text-sm text-gray-500 mt-1", className)}>{children}</p>
);

const DialogTrigger = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type="button" {...props}>{children}</button>
);

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger };
