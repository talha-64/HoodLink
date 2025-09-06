import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/userRoutes.js";
import neighborhoodRoutes from "./routes/neighborhoodRoutes.js";
import postsRoutes from "./routes/postsRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = process.env.PORT;

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/users", userRoutes);
app.use("/api/neighborhood", neighborhoodRoutes);
app.use("/api/post", postsRoutes);

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
