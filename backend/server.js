require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("./config/passport");
const authRoutes = require("./routes/auth");
const ensureAuthenticated = require("./middleware/ensureAuth");

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Resolves the MongoDB connection string to use.
 *
 * If USE_MEMORY_DB=true in .env, this spins up a real MongoDB instance
 * automatically in the background (via mongodb-memory-server) — no Atlas
 * account and no local MongoDB install required. Data is written to
 * ./mongo-data so it persists across server restarts.
 *
 * Otherwise, it falls back to the MONGO_URI you provide in .env
 * (e.g. a MongoDB Atlas connection string, or a local mongod instance).
 */
async function resolveMongoUri() {
  if (process.env.USE_MEMORY_DB === "true") {
    const fs = require("fs");
    const { MongoMemoryServer } = require("mongodb-memory-server");

    // mongodb-memory-server needs this folder to already exist
    fs.mkdirSync("./mongo-data", { recursive: true });

    const mongod = await MongoMemoryServer.create({
      binary: {
        version: "7.0.14", // pinned to a known-stable release for reliability
      },
      instance: {
        dbPath: "./mongo-data", // persist data on disk between restarts
        storageEngine: "wiredTiger",
        port: 27117, // fixed port so it's predictable
      },
    });
    const uri = mongod.getUri("google-oauth-app");
    console.log("Using in-memory MongoDB (auto-managed, no setup needed):", uri);
    return uri;
  }

  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI is not set in .env, and USE_MEMORY_DB is not 'true'. Set one of them."
    );
  }
  return process.env.MONGO_URI;
}

async function startServer() {
  try {
    const mongoUri = await resolveMongoUri();

    // ---------- Middleware ----------
    app.use(express.json());
    app.use(
      cors({
        origin: process.env.CLIENT_URL,
        credentials: true, // allow cookies to be sent
      })
    );

    // ---------- Session (Passport Sessions, no JWT) ----------
    app.use(
      session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          mongoUrl: mongoUri,
          collectionName: "sessions",
        }),
        cookie: {
          maxAge: 1000 * 60 * 60 * 24, // 1 day
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        },
      })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    // ---------- Routes ----------
    app.use("/auth", authRoutes);

    // Used by the Dashboard to fetch profile data
    app.get("/api/dashboard", ensureAuthenticated, (req, res) => {
      const { name, email, profilePicture } = req.user;
      res.status(200).json({ name, email, profilePicture });
    });

    app.get("/", (req, res) => {
      res.send("Google OAuth backend is running");
    });

    // ---------- Connect + Listen ----------
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
