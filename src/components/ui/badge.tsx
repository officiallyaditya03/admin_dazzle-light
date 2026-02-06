import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "outline";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "outline" && "border border-border bg-background text-foreground",
        className
      )}
      {...props}
    />
  );
}



