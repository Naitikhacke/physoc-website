import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "127.0.0.1";
const adminPassword = "physoc@2026";
const contentPath = join(root, "assets", "content.json");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

function resolvePath(url) {
  const cleanUrl = decodeURIComponent(url.split("?")[0]);
  const requested = cleanUrl === "/" ? "/index.html" : cleanUrl === "/admin" ? "/admin.html" : cleanUrl;
  const normalized = normalize(requested).replace(/^(\.\.[/\\])+/, "");
  return join(root, normalized);
}

createServer(async (req, res) => {
  try {
    const url = req.url || "/";
    if (url.startsWith("/api/content") && req.method === "GET") {
      const data = await readFile(contentPath);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      res.end(data);
      return;
    }
    if (url.startsWith("/api/login") && req.method === "POST") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", () => {
        try {
          const payload = JSON.parse(body || "{}");
          if (payload.password !== adminPassword) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Incorrect password" }));
            return;
          }
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: false, error: "Could not check password" }));
        }
      });
      return;
    }
    if (url.startsWith("/api/content") && req.method === "POST") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", async () => {
        try {
          const payload = JSON.parse(body || "{}");
          if (payload.password !== adminPassword) {
            res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ ok: false, error: "Incorrect password" }));
            return;
          }
          await writeFile(contentPath, JSON.stringify(payload.content, null, 2) + "\n");
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: false, error: "Could not save content" }));
        }
      });
      return;
    }
    const path = resolvePath(req.url || "/");
    const data = await readFile(path);
    res.writeHead(200, {
      "Content-Type": types[extname(path)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}).listen(port, host, () => {
  console.log(`Physoc site running at http://${host}:${port}/`);
});
