import { useState, useRef, useEffect } from 'react'
import { useLangStore } from '../store/languageStore'
import './LanguageSelector.css'

const AVAILABLE_LANGS = [
  { code: 'en', label: 'English'  },
  { code: 'ta', label: 'Tamil'    },
  { code: 'hi', label: 'Hindi'    },
  { code: 'ar', label: 'Arabic'   },
  { code: 'fr', label: 'French'   },
  { code: 'de', label: 'German'   },
  { code: 'es', label: 'Spanish'  },
  { code: 'zh', label: 'Chinese'  },
  { code: 'ja', label: 'Japanese' },
]

export function LanguageSelector() {
  const { languages, setLanguages } = useLangStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // toggle: add if not selected, remove if already selected
  const toggle = (code: string) => {
    if (languages.includes(code)) {
      setLanguages(languages.filter(l => l !== code))
    } else {
      setLanguages([...languages, code])
    }
  }

  const triggerLabel = AVAILABLE_LANGS
    .filter(l => languages.includes(l.code))
    .map(l => l.label)
    .join(', ') || 'Select language'

  return (
    <div className="lang-selector-wrapper">
      <div ref={ref} className="lang-selector-anchor">

        <button
          className={`lang-trigger-btn ${open ? 'open' : ''}`}
          onClick={() => setOpen(prev => !prev)}
        >
          <span className="lang-trigger-icon">🌐</span>
          {triggerLabel}
          <span className="lang-trigger-chevron">▼</span>
        </button>

        {open && (
          <div className="lang-dropdown">
            {AVAILABLE_LANGS.map(({ code, label }) => {
              const isActive = languages.includes(code)
              return (
                <div
                  key={code}
                  className={`lang-option ${isActive ? 'selected' : ''}`}
                  onClick={() => toggle(code)}
                >
                  <span className="lang-drag-handle" style={{ visibility: 'hidden' }}>⠿</span>
                  <span className="lang-checkbox">
                    {isActive && <span className="lang-checkbox-tick">✓</span>}
                  </span>
                  {label}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}