import * as React from "react";

type ButtonSize = "small" | "medium" | "large";
type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends React.ComponentProps<"button"> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  active?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export function Button({
  size = "medium",
  variant = "primary",
  active = true,
  icon: Icon,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyles = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
  };

  const variantStyles = {
    primary: active
      ? "bg-mint-800 text-white hover:bg-mint-400"
      : "bg-mint-800 text-white cursor-not-allowed",
    secondary: active
      ? "border-2 border-neutral-900 text-neutral-900 bg-transparent hover:bg-neutral-900/5"
      : "border-2 border-neutral-400 text-neutral-400 bg-transparent cursor-not-allowed",
  };

  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium transition-all outline-none focus:ring-2 focus:ring-neutral-700 focus:ring-offset-2";

  const radiusStyle = "rounded-[var(--button-radius)]";

  const isDisabled = disabled || !active;

  return (
    <button
      className={`${baseStyles} ${radiusStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {children}
      {Icon && <Icon className="w-4 h-4" />}
    </button>
  );
}
