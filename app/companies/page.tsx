"use client";

import React, { useState, Suspense } from "react";
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
      const { data, error } = await supabase.from('company_contacts').select('*');
      if (data && !error) {
        const companyMap = new Map<string, CompanyData>();
        data.forEach((r: any) => {
          const name = r.company_name;
          if (!name) return;
          
          if (!companyMap.has(name)) {
            let inds: string[] = [];
            if (r.industries) {
               inds = r.industries.split(',').map((s: string) => s.trim());
            }

            companyMap.set(name, {
              name,
              country: r.country || "Unknown",
              industries: inds,
              leads: 1,
              contactPerson: r.contact_person,
              contactNumber: r.contact_mobile || r.contact_telephone,
              linkedin: r.company_linkedin,
              website: r.company_website,
              source: r.source_file,
              status: r.status || "Pending",
              updatedAt: new Date().toLocaleDateString()
            });
          } else {
             const c = companyMap.get(name)!;
             c.leads += 1;
             if (r.industries) {
                const inds = r.industries.split(',').map((s: string) => s.trim());
                inds.forEach((ind: string) => {
                   if (!c.industries.includes(ind)) c.industries.push(ind);
                });
             }
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
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading companies...</div>}>
          <CompaniesView companies={companies} setCompanies={setCompanies} />
        </Suspense>
      </div>

    </main>
  );
}
