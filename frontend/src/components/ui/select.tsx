import * as React from "react";
import { cn } from "@/lib/utils";

type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  children?: React.ReactNode;
  onValueChange?: (value: string) => void;
  placeholder?: string;
};

type SelectItemProps = {
  value: string;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
};

type SelectValueProps = React.HTMLAttributes<HTMLSpanElement> & {
  placeholder?: string;
};

type SelectTriggerProps = React.HTMLAttributes<HTMLDivElement>;

type SelectContentProps = React.HTMLAttributes<HTMLDivElement>;

type ExtractedOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type ExtractedSelectData = {
  options: ExtractedOption[];
  placeholder?: string;
  triggerClassName?: string;
};

function getDisplayName(type: React.ElementType) {
  if (typeof type === "string") return type;
  return (type as { displayName?: string; name?: string }).displayName ||
    (type as { displayName?: string; name?: string }).name ||
    "Unknown";
}

function extractText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(" ").replace(/\s+/g, " ").trim();
  if (React.isValidElement(node)) return extractText(node.props.children);
  return "";
}

function extractSelectData(children: React.ReactNode): ExtractedSelectData {
  const data: ExtractedSelectData = { options: [] };

  const visit = (node: React.ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!React.isValidElement(child)) return;

      const typeName = getDisplayName(child.type as React.ElementType);

      if (typeName === "SelectTrigger") {
        if (typeof child.props.className === "string") {
          data.triggerClassName = cn(data.triggerClassName, child.props.className);
        }
      }

      if (typeName === "SelectValue" && typeof child.props.placeholder === "string" && !data.placeholder) {
        data.placeholder = child.props.placeholder;
      }

      if (typeName === "SelectItem") {
        data.options.push({
          value: String(child.props.value ?? ""),
          label: extractText(child.props.children),
          disabled: Boolean(child.props.disabled),
        });
        return;
      }

      if (typeof child.type === "string" && child.type.toLowerCase() === "option") {
        data.options.push({
          value: String(child.props.value ?? ""),
          label: extractText(child.props.children),
          disabled: Boolean(child.props.disabled),
        });
      }

      if (child.props?.children) {
        visit(child.props.children);
      }
    });
  };

  visit(children);
  return data;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onValueChange, onChange, placeholder, value, defaultValue, ...props }, ref) => {
    const extracted = React.useMemo(() => extractSelectData(children), [children]);
    const resolvedPlaceholder = placeholder ?? extracted.placeholder;
    const resolvedClassName = cn(
      "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      extracted.triggerClassName,
      className
    );

    const hasMatchingValue = extracted.options.some((option) => option.value === value);
    const normalizedValue = value === undefined ? undefined : hasMatchingValue ? value : "";

    return (
      <select
        ref={ref}
        className={resolvedClassName}
        value={normalizedValue}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        {...props}
      >
        {resolvedPlaceholder ? (
          <option value="" disabled>
            {resolvedPlaceholder}
          </option>
        ) : null}
        {extracted.options.map((option) => (
          <option key={`${option.value}-${option.label}`} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = "Select";

const SelectTrigger = ({ children }: SelectTriggerProps) => <>{children}</>;
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = (_props: SelectValueProps) => null;
SelectValue.displayName = "SelectValue";

const SelectContent = ({ children }: SelectContentProps) => <>{children}</>;
SelectContent.displayName = "SelectContent";

const SelectItem = (_props: SelectItemProps) => null;
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
