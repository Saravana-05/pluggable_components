// labels/useLabelBus.ts
import { useState, useEffect, useMemo } from 'react'
import { LabelBus } from './LabelBus'
import { LABEL_REGISTRY } from './registry'
import type { SupportedLang, ComponentId } from './registry'

export function useLabelBus<T extends ComponentId>(componentId: T) {
  const [lang, setLang] = useState<SupportedLang>(LabelBus.getLang())

  useEffect(() => {
    // Subscribe on mount, auto-unsubscribe on unmount
    return LabelBus.subscribe(setLang)
  }, [])

  const labels = useMemo(
    () => {
      const pack = LABEL_REGISTRY[componentId]
      return Object.fromEntries(
        Object.entries(pack).map(([key, translations]) => [
          key,
          (translations as Record<string, string>)[lang] ?? (translations as Record<string, string>)['en']
        ])
      ) as { [K in keyof typeof pack]: string }
    },
    [lang, componentId]
  )

  return { labels, lang }
}