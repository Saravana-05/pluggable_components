/**
 * Designer.tsx
 */

import { useRef, useState } from 'react'
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Canvas }           from './Canvas'
import { ComponentSidebar } from './Sidebar'
import { PropertiesPanel }  from './PropertiesPanel'
import { useStore }         from '../store/designerStore'
import { useLangStore }     from '../store/languageStore'
import { loadTranslation }  from '../i18n/loader'

// ─── Available languages ──────────────────────────────────────────────────────

const ALL_LANGS = [
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

const ALL_MODULES = ['statcard', 'cardx', 'buttonx']

// ─── Global Language Selector ─────────────────────────────────────────────────

function GlobalLangSelector() {
  const { languages, langOrder, setLanguages, setLangOrder, addTranslation, translations } = useLangStore()
  const [open, setOpen]         = useState(false)
  const [dragSrc, setDragSrc]   = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const toggle = async (code: string) => {
    if (languages.includes(code)) {
      if (languages.length > 1) setLanguages(languages.filter(l => l !== code))
    } else {
      await Promise.all(
        ALL_MODULES.map(async (mod) => {
          if (!translations[mod]?.[code]) {
            const data = await loadTranslation(mod, code)
            addTranslation(mod, code, data)
          }
        })
      )
      setLanguages([...languages, code])
    }
  }

  const handleDrop = (targetCode: string) => {
    if (!dragSrc || dragSrc === targetCode) return
    const next = [...langOrder]
    const from = next.indexOf(dragSrc)
    const to   = next.indexOf(targetCode)
    next.splice(from, 1)
    next.splice(to, 0, dragSrc)
    setLangOrder(next)
    setDragSrc(null)
    setDragOver(null)
  }

  const selectedLabels = langOrder
    .filter(c => languages.includes(c))
    .map(c => ALL_LANGS.find(l => l.code === c)?.label)
    .filter(Boolean)
    .join(', ')

  const unselected = ALL_LANGS.filter(l => !languages.includes(l.code))

  return (
    <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 50 }}>

      {/* Trigger */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          6,
          padding:      '5px 10px',
          background:   '#1a1c2e',
          border:       '1px solid #2e3148',
          borderRadius: 6,
          color:        '#e5e7eb',
          fontSize:     12,
          cursor:       'pointer',
          whiteSpace:   'nowrap',
          boxShadow:    '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        🌐 {selectedLabels}
        <span style={{
          fontSize:   9,
          color:      '#6b7280',
          display:    'inline-block',
          transform:  open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}>▼</span>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 49 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position:     'absolute',
            top:          'calc(100% + 4px)',
            right:        0,
            background:   '#1a1c2e',
            border:       '1px solid #2e3148',
            borderRadius: 8,
            minWidth:     180,
            zIndex:       50,
            overflow:     'hidden',
            boxShadow:    '0 8px 24px rgba(0,0,0,0.5)',
          }}>

            {/* Selected — draggable */}
            {langOrder.filter(c => languages.includes(c)).map(code => {
              const lang = ALL_LANGS.find(l => l.code === code)
              if (!lang) return null
              return (
                <div
                  key={code}
                  draggable
                  onDragStart={() => setDragSrc(code)}
                  onDragOver={e => { e.preventDefault(); setDragOver(code) }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={() => handleDrop(code)}
                  onDragEnd={() => { setDragSrc(null); setDragOver(null) }}
                  style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          8,
                    padding:      '8px 12px',
                    background:   dragOver === code ? '#2a2d45' : '#1e2240',
                    borderBottom: '1px solid #2e3148',
                    cursor:       'grab',
                    fontSize:     12,
                    color:        '#e5e7eb',
                  }}
                >
                  <span style={{ color: '#4b5563' }}>⠿</span>
                  <span style={{ flex: 1 }}>{lang.label}</span>
                  <span style={{ color: '#4ade80', fontSize: 11 }}>✓</span>
                  <span
                    onClick={e => { e.stopPropagation(); toggle(code) }}
                    style={{ color: '#f87171', fontSize: 14, cursor: 'pointer' }}
                  >×</span>
                </div>
              )
            })}

            {unselected.length > 0 && (
              <div style={{ borderTop: '1px solid #2e3148' }} />
            )}

            {/* Unselected */}
            {unselected.map(({ code, label }) => (
              <div
                key={code}
                onClick={() => toggle(code)}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          8,
                  padding:      '8px 12px',
                  background:   '#13141f',
                  borderBottom: '1px solid #1e2130',
                  cursor:       'pointer',
                  fontSize:     12,
                  color:        '#6b7280',
                }}
              >
                <span style={{ color: '#2e3148' }}>⠿</span>
                <span style={{ flex: 1 }}>{label}</span>
                <span style={{ color: '#374151', fontSize: 14 }}>+</span>
              </div>
            ))}

          </div>
        </>
      )}
    </div>
  )
}

// ─── Designer ─────────────────────────────────────────────────────────────────

interface DesignerProps {
  loader: {
    getComponent: (type: string) => any
    getMeta:      (type: string) => any
    getAllMeta:    () => any[]
  }
}

export function Designer({ loader }: DesignerProps) {
  const canvasRef  = useRef<HTMLDivElement>(null)
  const addNode    = useStore((s) => s.addNode)
  const moveNode   = useStore((s) => s.moveNode)
  const select     = useStore((s) => s.select)
  const selected   = useStore((s) => s.selected)
  const [panelOpen, setPanelOpen] = useState(true)
  const prevSelected = useRef<string | null>(null)

  // Auto-open panel when a new node is selected
  if (selected && selected !== prevSelected.current) {
    setPanelOpen(true)
  }
  prevSelected.current = selected ?? null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  function onDragEnd(event: DragEndEvent) {
    const { active, over, delta } = event

    // ── Drop a preset from the sidebar onto the canvas ──────────────────────
    if (
      over?.id === 'canvas' &&
      typeof active.id === 'string' &&
      active.id.startsWith('preset::')
    ) {
      const { componentType, preset } = active.data.current as {
        componentType: string
        preset: {
          defaultProps:    Record<string, any>
          defaultActions?: Record<string, any>
        }
      }

      const canvasRect   = canvasRef.current?.getBoundingClientRect()
      const pointerEvent = event.activatorEvent as PointerEvent

      // ── FIXED DROP POSITION ──────────────────────────────────────────────
      // Use over.rect — dnd-kit gives us the exact bounding rect of the
      // canvas droppable, which is more reliable than canvasRef.getBoundingClientRect()
      // because it matches exactly what dnd-kit tracks internally.
      //
      // pointerEvent.clientX/Y = viewport position when drag STARTED
      // delta.x/y              = total movement during drag
      // → pointerEvent.clientX + delta.x = viewport position at DROP
      // → subtract canvas left/top to get canvas-relative coords

      const canvasLeft = over.rect?.left ?? canvasRect?.left ?? 0
      const canvasTop  = over.rect?.top  ?? canvasRect?.top  ?? 0

      const dropX = pointerEvent.clientX + delta.x - canvasLeft
      const dropY = pointerEvent.clientY + delta.y - canvasTop

      // Clamp so the node never drops outside the visible canvas area
      const x = Math.max(0, dropX)
      const y = Math.max(0, dropY)

      addNode(componentType, preset, { x, y })
      return
    }

    // ── Move an existing node that's already on the canvas ──────────────────
    if (over?.id === 'canvas') {
      const nodeId = active.id as string
      const store  = useStore.getState()
      const page   = store.pages.find((p) => p.id === store.currentPageId)
      const node   = page?.nodes.find((n) => n.id === nodeId)
      if (!node) return
      moveNode(nodeId, node.x + delta.x, node.y + delta.y)
    }
  }

  function onDragStart() {
    select(null)
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div style={{
        display:    'flex',
        width:      '100vw',
        height:     '100vh',
        overflow:   'hidden',
        background: '#0d0e17',
      }}>
        <ComponentSidebar loader={loader} />

        {/* Canvas area — language selector lives here top-right */}
        <div ref={canvasRef} style={{ flex: 1, position: 'relative' }}>
          <GlobalLangSelector />
          <Canvas loader={loader} />
        </div>

        {/* Properties panel — collapsible */}
        {panelOpen ? (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {/* Close button */}
            <button
              onClick={() => setPanelOpen(false)}
              title="Close panel"
              style={{
                position:     'absolute',
                top:          10,
                right:        10,
                zIndex:       10,
                width:        22,
                height:       22,
                borderRadius: '50%',
                border:       '1px solid #2e3148',
                background:   '#1a1c2e',
                color:        '#6b7280',
                fontSize:     14,
                lineHeight:   '1',
                cursor:       'pointer',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                padding:      0,
              }}
            >×</button>
            <PropertiesPanel loader={loader} />
          </div>
        ) : (
          /* Collapsed tab to reopen */
          <button
            onClick={() => setPanelOpen(true)}
            title="Open properties"
            style={{
              width:          24,
              flexShrink:     0,
              background:     '#13141f',
              borderLeft:     '1px solid #1e2130',
              border:         'none',
              color:          '#4b5563',
              cursor:         'pointer',
              fontSize:       11,
              writingMode:    'vertical-rl',
              letterSpacing:  '0.05em',
              padding:        '12px 0',
            }}
          >
            Properties ▸
          </button>
        )}
      </div>
    </DndContext>
  )
}