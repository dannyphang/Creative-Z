import os

server_path = "/Users/dannyphang/Documents/GitHub/Creative-Z/server.ts"
with open(server_path, "r") as f:
    content = f.read()

# Remove startServer() and indentation
content = content.replace("async function startServer() {\n", "")
content = content.replace("  const app = express();\n  app.use(express.json());", "const app = express();\napp.use(express.json());")

# We'll just split off the bottom part starting at "  // Serve static UI assets"
bottom_part_start = content.find("  // Serve static UI assets")
content = content[:bottom_part_start] + "\nexport default app;\n"

# Remove all 2-space indentation since we removed startServer wrapper
lines = content.split('\n')
new_lines = []
for line in lines:
    if line.startswith("  ") and not line.startswith("    "): # Only remove first level of indent if it's there
        new_lines.append(line[2:])
    elif line.startswith("    "): # keep deeper indents but reduce by 2
        new_lines.append(line[2:])
    else:
        new_lines.append(line)

with open(server_path, "w") as f:
    f.write("\n".join(new_lines))

# Create dev-server.ts
dev_server_content = """import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import app from "./server.js";

const PORT = 3000;

async function startDevServer() {
  const devApp = express();
  
  // Mount API/Link routes from server.ts
  devApp.use(app);

  // Serve static UI assets
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  devApp.use(vite.middlewares);

  devApp.listen(PORT, "0.0.0.0", () => {
    console.log(`Development Server running on http://localhost:${PORT}`);
  });
}

startDevServer();
"""

with open("/Users/dannyphang/Documents/GitHub/Creative-Z/dev-server.ts", "w") as f:
    f.write(dev_server_content)
