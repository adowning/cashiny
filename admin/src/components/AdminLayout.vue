<template>
  <div class="admin-layout">
    <header class="admin-header">
      <h1>Admin Dashboard</h1>
    </header>
    <div class="admin-container">
      <aside class="admin-sidebar">
        <ul>
          <li><router-link to="/dashboard">Dashboard</router-link></li>
          <li><router-link to="/users">Users</router-link></li>
          <li><router-link to="/products">Products</router-link></li>
        </ul>
      </aside>
      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.admin-header {
  background-color: #333;
  color: white;
  padding: 1rem;
  text-align: center;
}

.admin-container {
  display: flex;
  flex: 1;
}

.admin-sidebar {
  background-color: #f0f0f0;
  width: 200px;
  padding: 1rem;
}

.admin-sidebar ul {
  list-style: none;
  padding: 0;
}

.admin-sidebar li {
  margin-bottom: 0.5rem;
}

.admin-content {
  flex: 1;
  padding: 1rem;
}
</style>