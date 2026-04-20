import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import workspaceRoutes from "./routes/workspace.js";
import "./config/passport.js";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload"

// passport ak stretegi library che jem ke google auth karva mate use thay che. github auth mate pan use thay che.

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5000',
  'https://semisolemn-oliver-thievish.ngrok-free.dev'
];

app.use(fileUpload({
  useTempFiles:true
}))

app.use(cors(
  {
    origin:[process.env.FRONTEND_URL],
    credentials: true
  }
));
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());


app.use("/api/auth", authRoutes);
app.use("/api/workspace", workspaceRoutes);


mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log(err);
});


app.listen(process.env.PORT, () => {
    console.log("Server is running on port " + process.env.PORT);
});


