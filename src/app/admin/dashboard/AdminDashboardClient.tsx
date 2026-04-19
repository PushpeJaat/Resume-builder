"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Loader2, RefreshCw, Shield, Trash2 } from "lucide-react";

type AdminStats = {
  users: number;
  resumes: number;
  downloads: number;
  payments: number;
  paidPayments: number;
  blogs: number;
};

type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  plan: "FREE" | "PREMIUM";
  createdAt: string;
  resumeCount: number;
  downloadCount: number;
  paymentCount: number;
};

type AdminResumeRow = {
  id: string;
  title: string;
  templateId: string;
  updatedAt: string;
  userId: string;
  userEmail: string;
  userName: string | null;
};

type AdminPaymentRow = {
  id: string;
  provider: string;
  orderId: string;
  status: "CREATED" | "PAID" | "FAILED" | "CANCELLED" | "EXPIRED";
  providerStatus: string | null;
  amountInPaise: number;
  currency: string;
  createdAt: string;
  paymentConfirmedAt: string | null;
  resumeId: string;
  resumeTitle: string;
  resumeTemplateId: string;
  userId: string;
  userEmail: string;
  userName: string | null;
};

type AdminBlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  authorName: string;
};

type DashboardPayload = {
  stats: AdminStats;
  users: AdminUserRow[];
  resumes: AdminResumeRow[];
  payments: AdminPaymentRow[];
};

function statusBadgeClass(status: AdminPaymentRow["status"]): string {
  if (status === "PAID") return "border-emerald-300/40 bg-emerald-500/15 text-emerald-200";
  if (status === "FAILED") return "border-red-300/35 bg-red-500/15 text-red-200";
  if (status === "CANCELLED") return "border-rose-300/35 bg-rose-500/15 text-rose-200";
  if (status === "EXPIRED") return "border-amber-300/35 bg-amber-500/15 text-amber-200";
  return "border-sky-300/35 bg-sky-500/15 text-sky-200";
}

export function AdminDashboardClient() {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [blogs, setBlogs] = useState<AdminBlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);
  const [creatingBlog, setCreatingBlog] = useState(false);

  const [blogTitle, setBlogTitle] = useState("");
  const [blogCategory, setBlogCategory] = useState("Guides");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [dashboardResponse, blogsResponse] = await Promise.all([
        fetch("/api/admin/dashboard", { cache: "no-store" }),
        fetch("/api/admin/blogs", { cache: "no-store" }),
      ]);

      if (!dashboardResponse.ok || !blogsResponse.ok) {
        throw new Error("Could not load admin data.");
      }

      const dashboardPayload = (await dashboardResponse.json()) as DashboardPayload;
      const blogsPayload = (await blogsResponse.json()) as { posts: AdminBlogRow[] };

      setDashboard(dashboardPayload);
      setBlogs(blogsPayload.posts || []);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Could not load admin data.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const statCards = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return [
      { label: "Total users", value: dashboard.stats.users },
      { label: "Total resumes", value: dashboard.stats.resumes },
      { label: "Downloads", value: dashboard.stats.downloads },
      { label: "Payment orders", value: dashboard.stats.payments },
      { label: "Paid orders", value: dashboard.stats.paidPayments },
      { label: "Blog posts", value: dashboard.stats.blogs },
    ];
  }, [dashboard]);

  async function updateUserPlan(userId: string, plan: "FREE" | "PREMIUM") {
    setSavingUserId(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user plan.");
      }

      setDashboard((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          users: previous.users.map((user) => (user.id === userId ? { ...user, plan } : user)),
        };
      });
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : "Failed to update user plan.";
      alert(message);
    } finally {
      setSavingUserId(null);
    }
  }

  async function deleteUser(userId: string) {
    const confirmed = confirm("Delete this user and all linked resumes, downloads, and payments?");
    if (!confirmed) {
      return;
    }

    setDeletingUserId(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to delete user.");
      }

      setDashboard((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          users: previous.users.filter((user) => user.id !== userId),
          stats: {
            ...previous.stats,
            users: Math.max(0, previous.stats.users - 1),
          },
        };
      });
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Failed to delete user.";
      alert(message);
    } finally {
      setDeletingUserId(null);
    }
  }

  async function createBlogPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCreatingBlog(true);
    try {
      const response = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: blogTitle,
          category: blogCategory,
          excerpt: blogExcerpt,
          content: blogContent,
          isPublished: true,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { post?: AdminBlogRow; error?: unknown }
        | null;

      if (!response.ok || !payload?.post) {
        throw new Error("Could not create blog post. Check the form values.");
      }

      setBlogs((previous) => [payload.post as AdminBlogRow, ...previous]);
      setDashboard((previous) =>
        previous
          ? {
              ...previous,
              stats: {
                ...previous.stats,
                blogs: previous.stats.blogs + 1,
              },
            }
          : previous,
      );
      setBlogTitle("");
      setBlogCategory("Guides");
      setBlogExcerpt("");
      setBlogContent("");
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "Could not create blog post.";
      alert(message);
    } finally {
      setCreatingBlog(false);
    }
  }

  async function deleteBlogPost(id: string) {
    const confirmed = confirm("Delete this blog post?");
    if (!confirmed) {
      return;
    }

    setDeletingBlogId(id);
    try {
      const response = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Could not delete blog post.");
      }

      setBlogs((previous) => previous.filter((blog) => blog.id !== id));
      setDashboard((previous) =>
        previous
          ? {
              ...previous,
              stats: {
                ...previous.stats,
                blogs: Math.max(0, previous.stats.blogs - 1),
              },
            }
          : previous,
      );
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Could not delete blog post.";
      alert(message);
    } finally {
      setDeletingBlogId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-sm text-slate-200">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading admin dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[28px] border border-cyan-300/20 bg-[radial-gradient(circle_at_top_right,_rgba(6,182,212,0.18),_transparent_36%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.16),_transparent_32%),rgba(15,23,42,0.95)] p-6 shadow-2xl shadow-black/25 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
                <Shield className="h-3.5 w-3.5" />
                Admin Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">CVpilot Control Center</h1>
              <p className="mt-2 text-sm text-slate-300">
                Separate admin workspace with direct control over users, payments, blogs, and extracted resume records.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void refresh()}
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
              <Link
                href="/admin/extracted-resumes"
                className="rounded-lg border border-cyan-300/35 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
              >
                Extracted resumes
              </Link>
              <button
                type="button"
                onClick={() => void signOut({ callbackUrl: "/admin" })}
                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((card) => (
            <article key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/20">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-white">{card.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-white">User access control</h2>
            <p className="mt-1 text-sm text-slate-400">Promote users to PREMIUM or remove accounts.</p>
          </div>

          {!dashboard || dashboard.users.length === 0 ? (
            <div className="p-6 text-sm text-slate-300">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-200">
                <thead className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-[0.15em] text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold">User</th>
                    <th className="px-5 py-3 font-semibold">Plan</th>
                    <th className="px-5 py-3 font-semibold">Activity</th>
                    <th className="px-5 py-3 font-semibold">Created</th>
                    <th className="px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {dashboard.users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-semibold text-white">{user.name || "-"}</p>
                        <p className="mt-1 text-xs text-slate-400">{user.email}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <select
                          value={user.plan}
                          onChange={(event) => void updateUserPlan(user.id, event.target.value as "FREE" | "PREMIUM")}
                          disabled={savingUserId === user.id}
                          className="rounded-lg border border-white/15 bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white outline-none"
                        >
                          <option value="FREE">FREE</option>
                          <option value="PREMIUM">PREMIUM</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-300">
                        <p>Resumes: {user.resumeCount}</p>
                        <p>Downloads: {user.downloadCount}</p>
                        <p>Payments: {user.paymentCount}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <button
                          type="button"
                          onClick={() => void deleteUser(user.id)}
                          disabled={deletingUserId === user.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-300/35 px-2.5 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {deletingUserId === user.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="mt-8 grid gap-8 xl:grid-cols-2">
          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-white">Create blog post</h2>
              <p className="mt-1 text-sm text-slate-400">Publish a new article on the public blog page.</p>
            </div>
            <form onSubmit={createBlogPost} className="space-y-4 p-5 sm:p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">Title</label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={blogTitle}
                  onChange={(event) => setBlogTitle(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">Category</label>
                <input
                  type="text"
                  value={blogCategory}
                  onChange={(event) => setBlogCategory(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">Excerpt (optional)</label>
                <textarea
                  rows={2}
                  value={blogExcerpt}
                  onChange={(event) => setBlogExcerpt(event.target.value)}
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">Content</label>
                <textarea
                  rows={8}
                  required
                  minLength={40}
                  value={blogContent}
                  onChange={(event) => setBlogContent(event.target.value)}
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={creatingBlog}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {creatingBlog ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {creatingBlog ? "Publishing..." : "Publish blog post"}
              </button>
            </form>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-white">Published blogs</h2>
              <p className="mt-1 text-sm text-slate-400">Latest posts shown on /blog.</p>
            </div>
            {blogs.length === 0 ? (
              <div className="p-6 text-sm text-slate-300">No blog posts yet.</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {blogs.map((blog) => (
                  <li key={blog.id} className="px-5 py-4 sm:px-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{blog.title}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          /blog/{blog.slug} · {blog.category} · {new Date(blog.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void deleteBlogPost(blog.id)}
                        disabled={deletingBlogId === blog.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-300/35 px-2.5 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {deletingBlogId === blog.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-2">
          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-white">Recent resumes</h2>
              <p className="mt-1 text-sm text-slate-400">Latest updated resumes across all users.</p>
            </div>
            {!dashboard || dashboard.resumes.length === 0 ? (
              <div className="p-6 text-sm text-slate-300">No resumes found.</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {dashboard.resumes.slice(0, 18).map((resume) => (
                  <li key={resume.id} className="px-5 py-4 sm:px-6">
                    <p className="text-sm font-semibold text-white">{resume.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {resume.userName || resume.userEmail} · {resume.templateId} · Updated {new Date(resume.updatedAt).toLocaleString()}
                    </p>
                    <Link href={`/editor/${resume.id}`} className="mt-2 inline-flex text-xs font-semibold text-cyan-200 transition hover:text-cyan-100">
                      Open resume
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-white">Recent payment orders</h2>
              <p className="mt-1 text-sm text-slate-400">Latest 20 checkout attempts.</p>
            </div>
            {!dashboard || dashboard.payments.length === 0 ? (
              <div className="p-6 text-sm text-slate-300">No payment orders found.</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {dashboard.payments.slice(0, 20).map((payment) => (
                  <li key={payment.id} className="px-5 py-4 sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{payment.userName || payment.userEmail}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {payment.resumeTitle} · {new Date(payment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${statusBadgeClass(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
