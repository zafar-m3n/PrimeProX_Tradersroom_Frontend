import React from "react";
import Modal from "@/components/ui/Modal";

const ConfirmUserModal = ({ isOpen, onClose, onConfirm, user, loading = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm User Approval" size="md">
      <p className="text-gray-700 dark:text-gray-200 mb-6">
        Are you sure you want to approve user <strong>{user?.full_name}</strong>?
      </p>

      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 bg-accent text-white rounded font-medium hover:bg-accent/90 transition"
        >
          {loading ? "Approving..." : "Approve"}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmUserModal;
