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
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  books: {
    type: Array,
    default: () => []
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['preview-book']);
const showFormatSelect = ref(false);
const selectedBook = ref(null);
const downloadCount = ref(0);
const lastDownloadDate = ref('');

// 检查下载限制
const checkDownloadLimit = () => {
  const today = new Date().toDateString();
  const storedCount = localStorage.getItem('downloadCount');
  const storedDate = localStorage.getItem('lastDownloadDate');
  
  if (storedDate === today) {
    downloadCount.value = parseInt(storedCount) || 0;
    lastDownloadDate.value = storedDate;
  } else {
    // 新的一天，重置下载计数
    downloadCount.value = 0;
    lastDownloadDate.value = today;
    localStorage.setItem('downloadCount', '0');
    localStorage.setItem('lastDownloadDate', today);
  }
};

// 增加下载计数
const incrementDownloadCount = () => {
  downloadCount.value++;
  localStorage.setItem('downloadCount', downloadCount.value.toString());
};

// 检查是否可以下载
const canDownload = computed(() => {
  if (props.isLoggedIn) {
    return true; // 登录用户无限制
  }
  return downloadCount.value < 3; // 未登录用户每天最多下载3本
});

const previewBook = (book) => {
  emit('preview-book', book);
};

const showFormatModal = (book) => {
  if (!canDownload.value) {
    alert('您今天的下载次数已达上限，请登录后继续下载');
    return;
  }
  selectedBook.value = book;
  showFormatSelect.value = true;
};

const downloadWithFormat = (book, format) => {
  showFormatSelect.value = false;
  if (book.formats && book.formats[format] && book.formats[format] !== '#') {
    // 检查下载限制
    if (!canDownload.value) {
      alert('您今天的下载次数已达上限，请登录后继续下载');
      return;
    }
    
    // 下载对应格式的文件
    const link = document.createElement('a');
    link.href = book.formats[format];
    link.download = `${book.title}.${format}`;
    link.click();
    
    // 增加下载计数
    if (!props.isLoggedIn) {
      incrementDownloadCount();
    }
  } else {
    alert(`《${book.title}》的${format.toUpperCase()}格式暂未提供`);
  }
};

// 初始化时检查下载限制
onMounted(() => {
  checkDownloadLimit();
});
</script>
