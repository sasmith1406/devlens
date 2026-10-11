
import express from "express";
import cors from "cors";
import repositoryRoutes from "./routes/repositoryRoutes.js";

const app = express();

const PORT = 5000;

// Allow requests from our local Next.js frontend
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// Register repository API routes
app.use("/api/repositories", repositoryRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "DevLens backend is running",
  });
});

app.listen(PORT, () => {
  console.log(`DevLens backend running on http://localhost:${PORT}`);
});
