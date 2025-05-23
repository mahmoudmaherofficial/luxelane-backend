const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoose = require('./config/db.config');
const fs = require('fs');
const archiver = require('archiver');

// Load environment variables
dotenv.config();

// App init
const app = express();

// Middlewares
app.use(cookieParser()); // Must be before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://localhost:3000', 'https://luxelanestore.vercel.app', 'https://www.code404.site'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
}));

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Serve Postman collection and environment as a ZIP file
app.get('/api/postman-collection', (req, res) => {
  const archive = archiver('zip', { zlib: { level: 9 } });

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="LuxeLane-Postman-Files.zip"');

  archive.pipe(res);

  const collectionPath = path.join(__dirname, 'public', 'postman-collection.json');
  const environmentPath = path.join(__dirname, 'public', 'postman-environment.json');

  archive.file(collectionPath, { name: 'LuxeLane-API-Postman-Collection.json' });
  archive.file(environmentPath, { name: 'Production.postman_environment.json' });

  archive.finalize();
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/account', require('./routes/account.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/cart', require('./routes/cart.routes'));


// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Error handling
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Server error';
  res.status(status).json({ error: message });
});

// Server
const PORT = process.env.PORT || 5000;

mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} 🚀`);
  });
});
