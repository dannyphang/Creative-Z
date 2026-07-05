import os

file_path = "/Users/dannyphang/Documents/GitHub/Creative-Z/src/components/LinkDetailsModal.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add new state variables
new_states = """  const [qrSize, setQrSize] = useState("256");
  const [qrFormat, setQrFormat] = useState<"png" | "jpeg">("png");
  const [isSavingQR, setIsSavingQR] = useState(false);
  const [qrSaveStatus, setQrSaveStatus] = useState<"idle" | "success" | "error">("idle");"""
content = content.replace('  const [qrSize, setQrSize] = useState("256");\n  const [qrFormat, setQrFormat] = useState<"png" | "jpeg">("png");', new_states)

# 2. Add hydration to useEffect
use_effect_target = """      setClearPassword(false);
      setClearExpiration(false);
      setUpdateError("");
      setUpdateSuccess(false);"""
use_effect_replacement = """      setClearPassword(false);
      setClearExpiration(false);
      setUpdateError("");
      setUpdateSuccess(false);

      if (activeLink.qrCustomization) {
        setQrBgColor(activeLink.qrCustomization.bgColor);
        setQrFgColor(activeLink.qrCustomization.fgColor);
        setQrSize(activeLink.qrCustomization.size);
        setQrFormat(activeLink.qrCustomization.format);
      }"""
content = content.replace(use_effect_target, use_effect_replacement)

# 3. Add handleSaveQRConfig function
save_handler = """  const handleSaveQRConfig = async () => {
    if (!link) return;
    setIsSavingQR(true);
    setQrSaveStatus("idle");
    try {
      const response = await fetch(`/api/links/${link.code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

  const handleSaveUpdate = async (e: React.FormEvent) => {"""
content = content.replace("  const handleSaveUpdate = async (e: React.FormEvent) => {", save_handler)

# 4. Add the save button to the UI
button_target = """                  <button
                    id="download-qr-btn"
                    onClick={downloadQR}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs uppercase tracking-widest font-semibold rounded-xl cursor-pointer transition shadow-lg shadow-purple-500/10"
                  >
                    <Download size={14} />
                    Download {qrFormat.toUpperCase()}
                  </button>
                </div>"""
button_replacement = """                  <button
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
                </div>"""
content = content.replace(button_target, button_replacement)

with open(file_path, "w") as f:
    f.write(content)
