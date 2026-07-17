"use client";

import React, { useState } from "react";
import { useDashboardData } from "../../lib/hooks/useDashboardData";
import { useAllCompanyStatuses } from "../../lib/hooks/useCompanyStatus";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { StatusView } from "../../components/status/StatusView";
import type { CompanyData } from "../../components/companies/CompanyCard";

export default function StatusPage() {
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
              updatedAt: new Date(r.created_at || Date.now()).toLocaleDateString()
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

  const mergedCompanies = companies; // No longer need override logic

  return (
    <main className="h-screen w-full flex overflow-hidden bg-[#f5eedb] dark:bg-[#0d0b09] transition-colors duration-300 font-sans">
      <Sidebar
        user={user}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      <div className="flex-1 h-full overflow-y-auto p-6 md:p-8 transition-all duration-300 bg-[#f5eedb] dark:bg-[#0d0b09]">
        <StatusView companies={mergedCompanies} />
      </div>
    </main>
  );
}
