<template>
  <div class="book-preview" v-if="book">
    <div class="preview-header">
      <h2>{{ book.title }}</h2>
      <button @click="closePreview" class="close-btn">×</button>
    </div>
    <div class="preview-content">
      <div class="epub-preview">
        <div ref="epubViewer" class="epub-viewer"></div>
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
import { Book } from 'epubjs';

const props = defineProps({
  book: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close']);
const epubViewer = ref(null);
const selectedFormat = ref('epub');
let bookInstance = null;

const closePreview = () => {
  // 清理资源
  bookInstance = null;
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

onMounted(() => {
  if (props.book && (props.book.formats?.epub || props.book.filePath)) {
    const epubPath = props.book.formats?.epub || props.book.filePath;
    loadEpub(epubPath);
  }
});

const loadEpub = (epubPath) => {
  if (!epubViewer.value) return;
  
  try {
    bookInstance = new Book(epubPath);
    
    // 监听book的ready事件
    bookInstance.ready.then(() => {
      console.log('EPUB book loaded successfully');
      
      // 尝试获取spine并渲染
      if (bookInstance.spine && bookInstance.spine.length > 0) {
        console.log('Spine found:', bookInstance.spine.length, 'items');
        
        // 简单显示书籍信息
        const bookInfo = document.createElement('div');
        bookInfo.style.padding = '20px';
        bookInfo.innerHTML = `
          <h3>书籍信息</h3>
          <p><strong>标题:</strong> ${bookInstance.title || '未知'}</p>
          <p><strong>作者:</strong> ${bookInstance.author || '未知'}</p>
          <p><strong>章节数:</strong> ${bookInstance.spine.length}</p>
          <p>EPUB文件已成功加载，点击下载按钮获取完整内容。</p>
        `;
        epubViewer.value.innerHTML = '';
        epubViewer.value.appendChild(bookInfo);
      } else {
        console.log('No spine found in EPUB');
        
        const errorInfo = document.createElement('div');
        errorInfo.style.padding = '20px';
        errorInfo.innerHTML = `
          <h3>加载信息</h3>
          <p>EPUB文件已成功加载，但无法获取书籍内容结构。</p>
          <p>点击下载按钮获取完整内容。</p>
        `;
        epubViewer.value.innerHTML = '';
        epubViewer.value.appendChild(errorInfo);
      }
    }).catch(error => {
      console.error('Error loading EPUB book:', error);
      
      const errorInfo = document.createElement('div');
      errorInfo.style.padding = '20px';
      errorInfo.innerHTML = `
        <h3>加载错误</h3>
        <p>无法加载EPUB文件，请尝试下载后查看。</p>
      `;
      epubViewer.value.innerHTML = '';
      epubViewer.value.appendChild(errorInfo);
    });
  } catch (error) {
    console.error('Error initializing EPUB:', error);
    
    const errorInfo = document.createElement('div');
    errorInfo.style.padding = '20px';
    errorInfo.innerHTML = `
      <h3>初始化错误</h3>
      <p>无法初始化EPUB阅读器，请尝试下载后查看。</p>
    `;
    epubViewer.value.innerHTML = '';
    epubViewer.value.appendChild(errorInfo);
  }
};

onUnmounted(() => {
  // 清理资源
  bookInstance = null;
});
</script>
