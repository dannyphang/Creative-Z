import React, { useEffect, useRef, useState } from "react";
import { ShortenedLink } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Copy,
  Check,
  Calendar,
  Lock,
  Globe,
  Trash2,
  QrCode,
  Download,
  BarChart2,
  TrendingUp,
  Smartphone,
  Monitor,
  Tablet,
  Compass,
  Edit3,
  Sliders,
  Settings,
  Clock
} from "lucide-react";
import QRCode from "qrcode";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface LinkDetailsModalProps {
  link: ShortenedLink | null;
  onClose: () => void;
  onDelete: (code: string) => void;
  onUpdate?: () => void;
}

export default function LinkDetailsModal({ link, onClose, onDelete, onUpdate }: LinkDetailsModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"insights" | "qr" | "edit">("insights");
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [linkDetails, setLinkDetails] = useState<ShortenedLink | null>(null);
  const [loading, setLoading] = useState(false);

  // Edit states
  const [editLongUrl, setEditLongUrl] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState("");
  const [clearPassword, setClearPassword] = useState(false);
  const [clearExpiration, setClearExpiration] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // QR Customization states
  const [qrBgColor, setQrBgColor] = useState("#020617");
  const [qrFgColor, setQrFgColor] = useState("#a855f7");
  const [qrSize, setQrSize] = useState("256");
  const [qrFormat, setQrFormat] = useState<"png" | "jpeg">("png");
  const [isSavingQR, setIsSavingQR] = useState(false);
  const [qrSaveStatus, setQrSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Fetch full stats (including clicks array)
  useEffect(() => {
    if (!link) return;
    setLoading(true);
    fetch(`/api/links/${link.code}/stats`, { headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLinkDetails(data.link);
        } else {
          setLinkDetails(link);
        }
      })
      .catch(() => {
        setLinkDetails(link);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [link]);

  // Synchronize edit states when link details are loaded
  useEffect(() => {
    const activeLink = linkDetails || link;
    if (activeLink) {
      setEditLongUrl(activeLink.longUrl);
      setEditTitle(activeLink.title || "");
      setEditPassword("");
      setEditConfirmPassword("");
      setEditExpiresAt(activeLink.expiresAt ? activeLink.expiresAt.substring(0, 16) : "");
      setClearPassword(false);
      setClearExpiration(false);
      setUpdateError("");
      setUpdateSuccess(false);

      if (activeLink.qrCustomization) {
        setQrBgColor(activeLink.qrCustomization.bgColor);
        setQrFgColor(activeLink.qrCustomization.fgColor);
        setQrSize(activeLink.qrCustomization.size);
        setQrFormat(activeLink.qrCustomization.format);
      }
    }
  }, [linkDetails, link]);

  const handleSaveQRConfig = async () => {
    if (!link) return;
    setIsSavingQR(true);
    setQrSaveStatus("idle");
    try {
      const response = await fetch(`/api/links/${link.code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("admin_token")}` },
        body: JSON.stringify({
          qrCustomization: {
            bgColor: qrBgColor,
            fgColor: qrFgColor,
            size: qrSize,
            format: qrFormat
          }
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setQrSaveStatus("success");
        setLinkDetails(data.link);
        if (onUpdate) onUpdate();
        setTimeout(() => setQrSaveStatus("idle"), 3000);
      } else {
        setQrSaveStatus("error");
      }
    } catch {
      setQrSaveStatus("error");
    } finally {
      setIsSavingQR(false);
    }
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLongUrl) {
      setUpdateError("Destination URL cannot be empty.");
      return;
    }
    if (!clearPassword && editPassword && editPassword !== editConfirmPassword) {
      setUpdateError("Passwords do not match. Please verify.");
      return;
    }
    setUpdateError("");
    setUpdateSuccess(false);
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/links/${link.code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("admin_token")}` },
        body: JSON.stringify({
          longUrl: editLongUrl,
          title: editTitle,
          password: clearPassword ? "" : (editPassword || undefined),
          expiresAt: clearExpiration ? "" : (editExpiresAt || undefined)
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setUpdateError(data.error || "Failed to update link configuration.");
      } else {
        setUpdateSuccess(true);
        setLinkDetails(data.link);
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (err) {
      setUpdateError("Network error. Could not update routing configuration.");
    } finally {
      setIsUpdating(false);
    }
  };

  const appUrl = window.location.origin;
  const shortUrl = link ? `${appUrl}/link/${link.code}` : "";

  // Draw QR code
  useEffect(() => {
    if (activeTab === "qr" && qrCanvasRef.current && shortUrl) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        shortUrl,
        {
          width: 256,
          margin: 1,
          color: {
            dark: qrFgColor || "#a855f7",
            light: qrBgColor || "#020617"
          },
          errorCorrectionLevel: "H"
        },
        (error) => {
          if (error) console.error("QR Code generation error:", error);
        }
      );
    }
  }, [activeTab, shortUrl, qrBgColor, qrFgColor]);

  if (!link) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    if (!shortUrl) return;

    // Create an offscreen canvas to render at the requested download size
    const exportSize = parseInt(qrSize, 10) || 256;
    const canvas = document.createElement("canvas");

    QRCode.toCanvas(
      canvas,
      shortUrl,
      {
        width: exportSize,
        margin: 1,
        color: {
          dark: qrFgColor || "#a855f7",
          light: qrBgColor || "#020617"
        },
        errorCorrectionLevel: "H"
      },
      (error) => {
        if (error) {
          console.error("QR Code generation error:", error);
          return;
        }
        const mimeType = qrFormat === "jpeg" ? "image/jpeg" : "image/png";
        const fileExtension = qrFormat;
        const url = canvas.toDataURL(mimeType);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = `z_link_${link.code}_qr_${exportSize}px.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    );
  };

  // Process data for charts
  const clicks = linkDetails?.clicks || [];

  // 1. Device Breakout Data
  const deviceCounts = clicks.reduce((acc: Record<string, number>, curr) => {
    const dev = curr.device || "Desktop";
    acc[dev] = (acc[dev] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS_DEVICE = {
    Desktop: "#3b82f6", // Blue
    Mobile: "#a855f7", // Purple
    Tablet: "#ec4899", // Pink
    Other: "#64748b" // Slate
  };

  // 2. Browser Breakout Data
  const browserCounts = clicks.reduce((acc: Record<string, number>, curr) => {
    const b = curr.browser || "Other";
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const browserData = Object.entries(browserCounts).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS_BROWSER = ["#10b981", "#3b82f6", "#a855f7", "#f59e0b", "#64748b"];

  // 3. Clicks Timeline Data (Grouped by date)
  const clickTimeline = clicks.reduce((acc: Record<string, number>, curr) => {
    try {
      const dateStr = new Date(curr.timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
      });
      acc[dateStr] = (acc[dateStr] || 0) + 1;
    } catch {
      // Ignored
    }
    return acc;
  }, {} as Record<string, number>);

  // Convert to sorted list of past 7 click dates or total dates
  const timelineData = Object.entries(clickTimeline).map(([date, count]) => ({
    date,
    clicks: count
  }));

  // 4. Referrer counts
  const referrerCounts = clicks.reduce((acc: Record<string, number>, curr) => {
    const ref = curr.referrer || "Direct";
    acc[ref] = (acc[ref] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedReferrers = (Object.entries(referrerCounts) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          id="link-details-modal"
          className="relative max-w-3xl w-full rounded-2xl border border-purple-500/20 bg-slate-900/95 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Top subtle ambient beam */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-purple-500/10 gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  LINK CODE: {link.code}
                </span>
                {link.password && (
                  <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                    <Lock size={10} /> Protected
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1.5 truncate max-w-full" title={link.title || link.longUrl}>
                {link.title || link.longUrl}
              </h2>
            </div>
            <button
              id="close-modal-btn"
              onClick={onClose}
              className="p-1.5 border border-purple-500/10 bg-slate-950 hover:bg-purple-500/10 text-slate-400 hover:text-white rounded-lg transition self-end sm:self-center shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Info Bar */}
          <div className="bg-slate-950/50 px-4 sm:px-6 py-3 sm:py-4 border-b border-purple-500/10 flex flex-wrap gap-y-3 gap-x-6 items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-purple-400" />
              <span>CREATED: {new Date(link.createdAt).toLocaleDateString()}</span>
            </div>
            {link.expiresAt ? (
              <div className="flex items-center gap-2 text-amber-400">
                <Calendar size={14} />
                <span>EXPIRES: {new Date(link.expiresAt).toLocaleDateString()}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-500" />
                <span className="text-slate-500">NEVER EXPIRES</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-emerald-400 font-bold">TOTAL CLICKS: {linkDetails?.clicksCount ?? link.clicksCount}</span>
            </div>
          </div>

          {/* Modal Body (Scrollable) */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
            {/* Short & Long Link Boxes */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Short Link Box */}
              <div className="bg-slate-950/70 border border-purple-500/10 rounded-xl p-4 flex flex-col justify-between min-w-0">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-1">
                    Shortened URL
                  </span>
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-300 font-bold text-base sm:text-lg tracking-tight hover:underline flex items-center gap-1 font-display break-all"
                  >
                    {shortUrl}
                  </a>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    id="copy-short-url-btn"
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 text-xs font-semibold rounded-lg transition"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        Copied Link!
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy Short URL
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Long Link Box */}
              <div className="bg-slate-950/70 border border-purple-500/10 rounded-xl p-4 flex flex-col justify-between min-w-0">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
                    Destination URL
                  </span>
                  <p className="text-slate-300 text-sm font-mono break-all line-clamp-3" title={link.longUrl}>
                    {link.longUrl}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <a
                    href={link.longUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-purple-500/10 border border-purple-500/10 text-slate-300 text-xs font-semibold rounded-lg transition"
                  >
                    <Globe size={14} />
                    Visit Target Link
                  </a>
                </div>
              </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-purple-500/10 overflow-x-auto">
              <button
                id="insights-tab-btn"
                onClick={() => setActiveTab("insights")}
                className={`px-5 py-2.5 font-semibold text-xs uppercase tracking-widest border-b-2 flex items-center gap-2 transition shrink-0 ${
                  activeTab === "insights"
                    ? "border-purple-500 text-white"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <BarChart2 size={14} />
                Real-Time Insights
              </button>
              <button
                id="qr-tab-btn"
                onClick={() => setActiveTab("qr")}
                className={`px-5 py-2.5 font-semibold text-xs uppercase tracking-widest border-b-2 flex items-center gap-2 transition shrink-0 ${
                  activeTab === "qr"
                    ? "border-purple-500 text-white"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <QrCode size={14} />
                QR Code Generation
              </button>
              <button
                id="edit-tab-btn"
                onClick={() => setActiveTab("edit")}
                className={`px-5 py-2.5 font-semibold text-xs uppercase tracking-widest border-b-2 flex items-center gap-2 transition shrink-0 ${
                  activeTab === "edit"
                    ? "border-purple-500 text-white"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Settings size={14} />
                Edit Destination
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === "insights" && (
              <div className="space-y-6">
                {loading ? (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-xs uppercase tracking-wider font-mono">
                    <span className="animate-pulse">Loading analytics timeline...</span>
                  </div>
                ) : clicks.length === 0 ? (
                  <div className="border border-dashed border-purple-500/10 rounded-xl p-8 text-center text-slate-500">
                    <TrendingUp size={36} className="mx-auto mb-3 opacity-30 text-purple-400 animate-pulse" />
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">No Click Activity Detected Yet</p>
                    <p className="text-xs text-slate-500 mt-1">This link has not been accessed. Metrics will update instantly on click.</p>
                  </div>
                ) : (
                  <>
                    {/* Clicks Area Chart */}
                    <div className="bg-slate-950/40 border border-purple-500/10 rounded-xl p-4">
                      <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-purple-400" />
                        Click Engagement Over Time
                      </h3>
                      <div className="h-48 w-full font-mono text-[10px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={timelineData}>
                            <defs>
                              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="#64748b" />
                            <YAxis allowDecimals={false} stroke="#64748b" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0f172a",
                                border: "1px solid rgba(168, 85, 247, 0.2)",
                                borderRadius: "8px",
                                color: "#fff",
                                fontFamily: "JetBrains Mono"
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="clicks"
                              stroke="#a855f7"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorClicks)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Referrer Breakout */}
                      <div className="bg-slate-950/40 border border-purple-500/10 rounded-xl p-4">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
                          <Globe size={14} className="text-purple-400" />
                          Top Connection Sources
                        </h3>
                        <div className="space-y-2.5">
                          {sortedReferrers.map(([source, count]) => {
                            const percentage = Math.round((count / clicks.length) * 100);
                            return (
                              <div key={source} className="space-y-1">
                                <div className="flex justify-between text-xs font-mono">
                                  <span className="text-slate-300">{source}</span>
                                  <span className="text-purple-400 font-bold">{count} ({percentage}%)</span>
                                </div>
                                <div className="h-1.5 bg-slate-900 border border-purple-500/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-purple-500 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Device and Browser Grid */}
                      <div className="space-y-4">
                        {/* Devices Breakout */}
                        <div className="bg-slate-950/40 border border-purple-500/10 rounded-xl p-4">
                          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                            <Smartphone size={14} className="text-purple-400" />
                            Device Metrics
                          </h3>
                          <div className="flex items-center justify-around py-2">
                            {["Desktop", "Mobile", "Tablet"].map((dev) => {
                              const count = deviceCounts[dev] || 0;
                              const pct = clicks.length ? Math.round((count / clicks.length) * 100) : 0;
                              const color = COLORS_DEVICE[dev as keyof typeof COLORS_DEVICE] || "#64748b";
                              
                              return (
                                <div key={dev} className="text-center font-mono space-y-1">
                                  {dev === "Desktop" && <Monitor size={20} className="mx-auto" style={{ color }} />}
                                  {dev === "Mobile" && <Smartphone size={20} className="mx-auto" style={{ color }} />}
                                  {dev === "Tablet" && <Tablet size={20} className="mx-auto" style={{ color }} />}
                                  <p className="text-[11px] text-slate-400 uppercase mt-1">{dev}</p>
                                  <p className="text-sm font-bold text-white">{pct}%</p>
                                  <p className="text-[9px] text-slate-500">{count} clicks</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Browsers Breakout */}
                        <div className="bg-slate-950/40 border border-purple-500/10 rounded-xl p-4">
                          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                            <Compass size={14} className="text-purple-400" />
                            Browser Metrics
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {browserData.map((data, index) => {
                              const color = COLORS_BROWSER[index % COLORS_BROWSER.length];
                              return (
                                <div key={data.name} className="flex items-center gap-2 bg-slate-900 border border-purple-500/5 px-2.5 py-1 rounded-lg text-xs font-mono">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                                  <span className="text-slate-300">{data.name}:</span>
                                  <span className="text-white font-bold">{data.value}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "qr" && (
              <div className="grid md:grid-cols-12 gap-6 p-4 sm:p-6">
                {/* Customization Panel */}
                <div className="md:col-span-7 bg-slate-950/40 border border-purple-500/10 rounded-2xl p-4 sm:p-5 space-y-5 text-left">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold flex items-center gap-1.5">
                    <Edit3 size={14} /> Customize your QR code
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Background Color */}
                    <div className="space-y-2">
                      <label htmlFor="qrBgColorInput" className="block text-[11px] font-mono uppercase tracking-widest text-slate-400">
                        Background color
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 w-5 h-5 rounded border border-purple-500/20 overflow-hidden flex items-center justify-center">
                          <input
                            type="color"
                            id="qrBgColorPicker"
                            value={qrBgColor.startsWith("#") && qrBgColor.length === 7 ? qrBgColor : "#020617"}
                            onChange={(e) => setQrBgColor(e.target.value)}
                            className="absolute scale-150 cursor-pointer w-full h-full border-0 p-0"
                          />
                        </div>
                        <input
                          type="text"
                          id="qrBgColorInput"
                          value={qrBgColor}
                          onChange={(e) => setQrBgColor(e.target.value)}
                          placeholder="#020617"
                          className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl pl-11 pr-3 py-2 text-slate-200 font-mono text-xs transition"
                        />
                      </div>
                    </div>

                    {/* Foreground Color */}
                    <div className="space-y-2">
                      <label htmlFor="qrFgColorInput" className="block text-[11px] font-mono uppercase tracking-widest text-slate-400">
                        Foreground color
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 w-5 h-5 rounded border border-purple-500/20 overflow-hidden flex items-center justify-center">
                          <input
                            type="color"
                            id="qrFgColorPicker"
                            value={qrFgColor.startsWith("#") && qrFgColor.length === 7 ? qrFgColor : "#a855f7"}
                            onChange={(e) => setQrFgColor(e.target.value)}
                            className="absolute scale-150 cursor-pointer w-full h-full border-0 p-0"
                          />
                        </div>
                        <input
                          type="text"
                          id="qrFgColorInput"
                          value={qrFgColor}
                          onChange={(e) => setQrFgColor(e.target.value)}
                          placeholder="#a855f7"
                          className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl pl-11 pr-3 py-2 text-slate-200 font-mono text-xs transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Dimension Selector */}
                    <div className="space-y-2">
                      <label htmlFor="qrSizeSelect" className="block text-[11px] font-mono uppercase tracking-widest text-slate-400">
                        Export Size
                      </label>
                      <select
                        id="qrSizeSelect"
                        value={qrSize}
                        onChange={(e) => setQrSize(e.target.value)}
                        className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl px-3 py-2 text-slate-200 font-mono text-xs transition font-mono"
                      >
                        <option value="128">128 px</option>
                        <option value="256">256 px</option>
                        <option value="512">512 px</option>
                        <option value="1024">1024 px</option>
                        <option value="2048">2048 px</option>
                      </select>
                    </div>

                    {/* Format Selector */}
                    <div className="space-y-2">
                      <label htmlFor="qrFormatSelect" className="block text-[11px] font-mono uppercase tracking-widest text-slate-400">
                        Export Format
                      </label>
                      <select
                        id="qrFormatSelect"
                        value={qrFormat}
                        onChange={(e) => setQrFormat(e.target.value as "png" | "jpeg")}
                        className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl px-3 py-2 text-slate-200 font-mono text-xs transition font-mono"
                      >
                        <option value="png">PNG</option>
                        <option value="jpeg">JPEG</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                      Customizing colors dynamically adapts the preview. Higher contrast between foreground and background ensures scanning works beautifully across devices.
                    </p>
                  </div>
                </div>

                {/* Preview & Download Panel */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/20 border border-purple-500/5 rounded-2xl text-center space-y-5">
                  <div className="p-3 bg-slate-950 border border-purple-500/20 rounded-2xl glow-purple max-w-[200px] w-full flex items-center justify-center overflow-hidden">
                    <canvas
                      ref={qrCanvasRef}
                      className="!w-full !h-auto !aspect-square rounded-lg block"
                    ></canvas>
                  </div>

                  <button
                    id="download-qr-btn"
                    onClick={downloadQR}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs uppercase tracking-widest font-semibold rounded-xl cursor-pointer transition shadow-lg shadow-purple-500/10"
                  >
                    <Download size={14} />
                    Download {qrFormat.toUpperCase()}
                  </button>
                  <button
                    id="save-qr-config-btn"
                    onClick={handleSaveQRConfig}
                    disabled={isSavingQR}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-white text-xs uppercase tracking-widest font-semibold rounded-xl cursor-pointer transition shadow-sm mt-3 disabled:opacity-50"
                  >
                    {isSavingQR ? (
                      <span className="animate-pulse">Saving...</span>
                    ) : qrSaveStatus === "success" ? (
                      <span className="text-emerald-400 flex items-center gap-2"><Check size={14} /> Saved</span>
                    ) : qrSaveStatus === "error" ? (
                      <span className="text-red-400 flex items-center gap-2"><X size={14} /> Error</span>
                    ) : (
                      <>
                        <Check size={14} /> Save Configuration
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "edit" && (
              <form onSubmit={handleSaveUpdate} className="space-y-5">
                <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold flex items-center gap-1">
                    <Sliders size={13} /> Dynamic Link Configuration
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Alter target destinations and security thresholds instantly on the server. Your distributed link remains fully intact and redirects traffic seamlessly.
                  </p>
                </div>

                {updateError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono">
                    {updateError}
                  </div>
                )}

                {updateSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-mono">
                    Configuration updated successfully! New routing rules are live.
                  </div>
                )}

                {/* Long URL */}
                <div className="space-y-2">
                  <label htmlFor="editLongUrl" className="block text-[11px] font-mono uppercase tracking-widest text-slate-400">
                    Destination URL (Long URL)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Globe size={14} />
                    </div>
                    <input
                      type="text"
                      id="editLongUrl"
                      required
                      placeholder="https://example.com"
                      value={editLongUrl}
                      onChange={(e) => setEditLongUrl(e.target.value)}
                      className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl pl-9 pr-4 py-2.5 text-slate-200 placeholder-slate-600 font-mono text-xs transition"
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label htmlFor="editTitle" className="block text-[11px] font-mono uppercase tracking-widest text-slate-400">
                    Internal Title / Notes
                  </label>
                  <input
                    type="text"
                    id="editTitle"
                    placeholder="Campaign label"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-600 font-mono text-xs transition"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Password Modification */}
                  <div className="space-y-2 bg-slate-950/40 p-3 rounded-xl border border-purple-500/5">
                    <label htmlFor="editPassword" className="block text-[11px] font-mono uppercase tracking-widest text-slate-400">
                      Access Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock size={14} />
                      </div>
                      <input
                        type="password"
                        id="editPassword"
                        disabled={clearPassword}
                        placeholder={link.password ? "•••••••• (Protected)" : "Update password"}
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-600 font-mono text-xs transition disabled:opacity-30"
                      />
                    </div>
                    {link.password && (
                      <label className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-500 hover:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={clearPassword}
                          onChange={(e) => {
                            setClearPassword(e.target.checked);
                            if (e.target.checked) {
                              setEditPassword("");
                              setEditConfirmPassword("");
                            }
                          }}
                          className="accent-purple-500"
                        />
                        Remove password protection
                      </label>
                    )}
                  </div>

                  {/* Confirm Password Modification */}
                  <div className="space-y-2 bg-slate-950/40 p-3 rounded-xl border border-purple-500/5">
                    <label htmlFor="editConfirmPassword" className="block text-[11px] font-mono uppercase tracking-widest text-slate-400">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock size={14} />
                      </div>
                      <input
                        type="password"
                        id="editConfirmPassword"
                        disabled={clearPassword}
                        placeholder="Re-type password"
                        value={editConfirmPassword}
                        onChange={(e) => setEditConfirmPassword(e.target.value)}
                        className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-600 font-mono text-xs transition disabled:opacity-30"
                      />
                    </div>
                  </div>

                  {/* Expiration Modification */}
                  <div className="space-y-2 bg-slate-950/40 p-3 rounded-xl border border-purple-500/5">
                    <label htmlFor="editExpiresAt" className="block text-[11px] font-mono uppercase tracking-widest text-slate-400">
                      Expiration Time
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Clock size={14} />
                      </div>
                      <input
                        type="datetime-local"
                        id="editExpiresAt"
                        disabled={clearExpiration}
                        value={editExpiresAt}
                        onChange={(e) => setEditExpiresAt(e.target.value)}
                        className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl pl-9 pr-3 py-2 text-slate-300 placeholder-slate-600 font-mono text-xs transition disabled:opacity-30"
                      />
                    </div>
                    {link.expiresAt && (
                      <label className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-500 hover:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={clearExpiration}
                          onChange={(e) => {
                            setClearExpiration(e.target.checked);
                            if (e.target.checked) setEditExpiresAt("");
                          }}
                          className="accent-purple-500"
                        />
                        Remove expiration date
                      </label>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  id="save-update-btn"
                  disabled={isUpdating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold font-display uppercase tracking-widest rounded-xl transition cursor-pointer text-xs"
                >
                  {isUpdating ? "Applying modifications..." : "Save Configuration"}
                </button>
              </form>
            )}
          </div>

          {/* Footer (Danger actions / Deletion) */}
          <div className="p-6 border-t border-purple-500/10 flex justify-between items-center bg-slate-950/20">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
              ID: {link.code}
            </span>
            <button
              id="delete-link-btn"
              onClick={() => {
                if (confirm("Are you sure you want to permanently delete this shortened link and all its metrics?")) {
                  onDelete(link.code);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/40 text-red-400 text-xs font-semibold rounded-xl cursor-pointer transition"
            >
              <Trash2 size={13} />
              Delete Link
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
