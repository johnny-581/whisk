import * as React from "react";

type CardVariant = "white" | "light-green";

interface CardProps extends React.ComponentProps<"div"> {
  variant?: CardVariant;
}

export function Card({
  variant = "white",
  className = "",
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    white: "bg-white text-neutral-900 shadow-md",
    "light-green": "bg-mint-100 text-neutral-900 shadow-md",
  };

  const baseStyles = "rounded-[var(--card-radius)] p-6";

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
