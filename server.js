import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const HOST = "0.0.0.0";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME_TYPES[ext] || "application/octet-stream";
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 500, "Internal Server Error");
      return;
    }
    send(res, 200, data, { "Content-Type": type });
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const requested = path.normalize(path.join(DIST, urlPath === "/" ? "index.html" : urlPath));

  if (!requested.startsWith(DIST)) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.stat(requested, (err, stats) => {
    if (!err && stats.isFile()) {
      serveFile(res, requested);
      return;
    }

    const indexPath = path.join(DIST, "index.html");
    fs.stat(indexPath, (indexErr, indexStats) => {
      if (indexErr || !indexStats.isFile()) {
        send(res, 404, "Not found. Run npm run build before starting the server.");
        return;
      }
      serveFile(res, indexPath);
    });
  });
});

server.listen(process.env.PORT || 8080, HOST, () => {
  console.log(`Server listening on http://${HOST}:${process.env.PORT || 8080}`);
});
