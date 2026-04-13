"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchableSelectProps = {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  id?: string;
  placeholder?: string;
  className?: string;
  "aria-invalid"?: boolean;
};

function fuzzyMatch(query: string, option: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const o = option.toLowerCase();
  return o.includes(q) || q.split(/\s+/).every((word) => o.includes(word));
}

export function SearchableSelect({
  options,
  value,
  onChange,
  name,
  id,
  placeholder = "Search or select…",
  className,
  "aria-invalid": ariaInvalid,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = query.trim();
  const filtered = trimmedQuery
    ? options.filter((o) => fuzzyMatch(query, o))
    : [...options];
  const showAddCustom = trimmedQuery && filtered.length === 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <input type="hidden" name={name} value={value} />
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${id ?? name}-listbox`}
        aria-invalid={ariaInvalid}
        className="relative"
      >
        <Input
          id={id}
          type="text"
          value={open ? query : value}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="h-12 text-base pr-10"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground"
          aria-label={open ? "Close" : "Open"}
        >
          <ChevronDown
            className={cn("size-5 transition-transform", open && "rotate-180")}
          />
        </button>
      </div>
      {open && (
        <ul
          id={`${id ?? name}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-popover py-1 text-popover-foreground shadow-lg"
        >
          {showAddCustom ? (
            <li
              role="option"
              aria-selected={false}
              onClick={() => {
                onChange(trimmedQuery);
                setQuery("");
                setOpen(false);
              }}
              className="cursor-pointer px-4 py-2.5 text-sm text-primary hover:bg-muted font-medium"
            >
              Add &quot;{trimmedQuery}&quot;
            </li>
          ) : filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              No matches
            </li>
          ) : (
            filtered.map((option) => (
              <li
                key={option}
                role="option"
                aria-selected={value === option}
                onClick={() => {
                  onChange(option);
                  setQuery("");
                  setOpen(false);
                }}
                className={cn(
                  "cursor-pointer px-4 py-2.5 text-sm text-popover-foreground",
                  value === option
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted hover:text-foreground"
                )}
              >
                {option}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
