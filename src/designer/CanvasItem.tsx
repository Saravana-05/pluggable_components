import { useDraggable } from '@dnd-kit/core'
import { useMemo, memo } from 'react'
import { useNavigate }   from 'react-router-dom'
import { useStore }      from '../store/designerStore'

function unwrap(m: any): any {
  if (m == null) return m
  if (typeof m === 'object' && (m as any)[Symbol.toStringTag] === 'Module') {
    const d = m.default
    if (d != null && typeof d === 'object' && (d as any)[Symbol.toStringTag] === 'Module')
      return d.default ?? d
    return d ?? m
  }
  return m
}

export function CanvasItem({ node, loader }: any) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id: node.id })
  const select   = useStore((s: any) => s.select)
  const selected = useStore((s: any) => s.selected)
  const navigate = useNavigate()

  const Comp = useMemo(() => {
    const resolved = unwrap(loader.get(node.type))
    const fn = typeof resolved === 'function' ? resolved : null
    return fn ? memo(fn) : null
  }, [node.type, loader])

  const meta = useMemo(() => unwrap(loader.getMeta(node.type)), [node.type, loader])

  if (!Comp) return (
    <div style={{ padding: 12, border: '1px dashed #ef4444', color: '#ef4444', fontSize: 12, borderRadius: 6, background: 'rgba(239,68,68,0.08)' }}>
      Unknown: <strong>{node.type}</strong>
    </div>
  )

  function getAction(trigger: string) {
    return node.actions?.[trigger] ?? meta?.actions?.find((a: any) => a.trigger === trigger) ?? null
  }
  function executeAction(action: any) {
    if (!action) return
    if (action.type === 'redirect') { action.target === '_blank' ? window.open(action.url, '_blank') : navigate(action.url) }
    else if (action.type === 'emit') { window.dispatchEvent(new CustomEvent(action.event, { detail: { node } })) }
    else if (action.type === 'custom') { action.handler?.(node) }
  }

  function handleLanguageChange(evt: { prev: string; next: string; labels: Record<string, string> }) {
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { nodeId: node.id, nodeType: node.type, ...evt } }))
    const action = getAction('onLanguageChange')
    if (action) executeAction(action)
  }

  const iconClickAction = getAction('iconClick')

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={{
      position: 'absolute', left: node.x, top: node.y,
      opacity: isDragging ? 0.4 : 1,
      outline: selected === node.id ? '2px solid #6366f1' : '2px solid transparent',
      outlineOffset: 3, borderRadius: 4, cursor: 'grab', userSelect: 'none',
    }}>
      <div onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); select(node.id) }}>
        <Comp {...node.props} onLanguageChange={handleLanguageChange} />
      </div>
      {meta?.ui?.canvasIcon && (
        <div style={{ marginTop: 4, textAlign: 'center', pointerEvents: iconClickAction ? 'auto' : 'none', cursor: iconClickAction ? 'pointer' : 'default' }}
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); if (iconClickAction) executeAction(iconClickAction) }}>
          <img src={meta.ui.canvasIcon} alt="" style={{ width: 20, height: 20, opacity: 0.5 }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
        </div>
      )}
    </div>
  )
}