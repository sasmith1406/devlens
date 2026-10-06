import express from "express";

const app = express();

const PORT = 5000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "DevLens backend is running",
  });
});

app.listen(PORT, () => {
  console.log(`DevLens backend running on http://localhost:${PORT}`);
});