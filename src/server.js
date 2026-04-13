import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import workspaceRoutes from "./routes/workspace.js";
import googleAuthRoutes from "./routes/googleAuth.js";


dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/google", googleAuthRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log(err);
});


app.listen(process.env.PORT, () => {
    console.log("Server is running on port " + process.env.PORT);
});


