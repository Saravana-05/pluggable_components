import { useState, useEffect, useCallback, useMemo } from 'react'

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * The universal i18n prop shape.
 * Keys = BCP-47 language codes (e.g. "en", "ta", "ar").
 * Values = a flat record of label keys → translated text.
 *
 * Every component defines its own label keys.
 * StatCard uses: label, unit, vsPrev, progress, of, targetLabel, trendLabel
 * A FormCard might use: title, submit, cancel, placeholder
 * Any component can invent any keys it needs.
 *
 * Example:
 * {
 *   "en": { "label": "Revenue", "unit": "USD" },
 *   "ta": { "label": "வருவாய்", "unit": "USD" }
 * }
 */
export type I18nMap = Record<string, Record<string, string>>

/** Payload emitted by onLanguageChange */
export interface LanguageChangeEvent {
  prev: string
  next: string
  labels: Record<string, string>
}

// ─── Safe locale validation ────────────────────────────────────────────────────

export function safeLocale(tag: string | undefined | null): string {
  if (!tag || typeof tag !== 'string') return 'en'
  const t = tag.trim()
  if (!/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(t)) return 'en'
  try { Intl.getCanonicalLocales(t); return t } catch { return 'en' }
}

// ─── The hook ──────────────────────────────────────────────────────────────────

interface UseI18nOptions {
  /** The i18n prop from the component */
  i18n?: I18nMap | null
  /** Controlled locale from parent — overrides internal state */
  activeLocale?: string
  /** Callback when language switches */
  onLanguageChange?: (event: LanguageChangeEvent) => void
  /** Fallback values for any label key when not found in i18n */
  fallback?: Record<string, string>
}

interface UseI18nReturn {
  /** Current active locale code (always a valid BCP-47 tag) */
  activeLocale: string
  /** All available language codes */
  langs: string[]
  /** Get a translated label by key. Returns fallback or key itself if missing. */
  t: (key: string) => string
  /** Full resolved label map for the active locale */
  labels: Record<string, string>
  /** Call this when the user picks a language (e.g. clicks a pill) */
  switchLang: (code: string) => void
  /** Whether RTL layout should be used */
  isRtl: boolean
}

export function useI18n({
  i18n,
  activeLocale: controlledLocale,
  onLanguageChange,
  fallback = {},
}: UseI18nOptions): UseI18nReturn {

  // Guard: ensure i18n is a plain object
  const safeI18n = useMemo(() => {
    if (i18n && typeof i18n === 'object' && !Array.isArray(i18n)) return i18n
    return undefined
  }, [i18n])

  // Available languages
  const langs = useMemo(
    () => (safeI18n ? Object.keys(safeI18n) : ['en']),
    [safeI18n]
  )

  const defaultLang = langs[0] ?? 'en'

  // Internal state
  const [internalLocale, setInternalLocale] = useState(
    controlledLocale ?? defaultLang
  )

  // Sync controlled prop
  useEffect(() => {
    if (controlledLocale !== undefined && controlledLocale !== internalLocale) {
      const prev = internalLocale
      setInternalLocale(controlledLocale)
      if (onLanguageChange) {
        const nextLabels = { ...fallback, ...safeI18n?.[controlledLocale] }
        onLanguageChange({ prev, next: controlledLocale, labels: nextLabels })
      }
    }
  }, [controlledLocale]) // eslint-disable-line react-hooks/exhaustive-deps

  // Validated locale
  const rawLocale = controlledLocale !== undefined ? controlledLocale : internalLocale
  const activeLocale = safeLocale(rawLocale)

  // Resolved labels for active locale: fallback merged with i18n values
  const labels = useMemo(
    () => ({ ...fallback, ...safeI18n?.[activeLocale] }),
    [fallback, safeI18n, activeLocale]
  )

  // Translation function
  const t = useCallback(
    (key: string): string => labels[key] ?? fallback[key] ?? key,
    [labels, fallback]
  )

  // Language switch handler
  const switchLang = useCallback(
    (next: string) => {
      if (next === activeLocale) return
      const prev = activeLocale

      if (controlledLocale === undefined) {
        setInternalLocale(next)
      }

      if (onLanguageChange) {
        const nextLabels = { ...fallback, ...safeI18n?.[next] }
        onLanguageChange({ prev, next, labels: nextLabels })
      }
    },
    [activeLocale, controlledLocale, safeI18n, fallback, onLanguageChange]
  )

  const isRtl = activeLocale === 'ar' || activeLocale === 'he'

  return { activeLocale, langs, t, labels, switchLang, isRtl }
}