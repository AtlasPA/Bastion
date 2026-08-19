"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";
const THEME_KEY = "bastion-theme";

function applyTheme(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    if (saved === "light" || saved === "dark" || saved === "system") {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  function choose(next: Theme) {
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
    setOpen(false);
  }

  const options: { value: Theme; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "Match device" },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Settings"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
      >
        <Settings className="size-4" aria-hidden />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-lg border bg-popover p-1 shadow-md">
          <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Appearance
          </p>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => choose(o.value)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                theme === o.value && "font-medium"
              )}
            >
              {o.label}
              {theme === o.value && <Check className="size-4" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
