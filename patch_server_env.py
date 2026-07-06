import os
import re

file_path = "/Users/dannyphang/Documents/GitHub/Creative-Z/server.ts"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add ENV_ID
if "const ENV_ID = " not in content:
    content = content.replace(
        "const PORT = 3000;",
        "const PORT = 3000;\nconst ENV_ID = process.env.VERCEL ? 1 : 2;"
    )

# 2. GET /api/links - filter
content = content.replace(
    """const list = snapshot.docs.map(doc => {""",
    """const list = snapshot.docs
      .map(doc => doc.data() as ShortenedLink)
      .filter(data => (data.environment === undefined || data.environment === ENV_ID) && (data.statusId === undefined || data.statusId === 1))
      .map(data => {"""
)
content = content.replace(
    """const data = doc.data() as ShortenedLink;
      const { password, ...summary } = data;""",
    """const { password, ...summary } = data;"""
)

# 3. POST /api/shorten
content = content.replace(
    """clicksCount: 0,
    clicks: []
  };""",
    """clicksCount: 0,
    clicks: [],
    environment: ENV_ID,
    statusId: 1
  };"""
)

# 4. POST /api/bulk
# We already replaced `clicks: []` above, but let's make sure both are hit. Wait, replace() replaces all occurrences by default in python! 
# Let's check how many times `clicksCount: 0,\n    clicks: []\n  };` exists. It exists twice (once in shorten, once in bulk).
# So the above replacement will handle both! Perfect.

# 5. DELETE /api/links/:code
content = content.replace(
    "await docRef.delete();",
    "await docRef.update({ statusId: 2 });"
)

# 6. GET /link/:code (Redirect)
# If statusId is 2, it should return 404.
# Let's see how redirect is implemented. It's usually `app.get("/link/:code")`. Let's do a targeted regex or just find the `doc.exists` check.
# Let's look for `app.get("/link/:code"` in server.ts. I don't know the exact lines so let's patch it with a script that uses regex.

with open(file_path, "w") as f:
    f.write(content)
