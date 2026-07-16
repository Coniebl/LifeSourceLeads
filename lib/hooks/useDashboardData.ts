import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase/client";

export type DashboardUser = { email: string; name: string };

export type CountryData = {
  count: number;
  percentage: string;
  color: string;
  hex: string;
  breakdown: Record<string, number>;
};

export function getStoredUser(): DashboardUser | null {
  if (typeof window === "undefined") return null;
  try {
    const storedUser = localStorage.getItem("lifelead-user");
    return storedUser ? JSON.parse(storedUser) as DashboardUser : null;
  } catch {
    return null;
  }
}

export function useDashboardData() {
  const router = useRouter();
  const [user] = useState<DashboardUser | null>(getStoredUser);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  
  const [stats, setStats] = useState({
    totalCompanies: 0,
    acceptedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    totalLeads: 0,
    totalCountries: 0,
    totalIndustries: 0,
    acceptedOfferCount: 0,
  });

  const [countriesData, setCountriesData] = useState<Record<string, CountryData>>({});

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    const fetchSupabaseData = async () => {
      try {
        const [contactsResult, industriesResult] = await Promise.all([
          supabase.from("company_contacts").select("company_name, country"),
          supabase.from("company_industries").select("company_name, original_industry_input, general_industry_type, subcategory"),
        ]);

        if (contactsResult.error || industriesResult.error) {
          console.warn(
            "Supabase error loading data:",
            contactsResult.error?.message || industriesResult.error?.message
          );
          return;
        }

        const contacts = contactsResult.data ?? [];
        const industries = industriesResult.data ?? [];
        const companies = new Map<string, { country: string; industries: Set<string>; leads: number }>();

        const getCompany = (companyName: string) => {
          const name = companyName.trim();
          if (!companies.has(name)) {
            companies.set(name, { country: "Unknown", industries: new Set<string>(), leads: 0 });
          }
          return companies.get(name)!;
        };

        contacts.forEach((contact) => {
          if (!contact.company_name?.trim()) return;
          const company = getCompany(contact.company_name);
          company.leads += 1;
          if (contact.country?.trim()) company.country = contact.country.trim();
        });

        industries.forEach((industryRow) => {
          if (!industryRow.company_name?.trim()) return;
          const company = getCompany(industryRow.company_name);
          const industry =
            industryRow.general_industry_type?.trim() ||
            industryRow.subcategory?.trim() ||
            industryRow.original_industry_input?.trim();
          if (industry) company.industries.add(industry);
        });

        if (companies.size === 0) return;

        const total = companies.size;
        const leadsSum = contacts.length;
        const uniqueCountries = new Set<string>();
        const uniqueIndustries = new Set<string>();

        const countryMap: Record<string, { count: number; breakdown: Record<string, number> }> = {};

        companies.forEach((company) => {
          const country = company.country;
          uniqueCountries.add(country);
          company.industries.forEach((industry) => uniqueIndustries.add(industry));

          if (!countryMap[country]) {
            countryMap[country] = { count: 0, breakdown: {} };
          }
            
          countryMap[country].count++;
          company.industries.forEach((industry) => {
            countryMap[country].breakdown[industry] = (countryMap[country].breakdown[industry] || 0) + 1;
          });
        });

        setStats({
          totalCompanies: total,
          acceptedCount: 0,
          pendingCount: 0,
          rejectedCount: 0,
          totalLeads: leadsSum,
          totalCountries: uniqueCountries.size,
          totalIndustries: uniqueIndustries.size,
          acceptedOfferCount: 0,
        });

        const colors = [
          { bg: "bg-[#046241]", hex: "#046241" },
          { bg: "bg-[#ffb347]", hex: "#ffb347" },
          { bg: "bg-[#133020]", hex: "#133020" },
          { bg: "bg-[#ffc370]", hex: "#ffc370" },
        ];

        const formattedCountries: Record<string, CountryData> = {};
        Object.entries(countryMap).forEach(([cName, cData], idx) => {
          const colorObj = colors[idx % colors.length];
          formattedCountries[cName] = {
            count: cData.count,
            percentage: `${Math.round((cData.count / total) * 100)}%`,
            color: colorObj.bg,
            hex: colorObj.hex,
            breakdown: cData.breakdown
          };
        });

        setCountriesData(formattedCountries);
      } catch (err) {
        console.error("Connection failed: defaulting to zero-value dashboard.", err);
      }
    };

    fetchSupabaseData();
  }, [router, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("lifelead-user");
    router.push("/");
  };

  return {
    user,
    stats,
    countriesData,
    isDarkMode,
    setIsDarkMode,
    activeTab,
    setActiveTab,
    handleLogout,
  };
}
