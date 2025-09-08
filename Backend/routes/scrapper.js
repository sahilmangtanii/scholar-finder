const express = require("express");
const { spawn } = require("child_process");
const path = require("path");

const router = express.Router();

router.get("/update-scholarships", async (req, res) => {
  try {
    const scriptPath = path.join(process.cwd(), "../scholarship-scrapper/scrapers/scrapper.py");
    const py = spawn("/opt/anaconda3/bin/python", [scriptPath]);
    let output = "";

    py.stdout.on("data", (data) => {
      output += data.toString();
      console.log("Scraper:", data.toString());
    });

    py.stderr.on("data", (data) => {
      console.error("Scraper Error:", data.toString());
    });

    py.on("close", (code) => {
      if (code === 0) {
        res.json({ success: true, message: "Scraper finished", logs: output });
      } else {
        res.status(500).json({ success: false, error: "Scraper failed" });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;