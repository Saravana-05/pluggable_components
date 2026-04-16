// labels/registry.ts
export const LABEL_REGISTRY = {
  StatCard: {
    vsPrev:      { en: 'vs prev',      ta: 'முந்தையதுடன்', hi: 'बनाम पिछला', fr: 'vs préc.',    ar: 'مقابل السابق', de: 'vs. Vorper.', es: 'vs anterior', zh: '较上期', ja: '前期比' },
    progress:    { en: 'Progress',     ta: 'முன்னேற்றம்',   hi: 'प्रगति',      fr: 'Progression', ar: 'التقدم',       de: 'Fortschritt', es: 'Progreso',    zh: '进度',  ja: '進捗'  },
    of:          { en: 'of',           ta: '/',             hi: '/',           fr: 'de',          ar: 'من',           de: 'von',          es: 'de',          zh: '/',     ja: '/'    },
    targetLabel: { en: 'Target',       ta: 'இலக்கு',        hi: 'लक्ष्य',       fr: 'Objectif',    ar: 'الهدف',        de: 'Ziel',         es: 'Meta',        zh: '目标',  ja: '目標'  },
  },
  ComponentSidebar: {
    heading:      { en: 'Components',  ta: 'கூறுகள்',       hi: 'घटक',         fr: 'Composants',  ar: 'المكوّنات',    de: 'Komponenten',  es: 'Componentes', zh: '组件',  ja: 'コンポーネント' },
    emptyState:   { en: 'No components loaded.', ta: 'கூறுகள் ஏதும் இல்லை.', hi: 'कोई घटक नहीं।', fr: 'Aucun composant.', ar: 'لا مكوّنات.', de: 'Keine Komponenten.', es: 'Sin componentes.', zh: '无组件。', ja: 'なし。' },
    categoryOther:{ en: 'Other',       ta: 'மற்றவை',        hi: 'अन्य',         fr: 'Autre',       ar: 'أخرى',         de: 'Sonstiges',    es: 'Otro',        zh: '其他',  ja: 'その他' },
  },
  PresetTile: {
    dragHint:    { en: 'Drag to canvas', ta: 'கேன்வாஸில் இழுக்கவும்', hi: 'कैनवास पर खींचें', fr: 'Glisser sur le canvas', ar: 'اسحب إلى اللوحة', de: 'Auf Canvas ziehen', es: 'Arrastrar al lienzo', zh: '拖到画布', ja: 'キャンバスへ' },
    trendUp:     { en: '↑ up',         ta: '↑ அதிகம்',      hi: '↑ ऊपर',        fr: '↑ hausse',    ar: '↑ ارتفاع',     de: '↑ aufwärts',   es: '↑ subida',    zh: '↑ 升',  ja: '↑ 上昇' },
    trendDown:   { en: '↓ down',       ta: '↓ குறைவு',      hi: '↓ नीचे',       fr: '↓ baisse',    ar: '↓ انخفاض',     de: '↓ abwärts',    es: '↓ bajada',    zh: '↓ 降',  ja: '↓ 下降' },
  },
} as const

export type SupportedLang = 'en' | 'ta' | 'hi' | 'fr' | 'ar' | 'de' | 'es' | 'zh' | 'ja'
export type ComponentId = keyof typeof LABEL_REGISTRY