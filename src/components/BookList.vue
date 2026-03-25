<template>
  <div class="book-list">
    <h2>历史书籍库</h2>
    <div class="books-grid">
      <div v-for="book in books" :key="book.id" class="book-card">
        <img :src="book.cover" :alt="book.title" class="book-cover">
        <div class="book-info">
          <h3>{{ book.title }}</h3>
          <p class="book-author">作者：{{ book.author }}</p>
          <p class="book-year">年份：{{ book.year }}</p>
          <p class="book-description">{{ book.description }}</p>
          <div class="book-actions">
            <button @click="previewBook(book)" class="btn preview-btn">预览</button>
            <button @click="showFormatModal(book)" class="btn download-btn">下载</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 格式选择模态框 -->
    <div v-if="showFormatSelect" class="format-modal">
      <div class="modal-content">
        <h3>选择下载格式</h3>
        <div class="format-options">
          <button @click="downloadWithFormat(selectedBook, 'epub')" class="format-btn">EPUB</button>
          <button @click="downloadWithFormat(selectedBook, 'mobi')" class="format-btn">MOBI</button>
          <button @click="downloadWithFormat(selectedBook, 'pdf')" class="format-btn">PDF</button>
        </div>
        <button @click="showFormatSelect = false" class="close-btn">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  books: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['preview-book']);
const showFormatSelect = ref(false);
const selectedBook = ref(null);

const previewBook = (book) => {
  emit('preview-book', book);
};

const showFormatModal = (book) => {
  selectedBook.value = book;
  showFormatSelect.value = true;
};

const downloadWithFormat = (book, format) => {
  showFormatSelect.value = false;
  if (book.formats && book.formats[format] && book.formats[format] !== '#') {
    // 下载对应格式的文件
    const link = document.createElement('a');
    link.href = book.formats[format];
    link.download = `${book.title}.${format}`;
    link.click();
  } else {
    alert(`《${book.title}》的${format.toUpperCase()}格式暂未提供`);
  }
};
</script>
