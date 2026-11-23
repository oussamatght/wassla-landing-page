import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export const controlClasses =
  "w-full min-h-11 rounded-md border border-border bg-surface-1 px-3.5 text-base text-text-primary placeholder:text-text-muted transition-colors duration-(--duration-fast) hover:border-border-strong focus:border-accent focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-[invalid=true]:border-danger disabled:opacity-55";

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (ids: { controlId: string; describedBy?: string; invalid: boolean }) => ReactNode;
  className?: string;
}

/**
 * Label + control + hint/error wiring. Errors are linked with
 * aria-describedby and announced (role="alert") when they appear.
 */
export function FieldShell({ label, hint, error, required, children, className }: FieldShellProps) {
  const baseId = useId();
  const controlId = `${baseId}-control`;
  const hintId = hint ? `${baseId}-hint` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={controlId} className="text-sm font-medium text-text-primary">
        {label}
        {required && (
          <span aria-hidden="true" className="ms-0.5 text-danger">
            *
          </span>
        )}
      </label>
      {children({ controlId, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

interface InputProps extends Omit<ComponentProps<"input">, "id"> {
  label: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, required, className, ...props }: InputProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} className={className}>
      {({ controlId, describedBy, invalid }) => (
        <input
          id={controlId}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          required={required}
          className={controlClasses}
          {...props}
        />
      )}
    </FieldShell>
  );
}

interface SelectProps extends Omit<ComponentProps<"select">, "id"> {
  label: string;
  hint?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function Select({ label, hint, error, required, options, placeholder, className, ...props }: SelectProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} className={className}>
      {({ controlId, describedBy, invalid }) => (
        <div className="relative">
          <select
            id={controlId}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            required={required}
            className={cn(controlClasses, "appearance-none pe-10")}
            {...props}>
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-text-muted"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </FieldShell>
  );
}
