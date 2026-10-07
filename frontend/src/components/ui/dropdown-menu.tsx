"use client";

import * as React from "react";
import { cn } from "cn";

interface DropdownMenuContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null);

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("DropdownMenu components must be used within <DropdownMenu>");
  }
  return context;
}

export function DropdownMenu({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      const next = typeof value === "function" ? value(open) : value;
      if (controlledOpen === undefined) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange, open]
  );

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  // Close when clicking outside or pressing Escape
  React.useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        contentRef.current &&
        !contentRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, triggerRef } = useDropdownMenu();

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="true"
      aria-expanded={open}
      onClick={(e) => {
        props.onClick?.(e);
        if (!e.defaultPrevented) {
          setOpen((prev) => !prev);
        }
      }}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  className,
  align = "end",
  sideOffset = 6,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}) {
  const { open, contentRef } = useDropdownMenu();

  if (!open) return null;

  const alignClasses =
    align === "end"
      ? "right-0"
      : align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "left-0";

  return (
    <div
      ref={contentRef}
      role="menu"
      style={{ marginTop: sideOffset }}
      className={cn(
        "absolute z-50 top-full min-w-[14rem] rounded-xl border border-[#E2E8F0] bg-white p-1 text-[#0F172A] shadow-xl focus:outline-none transition-all duration-150",
        alignClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-2.5 py-1.5 text-xs font-semibold text-[#64748B]", className)} {...props}>
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  className,
  children,
  onClick,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { setOpen } = useDropdownMenu();

  return (
    <div
      role="menuitem"
      tabIndex={0}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) {
          setOpen(false);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(e as any);
          setOpen(false);
        }
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg px-2.5 py-2 text-xs font-medium text-[#0F172A] outline-none transition-colors hover:bg-[#F1F5F9] focus:bg-[#F1F5F9]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("-mx-1 my-1 h-px bg-[#E2E8F0]", className)} {...props} />;
}

export function DropdownMenuGroup({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>;
}

export function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("ml-auto text-xs tracking-widest text-[#64748B]", className)} {...props} />;
}
