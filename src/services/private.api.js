import instance from "@/lib/axios";

/* ========================== */
/* User: Auth Functions       */
/* ========================== */

const registerUser = async (data) => {
  return await instance.apiClient.post("/api/v1/auth/register", data, {
    headers: instance.publicHeaders(),
  });
};

const verifyEmail = async (token) => {
  return await instance.apiClient.get(`/api/v1/auth/verify-email?token=${token}`, {
    headers: instance.publicHeaders(),
  });
};

const loginUser = async (data) => {
  return await instance.apiClient.post("/api/v1/auth/login", data, {
    headers: instance.publicHeaders(),
  });
};

const forgotPassword = async (data) => {
  return await instance.apiClient.post("/api/v1/auth/forgot-password", data, {
    headers: instance.publicHeaders(),
  });
};

const resetPassword = async (token, data) => {
  return await instance.apiClient.post(`/api/v1/auth/reset-password?token=${token}`, data, {
    headers: instance.publicHeaders(),
  });
};

/* ========================== */
/* Admin: Deposit Methods     */
/* ========================== */

const createDepositMethod = async (formData) => {
  return await instance.apiClient.post("/api/v1/admin/deposit-methods", formData, {
    headers: instance.defaultHeaders("multipart/form-data"),
  });
};

const getAllDepositMethods = async () => {
  return await instance.apiClient.get("/api/v1/admin/deposit-methods", {
    headers: instance.defaultHeaders(),
  });
};

const getDepositMethodById = async (id) => {
  return await instance.apiClient.get(`/api/v1/admin/deposit-methods/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

const updateDepositMethod = async (id, formData) => {
  return await instance.apiClient.put(`/api/v1/admin/deposit-methods/${id}`, formData, {
    headers: instance.defaultHeaders("multipart/form-data"),
  });
};

const toggleDepositMethodStatus = async (id, status) => {
  return await instance.apiClient.patch(
    `/api/v1/admin/deposit-methods/${id}/status`,
    { status },
    {
      headers: instance.defaultHeaders(),
    },
  );
};

const getAllDepositRequests = async () => {
  return await instance.apiClient.get("/api/v1/admin/deposit-requests", {
    headers: instance.defaultHeaders(),
  });
};

const approveDepositRequest = async (id) => {
  return await instance.apiClient.patch(
    `/api/v1/admin/deposit-requests/${id}/approve`,
    {},
    {
      headers: instance.defaultHeaders(),
    },
  );
};

const rejectDepositRequest = async (id, admin_note) => {
  return await instance.apiClient.patch(
    `/api/v1/admin/deposit-requests/${id}/reject`,
    { admin_note },
    {
      headers: instance.defaultHeaders(),
    },
  );
};

/* ========================== */
/* Client: Deposit Requests   */
/* ========================== */

const getActiveDepositMethods = async () => {
  return await instance.apiClient.get("/api/v1/client/deposits/methods", {
    headers: instance.defaultHeaders(),
  });
};

const createDepositRequest = async (formData) => {
  return await instance.apiClient.post("/api/v1/client/deposits", formData, {
    headers: instance.defaultHeaders("multipart/form-data"),
  });
};

/* ========================== */
/* Client: Wallet             */
/* ========================== */

const getWalletBalance = async () => {
  return await instance.apiClient.get("/api/v1/client/wallet/balance", {
    headers: instance.defaultHeaders(),
  });
};

const getDepositHistory = async () => {
  return await instance.apiClient.get("/api/v1/client/wallet/deposit-history", {
    headers: instance.defaultHeaders(),
  });
};

const getWithdrawalHistory = async () => {
  return await instance.apiClient.get("/api/v1/client/wallet/withdrawal-history", {
    headers: instance.defaultHeaders(),
  });
};

/* ========================== */
/* Client: Profile            */
/* ========================== */

const getProfile = async () => {
  return await instance.apiClient.get("/api/v1/client/profile", {
    headers: instance.defaultHeaders(),
  });
};

const updateProfile = async (data) => {
  return await instance.apiClient.put("/api/v1/client/profile", data, {
    headers: instance.defaultHeaders(),
  });
};

const uploadKycDocument = async (formData) => {
  return await instance.apiClient.post("/api/v1/client/profile/kyc", formData, {
    headers: instance.defaultHeaders("multipart/form-data"),
  });
};

const getKycDocuments = async () => {
  return await instance.apiClient.get("/api/v1/client/profile/kyc", {
    headers: instance.defaultHeaders(),
  });
};

const addWithdrawalMethod = async (data) => {
  return await instance.apiClient.post("/api/v1/client/profile/withdrawal-methods", data, {
    headers: instance.defaultHeaders(),
  });
};

const getWithdrawalMethods = async () => {
  return await instance.apiClient.get("/api/v1/client/profile/withdrawal-methods", {
    headers: instance.defaultHeaders(),
  });
};

const deleteWithdrawalMethod = async (id) => {
  return await instance.apiClient.delete(`/api/v1/client/profile/withdrawal-methods/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

const changePassword = async (data) => {
  return await instance.apiClient.patch("/api/v1/client/profile/change-password", data, {
    headers: instance.defaultHeaders(),
  });
};

/* ========================== */
/* Admin: KYC Documents       */
/* ========================== */

const getAllKycDocuments = async (params = {}) => {
  return await instance.apiClient.get("/api/v1/admin/kyc-documents", {
    headers: instance.defaultHeaders(),
    params,
  });
};

const approveKycDocument = async (id) => {
  return await instance.apiClient.patch(
    `/api/v1/admin/kyc-documents/${id}/approve`,
    {},
    {
      headers: instance.defaultHeaders(),
    },
  );
};

const rejectKycDocument = async (id, admin_note) => {
  return await instance.apiClient.patch(
    `/api/v1/admin/kyc-documents/${id}/reject`,
    { admin_note },
    {
      headers: instance.defaultHeaders(),
    },
  );
};

/* ========================== */
/* Admin: User Management     */
/* ========================== */

const getAllUsers = async (params = {}) => {
  return await instance.apiClient.get("/api/v1/admin/users", {
    headers: instance.defaultHeaders(),
    params,
  });
};

const createUser = async (data) => {
  return await instance.apiClient.post("/api/v1/admin/users", data, {
    headers: instance.defaultHeaders(),
  });
};

const getUserById = async (id) => {
  return await instance.apiClient.get(`/api/v1/admin/users/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

const updateUser = async (id, data) => {
  return await instance.apiClient.patch(`/api/v1/admin/users/${id}`, data, {
    headers: instance.defaultHeaders(),
  });
};

const deleteUser = async (id) => {
  return await instance.apiClient.delete(`/api/v1/admin/users/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

const approveUserAccount = async (id) => {
  return await instance.apiClient.patch(
    `/api/v1/admin/users/${id}/approve`,
    {},
    {
      headers: instance.defaultHeaders(),
    },
  );
};

/* ========================== */
/* Client: Withdrawal Requests */
/* ========================== */

const getActiveWithdrawalMethods = async () => {
  return await instance.apiClient.get("/api/v1/client/withdrawals/methods", {
    headers: instance.defaultHeaders(),
  });
};

const createWithdrawalRequest = async (data) => {
  return await instance.apiClient.post("/api/v1/client/withdrawals", data, {
    headers: instance.defaultHeaders(),
  });
};

const checkWithdrawalEligibility = async () => {
  return await instance.apiClient.get("/api/v1/client/withdrawals/eligibility", {
    headers: instance.defaultHeaders(),
  });
};

/* ========================== */
/* Admin: Withdrawal Requests */
/* ========================== */

const getAllWithdrawalRequests = async () => {
  return await instance.apiClient.get("/api/v1/admin/withdrawal-requests", {
    headers: instance.defaultHeaders(),
  });
};

const approveWithdrawalRequest = async (id) => {
  return await instance.apiClient.patch(
    `/api/v1/admin/withdrawal-requests/${id}/approve`,
    {},
    {
      headers: instance.defaultHeaders(),
    },
  );
};

const rejectWithdrawalRequest = async (id, admin_note) => {
  return await instance.apiClient.patch(
    `/api/v1/admin/withdrawal-requests/${id}/reject`,
    { admin_note },
    {
      headers: instance.defaultHeaders(),
    },
  );
};

/* ========================== */
/* Support Tickets            */
/* ========================== */

const createSupportTicket = async (data) => {
  return await instance.apiClient.post("/api/v1/client/support-tickets", data, {
    headers: instance.defaultHeaders("multipart/form-data"),
  });
};

const getMySupportTickets = async (params = {}) => {
  return await instance.apiClient.get("/api/v1/client/support-tickets", {
    headers: instance.defaultHeaders(),
    params,
  });
};

const getMySupportTicketById = async (id) => {
  return await instance.apiClient.get(`/api/v1/client/support-tickets/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

const addSupportMessage = async (ticketId, data) => {
  return await instance.apiClient.post(`/api/v1/client/support-tickets/${ticketId}/messages`, data, {
    headers: instance.defaultHeaders("multipart/form-data"),
  });
};

const getAllSupportTickets = async (params = {}) => {
  return await instance.apiClient.get("/api/v1/admin/support-tickets", {
    headers: instance.defaultHeaders(),
    params,
  });
};

const getSupportTicketById = async (id) => {
  return await instance.apiClient.get(`/api/v1/admin/support-tickets/${id}`, {
    headers: instance.defaultHeaders(),
  });
};

const addAdminSupportMessage = async (ticketId, data) => {
  return await instance.apiClient.post(`/api/v1/admin/support-tickets/${ticketId}/messages`, data, {
    headers: instance.defaultHeaders("multipart/form-data"),
  });
};

const closeSupportTicket = async (id) => {
  return await instance.apiClient.patch(
    `/api/v1/admin/support-tickets/${id}/close`,
    {},
    {
      headers: instance.defaultHeaders(),
    },
  );
};

/* ========================== */
/* Admin: Dashboard           */
/* ========================== */

const getAdminDashboardStats = async () => {
  return await instance.apiClient.get("/api/v1/admin/dashboard/stats", {
    headers: instance.defaultHeaders(),
  });
};

/* ========================== */
/* Export API                 */
/* ========================== */

const privateAPI = {
  // Auth
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,

  // Admin
  createDepositMethod,
  getAllDepositMethods,
  getDepositMethodById,
  updateDepositMethod,
  toggleDepositMethodStatus,
  getAllDepositRequests,
  approveDepositRequest,
  rejectDepositRequest,

  // Admin User Management
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  approveUserAccount,

  // Client
  getActiveDepositMethods,
  createDepositRequest,

  // Client Wallet
  getWalletBalance,
  getDepositHistory,
  getWithdrawalHistory,

  // Client Profile
  getProfile,
  updateProfile,
  uploadKycDocument,
  getKycDocuments,
  addWithdrawalMethod,
  getWithdrawalMethods,
  deleteWithdrawalMethod,
  changePassword,

  // Admin KYC
  getAllKycDocuments,
  approveKycDocument,
  rejectKycDocument,

  // Client Withdrawal
  getActiveWithdrawalMethods,
  createWithdrawalRequest,
  checkWithdrawalEligibility,

  // Admin Withdrawal
  getAllWithdrawalRequests,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,

  // Support Tickets
  createSupportTicket,
  getMySupportTickets,
  getMySupportTicketById,
  addSupportMessage,
  getAllSupportTickets,
  getSupportTicketById,
  addAdminSupportMessage,
  closeSupportTicket,

  // Admin Dashboard
  getAdminDashboardStats,
};

export default privateAPI;
