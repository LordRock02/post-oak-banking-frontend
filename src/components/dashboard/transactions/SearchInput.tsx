import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function SearchInput({ value, onChange, disabled }: SearchInputProps) {
  return (
    <div className="relative w-full sm:w-64">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onChange("")}
        disabled={disabled}
        placeholder="Search merchant, category, amount…"
        aria-label="Search transactions"
        className="h-9 rounded-lg bg-slate-50 pr-8 pl-9 focus-visible:bg-white [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
