<template>
  <div class="home-page">
    <div class="search-container">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索历史书籍..."
        class="search-input"
        @input="handleSearch"
      />
    </div>
    <BookList :books="filteredBooks" :is-logged-in="isLoggedIn" @preview-book="previewBook" />
    <div class="support-section">
      <p class="support-text">期待您的支持</p>
      <button @click="showDonationModal = true" class="donation-btn">
        <span class="donation-icon">❤️</span>
      </button>
    </div>
    
    <!-- 捐助模态框 -->
    <div v-if="showDonationModal" class="donation-modal">
      <div class="modal-content">
        <h3>手机扫码捐助</h3>
        <div class="qr-codes">
          <div class="qr-code-item">
            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=alipay%20payment%20qr%20code%20for%20donation&image_size=square" alt="支付宝收款码" class="qr-code">
            <p>支付宝</p>
          </div>
          <div class="qr-code-item">
            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wechat%20payment%20qr%20code%20for%20donation&image_size=square" alt="微信收款码" class="qr-code">
            <p>微信</p>
          </div>
        </div>
        <div class="donation-info">
          <p>如果您喜欢我分享的电子书，并且愿意通过这个方式让我能喝上一杯咖啡作为鼓励，我在此表示十分的感谢！</p>
        </div>
        <button @click="showDonationModal = false" class="close-btn">关闭</button>
      </div>
    </div>
    
    <!-- 书籍预览模态框 -->
    <BookPreview v-if="selectedBook" :book="selectedBook" @close="closePreview" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BookList from '../components/BookList.vue';
import BookPreview from '../components/BookPreview.vue';
import { books } from '../data/books';

const props = defineProps({
  isLoggedIn: {
    type: Boolean,
    default: false
  }
});

const searchQuery = ref('');
const selectedBook = ref(null);
const showDonationModal = ref(false);

const filteredBooks = computed(() => {
  if (!searchQuery.value) {
    return books;
  }
  return books.filter(book => 
    book.title.includes(searchQuery.value) ||
    book.author.includes(searchQuery.value) ||
    book.description.includes(searchQuery.value)
  );
});

const previewBook = (book) => {
  selectedBook.value = book;
};

const closePreview = () => {
  selectedBook.value = null;
};

const handleSearch = () => {
  // 搜索处理逻辑
};
</script>

<style scoped>
.home-page {
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.search-container {
  max-width: 600px;
  margin: 0 auto 2rem;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 1rem 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 25px;
  font-size: 1rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-input:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
}

.support-section {
  margin-top: auto;
  text-align: center;
  padding: 2rem 0;
  border-top: 1px solid var(--border-color);
  margin-top: 3rem;
}

.support-text {
  font-size: 1.1rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.donation-btn {
  background-color: var(--secondary-color);
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.donation-btn:hover {
  transform: scale(1.1);
  background-color: #b89529;
}

/* 捐助模态框样式 */
.donation-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  color: var(--primary-color);
  margin-bottom: 2rem;
}

.qr-codes {
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
}

.qr-code-item {
  text-align: center;
}

.qr-code {
  width: 150px;
  height: 150px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px;
  background-color: white;
  margin-bottom: 1rem;
}

.qr-code-item p {
  color: var(--primary-color);
  font-weight: 500;
}

.donation-info {
  background-color: rgba(212, 175, 55, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: left;
}

.donation-info p {
  line-height: 1.6;
  color: var(--text-color);
}

.close-btn {
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #6b340f;
}

@media (max-width: 768px) {
  .qr-codes {
    flex-direction: column;
    align-items: center;
  }
  
  .qr-code-item {
    margin-bottom: 2rem;
  }
  
  .modal-content {
    padding: 1.5rem;
  }
}
</style>
