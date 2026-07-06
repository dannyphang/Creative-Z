import os

file_path = "/Users/dannyphang/Documents/GitHub/Creative-Z/server.ts"
with open(file_path, "r") as f:
    content = f.read()

# 1. Patch app.get("/link/:code" (Redirect)
redirect_search = """  const link = doc.data() as ShortenedLink;

  if (link.expiresAt && new Date() > new Date(link.expiresAt)) {"""
redirect_replace = """  const link = doc.data() as ShortenedLink;

  if (link.statusId === 2) {
    return next();
  }

  if (link.expiresAt && new Date() > new Date(link.expiresAt)) {"""
content = content.replace(redirect_search, redirect_replace)

# 2. Patch app.post("/api/links/:code/unlock"
unlock_search = """  const doc = await docRef.get();

  if (!doc.exists) {
    res.status(404).json({ success: false, error: "Link not found" });
    return;
  }

  const link = doc.data() as ShortenedLink;"""
unlock_replace = """  const doc = await docRef.get();
  
  if (!doc.exists) {
    res.status(404).json({ success: false, error: "Link not found" });
    return;
  }

  const link = doc.data() as ShortenedLink;
  if (link.statusId === 2) {
    res.status(404).json({ success: false, error: "Link not found" });
    return;
  }"""
content = content.replace(unlock_search, unlock_replace)

# 3. Patch app.get("/api/links/:code/stats"
stats_search = """    if (!doc.exists) {
      res.status(404).json({ success: false, error: "Link not found" });
      return;
    }
    const link = doc.data() as ShortenedLink;"""
stats_replace = """    if (!doc.exists) {
      res.status(404).json({ success: false, error: "Link not found" });
      return;
    }
    const link = doc.data() as ShortenedLink;
    if (link.statusId === 2) {
      res.status(404).json({ success: false, error: "Link not found" });
      return;
    }"""
content = content.replace(stats_search, stats_replace)

with open(file_path, "w") as f:
    f.write(content)
