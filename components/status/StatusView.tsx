import React, { useState } from "react";
import { type CompanyData } from "../companies/CompanyCard";
import { SelectDropdown } from "../ui/SelectDropdown";
import * as xlsx from "xlsx";

export function StatusView({ companies }: { companies: CompanyData[] }) {
  const [selectedSource, setSelectedSource] = useState("All Records");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");

  // Derive filter options
  const allSources = ["All Records", ...Array.from(new Set(companies.map(c => c.source).filter(Boolean)))];
  const allIndustries = ["All Industries", ...Array.from(new Set(companies.flatMap(c => c.industries)))];
  const allCountries = ["All Countries", ...Array.from(new Set(companies.map(c => c.country)))];

  // Apply filters
  const filteredCompanies = companies.filter(c => {
    const matchSource = selectedSource === "All Records" || c.source === selectedSource;
    const matchIndustry = selectedIndustry === "All Industries" || c.industries.includes(selectedIndustry);
    const matchCountry = selectedCountry === "All Countries" || c.country === selectedCountry;
    return matchSource && matchIndustry && matchCountry;
  });

  // Sort by status: Pending -> Accepted -> Rejected
  const statusOrder: Record<string, number> = { "Pending": 1, "Accepted": 2, "Rejected": 3 };
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    const orderA = a.status ? statusOrder[a.status] : 4;
    const orderB = b.status ? statusOrder[b.status] : 4;
    return orderA - orderB;
  });

  // Derived Stats
  const totalCount = filteredCompanies.length;
  const acceptedCount = filteredCompanies.filter(c => c.status === "Accepted").length;
  const pendingCount = filteredCompanies.filter(c => c.status === "Pending").length;
  const rejectedCount = filteredCompanies.filter(c => c.status === "Rejected").length;

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Accepted": return "text-[#046241] bg-[#046241]/10 border-[#046241]/20";
      case "Pending": return "text-[#b45309] bg-[#b45309]/10 border-[#b45309]/20";
      case "Rejected": return "text-red-600 bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800";
      default: return "text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700";
    }
  };

  const getIconColor = (status?: string) => {
    switch (status) {
      case "Accepted": return "bg-[#046241]";
      case "Pending": return "bg-[#ffb347]";
      case "Rejected": return "bg-red-600";
      default: return "bg-gray-400";
    }
  };

  const handleExport = () => {
    const wb = xlsx.utils.book_new();

    const groupedData: Record<string, CompanyData[]> = {};
    sortedCompanies.forEach(company => {
      const sourceName = company.source || "Unknown Source";
      if (!groupedData[sourceName]) {
        groupedData[sourceName] = [];
      }
      groupedData[sourceName].push(company);
    });

    Object.keys(groupedData).forEach(sourceName => {
      const companiesInSource = groupedData[sourceName];
      
      const exportData = companiesInSource.map(c => ({
        "Company Name": c.name,
        "Contact Person": c.contactPerson || "Not Provided",
        "Contact Number": c.contactNumber || "Not Provided",
        "Industry": c.industries.join(", "),
        "Country": c.country,
        "Status": c.status || "Unknown",
        "Joined/Updated": c.updatedAt || "N/A",
        "LinkedIn": c.linkedin || "",
        "Website": c.website || ""
      }));

      const ws = xlsx.utils.json_to_sheet(exportData);
      const safeSheetName = sourceName.replace(/[\\/*?:[\]]/g, "").substring(0, 31);
      
      xlsx.utils.book_append_sheet(wb, ws, safeSheetName);
    });
    
    if (Object.keys(groupedData).length === 0) {
      const ws = xlsx.utils.json_to_sheet([{ Message: "No records found matching filters." }]);
      xlsx.utils.book_append_sheet(wb, ws, "Empty");
    }

    xlsx.writeFile(wb, "LifeLeads_Status_Export.xlsx");
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-1">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#133020] via-[#046241] to-[#b45309] dark:from-[#4ade80] dark:via-[#2dd4bf] dark:to-[#ffb347]">
              Status
            </span>
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Applicant overview · {totalCount} of {companies.length} companies
          </p>
        </div>
        
        {/* Export Data Button */}
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#ffb347] hover:bg-[#ffa726] text-[#133020] font-bold rounded-xl shadow-md shadow-[#ffb347]/20 transition-all hover:scale-105 active:scale-95 self-start md:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "TOTAL", count: totalCount, color: "text-[#046241] dark:text-[#4ade80]" },
          { label: "ACCEPTED", count: acceptedCount, color: "text-[#046241] dark:text-[#2dd4bf]" },
          { label: "REJECTED", count: rejectedCount, color: "text-red-500 dark:text-red-400" },
          { label: "PENDING", count: pendingCount, color: "text-[#ffb347] dark:text-[#ffb347]" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-[#14120e] border border-gray-100 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
            <span className={`text-3xl font-black ${stat.color}`}>{stat.count}</span>
            <span className="text-[10px] font-bold text-gray-400 tracking-widest mt-1">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Filters (Excel -> Industry -> Country) */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-3 bg-white dark:bg-[#14120e] p-3 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-2">Filters</span>
        
        <SelectDropdown
          value={selectedSource}
          onChange={setSelectedSource}
          options={allSources.map(s => ({ label: String(s), value: String(s) }))}
          className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-gray-100 dark:border-white/5 hover:border-[#ffb347] dark:hover:border-[#ffb347] transition-all bg-white dark:bg-[#1c2419] text-[#133020] dark:text-white min-w-[160px]"
          dropdownClassName="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#14120e] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden"
          optionClassName="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          activeOptionClassName="w-full text-left px-4 py-2.5 text-sm font-bold bg-[#046241]/5 dark:bg-[#ffb347]/10 text-[#046241] dark:text-[#ffb347]"
        />

        <SelectDropdown
          value={selectedIndustry}
          onChange={setSelectedIndustry}
          options={allIndustries.map(i => ({ label: String(i), value: String(i) }))}
          className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-gray-100 dark:border-white/5 hover:border-[#ffb347] dark:hover:border-[#ffb347] transition-all bg-white dark:bg-[#1c2419] text-[#133020] dark:text-white min-w-[160px]"
          dropdownClassName="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#14120e] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden"
          optionClassName="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          activeOptionClassName="w-full text-left px-4 py-2.5 text-sm font-bold bg-[#046241]/5 dark:bg-[#ffb347]/10 text-[#046241] dark:text-[#ffb347]"
        />

        <SelectDropdown
          value={selectedCountry}
          onChange={setSelectedCountry}
          options={allCountries.map(c => ({ label: String(c), value: String(c) }))}
          className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-gray-100 dark:border-white/5 hover:border-[#ffb347] dark:hover:border-[#ffb347] transition-all bg-white dark:bg-[#1c2419] text-[#133020] dark:text-white min-w-[160px]"
          dropdownClassName="absolute top-full right-0 mt-2 w-[200px] bg-white dark:bg-[#14120e] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden"
          optionClassName="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          activeOptionClassName="w-full text-left px-4 py-2.5 text-sm font-bold bg-[#046241]/5 dark:bg-[#ffb347]/10 text-[#046241] dark:text-[#ffb347]"
        />
      </div>

      {/* List Table */}
      <div className="flex-1 bg-white dark:bg-[#14120e] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_100px] gap-4 items-center px-6 py-4 bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <div className="w-10"></div> {/* Spacer for icon */}
          <div>Name</div>
          <div>Industry / Country</div>
          <div>Status</div>
          <div className="text-right">Joined</div>
        </div>

        {/* Table Rows */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {sortedCompanies.length > 0 ? (
            sortedCompanies.map((company, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_1fr_1fr_100px] gap-4 items-center px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-white/10">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner flex-shrink-0 ${getIconColor(company.status)}`}>
                  {getInitials(company.name)}
                </div>

                {/* Name & Contact */}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-[#133020] dark:text-white truncate">{company.name}</span>
                  <span className="text-[11px] font-medium text-gray-400 truncate">{company.contactPerson || "No Contact"}</span>
                </div>

                {/* Industry / Country */}
                <div className="flex flex-col gap-1.5 items-start">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800">
                    {company.industries[0] || "Unknown"}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    {company.country}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(company.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${company.status === 'Accepted' ? 'bg-[#046241]' : company.status === 'Pending' ? 'bg-[#b45309]' : 'bg-red-500'}`} />
                    {company.status || "Unknown"}
                  </span>
                </div>

                {/* Date */}
                <div className="text-right text-[11px] font-semibold text-gray-400 whitespace-nowrap">
                  {company.updatedAt || "N/A"}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <span className="text-sm font-semibold">No records match the current filters.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
