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

  const [companies, setCompanies] = useState<CompanyData[]>([]);

  React.useEffect(() => {
    const fetchCompanies = async () => {
      const { supabase } = await import("../../lib/supabase/client");
      const { data, error } = await supabase.from('records').select('*');
      if (data && !error) {
        const companyMap = new Map<string, CompanyData>();
        data.forEach((r: any) => {
          const name = r.company_name;
          if (!name) return;
          
          if (!companyMap.has(name)) {
            companyMap.set(name, {
              name,
              country: r.country || "Unknown",
              industries: r.industry ? [r.industry] : [],
              leads: 0,
              contactPerson: r.contact_person,
              contactNumber: r.phone,
              linkedin: r.linkedin,
              website: r.website,
              source: r.source_file,
              status: r.status || "Pending",
              updatedAt: new Date(r.date_added).toLocaleDateString()
            });
          }
          const c = companyMap.get(name)!;
          c.leads += 1;
          if (r.industry && !c.industries.includes(r.industry)) {
            c.industries.push(r.industry);
          }
        });
        setCompanies(Array.from(companyMap.values()));
      }
    };
    fetchCompanies();

    const handleUpdate = () => fetchCompanies();
    window.addEventListener('companyStatusUpdated', handleUpdate);
    return () => window.removeEventListener('companyStatusUpdated', handleUpdate);
  }, []);

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
