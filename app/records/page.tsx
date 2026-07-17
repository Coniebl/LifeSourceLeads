"use client";

import React, { useState, useEffect, useRef } from "react";
import * as xlsx from "xlsx";
import { supabase } from "../../lib/supabase/client";
import { useDashboardData } from "../../lib/hooks/useDashboardData";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { RecordsTable, type RecordData } from "../../components/records/RecordsTable";
import { CompletedFilesModal } from "../../components/records/CompletedFilesModal";
import { CustomSelect } from "../../components/ui/CustomSelect";

export default function RecordsPage() {
  const {
    user,
    isDarkMode,
    setIsDarkMode,
    activeTab,
    setActiveTab,
    handleLogout,
  } = useDashboardData();

  const [records, setRecords] = useState<RecordData[]>([]);
  const [completedFiles, setCompletedFiles] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState("All Files");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRecords = async () => {
    // Fetch from company_contacts instead of records
    const { data, error } = await supabase.from('company_contacts').select('*').order('id', { ascending: false });
    if (data && !error) {
      const formatted = data.map((r: any) => ({
        id: r.id.toString(),
        companyName: r.company_name,
        country: r.country,
        industry: r.industries, // Using industries from company_contacts
        contactPerson: r.contact_person,
        email: r.contact_email,
        phone: r.contact_mobile || r.contact_telephone,
        status: r.status || "Pending",
        dateAdded: new Date().toISOString().split('T')[0], // company_contacts doesn't have date_added, using current date or fallback
        website: r.company_website || "",
        linkedin: r.company_linkedin || "",
        sourceFile: r.source_file,
      }));
      setRecords(formatted);
    }
  };

  useEffect(() => {
    fetchRecords();
    const handleUpdate = () => fetchRecords();
    window.addEventListener('companyStatusUpdated', handleUpdate);
    return () => window.removeEventListener('companyStatusUpdated', handleUpdate);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = xlsx.read(bstr, { type: "binary" });
        
        const wsIndustry = wb.Sheets["Industry"];
        const wsCompanyDetails = wb.Sheets["Company Details"];
        
        let industryRows: any[] = [];
        if (wsIndustry) {
          const industryData = xlsx.utils.sheet_to_json(wsIndustry);
          industryRows = industryData.map((row: any) => ({
            company_name: row["Company Name"] || "",
            original_industry_input: row["Original Industry Input"] || "",
            general_industry_type: row["General Industry Type"] || "",
            subcategory: row["Subcategory"] || ""
          })).filter((row: any) => row.company_name);
        }

        let contactRows: any[] = [];
        if (wsCompanyDetails) {
          const contactData = xlsx.utils.sheet_to_json(wsCompanyDetails);
          contactRows = contactData.map((row: any) => ({
            company_name: row["Company Name"] || "",
            contact_person: row["Contact Person"] || "",
            designation: row["Designation"] || "",
            contact_mobile: String(row["Contact (Mobile)"] || ""),
            contact_telephone: String(row["Contact (Telephone)"] || ""),
            contact_fax: String(row["Contact (Fax)"] || ""),
            contact_direct_line: String(row["Contact (Direct Line)"] || ""),
            contact_email: row["Contact Email"] || "",
            office_location: row["Office location"] || "",
            country: row["Country"] || "",
            company_website: row["Company Website"] || "",
            company_linkedin: row["Company LinkedIn"] || "",
            industries: row["Industries"] || "",
            status: "Pending",
          })).filter((row: any) => row.company_name);
        }
        
        if (contactRows.length > 0) {
          const { error: contactError } = await supabase.from('company_contacts').insert(contactRows);
          if (contactError) {
            console.error("Error inserting contacts:", contactError.message, contactError.details, contactError.hint);
            alert(`Failed to import company details: ${contactError.message}`);
            return;
          }
        }

        if (industryRows.length > 0) {
          const { error: indError } = await supabase.from('company_industries').upsert(industryRows);
          if (indError) {
            console.error("Error inserting industries:", indError.message, indError.details, indError.hint);
            alert(`Failed to import industries: ${indError.message}`);
            return;
          }
        }

        // If we reached here, both (or whichever were uploaded) succeeded
        if (contactRows.length > 0 || industryRows.length > 0) {
          fetchRecords();
        } else {
          alert("No valid data found in 'Industry' or 'Company Details' sheets.");
        }
      } catch (err) {
        console.error("Failed to parse Excel:", err);
        alert("Invalid Excel file. Ensure it has 'Industry' and 'Company Details' sheets.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const mergedRecords = records;

  const availableFiles = Array.from(new Set(mergedRecords.map((r) => r.sourceFile)));

  const formattedDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Filter records based on search query, selected file, and NOT being from a completed file
  const filteredRecords = mergedRecords.filter((r) => {
    const isCompleted = completedFiles.includes(r.sourceFile);
    if (isCompleted) return false;

    const matchesSearch =
      r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.status.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFile = selectedFile === "All Files" || r.sourceFile === selectedFile;

    return matchesSearch && matchesFile;
  });

  const statusOrder: Record<string, number> = { "Pending": 1, "Accepted": 2, "Rejected": 3 };
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const orderA = a.status ? statusOrder[a.status] : 4;
    const orderB = b.status ? statusOrder[b.status] : 4;
    return orderA - orderB;
  });

  const handleMarkAsComplete = () => {
    if (selectedFile !== "All Files" && !completedFiles.includes(selectedFile)) {
      setCompletedFiles([...completedFiles, selectedFile]);
      // Reset filter since we just completed it
      setSelectedFile("All Files");
    } else {
      alert("Please select a specific Excel file from the dropdown to mark as complete.");
    }
  };

  const handleDeleteCompletedFiles = async (filesToDelete: string[]) => {
    // Delete from both new tables
    await supabase.from('company_industries').delete().in('company_name', records.filter(r => filesToDelete.includes(r.sourceFile)).map(r => r.companyName));
    const { error } = await supabase.from('company_contacts').delete().in('source_file', filesToDelete);
    
    if (!error) {
      setCompletedFiles(completedFiles.filter(f => !filesToDelete.includes(f)));
      fetchRecords();
    } else {
      console.error("Failed to delete files from database:", error.message);
      alert("Failed to delete records from the database.");
    }
    setIsModalOpen(false);
  };

  return (
    <main className="h-screen w-full flex overflow-hidden bg-[#f5eedb] dark:bg-[#0d0b09] transition-colors duration-300 font-sans">
      
      {/* Left Navigation Bar */}
      <Sidebar
        user={user}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        activeTab="Records"
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      {/* Right Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto p-6 md:p-8 transition-all duration-300 bg-[#f5eedb] dark:bg-[#0d0b09]">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#046241]/10 dark:bg-[#ffb347]/10 text-[10px] font-bold uppercase tracking-widest text-[#046241] dark:text-[#ffb347] mb-2.5 border border-[#046241]/20 dark:border-[#ffb347]/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#046241] dark:bg-[#ffb347] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#046241] dark:bg-[#ffb347]"></span>
              </span>
              Database • Live
            </div>

            {/* Main Title */}
            <h1 className="text-[32px] md:text-4xl font-black tracking-tight mb-1">
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#133020] via-[#046241] to-[#b45309] dark:from-[#4ade80] dark:via-[#2dd4bf] dark:to-[#ffb347]">
                Records Manager
              </span>
            </h1>

            {/* Subtitle / Date */}
            <p className="text-xs md:text-sm font-medium text-[#046241]/70 dark:text-gray-400 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#046241]/50 dark:text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formattedDate()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-0">

            {/* Hidden File Input */}
            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            {/* Import Excel button */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#046241] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#046241]/20 hover:scale-105 transition-transform disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              {isImporting ? "Importing..." : "Import Excel"}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full mb-4">
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
              placeholder="Search by company, country, contact, status..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#181512] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#046241] dark:focus:ring-[#ffb347] transition-all placeholder-gray-400"
            />
          </div>

          <div className="relative w-full md:w-64">
            <CustomSelect
              options={["All Files", ...availableFiles]}
              value={selectedFile}
              onChange={setSelectedFile}
            />
          </div>
        </div>

        {/* Record count indicator and Actions */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] text-gray-400 font-medium">
            Showing <span className="font-bold text-[#133020] dark:text-gray-200">{filteredRecords.length}</span> records
          </p>

          <div className="flex items-center gap-4">
            {/* Mark as complete icon */}
            <div className="relative group">
              <button 
                onClick={handleMarkAsComplete}
                className="relative p-2.5 bg-white dark:bg-white/5 border border-gray-200/60 dark:border-white/10 rounded-xl text-[#046241] dark:text-[#4ade80] shadow-[0_2px_10px_-3px_rgba(4,98,65,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(4,98,65,0.3)] hover:-translate-y-0.5 hover:bg-gradient-to-br hover:from-white hover:to-gray-50 dark:hover:from-white/10 dark:hover:to-white/5 transition-all duration-300"
                aria-label="Mark as complete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </button>
              
              {/* Premium Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-[#1A1612]/95 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold rounded-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap pointer-events-none z-10 shadow-xl flex flex-col items-center">
                Mark as complete
                {/* Tooltip Arrow */}
                <div className="absolute top-full w-2 h-2 bg-[#1A1612]/95 border-b border-r border-white/10 rotate-45 -translate-y-1"></div>
              </div>
            </div>
            
            {/* Completed Files icon */}
            <div className="relative group">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="relative p-2.5 bg-white dark:bg-white/5 border border-gray-200/60 dark:border-white/10 rounded-xl text-[#133020] dark:text-gray-200 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 hover:bg-gradient-to-br hover:from-white hover:to-gray-50 dark:hover:from-white/10 dark:hover:to-white/5 transition-all duration-300"
                aria-label="Completed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                {completedFiles.length > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-md ring-2 ring-white dark:ring-[#0d0b09] scale-in-center">
                    {completedFiles.length}
                  </span>
                )}
              </button>
              
              {/* Premium Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-[#1A1612]/95 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold rounded-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap pointer-events-none z-10 shadow-xl flex flex-col items-center">
                Completed Files
                {/* Tooltip Arrow */}
                <div className="absolute top-full w-2 h-2 bg-[#1A1612]/95 border-b border-r border-white/10 rotate-45 -translate-y-1"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <RecordsTable records={sortedRecords} />

      </div>

      {isModalOpen && (
        <CompletedFilesModal
          completedFiles={completedFiles}
          onClose={() => setIsModalOpen(false)}
          onDeleteFiles={handleDeleteCompletedFiles}
        />
      )}
    </main>
  );
}
