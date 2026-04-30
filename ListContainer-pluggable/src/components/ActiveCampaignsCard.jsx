/**
 * ActiveCampaignsCard
 *
 * Props:
 *  - name    : string
 *  - company : string
 *  - percent : number (0–100)
 */
export function ActiveCampaignsCard({ name, company, percent }) {
  return (
    <div className="flex items-center justify-between px-3.5 py-3 border-b border-blue-50 last:border-b-0 gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-blue-900 truncate">{name}</p>
        <p className="text-[10px] text-blue-400 mt-0.5 truncate">{company}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-20 h-[5px] bg-blue-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-[10px] font-medium text-blue-700 w-7 text-right">
          {percent}%
        </span>
      </div>
    </div>
  );
}