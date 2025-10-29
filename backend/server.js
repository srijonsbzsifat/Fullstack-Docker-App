const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

function sendToLogstash(logData) {
  const logstashUrl = 'http://logstash:5000';
  
  fetch(logstashUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logData)
  })
  .then(response => {
    if (!response.ok) {
      console.error('Logstash returned error:', response.status);
    }
  })
  .catch(error => {
    console.error('Failed to send to Logstash:', error.message);
  });
}

function jlog(event, meta = {}) {
  const payload = {
    ts: new Date().toISOString(),
    service: 'backend',
    event,
    level: meta.level || 'info', // Default to 'info' if not specified
    message: meta.message || event,
    ...meta
  };
  
  console.log(JSON.stringify(payload));
  
  sendToLogstash(payload);
}

app.get('/health', (_req, res) => res.send('ok'));

const PORT = 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/testdb';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected...');
    jlog('mongodb_connected', { 
      uri: MONGO_URI.replace(/\/\/.*@/, '//*****@'),
      message: 'Successfully connected to MongoDB',
      level: 'info'
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    jlog('mongodb_connection_error', { 
      error: err.message,
      level: 'error',
      message: `MongoDB connection failed: ${err.message}`
    });
  });

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Item = mongoose.model('Item', itemSchema);

app.use((req, res, next) => {
  const t0 = Date.now();
  res.on('finish', () => {
    const duration_ms = Date.now() - t0;
    const level = res.statusCode >= 400 ? 'error' : 'info';
    
    jlog('http_request', {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms,
      level,
      message: `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration_ms}ms)`
    });
  });
  next();
});

// Client log endpoint - RECEIVES logs from frontend
app.post('/client-log', (req, res) => {
  const body = req.body || {};
  
  // Forward to Logstash with proper structure
  const logPayload = {
    ts: body.ts || new Date().toISOString(),
    service: body.service || 'frontend',
    event: body.event || 'unknown',
    level: body.level || 'info',
    message: body.message || body.event || 'No message',
    ...body
  };
  
  // Log to console for debugging
  console.log('Received from frontend:', JSON.stringify(logPayload));
  
  // Send to Logstash
  sendToLogstash(logPayload);
  
  res.sendStatus(204);
});

// GET all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    jlog('items_fetched', { 
      count: items.length,
      level: 'info',
      message: `Fetched ${items.length} items`
    });
    res.json(items);
  } catch (err) {
    jlog('items_fetch_error', { 
      error: err.message,
      level: 'error',
      message: `Failed to fetch items: ${err.message}`
    });
    res.status(500).json({ message: 'Server error' });
  }
});

// POST new item with validation
app.post('/api/items', async (req, res) => {
  const itemName = req.body.name;
  
  // Validation
  if (!itemName || itemName.trim() === '') {
    jlog('item_create_validation_error', {
      error: 'Empty item name',
      level: 'error',
      error_type: 'validation',
      message: 'Validation failed: Item name cannot be empty'
    });
    return res.status(400).json({ 
      message: 'Item name is required and cannot be empty' 
    });
  }

  const newItem = new Item({
    name: itemName.trim()
  });
  
  try {
    const item = await newItem.save();
    jlog('item_created', { 
      id: item._id, 
      name: item.name,
      level: 'info',
      message: `Item created successfully: ${item.name}`
    });
    res.status(201).json(item);
  } catch (err) {
    jlog('item_create_error', { 
      error: err.message,
      level: 'error',
      message: `Failed to create item: ${err.message}`
    });
    res.status(400).json({ message: 'Error adding item' });
  }
});

// Test error endpoint
app.get('/api/test-error', (req, res) => {
  jlog('test_error_triggered', {
    level: 'warn',
    message: 'Test error endpoint called'
  });
  
  const error = new Error('This is a simulated server error for testing');
  jlog('test_error_thrown', {
    error: error.message,
    error_type: 'server',
    level: 'error',
    message: 'Simulated server error occurred'
  });
  
  res.status(500).json({ 
    message: 'Internal Server Error - This is a test error'
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  jlog('server_started', { 
    port: PORT,
    level: 'info',
    message: `Server started on port ${PORT}`
  });
});