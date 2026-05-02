"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full bg-transparent" />;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="w-9 h-9 flex items-center justify-center rounded-full text-[--text-secondary] hover:text-[--text] hover:bg-[--bg-surface] transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[--accent]"
      aria-label="Alternar tema"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-[17px] h-[17px]" strokeWidth={1.75} />
      ) : (
        <Moon className="w-[17px] h-[17px]" strokeWidth={1.75} />
      )}
    </button>
  );
}
