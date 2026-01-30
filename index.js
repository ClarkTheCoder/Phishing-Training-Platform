import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "backend running" });
});

app.post("/report-phish", (req, res) => {
  const reportedAt = new Date().toISOString();

  res.json({
    message: "Nice catch!",
    detail: "Thanks for reporting this suspicious message. You’re helping keep everyone safe.",
    reportedAt
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
