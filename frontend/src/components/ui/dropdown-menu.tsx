import * as React from "react";

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

export const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => <button>{children}</button>;

export const DropdownMenuContent = ({ children }: { children: React.ReactNode }) => <div className="bg-white border rounded shadow-lg">{children}</div>;

export const DropdownMenuItem = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer" {...props}>{children}</div>
);

export const DropdownMenuSeparator = () => <div className="border-t my-1" />;