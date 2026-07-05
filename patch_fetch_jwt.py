import os
import re

dashboard_path = "/Users/dannyphang/Documents/GitHub/Creative-Z/src/components/LinkDashboard.tsx"
modal_path = "/Users/dannyphang/Documents/GitHub/Creative-Z/src/components/LinkDetailsModal.tsx"

def getAuthHeaders():
    return "headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },"

def getAuthHeadersGet():
    return "headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }"

with open(dashboard_path, "r") as f:
    dashboard_content = f.read()

# Replace fetch("/api/links")
dashboard_content = dashboard_content.replace(
    'fetch("/api/links")',
    'fetch("/api/links", { headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` } })'
)

# Replace fetch("/api/shorten"
dashboard_content = dashboard_content.replace(
    'headers: { "Content-Type": "application/json" }',
    'headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }'
)

# Add Settings button to header
# We need to import useNavigate and add it
if "import { useNavigate }" not in dashboard_content:
    dashboard_content = dashboard_content.replace(
        "import React,",
        "import { useNavigate } from 'react-router-dom';\nimport React,"
    )
    
if "const navigate = useNavigate();" not in dashboard_content:
    dashboard_content = dashboard_content.replace(
        "const [links, setLinks] = useState<ShortenedLink[]>([]);",
        "const navigate = useNavigate();\n  const [links, setLinks] = useState<ShortenedLink[]>([]);"
    )

header_btn = """<div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/link-settings')}
              className="p-2 bg-slate-900 border border-purple-500/20 hover:border-purple-500/50 rounded-xl text-slate-400 hover:text-white transition"
              title="Security Settings"
            >
              <Shield size={18} />
            </button>
            <a 
              href="/"
              className="px-4 py-2 bg-slate-900 border border-purple-500/20 hover:border-purple-500/50 rounded-xl text-xs uppercase tracking-widest font-bold text-slate-300 hover:text-white transition flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Back to Hub
            </a>
          </div>"""

dashboard_content = dashboard_content.replace(
    """<a 
            href="/"
            className="px-4 py-2 bg-slate-900 border border-purple-500/20 hover:border-purple-500/50 rounded-xl text-xs uppercase tracking-widest font-bold text-slate-300 hover:text-white transition flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back to Hub
          </a>""",
    header_btn
)

if "import { Settings" not in dashboard_content:
    dashboard_content = dashboard_content.replace(
        "import { Copy, PlusCircle",
        "import { Shield, Copy, PlusCircle"
    )

with open(dashboard_path, "w") as f:
    f.write(dashboard_content)


with open(modal_path, "r") as f:
    modal_content = f.read()

# modal GET /stats
modal_content = modal_content.replace(
    'fetch(`/api/links/${link.code}/stats`)',
    'fetch(`/api/links/${link.code}/stats`, { headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` } })'
)

# modal PUT and DELETE
modal_content = modal_content.replace(
    'headers: { "Content-Type": "application/json" }',
    'headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }'
)

# Delete is missing Content-Type, so it might just be:
# method: "DELETE"
modal_content = modal_content.replace(
    'method: "DELETE"',
    'method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }'
)

with open(modal_path, "w") as f:
    f.write(modal_content)
