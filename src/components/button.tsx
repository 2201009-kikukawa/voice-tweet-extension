"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-border)] focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)]",
        secondary:
          "bg-[var(--vscode-button-secondaryBackground)] text-[var(--vscode-button-secondaryForeground)] hover:bg-[var(--vscode-button-secondaryHoverBackground)]",
        icon: "bg-transparent text-[var(--vscode-foreground)] hover:bg-[var(--vscode-toolbar-hoverBackground)]",
        destructive: "bg-red-600 text-white hover:bg-red-500",
        ghost: "bg-transparent text-[var(--vscode-foreground)] hover:bg-white/5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
        icon: "size-10 p-0",
      },
      loading: {
        true: "cursor-progress",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      loading: false,
    },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    leftIcon?: React.ReactNode;
    loadingIcon?: React.ReactNode;
    isLoading?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      leftIcon,
      loadingIcon,
      children,
      ...props
    },
    ref
  ) => {
    const Component = asChild ? Slot : "button";
    const computedLoading = isLoading;
    const renderedLeftIcon = computedLoading ? loadingIcon ?? leftIcon : leftIcon;

    return (
      <Component
        ref={ref}
        className={cn(buttonVariants({ variant, size, loading: computedLoading }), className)}
        data-slot="button"
        aria-busy={computedLoading}
        {...props}>
        {renderedLeftIcon}
        {children ? <span className="flex">{children}</span> : null}
      </Component>
    );
  }
);

Button.displayName = "Button";

type CodiconProps = {
  name: string;
  className?: string;
};

const ButtonIcon = ({ name, className }: CodiconProps) => (
  <span
    aria-hidden="true"
    className={cn("codicon", `codicon-${name}`, "shrink-0 self-center leading-none", className)}
  />
);

const ButtonSpinner = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={cn("codicon", "self-center", "codicon-loading", "loading-animation", className)}
  />
);

export { Button, ButtonIcon, ButtonSpinner, buttonVariants };
