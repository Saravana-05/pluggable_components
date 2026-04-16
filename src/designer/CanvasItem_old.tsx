import { useDraggable } from '@dnd-kit/core'
import { useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/designerStore_old'

export function CanvasItem({ node, loader }: any) {
  const { setNodeRef, listeners, attributes, isDragging } =
    useDraggable({ id: node.id })

  const select = useStore((s: any) => s.select)
  const selected = useStore((s: any) => s.selected)
  const navigate = useNavigate()

  const Comp = useMemo(() => {
    const component = loader.getComponent(node.type)
    return component ? memo(component) : null
  }, [node.type, loader])

  const meta = useMemo(() => loader.getMeta(node.type), [node.type, loader])

  if (!Comp) return null

  const isSelected = selected === node.id

  const iconClickAction = meta?.actions?.find(
    (a: any) => a.trigger === 'iconClick'
  )

  function executeAction(action: any) {
    if (!action) return
    switch (action.type) {
      case 'redirect':
        if (action.target === '_blank') {
          window.open(action.url, '_blank')
        } else {
          navigate(action.url)
        }
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
      {...listeners}
      {...attributes}
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        opacity: isDragging ? 0.4 : 1,
        outline: isSelected ? '2px solid #6366f1' : '2px solid transparent',
        outlineOffset: 3,
        borderRadius: 4,
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      {/* Component — click to select */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          select(node.id)
        }}
      >
        <Comp {...node.props} />
      </div>

      {/* Canvas icon — only show if canvasIcon exists and loads successfully */}
      {meta?.ui?.canvasIcon && (
        <div
          style={{
            marginTop: 4,
            textAlign: 'center',
            pointerEvents: iconClickAction ? 'auto' : 'none',
            cursor: iconClickAction ? 'pointer' : 'default',
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            if (!iconClickAction) return
            executeAction(iconClickAction)
          }}
        >
          <img
            src={meta.ui.canvasIcon}
            alt="icon"
            style={{ width: 20, height: 20, opacity: 0.5 }}
            onError={(e) => {
              // Hide broken image
              (e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}
    </div>
  )
}