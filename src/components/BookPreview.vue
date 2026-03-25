<template>
  <div class="book-preview" v-if="book">
    <div class="preview-header">
      <h2>{{ book.title }}</h2>
      <button @click="closePreview" class="close-btn">×</button>
    </div>
    <div class="preview-content" ref="contentContainer" @scroll="handleScroll">
      <div v-if="loading" class="loading">
        <h4>加载中</h4>
        <p>正在加载PDF文件，请稍候...</p>
      </div>
      <div v-else class="pdf-container">
        <div v-if="book.formats?.pdf || book.filePath" class="pdf-info">
          <p>PDF路径: {{ book.formats?.pdf || book.filePath }}</p>
          <p>预览页数: 第 {{ currentPage }} 页 (共 {{ numPages }} 页)</p>
          <div v-for="page in currentPage" :key="page" class="pdf-page">
            <VuePdfEmbed 
              :source="book.formats?.pdf || book.filePath" 
              :page="page" 
              :style="{ width: '100%' }" 
              @loaded="handlePdfLoaded"
            />
          </div>
          <div v-if="loadingMore" class="loading-more">
            <p>正在加载更多页面...</p>
          </div>
          <div v-if="currentPage >= numPages && numPages > 0" class="end-message">
            <p>已到达文件末尾</p>
          </div>
        </div>
        <div v-else class="no-content">
          <p>暂无内容预览</p>
          <p>请尝试下载后查看完整内容</p>
        </div>
      </div>
    </div>
    <div class="download-section">
      <h4>选择下载格式</h4>
      <div class="format-options">
        <button @click="downloadWithFormat(book, 'epub')" class="format-btn" :class="{ active: selectedFormat === 'epub' }">EPUB</button>
        <button @click="downloadWithFormat(book, 'mobi')" class="format-btn" :class="{ active: selectedFormat === 'mobi' }">MOBI</button>
        <button @click="downloadWithFormat(book, 'pdf')" class="format-btn" :class="{ active: selectedFormat === 'pdf' }">PDF</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import VuePdfEmbed from 'vue-pdf-embed';

const props = defineProps({
  book: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close']);
const selectedFormat = ref('epub');
const loading = ref(true);
const loadingMore = ref(false);
const numPages = ref(0);
const currentPage = ref(1);
const contentContainer = ref(null);

const closePreview = () => {
  emit('close');
};

const downloadWithFormat = (book, format) => {
  selectedFormat.value = format;
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

const handlePdfLoaded = (pdf) => {
  if (pdf && pdf.numPages) {
    numPages.value = pdf.numPages;
  }
};

const handleScroll = (event) => {
  const container = event.target;
  const { scrollTop, clientHeight, scrollHeight } = container;
  
  // 当滚动到距离底部100px时，加载更多页面
  if (scrollHeight - scrollTop - clientHeight < 100 && !loadingMore.value && currentPage.value < numPages.value) {
    loadMorePages();
  }
};

const loadMorePages = () => {
  if (currentPage.value < numPages.value) {
    loadingMore.value = true;
    // 模拟加载延迟
    setTimeout(() => {
      currentPage.value += 1;
      loadingMore.value = false;
    }, 500);
  }
};

onMounted(() => {
  // 模拟加载延迟
  setTimeout(() => {
    loading.value = false;
  }, 500);
});

onUnmounted(() => {
  // 清理资源
  contentContainer.value = null;
});
</script>

<style scoped>
.book-preview {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 1200px;
  height: 90vh;
  background-color: #f5f0e6;
  border: 2px solid #d4af37;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #d4af37;
  background-color: #2c1810;
  color: #f5f0e6;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.preview-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-family: 'Noto Serif SC', serif;
}

.close-btn {
  background: none;
  border: none;
  color: #f5f0e6;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(212, 175, 55, 0.2);
}

.preview-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
  background-color: white;
}

.pdf-container {
  width: 100%;
  overflow-x: auto;
  min-height: 500px;
}

.pdf-page {
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background-color: #f9f9f9;
}

.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #666;
  text-align: center;
}

.end-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #666;
  text-align: center;
  font-style: italic;
}

.no-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 500px;
  color: #666;
  text-align: center;
}

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #2c1810;
}

.loading h4 {
  margin-bottom: 10px;
  font-family: 'Noto Serif SC', serif;
}

/* 下载区域 */
.download-section {
  padding: 20px;
  border-top: 1px solid #d4af37;
  background-color: #2c1810;
  color: #f5f0e6;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.download-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-family: 'Noto Serif SC', serif;
}

.format-options {
  display: flex;
  gap: 10px;
}

.format-btn {
  padding: 8px 16px;
  border: 1px solid #d4af37;
  border-radius: 4px;
  background-color: #2c1810;
  color: #f5f0e6;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Noto Serif SC', serif;
}

.format-btn:hover {
  background-color: #d4af37;
  color: #2c1810;
}

.format-btn.active {
  background-color: #d4af37;
  color: #2c1810;
  font-weight: bold;
}
</style>
