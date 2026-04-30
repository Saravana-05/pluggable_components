export const loadTranslation = async (module, lang) => {
  try {
    const data = await import(`../translations/${module}/${lang}.json`);
    return data.default;
  } catch (e) {
    console.warn(`Missing translation: ${module}/${lang}`);
    return {};
  }
};
