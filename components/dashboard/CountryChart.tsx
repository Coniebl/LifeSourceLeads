import React, { useState } from "react";
import type { CountryData } from "../../lib/hooks/useDashboardData";

interface CountryChartProps {
  countriesData: Record<string, CountryData>;
}

export function CountryChart({ countriesData }: CountryChartProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  return (
    <div className="w-full bg-white dark:bg-[#181512] rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-white/5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-[#133020] dark:text-white">
            Companies per Country
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Hover a bar to see the industry breakdown
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs font-bold text-gray-500 dark:text-gray-400">
          {Object.entries(countriesData).map(([name, item]) => (
            <div key={name} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span>{name}</span>
              <span className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded-full text-[10px] font-black text-gray-400 dark:text-gray-300">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Visual Bar Chart Container */}
      {Object.keys(countriesData).length === 0 ? (
        <div className="w-full h-72 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center text-sm text-gray-400 dark:text-gray-500 gap-1.5 p-6 mb-8 select-none">
          <svg className="w-8 h-8 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-semibold text-[13px]">No database record found</span>
          <p className="text-xs text-gray-400 text-center max-w-[280px]">
            Add rows to <code className="bg-gray-100 dark:bg-white/5 px-1 py-0.5 rounded text-red-500 font-mono text-[10px]">company_contacts</code> and <code className="bg-gray-100 dark:bg-white/5 px-1 py-0.5 rounded text-red-500 font-mono text-[10px]">company_industries</code> in Supabase to populate.
          </p>
        </div>
      ) : (
        <>
          <div className="relative w-full h-72 border-b border-gray-100 dark:border-white/5 flex items-end justify-around px-4 md:px-12 select-none mb-8">
            {Object.entries(countriesData).map(([name, item]) => {
              // find maximum count to scale heights
              const maxVal = Math.max(...Object.values(countriesData).map(c => c.count), 8);
              const heightPercent = `${(item.count / maxVal) * 100}%`;
              const isHovered = hoveredCountry === name;

              return (
                <div
                  key={name}
                  className="relative flex flex-col items-center w-24 md:w-32 group cursor-pointer"
                  onMouseEnter={() => setHoveredCountry(name)}
                  onMouseLeave={() => setHoveredCountry(null)}
                >
                  {/* Interactive Tooltip Card on Hover */}
                  {isHovered && (
                    <div className="absolute bottom-full mb-3 bg-white dark:bg-[#1A1612] border border-gray-100 dark:border-white/5 shadow-xl rounded-2xl p-4 w-56 text-left z-20 transition-all">
                      <h4 className="text-xs font-extrabold text-[#133020] dark:text-[#ffb347] uppercase tracking-wider mb-2 border-b border-gray-100 dark:border-white/5 pb-1">
                        {name} Industries
                      </h4>
                      <div className="flex flex-col gap-1.5 text-xs text-gray-500 dark:text-gray-300">
                        {Object.entries(item.breakdown).map(([indName, indCount]) => (
                          <div key={indName} className="flex justify-between font-medium">
                            <span>{indName}</span>
                            <span className="font-extrabold text-[#133020] dark:text-white">{indCount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    style={{ height: heightPercent }}
                    className={`w-12 md:w-16 rounded-t-2xl transition-all duration-300 relative ${
                      isHovered
                        ? `${item.color} brightness-95 scale-x-105 shadow-[0_4px_15px_rgba(4,98,65,0.15)]`
                        : `${item.color} shadow-sm`
                    }`}
                  >
                    {/* Inner glowing hover effect */}
                    {isHovered && (
                      <div className="absolute inset-0 bg-white/10 rounded-t-2xl" />
                    )}
                  </div>

                  {/* Country Label */}
                  <span className="text-xs font-extrabold text-gray-400 dark:text-gray-400 mt-2.5 mb-1 tracking-wide">
                    {name}
                  </span>
                </div>
              );
            })}

            {/* Horizontal Gridlines (Visual helpers) */}
            <div className="absolute left-0 w-full h-0 border-t border-dashed border-gray-100 dark:border-white/5 top-[25%]" />
            <div className="absolute left-0 w-full h-0 border-t border-dashed border-gray-100 dark:border-white/5 top-[50%]" />
            <div className="absolute left-0 w-full h-0 border-t border-dashed border-gray-100 dark:border-white/5 top-[75%]" />
          </div>

          {/* Bottom stats indicators row */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-white/5 text-center">
            {Object.entries(countriesData).map(([name, item]) => (
              <div key={name} className="py-4 md:py-0 flex flex-col items-center">
                <span className={`h-1.5 w-8 rounded-full ${item.color} mb-2`} />
                <div className="text-2xl font-black text-[#133020] dark:text-white leading-none mb-0.5">
                  {item.count}
                </div>
                <div className="text-xs font-bold text-gray-500 dark:text-gray-400">{name}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{item.percentage} of portfolio</div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
