"use client";

import { useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { FieldShell, controlClasses } from "@/components/ui/Field";

interface ComboboxProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  emptyText?: string;
  name?: string;
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * ARIA 1.2 editable combobox with list autocomplete (e.g. 58 wilayas).
 * Keyboard: ↓/↑ move, Enter selects, Esc closes (then clears), Tab leaves.
 */
export function Combobox({
  label,
  options,
  value,
  onChange,
  placeholder,
  hint,
  emptyText = "Aucun résultat",
  name,
}: ComboboxProps) {
  const listId = useId();
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q || query === value) return options;
    return options.filter((option) => normalize(option).includes(q));
  }, [options, query, value]);

  const select = (option: string) => {
    onChange(option);
    setQuery(option);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter" && open && active >= 0 && filtered[active]) {
      event.preventDefault();
      select(filtered[active]);
    } else if (event.key === "Escape") {
      if (open) {
        setOpen(false);
      } else {
        setQuery("");
        onChange("");
      }
    }
  };

  return (
    <FieldShell label={label} hint={hint}>
      {({ controlId, describedBy }) => (
        <div className="relative">
          <input
            ref={inputRef}
            id={controlId}
            name={name}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
            aria-describedby={describedBy}
            autoComplete="off"
            value={query}
            placeholder={placeholder}
            className={cn(controlClasses, "pe-10")}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActive(-1);
              if (event.target.value === "") onChange("");
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              // Delay so a click on an option registers first.
              setTimeout(() => {
                setOpen(false);
                if (!options.includes(query)) setQuery(value);
              }, 120);
            }}
            onKeyDown={onKeyDown}
          />
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-text-muted"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <ul
            id={listId}
            role="listbox"
            aria-label={label}
            hidden={!open}
            className="absolute inset-x-0 top-full z-40 mt-1 max-h-64 overflow-y-auto rounded-md border border-border-strong bg-surface-2 py-1 shadow-(--shadow-card)">
            {filtered.length === 0 ? (
              <li className="px-3.5 py-2 text-sm text-text-muted">{emptyText}</li>
            ) : (
              filtered.map((option, index) => (
                <li
                  key={option}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={option === value}
                  className={cn(
                    "flex min-h-10 cursor-pointer items-center px-3.5 text-sm",
                    index === active ? "bg-surface-3 text-text-primary" : "text-text-secondary",
                    option === value && "font-semibold text-accent",
                  )}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    select(option);
                  }}
                  onMouseEnter={() => setActive(index)}>
                  {option}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </FieldShell>
  );
}
