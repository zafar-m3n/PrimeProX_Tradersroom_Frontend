import React, { useState } from "react";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

const UserTable = ({ users, onEdit, onDelete, onView, onApprove, currentPage, totalPages, onPageChange }) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const formatPhoneNumber = (number) => {
    if (!number) return "-";
    try {
      const phoneNumber = parsePhoneNumberFromString(number);
      return phoneNumber ? phoneNumber.formatInternational() : number;
    } catch {
      return number;
    }
  };

  const getCountryName = (code) => {
    if (!code) return "-";
    return countries.getName(code, "en", { select: "official" }) || code;
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) onDelete(userToDelete);
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone_number", label: "Phone" },
    { key: "country_code", label: "Country" },
    { key: "role", label: "Role" },
    { key: "promo_code", label: "Promo Code" },
    { key: "email_verified", label: "Verified" },
    { key: "actions", label: "Actions" },
  ];

  const renderCell = (user, col) => {
    switch (col.key) {
      case "phone_number":
        return formatPhoneNumber(user.phone_number);
      case "country_code":
        return getCountryName(user.country_code);
      case "role":
        return <Badge text={user.role} color={user.role === "admin" ? "blue" : "gray"} size="sm" />;
      case "promo_code":
        return user.promo_code || "N/A";
      case "email_verified":
        return (
          <Badge
            text={user.email_verified ? "Verified" : "Not Verified"}
            color={user.email_verified ? "green" : "red"}
            size="sm"
          />
        );
      case "actions":
        return (
          <div className="space-x-2 flex flex-wrap justify-end">
            <button
              onClick={() => onView(user)}
              className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="View"
            >
              <Icon icon="mdi:eye" width="18" className="text-gray-800 dark:text-gray-200" />
            </button>

            <button
              onClick={() => onEdit(user)}
              className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Edit"
            >
              <Icon icon="mdi:pencil" width="18" className="text-gray-800 dark:text-gray-200" />
            </button>

            {!user.email_verified && user.role !== "admin" && (
              <button
                onClick={() => onApprove(user)}
                className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                title="Approve"
              >
                <Icon icon="mdi:check-circle" width="18" className="text-gray-800 dark:text-gray-200" />
              </button>
            )}

            <button
              onClick={() => confirmDelete(user)}
              className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Delete"
            >
              <Icon icon="mdi:trash-can" width="18" className="text-gray-800 dark:text-gray-200" />
            </button>
          </div>
        );
      default:
        return user[col.key];
    }
  };

  console.log("Users", users);

  return (
    <>
      <Table columns={columns} data={users} renderCell={renderCell} emptyMessage="No users found." className="mb-4" />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Delete" size="md">
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-4 py-2 rounded mb-4 font-medium">
          This action cannot be undone.
        </div>
        <p className="text-gray-700 dark:text-gray-200 mb-6">
          Are you sure you want to delete user <strong>{userToDelete?.full_name}</strong>?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
};

export default UserTable;
