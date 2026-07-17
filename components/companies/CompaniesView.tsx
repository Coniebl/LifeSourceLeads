import React, { useState, useRef, useEffect } from "react";
import { CompanyCard, type CompanyData } from "./CompanyCard";
import { SelectDropdown } from "../ui/SelectDropdown";
import { useCompanyStatus } from "../../lib/hooks/useCompanyStatus";
import * as xlsx from "xlsx";

export function CompaniesView({ companies, setCompanies }: { companies: CompanyData[], setCompanies: React.Dispatch<React.SetStateAction<CompanyData[]>> }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [selectedSource, setSelectedSource] = useState("All Records");
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);

  const { status, setStatus } = useCompanyStatus(selectedCompany?.name || "");

  const allIndustries = ["All Industries", ...Array.from(new Set(companies.flatMap(c => c.industries)))];
  const allCountries = ["All Countries", ...Array.from(new Set(companies.map(c => c.country)))];
  const allSources = ["All Records", ...Array.from(new Set(companies.map(c => c.source).filter(s => s && s !== "Unknown")))] as string[];

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === "All Industries" || c.industries.includes(selectedIndustry);
    const matchesCountry = selectedCountry === "All Countries" || c.country === selectedCountry;
    const matchesSource = selectedSource === "All Records" || (c.source || "Unknown") === selectedSource;
    return matchesSearch && matchesIndustry && matchesCountry && matchesSource;
  });

  return (
    <div className="flex flex-col gap-6 w-full h-full animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
        <div>
          <h1 className="text-[32px] md:text-4xl font-black tracking-tight mb-1">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#133020] via-[#046241] to-[#b45309] dark:from-[#4ade80] dark:via-[#2dd4bf] dark:to-[#ffb347]">
              Companies
            </span>
          </h1>
          <p className="text-sm font-medium text-[#046241]/70 dark:text-gray-400">
            {filteredCompanies.length} of {companies.length} companies
          </p>
        </div>
      </div>

      {/* Unified Search and Filters Bar */}
      <div className="flex flex-col xl:flex-row items-center gap-4 bg-white dark:bg-[#1a1714] rounded-2xl border border-gray-100 dark:border-white/5 shadow-[0_4px_20px_-10px_rgba(4,98,65,0.1)] p-2 w-full">
        
        {/* Search Bar */}
        <div className="relative flex-1 w-full min-w-[200px]">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-full pl-12 pr-4 py-3 bg-transparent text-sm font-semibold text-[#133020] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#046241] dark:focus:ring-[#ffb347] rounded-xl transition-all"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-1 items-center w-full gap-3 xl:pl-4 xl:border-l border-gray-100 dark:border-white/10 overflow-x-auto pb-1 xl:pb-0">
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hidden xl:block flex-shrink-0">Filters</span>
          
          <SelectDropdown
            value={selectedSource}
            onChange={setSelectedSource}
            options={allSources.map(s => ({ label: s, value: s }))}
            icon={
              <svg className="w-4 h-4 text-[#046241] dark:text-[#ffb347] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            }
            className="w-full flex-1 flex items-center justify-between gap-2 px-4 py-3 bg-[#046241]/5 dark:bg-white/5 hover:bg-[#046241]/10 dark:hover:bg-white/10 focus:ring-2 focus:ring-[#046241] dark:focus:ring-[#ffb347] focus:outline-none rounded-xl transition-all text-sm font-bold text-[#046241] dark:text-[#ffb347]"
            dropdownClassName="absolute top-full mt-2 left-0 w-full min-w-[200px] bg-white dark:bg-[#1a1714] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            optionClassName="w-full text-left px-4 py-2.5 text-sm font-medium text-[#133020] dark:text-gray-300 hover:bg-[#f5eedb] dark:hover:bg-[#133020] transition-colors"
            activeOptionClassName="w-full text-left px-4 py-2.5 text-sm font-bold bg-[#046241]/10 dark:bg-[#046241]/30 text-[#046241] dark:text-[#ffb347] transition-colors"
          />

          <SelectDropdown
            value={selectedIndustry}
            onChange={setSelectedIndustry}
            options={allIndustries.map(i => ({ label: i, value: i }))}
            icon={
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
            }
            className="w-full flex-1 flex items-center justify-between gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 focus:ring-2 focus:ring-[#046241] dark:focus:ring-[#ffb347] focus:outline-none rounded-xl transition-all text-sm font-semibold text-gray-700 dark:text-gray-200"
            dropdownClassName="absolute top-full mt-2 left-0 w-full min-w-[200px] bg-white dark:bg-[#1a1714] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            optionClassName="w-full text-left px-4 py-2.5 text-sm font-medium text-[#133020] dark:text-gray-300 hover:bg-[#f5eedb] dark:hover:bg-[#133020] transition-colors"
            activeOptionClassName="w-full text-left px-4 py-2.5 text-sm font-bold bg-[#046241]/10 dark:bg-[#046241]/30 text-[#046241] dark:text-[#ffb347] transition-colors"
          />
          
          <SelectDropdown
            value={selectedCountry}
            onChange={setSelectedCountry}
            options={allCountries.map(c => ({ label: c, value: c }))}
            icon={
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            }
            className="w-full flex-1 flex items-center justify-between gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 focus:ring-2 focus:ring-[#046241] dark:focus:ring-[#ffb347] focus:outline-none rounded-xl transition-all text-sm font-semibold text-gray-700 dark:text-gray-200"
            dropdownClassName="absolute top-full mt-2 left-0 w-full min-w-[200px] bg-white dark:bg-[#1a1714] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            optionClassName="w-full text-left px-4 py-2.5 text-sm font-medium text-[#133020] dark:text-gray-300 hover:bg-[#f5eedb] dark:hover:bg-[#133020] transition-colors"
            activeOptionClassName="w-full text-left px-4 py-2.5 text-sm font-bold bg-[#046241]/10 dark:bg-[#046241]/30 text-[#046241] dark:text-[#ffb347] transition-colors"
          />
        </div>
      </div>

      {/* Grid Content */}
      {filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
          {filteredCompanies.map((company, idx) => (
            <CompanyCard key={idx} company={company} onClick={() => setSelectedCompany(company)} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 mt-4 bg-white/50 dark:bg-[#1a1714]/50 border border-dashed border-[#046241]/20 dark:border-white/10 rounded-3xl">
          <div className="w-16 h-16 bg-[#f5eedb] dark:bg-[#133020] rounded-full flex items-center justify-center mb-4 shadow-sm border border-[#046241]/20 dark:border-[#ffb347]/20">
            <svg className="w-8 h-8 text-[#046241] dark:text-[#ffb347]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#133020] dark:text-white mb-2">No Companies Found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
            {companies.length === 0 
              ? "Your database is empty. Import Excel data to populate the companies list and visualize it." 
              : "No companies match your search criteria. Try adjusting your filters."}
          </p>
        </div>
      )}
      
      {/* Slide-in Details Drawer Backdrop */}
      {selectedCompany && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity" 
          onClick={() => setSelectedCompany(null)} 
        />
      )}

      {/* Slide-in Details Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[400px] bg-white dark:bg-[#14120e] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-100 dark:border-white/5 flex flex-col ${selectedCompany ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedCompany && (
          <div className="flex flex-col h-full relative overflow-y-auto">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedCompany(null)} 
              className="absolute top-6 right-6 p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-8 flex flex-col items-center mt-4">
              {/* Company Icon (Top Center) */}
              <div className="w-24 h-24 rounded-2xl bg-[#046241] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-[#046241]/20 mb-6">
                {selectedCompany.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
              </div>

              {/* Company Name */}
              <h2 className="text-2xl font-black text-[#133020] dark:text-white mb-2 text-center">
                {selectedCompany.name}
              </h2>

              {/* Countries */}
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                <svg className="w-4 h-4 text-[#ffb347]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                {selectedCompany.country}
              </div>

              {/* Industry Type */}
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {selectedCompany.industries.map(ind => (
                  <span key={ind} className="px-4 py-1.5 rounded-full bg-[#046241]/10 dark:bg-[#046241]/30 text-xs font-bold text-[#046241] dark:text-[#4ade80] uppercase tracking-wider">
                    {ind}
                  </span>
                ))}
              </div>

              {/* Details List */}
              <div className="w-full space-y-6 pt-6 border-t border-gray-100 dark:border-white/5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Person</label>
                  <div className="flex items-center gap-3 text-[#133020] dark:text-white font-medium">
                    <svg className="w-5 h-5 text-[#046241]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    {selectedCompany.contactPerson || "Not Provided"}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Number</label>
                  <div className="flex items-center gap-3 text-[#133020] dark:text-white font-medium">
                    <svg className="w-5 h-5 text-[#046241]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.25-3.95-6.847-6.847l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    {selectedCompany.contactNumber || "Not Provided"}
                  </div>
                </div>

                {/* Social / Web Links */}
                <div className="flex items-center gap-4 pt-6">
                  {selectedCompany.linkedin && (
                    <a href={selectedCompany.linkedin} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#0a66c2]/10 hover:bg-[#0a66c2]/20 text-[#0a66c2] dark:text-[#60a5fa] py-3 rounded-xl font-bold transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                  {selectedCompany.website && (
                    <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                      </svg>
                      Website
                    </a>
                  )}
                </div>

                {/* Status Actions */}
                <div className="flex items-center gap-4 pt-4 pb-6">
                  <button 
                    onClick={() => setStatus("Accepted")}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl font-bold transition-all border-2 ${
                      status === "Accepted" 
                        ? "bg-[#133020] text-[#ffb347] border-[#133020] dark:bg-[#046241] dark:border-[#046241] shadow-lg shadow-[#133020]/20 scale-105" 
                        : "bg-transparent text-[#133020] border-[#133020]/20 hover:border-[#133020] hover:bg-[#133020]/5 dark:text-gray-300 dark:border-gray-600 dark:hover:border-[#ffb347] dark:hover:text-[#ffb347]"
                    }`}
                  >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Accepted Offer
                  </button>
                  <button 
                    onClick={() => setStatus("Rejected")}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl font-bold transition-all border-2 ${
                      status === "Rejected" 
                        ? "bg-[#ef4444] text-white border-[#ef4444] shadow-lg shadow-[#ef4444]/20 scale-105" 
                        : "bg-transparent text-[#ef4444] border-[#ef4444]/20 hover:border-[#ef4444] hover:bg-[#ef4444]/5 dark:border-[#ef4444]/40"
                    }`}
                  >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Rejected Offer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
