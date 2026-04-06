const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
console.log('GEMINI KEY:', process.env.GEMINI_API_KEY ? 'LOADED' : 'MISSING');
const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/drives', require('./routes/drives'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/students', require('./routes/students'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/experiences', require('./routes/experiences'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/auditlogs', require('./routes/auditlogs'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/ai', require('./routes/ai'));

app.get('/', (req, res) => res.json({ message: 'Placement Management System API' }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error('DB connection error:', err));