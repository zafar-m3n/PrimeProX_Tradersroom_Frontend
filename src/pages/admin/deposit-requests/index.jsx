import React, { useCallback, useEffect, useState } from "react";
import DefaultLayout from "@/layouts/DefaultLayout";
import DepositRequestsTable from "./components/DepositRequestsTable";
import API from "@/services/index";
import Notification from "@/components/ui/Notification";
import Spinner from "@/components/ui/Spinner";
import Heading from "@/components/ui/Heading";

function DepositRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRequests = useCallback(async (page = 1) => {
    const pageNumber = Number(page) || 1;

    setLoading(true);

    try {
      const res = await API.private.getAllDepositRequests(pageNumber);

      if (res.status === 200 && res.data.code === "OK") {
        const data = res.data.data || {};

        setRequests(data.requests || []);
        setCurrentPage(Number(data.page) || pageNumber);
        setTotalPages(Number(data.totalPages) || 1);
      } else {
        Notification.error(res.data.message || "Failed to fetch deposit requests.");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to fetch deposit requests.";
      Notification.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(1);
  }, [fetchRequests]);

  async function handleApprove(request) {
    if (!request?.id) return;

    setActionLoading(true);

    try {
      const res = await API.private.approveDepositRequest(request.id);

      if (res.status === 200 && res.data.code === "OK") {
        Notification.success(res.data.data?.message || "Deposit request approved.");
        fetchRequests(currentPage);
      } else {
        Notification.error(res.data.message || "Failed to approve request.");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to approve request.";
      Notification.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(request, note) {
    if (!request?.id) return;

    setActionLoading(true);

    try {
      const res = await API.private.rejectDepositRequest(request.id, note);

      if (res.status === 200 && res.data.code === "OK") {
        Notification.success(res.data.data?.message || "Deposit request rejected.");
        fetchRequests(currentPage);
      } else {
        Notification.error(res.data.message || "Failed to reject request.");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to reject request.";
      Notification.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  function handlePageChange(page) {
    const pageNumber = Number(page);

    if (!pageNumber) return;
    if (pageNumber < 1) return;
    if (pageNumber > totalPages) return;
    if (pageNumber === currentPage) return;

    fetchRequests(pageNumber);
  }

  return (
    <DefaultLayout>
      <Heading className="mb-6">Deposit Requests</Heading>

      {loading ? (
        <Spinner message="Loading deposit requests..." />
      ) : (
        <DepositRequestsTable
          requests={requests}
          onApprove={handleApprove}
          onReject={handleReject}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          actionLoading={actionLoading}
        />
      )}
    </DefaultLayout>
  );
}

export default DepositRequests;
