import os

file_path = "/Users/dannyphang/Documents/GitHub/Creative-Z/server.ts"
with open(file_path, "r") as f:
    content = f.read()

# Replace Imports
imports_replacement = """import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { ShortenedLink, ClickRecord } from "./src/types";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";

dotenv.config();

if (!admin.apps.length) {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\\\n/g, "\\n"),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  } else {
    // Attempt application default credentials or fail gracefully
    admin.initializeApp();
  }
}

const db = getFirestore();
"""

content = content.replace('import express from "express";\nimport path from "path";\nimport fs from "fs";\nimport { createServer as createViteServer } from "vite";\nimport { ShortenedLink, ClickRecord } from "./src/types";', imports_replacement)

# Remove DB_FILE, dbInMemory, loadDatabase, saveDatabase
db_logic_start = content.find("const DB_FILE = path.join(process.cwd(), \"links.json\");")
db_logic_end = content.find("// Helper to generate unique short code")
content = content[:db_logic_start] + content[db_logic_end:]


# Refactor startServer
startServer_replacement = """async function startServer() {
  const app = express();
  app.use(express.json());

  // API: Get all active links (summarized, no password values)
  app.get("/api/links", async (req, res) => {
    try {
      const snapshot = await db.collection("links").get();
      const list = snapshot.docs.map(doc => {
        const data = doc.data() as ShortenedLink;
        const { password, ...summary } = data;
        return {
          ...summary,
          isPasswordProtected: !!password
        };
      });
      res.json({ success: true, links: list });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: "Database error" });
    }
  });

  // API: Get individual link stats
  app.get("/api/links/:code/stats", async (req, res) => {
    try {
      const { code } = req.params;
      const doc = await db.collection("links").doc(code).get();
      
      if (!doc.exists) {
        res.status(404).json({ success: false, error: "Link not found" });
        return;
      }
      const link = doc.data() as ShortenedLink;
      const { password, ...safeLink } = link;
      res.json({
        success: true,
        link: {
          ...safeLink,
          isPasswordProtected: !!password
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: "Database error" });
    }
  });

  // API: Create short link
  app.post("/api/shorten", async (req, res) => {
    const { longUrl, customCode, expiresAt, password, title } = req.body;

    if (!longUrl) {
      res.status(400).json({ success: false, error: "Long URL is required" });
      return;
    }

    let formattedUrl = longUrl.trim();
    if (!/^https?:\\/\\//i.test(formattedUrl)) {
      formattedUrl = "http://" + formattedUrl;
    }

    try {
      new URL(formattedUrl);
    } catch {
      res.status(400).json({ success: false, error: "Invalid URL structure" });
      return;
    }

    let code = customCode ? customCode.trim() : "";
    
    if (code) {
      if (!/^[a-zA-Z0-9\\-_]{2,30}$/.test(code)) {
        res.status(400).json({ success: false, error: "Custom alias must be 2-30 characters" });
        return;
      }

      const doc = await db.collection("links").doc(code).get();
      if (doc.exists) {
        res.status(400).json({ success: false, error: "Custom alias already taken" });
        return;
      }
    } else {
      let attempts = 0;
      let docExists = true;
      do {
        code = generateShortCode();
        const doc = await db.collection("links").doc(code).get();
        docExists = doc.exists;
        attempts++;
      } while (docExists && attempts < 10);

      if (docExists) {
        res.status(500).json({ success: false, error: "Failed to generate unique code." });
        return;
      }
    }

    const newLink: ShortenedLink = {
      code,
      longUrl: formattedUrl,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      password: password ? password : undefined,
      isPasswordProtected: !!password,
      title: title ? title.trim() : undefined,
      clicksCount: 0,
      clicks: []
    };

    await db.collection("links").doc(code).set(newLink);

    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const shortUrl = `${appUrl}/link/${code}`;

    res.json({
      success: true,
      code,
      shortUrl,
      link: {
        ...newLink,
        password: undefined
      }
    });
  });

  // API: Update existing link
  app.put("/api/links/:code", async (req, res) => {
    const { code } = req.params;
    const { longUrl, expiresAt, password, title } = req.body;

    const docRef = db.collection("links").doc(code);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      res.status(404).json({ success: false, error: "Link not found" });
      return;
    }
    
    const link = doc.data() as ShortenedLink;

    if (longUrl) {
      let formattedUrl = longUrl.trim();
      if (!/^https?:\\/\\//i.test(formattedUrl)) {
        formattedUrl = "http://" + formattedUrl;
      }
      try {
        new URL(formattedUrl);
        link.longUrl = formattedUrl;
      } catch {
        res.status(400).json({ success: false, error: "Invalid URL structure" });
        return;
      }
    }

    if (expiresAt !== undefined) {
      link.expiresAt = expiresAt ? new Date(expiresAt).toISOString() : undefined;
    }

    if (password !== undefined) {
      link.password = password ? password : undefined;
      link.isPasswordProtected = !!password;
    }

    if (title !== undefined) {
      link.title = title ? title.trim() : undefined;
    }

    await docRef.set(link);

    res.json({
      success: true,
      link: {
        ...link,
        password: undefined
      }
    });
  });

  // API: Bulk Link Generation
  app.post("/api/bulk", async (req, res) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      res.status(400).json({ success: false, error: "Items must be an array" });
      return;
    }

    if (items.length > 1000) {
      res.status(400).json({ success: false, error: "Bulk generation limit is 1000 items" });
      return;
    }

    const results: any[] = [];
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

    // A better approach for Firestore is batch writes, but iterating sequentially 
    // is acceptable for up to 1000 items, although batch would be much faster.
    const batch = db.batch();

    for (const item of items) {
      let { longUrl, customCode, expiresAt, password, title } = item;

      if (!longUrl) {
        results.push({ success: false, error: "Destination URL is required" });
        continue;
      }

      let formattedUrl = longUrl.trim();
      if (!/^https?:\\/\\//i.test(formattedUrl)) {
        formattedUrl = "http://" + formattedUrl;
      }

      try {
        new URL(formattedUrl);
      } catch {
        results.push({ success: false, raw: item, error: "Invalid destination URL structure" });
        continue;
      }

      let code = customCode ? customCode.trim() : "";
      if (code) {
        if (!/^[a-zA-Z0-9\\-_]{2,30}$/.test(code)) {
          results.push({ success: false, raw: item, error: "Custom alias invalid" });
          continue;
        }
        const doc = await db.collection("links").doc(code).get();
        if (doc.exists) {
          results.push({ success: false, raw: item, error: `Custom alias /${code} is already taken` });
          continue;
        }
      } else {
        let attempts = 0;
        let docExists = true;
        do {
          code = generateShortCode();
          const doc = await db.collection("links").doc(code).get();
          docExists = doc.exists;
          attempts++;
        } while (docExists && attempts < 10);

        if (docExists) {
          results.push({ success: false, raw: item, error: "Failed to generate unique random code" });
          continue;
        }
      }

      const newLink: ShortenedLink = {
        code,
        longUrl: formattedUrl,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        password: password ? password : undefined,
        isPasswordProtected: !!password,
        title: title ? title.trim() : undefined,
        clicksCount: 0,
        clicks: []
      };

      const docRef = db.collection("links").doc(code);
      batch.set(docRef, newLink);
      
      results.push({
        success: true,
        code,
        shortUrl: `${appUrl}/link/${code}`,
        link: {
          ...newLink,
          password: undefined
        }
      });
    }

    await batch.commit();
    res.json({ success: true, results });
  });

  // API: Delete link
  app.delete("/api/links/:code", async (req, res) => {
    const { code } = req.params;
    const docRef = db.collection("links").doc(code);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      res.status(404).json({ success: false, error: "Link not found" });
      return;
    }
    
    await docRef.delete();
    res.json({ success: true, message: "Link deleted successfully" });
  });

  // API: Unlock password protected link
  app.post("/api/links/:code/unlock", async (req, res) => {
    const { code } = req.params;
    const { password } = req.body;
    const docRef = db.collection("links").doc(code);
    const doc = await docRef.get();

    if (!doc.exists) {
      res.status(404).json({ success: false, error: "Link not found" });
      return;
    }

    const link = doc.data() as ShortenedLink;

    if (link.password && link.password !== password) {
      res.status(401).json({ success: false, error: "Incorrect password" });
      return;
    }

    const ua = req.headers["user-agent"];
    const referer = req.headers["referer"];
    const { browser, device } = parseUserAgent(ua);
    const referrer = parseReferrer(referer);

    const newClick: ClickRecord = {
      timestamp: new Date().toISOString(),
      referrer,
      browser,
      device
    };

    link.clicksCount++;
    link.clicks.push(newClick);
    await docRef.set(link);

    res.json({ success: true, longUrl: link.longUrl });
  });

  // REDIRECT HANDLER
  app.get("/link/:code", async (req, res, next) => {
    const { code } = req.params;

    if (code === "api") {
      return next();
    }

    const docRef = db.collection("links").doc(code);
    const doc = await docRef.get();

    if (!doc.exists) {
      return next();
    }

    const link = doc.data() as ShortenedLink;

    if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
      res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Expired | Creative Z Link</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Space Grotesk', sans-serif; }
            .blueprint-grid {
              background-size: 50px 50px;
              background-image: 
                linear-gradient(to right, rgba(168, 85, 247, 0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(168, 85, 247, 0.04) 1px, transparent 1px);
            }
          </style>
        </head>
        <body class="bg-slate-950 text-slate-100 min-h-screen relative flex items-center justify-center p-6">
          <div class="fixed inset-0 blueprint-grid pointer-events-none z-0"></div>
          
          <div class="relative z-10 max-w-md w-full border border-purple-500/20 rounded-2xl p-8 bg-slate-900/80 backdrop-blur-md text-center shadow-xl">
            <div class="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h1 class="text-2xl font-bold mb-3 tracking-tight text-white">This Link Has Expired</h1>
            <p class="text-slate-400 text-sm mb-6 leading-relaxed">The owner of this link set an expiration date of <span class="text-purple-400 font-medium">${new Date(link.expiresAt).toLocaleString()}</span>, which has passed.</p>
            <a href="/" class="inline-flex w-full items-center justify-center px-5 py-3 border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-semibold rounded-xl transition duration-200">
              Return to Creative Z Link
            </a>
          </div>
        </body>
        </html>
      `);
      return;
    }

    if (link.password) {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Access Authorization | Creative Z Link</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Space Grotesk', sans-serif; }
            .font-mono { font-family: 'JetBrains Mono', monospace; }
            .blueprint-grid {
              background-size: 50px 50px;
              background-image: 
                linear-gradient(to right, rgba(168, 85, 247, 0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(168, 85, 247, 0.04) 1px, transparent 1px);
            }
            .text-glow {
              text-shadow: 0 0 10px rgba(168, 85, 247, 0.4);
            }
          </style>
        </head>
        <body class="bg-slate-950 text-slate-100 min-h-screen relative flex items-center justify-center p-6">
          <div class="fixed inset-0 blueprint-grid pointer-events-none z-0"></div>
          
          <div class="relative z-10 max-w-md w-full border border-purple-500/20 rounded-2xl p-8 bg-slate-900/80 backdrop-blur-md shadow-2xl">
            <div class="text-center mb-6">
              <div class="w-14 h-14 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h1 class="text-xl font-bold tracking-tight text-white">ACCESS REQ: Z-LINK AUTH</h1>
              <p class="text-slate-400 text-xs mt-1 font-mono uppercase tracking-widest text-purple-400/80">Security Protocol Activated</p>
            </div>

            <div id="errorMessage" class="hidden mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-mono">
              Access Denied: Invalid Credentials
            </div>

            <form id="unlockForm" class="space-y-4">
              <div>
                <label class="block text-xs uppercase tracking-widest text-slate-400 font-mono mb-2">Enter Decryption Key</label>
                <input type="password" id="password" required placeholder="••••••••" class="w-full bg-slate-950 border border-purple-500/20 focus:border-purple-500 focus:outline-none rounded-xl px-4 py-3 font-mono text-center text-purple-300 tracking-wider placeholder-slate-600 transition">
              </div>

              <button type="submit" id="submitBtn" class="w-full flex items-center justify-center px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl cursor-pointer transition shadow-lg shadow-purple-500/20 active:scale-[0.98]">
                Authorize Link Connection
              </button>
            </form>

            <div class="mt-6 text-center text-[10px] text-slate-500 font-mono uppercase tracking-widest">
              Secured via Creative Z Protocol
            </div>
          </div>

          <script>
            document.getElementById('unlockForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              const password = document.getElementById('password').value;
              const submitBtn = document.getElementById('submitBtn');
              const errorDiv = document.getElementById('errorMessage');
              
              submitBtn.disabled = true;
              submitBtn.innerText = 'Verifying security clearances...';
              errorDiv.classList.add('hidden');

              try {
                const response = await fetch('/api/links/${code}/unlock', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ password })
                });

                const data = await response.json();
                
                if (response.ok && data.success && data.longUrl) {
                  submitBtn.innerText = 'Authorization Granted. Redirecting...';
                  setTimeout(() => {
                    window.location.href = data.longUrl;
                  }, 600);
                } else {
                  errorDiv.classList.remove('hidden');
                  submitBtn.disabled = false;
                  submitBtn.innerText = 'Authorize Link Connection';
                  document.getElementById('password').value = '';
                }
              } catch (err) {
                errorDiv.innerText = 'Communication Error. Try again.';
                errorDiv.classList.remove('hidden');
                submitBtn.disabled = false;
                submitBtn.innerText = 'Authorize Link Connection';
              }
            });
          </script>
        </body>
        </html>
      `);
      return;
    }

    const ua = req.headers["user-agent"];
    const referer = req.headers["referer"];
    const { browser, device } = parseUserAgent(ua);
    const referrer = parseReferrer(referer);

    const newClick: ClickRecord = {
      timestamp: new Date().toISOString(),
      referrer,
      browser,
      device
    };

    link.clicksCount++;
    link.clicks.push(newClick);
    await docRef.set(link);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Connecting... | Creative Z Link</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Space Grotesk', sans-serif; }
          .font-mono { font-family: 'JetBrains Mono', monospace; }
          .blueprint-grid {
            background-size: 50px 50px;
            background-image: 
              linear-gradient(to right, rgba(168, 85, 247, 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(168, 85, 247, 0.04) 1px, transparent 1px);
          }
          
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
        </style>
      </head>
      <body class="bg-slate-950 text-slate-100 min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
        <div class="fixed inset-0 blueprint-grid pointer-events-none z-0"></div>
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent pointer-events-none z-10"></div>
        
        <div class="relative z-10 text-center max-w-sm w-full">
          <div class="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center">
            <!-- Rotating Sci-Fi Rings -->
            <div class="absolute inset-0 border border-dashed border-purple-500/20 rounded-full animate-spin-slow"></div>
            <div class="absolute inset-3 border border-purple-500/40 rounded-full"></div>
            <div class="absolute inset-6 border border-dashed border-blue-500/30 rounded-full animate-spin-slow" style="animation-direction: reverse;"></div>
            <div class="w-10 h-10 bg-purple-500/10 border border-purple-500/50 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"></path>
              </svg>
            </div>
          </div>
          
          <h1 class="text-2xl font-bold mb-2 tracking-tight text-white uppercase tracking-wider">Establishing Connection</h1>
          <p class="text-slate-400 text-xs font-mono uppercase tracking-widest text-purple-400 mb-6">Securing quantum redirect route...</p>
          
          <div class="w-full bg-slate-900 border border-purple-500/10 rounded-xl p-4 font-mono text-[11px] text-slate-400 text-left space-y-1 text-center truncate">
            <span class="text-slate-500">REDIRECT_DEST:</span> <span class="text-purple-300 font-semibold select-all">${link.longUrl}</span>
          </div>
        </div>

        <script>
          setTimeout(() => {
            window.location.href = "${link.longUrl}";
          }, 800);
        </script>
      </body>
      </html>
    `);
  });

  // Serve static UI assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
"""

start_app = content.find("async function startServer() {")
content = content[:start_app] + startServer_replacement + "\\nstartServer();\\n"

with open(file_path, "w") as f:
    f.write(content)
