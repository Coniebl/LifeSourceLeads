"use client";

import React, { useState } from "react";
import { useDashboardData } from "../../lib/hooks/useDashboardData";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { CompaniesView } from "../../components/companies/CompaniesView";
import { type CompanyData } from "../../components/companies/CompanyCard";

export default function CompaniesPage() {
  const {
    user,
    isDarkMode,
    setIsDarkMode,
    activeTab,
    setActiveTab,
    handleLogout,
  } = useDashboardData();

  // Mock data as placeholders for visualization when the DB is empty
  const placeholderCompanies = [
    { name: "TechNova Solutions", country: "US USA", industries: ["Technology"], leads: 24, contactPerson: "John Doe", contactNumber: "+1 555-0101", linkedin: "https://linkedin.com/company/technova", website: "https://technova.example.com", source: "Excel 1" },
    { name: "HealthFirst Corp", country: "CA Canada", industries: ["Healthcare"], leads: 18, contactPerson: "Jane Smith", contactNumber: "+1 555-0202", linkedin: "https://linkedin.com/company/healthfirst", website: "https://healthfirst.example.com", source: "Excel 1" },
    { name: "GreenBridge Ltd", country: "GB UK", industries: ["Renewables"], leads: 15, contactPerson: "Oliver Brown", contactNumber: "+44 20 7946 0958", linkedin: "https://linkedin.com/company/greenbridge", website: "https://greenbridge.example.com", source: "Excel 2" },
    { name: "Pacific Ventures", country: "PH Philippines", industries: ["Finance"], leads: 11, contactPerson: "Maria Garcia", contactNumber: "+63 2 8123 4567", linkedin: "https://linkedin.com/company/pacificventures", website: "https://pacificventures.example.com", source: "Excel 2" },
    { name: "Meridian Analytics", country: "US USA", industries: ["Data & AI"], leads: 20, contactPerson: "David Lee", contactNumber: "+1 555-0303", linkedin: "https://linkedin.com/company/meridiananalytics", website: "https://meridiananalytics.example.com", source: "Excel 3" },
    { name: "NovaBuild Inc", country: "CA Canada", industries: ["Construction"], leads: 9, contactPerson: "Sarah Wilson", contactNumber: "+1 555-0404", linkedin: "https://linkedin.com/company/novabuild", website: "https://novabuild.example.com", source: "Excel 3" },
    { name: "ClearPath Logistics", country: "GB UK", industries: ["Logistics"], leads: 13, contactPerson: "James Taylor", contactNumber: "+44 20 7946 0959", linkedin: "https://linkedin.com/company/clearpath", website: "https://clearpath.example.com", source: "Excel 1" },
    { name: "Solaris Energy", country: "US USA", industries: ["Renewables"], leads: 17, contactPerson: "Emily Davis", contactNumber: "+1 555-0505", linkedin: "https://linkedin.com/company/solaris", website: "https://solaris.example.com", source: "Excel 2" },
  ];

  const [companies, setCompanies] = useState<CompanyData[]>(placeholderCompanies);

  return (
    <main className="h-screen w-full flex overflow-hidden bg-[#f5eedb] dark:bg-[#0d0b09] transition-colors duration-300 font-sans">
      
      {/* Left Navigation Bar */}
      <Sidebar
        user={user}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        activeTab="Companies" // Always active on this route
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      {/* Right Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto p-6 md:p-8 transition-all duration-300 bg-[#f5eedb] dark:bg-[#0d0b09]">
        <CompaniesView companies={companies} setCompanies={setCompanies} />
      </div>

    </main>
  );
}
