import { useDraggable } from '@dnd-kit/core'
import { useMemo, memo } from 'react'
import { useNavigate }   from 'react-router-dom'
import { useStore }      from '../store/designerStore'

export function CanvasItem({ node, loader }: any) {
  const { setNodeRef, listeners, attributes, isDragging } =
    useDraggable({ id: node.id })

  const select   = useStore((s: any) => s.select)
  const selected = useStore((s: any) => s.selected)
  const navigate = useNavigate()

  const Comp = useMemo(() => {
    const component = loader.get(node.type)
    return component ? memo(component) : null
  }, [node.type, loader])

  const meta = useMemo(() => {
    const raw = loader.getMeta(node.type)
    return raw?.config ?? raw
  }, [node.type, loader])

  if (!Comp) return (
    <div style={{
      padding:      12,
      border:       '1px dashed #ef4444',
      color:        '#ef4444',
      fontSize:     12,
      borderRadius: 6,
      background:   'rgba(239,68,68,0.08)',
    }}>
      Unknown component: <strong>{node.type}</strong>
    </div>
  )

  const isSelected = selected === node.id

  function getAction(trigger: string) {
    if (node.actions?.[trigger]) return node.actions[trigger]
    return meta?.actions?.find((a: any) => a.trigger === trigger) ?? null
  }

  function executeAction(action: any) {
    if (!action) return
    switch (action.type) {
      case 'redirect':
        action.target === '_blank'
          ? window.open(action.url, '_blank')
          : navigate(action.url)
        break
      case 'emit':
        window.dispatchEvent(new CustomEvent(action.event, { detail: { node } }))
        break
      case 'custom':
        action.handler?.(node)
        break
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        position:      'absolute',
        left:          node.x,
        top:           node.y,
        opacity:       isDragging ? 0.4 : 1,
        outline:       isSelected ? '2px solid #6366f1' : '2px solid transparent',
        outlineOffset: 3,
        borderRadius:  4,
        width:         node.props?.width  ?? 'max-content',
        height:        node.props?.height ?? 'auto',
        overflow:      'hidden',
      }}
      onClick={(e) => {
        e.stopPropagation()
        select(node.id)
      }}
    >
      {/* Drag handle — only this area moves the canvas node */}
      <div
        {...listeners}
        {...attributes}
        style={{
          position:    'absolute',
          top:         -18,
          left:        0,
          height:      18,
          width:       '100%',
          cursor:      'grab',
          background:  isSelected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
          borderRadius: '4px 4px 0 0',
          display:     'flex',
          alignItems:  'center',
          paddingLeft: 8,
          fontSize:    10,
          color:       '#6b7280',
          userSelect:  'none',
        }}
      >
        ⠿ {node.type}
      </div>

      {/* Component renders freely — pointer events untouched */}
      <Comp {...node.props} nodeId={node.id} />
    </div>
  )
}