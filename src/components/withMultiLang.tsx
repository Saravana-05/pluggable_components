import { useEffect } from 'react'
import { useLangStore } from '../store/languageStore'
import { loadTranslation } from '../i18n/loader'

export function withMultiLang<P extends object>(
  Component: React.ComponentType<P>,
  module: string,
  propMap: Record<string, string>
) {
  return function MLComponent(props: P & Record<string, any>) {
    const { languages, langOrder, translations, addTranslation } = useLangStore()

    // Load translations for all active languages
    useEffect(() => {
      languages.forEach(async (lang) => {
        if (!translations[module]?.[lang]) {
          const data = await loadTranslation(module, lang)
          addTranslation(module, lang, data)
        }
      })
    }, [languages.join(','), module])

    // Resolve key → "English / தமிழ்" in langOrder order
    const resolve = (key: string): string =>
      langOrder
        .filter(lang => languages.includes(lang))
        .map(lang =>
          translations[module]?.[lang]?.[key] ||
          translations[module]?.['en']?.[key] ||
          key
        )
        .filter(Boolean)
        .join(' / ')

    // ── Resolve top-level props ────────────────────────────────────────────
    const resolved: Record<string, any> = {}

    Object.entries(propMap).forEach(([keyProp, targetProp]) => {
      if (props[keyProp]) {
        resolved[targetProp] = resolve(props[keyProp])
      }
    })

    // ── Resolve props inside cards array ──────────────────────────────────
    if (props.cards && Array.isArray(props.cards)) {
      resolved.cards = props.cards.map((card: any) => {
        const resolvedCard = { ...card }
        Object.entries(propMap).forEach(([keyProp, targetProp]) => {
          if (card[keyProp]) {
            resolvedCard[targetProp] = resolve(card[keyProp])
            delete resolvedCard[keyProp]
          }
        })
        return resolvedCard
      })
    }

    // ── Strip *Key props before passing down ──────────────────────────────
    const cleanProps = { ...props }
    Object.keys(propMap).forEach(k => delete cleanProps[k])

    return <Component {...cleanProps as P} {...resolved} />
  }
}