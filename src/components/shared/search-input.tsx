"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  className?: string;
}

export function SearchInput({
  value,
  defaultValue = "",
  onChange,
  onClear,
  placeholder = "Search...",
  className,
  ...props
}: SearchInputProps) {
  const [internalValue, setInternalValue] = React.useState<string>(
    value ?? defaultValue
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setInternalValue(nextVal);
    onChange?.(nextVal);
  };

  const handleClear = () => {
    setInternalValue("");
    onChange?.("");
    onClear?.();
  };

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <Search className="absolute left-3.5 h-4 w-4 text-[#737373] pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        className="w-full bg-[#F5F6F8] border border-[#EAECEF] rounded-xl pl-10 pr-8 py-2 text-xs text-[#171717] placeholder:text-[#737373] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-[#171717] transition-all"
        {...props}
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 text-[#737373] hover:text-[#171717] focus:outline-none"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
