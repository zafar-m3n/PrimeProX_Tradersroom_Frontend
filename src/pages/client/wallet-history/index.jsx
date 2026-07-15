import React, { useState, useEffect } from "react";
import DefaultLayout from "@/layouts/DefaultLayout";
import DepositHistoryTable from "./components/DepositHistoryTable";
import WithdrawalHistoryTable from "./components/WithdrawalHistoryTable";
import AdjustmentHistoryTable from "./components/AdjustmentHistoryTable";
import API from "@/services/index";
import Notification from "@/components/ui/Notification";
import Heading from "@/components/ui/Heading";
import Spinner from "@/components/ui/Spinner";

import AccentButton from "@/components/ui/AccentButton";
import GrayButton from "@/components/ui/GrayButton";

const WalletHistory = () => {
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("deposits");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeTab === "deposits") {
      fetchDepositHistory(1);
    } else if (activeTab === "withdrawals") {
      fetchWithdrawalHistory(1);
    } else if (activeTab === "adjustments") {
      fetchAdjustmentHistory(1);
    }
  }, [activeTab]);

  const fetchDepositHistory = async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.private.getDepositHistory(page);
      if (res.data.code === "OK") {
        setDeposits(res.data.data.deposits || []);
        setCurrentPage(res.data.data.page || 1);
        setTotalPages(res.data.data.totalPages || 1);
      } else {
        Notification.error(res.data.error || "Failed to load deposit history.");
      }
    } catch (error) {
      Notification.error(error.response?.data?.error || "Failed to load deposit history.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawalHistory = async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.private.getWithdrawalHistory(page);
      if (res.data.code === "OK") {
        setWithdrawals(res.data.data.withdrawals || []);
        setCurrentPage(res.data.data.page || 1);
        setTotalPages(res.data.data.totalPages || 1);
      } else {
        Notification.error(res.data.error || "Failed to load withdrawal history.");
      }
    } catch (error) {
      Notification.error(error.response?.data?.error || "Failed to load withdrawal history.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdjustmentHistory = async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.private.getAdjustmentHistory(page);
      if (res.data.code === "OK") {
        setAdjustments(res.data.data.adjustments || []);
        setCurrentPage(res.data.data.page || 1);
        setTotalPages(res.data.data.totalPages || 1);
      } else {
        Notification.error(res.data.error || "Failed to load adjustment history.");
      }
    } catch (error) {
      Notification.error(error.response?.data?.error || "Failed to load adjustment history.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (activeTab === "deposits") {
      fetchDepositHistory(page);
    } else if (activeTab === "withdrawals") {
      fetchWithdrawalHistory(page);
    } else {
      fetchAdjustmentHistory(page);
    }
  };

  return (
    <DefaultLayout>
      <Heading>Wallet History</Heading>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
        Track your deposit and withdrawal activities here.
      </p>

      {/* Tabs */}
      <div className="flex space-x-2 mb-4">
        {activeTab === "deposits" ? (
          <div className="w-fit">
            <AccentButton onClick={() => setActiveTab("deposits")} text="Deposits" />
          </div>
        ) : (
          <div className="w-fit">
            <GrayButton onClick={() => setActiveTab("deposits")} text="Deposits" />
          </div>
        )}

        {activeTab === "withdrawals" ? (
          <div className="w-fit">
            <AccentButton onClick={() => setActiveTab("withdrawals")} text="Withdrawals" />
          </div>
        ) : (
          <div className="w-fit">
            <GrayButton onClick={() => setActiveTab("withdrawals")} text="Withdrawals" />
          </div>
        )}

        {activeTab === "adjustments" ? (
          <div className="w-fit">
            <AccentButton onClick={() => setActiveTab("adjustments")} text="Profit/Loss" />
          </div>
        ) : (
          <div className="w-fit">
            <GrayButton onClick={() => setActiveTab("adjustments")} text="Profit/Loss" />
          </div>
        )}
      </div>

      {loading ? (
        <Spinner
          message={
            activeTab === "deposits"
              ? "Loading deposit history..."
              : activeTab === "withdrawals"
                ? "Loading withdrawal history..."
                : "Loading adjustment history..."
          }
        />
      ) : activeTab === "deposits" ? (
        <DepositHistoryTable
          deposits={deposits}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      ) : activeTab === "withdrawals" ? (
        <WithdrawalHistoryTable
          withdrawals={withdrawals}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      ) : (
        <AdjustmentHistoryTable
          adjustments={adjustments}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </DefaultLayout>
  );
};

export default WalletHistory;
