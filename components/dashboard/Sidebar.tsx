"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogoIcon } from "../ui/LogoIcon";
import type { DashboardUser } from "../../lib/hooks/useDashboardData";

interface SidebarProps {
  user: DashboardUser | null;
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  handleLogout: () => void;
}

export function Sidebar({
  user,
  isDarkMode,
  setIsDarkMode,
  activeTab,
  setActiveTab,
  handleLogout,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    {
      name: "Dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
    {
      name: "Companies",
      label: "Companies",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M5.25 21V6.75A2.25 2.25 0 017.5 4.5h9a2.25 2.25 0 012.25 2.25V21M9 21v-3.75h6V21M9 8.25h.008v.008H9V8.25zm3 0h.008v.008H12V8.25zm3 0h.008v.008H15V8.25zm-6 3h.008v.008H9v-.008zm3 0h.008v.008H12v-.008zm3 0h.008v.008H15v-.008z" />
        </svg>
      ),
    },
    {
      name: "Status",
      label: "Status",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5.25H7.5A2.25 2.25 0 005.25 7.5v11.25A2.25 2.25 0 007.5 21h9a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25H15M9 5.25A2.25 2.25 0 0011.25 3h1.5A2.25 2.25 0 0115 5.25M9 5.25A2.25 2.25 0 0011.25 7.5h1.5A2.25 2.25 0 0015 5.25m-5.25 7.5l1.5 1.5 3-3" />
        </svg>
      ),
    },
    {
      name: "Records",
      label: "Records",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
      ),
    },
    {
      name: "Settings",
      label: "Settings",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className={`group h-full bg-[#0F2E1E] dark:bg-[#14120e] border-r border-[#0F2E1E] dark:border-[#14120e] w-20 hover:w-64 flex flex-col justify-between py-6 select-none text-white flex-shrink-0 z-30 ${mounted ? 'transition-all duration-300' : ''}`}>
      {/* Top Branding Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-6 h-12 overflow-hidden">
          <LogoIcon />
          <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <span className="text-[14px] font-bold text-white leading-none">LIFELEADS</span>
            <span className="text-[11px] font-medium text-gray-300 dark:text-gray-400 leading-none mt-1">LifeSourceLeads</span>
          </div>
        </div>

        {/* Nav Menu Links */}
        <div className="flex flex-col gap-1.5 px-3">
          {navItems.map((item) => {
            let isActive = false;
            if (item.name === "Companies") isActive = pathname === "/companies";
            else if (item.name === "Dashboard") isActive = pathname === "/dashboard" || pathname === "/";
            else if (item.name === "Status") isActive = pathname === "/status";
            else if (item.name === "Records") isActive = pathname === "/records";
            else isActive = activeTab === item.name;

            return (
              <button
                key={item.name}
                onClick={() => {
                  if (item.name === "Companies" && pathname !== "/companies") {
                    router.push("/companies");
                  } else if (item.name === "Dashboard" && pathname !== "/dashboard") {
                    router.push("/dashboard");
                  } else if (item.name === "Status" && pathname !== "/status") {
                    router.push("/status");
                  } else if (item.name === "Records" && pathname !== "/records") {
                    router.push("/records");
                  } else {
                    setActiveTab(item.name);
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer group/btn ${
                  isActive
                    ? "bg-[#046241] dark:bg-[#1c2419] text-white dark:text-[#ffb347] font-bold shadow-md shadow-[#046241]/10 dark:shadow-none"
                    : "text-gray-300 dark:text-white/80 hover:text-white hover:bg-white/10 dark:hover:bg-white/5 font-semibold"
                }`}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                </div>
                {/* Gold Circle for active item, arrow for rest */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {isActive ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffb347] inline-block" />
                  ) : (
                    <span className="text-[10px] text-gray-300 group-hover/btn:text-[#046241] dark:group-hover/btn:text-white">▶</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile Controls Drawer */}
      <div className="flex flex-col gap-2 mb-2">

        {/* Profile card area */}
        <div className="px-2 group-hover:px-4 flex items-center justify-between gap-2 overflow-hidden h-14 bg-white/5 dark:bg-white/5 mx-3 rounded-2xl border border-white/10 dark:border-white/5 transition-all duration-300">
          <div className="flex items-center gap-3">
            {/* Initials badge */}
            <div className="w-10 h-10 rounded-full bg-[#046241] dark:bg-[#ffb347] flex items-center justify-center font-bold text-white dark:text-[#133020] text-sm flex-shrink-0 shadow-inner">
              {mounted && user ? getInitials(user.name) : "U"}
            </div>
            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              <span className="text-[13px] font-bold truncate max-w-[100px] leading-tight text-white">
                {mounted && user ? user.name : "Loading..."}
              </span>
              <span className="text-[10px] text-gray-300 dark:text-white/60 leading-none mt-0.5">
                User
              </span>
            </div>
          </div>

          {/* Theme Toggle & Sign out */}
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Theme toggle */}
            <button
              onClick={() => setIsDarkMode((currentMode) => !currentMode)}
              className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 text-gray-400 dark:text-white/80 hover:text-white dark:hover:text-white transition-colors cursor-pointer"
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              aria-pressed={isDarkMode}
            >
              {isDarkMode ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path strokeLinecap="round" d="M12 2.25v1.5M12 20.25v1.5M4.93 4.93l1.06 1.06M18.01 18.01l1.06 1.06M2.25 12h1.5M20.25 12h1.5M4.93 19.07l1.06-1.06M18.01 5.99l1.06-1.06" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 text-gray-400 dark:text-white/80 hover:text-white dark:hover:text-white transition-colors cursor-pointer"
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
  );
}
