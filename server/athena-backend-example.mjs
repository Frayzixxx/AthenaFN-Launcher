/**
 * Exemple minimal : API sur http://athenafn.localhost:5000
 * Lance : node server/athena-backend-example.mjs
 *
 * Remplace par ton vrai backend sur le même host:port (écoute 0.0.0.0).
 */
import express from "express";

const app = express();
const PORT = 5000;

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, name: "AthenaFN", host: "athenafn.localhost" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AthenaFN backend (exemple) → http://127.0.0.1:${PORT} et http://athenafn.localhost:${PORT}`);
});
