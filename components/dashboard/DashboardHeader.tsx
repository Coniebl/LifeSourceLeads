import React from "react";

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedFile: string;
  setSelectedFile: (val: string) => void;
}

export function DashboardHeader({
  searchQuery,
  setSearchQuery,
  selectedFile,
  setSelectedFile,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full mb-6">
      {/* Search Bar */}
      <div className="relative w-full flex-1">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search companies, countries, industries..."
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#181512] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#046241] dark:focus:ring-[#ffb347] transition-all placeholder-gray-400"
        />
      </div>

      {/* Dropdown Filter */}
      <div className="relative w-full md:w-64">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-[#046241] dark:text-[#ffb347]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <select
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
          className="w-full pl-10 pr-8 py-3 bg-white dark:bg-[#181512] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-[#046241] dark:focus:ring-[#ffb347] transition-all cursor-pointer"
        >
          <option value="All Files">All Files</option>
          <option value="Excel 1">Excel 1</option>
          <option value="Excel 2">Excel 2</option>
          <option value="Excel 3">Excel 3</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
