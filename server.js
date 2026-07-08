/*
  Flipple local Node server
  -------------------------
  Creator: crazywaffleguy
  GitHub:  https://github.com/crazywaffleguy
  Linktree: https://linktr.ee/crazywaffleguy

  Run with: npm run dev
  Open:     http://localhost:3000

  Vercel will serve /public as static files and /api/daily.js as the API route.
  This file is for local development without installing extra dependencies.
*/

const http = require("http");
const fs = require("fs");
const path = require("path");
const { dailyPuzzle } = require("./src/daily");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function sendJson(response, data) {
  response.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=60"
  });
  response.end(JSON.stringify(data));
}

function sendStatic(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const cleanPath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, "");
  const filePath = path.normalize(path.join(PUBLIC_DIR, cleanPath || "index.html"));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, file) => {
    if (error) {
      fs.readFile(path.join(PUBLIC_DIR, "index.html"), (fallbackError, fallback) => {
        if (fallbackError) {
          response.writeHead(404);
          response.end("Not found");
          return;
        }
        response.writeHead(200, { "Content-Type": MIME_TYPES[".html"] });
        response.end(fallback);
      });
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, { "Content-Type": MIME_TYPES[extension] || "application/octet-stream" });
    response.end(file);
  });
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (requestUrl.pathname === "/api/daily") {
    sendJson(response, dailyPuzzle(requestUrl.searchParams.get("mode") || "normal"));
    return;
  }

  sendStatic(request, response);
});

server.listen(PORT, () => {
  console.log(`Flipple is running at http://localhost:${PORT}`);
});
