const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const notificationRoutes = require('./routes/notification');
const scholarshipRoutes = require('./routes/scholarshipRoutes');
const userRoutes = require('./routes/userRoute.js');
const scraperRoute = require('./routes/scrapper.js');

dotenv.config();
const app = express();


const allowed = [
  process.env.FRONTEND_URL,   // e.g. https://scholarship-finder.vercel.app
  "http://localhost:5173"     // local dev (vite)
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

//  Body parser
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

//  MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

//  Routes
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/scraper", scraperRoute);
//  Health check endpoint (recommended for Render)
app.get('/health', (_, res) => res.send('ok'));

const PORT = process.env.PORT || 5050;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});