import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const DB_FILE = path.join(process.cwd(), process.env.DB_FILE || "db.json");
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const NODE_ENV = process.env.NODE_ENV || "development";

if (!JWT_SECRET || JWT_SECRET.includes("change-this")) {
  console.error("❌ JWT_SECRET not configured");
  process.exit(1);
}

if (!ADMIN_PASSWORD || ADMIN_PASSWORD.includes("change-this")) {
  console.error("❌ ADMIN_PASSWORD not configured");
  process.exit(1);
}

// CORS
const corsOptions = {
  origin: (process.env.CORS_ORIGIN || "http://localhost:3000").split(","),
  credentials: true,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ limit: "10kb", extended: true }));

// Helmet (production only)
if (NODE_ENV === "production") {
  app.use(helmet());
}

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 60000,
  max: 100,
  standardHeaders: true,
});

// Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | ${res.statusCode} | ${Date.now() - start}ms`);
  });
  next();
});

// JWT verification
const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// Database
let state;

const loadDatabase = () => {
  try {
    state = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch {
    console.error("Loading default state");
    state = getDefaultState();
    saveDatabase(state);
  }
};

const saveDatabase = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

const getDefaultState = () => ({
  categories: [{ id: "mains", nameEn: "Mains", nameAr: "أطباق", nameOm: "Mains", nameAm: "ምግቦች", icon: "Beef" }],
  products: [],
  hero: { 
    titleEn: "Welcome", titleAr: "أهلا", titleOm: "Welcome", titleAm: "እንኩዋን", 
    subtitleEn: "Authentic", subtitleAr: "أصيل", subtitleOm: "Authentic", subtitleAm: "ዋነኛ", 
    images: [] 
  },
  restaurant: { 
    nameEn: "Restaurant", nameAr: "مطعم", nameOm: "Restaurant", nameAm: "ሬስቶራንት", 
    phone: "", email: "", addressEn: "", addressAr: "", addressOm: "", addressAm: "", 
    openingHoursEn: "", openingHoursAr: "", openingHoursOm: "", openingHoursAm: "" 
  },
});

// API Routes
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.post("/api/auth/login", (req, res) => {
  const { password } = req.body;
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
  res.json({ token, expiresIn: "24h" });
});

app.get("/api/state", (req, res) => res.json(state));

app.post("/api/restaurant", apiLimiter, verifyJWT, (req, res) => {
  state.restaurant = { ...state.restaurant, ...req.body };
  saveDatabase(state);
  res.json({ message: "Updated", restaurant: state.restaurant });
});

app.post("/api/hero", apiLimiter, verifyJWT, (req, res) => {
  state.hero = { ...state.hero, ...req.body };
  saveDatabase(state);
  res.json({ message: "Updated", hero: state.hero });
});

app.post("/api/products", apiLimiter, verifyJWT, (req, res) => {
  const { nameEn, nameAr, categoryId, price } = req.body;
  if (!nameEn || !nameAr || !categoryId || isNaN(Number(price))) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const product = {
    id: `prod-${Date.now()}`,
    nameEn, nameAr,
    nameOm: req.body.nameOm || nameEn,
    nameAm: req.body.nameAm || nameEn,
    descriptionEn: req.body.descriptionEn || "",
    descriptionAr: req.body.descriptionAr || "",
    descriptionOm: req.body.descriptionOm || "",
    descriptionAm: req.body.descriptionAm || "",
    price: Number(price),
    categoryId,
    image: req.body.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
    isAvailable: req.body.isAvailable !== false,
    isFeatured: !!req.body.isFeatured,
  };
  state.products.push(product);
  saveDatabase(state);
  res.status(201).json({ message: "Created", product });
});

app.put("/api/products/:id", apiLimiter, verifyJWT, (req, res) => {
  const idx = state.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  state.products[idx] = { ...state.products[idx], ...req.body };
  saveDatabase(state);
  res.json({ message: "Updated", product: state.products[idx] });
});

app.delete("/api/products/:id", apiLimiter, verifyJWT, (req, res) => {
  state.products = state.products.filter(p => p.id !== req.params.id);
  saveDatabase(state);
  res.json({ message: "Deleted" });
});

app.post("/api/categories", apiLimiter, verifyJWT, (req, res) => {
  const { nameEn } = req.body;
  if (!nameEn) return res.status(400).json({ error: "nameEn required" });
  const category = {
    id: nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    nameEn, nameAr: req.body.nameAr || nameEn,
    nameOm: req.body.nameOm || nameEn,
    nameAm: req.body.nameAm || nameEn,
    icon: req.body.icon || "Utensils",
  };
  state.categories.push(category);
  saveDatabase(state);
  res.status(201).json({ message: "Created", category });
});

app.put("/api/categories/:id", apiLimiter, verifyJWT, (req, res) => {
  const idx = state.categories.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  state.categories[idx] = { ...state.categories[idx], ...req.body };
  saveDatabase(state);
  res.json({ message: "Updated", category: state.categories[idx] });
});

app.delete("/api/categories/:id", apiLimiter, verifyJWT, (req, res) => {
  state.categories = state.categories.filter(c => c.id !== req.params.id);
  state.products = state.products.filter(p => p.categoryId !== req.params.id);
  saveDatabase(state);
  res.json({ message: "Deleted" });
});

// Vite & Static Files
async function start() {
  loadDatabase();

  if (NODE_ENV !== "production") {
    console.log("🔧 Using Vite dev server (HMR enabled)");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("📦 Using production build");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT} [${NODE_ENV}]`);
  });
}

start().catch(err => {
  console.error("❌ Start failed:", err);
  process.exit(1);
});
