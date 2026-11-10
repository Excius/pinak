import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import {
  listUsersAdmin,
  getUserAdmin,
  setUserStatusAdmin,
  deleteUserAdmin,
  type AdminUserSummary,
  type AdminUserDetail,
  type AdminUserListParams,
  type UserRole,
  type UserStatus,
} from "../../../api/admin/admin.users.api";
import { formatPaise } from "../../../utils/currency";

const ROLES: UserRole[] = ["ADMIN", "MODERATOR", "USER"];
const STATUSES: UserStatus[] = ["ACTIVE", "INACTIVE", "DELETED"];

const roleStyle: Record<UserRole, string> = {
  ADMIN: "bg-primary/15 text-primary border-primary/30",
  MODERATOR: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  USER: "bg-background-main text-text-muted border-primary/10",
};
const statusStyle: Record<UserStatus, string> = {
  ACTIVE: "bg-green-500/10 text-green-400",
  INACTIVE: "bg-yellow-500/10 text-yellow-400",
  DELETED: "bg-red-500/10 text-red-400",
};
const orderStatusStyle: Record<string, string> = {
  PENDING: "text-yellow-400",
  PROCESSING: "text-blue-400",
  SHIPPED: "text-purple-400",
  DELIVERED: "text-green-400",
  CANCELLED: "text-red-400",
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const errorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message || fallback;

const UserList = () => {
  const { user: me } = useAuth();
  // Only admins may change access; moderators can look but not touch
  const isAdmin = me?.role === "ADMIN";

  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [params, setParams] = useState<AdminUserListParams>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [searchText, setSearchText] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Debounce the search box so we do not query on every keystroke
  useEffect(() => {
    const t = setTimeout(
      () =>
        setParams((p) => ({
          ...p,
          search: searchText.trim() || undefined,
          page: 1,
        })),
      350,
    );
    return () => clearTimeout(t);
  }, [searchText]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    listUsersAdmin(params)
      .then((res) => {
        if (cancelled) return;
        setUsers(res.items);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "Failed to load users"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params, reloadKey]);

  const openDetail = async (id: string) => {
    setDetail(null);
    setDetailError("");
    setActionError("");
    setConfirmDelete(false);
    setDetailLoading(true);
    try {
      setDetail(await getUserAdmin(id));
    } catch (err) {
      setDetailError(errorMessage(err, "Failed to load user"));
    } finally {
      setDetailLoading(false);
    }
  };
  const closeDetail = () => {
    setDetail(null);
    setDetailError("");
    setDetailLoading(false);
    setActionError("");
    setConfirmDelete(false);
  };

  // Activate / deactivate / restore (PATCH) and delete (DELETE), then refresh the list and the panel
  const runAction = async (
    action: () => Promise<unknown>,
    successMessage: string,
  ) => {
    if (!detail) return;
    setActionBusy(true);
    setActionError("");
    try {
      await action();
      toast.success(successMessage);
      setConfirmDelete(false);
      setReloadKey((k) => k + 1);
      setDetail(await getUserAdmin(detail.id));
    } catch (err) {
      setActionError(errorMessage(err, "Action failed"));
    } finally {
      setActionBusy(false);
    }
  };

  const page = params.page ?? 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-main-light">
          Users
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Customers and staff accounts. {total} {total === 1 ? "user" : "users"}{" "}
          match.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">
            search
          </span>
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search name, username or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-background-light border border-primary/20 rounded-xl text-sm text-text-main-light outline-none focus:border-primary/50"
          />
        </div>
        <select
          value={params.role ?? ""}
          onChange={(e) =>
            setParams((p) => ({
              ...p,
              role: (e.target.value || undefined) as UserRole | undefined,
              page: 1,
            }))
          }
          className="bg-background-light border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary/50"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={params.status ?? ""}
          onChange={(e) =>
            setParams((p) => ({
              ...p,
              status: (e.target.value || undefined) as UserStatus | undefined,
              page: 1,
            }))
          }
          className="bg-background-light border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary/50"
        >
          <option value="">Active &amp; inactive</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()} only
            </option>
          ))}
        </select>
        <select
          value={`${params.sortBy}:${params.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split(":") as [
              AdminUserListParams["sortBy"],
              AdminUserListParams["sortOrder"],
            ];
            setParams((p) => ({ ...p, sortBy, sortOrder, page: 1 }));
          }}
          className="bg-background-light border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary/50"
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="name:asc">Name A–Z</option>
          <option value="email:asc">Email A–Z</option>
        </select>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-background-light rounded-2xl border border-primary/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-light/50 border-b border-primary/10 text-xs tracking-widest text-primary/70 uppercase">
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Orders</th>
                <th className="px-6 py-4 font-bold text-right">Total spent</th>
                <th className="px-6 py-4 font-bold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-text-muted"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-text-muted"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => openDetail(u.id)}
                    className="border-b border-primary/5 hover:bg-background-light/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-text-main-light">
                        {u.name || u.username}
                      </p>
                      <p className="text-xs text-text-muted">
                        {u.email}
                        {!u.isEmailVerified && (
                          <span className="ml-2 text-yellow-400">
                            · unverified
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md border text-[11px] font-bold ${roleStyle[u.role]}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${statusStyle[u.status]}`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-text-main-light">
                      {u.orderCount}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-primary">
                      {u.totalSpent > 0 ? formatPaise(u.totalSpent) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">
                      {formatDate(u.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-primary/10 flex items-center justify-between text-sm text-text-muted bg-background-light/50">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setParams((p) => ({ ...p, page: page - 1 }))}
              className="px-3.5 py-1.5 border border-primary/20 rounded-xl hover:bg-primary/5 disabled:opacity-50 text-xs font-bold transition-all cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setParams((p) => ({ ...p, page: page + 1 }))}
              className="px-3.5 py-1.5 border border-primary/20 rounded-xl hover:bg-primary/5 disabled:opacity-50 text-xs font-bold transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {(detail || detailLoading || detailError) && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeDetail}
          />
          <div className="relative w-full max-w-lg h-full bg-background-light border-l border-primary/20 shadow-2xl overflow-y-auto p-6 space-y-6">
            <button
              onClick={closeDetail}
              className="absolute top-4 right-4 text-text-muted hover:text-primary cursor-pointer"
              aria-label="Close"
            >
              <span className="material-icons-outlined">close</span>
            </button>

            {detailLoading && (
              <p className="text-sm text-text-muted">Loading user...</p>
            )}
            {detailError && (
              <p className="text-sm text-red-400" role="alert">
                {detailError}
              </p>
            )}

            {detail && (
              <>
                <div>
                  <h2 className="text-xl font-display font-bold text-text-main-light">
                    {detail.name || detail.username}
                  </h2>
                  <p className="text-sm text-text-muted">
                    @{detail.username} · {detail.email}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span
                      className={`px-2.5 py-1 rounded-md border text-[11px] font-bold ${roleStyle[detail.role]}`}
                    >
                      {detail.role}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${statusStyle[detail.status]}`}
                    >
                      {detail.status}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${detail.isEmailVerified ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}
                    >
                      {detail.isEmailVerified
                        ? "Email verified"
                        : "Email not verified"}
                    </span>
                    {detail.authProviders.map((a) => (
                      <span
                        key={a.provider}
                        className="px-2.5 py-1 rounded-md bg-background-main border border-primary/10 text-[11px] font-bold text-text-muted"
                      >
                        {a.provider} sign-in
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-3">
                    Joined {formatDate(detail.createdAt)}
                  </p>
                </div>

                {/* Account access (admins only; never on your own account) */}
                {isAdmin && detail.id !== me?.id && (
                  <section className="p-4 rounded-xl border border-primary/10 bg-background-main/40 space-y-3">
                    <h3 className="text-xs font-bold tracking-widest text-primary/70 uppercase">
                      Account access
                    </h3>
                    {actionError && (
                      <div
                        className="p-3 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400"
                        role="alert"
                      >
                        {actionError}
                      </div>
                    )}
                    {detail.status === "DELETED" ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-xs text-text-muted flex-1 min-w-[200px]">
                          This account is deleted and cannot sign in.
                        </p>
                        <button
                          disabled={actionBusy}
                          onClick={() =>
                            runAction(
                              () => setUserStatusAdmin(detail.id, "ACTIVE"),
                              "User restored",
                            )
                          }
                          className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                        >
                          Restore account
                        </button>
                      </div>
                    ) : confirmDelete ? (
                      <div className="space-y-3">
                        <p className="text-sm text-red-400">
                          Delete <strong>{detail.email}</strong>? They are
                          signed out everywhere and can no longer log in. Their
                          orders and addresses are kept. You can restore the
                          account later.
                        </p>
                        <div className="flex gap-3">
                          <button
                            disabled={actionBusy}
                            onClick={() =>
                              runAction(
                                () => deleteUserAdmin(detail.id),
                                "User deleted",
                              )
                            }
                            className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                          >
                            {actionBusy ? "Deleting..." : "Yes, delete"}
                          </button>
                          <button
                            disabled={actionBusy}
                            onClick={() => setConfirmDelete(false)}
                            className="flex-1 px-4 py-2 rounded-xl border border-primary/20 text-text-muted text-xs font-bold hover:bg-primary/5 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {detail.status === "ACTIVE" ? (
                          <button
                            disabled={actionBusy}
                            onClick={() =>
                              runAction(
                                () => setUserStatusAdmin(detail.id, "INACTIVE"),
                                "User deactivated and signed out",
                              )
                            }
                            className="px-4 py-2 rounded-xl border border-yellow-500/40 text-yellow-400 text-xs font-bold hover:bg-yellow-500/10 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                          >
                            <span className="material-icons-outlined text-base">
                              block
                            </span>
                            Deactivate
                          </button>
                        ) : (
                          <button
                            disabled={actionBusy}
                            onClick={() =>
                              runAction(
                                () => setUserStatusAdmin(detail.id, "ACTIVE"),
                                "User activated",
                              )
                            }
                            className="px-4 py-2 rounded-xl border border-green-500/40 text-green-400 text-xs font-bold hover:bg-green-500/10 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                          >
                            <span className="material-icons-outlined text-base">
                              check_circle
                            </span>
                            Activate
                          </button>
                        )}
                        <button
                          disabled={actionBusy}
                          onClick={() => setConfirmDelete(true)}
                          className="px-4 py-2 rounded-xl border border-red-500/40 text-red-400 text-xs font-bold hover:bg-red-500/10 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="material-icons-outlined text-base">
                            delete
                          </span>
                          Delete
                        </button>
                        <p className="w-full text-[11px] text-text-muted">
                          Deactivated users cannot sign in and are signed out
                          immediately; their data stays.
                        </p>
                      </div>
                    )}
                  </section>
                )}

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Orders", value: String(detail.stats.orderCount) },
                    {
                      label: "Total spent",
                      value:
                        detail.stats.totalSpent > 0
                          ? formatPaise(detail.stats.totalSpent)
                          : "—",
                    },
                    {
                      label: "Active sessions",
                      value: String(detail.stats.activeSessions),
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="p-3 rounded-xl bg-background-main border border-primary/10"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold">
                        {s.label}
                      </p>
                      <p className="text-lg font-bold text-text-main-light mt-1">
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>

                <section className="space-y-3">
                  <h3 className="text-xs font-bold tracking-widest text-primary/70 uppercase">
                    Addresses ({detail.addresses.length})
                  </h3>
                  {detail.addresses.length === 0 ? (
                    <p className="text-sm text-text-muted">
                      No saved addresses.
                    </p>
                  ) : (
                    detail.addresses.map((a) => (
                      <div
                        key={a.id}
                        className="p-3 rounded-xl bg-background-main border border-primary/10 text-sm"
                      >
                        <p className="font-semibold text-text-main-light">
                          {a.fullName}
                          {a.label && (
                            <span className="ml-2 text-xs text-text-muted font-normal">
                              {a.label}
                            </span>
                          )}
                          {a.isDefault && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-bold">
                              DEFAULT
                            </span>
                          )}
                        </p>
                        <p className="text-text-muted">
                          {[a.addressLine1, a.addressLine2]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <p className="text-text-muted">
                          {a.city}, {a.state} - {a.pincode}
                        </p>
                        <p className="text-text-muted">Phone: {a.phone}</p>
                      </div>
                    ))
                  )}
                </section>

                <section className="space-y-3">
                  <h3 className="text-xs font-bold tracking-widest text-primary/70 uppercase">
                    Recent orders
                  </h3>
                  {detail.orders.length === 0 ? (
                    <p className="text-sm text-text-muted">No orders yet.</p>
                  ) : (
                    detail.orders.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-background-main border border-primary/10 text-sm"
                      >
                        <div>
                          <p className="font-mono font-semibold text-text-main-light">
                            #{o.id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-text-muted">
                            {formatDate(o.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {formatPaise(o.totalAmount)}
                          </p>
                          <p
                            className={`text-[11px] font-bold ${orderStatusStyle[o.status] ?? "text-text-muted"}`}
                          >
                            {o.status} · pay {o.paymentStatus}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
