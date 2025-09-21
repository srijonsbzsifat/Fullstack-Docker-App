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

const API_URL = 'http://localhost:3000/api/items'; // API endpoint

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
      try {
        const response = await axios.get(API_URL);
        this.items = response.data;
        this.error = null;
      } catch (err) {
        console.error('Error fetching items:', err);
        this.error = 'Failed to fetch items from the server.';
      }
    },
    async addItem() {
      if (!this.newItemName.trim()) return;
      try {
        await axios.post(API_URL, { name: this.newItemName });
        this.newItemName = '';
        await this.fetchItems(); // Refresh the list
      } catch (err) {
        console.error('Error adding item:', err);
        this.error = 'Failed to add item.';
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