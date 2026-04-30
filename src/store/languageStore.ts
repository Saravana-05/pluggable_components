import { create } from "zustand";

export const useLangStore = create((set) => ({
  languages: ["en"],       // ← change this to whatever languages you want active
  langOrder: ["en"],       // ← controls display order in card labels

  translations: {},

  setLanguages: (langs) =>
    set((state) => {
      const preserved = state.langOrder.filter((c) => langs.includes(c));
      const added = langs.filter((c) => !state.langOrder.includes(c));
      return {
        languages: langs,
        langOrder: [...preserved, ...added],
      };
    }),

  setLangOrder: (order) => set({ langOrder: order }),

  addTranslation: (module, lang, data) =>
    set((state) => ({
      translations: {
        ...state.translations,
        [module]: {
          ...(state.translations[module] || {}),
          [lang]: data,
        },
      },
    })),
}));
