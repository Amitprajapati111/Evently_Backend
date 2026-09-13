import "dotenv/config";
import cors from "cors";
import express from "express";
import connectDB from "./config/db.js";
import requirementRoutes from "./routes/requirementRoutes.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const allowedOrigins = process.env.FRONTEND_URL?.split(",").map((origin) => origin.trim()).filter(Boolean);

app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : true }));
app.use(express.json({ limit: "100kb" }));


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Evently API is running 🚀"
  });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Evently API is running" });
});
app.use("/api/requirements", requirementRoutes);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;

connectDB()
  .then(() => app.listen(port, () => console.info(`Evently API listening on port ${port}`)))
  .catch((error) => {
    console.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  });
