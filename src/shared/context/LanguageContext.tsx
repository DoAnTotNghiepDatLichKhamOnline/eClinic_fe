import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Bilingual, Lang } from "@/types/i18n";

interface LanguageContextValue {
  lang: Lang;
  toggleLanguage: () => void;
  /** Pick the active-language string out of a Bilingual value. */
  t: (copy: Bilingual) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() =>
    localStorage.getItem("eclinic_language") === "vi" ? "vi" : "en",
  );

  const toggleLanguage = () => {
    setLang((previous) => {
      const next = previous === "en" ? "vi" : "en";
      localStorage.setItem("eclinic_language", next);
      return next;
    });
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      toggleLanguage,
      t: (copy) => copy[lang],
    }),
    [lang],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
