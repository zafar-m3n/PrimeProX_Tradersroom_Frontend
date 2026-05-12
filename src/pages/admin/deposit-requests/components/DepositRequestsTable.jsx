import React, { useState } from "react";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import { formatDate } from "@/utils/formatDate";

const apiBaseUrl = import.meta.env.VITE_TRADERSROOM_API_BASEURL;

function DepositRequestsTable({
  requests,
  onApprove,
  onReject,
  currentPage,
  totalPages,
  onPageChange,
  actionLoading = false,
}) {
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    action: null,
    request: null,
  });

  const [rejectionNote, setRejectionNote] = useState("");

  const [proofModal, setProofModal] = useState({
    open: false,
    proofPath: "",
  });

  function handleActionClick(action, request) {
    setRejectionNote("");
    setConfirmModal({
      open: true,
      action,
      request,
    });
  }

  async function confirmAction() {
    if (!confirmModal.request) return;

    if (confirmModal.action === "approve") {
      await onApprove(confirmModal.request);
    }

    if (confirmModal.action === "reject") {
      await onReject(confirmModal.request, rejectionNote);
    }

    setConfirmModal({
      open: false,
      action: null,
      request: null,
    });

    setRejectionNote("");
  }

  function handleViewProof(proofPath) {
    setProofModal({
      open: true,
      proofPath: proofPath || "",
    });
  }

  function handleCloseConfirmModal() {
    if (actionLoading) return;

    setConfirmModal({
      open: false,
      action: null,
      request: null,
    });

    setRejectionNote("");
  }

  function handleCloseProofModal() {
    setProofModal({
      open: false,
      proofPath: "",
    });
  }

  const columns = [
    { key: "id", label: "ID" },
    { key: "user", label: "User" },
    { key: "method", label: "Method" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created At" },
    { key: "actions", label: "Actions" },
  ];

  function renderCell(request, col) {
    switch (col.key) {
      case "user":
        return (
          <>
            <span>{request.User?.full_name || "N/A"}</span>
            <br />
            <span className="text-xs text-gray-600 dark:text-gray-400">{request.User?.email || "No email"}</span>
          </>
        );

      case "method":
        return request.DepositMethod?.name || "N/A";

      case "amount":
        return `$${request.amount}`;

      case "status":
        return (
          <Badge
            text={request.status}
            color={request.status === "approved" ? "green" : request.status === "rejected" ? "red" : "yellow"}
            size="sm"
          />
        );

      case "createdAt":
        return formatDate(request.createdAt);

      case "actions":
        return (
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleViewProof(request.proof_path)}
              className="inline-flex items-center rounded border border-gray-300 px-2 py-1 transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <Icon icon="mdi:eye" width="18" className="text-gray-800 dark:text-gray-200" />
            </button>

            {request.status === "pending" && (
              <>
                <button
                  type="button"
                  onClick={() => handleActionClick("approve", request)}
                  disabled={actionLoading}
                  className="inline-flex items-center rounded border border-green-300 px-2 py-1 text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900"
                >
                  <Icon icon="mdi:check" width="18" />
                </button>

                <button
                  type="button"
                  onClick={() => handleActionClick("reject", request)}
                  disabled={actionLoading}
                  className="inline-flex items-center rounded border border-red-300 px-2 py-1 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900"
                >
                  <Icon icon="mdi:close" width="18" />
                </button>
              </>
            )}
          </div>
        );

      default:
        return request[col.key];
    }
  }

  return (
    <>
      <Table columns={columns} data={requests} renderCell={renderCell} emptyMessage="No deposit requests found." />

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} className="mt-4" />
      )}

      <Modal
        isOpen={confirmModal.open}
        onClose={handleCloseConfirmModal}
        title={confirmModal.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
      >
        <div className="space-y-4">
          <p className="text-gray-800 dark:text-gray-200">
            Are you sure you want to <strong>{confirmModal.action === "approve" ? "approve" : "reject"}</strong> this
            deposit request?
          </p>

          {confirmModal.action === "reject" && (
            <textarea
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="Enter rejection note (optional)"
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:border-accent focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCloseConfirmModal}
              disabled={actionLoading}
              className="rounded border border-gray-300 px-4 py-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={confirmAction}
              disabled={actionLoading}
              className="rounded bg-accent px-4 py-2 font-medium text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading ? "Processing..." : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={proofModal.open} onClose={handleCloseProofModal} title="Proof of Deposit" size="md" centered>
        <div className="flex items-center justify-center">
          {proofModal.proofPath ? (
            <img
              src={`${apiBaseUrl}/${proofModal.proofPath}`}
              alt="Proof"
              className="max-h-[400px] max-w-full rounded shadow"
            />
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No proof available.</p>
          )}
        </div>
      </Modal>
    </>
  );
}

export default DepositRequestsTable;
