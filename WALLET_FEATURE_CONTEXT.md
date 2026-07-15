# Wallet Feature — Codebase Context

Scoped context for planning a new wallet-related feature in the TradersRoom frontend (React 19 + Vite, Tailwind v4, JS not TS, path alias `@` → `src/`). This is not full project documentation — only what's relevant to building on top of the existing wallet/deposit/withdrawal surface.

---

## 1. What already exists (wallet-adjacent)

**Client-facing (`src/pages/client/`)**
```
deposits/
├── index.jsx                        # list of active deposit methods -> pick one
├── DepositRequest.jsx                 # form to submit a deposit request for a chosen method
└── components/
    ├── DepositMethodsList.jsx
    ├── DepositMethodDetails.jsx
    └── DepositRequestForm.jsx

withdrawals/
├── index.jsx
└── components/WithdrawalRequestForm.jsx

wallet-history/
├── index.jsx                          # tabbed Deposits / Withdrawals history view
└── components/
    ├── DepositHistoryTable.jsx
    ├── WithdrawalHistoryTable.jsx
    └── ViewWithdrawalDetailsModal.jsx

profile/components/
├── AddWithdrawalMethodsForm.jsx        # client adds their payout method (bank/crypto)
└── WithdrawalMethodsTable.jsx
```

**Admin-facing (`src/pages/admin/`)**
```
deposit-methods/                        # admin CRUD for available deposit methods (bank/crypto), enable/disable
├── index.jsx
├── AddOrEditDepositMethod.jsx
└── components/ (DepositMethodForm, DepositMethodsTable, ViewDepositMethodModal)

deposit-requests/                       # admin approve/reject client deposit submissions (with proof image)
├── index.jsx
└── components/DepositRequestsTable.jsx

withdrawal-requests/                    # admin approve/reject client withdrawal submissions
├── index.jsx
└── components/ (WithdrawalRequestsTable, ViewWithdrawalRequestModal)
```

**Sidebar wallet balance widget:** `src/layouts/components/SidebarWallet.jsx` — fetches and displays `getWalletBalance()` in the sidebar on every authenticated page.

If the new feature touches balances, deposits, or withdrawals, it most likely slots in next to one of these.

---

## 2. Wallet-related API surface

All calls live in one flat file, `src/services/private.api.js`, grouped by comment headers, and re-exported as a single `privateAPI` object consumed via `API.private.<fn>()`.

**Existing wallet endpoints:**
```js
// Client: Wallet
getWalletBalance()                          // GET  /api/v1/client/wallet/balance
getDepositHistory()                         // GET  /api/v1/client/wallet/deposit-history
getWithdrawalHistory()                      // GET  /api/v1/client/wallet/withdrawal-history

// Client: Deposits
getActiveDepositMethods()                   // GET  /api/v1/client/deposits/methods
createDepositRequest(formData)              // POST /api/v1/client/deposits            (multipart — proof upload)

// Client: Withdrawals
getActiveWithdrawalMethods()                // GET  /api/v1/client/withdrawals/methods
createWithdrawalRequest(data)                // POST /api/v1/client/withdrawals
checkWithdrawalEligibility()                 // GET  /api/v1/client/withdrawals/eligibility

// Client: Profile (payout methods)
addWithdrawalMethod(data)                    // POST   /api/v1/client/profile/withdrawal-methods
getWithdrawalMethods()                       // GET    /api/v1/client/profile/withdrawal-methods
deleteWithdrawalMethod(id)                   // DELETE /api/v1/client/profile/withdrawal-methods/:id

// Admin: Deposit Methods
createDepositMethod(formData)                // POST  /api/v1/admin/deposit-methods       (multipart)
getAllDepositMethods()                       // GET   /api/v1/admin/deposit-methods
getDepositMethodById(id)                     // GET   /api/v1/admin/deposit-methods/:id
updateDepositMethod(id, formData)            // PUT   /api/v1/admin/deposit-methods/:id   (multipart)
toggleDepositMethodStatus(id, status)        // PATCH /api/v1/admin/deposit-methods/:id/status

// Admin: Deposit Requests
getAllDepositRequests(page, limit)           // GET   /api/v1/admin/deposit-requests
approveDepositRequest(id)                    // PATCH /api/v1/admin/deposit-requests/:id/approve
rejectDepositRequest(id, admin_note)         // PATCH /api/v1/admin/deposit-requests/:id/reject

// Admin: Withdrawal Requests
getAllWithdrawalRequests()                   // GET   /api/v1/admin/withdrawal-requests
approveWithdrawalRequest(id)                 // PATCH /api/v1/admin/withdrawal-requests/:id/approve
rejectWithdrawalRequest(id, admin_note)      // PATCH /api/v1/admin/withdrawal-requests/:id/reject
```

A new wallet function should be added to this same file, following the existing naming (`get`/`create`/`approve`/`reject` + noun) and grouped under a matching `/* ========== */` comment header, then added to the `privateAPI` export object at the bottom.

**Response envelope convention** (consistent across every call site):
```js
const res = await API.private.someCall(...);
if (res.status === 200 && res.data.code === "OK") {
  // success payload at res.data.data.<thing>
} else {
  Notification.error(res.data.error || "Fallback message.");
}
// in catch:
const msg = error.response?.data?.error || "Fallback message.";
Notification.error(msg);
```
Paginated lists return `{ data: { <items>: [...], page, totalPages } }`.

---

## 3. Axios client (`src/lib/axios.js`)

Single shared instance, no interceptors — auth token is attached manually per-call via a header builder.

```js
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const getAuthToken = () => localStorage.getItem("tradersroom.token");

const defaultHeaders = (contentType = "application/json") => {
  const authToken = getAuthToken();
  return {
    "X-Request-Id": uuidv4(),
    "Content-Type": contentType,
    Accept: "application/json",
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  };
};

const publicHeaders = () => ({
  "X-Request-Id": uuidv4(),
  "Content-Type": "application/json",
  Accept: "application/json",
});

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_TRADERSROOM_API_BASEURL,
  timeout: 30000,
});

export default { apiClient, defaultHeaders, publicHeaders };
```
Every service function calls `instance.apiClient.<method>(url, [body], { headers: instance.defaultHeaders(), params? })`. File uploads (proof images, deposit method logos) swap in `defaultHeaders("multipart/form-data")`.

There is **no 401/response interceptor** — auth failures are handled ad hoc where they occur (see `SidebarWallet.jsx`: on a 401 it manually calls `token.removeAuthToken()` / `removeUserData()` and redirects to `/login`). If the new feature needs consistent session-expiry handling, that pattern isn't centralized yet.

---

## 4. State management

- No Redux/Zustand/global store. Plain `useState`/`useEffect` per page — the `index.jsx` of a feature folder owns data + handlers, child components in `components/` are presentational and receive props/callbacks.
- Auth/user identity is **not** in React state — it's read straight from `localStorage` via `src/lib/utilities.js` (`token.getAuthToken()`, `token.getUserData()`, `token.isAuthenticated()`). No `AuthContext`.
- The only React Context in the app is `ThemeContext` (light/dark mode) — irrelevant to wallet logic beyond styling.

---

## 5. UI pattern to reuse (list + approve/reject with note + view detail)

`admin/deposit-requests` is the closest existing template for "list of wallet-related items with a per-row approve/reject action" (it also handles a view-proof-image modal, useful if the new feature needs to show supporting evidence).

**`src/pages/admin/deposit-requests/index.jsx`** — container: fetch, page, approve/reject handlers, `actionLoading` flag
```jsx
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
      Notification.error(error.response?.data?.message || "Failed to fetch deposit requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(1); }, [fetchRequests]);

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
      Notification.error(error.response?.data?.message || "Failed to approve request.");
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
      Notification.error(error.response?.data?.message || "Failed to reject request.");
    } finally {
      setActionLoading(false);
    }
  }

  function handlePageChange(page) {
    const pageNumber = Number(page);
    if (!pageNumber || pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) return;
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
```

**`src/pages/admin/deposit-requests/components/DepositRequestsTable.jsx`** — table + confirm modal (with optional rejection note) + view-proof modal
```jsx
import React, { useState } from "react";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import { formatDate } from "@/utils/formatDate";

const apiBaseUrl = import.meta.env.VITE_TRADERSROOM_API_BASEURL;

function DepositRequestsTable({ requests, onApprove, onReject, currentPage, totalPages, onPageChange, actionLoading = false }) {
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, request: null });
  const [rejectionNote, setRejectionNote] = useState("");
  const [proofModal, setProofModal] = useState({ open: false, proofPath: "" });

  function handleActionClick(action, request) {
    setRejectionNote("");
    setConfirmModal({ open: true, action, request });
  }

  async function confirmAction() {
    if (!confirmModal.request) return;
    if (confirmModal.action === "approve") await onApprove(confirmModal.request);
    if (confirmModal.action === "reject") await onReject(confirmModal.request, rejectionNote);
    setConfirmModal({ open: false, action: null, request: null });
    setRejectionNote("");
  }

  function handleViewProof(proofPath) {
    setProofModal({ open: true, proofPath: proofPath || "" });
  }

  function handleCloseConfirmModal() {
    if (actionLoading) return;
    setConfirmModal({ open: false, action: null, request: null });
    setRejectionNote("");
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
            <button type="button" onClick={() => handleViewProof(request.proof_path)}
              className="inline-flex items-center rounded border border-gray-300 px-2 py-1 transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">
              <Icon icon="mdi:eye" width="18" className="text-gray-800 dark:text-gray-200" />
            </button>
            {request.status === "pending" && (
              <>
                <button type="button" onClick={() => handleActionClick("approve", request)} disabled={actionLoading}
                  className="inline-flex items-center rounded border border-green-300 px-2 py-1 text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900">
                  <Icon icon="mdi:check" width="18" />
                </button>
                <button type="button" onClick={() => handleActionClick("reject", request)} disabled={actionLoading}
                  className="inline-flex items-center rounded border border-red-300 px-2 py-1 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900">
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

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} className="mt-4" />}

      <Modal isOpen={confirmModal.open} onClose={handleCloseConfirmModal}
        title={confirmModal.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}>
        <div className="space-y-4">
          <p className="text-gray-800 dark:text-gray-200">
            Are you sure you want to <strong>{confirmModal.action === "approve" ? "approve" : "reject"}</strong> this deposit request?
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
            <button type="button" onClick={handleCloseConfirmModal} disabled={actionLoading}
              className="rounded border border-gray-300 px-4 py-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button type="button" onClick={confirmAction} disabled={actionLoading}
              className="rounded bg-accent px-4 py-2 font-medium text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60">
              {actionLoading ? "Processing..." : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={proofModal.open} onClose={() => setProofModal({ open: false, proofPath: "" })} title="Proof of Deposit" size="md" centered>
        <div className="flex items-center justify-center">
          {proofModal.proofPath ? (
            <img src={`${apiBaseUrl}/${proofModal.proofPath}`} alt="Proof" className="max-h-[400px] max-w-full rounded shadow" />
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No proof available.</p>
          )}
        </div>
      </Modal>
    </>
  );
}

export default DepositRequestsTable;
```

**Sidebar wallet balance widget** (`src/layouts/components/SidebarWallet.jsx`) — shows the one place a "live" wallet number is fetched/displayed; also the one place with ad-hoc 401 handling:
```jsx
const res = await API.private.getWalletBalance();
if (res.data.code === "OK") {
  setWalletBalance(res.data.data.balance);
}
// on 401 in catch: token.removeAuthToken(); token.removeUserData(); navigate("/login");
```
If the new feature changes balance, this widget likely needs to reflect it too (no shared "balance" store to invalidate — it only fetches once on mount).

**Shared primitives used everywhere:** `Table` (columns + `renderCell` switch), `Modal` (Headless UI `Dialog`/`Transition` wrapper), `Badge` (status pill), `Pagination`, `Notification` (react-toastify wrapper: `.success/.error/.warning`), `Spinner`, `Icon` (`@iconify/react`, `mdi:*` icon set). All styled with Tailwind v4 utility classes with `dark:` variants — no component library, no GSAP/animation library beyond Headless UI's built-in transitions.

---

## 6. Routing

Routes are declared as plain arrays in `src/App.jsx` (no separate routes file), all wrapped in the same `PrivateRoute` (auth-only, **no role check** — see caveat below):

```jsx
const clientRoutes = [
  { path: "/deposits", element: DepositsPage },
  { path: "/deposits/new/:methodId", element: DepositRequestPage },
  { path: "/withdrawals", element: WithdrawalsPage },
  { path: "/wallet-history", element: WalletHistoryPage },
  // ...
];

const adminRoutes = [
  { path: "/admin/deposit-requests", element: DepositRequestsPage },
  { path: "/admin/deposit-methods", element: DepositMethodsPage },
  { path: "/admin/deposit-methods/new", element: AddOrEditDepositMethod },
  { path: "/admin/deposit-methods/:id/edit", element: AddOrEditDepositMethod },
  { path: "/admin/withdrawal-requests", element: WithdrawalRequestsPage },
  // ...
];

{adminRoutes.map((route, idx) => (
  <Route key={idx} path={route.path} element={<PrivateRoute><route.element /></PrivateRoute>} />
))}
```

`src/components/PrivateRoute.jsx`:
```jsx
import { Navigate } from "react-router-dom";
import token from "@/lib/utilities";

const PrivateRoute = ({ children }) => {
  if (!token.isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
};
```

⚠️ **Caveat:** admin routes use the same guard as client routes — it only checks token presence, not `role === "admin"`. Role is only consulted once, at the `/` redirect in `App.jsx`. A new admin-only wallet route would inherit this same gap unless a role check is added.

---

## 7. Conventions to follow for the new feature

- New page → `src/pages/<client|admin>/<feature-kebab-case>/index.jsx`, with a co-located `components/` folder for its table/modal/form pieces.
- New API calls → add to `src/services/private.api.js` under a matching comment-header section, export via the `privateAPI` object.
- Register new routes in the relevant array (`clientRoutes`/`adminRoutes`) in `src/App.jsx`, always wrapped in `PrivateRoute`.
- Match the response envelope (`res.data.code === "OK"`, unwrap `res.data.data`, errors via `res.data.error` / `error.response?.data?.error`) and surface all outcomes through `Notification.success/error`.
- Reuse `Table` + `Modal` + `Badge` + `Pagination` + `Spinner` + `Icon` rather than building new primitives.
