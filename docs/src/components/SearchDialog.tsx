import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import type { Section } from "@/data/docSections";

interface SearchDialogProps {
  sections: Section[];
  onNavigate: (id: string) => void;
}

const SearchDialog = ({ sections, onNavigate }: SearchDialogProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return sections
      .filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.content.some((block) => {
            if (block.type === "paragraph" || block.type === "heading") {
              return block.text?.toLowerCase().includes(q);
            }
            return false;
          })
      )
      .slice(0, 8);
  }, [query, sections]);

  const handleSelect = useCallback(
    (id: string) => {
      setOpen(false);
      onNavigate(id);
    },
    [onNavigate]
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-secondary/50 text-sm text-muted-foreground hover:border-primary/40 transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search docs...</span>
        <kbd className="hidden sm:inline-flex ml-2 text-xs bg-muted px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg mx-4 rounded-xl border border-border bg-popover shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation..."
            className="flex-1 py-3 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button onClick={() => setOpen(false)} className="p-1">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto p-2">
            {results.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSelect(section.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent text-sm transition-colors"
              >
                <span className="font-medium text-foreground">{section.title}</span>
                <span className="block text-xs text-muted-foreground mt-0.5 truncate">
                  {section.content.find((b) => b.type === "paragraph")?.text?.slice(0, 80)}
                </span>
              </button>
            ))}
          </div>
        )}
        {query && results.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No results found.</div>
        )}
      </div>
    </div>
  );
};

export default SearchDialog;
