import { SidebarItem } from "./SidebarItem";

/**
 * Sidebar
 *
 * Props:
 *  - containers : array of container objects  — to compute blocking logic
 */
export function Sidebar({ containers }) {
  // A card type is blocked only if every container is locked to the OTHER type
  // (i.e. no container can accept this type)
  const canAccept = (type) =>
    containers.length === 0 ||
    containers.some((c) => !c.lockedType || c.lockedType === type);

  return (
    <aside className="w-44 flex-shrink-0 bg-[#1e1b4b] rounded-l-2xl flex flex-col gap-2 p-3">
      <p className="text-[10px] font-medium text-indigo-400 uppercase tracking-widest px-1 pb-1">
        Components
      </p>

      {/* List Container tile */}
      <SidebarItem
        type="container"
        label="List Container"
        description="Drag to canvas"
        colorClass="bg-[#312e81] border-[#4338ca]"
      />

      <div className="h-px bg-[#312e81] my-1" />

      {/* Card type tiles */}
      <SidebarItem
        type="campaigns"
        label="Active Campaigns"
        description="Progress tracker"
        blocked={!canAccept("campaigns")}
        colorClass="bg-[#1e3a5f] border-[#1d4ed8]"
      />

      <SidebarItem
        type="tasks"
        label="Upcoming Tasks"
        description="Task list"
        blocked={!canAccept("tasks")}
        colorClass="bg-[#1a3a2a] border-[#15803d]"
      />

      <SidebarItem
        type="employees"
        label="Employee List"
        description="People directory"
        blocked={!canAccept("employees")}
        colorClass="bg-[#2e1a47] border-[#7c3aed]"
      />

      <div className="mt-auto pt-3 border-t border-[#312e81]">
        <p className="text-[9px] text-indigo-600 text-center leading-relaxed">
          Drag a container to canvas first, then drag cards into it
        </p>
      </div>
    </aside>
  );
}