<template>
  <div id="app">
    <h1>Items from DB</h1>
    <form @submit.prevent="addItem">
      <input v-model="newItemName" placeholder="Add a new item" required />
      <button type="submit">Add Item</button>
    </form>

    <div class="error-testing">
      <h3>Error Testing</h3>
      <button @click="triggerValidationError" class="btn-error">
        Trigger Validation Error
      </button>
      <button @click="triggerServerError" class="btn-error">
        Trigger Server Error
      </button>
      <button @click="triggerNetworkError" class="btn-error">
        Trigger Network Error
      </button>
    </div>

    <!-- Items list -->
    <ul>
      <li v-for="item in items" :key="item._id">{{ item.name }}</li>
    </ul>
    
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script>
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/items';
const LOG_URL = 'http://localhost:3000/client-log';

function sendToKibana(payload) {
  fetch(LOG_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (!response.ok) {
      console.error('Failed to send log to backend:', response.status);
    }
  })
  .catch(error => {
    console.error('Error sending log:', error.message);
  });
}

function jlog(event, meta = {}) {
  const payload = { 
    ts: new Date().toISOString(), 
    service: 'frontend',
    event,
    message: meta.message || event,
    ...meta 
  };
  
  try { console.log(JSON.stringify(payload)); } catch {}
  sendToKibana(payload);
}

function rid() { return Math.random().toString(36).slice(2, 10); }

export default {
  name: 'App',
  data() {
    return {
      items: [],
      newItemName: '',
      error: null,
    };
  },

  async created() {
    jlog('app_initialized', { message: 'Application started' });
    await this.fetchItems();
  },

  methods: {
    async fetchItems() {
      const req_id = rid();
      const t0 = performance.now();
      jlog('items_fetch_requested', { req_id, url: API_URL });

      try {
        const response = await axios.get(API_URL);
        this.items = response.data;
        this.error = null;
        jlog('items_fetch_succeeded', {
          req_id,
          status: response.status,
          count: Array.isArray(response.data) ? response.data.length : undefined,
          duration_ms: Math.round(performance.now() - t0),
          level: 1,
          message: `Successfully loaded ${response.data.length} items`
        });
      } catch (err) {
        this.error = 'Failed to fetch items from the server.';
        jlog('items_fetch_failed', {
          req_id,
          status: err?.response?.status,
          code: err?.code,
          message: err?.message || 'Unknown error',
          duration_ms: Math.round(performance.now() - t0),
          level: 2
        });
      }
    },

    async addItem() {
      const name = (this.newItemName || '').trim();
      if (!name) return;

      const req_id = rid();
      const t0 = performance.now();
      jlog('item_create_requested', { 
        req_id, 
        url: API_URL, 
        name_preview: name,
        message: `Creating item: ${name}`
      });

      try {
        const response = await axios.post(API_URL, { name });
        this.newItemName = '';
        this.error = null;
        jlog('item_create_succeeded', {
          req_id,
          status: response.status,
          id: response?.data?._id || response?.data?.id,
          duration_ms: Math.round(performance.now() - t0),
          level: 1,
          message: `Item "${name}" created successfully`
        });
        await this.fetchItems();
      } catch (err) {
        this.error = 'Failed to add item.';
        jlog('item_create_failed', {
          req_id,
          status: err?.response?.status,
          code: err?.code,
          message: err?.message || 'Unknown error',
          duration_ms: Math.round(performance.now() - t0),
          level: 2
        });
      }
    },

    async triggerValidationError() {
      const req_id = rid();
      const t0 = performance.now();
      
      jlog('validation_error_triggered', {
        req_id,
        message: 'User triggered validation error test',
        level: 1
      });

      try {
        // Send empty name to trigger validation error
        const response = await axios.post(API_URL, { name: '' });
        this.error = null;
      } catch (err) {
        this.error = 'Validation Error: Item name cannot be empty';
        jlog('validation_error_occurred', {
          req_id,
          status: err?.response?.status || 400,
          error_type: 'validation',
          message: 'Validation failed: Empty item name',
          duration_ms: Math.round(performance.now() - t0),
          level: 2
        });
      }
    },

    async triggerServerError() {
      const req_id = rid();
      const t0 = performance.now();
      
      jlog('server_error_triggered', {
        req_id,
        message: 'User triggered server error test',
        level: 1
      });

      try {
        // Call the error endpoint
        const response = await axios.get('http://localhost:3000/api/test-error');
      } catch (err) {
        this.error = 'Server Error: Internal server error occurred';
        jlog('server_error_occurred', {
          req_id,
          status: err?.response?.status || 500,
          error_type: 'server',
          message: err?.response?.data?.message || 'Internal server error',
          stack: err?.response?.data?.stack,
          duration_ms: Math.round(performance.now() - t0),
          level: 2
        });
      }
    },

    async triggerNetworkError() {
      const req_id = rid();
      const t0 = performance.now();
      
      jlog('network_error_triggered', {
        req_id,
        message: 'User triggered network error test',
        level: 1
      });

      try {
        // Call non-existent endpoint to trigger network error
        const response = await axios.get('http://localhost:9999/nonexistent');
      } catch (err) {
        this.error = 'Network Error: Could not connect to server';
        jlog('network_error_occurred', {
          req_id,
          status: 0,
          error_type: 'network',
          code: err?.code,
          message: err?.message || 'Network connection failed',
          duration_ms: Math.round(performance.now() - t0),
          level: 2
        });
      }
    }
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  max-width: 600px;
  margin: 60px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

input {
  width: calc(100% - 100px);
  padding: 8px;
  margin-right: 10px;
}

button {
  padding: 8px 12px;
  cursor: pointer;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background: #f4f4f4;
  padding: 10px;
  margin-top: 5px;
  border-radius: 4px;
}

/* NEW: Error testing styles */
.error-testing {
  margin: 20px 0;
  padding: 15px;
  background: #fff3cd;
  border-radius: 4px;
  border: 1px solid #ffc107;
}

.error-testing h3 {
  margin-top: 0;
  color: #856404;
}

.btn-error {
  background: #dc3545;
  color: white;
  border: none;
  margin: 5px;
  padding: 10px 15px;
  border-radius: 4px;
}

.btn-error:hover {
  background: #c82333;
}

.error-message {
  color: #dc3545;
  background: #f8d7da;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}
</style>