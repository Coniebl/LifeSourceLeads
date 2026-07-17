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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lifelead-theme") === "dark";
    }
    return false;
  });
  const [activeTab, setActiveTab] = useState("Dashboard");

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem("lifelead-theme", "dark");
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem("lifelead-theme", "light");
    }
  }, [isDarkMode]);

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
        const { data, error } = await supabase.from("records").select("company_name, country, industry, status");

        if (error) {
          console.warn("Supabase error loading data:", error.message);
          return;
        }

        const records = data ?? [];
        const companies = new Map<string, { country: string; industries: Set<string>; leads: number }>();
        
        let pendingCount = 0;
        let acceptedCount = 0;
        let rejectedCount = 0;

        records.forEach((record) => {
          if (!record.company_name?.trim()) return;
          const name = record.company_name.trim();

          if (!companies.has(name)) {
            companies.set(name, { 
              country: record.country?.trim() || "Unknown", 
              industries: new Set<string>(), 
              leads: 0 
            });
          }

          const company = companies.get(name)!;
          company.leads += 1;

          if (record.industry?.trim()) {
            company.industries.add(record.industry.trim());
          }

          if (record.status === "Pending") pendingCount++;
          else if (record.status === "Accepted") acceptedCount++;
          else if (record.status === "Rejected") rejectedCount++;
        });

        if (companies.size === 0) return;

        const total = companies.size;
        const leadsSum = records.length;
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
          acceptedCount,
          pendingCount,
          rejectedCount,
          totalLeads: leadsSum,
          totalCountries: uniqueCountries.size,
          totalIndustries: uniqueIndustries.size,
          acceptedOfferCount: acceptedCount, // Using accepted records as accepted offer count
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
