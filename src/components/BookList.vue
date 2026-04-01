<template>
  <div class="book-list">
    <h2>历史书籍库</h2>
    <div class="books-grid">
      <div v-for="book in books" :key="book.id" class="book-card">
        <img :src="book.cover || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=historical%20book%20cover%20placeholder&image_size=square_hd'" :alt="book.title" class="book-cover">
        <div class="book-info">
          <h3>{{ book.title }}</h3>
          <p class="book-author">作者：{{ book.author }}</p>
          <p class="book-year">年份：{{ book.year }}</p>
          <p class="book-description">{{ book.description }}</p>
          <div class="book-actions">
            <button @click="previewBook(book)" class="btn preview-btn" :disabled="isLoading">预览</button>
            <button @click="showFormatModal(book)" class="btn download-btn" :disabled="isLoading">
              {{ isLoading ? '处理中...' : '下载' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 格式选择模态框 -->
    <div v-if="showFormatSelect" class="format-modal">
      <div class="modal-content">
        <h3>选择下载格式</h3>
        <div class="format-options">
          <button v-if="selectedBook.formats && selectedBook.formats.epub && selectedBook.formats.epub !== '#'" @click="downloadWithFormat(selectedBook, 'epub')" class="format-btn">EPUB</button>
          <button v-if="selectedBook.formats && selectedBook.formats.mobi && selectedBook.formats.mobi !== '#'" @click="downloadWithFormat(selectedBook, 'mobi')" class="format-btn">MOBI</button>
          <button v-if="selectedBook.formats && selectedBook.formats.pdf && selectedBook.formats.pdf !== '#'" @click="downloadWithFormat(selectedBook, 'pdf')" class="format-btn">PDF</button>
        </div>
        <button @click="showFormatSelect = false" class="close-btn">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// API基础URL
const baseURL = import.meta.env.VITE_API_BASE_URL || 'baseURL';

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
const isLoading = ref(false);

// 获取token
const getToken = () => {
  return localStorage.getItem('token');
};

// 检查下载限制
const checkDownloadLimit = async () => {
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${baseURL}/downloads/check-limit`, {
      method: 'GET',
      headers,
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('检查下载限制失败:', error);
    // 出错时默认允许下载
    return { canDownload: true, downloadCount: 0, limit: 3 };
  }
};

// 记录下载
const recordDownload = async (bookId, bookTitle, format) => {
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${baseURL}/downloads/record`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ bookId, bookTitle, format }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('记录下载失败:', error);
    // 出错时默认允许下载
    return { success: true, message: '下载成功' };
  }
};

const previewBook = (book) => {
  emit('preview-book', book);
};

const showFormatModal = async (book) => {
  // 检查下载限制
  isLoading.value = true;
  const limitInfo = await checkDownloadLimit();
  isLoading.value = false;
  
  if (!limitInfo.canDownload) {
    alert('您今天的下载次数已达上限，请登录后继续下载');
    return;
  }
  
  selectedBook.value = book;
  showFormatSelect.value = true;
};

const downloadWithFormat = async (book, format) => {
  showFormatSelect.value = false;
  if (book.formats && book.formats[format] && book.formats[format] !== '#') {
    // 检查下载限制
    isLoading.value = true;
    const limitInfo = await checkDownloadLimit();
    
    if (!limitInfo.canDownload) {
      isLoading.value = false;
      alert('您今天的下载次数已达上限，请登录后继续下载');
      return;
    }
    
    // 记录下载
    const recordResult = await recordDownload(book.id, book.title, format);
    isLoading.value = false;
    
    if (!recordResult.success) {
      alert(recordResult.message || '下载失败，请重试');
      return;
    }
    
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
