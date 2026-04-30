const PRIORITY_DOT = {
  high: "bg-red-400",
  medium: "bg-orange-400",
  low: "bg-slate-300",
};

/**
 * UpcomingTasksCard
 *
 * Props:
 *  - name     : string
 *  - person   : string
 *  - date     : string   (e.g. "13/03")
 *  - priority : "high" | "medium" | "low"
 */
export function UpcomingTasksCard({ name, person, date, priority = "medium" }) {
  return (
    <div className="flex items-center justify-between px-3.5 py-3 border-b border-emerald-50 last:border-b-0 gap-3">
      <div className="flex items-start gap-2 min-w-0">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 mt-[3px] ${PRIORITY_DOT[priority]}`}
        />
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-emerald-900 truncate">{name}</p>
          <p className="text-[10px] text-emerald-400 mt-0.5">{person}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 text-[10px] text-emerald-400">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" strokeLinecap="round" />
        </svg>
        {date}
      </div>
    </div>
  );
}