const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const cors = require('cors');
const app = express();
const collectionRoutes = require('./routes/collections');

dotenv.config();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));


app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/collections', collectionRoutes);

app.listen(5000, () => console.log('Server running on port 5000')); 