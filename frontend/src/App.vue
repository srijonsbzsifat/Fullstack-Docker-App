<template>
  <div id="app">
    <h1>Items from DB</h1>
    <form @submit.prevent="addItem">
      <input v-model="newItemName" placeholder="Add a new item" required />
      <button type="submit">Add Item</button>
    </form>
    <ul>
      <li v-for="item in items" :key="item._id">{{ item.name }}</li>
    </ul>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/items';
const LOG_URL = 'http://localhost:3000/client-log';    // backend endpoint 

function sendToKibana(payload) {
  fetch('http://localhost:3000/client-log', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  }).catch(()=>{});
}

function jlog(event, meta={}) {
  const payload = { ts:new Date().toISOString(), service:'frontend', event, ...meta };
  try { console.log(JSON.stringify(payload)); } catch {}
  sendToKibana(payload);     // <— this makes browser events appear in Kibana
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
    await this.fetchItems();
  },

  methods: {
    async fetchItems() {
      const req_id = rid(); const t0 = performance.now();
      jlog('items_fetch_requested', { req_id, url: API_URL });

      try {
        const response = await axios.get(API_URL);
        this.items = response.data;
        this.error = null;
        jlog('items_fetch_succeeded', {
          req_id,
          status: response.status,
          count: Array.isArray(response.data) ? response.data.length : undefined,
          duration_ms: Math.round(performance.now() - t0)
        });
      } catch (err) {
        this.error = 'Failed to fetch items from the server.';
        jlog('items_fetch_failed', {
          req_id,
          status: err?.response?.status,
          code: err?.code,
          message: err?.message,
          duration_ms: Math.round(performance.now() - t0)
        });
      }
    },

    async addItem() {
      const name = (this.newItemName || '').trim();
      if (!name) return;

      const req_id = rid(); const t0 = performance.now();
      jlog('item_create_requested', { req_id, url: API_URL, name_preview: name });

      try {
        const response = await axios.post(API_URL, { name });
        this.newItemName = '';
        jlog('item_create_succeeded', {
          req_id,
          status: response.status,
          id: response?.data?._id || response?.data?.id,
          duration_ms: Math.round(performance.now() - t0)
        });
        await this.fetchItems();
      } catch (err) {
        this.error = 'Failed to add item.';
        jlog('item_create_failed', {
          req_id,
          status: err?.response?.status,
          code: err?.code,
          message: err?.message,
          duration_ms: Math.round(performance.now() - t0)
        });
      }
    },
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
</style>