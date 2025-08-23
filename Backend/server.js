const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const notificationRoutes = require('./routes/notification');
const scholarshipRoutes = require('./routes/scholarshipRoutes');
const userRoutes = require('./routes/userRoute.js');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use('/api/scholarships', scholarshipRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});