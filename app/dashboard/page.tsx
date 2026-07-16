"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";

// Custom Logo Icon matching the 3D hexagon logo from the screenshots
function LogoIcon() {
  return (
    <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hexagon Outer Frame */}
      <polygon points="50,10 90,32 90,78 50,90 10,78 10,32" fill="url(#hex-gold-gradient)" />
      {/* Hexagon Inner Cut */}
      <polygon points="50,18 83,36 83,74 50,83 17,74 17,36" fill="#ffffff" className="dark:fill-[#133020]" />
      {/* Inner Central Emblem */}
      <polygon points="50,28 75,42 75,68 50,76 25,68 25,42" fill="#ffb347" />
      <defs>
        <linearGradient id="hex-gold-gradient" x1="10" y1="10" x2="90" y2="90">
          <stop offset="0%" stopColor="#ffc370" />
          <stop offset="50%" stopColor="#ffb347" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dashboard Stats State (defaults to zero value)
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

  // Country Distribution State (defaults to empty)
  const [countriesData, setCountriesData] = useState<Record<string, {
    count: number;
    percentage: string;
    color: string;
    hex: string;
    breakdown: Record<string, number>;
  }>>({});

  // Sync Class-based Theme Toggling
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Check local storage for user info
    const storedUser = localStorage.getItem("lifelead-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push("/");
    }

    // Fetch dynamic data from Supabase
    const fetchSupabaseData = async () => {
      setIsLoading(true);
      try {
        const { data: companies, error } = await supabase
          .from("companies")
          .select("*");

        if (error || !companies || companies.length === 0) {
          // Keep default zero values
          console.warn("Supabase empty or error loading table 'companies':", error?.message);
          setStats({
            totalCompanies: 0,
            acceptedCount: 0,
            pendingCount: 0,
            rejectedCount: 0,
            totalLeads: 0,
            totalCountries: 0,
            totalIndustries: 0,
            acceptedOfferCount: 0,
          });
          setCountriesData({});
          setIsLoading(false);
          return;
        }

        // Process data dynamically
        const total = companies.length;
        let accepted = 0;
        let pending = 0;
        let rejected = 0;
        let leadsSum = 0;
        const uniqueCountries = new Set<string>();
        const uniqueIndustries = new Set<string>();

        const countryMap: Record<string, { count: number; breakdown: Record<string, number> }> = {};

        companies.forEach((company) => {
          // Status Counts
          const status = (company.status || "").toLowerCase();
          if (status === "accepted" || status === "approved") {
            accepted++;
          } else if (status === "pending") {
            pending++;
          } else if (status === "rejected") {
            rejected++;
          }

          // Sum leads
          leadsSum += Number(company.leads || company.leads_count || 0);

          // Unique Sets
          const country = company.country || "Unknown";
          const industry = company.industry || company.sector || "Unknown";
          uniqueCountries.add(country);
          uniqueIndustries.add(industry);

          // Group by Country
          if (!countryMap[country]) {
            countryMap[country] = { count: 0, breakdown: {} };
          }
          countryMap[country].count++;
          
          if (industry) {
            countryMap[country].breakdown[industry] = (countryMap[country].breakdown[industry] || 0) + 1;
          }
        });

        setStats({
          totalCompanies: total,
          acceptedCount: accepted,
          pendingCount: pending,
          rejectedCount: rejected,
          totalLeads: leadsSum,
          totalCountries: uniqueCountries.size,
          totalIndustries: uniqueIndustries.size,
          acceptedOfferCount: accepted,
        });

        // Map colors dynamically based on index from palette
        const colors = [
          { bg: "bg-[#046241]", hex: "#046241" },
          { bg: "bg-[#ffb347]", hex: "#ffb347" },
          { bg: "bg-[#133020]", hex: "#133020" },
          { bg: "bg-[#ffc370]", hex: "#ffc370" },
        ];

        const formattedCountries: Record<string, any> = {};
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupabaseData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("lifelead-user");
    router.push("/");
  };

  // Get Initials for Avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formattedDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <main className="h-screen w-full flex overflow-hidden bg-[#f5eedb] dark:bg-black transition-colors duration-300 font-sans">
      
      {/* Left Navigation Bar (Hover-expand pushes right pane) */}
      <nav className="group h-full bg-white dark:bg-[#133020] border-r border-gray-200 dark:border-white/5 w-20 hover:w-64 transition-all duration-300 flex flex-col justify-between py-6 select-none text-[#133020] dark:text-white flex-shrink-0 z-30">
        
        {/* Top Branding Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-6 h-12 overflow-hidden">
            <LogoIcon />
            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              <span className="text-[14px] font-bold text-[#133020] dark:text-white leading-none">LIFELEADS</span>
              <span className="text-[11px] font-medium text-[#046241] dark:text-[#ffb347] leading-none mt-1">LifeSourceLeads</span>
            </div>
          </div>

          {/* Nav Menu Links */}
          <div className="flex flex-col gap-1.5 px-3">
            {[
              { name: "Dashboard", label: "Dashboard", icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              )},
              { name: "Internal Mail", label: "Internal Mail", icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              )},
              { name: "Applicants", label: "Applicants", icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20.4a11.385 11.385 0 01-5.34-1.272V19.13c0-1.113.285-2.16.786-3.07M15 19.128v-.003c.496-.906.778-1.944.778-3.047 0-3.64-2.557-6.562-5.778-6.562-3.22 0-5.778 2.92-5.778 6.562 0 1.103.282 2.14.778 3.047v.003M6 10.375a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM18.75 10.375a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0z" />
                </svg>
              )},
              { name: "Reports", label: "Reports", icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              )},
              { name: "Settings", label: "Settings", icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.99l1.005.831a1.125 1.125 0 01.26 1.43l-1.297 2.247a1.125 1.125 0 01-1.37.491l-1.216-.456c-.356-.133-.752-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.43l1.003-.827c.293-.24.438-.614.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.831a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z" />
                </svg>
              )}
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer group/btn ${
                  activeTab === item.name
                    ? "bg-[#046241] text-white font-bold shadow-md shadow-[#046241]/10"
                    : "text-[#133020] dark:text-white/80 hover:text-[#046241] dark:hover:text-white hover:bg-[#046241]/10 dark:hover:bg-white/5 font-semibold"
                }`}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                </div>
                {/* Gold Circle for active Dashboard item, arrow for rest */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {activeTab === item.name && item.name === "Dashboard" ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffb347] inline-block" />
                  ) : (
                    <span className="text-[10px] text-gray-300 group-hover/btn:text-[#046241] dark:group-hover/btn:text-white">▶</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Profile Controls Drawer */}
        <div className="flex flex-col gap-4">
          <hr className="border-gray-200 dark:border-white/10 mx-4" />

          {/* Profile card area */}
          <div className="px-4 flex items-center justify-between gap-2 overflow-hidden h-14 bg-gray-50/50 dark:bg-black/20 mx-3 rounded-2xl border border-gray-100 dark:border-transparent">
            <div className="flex items-center gap-3">
              {/* Initials badge */}
              <div className="w-10 h-10 rounded-full bg-[#046241] dark:bg-[#ffb347] flex items-center justify-center font-bold text-white dark:text-[#133020] text-sm flex-shrink-0 shadow-inner">
                {user ? getInitials(user.name) : "U"}
              </div>
              <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                <span className="text-[13px] font-bold truncate max-w-[100px] leading-tight text-[#133020] dark:text-white">
                  {user ? user.name : "Loading..."}
                </span>
                <span className="text-[10px] text-[#046241] dark:text-white/60 leading-none mt-0.5">
                  Sales Manager
                </span>
              </div>
            </div>

            {/* Theme Toggle & Sign out */}
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Theme toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 rounded-lg hover:bg-[#046241]/10 dark:hover:bg-white/10 text-gray-500 dark:text-white/80 hover:text-[#046241] dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Toggle dark mode"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              </button>
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-[#046241]/10 dark:hover:bg-white/10 text-gray-500 dark:text-white/80 hover:text-[#046241] dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Log out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      </nav>

      {/* Right Main Content Area (flex-1 dynamically slides/resizes alongside sidebar) */}
      <div className="flex-1 h-full overflow-y-auto p-6 md:p-8 transition-all duration-300 bg-[#f5eedb] dark:bg-black">
        
        {/* Top Bar Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#046241] dark:text-[#ffb347] mb-1">
              <span className="w-2 h-2 rounded-full bg-[#046241] dark:bg-[#ffb347] animate-ping" />
              LIVE • Real-time
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#133020] dark:text-white">
              Dashboard Overview
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formattedDate()}
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="flex flex-col gap-6">

          {/* Card 1: Portfolio Status Distribution */}
          <div className="w-full bg-white dark:bg-[#133020] rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-white/5 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest">
                Portfolio Status Distribution
              </h2>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {stats.totalCompanies} {stats.totalCompanies === 1 ? "company" : "companies"}
              </span>
            </div>

            {/* Progress Distribution Bar */}
            <div className="w-full h-2.5 rounded-full flex overflow-hidden mb-6 bg-gray-100 dark:bg-white/10">
              {stats.totalCompanies > 0 ? (
                <>
                  <div className="bg-[#046241] h-full" style={{ width: `${(stats.acceptedCount / stats.totalCompanies) * 100}%` }} />
                  <div className="bg-[#ffb347] h-full" style={{ width: `${(stats.pendingCount / stats.totalCompanies) * 100}%` }} />
                  <div className="bg-red-500 h-full" style={{ width: `${(stats.rejectedCount / stats.totalCompanies) * 100}%` }} />
                </>
              ) : (
                <div className="bg-gray-200 dark:bg-white/5 w-full h-full" />
              )}
            </div>

            {/* Status Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Accepted Card */}
              <div className="bg-[#046241]/5 dark:bg-[#046241]/10 rounded-2xl p-4 border border-[#046241]/10 flex flex-col">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#046241]" />
                  <span className="text-[13px] font-bold text-gray-500 dark:text-gray-400">Accepted</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#046241]">
                    {stats.totalCompanies > 0 ? `${Math.round((stats.acceptedCount / stats.totalCompanies) * 100)}%` : "0%"}
                  </span>
                  <span className="text-sm font-semibold text-gray-400">{stats.acceptedCount}</span>
                </div>
              </div>

              {/* Pending Card */}
              <div className="bg-[#ffb347]/5 dark:bg-[#ffb347]/10 rounded-2xl p-4 border border-[#ffb347]/10 flex flex-col">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffb347]" />
                  <span className="text-[13px] font-bold text-gray-500 dark:text-gray-400">Pending</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#ffb347]">
                    {stats.totalCompanies > 0 ? `${Math.round((stats.pendingCount / stats.totalCompanies) * 100)}%` : "0%"}
                  </span>
                  <span className="text-sm font-semibold text-gray-400">{stats.pendingCount}</span>
                </div>
              </div>

              {/* Rejected Card */}
              <div className="bg-red-500/5 dark:bg-red-500/10 rounded-2xl p-4 border border-red-500/10 flex flex-col">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-[13px] font-bold text-gray-500 dark:text-gray-400">Rejected</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-red-500">
                    {stats.totalCompanies > 0 ? `${Math.round((stats.rejectedCount / stats.totalCompanies) * 100)}%` : "0%"}
                  </span>
                  <span className="text-sm font-semibold text-gray-400">{stats.rejectedCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid 2: 4 Summary Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Leads Card */}
            <div className="bg-white dark:bg-[#133020] rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Leads</span>
                <span className="p-1.5 rounded-lg bg-[#046241]/10 text-[#046241] dark:bg-[#ffb347]/10 dark:text-[#ffb347]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                </span>
              </div>
              <div>
                <div className="text-3xl font-black tracking-tight text-[#133020] dark:text-white leading-none mb-1">
                  {stats.totalLeads}
                </div>
                <div className="text-xs text-gray-400">across all companies</div>
              </div>
            </div>

            {/* Total Countries Card */}
            <div className="bg-white dark:bg-[#133020] rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Countries</span>
                <span className="p-1.5 rounded-lg bg-[#ffb347]/15 text-[#ffb347]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                  </svg>
                </span>
              </div>
              <div>
                <div className="text-3xl font-black tracking-tight text-[#133020] dark:text-white leading-none mb-1">
                  {stats.totalCountries}
                </div>
                <div className="text-xs text-gray-400">active regions</div>
              </div>
            </div>

            {/* Industry Types Card */}
            <div className="bg-white dark:bg-[#133020] rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Industry Types</span>
                <span className="p-1.5 rounded-lg bg-[#ffc370]/15 text-[#ffc370]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 18.4v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.453.25-.718.25H4.875a1.03 1.03 0 01-.718-.25m16.5 0a34.705 34.705 0 01-3.037.404M3.75 14.15a2.18 2.18 0 01-.75-1.661V8.706c0-1.081.768-2.015 1.837-2.175a48.11 48.11 0 013.413-.387m-4.5 8.006c.194.165.453.25.718.25h14.25c.265 0 .524-.085.718-.25m-16.5 0a34.29 34.29 0 003.037.404m0 0a34.78 34.78 0 0110.898 0m-10.898 0l-.823-5.58H18.5l-.823 5.58M12 9.75v.008M12 12.75v.008M12 15.75v.008" />
                  </svg>
                </span>
              </div>
              <div>
                <div className="text-3xl font-black tracking-tight text-[#133020] dark:text-white leading-none mb-1">
                  {stats.totalIndustries}
                </div>
                <div className="text-xs text-gray-400">sectors monitored</div>
              </div>
            </div>

            {/* Accepted Offer Card */}
            <div className="bg-white dark:bg-[#133020] rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Accepted Offer</span>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </span>
              </div>
              <div>
                <div className="text-3xl font-black tracking-tight text-[#133020] dark:text-white leading-none mb-1">
                  {stats.acceptedOfferCount}
                </div>
                <div className="text-xs text-gray-400">companies on-boarded</div>
              </div>
            </div>

          </div>

          {/* Chart: Companies per Country */}
          <div className="w-full bg-white dark:bg-[#133020] rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-white/5 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-extrabold text-[#133020] dark:text-white">
                  Companies per Country
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Hover a bar to see the industry breakdown
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 text-xs font-bold text-gray-500 dark:text-gray-400">
                {Object.entries(countriesData).map(([name, item]) => (
                  <div key={name} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span>{name}</span>
                    <span className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded-full text-[10px] font-black text-gray-400 dark:text-gray-300">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SVG Visual Bar Chart Container */}
            {Object.keys(countriesData).length === 0 ? (
              <div className="w-full h-72 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center text-sm text-gray-400 dark:text-gray-500 gap-1.5 p-6 mb-8 select-none">
                <svg className="w-8 h-8 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-semibold text-[13px]">No database record found</span>
                <p className="text-xs text-gray-400 text-center max-w-[280px]">
                  Insert rows into the <code className="bg-gray-100 dark:bg-white/5 px-1 py-0.5 rounded text-red-500 font-mono text-[10px]">companies</code> table in Supabase to populate.
                </p>
              </div>
            ) : (
              <>
                <div className="relative w-full h-72 border-b border-gray-100 dark:border-white/5 flex items-end justify-around px-4 md:px-12 select-none mb-8">
                  {Object.entries(countriesData).map(([name, item]) => {
                    // find maximum count to scale heights
                    const maxVal = Math.max(...Object.values(countriesData).map(c => c.count), 8);
                    const heightPercent = `${(item.count / maxVal) * 100}%`;
                    const isHovered = hoveredCountry === name;

                    return (
                      <div
                        key={name}
                        className="relative flex flex-col items-center w-24 md:w-32 group cursor-pointer"
                        onMouseEnter={() => setHoveredCountry(name)}
                        onMouseLeave={() => setHoveredCountry(null)}
                      >
                        {/* Interactive Tooltip Card on Hover */}
                        {isHovered && (
                          <div className="absolute bottom-full mb-3 bg-white dark:bg-[#133020] border border-gray-100 dark:border-white/5 shadow-xl rounded-2xl p-4 w-56 text-left z-20 transition-all">
                            <h4 className="text-xs font-extrabold text-[#133020] dark:text-[#ffb347] uppercase tracking-wider mb-2 border-b border-gray-100 dark:border-white/5 pb-1">
                              {name} Industries
                            </h4>
                            <div className="flex flex-col gap-1.5 text-xs text-gray-500 dark:text-gray-300">
                              {Object.entries(item.breakdown).map(([indName, indCount]) => (
                                <div key={indName} className="flex justify-between font-medium">
                                  <span>{indName}</span>
                                  <span className="font-extrabold text-[#133020] dark:text-white">{indCount}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Bar */}
                        <div
                          style={{ height: heightPercent }}
                          className={`w-12 md:w-16 rounded-t-2xl transition-all duration-300 relative ${
                            isHovered
                              ? `${item.color} brightness-95 scale-x-105 shadow-[0_4px_15px_rgba(4,98,65,0.15)]`
                              : `${item.color} shadow-sm`
                          }`}
                        >
                          {/* Inner glowing hover effect */}
                          {isHovered && (
                            <div className="absolute inset-0 bg-white/10 rounded-t-2xl" />
                          )}
                        </div>

                        {/* Country Label */}
                        <span className="text-xs font-extrabold text-gray-400 dark:text-gray-400 mt-2.5 mb-1 tracking-wide">
                          {name}
                        </span>
                      </div>
                    );
                  })}

                  {/* Horizontal Gridlines (Visual helpers) */}
                  <div className="absolute left-0 w-full h-0 border-t border-dashed border-gray-100 dark:border-white/5 top-[25%]" />
                  <div className="absolute left-0 w-full h-0 border-t border-dashed border-gray-100 dark:border-white/5 top-[50%]" />
                  <div className="absolute left-0 w-full h-0 border-t border-dashed border-gray-100 dark:border-white/5 top-[75%]" />
                </div>

                {/* Bottom stats indicators row */}
                <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-white/5 text-center">
                  {Object.entries(countriesData).map(([name, item]) => (
                    <div key={name} className="py-4 md:py-0 flex flex-col items-center">
                      <span className={`h-1.5 w-8 rounded-full ${item.color} mb-2`} />
                      <div className="text-2xl font-black text-[#133020] dark:text-white leading-none mb-0.5">
                        {item.count}
                      </div>
                      <div className="text-xs font-bold text-gray-500 dark:text-gray-400">{name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{item.percentage} of portfolio</div>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>

        </div>

        {/* Float Help Button */}
        <div className="fixed bottom-6 right-6 z-20">
          <button className="w-10 h-10 rounded-full bg-[#133020] dark:bg-white text-white dark:text-[#133020] flex items-center justify-center font-extrabold shadow-lg hover:scale-105 transition-transform cursor-pointer text-sm">
            ?
          </button>
        </div>

      </div>

    </main>
  );
}
