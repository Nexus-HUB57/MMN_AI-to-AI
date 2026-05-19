import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext<{ activeTab: string; setActiveTab: (tab: string) => void } | null>(null);

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const Tabs = ({ defaultValue = "", value: controlledValue, onValueChange, children, className }: TabsProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const value = controlledValue ?? internalValue;
  const setValue = (tab: string) => {
    setInternalValue(tab);
    onValueChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab: value, setActiveTab: setValue }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

const TabsList = ({ children, className }: TabsListProps) => (
  <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500", className)}>
    {children}
  </div>
);

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const TabsTrigger = ({ value, children, className, disabled }: TabsTriggerProps) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => context.setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900",
        className
      )}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContent = ({ value, children, className }: TabsContentProps) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.activeTab !== value) return null;

  return <div className={cn("mt-2 ring-offset-white focus-visible:outline-none", className)}>{children}</div>;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };