import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import workspaceRoutes from "./routes/workspace.js";
import projectRoutes from "./routes/project.js";
import taskRoutes from "./routes/task.js";
import subscriptionRoutes from "./routes/subscription.js";
import "./config/passport.js";
import cors from "cors";
// import {server} from "socket.io";
import passport from "passport";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import planRoutes from "./routes/plan.js";
import chatRoutes from "./routes/chat.js";

import { createServer } from "http";
import { Server } from "socket.io";
import socketHandler from "./socket/index.js";
import { corsOptions, socketCorsOptions } from "./config/cors.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: socketCorsOptions,
});

app.use(fileUpload({ useTempFiles: true }));

app.use(cors(corsOptions));

app.use(cookieParser());

// ✅ STEP 1 — Webhook raw body MUST come before express.json()
// Stripe needs raw buffer, not parsed JSON
app.post(
  "/api/subscription/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    req.rawBody = req.body;
    next();
  }
);

// ✅ STEP 2 — JSON parser for all other routes
app.use(express.json());

app.use(passport.initialize());

// ✅ Health check
app.get("/", (req, res) => {
  res.json({ message: "🚀 Server is running!", status: "OK" });
});

// ✅ STEP 3 — All routes after json parser
app.use("/api/auth", authRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/chat", chatRoutes);

// Initialize Sockets
socketHandler(io);    //-----------Pass the socket server into another file

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  if (!MONGO_URI) {
    console.error("MONGO_URI is missing. Set it in backend/.env");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("Connected to MongoDB");

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

start();
