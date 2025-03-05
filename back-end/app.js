const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const calculationRoutes = require('./routes/calculationRoutes');

dotenv.config();
const app = express();

// 🔹 Enable CORS for frontend (http://localhost:5173)
app.use(cors({
  origin: 'http://117.4.152.239:5173',
  credentials: true
}));

app.use(express.json());

app.use('/users', userRoutes);
app.use('/calculations', calculationRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));
