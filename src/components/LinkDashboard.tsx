import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import { ShortenedLink } from "../types";
import ParticleNetwork from "./ParticleNetwork";
import LinkDetailsModal from "./LinkDetailsModal";
import { motion, AnimatePresence } from "motion/react";
import {
  Link2,
  Lock,
  Calendar,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  History,
  Activity,
  PlusCircle,
  HelpCircle,
  FileSpreadsheet,
  UploadCloud,
  Database,
  ArrowRight,
  Download,
  AlertTriangle,
  Search,
  X,
  Shield
} from "lucide-react";

export default function App() {
  const [shortenMode, setShortenMode] = useState<"single" | "bulk">("single");

  // Single shortener states
  const [longUrl, setLongUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [title, setTitle] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Bulk shortener states
  const [bulkInput, setBulkInput] = useState("");
  const [bulkParsedItems, setBulkParsedItems] = useState<Array<{ longUrl: string; customCode?: string; title?: string }>>([]);
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  const [bulkIsProcessing, setBulkIsProcessing] = useState(false);
  const [bulkError, setBulkError] = useState("");
  const [bulkSuccess, setBulkSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);
  
  const navigate = useNavigate();
  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [selectedLink, setSelectedLink] = useState<ShortenedLink | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [newlyCreated, setNewlyCreated] = useState<ShortenedLink | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load all links on mount
  useEffect(() => {
    fetchActiveLinks();
  }, []);

  const fetchActiveLinks = () => {
    fetch("/api/links", { headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLinks(data.links);
        }
      })
      .catch((err) => console.error("Error fetching links:", err));
  };

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setNewlyCreated(null);

    if (!longUrl) {
      setError("Please input a destination URL.");
      return;
    }

    if (password && password !== confirmPassword) {
      setError("Decryption passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("admin_token")}` },
        body: JSON.stringify({
          longUrl,
          customCode: customCode || undefined,
          password: password || undefined,
          expiresAt: expiresAt || undefined,
          title: title || undefined
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "An error occurred while shortening the URL.");
      } else {
        setNewlyCreated(data.link);
        setSuccessMsg("Secure redirection route established!");
        // Reset inputs
        setLongUrl("");
        setCustomCode("");
        setPassword("");
        setConfirmPassword("");
        setExpiresAt("");
        setTitle("");
        setShowAdvanced(false);
        // Refresh link list
        fetchActiveLinks();
      }
    } catch (err) {
      setError("Unable to communicate with the shortener server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      const response = await fetch(`/api/links/${code}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        setLinks(links.filter((l) => l.code !== code));
        if (selectedLink?.code === code) {
          setSelectedLink(null);
        }
      }
    } catch (err) {
      console.error("Error deleting link:", err);
    }
  };

  // Parse bulk raw text input
  const parseBulkText = (text: string) => {
    const lines = text.split(/\r?\n/);
    const parsed: Array<{ longUrl: string; customCode?: string; title?: string }> = [];

    const isTsv = lines[0]?.includes('\t');
    const separator = isTsv ? '\t' : ',';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const parts = trimmed.split(separator);
      if (parts.length > 0) {
        const url = parts[0].trim();
        if (url) {
          const alias = parts[1] ? parts[1].trim() : undefined;
          const label = parts[2] ? parts[2].trim() : undefined;
          parsed.push({
            longUrl: url,
            customCode: alias || undefined,
            title: label || undefined
          });
        }
      }
    }
    setBulkParsedItems(parsed);
  };

  useEffect(() => {
    parseBulkText(bulkInput);
  }, [bulkInput]);

  // Bulk execution request
  const executeBulkShorten = async () => {
    if (bulkParsedItems.length === 0) {
      setBulkError("No valid destinations parsed. Please provide URLs.");
      return;
    }

    setBulkError("");
    setBulkSuccess("");
    setBulkIsProcessing(true);
    setBulkResults([]);

    try {
      const response = await fetch("/api/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("admin_token")}` },
        body: JSON.stringify({ items: bulkParsedItems })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setBulkError(data.error || "A gateway error occurred during bulk operations.");
      } else {
        setBulkResults(data.results);
        const successfulCount = data.results.filter((r: any) => r.success).length;
        setBulkSuccess(`Successfully established ${successfulCount} of ${data.results.length} redirection routes!`);
        fetchActiveLinks();
      }
    } catch (err) {
      setBulkError("Network failure. Unable to coordinate bulk operations.");
    } finally {
      setBulkIsProcessing(false);
    }
  };

  // CSV drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCsvFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleCsvFile(e.target.files[0]);
    }
  };

  const handleCsvFile = (file: File) => {
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt") && !file.name.endsWith(".xlsx")) {
      setBulkError("File must be a .csv, .txt, or .xlsx file.");
      return;
    }

    if (file.name.endsWith(".xlsx")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const text = XLSX.utils.sheet_to_csv(worksheet, { FS: "\t" });
          setBulkInput(text);
          setBulkSuccess(`Successfully parsed file contents: ${file.name}`);
        } catch (err) {
          setBulkError("Failed to parse XLSX file.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setBulkInput(text);
        setBulkSuccess(`Successfully parsed file contents: ${file.name}`);
      };
      reader.readAsText(file);
    }
  };

  const downloadBulkResultsCsv = () => {
    if (bulkResults.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Success,Original URL,Short URL,Alias,Error\n";

    for (const res of bulkResults) {
      if (res.success) {
        csvContent += `true,"${res.link.longUrl}","${res.shortUrl}","${res.code}",\n`;
      } else {
        csvContent += `false,"${res.raw?.longUrl || ""}","","${res.raw?.customCode || ""}","${res.error}"\n`;
      }
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "creative_z_batch_shortened.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (code: string) => {
    const appUrl = window.location.origin;
    const shortUrl = `${appUrl}/link/${code}`;
    navigator.clipboard.writeText(shortUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredLinks = links.filter((link) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (link.title && link.title.toLowerCase().includes(query)) ||
      link.code.toLowerCase().includes(query) ||
      link.longUrl.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-purple-500/30 selection:text-white relative overflow-x-hidden">
      
      {/* Global Background Grid Layers */}
      <div className="fixed inset-0 blueprint-grid opacity-100 pointer-events-none z-0" />
      
      {/* Dynamic drifting canvas overlay */}
      <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-[1px] pointer-events-none z-0 animate-grid-drift" />

      {/* Interactive Particle Network Background */}
      <ParticleNetwork />

      {/* Top subtle glow bar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent pointer-events-none z-10" />

      {/* App Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col min-h-screen">
        
        {/* Navigation Bar / Corporate Metadata Header */}
        <header className="flex flex-wrap gap-4 items-center justify-between border-b border-purple-500/10 pb-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center glow-purple">
              <Link2 size={20} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight font-display text-white">
                CREATIVE Z <span className="text-purple-400">LINK</span>
              </h1>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Quantum Link Shortening Terminal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Sci-Fi Meta Tags (Architecturally Honest) */}
            <div className="hidden md:flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
              <div>
                <span className="text-purple-500/80">LOC:</span> GLOBAL CLOUD
              </div>
              <div>
                <span className="text-purple-500/80">ENCRYPTION:</span> LOCAL_SECURE
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-emerald-400 font-semibold">TERMINAL ONLINE</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/link-settings')}
              className="p-2.5 bg-slate-900 border border-purple-500/20 hover:border-purple-500/50 rounded-xl text-slate-400 hover:text-white transition cursor-pointer shadow-lg shadow-purple-500/10"
              title="System Settings"
            >
              <Shield size={18} />
            </button>
          </div>
        </header>

        {/* Main Content Layout */}
        <main className="grid lg:grid-cols-12 gap-8 items-start flex-grow">
          
          {/* LEFT COLUMN: Hero banner and URL shortener terminal (7 Cols) */}
          <section className="lg:col-span-7 space-y-8">
            
            {/* Branding Hero Banner */}
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-mono font-bold text-purple-300">
                <Sparkles size={12} /> Version 1.2 Activated
              </span>
              <h2 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-white leading-[1.1]">
                Establish Secure <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 text-glow-purple">
                  Redirection Routes
                </span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl">
                Shorten, password-protect, and expire URLs through our high-performance link infrastructure. Gain real-time click timelines, browser/device metrics, and custom styled QR codes instantly.
              </p>
            </div>

            {/* URL SHORTENING COMPONENT */}
            <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
              {/* Corner ambient glows */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Mode Selector Tabs */}
              <div className="flex border-b border-purple-500/15 pb-4 mb-6">
                <button
                  type="button"
                  id="tab-single-mode-btn"
                  onClick={() => {
                    setShortenMode("single");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className={`flex-1 py-2 font-display text-xs uppercase tracking-wider font-bold transition flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
                    shortenMode === "single"
                      ? "border-purple-500 text-white"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <PlusCircle size={14} />
                  Single Gateway
                </button>
                <button
                  type="button"
                  id="tab-bulk-mode-btn"
                  onClick={() => {
                    setShortenMode("bulk");
                    setBulkError("");
                    setBulkSuccess("");
                  }}
                  className={`flex-1 py-2 font-display text-xs uppercase tracking-wider font-bold transition flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
                    shortenMode === "bulk"
                      ? "border-purple-500 text-white"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <FileSpreadsheet size={14} />
                  Quantum Bulk Protocol
                </button>
              </div>

              {shortenMode === "single" ? (
                <>
                  {/* Error Alert */}
                  {error && (
                    <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono flex items-start gap-2.5">
                      <Info size={16} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Success Result Display */}
                  {successMsg && newlyCreated && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-5 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-4"
                    >
                      <div className="flex items-start gap-2.5 text-purple-300 text-xs font-mono">
                        <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-white uppercase tracking-wider">{successMsg}</p>
                          <p className="text-slate-400 mt-0.5">Route mapping is live on global servers.</p>
                        </div>
                      </div>

                      {/* Visual Short Link Display Box */}
                      <div className="bg-slate-950 border border-purple-500/20 rounded-xl p-3 flex items-center justify-between gap-3">
                        <span className="font-display font-bold text-purple-300 text-sm md:text-base select-all truncate">
                          {window.location.origin}/link/{newlyCreated.code}
                        </span>
                        <button
                          id="copy-new-link-btn"
                          onClick={() => copyToClipboard(newlyCreated.code)}
                          className="shrink-0 p-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded-lg text-purple-400 hover:text-white transition cursor-pointer"
                          title="Copy Link"
                        >
                          {copiedCode === newlyCreated.code ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                        </button>
                      </div>

                      <div className="flex justify-end">
                        <button
                          id="view-newly-created-insights-btn"
                          type="button"
                          onClick={() => setSelectedLink(newlyCreated)}
                          className="text-xs text-purple-400 hover:text-white font-mono font-bold uppercase tracking-wider flex items-center gap-1 hover:underline"
                        >
                          View Link Insights & QR Code →
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Shortener Form */}
                  <form onSubmit={handleShorten} className="space-y-4">
                    {/* Long URL Input */}
                    <div className="space-y-2">
                      <label htmlFor="longUrl" className="block text-[11px] font-mono uppercase tracking-widest text-slate-400">
                        Destination URL (Long URL)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Link2 size={16} />
                        </div>
                        <input
                          type="text"
                          id="longUrl"
                          required
                          placeholder="https://example.com/very/long/destination/path"
                          value={longUrl}
                          onChange={(e) => setLongUrl(e.target.value)}
                          className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-600 font-mono text-sm transition"
                        />
                      </div>
                    </div>

                    {/* Custom Code Alias */}
                    <div className="space-y-2">
                      <label htmlFor="customCode" className="block text-[11px] font-mono uppercase tracking-widest text-slate-400">
                        Custom Link Alias <span className="text-slate-600">(Optional)</span>
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-purple-500/15 bg-slate-950 text-slate-500 text-xs font-mono">
                          /
                        </span>
                        <input
                          type="text"
                          id="customCode"
                          placeholder="promo-code"
                          value={customCode}
                          onChange={(e) => setCustomCode(e.target.value)}
                          className="flex-1 min-w-0 bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-r-xl px-4 py-3 text-slate-200 placeholder-slate-600 font-mono text-sm transition"
                        />
                      </div>
                    </div>

                    {/* Advanced Options Accordion */}
                    <div className="border-t border-purple-500/10 pt-4 mt-2">
                      <button
                        type="button"
                        id="toggle-advanced-btn"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-slate-400 hover:text-white transition"
                      >
                        {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        Advanced Route Configurations
                      </button>

                      <AnimatePresence>
                        {showAdvanced && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden space-y-4 pt-4"
                          >
                            <div className="grid md:grid-cols-3 gap-4">
                              {/* Decryption Key */}
                              <div className="space-y-2">
                                <label htmlFor="password" className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
                                  Access Decryption Password
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <Lock size={14} />
                                  </div>
                                  <input
                                    type="password"
                                    id="password"
                                    placeholder="Require a key to unlock"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl pl-9 pr-3 py-2.5 text-slate-200 placeholder-slate-600 font-mono text-xs transition"
                                  />
                                </div>
                              </div>

                              {/* Confirm Decryption Key */}
                              <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
                                  Confirm Decryption Password
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <Lock size={14} />
                                  </div>
                                  <input
                                    type="password"
                                    id="confirmPassword"
                                    placeholder="Re-type password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl pl-9 pr-3 py-2.5 text-slate-200 placeholder-slate-600 font-mono text-xs transition"
                                  />
                                </div>
                              </div>

                              {/* Expiration Timestamp */}
                              <div className="space-y-2">
                                <label htmlFor="expiresAt" className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
                                  Expiration Date & Time
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <Calendar size={14} />
                                  </div>
                                  <input
                                    type="datetime-local"
                                    id="expiresAt"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                    className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl pl-9 pr-3 py-2.5 text-slate-300 placeholder-slate-600 font-mono text-xs transition"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Description Title */}
                            <div className="space-y-2">
                              <label htmlFor="title" className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
                                Route Title / Internal Notes
                              </label>
                              <input
                                type="text"
                                id="title"
                                placeholder="e.g. Summer Campaign Redirect Link"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-600 font-mono text-xs transition"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      id="shorten-submit-btn"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold font-display uppercase tracking-widest rounded-xl transition cursor-pointer shadow-lg shadow-purple-500/20 active:scale-[0.99]"
                    >
                      {isLoading ? (
                        <span className="font-mono text-xs animate-pulse">Initializing link protocols...</span>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Establish Redirect Route
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* BULK SHORTENING VIEW */
                <div className="space-y-5">
                  <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl space-y-1.5 text-xs font-mono text-slate-400 leading-relaxed">
                    <p className="font-bold text-purple-300 flex items-center gap-1 uppercase tracking-wide">
                      <Database size={13} /> High-Speed Batch Pipeline
                    </p>
                    <p>
                      Generate hundreds of shortened links simultaneously. Drag and drop an Excel (.xlsx) or CSV file, or copy and paste rows from Google Sheets directly below.
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      Format: <span className="text-purple-400">destinationUrl, customSlug, labelNotes</span> (Comma or Tab separated)
                    </p>
                  </div>

                  {bulkError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono flex items-start gap-2">
                      <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                      <span>{bulkError}</span>
                    </div>
                  )}

                  {bulkSuccess && (
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-300 text-xs font-mono flex items-start gap-2">
                      <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{bulkSuccess}</span>
                    </div>
                  )}

                  {/* Drag and Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer relative ${
                      dragActive
                        ? "border-purple-400 bg-purple-500/10"
                        : "border-purple-500/15 hover:border-purple-500/30 bg-slate-950/40"
                    }`}
                  >
                    <input
                      type="file"
                      id="bulk-file-upload"
                      accept=".csv,.txt,.xlsx"
                      onChange={handleFileInputChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <UploadCloud size={32} className="mx-auto text-purple-400/60 mb-2" />
                    <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      Drag & Drop Batch File Here
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      Supports .csv, .txt, or .xlsx raw link documents
                    </p>
                  </div>

                  {/* Multi-Line Text Entry */}
                  <div className="space-y-2">
                    <label htmlFor="bulkInput" className="block text-[11px] font-mono uppercase tracking-widest text-slate-400">
                      Manual link batch list
                    </label>
                    <textarea
                      id="bulkInput"
                      rows={5}
                      placeholder="https://example.com/item1, summer-deal, Promo Item 1&#10;https://example.com/item2, flash-sale, Promo Item 2"
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl p-3 text-slate-200 placeholder-slate-600 font-mono text-xs transition resize-y min-h-[100px]"
                    />
                  </div>

                  {/* Parse Preview List */}
                  {bulkParsedItems.length > 0 && bulkResults.length === 0 && (
                    <div className="bg-slate-950/60 border border-purple-500/10 rounded-xl p-4 space-y-2 max-h-[160px] overflow-y-auto font-mono text-[11px]">
                      <h4 className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">
                        Batch Pipeline Preview ({bulkParsedItems.length} Links)
                      </h4>
                      <div className="space-y-1.5 divide-y divide-purple-500/5">
                        {bulkParsedItems.map((item, idx) => (
                          <div key={idx} className="pt-1.5 flex justify-between gap-3 text-slate-400 truncate">
                            <span className="truncate flex-1" title={item.longUrl}>{item.longUrl}</span>
                            {item.customCode && (
                              <span className="text-purple-300 shrink-0">→ /{item.customCode}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Results Display */}
                  {bulkResults.length > 0 && (
                    <div className="bg-slate-950/80 border border-purple-500/20 rounded-xl p-4 space-y-3 font-mono text-[11px]">
                      <div className="flex justify-between items-center border-b border-purple-500/10 pb-2">
                        <h4 className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                          Protocol Execution Results
                        </h4>
                        <button
                          type="button"
                          id="download-bulk-csv-btn"
                          onClick={downloadBulkResultsCsv}
                          className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 rounded text-[10px]"
                        >
                          <Download size={12} /> Download CSV
                        </button>
                      </div>
                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 select-text">
                        {bulkResults.map((res, idx) => (
                          <div key={idx} className="flex flex-col gap-0.5 border-b border-purple-500/5 pb-1.5">
                            {res.success ? (
                              <>
                                <div className="flex justify-between text-slate-300 font-bold">
                                  <span className="text-emerald-400">SUCCESS</span>
                                  <span>{res.shortUrl}</span>
                                </div>
                                <span className="text-slate-500 text-[10px] truncate">{res.link.longUrl}</span>
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between text-slate-300">
                                  <span className="text-red-400 font-bold">FAILED</span>
                                  <span className="text-red-400">{res.error}</span>
                                </div>
                                <span className="text-slate-600 text-[10px] truncate">{res.raw?.longUrl || "Empty Row"}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Execute Button */}
                  <button
                    type="button"
                    id="execute-bulk-shorten-btn"
                    onClick={executeBulkShorten}
                    disabled={bulkIsProcessing || bulkParsedItems.length === 0}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold font-display uppercase tracking-widest rounded-xl transition cursor-pointer shadow-lg shadow-purple-500/20"
                  >
                    {bulkIsProcessing ? (
                      <span className="font-mono text-xs animate-pulse">Running Link Generation Matrix...</span>
                    ) : (
                      <>
                        <ArrowRight size={16} />
                        Execute Batch Shortening ({bulkParsedItems.length})
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT COLUMN: Active redirection terminals / Link lists (5 Cols) */}
          <section className="lg:col-span-5 space-y-6">
            
            <div className="glass-card rounded-2xl p-6 relative">
              <div className="flex items-center justify-between border-b border-purple-500/10 pb-4 mb-4">
                <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
                  <History size={15} /> Active Redirections
                </h3>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-950 px-2 py-0.5 rounded border border-purple-500/5">
                  TOTAL: {links.length}
                </span>
              </div>

              {links.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-purple-500/5 rounded-xl">
                  <Activity size={32} className="mx-auto text-slate-600 mb-3 animate-pulse" />
                  <p className="text-xs font-mono uppercase tracking-widest text-slate-500 font-semibold">
                    No active connections
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Create a redirect route above. Active maps will display here instantly.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Search input bar */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Search size={14} />
                    </div>
                    <input
                      type="text"
                      id="link-search-input"
                      placeholder="Filter by title, code or destination URL..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl pl-9 pr-8 py-2 text-slate-200 placeholder-slate-600 font-mono text-xs transition"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        id="clear-search-btn"
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition cursor-pointer"
                        title="Clear search"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {filteredLinks.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-purple-500/5 rounded-xl">
                      <Activity size={32} className="mx-auto text-slate-600 mb-3" />
                      <p className="text-xs font-mono uppercase tracking-widest text-slate-500 font-semibold">
                        No matches found
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1 max-w-[200px] mx-auto leading-relaxed font-mono">
                        No active maps match "{searchQuery}"
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {filteredLinks.map((link) => {
                        const shortUrl = `${window.location.origin}/${link.code}`;
                        return (
                          <div
                            key={link.code}
                            id={`link-item-${link.code}`}
                            className="bg-slate-950/60 hover:bg-slate-950/80 border border-purple-500/10 hover:border-purple-500/30 rounded-xl p-3.5 transition flex flex-col justify-between gap-3 group relative"
                          >
                            <div className="space-y-1.5 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-mono font-bold text-purple-400 tracking-tight block truncate">
                                  /{link.code}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {link.isPasswordProtected && (
                                    <Lock size={11} className="text-amber-400" title="Password Protected" />
                                  )}
                                  <span className="text-[9px] font-mono text-slate-500 bg-purple-500/5 px-1 py-0.5 rounded">
                                    {link.clicksCount} clicks
                                  </span>
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono truncate" title={link.title || link.longUrl}>
                                {link.title || link.longUrl}
                              </p>
                            </div>

                            {/* Action buttons on item */}
                            <div className="flex items-center justify-between border-t border-purple-500/5 pt-2.5 mt-1">
                              <span className="text-[9px] font-mono text-slate-600">
                                {new Date(link.createdAt).toLocaleDateString()}
                              </span>
                              
                              <div className="flex items-center gap-2">
                                {/* Copy button */}
                                <button
                                  id={`copy-btn-${link.code}`}
                                  onClick={() => copyToClipboard(link.code)}
                                  className="p-1.5 bg-slate-900 border border-purple-500/5 hover:border-purple-500/20 rounded-lg text-slate-400 hover:text-white transition"
                                  title="Copy Short Link"
                                >
                                  {copiedCode === link.code ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                </button>

                                {/* View insights button */}
                                <button
                                  id={`insights-btn-${link.code}`}
                                  onClick={() => setSelectedLink(link)}
                                  className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-lg text-[10px] font-mono font-semibold uppercase tracking-wider text-purple-300 hover:text-white transition cursor-pointer"
                                >
                                  Insights
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Design Help Card */}
            <div className="bg-slate-900/40 border border-purple-500/10 rounded-2xl p-5 space-y-3 font-mono text-[11px] text-slate-400">
              <h4 className="text-xs uppercase tracking-widest text-purple-400 font-bold flex items-center gap-1.5">
                <HelpCircle size={14} /> Creative Z Guidelines
              </h4>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Custom aliases support letters, numbers, dashes, and underscores.</li>
                <li>Secure decrypt routes prompt for authorization before redirecting.</li>
                <li>QR codes can be directly scanned or saved for dynamic redirection.</li>
              </ul>
            </div>
          </section>

        </main>

        {/* Footer info (No copyright/empty year issues) */}
        <footer className="mt-12 pt-6 border-t border-purple-500/10 flex flex-wrap gap-4 justify-between items-center text-xs text-slate-500 font-mono uppercase tracking-wider">
          <div>
            CREATIVE Z LINK &copy; ALL RIGHTS RESERVED
          </div>
        </footer>

      </div>

      {/* Link Insight Details Modal */}
      {selectedLink && (
        <LinkDetailsModal
          link={selectedLink}
          onClose={() => setSelectedLink(null)}
          onDelete={handleDelete}
          onUpdate={fetchActiveLinks}
        />
      )}

    </div>
  );
}
