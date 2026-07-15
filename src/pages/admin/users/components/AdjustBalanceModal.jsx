import React, { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import API from "@/services/index";
import Notification from "@/components/ui/Notification";

const AdjustBalanceModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;

    setAmount("");
    setDescription("");
    setErrors({});
    fetchBalance();
  }, [isOpen, user]);

  const fetchBalance = async () => {
    setBalanceLoading(true);
    try {
      const res = await API.private.getUserWalletBalance(user.id);
      if (res.status === 200 && res.data.code === "OK") {
        setCurrentBalance(parseFloat(res.data.data.balance) || 0);
      } else {
        Notification.error(res.data.error || "Failed to fetch wallet balance.");
      }
    } catch (error) {
      const msg = error.response?.data?.error || "Failed to fetch wallet balance.";
      Notification.error(msg);
    } finally {
      setBalanceLoading(false);
    }
  };

  const parsedAmount = parseFloat(amount);
  const newBalance = currentBalance + (isNaN(parsedAmount) ? 0 : parsedAmount);

  const validate = () => {
    const nextErrors = {};

    if (!amount || isNaN(parsedAmount) || parsedAmount === 0) {
      nextErrors.amount = "Enter a non-zero amount.";
    }

    if (!description.trim()) {
      nextErrors.description = "Description is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleClose = () => {
    if (actionLoading) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setActionLoading(true);
    try {
      const res = await API.private.adjustUserBalance(user.id, {
        amount: parsedAmount,
        description: description.trim(),
      });

      if (res.status === 200 && res.data.code === "OK") {
        Notification.success(res.data.data?.message || "Wallet balance adjusted successfully.");
        onSuccess?.(user.id, parseFloat(res.data.data.balance) || 0);
        onClose();
      } else {
        Notification.error(res.data.error || "Failed to adjust wallet balance.");
      }
    } catch (error) {
      const msg = error.response?.data?.error || "Failed to adjust wallet balance.";
      Notification.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Adjust Wallet Balance" size="md">
      {balanceLoading ? (
        <Spinner message="Loading current balance..." />
      ) : (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-200">
            Adjusting wallet balance for <strong>{user.full_name}</strong>
          </p>

          <div className="flex justify-between py-1">
            <span className="text-gray-500 dark:text-gray-400">Current Balance:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">${currentBalance.toFixed(2)}</span>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">
              Amount (use a negative value to debit)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50 or -50"
              className={`w-full bg-white dark:bg-gray-900 border rounded px-3 py-2 text-gray-800 dark:text-gray-200
                placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:border-accent transition
                ${errors.amount ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`}
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Reason for this adjustment"
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:border-accent bg-white dark:bg-gray-900 text-gray-800 dark:text-white
                ${errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="flex justify-between py-1 border-t border-gray-200 dark:border-gray-600 pt-3">
            <span className="text-gray-500 dark:text-gray-400">New Balance:</span>
            <span className="font-semibold text-accent">${newBalance.toFixed(2)}</span>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={handleClose}
              disabled={actionLoading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={actionLoading}
              className="px-4 py-2 bg-accent text-white rounded font-medium hover:bg-accent/90 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading ? "Processing..." : "Confirm Adjustment"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AdjustBalanceModal;
