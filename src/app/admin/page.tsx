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
  Code2,
  BarChart3,
  FileCode,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Copy,
} from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "ads"
    | "analytics"
    | "custom_code"
    | "seo_files"
    | "blog"
    | "faqs"
    | "messages"
    | "settings"
  >("overview");

  // Login form state
  const [email, setEmail] = useState("admin@ytsnap.tech");
  const [password, setPassword] = useState("Admin@YTSnap2026!");
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

  // Toast / notification feedback
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Modals & Editing for Blog
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
    author: "YTSnap Team",
    isPublished: true,
  });

  // FAQ Modal
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

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg("");
    }, 4000);
  };

  // Helper to read setting value by key
  const getSetting = (key: string, defaultVal = "") => {
    const item = settings.find((s) => s.key === key);
    return item ? item.value ?? "" : defaultVal;
  };

  // Helper to update local setting value
  const setSettingValue = (key: string, value: string) => {
    setSettings((prev) => {
      const existing = prev.find((s) => s.key === key);
      if (existing) {
        return prev.map((s) => (s.key === key ? { ...s, value } : s));
      } else {
        return [...prev, { key, value, group: "general" }];
      }
    });
  };

  // Save settings back to database
  const saveAllSettings = async (customMsg = "Settings saved successfully!") => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        showNotification(customMsg);
      } else {
        alert("Failed to save settings");
      }
    } catch (e) {
      alert("Error saving settings");
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
        const bRes = await fetch("/api/admin/blogs");
        if (bRes.ok) setBlogs((await bRes.json()).posts);
        showNotification("Blog post saved successfully!");
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
    showNotification("Article deleted");
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
        showNotification("FAQ saved!");
      }
    } catch {
      alert("Error saving FAQ");
    }
  };

  const deleteFaq = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    await fetch(`/api/admin/faqs?id=${id}`, { method: "DELETE" });
    setFaqs(faqs.filter((f) => f.id !== id));
    showNotification("FAQ removed");
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

  // Ad Slot Toggle and Update
  const toggleAdActive = async (id: string, currentActive: boolean) => {
    const res = await fetch("/api/admin/ads", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !currentActive }),
    });
    if (res.ok) {
      setAds(ads.map((a) => (a.id === id ? { ...a, isActive: !currentActive } : a)));
      showNotification(`Ad slot ${!currentActive ? "enabled" : "disabled"}`);
    }
  };

  const updateAdField = (id: string, field: string, val: any) => {
    setAds(ads.map((a) => (a.id === id ? { ...a, [field]: val } : a)));
  };

  const saveAdSlot = async (adItem: any) => {
    try {
      const res = await fetch("/api/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: adItem.id,
          htmlContent: adItem.htmlContent,
          imageUrl: adItem.imageUrl,
          targetUrl: adItem.targetUrl,
          isActive: adItem.isActive,
        }),
      });
      if (res.ok) {
        showNotification(`Saved "${adItem.name}" ad slot!`);
      } else {
        alert("Failed to save ad slot");
      }
    } catch {
      alert("Error saving ad slot");
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
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">YTSnap Admin</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter administrative credentials to manage Google Ads, Analytics, Code & SEO
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
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Log In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Default Seed Credentials:</span>
            <div>Email: <code className="font-mono text-primary font-semibold">admin@ytsnap.tech</code></div>
            <div>Password: <code className="font-mono text-primary font-semibold">Admin@YTSnap2026!</code></div>
          </div>
        </div>
      </div>
    );
  }

  // Active configurations summary
  const isGA4Configured = Boolean(getSetting("google_analytics_id"));
  const isAdSenseConfigured = Boolean(getSetting("google_adsense_client_id"));
  const isAdSenseEnabled = getSetting("google_adsense_enabled") === "true";
  const activeAdsCount = ads.filter((a) => a.isActive).length;

  // 3. Authenticated Admin Dashboard Interface
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Toast Notification Banner */}
      {saveSuccessMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white font-semibold text-xs rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

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
                <span className="text-base font-extrabold text-slate-900 dark:text-white">YTSnap</span>
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
              onClick={() => setActiveTab("ads")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === "ads"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <Megaphone className="w-4 h-4" />
                <span>Google Ads & Slots</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === "ads" ? "bg-white/20 text-white" : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600"
              }`}>
                {activeAdsCount} active
              </span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === "analytics"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4" />
                <span>Google Analytics</span>
              </div>
              {isGA4Configured && (
                <span className={`w-2 h-2 rounded-full ${activeTab === "analytics" ? "bg-white" : "bg-emerald-500"}`} />
              )}
            </button>

            <button
              onClick={() => setActiveTab("custom_code")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === "custom_code"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Header & Footer Code</span>
            </button>

            <button
              onClick={() => setActiveTab("seo_files")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === "seo_files"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Robots, Ads & Sitemap</span>
            </button>

            <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800 my-1 text-[11px] font-bold text-slate-400 px-3 uppercase tracking-wider">
              Content & Inquiries
            </div>

            <button
              onClick={() => setActiveTab("blog")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === "blog"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Articles & Guides</span>
              </div>
              <span className="text-xs opacity-80">{blogs.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("faqs")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === "faqs"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4" />
                <span>FAQs</span>
              </div>
              <span className="text-xs opacity-80">{faqs.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("messages")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === "messages"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>Messages</span>
              </div>
              {messages.filter((m) => !m.isRead).length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px]">
                  {messages.filter((m) => !m.isRead).length}
                </span>
              )}
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
              <span>Platform Settings</span>
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
              {activeTab === "ads"
                ? "Google Ads & Monetization"
                : activeTab === "analytics"
                ? "Google Analytics (GA4)"
                : activeTab === "custom_code"
                ? "Custom Header & Footer Code"
                : activeTab === "seo_files"
                ? "SEO Files: Robots.txt, Ads.txt & Sitemap"
                : `${activeTab} Management`}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              YTSnap Production Management Suite • Live Changes Reflected Instantly
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/en"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 1. OVERVIEW TAB */}
        {/* ========================================================= */}
        {activeTab === "overview" && stats && (
          <div className="space-y-8">
            {/* Live Integration Status Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Google Analytics (GA4)
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                    {isGA4Configured ? getSetting("google_analytics_id") : "Not Connected"}
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  isGA4Configured
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                }`}>
                  {isGA4Configured ? "Connected" : "Inactive"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Google AdSense
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                    {isAdSenseConfigured ? (isAdSenseEnabled ? "Active (Auto-Ads On)" : "Configured (Disabled)") : "Not Configured"}
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  isAdSenseConfigured && isAdSenseEnabled
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                }`}>
                  {isAdSenseConfigured && isAdSenseEnabled ? "Serving" : "Off"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Dynamic SEO Files
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                    Robots, Ads & Sitemap
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <a
                    href="/robots.txt"
                    target="_blank"
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-primary"
                  >
                    robots.txt ↗
                  </a>
                  <a
                    href="/ads.txt"
                    target="_blank"
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-primary"
                  >
                    ads.txt ↗
                  </a>
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-primary"
                  >
                    sitemap ↗
                  </a>
                </div>
              </div>
            </div>

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

        {/* ========================================================= */}
        {/* 2. GOOGLE ADS & AD PLACEMENTS TAB */}
        {/* ========================================================= */}
        {activeTab === "ads" && (
          <div className="space-y-8">
            {/* Google AdSense Master Configuration Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    <span>Google AdSense Integration</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Connect your AdSense Publisher account. When enabled, official AdSense client scripts and Auto Ads are injected across all pages.
                  </p>
                </div>
                <button
                  onClick={() => saveAllSettings("AdSense settings updated successfully!")}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-colors shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Save AdSense Settings</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    AdSense Publisher ID (Client ID)
                  </label>
                  <input
                    type="text"
                    value={getSetting("google_adsense_client_id")}
                    onChange={(e) => setSettingValue("google_adsense_client_id", e.target.value.trim())}
                    placeholder="e.g. ca-pub-1234567890123456"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Find this in your Google AdSense Dashboard under <strong>Account &gt; Settings &gt; Account Information &gt; Publisher ID</strong>.
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Enable AdSense Auto-Ads
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Loads AdSense script tag with client ID on every page.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingValue(
                          "google_adsense_enabled",
                          getSetting("google_adsense_enabled") === "true" ? "false" : "true"
                        )
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        getSetting("google_adsense_enabled") === "true" ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          getSetting("google_adsense_enabled") === "true" ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Master Banner Display Switch
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Globally show or hide manual ad unit banner placements.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingValue(
                          "enable_ads",
                          getSetting("enable_ads") === "true" ? "false" : "true"
                        )
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        getSetting("enable_ads") === "true" ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          getSetting("enable_ads") === "true" ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Ad Placement Slots */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Manual Ad Placement Slots ({ads.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Paste custom AdSense ad unit code snippets (e.g. <code>&lt;ins class=&quot;adsbygoogle&quot; ...&gt;</code>) or affiliate banner images.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {ads.map((ad) => (
                  <div
                    key={ad.id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ad.name}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-primary font-mono text-[10px] font-bold">
                            slot: {ad.slot}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {ad.slot === "header_top"
                            ? "Positioned directly below header across all pages."
                            : ad.slot === "hero_bottom"
                            ? "Positioned right below homepage hero & thumbnail search tool."
                            : ad.slot === "in_content"
                            ? "Positioned in the middle of page content before FAQs."
                            : ad.slot === "sidebar"
                            ? "Positioned in creator tool sidebar."
                            : "Positioned directly above footer across all pages."}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleAdActive(ad.id, ad.isActive)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            ad.isActive
                              ? "bg-emerald-500 text-white shadow-sm"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {ad.isActive ? "Active (Displaying)" : "Disabled"}
                        </button>
                        <button
                          type="button"
                          onClick={() => saveAdSlot(ad)}
                          className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Slot</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-700 dark:text-slate-300">
                            Custom HTML / AdSense Snippet
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              updateAdField(
                                ad.id,
                                "htmlContent",
                                `<ins class="adsbygoogle"\n  style="display:block"\n  data-ad-client="${getSetting("google_adsense_client_id") || "ca-pub-XXXXXXXXXXXXXXXX"}"\n  data-ad-slot="1234567890"\n  data-ad-format="auto"\n  data-full-width-responsive="true"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`
                              )
                            }
                            className="text-[10px] text-primary hover:underline font-semibold"
                          >
                            + Insert AdSense Template
                          </button>
                        </div>
                        <textarea
                          rows={4}
                          value={ad.htmlContent || ""}
                          onChange={(e) => updateAdField(ad.id, "htmlContent", e.target.value)}
                          placeholder="Paste AdSense <ins> or custom HTML/JS banner code here..."
                          className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300 block">
                            Or Banner Image URL (Fallback)
                          </label>
                          <input
                            type="url"
                            value={ad.imageUrl || ""}
                            onChange={(e) => updateAdField(ad.id, "imageUrl", e.target.value)}
                            placeholder="https://example.com/banner.png"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300 block">
                            Target Link (Affiliate / Advertiser URL)
                          </label>
                          <input
                            type="url"
                            value={ad.targetUrl || ""}
                            onChange={(e) => updateAdField(ad.id, "targetUrl", e.target.value)}
                            placeholder="https://affiliate.example.com/?ref=ytsnap"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. GOOGLE ANALYTICS (GA4) TAB */}
        {/* ========================================================= */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-secondary" />
                    <span>Google Analytics 4 (GA4) Setup</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Track visitor traffic, pageviews across all 8 languages, thumbnail downloads, and tool conversions in real time.
                  </p>
                </div>
                <button
                  onClick={() => saveAllSettings("Google Analytics Measurement ID saved!")}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-colors shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Analytics ID</span>
                </button>
              </div>

              <div className="max-w-xl space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    GA4 Measurement ID
                  </label>
                  <input
                    type="text"
                    value={getSetting("google_analytics_id")}
                    onChange={(e) => setSettingValue("google_analytics_id", e.target.value.trim())}
                    placeholder="e.g. G-ABC123XYZ4"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Starts with <code>G-</code>. When set, YTSnap injects the official Google tag (gtag.js) into the head of all pages automatically.
                  </span>
                </div>

                {isGA4Configured ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                    <div>
                      <span className="font-bold block">Google Analytics Active</span>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Your Measurement ID <strong>{getSetting("google_analytics_id")}</strong> is currently sending pageview telemetry to Google Analytics.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <span className="font-bold block">No Measurement ID Connected</span>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                        Enter your GA4 ID above and click &quot;Save Analytics ID&quot; to begin collecting real-time visitor analytics.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">
                  How to locate your GA4 Measurement ID:
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                  <li>Open <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">analytics.google.com</a> and sign in.</li>
                  <li>Click <strong>Admin</strong> (gear icon bottom left).</li>
                  <li>Under <em>Data collection and modification</em>, select <strong>Data streams</strong>.</li>
                  <li>Click your Web stream to open stream details.</li>
                  <li>Copy the <strong>Measurement ID</strong> formatted as <code>G-XXXXXXXXXX</code> and paste it above.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. CUSTOM HEADER & FOOTER CODE INJECTION TAB */}
        {/* ========================================================= */}
        {activeTab === "custom_code" && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-indigo-500" />
                    <span>Header & Footer Code Injection</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Inject custom CSS <code>&lt;style&gt;</code>, JavaScript <code>&lt;script&gt;</code>, Google Search Console verification meta tags, or live chat widgets directly into the live site.
                  </p>
                </div>
                <button
                  onClick={() => saveAllSettings("Custom Header & Footer code applied successfully!")}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-colors shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Code Injections</span>
                </button>
              </div>

              {/* Header Code Section */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-sm font-bold text-slate-900 dark:text-white block">
                      Custom Header Code (Injected into <code>&lt;head&gt;</code>)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Ideal for Google Search Console verification meta tags, custom CSS styling, Bing Webmaster tools, Facebook Pixels, or external fonts.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const sample = `<meta name="google-site-verification" content="YOUR_VERIFICATION_TOKEN_HERE" />`;
                        setSettingValue("custom_header_code", (getSetting("custom_header_code") ? getSetting("custom_header_code") + "\n" : "") + sample);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
                    >
                      + Google Verification
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const sample = `<style>\n  /* Custom global styles */\n  :root {\n    --custom-accent: #2563EB;\n  }\n</style>`;
                        setSettingValue("custom_header_code", (getSetting("custom_header_code") ? getSetting("custom_header_code") + "\n" : "") + sample);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
                    >
                      + Custom CSS
                    </button>
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={getSetting("custom_header_code")}
                  onChange={(e) => setSettingValue("custom_header_code", e.target.value)}
                  placeholder={`<!-- Example: Google Search Console verification -->\n<meta name="google-site-verification" content="..." />\n\n<!-- Custom CSS -->\n<style>\n  /* Your custom CSS overrides */\n</style>`}
                  className="w-full font-mono text-xs px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-900 text-emerald-400 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                />
              </div>

              {/* Footer Code Section */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-sm font-bold text-slate-900 dark:text-white block">
                      Custom Footer Code (Injected before <code>&lt;/body&gt;</code>)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Ideal for live chat widgets (Tawk.to, Crisp, Intercom), affiliate tracking scripts, and non-blocking footer JavaScript.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const sample = `<!-- Live Chat Widget Example -->\n<script>\n  console.log("YTSnap footer script loaded");\n</script>`;
                        setSettingValue("custom_footer_code", (getSetting("custom_footer_code") ? getSetting("custom_footer_code") + "\n" : "") + sample);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
                    >
                      + Script Sample
                    </button>
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={getSetting("custom_footer_code")}
                  onChange={(e) => setSettingValue("custom_footer_code", e.target.value)}
                  placeholder={`<!-- Example: Live Chat or Analytics Pixel -->\n<script>\n  // Your custom JavaScript snippet here\n</script>`}
                  className="w-full font-mono text-xs px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-900 text-sky-400 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. ROBOTS.TXT, ADS.TXT & SITEMAP TAB */}
        {/* ========================================================= */}
        {activeTab === "seo_files" && (
          <div className="space-y-8">
            {/* Sitemap.xml Configuration Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-secondary" />
                    <span>Dynamic Sitemap (sitemap.xml)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Next.js dynamically compiles a full search-engine sitemap with all 8 language alternates, tools, and blog articles.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:text-primary flex items-center gap-1.5 transition-colors"
                  >
                    <span>Open Live /sitemap.xml</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => saveAllSettings("Sitemap base URL updated!")}
                    className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Base URL</span>
                  </button>
                </div>
              </div>

              <div className="max-w-xl space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Production Domain Base URL
                </label>
                <input
                  type="url"
                  value={getSetting("sitemap_base_url")}
                  onChange={(e) => setSettingValue("sitemap_base_url", e.target.value.trim())}
                  placeholder="https://yourdomain.com"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                />
                <span className="text-[10px] text-slate-400 block">
                  All URLs in <code>/sitemap.xml</code> and <code>robots.txt</code> will use this domain root for search engine crawlers.
                </span>
              </div>
            </div>

            {/* Robots.txt Manager */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-emerald-500" />
                    <span>Robots Directives (robots.txt)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Served live at <code>/robots.txt</code>. Controls crawler permissions for Googlebot, Bingbot, and others.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/robots.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:text-primary flex items-center gap-1.5 transition-colors"
                  >
                    <span>View /robots.txt</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const domain = getSetting("sitemap_base_url") || "http://localhost:3000";
                      setSettingValue(
                        "robots_txt_content",
                        `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /*/admin/\n\nSitemap: ${domain}/sitemap.xml`
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={() => saveAllSettings("Robots.txt directives saved successfully!")}
                    className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Robots.txt</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={8}
                value={getSetting("robots_txt_content")}
                onChange={(e) => setSettingValue("robots_txt_content", e.target.value)}
                className="w-full font-mono text-xs px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
              />
            </div>

            {/* Ads.txt Manager */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-amber-500" />
                    <span>Authorized Digital Sellers (ads.txt)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Served live at <code>/ads.txt</code>. Required by Google AdSense to declare authorized ad inventory sellers.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/ads.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:text-primary flex items-center gap-1.5 transition-colors"
                  >
                    <span>View /ads.txt</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const pubId = (getSetting("google_adsense_client_id") || "pub-XXXXXXXXXXXXXXXX").replace(/^ca-/, "");
                      const sample = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0`;
                      setSettingValue("ads_txt_content", (getSetting("ads_txt_content") ? getSetting("ads_txt_content") + "\n" : "") + sample);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    + Add AdSense Line
                  </button>
                  <button
                    onClick={() => saveAllSettings("Ads.txt file saved successfully!")}
                    className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Ads.txt</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={7}
                value={getSetting("ads_txt_content")}
                onChange={(e) => setSettingValue("ads_txt_content", e.target.value)}
                placeholder="google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0"
                className="w-full font-mono text-xs px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-900 text-amber-300 focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. BLOG CMS TAB */}
        {/* ========================================================= */}
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
                    author: "YTSnap Team",
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

        {/* ========================================================= */}
        {/* 7. FAQS TAB */}
        {/* ========================================================= */}
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

        {/* ========================================================= */}
        {/* 8. MESSAGES TAB */}
        {/* ========================================================= */}
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

        {/* ========================================================= */}
        {/* 9. GENERAL PLATFORM SETTINGS TAB */}
        {/* ========================================================= */}
        {activeTab === "settings" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Platform & General Configuration
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  General branding, contact email, and YouTube API configurations.
                </p>
              </div>
              <button
                onClick={() => saveAllSettings("Platform settings saved successfully!")}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {settings
                .filter((item) => ["general", "api"].includes(item.group || "general"))
                .map((item, idx) => (
                  <div key={item.key} className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block uppercase">
                      {item.key.replace(/_/g, " ")}
                    </label>
                    <input
                      type="text"
                      value={item.value || ""}
                      onChange={(e) => {
                        const updated = [...settings];
                        const foundIdx = updated.findIndex((s) => s.key === item.key);
                        if (foundIdx >= 0) {
                          updated[foundIdx].value = e.target.value;
                          setSettings(updated);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    />
                    {item.description && (
                      <span className="text-[10px] text-slate-400">{item.description}</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
