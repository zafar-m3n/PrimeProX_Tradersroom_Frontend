import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/layouts/DefaultLayout";
import UserTable from "./components/UserTable";
import UserFormModal from "./components/UserFormModal";
import ConfirmUserModal from "./components/ConfirmUserModal";
import API from "@/services/index";
import Notification from "@/components/ui/Notification";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import useWidth from "@/hooks/useWidth";
import Heading from "@/components/ui/Heading";
import AccentButton from "@/components/ui/AccentButton";

const ManageUsers = () => {
  const navigate = useNavigate();
  const { width, breakpoints } = useWidth();
  const isMobile = width < breakpoints.md;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [userToApprove, setUserToApprove] = useState(null);
  const [approveLoading, setApproveLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page) => {
    setLoading(true);
    try {
      const res = await API.private.getAllUsers({ page });
      if (res.status === 200 && res.data.code === "OK") {
        setUsers(res.data.data.users || []);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (error) {
      const msg = error.response?.data?.error || "Failed to fetch users.";
      Notification.error(msg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setIsEdit(false);
    setIsFormOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEdit(true);
    setIsFormOpen(true);
  };

  const handleView = (user) => {
    navigate(`/admin/users/${user.id}`);
  };

  const handleApprove = (user) => {
    setUserToApprove(user);
    setIsApproveModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!userToApprove) return;

    setApproveLoading(true);
    try {
      const res = await API.private.approveUserAccount(userToApprove.id);
      if (res.status === 200 && res.data.code === "OK") {
        Notification.success(res.data.data.message || "User approved successfully.");
        setIsApproveModalOpen(false);
        setUserToApprove(null);
        fetchUsers(currentPage);
      }
    } catch (error) {
      const msg = error.response?.data?.error || "Failed to approve user.";
      Notification.error(msg);
    } finally {
      setApproveLoading(false);
    }
  };

  const handleDelete = async (user) => {
    try {
      const res = await API.private.deleteUser(user.id);
      if (res.status === 200 && res.data.code === "OK") {
        Notification.success(res.data.data.message || "User deleted successfully.");
        fetchUsers(currentPage);
      }
    } catch (error) {
      const msg = error.response?.data?.error || "Failed to delete user.";
      Notification.error(msg);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (isEdit && selectedUser) {
        const res = await API.private.updateUser(selectedUser.id, data);
        if (res.status === 200 && res.data.code === "OK") {
          Notification.success(res.data.data.message || "User updated successfully.");
          fetchUsers(currentPage);
        }
      } else {
        const res = await API.private.createUser(data);
        if (res.status === 201 && res.data.code === "OK") {
          Notification.success(res.data.data.message || "User created successfully.");
          fetchUsers(1);
          setCurrentPage(1);
        }
      }
      setIsFormOpen(false);
    } catch (error) {
      const msg = error.response?.data?.error || "Failed to save user.";
      Notification.error(msg);
    }
  };

  return (
    <DefaultLayout>
      <div className="flex justify-between items-center mb-6">
        <Heading>Manage Users</Heading>
        <div className="w-fit">
          <AccentButton onClick={handleAdd} text={isMobile ? "+" : "Add New User"} />
        </div>
      </div>

      {loading ? (
        <Spinner message="Loading users..." />
      ) : (
        <UserTable
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onApprove={handleApprove}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={isEdit ? "Edit User" : "Add New User"}
        size="md"
      >
        <UserFormModal
          onSubmit={handleSubmit}
          onClose={() => setIsFormOpen(false)}
          initialData={selectedUser}
          isEdit={isEdit}
        />
      </Modal>

      <ConfirmUserModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          if (approveLoading) return;
          setIsApproveModalOpen(false);
          setUserToApprove(null);
        }}
        onConfirm={handleApproveConfirm}
        user={userToApprove}
        loading={approveLoading}
      />
    </DefaultLayout>
  );
};

export default ManageUsers;
