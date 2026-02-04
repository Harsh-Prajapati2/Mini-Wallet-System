const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to DB', err);
  process.exit(1);
});

app.get('/', (req, res) => res.send('Mini Wallet API'));

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));