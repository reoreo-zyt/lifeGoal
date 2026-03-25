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
    <header class="app-header fixed-header">
      <h1>历史书籍库</h1>
      <nav class="tab-nav">
        <RouterLink to="/" class="tab-link" active-class="active">首页</RouterLink>
        <RouterLink to="/articles" class="tab-link" active-class="active">文章</RouterLink>
      </nav>
      <p>探索历史的智慧，下载经典的电子书籍</p>
    </header>
    <main class="app-main header-fixed">
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
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.app-header h1 {
  margin-bottom: 0.5rem;
  color: #d4af37;
  font-size: 1.2rem;
}

.tab-nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 0.5rem 0;
}

.tab-link {
  color: #d4af37;
  text-decoration: none;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
}

.tab-link:hover {
  background-color: rgba(212, 175, 55, 0.2);
}

.tab-link.active {
  background-color: rgba(212, 175, 55, 0.3);
  font-weight: bold;
}

.app-header p {
  margin-top: 0.5rem;
  font-size: 1rem;
}

.app-main {
  flex: 1;
  margin-top: 120px;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 1rem;
  }
  
  .tab-link {
    font-size: 0.9rem;
    padding: 0.4rem 1rem;
  }
  
  .app-main {
    margin-top: 100px;
  }
}
</style>