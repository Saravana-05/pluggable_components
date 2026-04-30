import { useEffect } from "react";
import { useLangStore } from "../store/languageStore";
import { loadTranslation } from "./loader";

export const useTranslation = (module = "common") => {
  const { languages, translations, addTranslation } = useLangStore();

  useEffect(() => {
    languages.forEach(async (lang) => {
      if (!translations[module]?.[lang]) {
        const data = await loadTranslation(module, lang);
        addTranslation(module, lang, data);
      }
    });
  }, [languages, module]);

  const t = (key) => {
    return languages.map((lang) => ({
      lang,
      value:
        translations[module]?.[lang]?.[key] ||
        translations[module]?.["en"]?.[key] ||
        key
    }));
  };

  return { t, languages };
};
