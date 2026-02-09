import * as React from "react";
import { cn } from "@/lib/utils";

interface TagProps {
  className?: string;
  children: React.ReactNode;
}

function Tag({ className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-mint-100 text-neutral-400",
        className
      )}
      {...props}
    />
  );
}

export { Tag };
