<script setup>
import { ref } from 'vue';
import { RouterView, RouterLink } from 'vue-router';
import BookPreview from './components/BookPreview.vue';

const selectedBook = ref(null);

const previewBook = (book) => {
  selectedBook.value = book;
};

const closePreview = () => {
  selectedBook.value = null;
};
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>历史书籍库</h1>
      <nav class="app-nav" v-if="0">
        <RouterLink to="/" class="nav-link" active-class="active">首页</RouterLink>
      </nav>
      <p>探索历史的智慧，下载经典的电子书籍</p>
    </header>
    <main class="app-main">
      <RouterView @preview-book="previewBook" />
    </main>
    <BookPreview v-if="selectedBook" :book="selectedBook" @close="closePreview" />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  text-align: center;
  padding: 1rem 0;
  background-color: #2c1810;
  color: #d4af37;
}

.app-header h1 {
  margin-bottom: 1rem;
  color: #d4af37;
}

.app-nav {
  margin: 1rem 0;
}

.nav-link {
  color: #d4af37;
  text-decoration: none;
  margin: 0 1rem;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.nav-link:hover {
  background-color: rgba(212, 175, 55, 0.2);
}

.nav-link.active {
  background-color: rgba(212, 175, 55, 0.3);
  font-weight: bold;
}

.app-main {
  flex: 1;
}
</style>