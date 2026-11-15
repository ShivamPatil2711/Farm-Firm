const express = require("express");
const router = express.Router();

const ML_BASE = process.env.ML_SERVICE_URL || "http://localhost:8000";

router.all("/*", async (req, res) => {
  try {
    const url = `${ML_BASE}${req.originalUrl}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);
    const opts = {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: ["POST", "PUT"].includes(req.method)
        ? JSON.stringify(req.body)
        : undefined,
    };
    // use dynamic import for node-fetch if global fetch is not available in Node < 18
    const fetchFn = typeof fetch === "function" ? fetch : (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    const mlRes = await fetchFn(url, opts);
    clearTimeout(timeout);
    const data = await mlRes.json();
    res.status(mlRes.status).json(data);
  } catch (err) {
    console.error("ML Service Proxy Error:", err);
    const status = err.name === "AbortError" ? 504 : 503;
    res.status(status).json({
      error:
        status === 504
          ? "ML service timed out. Please try again."
          : "ML service unavailable",
    });
  }
});

module.exports = router;

