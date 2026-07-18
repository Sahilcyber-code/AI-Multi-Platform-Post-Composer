import express from 'express';
import dns from 'node:dns';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './backend/config/db.js';

import authRoutes from './backend/routes/authRoutes.js';
import userRoutes from './backend/routes/userRoutes.js';
import draftRoutes from './backend/routes/draftRoutes.js';
import historyRoutes from './backend/routes/historyRoutes.js';
import aiRoutes from './backend/routes/aiRoutes.js';
import mediaRoutes from './backend/routes/mediaRoutes.js';

// =========================
// Resolve paths
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// Load environment variables
// =========================
dotenv.config();

// =========================
// DNS
// =========================
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// =========================
// Connect Database
// =========================
connectDB();

// =========================
// Initialize Express
// =========================
const app = express();

const PORT = process.env.PORT || 5000;

// =========================
// Middlewares
// =========================
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =========================
// Static Uploads
// =========================
app.use(
  "/uploads",
  express.static(path.join(__dirname, "backend/uploads"))
);

// =========================
// API Routes
// =========================
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/drafts", draftRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/media", mediaRoutes);

// =========================
// Serve React Frontend
// =========================
app.use(express.static(path.join(__dirname, "dist")));

// React Router fallback (Express 5 compatible)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// =========================
// Global Error Handler
// =========================
app.use((err, req, res, next) => {
  console.error(err);

  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack:
      process.env.NODE_ENV === "production"
        ? undefined
        : err.stack,
  });
});

// =========================
// Start Server
// =========================
app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});