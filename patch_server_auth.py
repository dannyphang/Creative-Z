import os
import re

file_path = "/Users/dannyphang/Documents/GitHub/Creative-Z/server.ts"
with open(file_path, "r") as f:
    content = f.read()

# 1. Imports
if 'import bcrypt from "bcryptjs";' not in content:
    content = content.replace('import dotenv from "dotenv";', 'import dotenv from "dotenv";\nimport bcrypt from "bcryptjs";\nimport jwt from "jsonwebtoken";')

# 2. JWT Config and requireAuth
auth_code = """
const JWT_SECRET = process.env.JWT_SECRET || "creative-z-super-secret-key-fallback";

const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
};
"""
if 'const JWT_SECRET =' not in content:
    content = content.replace('const app = express();', auth_code + '\nconst app = express();')

# 3. Apply requireAuth to protected routes
# We use string replacements for the route definitions
content = content.replace('app.get("/api/links", async (req, res) => {', 'app.get("/api/links", requireAuth, async (req, res) => {')
content = content.replace('app.get("/api/links/:code/stats", async (req, res) => {', 'app.get("/api/links/:code/stats", requireAuth, async (req, res) => {')
content = content.replace('app.post("/api/shorten", async (req, res) => {', 'app.post("/api/shorten", requireAuth, async (req, res) => {')
content = content.replace('app.put("/api/links/:code", async (req, res) => {', 'app.put("/api/links/:code", requireAuth, async (req, res) => {')
content = content.replace('app.delete("/api/links/:code", async (req, res) => {', 'app.delete("/api/links/:code", requireAuth, async (req, res) => {')
content = content.replace('app.post("/api/bulk-shorten", async (req, res) => {', 'app.post("/api/bulk-shorten", requireAuth, async (req, res) => {')

# 4. Add auth endpoints
auth_endpoints = """
// API: Admin Login
app.post("/api/auth/login", async (req, res) => {
  const { password } = req.body;
  if (!password) {
    res.status(400).json({ success: false, error: "Password is required" });
    return;
  }
  
  const adminRef = db.collection("admin").doc("settings");
  const doc = await adminRef.get();
  let isValid = false;

  if (!doc.exists) {
    if (password === "password") {
      isValid = true;
    }
  } else {
    const data = doc.data();
    if (data && data.hashedPassword) {
      isValid = bcrypt.compareSync(password, data.hashedPassword);
    }
  }

  if (isValid) {
    // Generate token valid for 5 hours
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "5h" });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, error: "Invalid password" });
  }
});

// API: Change Password
app.post("/api/auth/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, error: "Missing fields" });
    return;
  }

  const adminRef = db.collection("admin").doc("settings");
  const doc = await adminRef.get();
  
  let isValid = false;
  if (!doc.exists) {
    if (currentPassword === "password") isValid = true;
  } else {
    const data = doc.data();
    if (data && data.hashedPassword) {
      isValid = bcrypt.compareSync(currentPassword, data.hashedPassword);
    }
  }

  if (!isValid) {
    res.status(401).json({ success: false, error: "Invalid current password" });
    return;
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  await adminRef.set({ hashedPassword: newHash }, { merge: true });

  res.json({ success: true, message: "Password updated successfully" });
});

// API: Get all active links (summarized, no password values)"""

if 'app.post("/api/auth/login"' not in content:
    content = content.replace('// API: Get all active links (summarized, no password values)', auth_endpoints)

with open(file_path, "w") as f:
    f.write(content)
