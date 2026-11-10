"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Mail,
  Settings,
  Megaphone,
  LogOut,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  ExternalLink,
  Loader2,
  Lock,
  Globe,
  TrendingUp,
  Clock,
  Shield,
  Eye,
} from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "blog" | "faqs" | "messages" | "settings" | "ads"
  >("overview");

  // Login form state
  const [email, setEmail] = useState("admin@mediasnap.com");
  const [password, setPassword] = useState("Admin@MediaSnap2026!");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Modals & Editing
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [postForm, setPostForm] = useState({
    title: "",
    slug: "",
    language: "en",
    category: "Guides",
    coverImage: "",
    excerpt: "",
    content: "",
    readTime: "4 min read",
    author: "MediaSnap Team",
    isPublished: true,
  });

  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    category: "thumbnail",
    language: "en",
    order: 0,
  });

  // Verify auth session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/auth/me");
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setAdminUser(data.user);
        loadAllData();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        setAdminUser(data.user);
        loadAllData();
      } else {
        setLoginError(data.error || "Login failed");
      }
    } catch {
      setLoginError("Network error. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  const loadAllData = async () => {
    setIsLoadingData(true);
    try {
      const [statsRes, blogsRes, faqsRes, msgsRes, settingsRes, adsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/blogs"),
        fetch("/api/admin/faqs"),
        fetch("/api/admin/messages"),
        fetch("/api/admin/settings"),
        fetch("/api/admin/ads"),
      ]);

      if (statsRes.ok) setStats((await statsRes.json()).stats);
      if (blogsRes.ok) setBlogs((await blogsRes.json()).posts);
      if (faqsRes.ok) setFaqs((await faqsRes.json()).faqs);
      if (msgsRes.ok) setMessages((await msgsRes.json()).messages);
      if (settingsRes.ok) setSettings((await settingsRes.json()).settings);
      if (adsRes.ok) setAds((await adsRes.json()).ads);
    } catch (err) {
      console.error("Data load error:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Blog CRUD
  const saveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/admin/blogs";
      const method = editingPost ? "PUT" : "POST";
      const body = editingPost ? { id: editingPost.id, ...postForm } : postForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setBlogModalOpen(false);
        setEditingPost(null);
        // Reload blogs
        const bRes = await fetch("/api/admin/blogs");
        if (bRes.ok) setBlogs((await bRes.json()).posts);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save post");
      }
    } catch {
      alert("Error saving blog post");
    }
  };

  const deleteBlogPost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    await fetch(`/api/admin/blogs?id=${id}`, { method: "DELETE" });
    setBlogs(blogs.filter((b) => b.id !== id));
  };

  // FAQ CRUD
  const saveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faqForm),
      });

      if (res.ok) {
        setFaqModalOpen(false);
        setFaqForm({ question: "", answer: "", category: "thumbnail", language: "en", order: 0 });
        const fRes = await fetch("/api/admin/faqs");
        if (fRes.ok) setFaqs((await fRes.json()).faqs);
      }
    } catch {
      alert("Error saving FAQ");
    }
  };

  const deleteFaq = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    await fetch(`/api/admin/faqs?id=${id}`, { method: "DELETE" });
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  // Message Toggle & Delete
  const toggleMessageRead = async (id: string, currentRead: boolean) => {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isRead: !currentRead }),
    });
    setMessages(messages.map((m) => (m.id === id ? { ...m, isRead: !currentRead } : m)));
  };

  const deleteMessage = async (id: string) => {
    await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
    setMessages(messages.filter((m) => m.id !== id));
  };

  // Settings Save
  const handleSaveSettings = async () => {
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    alert("Website settings saved successfully!");
  };

  // Ad Slot Toggle
  const toggleAdActive = async (id: string, currentActive: boolean) => {
    const updated = await fetch("/api/admin/ads", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !currentActive }),
    });
    if (updated.ok) {
      setAds(ads.map((a) => (a.id === id ? { ...a, isActive: !currentActive } : a)));
    }
  };

  // 1. Loading auth state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Unauthenticated Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-rose-500 flex items-center justify-center text-white mx-auto shadow-md shadow-primary/20">
              <Sparkles className="w-6 h-6 fill-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">MediaSnap Admin</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your administrative credentials to manage the platform
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>{isLoggingIn ? "Authenticating..." : "Sign In to Admin"}</span>
            </button>
          </form>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Default Seed Credentials:</span>
            <div>Email: <code className="font-mono text-primary">admin@mediasnap.com</code></div>
            <div>Password: <code className="font-mono text-primary">Admin@MediaSnap2026!</code></div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Admin Dashboard Interface
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-rose-500 flex items-center justify-center text-white shadow-md shadow-primary/20">
                <Sparkles className="w-4 h-4 fill-white" />
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">MediaSnap</span>
                <span className="text-[10px] font-bold text-primary block leading-none">Control Panel</span>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === "overview"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview & Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab("blog")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === "blog"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Articles & Guides ({blogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("faqs")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === "faqs"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>FAQs ({faqs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("messages")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === "messages"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Messages ({messages.filter((m) => !m.isRead).length} new)</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === "settings"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Website Settings</span>
            </button>

            <button
              onClick={() => setActiveTab("ads")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === "ads"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Ad Placements</span>
            </button>
          </nav>
        </div>

        {/* User Footer & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white block">{adminUser?.name}</span>
            <span className="text-slate-400">{adminUser?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white capitalize">
              {activeTab} Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Production dashboard running MediaSnap v1.0 • Node {process.version || "v22"}
            </p>
          </div>
          <a
            href="/en"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && stats && (
          <div className="space-y-8">
            {/* Stat Counters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 block">Total Tool Invocations</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">
                  {stats.totalToolUsages}
                </span>
                <span className="text-xs text-emerald-500 font-semibold mt-1 inline-block">
                  +{stats.todayToolUsages} today
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 block">Est. Daily Visitors</span>
                <span className="text-3xl font-black text-primary mt-1 block">
                  {stats.dailyVisitors}
                </span>
                <span className="text-xs text-slate-400 mt-1 inline-block">
                  ~{stats.monthlyVisitors} monthly
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 block">Unread Inquiries</span>
                <span className="text-3xl font-black text-amber-500 mt-1 block">
                  {stats.unreadMessages}
                </span>
                <span className="text-xs text-slate-400 mt-1 inline-block">
                  {stats.totalMessages} total received
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 block">Published Articles</span>
                <span className="text-3xl font-black text-secondary mt-1 block">
                  {stats.totalBlogPosts}
                </span>
                <span className="text-xs text-slate-400 mt-1 inline-block">Active Guides</span>
              </div>
            </div>

            {/* Tool Breakdown & Language Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Popular Tools */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span>Popular Tool Usage Breakdown</span>
                </h3>
                <div className="space-y-2">
                  {stats.toolBreakdown && stats.toolBreakdown.length > 0 ? (
                    stats.toolBreakdown.map((t: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                          {t.toolKey.replace(/-/g, " ")}
                        </span>
                        <span className="font-mono font-bold text-primary">{t._count.toolKey} runs</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No tool usage recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Language Distribution */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-secondary" />
                  <span>Language Usage Stats</span>
                </h3>
                <div className="space-y-2">
                  {stats.languageBreakdown && stats.languageBreakdown.length > 0 ? (
                    stats.languageBreakdown.map((l: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase">
                          Language Code: {l.language}
                        </span>
                        <span className="font-mono font-bold text-secondary">{l._count.language} requests</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No language events recorded yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Tool Logs Table */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Recent Tool Logs & Queries</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase font-semibold">
                    <tr>
                      <th className="py-2">Tool</th>
                      <th className="py-2">Video ID</th>
                      <th className="py-2">Language</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats.recentToolLogs && stats.recentToolLogs.map((log: any) => (
                      <tr key={log.id}>
                        <td className="py-2 font-semibold text-slate-800 dark:text-slate-200">{log.toolKey}</td>
                        <td className="py-2 font-mono text-slate-500">{log.videoId || "—"}</td>
                        <td className="py-2 uppercase text-slate-400">{log.language}</td>
                        <td className="py-2">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[10px] font-bold">
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2 text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. BLOG CMS TAB */}
        {activeTab === "blog" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-500">Manage creator tutorials and guides across all supported languages.</p>
              <button
                onClick={() => {
                  setEditingPost(null);
                  setPostForm({
                    title: "",
                    slug: "",
                    language: "en",
                    category: "Guides",
                    coverImage: "",
                    excerpt: "",
                    content: "",
                    readTime: "4 min read",
                    author: "MediaSnap Team",
                    isPublished: true,
                  });
                  setBlogModalOpen(true);
                }}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Article</span>
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Lang</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {blogs.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">{b.title}</td>
                      <td className="p-4 text-slate-500">{b.category}</td>
                      <td className="p-4 uppercase font-bold text-primary">{b.language}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.isPublished ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950" : "bg-slate-100 text-slate-500"}`}>
                          {b.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="p-4 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingPost(b);
                            setPostForm({
                              title: b.title,
                              slug: b.slug,
                              language: b.language,
                              category: b.category,
                              coverImage: b.coverImage || "",
                              excerpt: b.excerpt,
                              content: b.content,
                              readTime: b.readTime,
                              author: b.author,
                              isPublished: b.isPublished,
                            });
                            setBlogModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBlogPost(b.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Create/Edit Blog Modal */}
            {blogModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {editingPost ? "Edit Article" : "Create New Article"}
                    </h3>
                    <button onClick={() => setBlogModalOpen(false)}>
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <form onSubmit={saveBlogPost} className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Title *</label>
                      <input
                        type="text"
                        required
                        value={postForm.title}
                        onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Slug *</label>
                        <input
                          type="text"
                          required
                          value={postForm.slug}
                          onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                          placeholder="e.g. how-to-design-thumbnails"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Language</label>
                        <select
                          value={postForm.language}
                          onChange={(e) => setPostForm({ ...postForm, language: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          {["en", "hi", "es", "pt", "fr", "de", "ar", "id"].map((l) => (
                            <option key={l} value={l}>{l.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                        <input
                          type="text"
                          value={postForm.category}
                          onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Cover Image URL</label>
                        <input
                          type="url"
                          value={postForm.coverImage}
                          onChange={(e) => setPostForm({ ...postForm, coverImage: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Excerpt</label>
                      <textarea
                        rows={2}
                        value={postForm.excerpt}
                        onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Content (Markdown supported)</label>
                      <textarea
                        rows={8}
                        value={postForm.content}
                        onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                        className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="pubToggle"
                        checked={postForm.isPublished}
                        onChange={(e) => setPostForm({ ...postForm, isPublished: e.target.checked })}
                      />
                      <label htmlFor="pubToggle" className="font-bold text-slate-700 dark:text-slate-300">Publish immediately</label>
                    </div>

                    <div className="pt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setBlogModalOpen(false)}
                        className="px-4 py-2 border rounded-xl text-slate-600 dark:text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md"
                      >
                        Save Article
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. FAQS TAB */}
        {activeTab === "faqs" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-500">Manage frequently asked questions displayed across tool pages.</p>
              <button
                onClick={() => setFaqModalOpen(true)}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {faqs.map((f) => (
                  <div key={f.id} className="p-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{f.question}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-primary font-bold uppercase text-[10px]">
                          {f.language}
                        </span>
                      </div>
                      <p className="text-slate-500 leading-relaxed">{f.answer}</p>
                    </div>
                    <button
                      onClick={() => deleteFaq(f.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add FAQ Modal */}
            {faqModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New FAQ</h3>
                    <button onClick={() => setFaqModalOpen(false)}>
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <form onSubmit={saveFaq} className="space-y-4">
                    <div>
                      <label className="font-bold block mb-1">Question *</label>
                      <input
                        type="text"
                        required
                        value={faqForm.question}
                        onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">Answer *</label>
                      <textarea
                        rows={4}
                        required
                        value={faqForm.answer}
                        onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setFaqModalOpen(false)}
                        className="px-4 py-2 border rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-primary text-white font-bold rounded-xl"
                      >
                        Save FAQ
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. MESSAGES TAB */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">Contact requests submitted via the Contact Us form.</p>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {messages.length > 0 ? (
                messages.map((m) => (
                  <div key={m.id} className={`p-5 space-y-2 ${!m.isRead ? "bg-amber-50/40 dark:bg-amber-950/20" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{m.name}</span>
                        <span className="text-slate-400">&lt;{m.email}&gt;</span>
                        {!m.isRead && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px]">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleMessageRead(m.id, m.isRead)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                        >
                          {m.isRead ? "Mark Unread" : "Mark Read"}
                        </button>
                        <button
                          onClick={() => deleteMessage(m.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{m.subject}</div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{m.message}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      Received: {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">No contact messages yet.</div>
              )}
            </div>
          </div>
        )}

        {/* 5. WEBSITE SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Platform & SEO Configuration
            </h3>

            <div className="space-y-4 text-xs">
              {settings.map((item, idx) => (
                <div key={item.key} className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block uppercase">
                    {item.key.replace(/_/g, " ")}
                  </label>
                  <input
                    type="text"
                    value={item.value || ""}
                    onChange={(e) => {
                      const updated = [...settings];
                      updated[idx].value = e.target.value;
                      setSettings(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                  {item.description && (
                    <span className="text-[10px] text-slate-400">{item.description}</span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              Save Configuration Settings
            </button>
          </div>
        )}

        {/* 6. ADS PLACEMENT TAB */}
        {activeTab === "ads" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">Enable or disable advertisement code snippets in reserved layout positions.</p>

            <div className="grid grid-cols-1 gap-4">
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ad.name}</h4>
                      <span className="text-xs text-slate-400 font-mono">Slot: {ad.slot}</span>
                    </div>
                    <button
                      onClick={() => toggleAdActive(ad.id, ad.isActive)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        ad.isActive
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {ad.isActive ? "Active (Showing)" : "Disabled"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
