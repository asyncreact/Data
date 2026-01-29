// index.js
import express from "express";
import "dotenv/config";
import { pool } from "./src/config/db.js";
import usersRouter from "./src/routes/users.routes.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicPath = path.join(__dirname, "public");

console.log("Sirviendo archivos estáticos desde:", publicPath);

app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.get("/offer", (req, res) => {
  res.sendFile(path.join(publicPath, "offer.html"));
});

// PING RÁPIDO para spinner (sin DB)
app.get("/ping", (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    message: 'Backend listo' 
  });
});

// Health check con DB (mantienes el original)
app.get("/health", async (req, res) => {
  try {
    const r = await pool.query("SELECT 1 AS ok");
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use("/users", usersRouter);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await pool.query("SELECT NOW()");
    app.listen(PORT, () => console.log(`Server running on :${PORT}`));
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
}

start();
