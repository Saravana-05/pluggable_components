import { useDroppable } from '@dnd-kit/core'
import { useStore } from '../store/designerStore'
import { CanvasItem } from './CanvasItem'
import { useEffect } from 'react'

export function Canvas({ loader }: any) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' })

  const page = useStore((s: any) =>
    s.pages.find((p: any) => p.id === s.currentPageId)
  )

    useEffect(() => {
  console.log('All registered keys:', Object.keys(loader.registry))
  console.log('All meta keys:', Object.keys(loader.meta))
  console.log('StatCard component:', loader.get('StatCard'))
  console.log('StatCard meta:', loader.getMeta('StatCard'))
}, [loader])

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: isOver ? 'rgba(228, 228, 228, 0.06)' : '#1e2028',
        backgroundImage: 'radial-gradient(circle, #2a2d3a 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundRepeat: 'repeat',
        backgroundPosition: '0 0',
        backgroundAttachment: 'scroll',
        backgroundClip: 'border-box',
        backgroundOrigin: 'padding-box',
        transition: 'background-color 0.15s',
      }}
    >
      {!page && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#4b5563', fontSize: 14,
        }}>
          No page selected
        </div>
      )}

      {page?.nodes.map((n: any) => (
        <CanvasItem key={n.id} node={n} loader={loader} />
      ))}

      {page?.nodes.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#374151', fontSize: 14,
        }}>
          Drag components here
        </div>
      )}
    </div>
  )
}