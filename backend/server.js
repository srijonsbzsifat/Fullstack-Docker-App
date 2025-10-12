const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/health', (_req, res) => res.send('ok')); // quick sanity check

const PORT = 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/testdb';

// --- MongoDB Connection ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- Mongoose Schema and Model ---
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Item = mongoose.model('Item', itemSchema);

app.use((req, res, next) => {
  const t0 = Date.now();
  res.on('finish', () => {
    try {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        service: 'backend',
        event: 'http_request',
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration_ms: Date.now() - t0
      }));
    } catch (_) {}
  });
  next();
});

// optional: browser events → Kibana
app.post('/client-log', (req, res) => {
  const body = req.body || {};
  try {
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      service: 'frontend',
      via: 'client-log',
      ...body
    }));
  } catch (_) {}
  res.sendStatus(204);
});

// --- API Routes ---
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/items', async (req, res) => {
  const newItem = new Item({
    name: req.body.name
  });
  try {
    const item = await newItem.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: 'Error adding item' });
  }
});

app.use((req, res, next) => {
  const t0 = Date.now();
  res.on('finish', () => {
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      service: 'backend',
      event: 'http_request',
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: Date.now() - t0
    }));
  });
  next();
});

app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));