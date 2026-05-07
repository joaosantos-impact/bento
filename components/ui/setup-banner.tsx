"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { hasOpenRouterKey } from "@/lib/storage/settings";

// Persistent banner. Visible while OpenRouter key is missing.
export function SetupBanner() {
  const pathname = usePathname();
  const [missing, setMissing] = useState<boolean | null>(null);

  useEffect(() => {
    function check() {
      setMissing(!hasOpenRouterKey());
    }
    check();
    function onStorage(e: StorageEvent) {
      if (e.key?.startsWith("bento.settings")) check();
    }
    window.addEventListener("storage", onStorage);
    // Re-check whenever the user returns to the tab.
    function onFocus() {
      check();
    }
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  if (missing !== true) return null;
  if (pathname === "/settings") return null;
  return (
    <div className="border-b border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-2.5 text-sm">
        <span>
          Sem chave OpenRouter configurada. As funcionalidades de IA (gerar texto, distribuir input,
          analisar fotos) ficam desactivadas.
        </span>
        <Link
          href="/settings"
          className="shrink-0 rounded-md border border-amber-400 bg-white px-3 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-900 dark:text-amber-50 dark:hover:bg-amber-800"
        >
          Configurar agora
        </Link>
      </div>
    </div>
  );
}
