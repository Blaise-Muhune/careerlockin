"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchableMultiSelectProps = {
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  name: string;
  id?: string;
  placeholder?: string;
  className?: string;
};

function fuzzyMatch(query: string, option: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const o = option.toLowerCase();
  return o.includes(q) || q.split(/\s+/).every((word) => o.includes(word));
}

export function SearchableMultiSelect({
  options,
  value,
  onChange,
  name,
  id,
  placeholder = "Search to add…",
  className,
}: SearchableMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = query.trim();
  const filtered = trimmedQuery
    ? options.filter((o) => fuzzyMatch(query, o) && !value.includes(o))
    : options.filter((o) => !value.includes(o));
  const showAddCustom = trimmedQuery && filtered.length === 0 && !value.includes(trimmedQuery);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function add(option: string) {
    if (!value.includes(option)) {
      onChange([...value, option]);
    }
    setQuery("");
  }

  function remove(option: string) {
    onChange(value.filter((v) => v !== option));
  }

  return (
    <div ref={containerRef} className={cn("relative space-y-2", className)}>
      {value.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                className="rounded p-0.5 hover:bg-primary/20"
                aria-label={`Remove ${v}`}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <Input
          id={id}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
          className="absolute z-50 mt-1 max-h-60 w-full min-w-[200px] overflow-auto rounded-md border border-input bg-popover py-1 shadow-lg"
        >
          {showAddCustom ? (
            <li
              role="option"
              aria-selected={false}
              onClick={() => add(trimmedQuery)}
              className="cursor-pointer px-4 py-2.5 text-sm text-primary hover:bg-muted font-medium"
            >
              Add &quot;{trimmedQuery}&quot;
            </li>
          ) : filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              {trimmedQuery ? "No matches" : "All selected"}
            </li>
          ) : (
            filtered.map((option) => (
              <li
                key={option}
                role="option"
                aria-selected={false}
                onClick={() => add(option)}
                className="cursor-pointer px-4 py-2.5 text-sm hover:bg-muted"
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
