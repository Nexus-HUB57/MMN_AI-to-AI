import * as React from "react";

import { cn } from "@/lib/utils";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
};

type DropdownMenuProps = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
};

type DropdownMenuTriggerProps = {
  children: React.ReactElement;
  asChild?: boolean;
};

type DropdownMenuContentProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onPointerDownOutside"> & {
  align?: "start" | "center" | "end";
  onInteractOutside?: () => void;
};

const alignClasses: Record<NonNullable<DropdownMenuContentProps["align"]>, string> = {
  start: "left-0",
  center: "left-1/2 -translate-x-1/2",
  end: "right-0",
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext(component: string) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error(`${component} deve ser usado dentro de <DropdownMenu>.`);
  }
  return context;
}

function composeEventHandlers<E>(
  original?: (event: E) => void,
  next?: (event: E) => void,
) {
  return (event: E) => {
    original?.(event);
    next?.(event);
  };
}

export const DropdownMenu = ({
  children,
  open,
  onOpenChange,
}: DropdownMenuProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const isControlled = typeof open === "boolean";
  const resolvedOpen = isControlled ? open : internalOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  React.useEffect(() => {
    if (!resolvedOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (contentRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [resolvedOpen, setOpen]);

  return (
    <DropdownMenuContext.Provider
      value={{
        open: resolvedOpen,
        setOpen,
        triggerRef,
        contentRef,
      }}
    >
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger = ({
  children,
  asChild,
}: DropdownMenuTriggerProps) => {
  const { open, setOpen, triggerRef } = useDropdownMenuContext("DropdownMenuTrigger");

  if (asChild) {
    return React.cloneElement(children, {
      ...children.props,
      ref: (node: HTMLElement | null) => {
        triggerRef.current = node;
        const originalRef = (children as any).ref;
        if (typeof originalRef === "function") originalRef(node);
        else if (originalRef && typeof originalRef === "object") originalRef.current = node;
      },
      onClick: composeEventHandlers(children.props.onClick, () => setOpen(!open)),
      "aria-expanded": open,
      "aria-haspopup": "menu",
    });
  }

  return (
    <button
      type="button"
      ref={(node) => {
        triggerRef.current = node;
      }}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      aria-haspopup="menu"
    >
      {children}
    </button>
  );
};

export const DropdownMenuContent = ({
  children,
  align = "start",
  className,
  onInteractOutside,
  onMouseLeave,
  ...props
}: DropdownMenuContentProps) => {
  const { open, setOpen, contentRef } = useDropdownMenuContext("DropdownMenuContent");

  if (!open) return null;

  return (
    <div
      ref={(node) => {
        contentRef.current = node;
      }}
      className={cn(
        "absolute top-full mt-2 min-w-48 rounded-md border bg-white shadow-lg z-50",
        alignClasses[align],
        className,
      )}
      role="menu"
      onMouseLeave={composeEventHandlers(onMouseLeave, () => setOpen(false))}
      {...props}
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        {children}
      </div>
      <span className="sr-only" aria-hidden="true">
        menu
      </span>
      {onInteractOutside ? (
        <span className="hidden" data-outside-handler={String(Boolean(onInteractOutside))} />
      ) : null}
    </div>
  );
};

export const DropdownMenuItem = ({
  children,
  className,
  onClick,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { setOpen } = useDropdownMenuContext("DropdownMenuItem");

  return (
    <div
      className={cn("px-4 py-2 hover:bg-gray-100 cursor-pointer", className)}
      role="menuitem"
      onClick={composeEventHandlers(onClick, () => setOpen(false))}
      {...props}
    >
      {children}
    </div>
  );
};

export const DropdownMenuSeparator = () => <div className="border-t my-1" />;
