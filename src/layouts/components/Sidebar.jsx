import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { useLocation } from "react-router-dom";
import SidebarWallet from "./SidebarWallet";
import SidebarMenu from "./SidebarMenu";
import logo from "@/assets/logo.png";
import logoWhite from "@/assets/logo-white.png";
import token from "@/lib/utilities";

const Sidebar = ({ menuOpen, setMenuOpen }) => {
  const { theme } = useContext(ThemeContext);
  const location = useLocation();

  const user = token.getUserData();
  const userRole = user?.role || "client";

  const clientMenu = [
    { label: "Dashboard", icon: "mdi:view-dashboard-outline", path: "/dashboard" },
    {
      label: "Transfer",
      icon: "mdi:swap-horizontal",
      children: [
        { label: "Deposit Option", path: "/deposits" },
        { label: "Withdrawal", path: "/withdrawals" },
      ],
    },
    { label: "Wallet History", icon: "mdi:wallet-outline", path: "/wallet-history" },
    { label: "Tickets", icon: "mdi:headset", path: "/tickets" },
    { label: "Market Events", icon: "mdi:calendar-month-outline", path: "/market-events" },
    { label: "Platform", icon: "streamline-cyber:multi-platform-2", path: "/platform" },
    { label: "Profile", icon: "mdi:account-outline", path: "/profile" },
    { label: "Logout", icon: "mdi:logout", action: "logout" },
  ];

  const adminMenu = [
    { label: "Dashboard", icon: "mdi:view-dashboard-outline", path: "/admin/dashboard" },
    { label: "Documents", icon: "mdi:account-check-outline", path: "/admin/documents" },
    { label: "Deposit Methods", icon: "mdi:bank-transfer", path: "/admin/deposit-methods" },
    { label: "Deposit Requests", icon: "mdi:bank-transfer-in", path: "/admin/deposit-requests" },
    { label: "Withdrawal Requests", icon: "mdi:bank-transfer-out", path: "/admin/withdrawal-requests" },
    { label: "Customer Support", icon: "mdi:headset", path: "/admin/support" },
    { label: "Manage Users", icon: "mdi:account-group-outline", path: "/admin/users" },
    { label: "Logout", icon: "mdi:logout", action: "logout" },
  ];

  const menuItems = userRole === "admin" ? adminMenu : clientMenu;

  const [transferOpen, setTransferOpen] = useState(false);

  useEffect(() => {
    if (
      userRole === "client" &&
      (location.pathname.includes("/deposits") || location.pathname.includes("/withdrawal"))
    ) {
      setTransferOpen(true);
    }
  }, [location.pathname, userRole]);

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:relative md:z-40 md:flex flex-col`}
    >
      <div className="flex justify-between items-center p-2 shadow-sm">
        <img src={theme === "dark" ? logoWhite : logo} alt="Logo" className="h-12 w-auto" />
      </div>

      {userRole === "client" && <SidebarWallet />}

      <SidebarMenu menuItems={menuItems} transferOpen={transferOpen} setTransferOpen={setTransferOpen} />
    </div>
  );
};

export default Sidebar;
