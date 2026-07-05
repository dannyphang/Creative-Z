import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import app from "./server";

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
