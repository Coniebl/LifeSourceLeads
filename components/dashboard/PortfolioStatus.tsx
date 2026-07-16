import React from "react";

interface PortfolioStatusProps {
  stats: {
    totalCompanies: number;
    pendingCount: number;
    acceptedCount: number;
    rejectedCount: number;
  };
}

export function PortfolioStatus({ stats }: PortfolioStatusProps) {
  return (
    <div className="w-full bg-white dark:bg-[#181512] rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-white/5 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest">
          Leads Status Distribution
        </h2>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {stats.totalCompanies} {stats.totalCompanies === 1 ? "company" : "companies"}
        </span>
      </div>

      {/* Progress Distribution Bar */}
      <div className="w-full h-2.5 rounded-full flex overflow-hidden mb-6 bg-gray-100 dark:bg-white/10">
        {stats.totalCompanies > 0 ? (
          <>
            <div className="bg-[#ffb347] h-full" style={{ width: `${(stats.pendingCount / stats.totalCompanies) * 100}%` }} />
            <div className="bg-[#046241] h-full" style={{ width: `${(stats.acceptedCount / stats.totalCompanies) * 100}%` }} />
            <div className="bg-red-500 h-full" style={{ width: `${(stats.rejectedCount / stats.totalCompanies) * 100}%` }} />
          </>
        ) : (
          <div className="bg-gray-200 dark:bg-white/5 w-full h-full" />
        )}
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending Card */}
        <div className="bg-[#ffb347]/5 dark:bg-[#ffb347]/10 rounded-2xl p-4 border border-[#ffb347]/10 flex flex-col">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffb347]" />
            <span className="text-[13px] font-bold text-gray-500 dark:text-gray-400">Pending</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#ffb347]">
              {stats.totalCompanies > 0 ? `${Math.round((stats.pendingCount / stats.totalCompanies) * 100)}%` : "0%"}
            </span>
            <span className="text-sm font-semibold text-gray-400">{stats.pendingCount}</span>
          </div>
        </div>

        {/* Accepted Card */}
        <div className="bg-[#046241]/5 dark:bg-[#046241]/10 rounded-2xl p-4 border border-[#046241]/10 flex flex-col">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#046241]" />
            <span className="text-[13px] font-bold text-gray-500 dark:text-gray-400">Accepted</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#046241]">
              {stats.totalCompanies > 0 ? `${Math.round((stats.acceptedCount / stats.totalCompanies) * 100)}%` : "0%"}
            </span>
            <span className="text-sm font-semibold text-gray-400">{stats.acceptedCount}</span>
          </div>
        </div>

        {/* Rejected Card */}
        <div className="bg-red-500/5 dark:bg-red-500/10 rounded-2xl p-4 border border-red-500/10 flex flex-col">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-[13px] font-bold text-gray-500 dark:text-gray-400">Rejected</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-500">
              {stats.totalCompanies > 0 ? `${Math.round((stats.rejectedCount / stats.totalCompanies) * 100)}%` : "0%"}
            </span>
            <span className="text-sm font-semibold text-gray-400">{stats.rejectedCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
