const fs = require("fs");
const path = require("path");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "app.db");
const SEED_PATH = path.join(DATA_DIR, "seed.json");

const PRESS_URLS = [
  "https://pirha.org/dersim-tertelesinin-88-yilinda-ankarada-anma-yapildi-video-474280.html/04/05/2025/",
  "https://pirha.org/dersim-tertelesinin-87-yilinda-ankarada-anma-yapildi-video-428921.html/04/05/2024/",
  "https://pirha.org/ankara-dersimliler-derneginin-baskani-yeniden-cigdem-camkiran-oldu-407616.html/17/12/2023/",
  "https://pirha.org/ankara-dersimliler-dernegi-15-olagan-kurulunu-yapti-video-407600.html/17/12/2023/",
  "https://pirha.org/seyit-riza-ve-arkadaslari-ankarada-anildi-dersim-halkindan-ozur-dilensin-video-349775.html/15/11/2022/",
  "https://pirha.org/ankaradaki-dersimliler-yoresel-yemek-programinda-bir-araya-geldi-video-343555.html/01/10/2022/",
  "https://pirha.org/ankara-dersimliler-dernegi-asure-lokmasi-dagitacak-337136.html/16/08/2022/",
  "https://pirha.org/ankara-dersimliler-dernegi-kahvalti-belgesel-ve-kitap-soylesisi-etkinligi-duzenledi-video-321023.html/24/04/2022/",
  "https://pirha.org/ankara-dersimliler-dernegi-yoresel-yemek-etkinligi-gerceklestirdi-video-318438.html/02/04/2022/",
  "https://pirha.org/ankara-dersimliler-dernegi-iki-belediye-ile-ortak-etkinlik-gerceklestirecek-314810.html/11/03/2022/",
  "https://pirha.org/ankara-dersimliler-dernegi-nazimiye-kaymakami-istifa-etmeli-310693.html/14/02/2022/",
  "https://pirha.org/ankara-dersimliler-derneginin-ilk-kadin-baskani-camkiran-yapacaklari-faaliyetleri-anlatti-video-307630.html/26/01/2022/",
  "https://pirha.org/ankara-dersimliler-dernegi-yoresel-yemek-etkinligi-duzenledi-video-306322.html/15/01/2022/",
  "https://pirha.org/halk-ozani-feyzullah-cinar-ankarada-anildi-video-293480.html/23/10/2021/",
  "https://pirha.org/sivas-katliami-davasina-6-ekimde-devam-edilecek-dadtan-durusmaya-katilim-cagrisi-video-290848.html/05/10/2021/"
];
let pressCache = { items: [], fetchedAt: 0 };

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Schema
(db.prepare(
  "CREATE TABLE IF NOT EXISTS content (key TEXT PRIMARY KEY, value TEXT NOT NULL)"
).run());
(db.prepare(
  "CREATE TABLE IF NOT EXISTS admins (email TEXT PRIMARY KEY, password_hash TEXT NOT NULL)"
).run());

function loadSeedContent() {
  const seedRaw = fs.readFileSync(SEED_PATH, "utf-8");
  return JSON.parse(seedRaw);
}

function getContent() {
  const row = db.prepare("SELECT value FROM content WHERE key = ?").get("content");
  if (!row) {
    const seed = loadSeedContent();
    db.prepare("INSERT INTO content (key, value) VALUES (?, ?)").run("content", JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(row.value);
}

function saveContent(data) {
  db.prepare("INSERT INTO content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run("content", JSON.stringify(data));
}

function ensureAdmin() {
  const existing = db.prepare("SELECT email FROM admins LIMIT 1").get();
  if (existing) return;
  const email = process.env.ADMIN_EMAIL || "admin@dersim.local";
  const password = process.env.ADMIN_PASSWORD || "admin1234";
  const hash = bcrypt.hashSync(password, 10);
  db.prepare("INSERT INTO admins (email, password_hash) VALUES (?, ?)").run(email, hash);
  console.log("\nAdmin oluşturuldu:");
  console.log(`- E-posta: ${email}`);
  console.log(`- Şifre: ${password}`);
  console.log("Lütfen giriş yaptıktan sonra şifreyi değiştirin.\n");
}

ensureAdmin();
getContent();

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dersim-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 6
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));

function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ error: "unauthorized" });
}

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/api/content", (req, res) => {
  res.json(getContent());
});

function decodeHtml(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&#8217;|&#8216;/g, "'")
    .replace(/&#8220;|&#8221;/g, "\"")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(html, key) {
  const metaRegex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const match = html.match(metaRegex);
  return match ? decodeHtml(match[1]) : "";
}

function extractDateFromUrl(url) {
  const match = url.match(/\/(\d{2})\/(\d{2})\/(\d{4})\//);
  if (!match) return "";
  return `${match[1]}.${match[2]}.${match[3]}`;
}

async function fetchPressItems() {
  const items = [];
  for (const url of PRESS_URLS) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (DersimDernegiBot)"
        }
      });
      const html = await response.text();
      const title = extractMeta(html, "og:title") || extractMeta(html, "twitter:title");
      const image = extractMeta(html, "og:image") || extractMeta(html, "twitter:image");
      const date = extractDateFromUrl(url);
      items.push({
        url,
        title: title || url,
        image,
        date
      });
    } catch (err) {
      items.push({ url, title: url, image: "", date: extractDateFromUrl(url) });
    }
  }
  return items;
}

app.get("/api/press/pirha", async (req, res) => {
  try {
    const now = Date.now();
    if (pressCache.items.length && now - pressCache.fetchedAt < 1000 * 60 * 60) {
      return res.json({ items: pressCache.items });
    }
    const items = await fetchPressItems();
    pressCache = { items, fetchedAt: now };
    return res.json({ items });
  } catch (err) {
    return res.status(500).json({ error: "fetch_failed" });
  }
});

app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "missing" });
  const row = db.prepare("SELECT password_hash FROM admins WHERE email = ?").get(email);
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: "invalid" });
  }
  req.session.user = { email };
  return res.json({ ok: true });
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get("/api/admin/content", requireAuth, (req, res) => {
  res.json({ content: getContent(), email: req.session.user.email });
});

app.put("/api/admin/content", requireAuth, (req, res) => {
  const data = req.body;
  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "invalid" });
  }
  saveContent(data);
  return res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Dersim admin paneli hazır: http://localhost:${PORT}`);
});
