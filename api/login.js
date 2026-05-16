const adminPassword = "physoc@2026";

export default function handler(req, res) {
  if (req.method === "POST") {
    try {
      const payload = req.body;
      if (payload.password !== adminPassword) {
        return res.status(401).json({ ok: false, error: "Incorrect password" });
      }
      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(400).json({ ok: false, error: "Could not check password" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
