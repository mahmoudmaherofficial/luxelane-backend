const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); // إضافة المسارات الخاصة بالمستخدمين
const accountRoutes = require('./routes/accountRoutes'); // تأكد من أن هذا السطر موجود

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static('public')); // Serve static files from the public directory
app.use(cors({
  origin: 'http://localhost:3000', // فرونت إند Next.js
  credentials: true // لو هتبعت كوكيز أو توكن
}));

const PORT = process.env.PORT;

app.use('/api/auth', authRoutes);  // مسارات التوثيق
app.use('/api/users', userRoutes);  // مسارات المستخدمين
app.use('/api/account', accountRoutes);  // مسارات الحساب

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/home.html'); // Serve the index.html file from the public directory
}); // Using the home method from home_controller

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.log(err));
