import { useDrag } from "../context/DragContext";

/**
 * SidebarItem
 * A draggable tile in the left sidebar.
 *
 * Props:
 *  - type        : "container" | "campaigns" | "tasks"
 *  - label       : string
 *  - description : string
 *  - blocked     : boolean  — dims the item when it can't be used
 *  - colorClass  : tailwind bg/border classes for the tile
 */
export function SidebarItem({ type, label, description, blocked = false, colorClass }) {
  const { setDragPayload } = useDrag();

  return (
    <div
      draggable={!blocked}
      onDragStart={(e) => {
        if (blocked) { e.preventDefault(); return; }
        setDragPayload({ type });
        e.dataTransfer.effectAllowed = "copy";
      }}
      onDragEnd={() => setDragPayload(null)}
      className={`
        px-3 py-2.5 rounded-xl border cursor-grab select-none transition-all
        ${colorClass}
        ${blocked ? "opacity-30 cursor-not-allowed" : "hover:brightness-110 active:cursor-grabbing"}
      `}
    >
      <p className="text-xs font-medium text-indigo-100">{label}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{description}</p>
      {!blocked && (
        <p className="text-[9px] text-indigo-400 mt-1">↳ drag to drop</p>
      )}
    </div>
  );
}