"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-border)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)]",
        secondary:
          "bg-[var(--vscode-button-secondaryBackground)] text-[var(--vscode-button-secondaryForeground)] hover:bg-[var(--vscode-button-secondaryHoverBackground)]",
        icon: "bg-transparent text-[var(--vscode-foreground)] hover:bg-[var(--vscode-toolbar-hoverBackground)] px-2 py-2",
      },
      loading: {
        true: "cursor-progress",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      loading: false,
    },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    leftIcon?: React.ReactNode;
    loadingIcon?: React.ReactNode;
    isLoading?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, isLoading = false, leftIcon, loadingIcon, children, ...props }, ref) => {
    const computedLoading = isLoading;
    const renderedLeftIcon = computedLoading ? loadingIcon ?? leftIcon : leftIcon;

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, loading: computedLoading }))}
        data-slot="button"
        aria-busy={computedLoading}
        {...props}>
        {renderedLeftIcon}
        {children ? <span>{children}</span> : null}
      </button>
    );
  }
);

Button.displayName = "Button";

type CodiconProps = {
  name: string;
  className?: string;
};

const ButtonIcon = ({ name, className }: CodiconProps) => (
  <span aria-hidden="true" className={cn("codicon", "self-center", `codicon-${name}`, className)} />
);

const ButtonSpinner = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={cn("codicon", "self-center", "codicon-loading", "loading-animation", className)}
  />
);

export { Button, ButtonIcon, ButtonSpinner, buttonVariants };
