const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const calculationRoutes = require('./routes/calculationRoutes');

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Convert CORS_ORIGINS from a comma-separated string to an array
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

app.use('/users', userRoutes);
app.use('/calculations', calculationRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
