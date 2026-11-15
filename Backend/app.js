require('dotenv').config();
const express = require('express');
const path = require('path');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required. Add it to Backend/.env before starting the server.');
}

const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
//const errors = require('./controllers/errors');
const mongoose = require('mongoose');
const MONGODB_URL = process.env.MONGO_URI;
const authrouter = require('./routes/authrouter');
const PORT = process.env.PORT || 4003;
const farmerrouter = require('./routes/farmerRouter');
const firmrouter = require('./routes/firmRouter');
const croprouter = require('./routes/cropRouter');
const adminrouter = require('./routes/adminrouter');
const friendrouter = require('./routes/friendRouter');
const quotationrouter = require('./routes/quotationRouter');



const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// 🧩 Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));
// 🔐 JWT middleware
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();

  const token = req.cookies.Usercookie;
  if (!token) {
    req.isLoggedIn = false;
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.isLoggedIn = true;
    req.user = {
      _id: decoded.userId,
      email: decoded.email,
      userType: decoded.userType,
    };
  } catch {
    req.isLoggedIn = false;
    req.user = null;
  }

  next();
});

const mlRouter = require('./routes/mlRouter');

// 🌍 Public routes
app.use('/api/ml', mlRouter);
app.use(croprouter);
app.use(authrouter);
app.use(friendrouter);
app.use(adminrouter)
app.use(farmerrouter);
app.use(firmrouter);
app.use(quotationrouter);

// ❌ 404
//app.use(errors.error404);

// 🚀 Start server
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log('Connected to Mongo');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Mongo connection error:', err);
  });
