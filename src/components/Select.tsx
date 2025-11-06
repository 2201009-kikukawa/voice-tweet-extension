"use client";
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { cn } from "../lib/utils";

const Select = ({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) => (
  <SelectPrimitive.Root data-slot="select" {...props} />
);

const SelectGroup = ({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) => (
  <SelectPrimitive.Group data-slot="select-group" {...props} />
);

const SelectValue = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) => (
  <SelectPrimitive.Value
    data-slot="select-value"
    className={cn("text-[var(--vscode-dropdown-foreground,#f3f3f3)]", className)}
    {...props}
  />
);

const SelectTrigger = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) => (
  <SelectPrimitive.Trigger
    data-slot="select-trigger"
    className={cn(
      "inline-flex h-9 w-full items-center justify-between rounded-md border border-[var(--vscode-dropdown-border,#3c3c3c)] bg-[var(--vscode-dropdown-background,#3c3c3c)] px-3 text-sm text-[var(--vscode-dropdown-foreground,#f3f3f3)] transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-border,#0078d4)] disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDownIcon className="ml-2 size-4" aria-hidden="true" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
);

const SelectContent = ({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      data-slot="select-content"
      position={position}
      className={cn(
        "z-50 max-h-64 min-w-[8rem] overflow-hidden rounded-md border border-[var(--vscode-dropdown-border,#3c3c3c)] bg-[var(--vscode-dropdown-background,#252525)] text-[var(--vscode-dropdown-foreground,#f3f3f3)] shadow-lg",
        position === "popper" && "translate-y-1",
        className
      )}
      {...props}>
      <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
        <ChevronUpIcon className="size-4" aria-hidden="true" />
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
        <ChevronDownIcon className="size-4" aria-hidden="true" />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);

const SelectLabel = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) => (
  <SelectPrimitive.Label
    data-slot="select-label"
    className={cn(
      "px-2 py-1 text-xs font-medium text-[var(--vscode-descriptionForeground,#a6a6a6)]",
      className
    )}
    {...props}
  />
);

const SelectItem = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) => (
  <SelectPrimitive.Item
    data-slot="select-item"
    className={cn(
      "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-8 py-2 text-sm text-[var(--vscode-dropdown-foreground,#f3f3f3)] outline-none focus:bg-[var(--vscode-list-focusBackground,#094771)] focus:text-[var(--vscode-list-focusForeground,#ffffff)] data-[state=checked]:bg-[var(--vscode-list-activeSelectionBackground,#04395e)]",
      className
    )}
    {...props}>
    <span className="absolute left-2 flex size-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="size-4" aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);

const SelectSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) => (
  <SelectPrimitive.Separator
    data-slot="select-separator"
    className={cn("-mx-1 my-1 h-px bg-[var(--vscode-dropdown-border,#3c3c3c)]", className)}
    {...props}
  />
);

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
