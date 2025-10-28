const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Function to send logs to Logstash
function sendToLogstash(logData) {
  const logstashUrl = process.env.LOGSTASH_URL || 'http://logstash:5000';
  
  fetch(logstashUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logData)
  }).catch(() => {}); // Silently fail if Logstash is not available
}

function jlog(event, meta = {}) {
  const payload = {
    ts: new Date().toISOString(),
    service: 'backend',
    event,
    ...meta
  };
  
  console.log(JSON.stringify(payload));
  sendToLogstash(payload);
}

app.get('/health', (_req, res) => res.send('ok'));

const PORT = 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/testdb';

// --- MongoDB Connection ---
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected...');
    jlog('mongodb_connected', { uri: MONGO_URI.replace(/\/\/.*@/, '//*****@') });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    jlog('mongodb_connection_error', { error: err.message });
  });

// --- Mongoose Schema and Model ---
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Item = mongoose.model('Item', itemSchema);

app.use((req, res, next) => {
  const t0 = Date.now();
  res.on('finish', () => {
    const logData = {
      ts: new Date().toISOString(),
      service: 'backend',
      event: 'http_request',
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: Date.now() - t0
    };
    console.log(JSON.stringify(logData));
    sendToLogstash(logData);
  });
  next();
});

// optional: browser events → Kibana
app.post('/client-log', (req, res) => {
  const body = req.body || {};
  const logData = {
    ts: new Date().toISOString(),
    service: 'frontend',
    via: 'client-log',
    ...body
  };
  console.log(JSON.stringify(logData));
  sendToLogstash(logData);
  res.sendStatus(204);
});

// --- API Routes ---
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    jlog('items_fetched', { count: items.length });
    res.json(items);
  } catch (err) {
    jlog('items_fetch_error', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/items', async (req, res) => {
  const newItem = new Item({
    name: req.body.name
  });
  try {
    const item = await newItem.save();
    jlog('item_created', { id: item._id, name: item.name });
    res.status(201).json(item);
  } catch (err) {
    jlog('item_create_error', { error: err.message });
    res.status(400).json({ message: 'Error adding item' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  jlog('server_started', { port: PORT });
});