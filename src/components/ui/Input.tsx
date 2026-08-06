import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, type = "text", ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-bold text-secondary-gray uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          suppressHydrationWarning
          className={`w-full px-3 py-2 bg-card-bg border ${
            error ? "border-red-500 focus:ring-red-500/20" : "border-border-light focus:ring-primary/20"
          } rounded-lg text-sm text-foreground placeholder:text-foreground/45 transition-all duration-200 outline-none focus:ring-2 focus:border-primary`}
          {...props}
        />
        {error && (
          <span className="text-[11px] text-red-500 font-semibold mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
