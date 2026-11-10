import { useState, useEffect, useCallback } from "react";
import {
  getAdminPages,
  createAdminPage,
  updateAdminPage,
  deleteAdminPage,
  restoreAdminPage,
  type AdminPageItem,
  type CreatePagePayload,
} from "../../../api/admin/admin.pages.api";
import MarkdownRenderer from "../../../components/MarkdownRenderer";
import RichTextEditor from "../../../components/admin/RichTextEditor";
import toast from "react-hot-toast";

type TabType = "active" | "trash";

const PageList = () => {
  const [tab, setTab] = useState<TabType>("active");
  const [pages, setPages] = useState<AdminPageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<AdminPageItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState<"write" | "preview">(
    "write",
  );

  // Form state
  const [form, setForm] = useState<CreatePagePayload>({
    title: "",
    slug: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    isActive: true,
  });

  // Delete & Restore confirmation modals
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminPages({
        page,
        limit: 15,
        search: search.trim() || undefined,
        includeDeleted: tab === "trash",
        isActive: tab === "active" ? undefined : undefined,
      });

      // When tab is 'trash', filter to deleted only if backend returns mixed
      const items =
        tab === "trash"
          ? data.items.filter((p) => p.isDeleted)
          : data.items.filter((p) => !p.isDeleted);

      setPages(items);
      setTotalPages(data.pagination.totalPages || 1);
      setTotal(data.pagination.total || items.length);
    } catch (err: any) {
      console.error("Failed to fetch pages", err);
      toast.error("Failed to load content pages");
    } finally {
      setLoading(false);
    }
  }, [page, search, tab]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Helper to generate a slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleOpenAdd = () => {
    setEditingPage(null);
    setForm({
      title: "",
      slug: "",
      content:
        "<h1>Page Title</h1><p>Welcome to this page. You can easily edit this text, use headings, bullet lists, or bold key words using the toolbar above.</p>",
      metaTitle: "",
      metaDescription: "",
      isActive: true,
    });
    setActiveEditorTab("write");
    setShowModal(true);
  };

  const handleOpenEdit = (item: AdminPageItem) => {
    setEditingPage(item);
    setForm({
      title: item.title,
      slug: item.slug,
      content: item.content,
      metaTitle: item.metaTitle || "",
      metaDescription: item.metaDescription || "",
      isActive: item.isActive,
    });
    setActiveEditorTab("write");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      toast.error("Title, slug, and content are required");
      return;
    }

    setSaving(true);
    try {
      if (editingPage) {
        await updateAdminPage(editingPage.id, form);
        toast.success("Page updated successfully");
      } else {
        await createAdminPage(form);
        toast.success("Page created successfully");
      }
      setShowModal(false);
      fetchPages();
    } catch (err: any) {
      console.error("Save page error", err);
      toast.error(err.response?.data?.message || "Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAdminPage(deleteId);
      toast.success("Page moved to trash");
      setDeleteId(null);
      fetchPages();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete page");
    }
  };

  const handleRestore = async () => {
    if (!restoreId) return;
    try {
      await restoreAdminPage(restoreId);
      toast.success("Page restored successfully");
      setRestoreId(null);
      fetchPages();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to restore page");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-text-main-light">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main-light">
            Static & Legal Pages (CMS)
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage Privacy Policy, Terms & Conditions, About Us, and other
            content pages.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-gradient text-background-main font-bold text-sm hover:brightness-110 shadow-lg shadow-primary/20 transition-all cursor-pointer shrink-0"
        >
          <span className="material-icons-outlined text-lg">add</span>
          Create New Page
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-background-light p-4 rounded-2xl border border-primary/10">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setTab("active");
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              tab === "active"
                ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                : "text-text-muted hover:bg-background-main border border-transparent"
            }`}
          >
            <span className="material-icons-outlined text-base">
              description
            </span>
            Active Pages
          </button>
          <button
            onClick={() => {
              setTab("trash");
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              tab === "trash"
                ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm"
                : "text-text-muted hover:bg-background-main border border-transparent"
            }`}
          >
            <span className="material-icons-outlined text-base">
              delete_outline
            </span>
            Trash / Deleted
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-background-main border border-primary/20 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-text-main-light placeholder-text-muted outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-background-light rounded-2xl border border-primary/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-primary/10 bg-background-main/50 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <th className="px-6 py-3.5">Page Title</th>
                <th className="px-6 py-3.5">Slug / URL</th>
                <th className="px-6 py-3.5">SEO Meta</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Last Updated</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-text-muted"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span>Loading pages...</span>
                    </div>
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-text-muted"
                  >
                    <span className="material-icons-outlined text-4xl opacity-40 block mb-2">
                      article
                    </span>
                    No pages found matching your search.
                  </td>
                </tr>
              ) : (
                pages.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-primary/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-text-main-light">
                        {item.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-background-main px-2 py-1 rounded text-primary font-mono border border-primary/10">
                        /pages/{item.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-xs text-text-muted">
                      {item.metaTitle || item.metaDescription ? (
                        <div>
                          <p className="truncate text-text-main-light font-medium">
                            {item.metaTitle || "-"}
                          </p>
                          <p className="truncate text-[10px] text-text-muted">
                            {item.metaDescription || "-"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-text-muted/60 italic">
                          Not set
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.isDeleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                          Deleted
                        </span>
                      ) : item.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-text-muted whitespace-nowrap">
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Live view button */}
                        {!item.isDeleted && (
                          <a
                            href={`/pages/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View public page"
                            className="p-1.5 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                          >
                            <span className="material-icons-outlined text-lg">
                              open_in_new
                            </span>
                          </a>
                        )}

                        {tab === "active" ? (
                          <>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              title="Edit Page"
                              className="p-1.5 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                            >
                              <span className="material-icons-outlined text-lg">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => setDeleteId(item.id)}
                              title="Delete Page"
                              className="p-1.5 text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                            >
                              <span className="material-icons-outlined text-lg">
                                delete
                              </span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setRestoreId(item.id)}
                            title="Restore Page"
                            className="p-1.5 text-text-muted hover:text-green-400 transition-colors rounded-lg hover:bg-green-500/10"
                          >
                            <span className="material-icons-outlined text-lg">
                              restore
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-primary/10 flex items-center justify-between text-xs text-text-muted">
            <span>
              Showing {pages.length} of {total} entries
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/5 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-background-light border border-primary/20 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-primary/10 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-bold text-text-main-light">
                  {editingPage ? "Edit Content Page" : "Create New Page"}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Publish legal, policy, and informational pages with visual
                  formatting tools.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-text-muted hover:text-text-main-light rounded-xl hover:bg-white/5"
              >
                <span className="material-icons-outlined">close</span>
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto p-6 space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Page Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        title: newTitle,
                        slug: editingPage ? prev.slug : generateSlug(newTitle),
                      }));
                    }}
                    placeholder="e.g. Terms & Conditions"
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        slug: generateSlug(e.target.value),
                      }))
                    }
                    placeholder="e.g. terms-and-conditions"
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-2.5 text-sm font-mono text-primary outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Meta Title (SEO)
                  </label>
                  <input
                    type="text"
                    value={form.metaTitle || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        metaTitle: e.target.value,
                      }))
                    }
                    placeholder="e.g. Terms & Conditions | Pinak Beauty"
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Meta Description (SEO)
                  </label>
                  <input
                    type="text"
                    value={form.metaDescription || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        metaDescription: e.target.value,
                      }))
                    }
                    placeholder="Brief summary for search engines..."
                    className="w-full bg-background-main border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-text-main-light outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Rich Visual Editor with Live Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <span className="text-primary font-bold">●</span> Page
                      Content (Rich Visual Editor) *
                    </label>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Format your text visually with headings, bold, italics,
                      lists, and links. No markdown knowledge needed.
                    </p>
                  </div>
                  <div className="flex gap-1 bg-background-main p-1 rounded-xl border border-primary/10">
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab("write")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeEditorTab === "write"
                          ? "bg-primary text-background-main"
                          : "text-text-muted hover:text-text-main-light"
                      }`}
                    >
                      Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab("preview")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeEditorTab === "preview"
                          ? "bg-primary text-background-main"
                          : "text-text-muted hover:text-text-main-light"
                      }`}
                    >
                      Live Preview
                    </button>
                  </div>
                </div>

                {activeEditorTab === "write" ? (
                  <RichTextEditor
                    value={form.content}
                    onChange={(newContent) =>
                      setForm((prev) => ({ ...prev, content: newContent }))
                    }
                    placeholder="Start typing your page content here..."
                  />
                ) : (
                  <div className="bg-background-main border border-primary/20 rounded-2xl p-6 min-h-[340px] max-h-[500px] overflow-y-auto">
                    <div className="mb-4 pb-3 border-b border-primary/10 flex items-center justify-between text-xs text-text-muted">
                      <span className="font-semibold text-primary">
                        Previewing Public Layout
                      </span>
                      <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded text-primary">
                        /pages/{form.slug || "slug"}
                      </span>
                    </div>
                    <MarkdownRenderer
                      content={
                        form.content ||
                        "<p><em>No content to preview yet.</em></p>"
                      }
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="page-active-toggle"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                />
                <label
                  htmlFor="page-active-toggle"
                  className="text-sm font-medium text-text-main-light cursor-pointer"
                >
                  Publish this page immediately (Active)
                </label>
              </div>

              <div className="pt-4 border-t border-primary/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold border border-primary/20 text-text-muted hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gold-gradient text-background-main font-bold text-sm hover:brightness-110 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingPage
                      ? "Update Page"
                      : "Create Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative bg-background-light border border-red-500/20 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
            <span className="material-icons-outlined text-4xl text-red-500 mb-4">
              delete_outline
            </span>
            <h3 className="text-lg font-display font-bold text-text-main-light mb-2">
              Move Page to Trash?
            </h3>
            <p className="text-sm text-text-muted mb-6">
              This page will be soft-deleted and removed from public access. You
              can restore it anytime from the Trash tab.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {restoreId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setRestoreId(null)}
          />
          <div className="relative bg-background-light border border-green-500/20 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
            <span className="material-icons-outlined text-4xl text-green-500 mb-4">
              restore
            </span>
            <h3 className="text-lg font-display font-bold text-text-main-light mb-2">
              Restore Page?
            </h3>
            <p className="text-sm text-text-muted mb-6">
              This page will be reactivated and will be accessible to public
              users again.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRestoreId(null)}
                className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm border border-primary/20 text-text-muted hover:bg-primary/5"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                className="flex-1 bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700"
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageList;
