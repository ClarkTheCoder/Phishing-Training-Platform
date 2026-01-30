import express from "express";
import pool from "./db.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "backend running" });
});

app.post("/report-phish", async (req, res) => {
  try {
    const { email, sent_at } = req.body;

    if (!email || !sent_at) {
      return res.status(400).json({
        error: "email and sent_at are required"
      });
    }

    const sentAt = new Date(sent_at);
    if (isNaN(sentAt.getTime())) {
      return res.status(400).json({
        error: "sent_at must be a valid timestamp"
      });
    }

    const reportedAt = new Date();
    const timeToReportSeconds = Math.floor(
      (reportedAt - sentAt) / 1000
    );

    await pool.query(
      `
      INSERT INTO reports (email, sent_at, reported_at, time_to_report_seconds)
      VALUES ($1, $2, $3, $4)
      `,
      [email, sentAt, reportedAt, timeToReportSeconds]
    );

    let detail = "Thanks for reporting.";

    if (timeToReportSeconds < 60) {
      detail = "Excellent response — you reported this in under a minute.";
    } else if (timeToReportSeconds < 300) {
      detail = "Good job reporting quickly.";
    }

    res.json({
      message: "Nice catch!",
      detail,
      timeToReportSeconds
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal server error"
    });
  }
});

app.get("/metrics", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total_reports,
        AVG(time_to_report_seconds) AS avg_time,
        MIN(time_to_report_seconds) AS fastest,
        MAX(time_to_report_seconds) AS slowest
      FROM reports
    `);

    const row = result.rows[0];

    res.json({
      totalReports: Number(row.total_reports),
      averageTimeToReportSeconds: row.avg_time
        ? Math.round(Number(row.avg_time))
        : null,
      fastestReportSeconds: row.fastest,
      slowestReportSeconds: row.slowest
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to retrieve metrics"
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

