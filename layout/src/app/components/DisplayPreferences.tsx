import { useEffect, useState } from "react";
import { Moon, Sun, Type } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export function DisplayPreferences({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cortex-large-text") === "true";
    setLargeText(saved);
    document.documentElement.style.setProperty("--font-size", saved ? "18px" : "16px");
  }, []);

  const toggleTextSize = () => {
    const next = !largeText;
    setLargeText(next);
    localStorage.setItem("cortex-large-text", String(next));
    document.documentElement.style.setProperty("--font-size", next ? "18px" : "16px");
  };

  const dark = theme === "dark";
  return (
    <div className="flex items-center gap-1" aria-label="Preferências de visualização">
      <Button type="button" variant="outline" size="sm" className={compact ? "h-8 px-2" : "rounded-xl"} onClick={() => setTheme(dark ? "light" : "dark")} aria-label="Alternar modo claro e escuro" title="Alternar modo claro e escuro">
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        {!compact ? <span className="hidden lg:inline">{dark ? "Claro" : "Escuro"}</span> : null}
      </Button>
      <Button type="button" variant="outline" size="sm" className={compact ? "h-8 px-2" : "rounded-xl"} onClick={toggleTextSize} aria-pressed={largeText} aria-label="Alternar texto ampliado" title="Ampliar tamanho do texto">
        <Type className="h-4 w-4" />
        {!compact ? <span className="hidden lg:inline">Texto</span> : null}
      </Button>
    </div>
  );
}
