import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const adminPassword = "physoc@2026";

export default async function handler(req, res) {
  const contentPath = join(process.cwd(), "assets", "content.json");

  if (req.method === "GET") {
    try {
      const data = await readFile(contentPath, "utf-8");
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.status(200).send(data);
    } catch (err) {
      res.status(500).json({ error: "Could not read content" });
    }
  } else if (req.method === "POST") {
    try {
      const payload = req.body;
      if (payload.password !== adminPassword) {
        return res.status(401).json({ ok: false, error: "Incorrect password" });
      }
      await writeFile(contentPath, JSON.stringify(payload.content, null, 2) + "\n");
      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(400).json({ ok: false, error: "Could not save content" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
