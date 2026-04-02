<template>
  <div class="articles-page">
    <h1 class="page-title">今日头条热门文章</h1>
    
    <!-- 爬取按钮 -->
    <div class="crawl-controls">
      <button 
        class="crawl-btn" 
        @click="showCrawlDialog = true"
        v-if="isAdmin"
      >
        爬取文章
      </button>
    </div>
    
    <!-- 爬取设置对话框 -->
    <div v-if="showCrawlDialog" class="dialog-overlay">
      <div class="dialog-content">
        <h3>爬取设置</h3>
        <div class="time-range-selector">
          <label>
            <input type="radio" v-model="selectedTimeRange" value="3days">
            3天内
          </label>
          <label>
            <input type="radio" v-model="selectedTimeRange" value="7days">
            7天内
          </label>
          <label>
            <input type="radio" v-model="selectedTimeRange" value="30days">
            30天内
          </label>
        </div>
        <div class="dialog-buttons">
          <button @click="showCrawlDialog = false">取消</button>
          <button @click="crawlArticles" :disabled="isCrawling">
            {{ isCrawling ? '爬取中...' : '开始爬取' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- 文章列表 -->
    <div v-else-if="articles.length > 0" class="articles-list">
      <div v-for="article in articles" :key="article.id" class="article-item">
        <a :href="article.url" target="_blank" class="article-link">
          <h3 class="article-title">{{ article.title }}</h3>
          <div class="article-meta">
            <span class="author">{{ article.author }}</span>
            <span class="dot">·</span>
            <span class="publish-time">{{ formatDate(article.publishTime) }}</span>
            <span class="dot">·</span>
            <span class="read-count">阅读量: {{ formatReadCount(article.readCount) }}</span>
          </div>
        </a>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-state">
      <p>暂无文章数据</p>
      <p v-if="isAdmin" class="hint">请点击"爬取文章"按钮获取最新文章</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
const baseURL = import.meta.env.VITE_API_BASE_URL || 'baseURL';

export default {
  name: 'ArticlesPage',
  data() {
    return {
      articles: [],
      isLoading: false,
      error: '',
      isAdmin: false,
      showCrawlDialog: false,
      selectedTimeRange: '7days',
      isCrawling: false
    };
  },
  mounted() {
    this.checkAdminStatus();
    this.fetchArticles();
  },
  methods: {
    async checkAdminStatus() {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // const response = await axios.get(`${baseURL}/auth/me`, {
          //   headers: {
          //     Authorization: `Bearer ${token}`
          //   }
          // });
          this.isAdmin = true;
        }
      } catch (error) {
        console.error('检查管理员状态失败:', error);
      }
    },
    async fetchArticles() {
      this.isLoading = true;
      this.error = '';
      
      try {
        const response = await axios.get(`${baseURL}/articles`);
        this.articles = response.data;
      } catch (error) {
        this.error = '获取文章列表失败';
        console.error('获取文章失败:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async crawlArticles() {
      this.isCrawling = true;
      this.error = '';
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${baseURL}/articles/crawl-toutiao`,
          { timeRange: this.selectedTimeRange },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        this.showCrawlDialog = false;
        alert(response.data.message);
        this.fetchArticles();
      } catch (error) {
        this.error = '爬取文章失败';
        console.error('爬取文章失败:', error);
      } finally {
        this.isCrawling = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN');
    },
    formatReadCount(count) {
      if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万';
      }
      return count;
    }
  }
};
</script>

<style scoped>
.articles-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.crawl-controls {
  margin-bottom: 20px;
}

.crawl-btn {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.crawl-btn:hover {
  background-color: #40a9ff;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.dialog-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.time-range-selector {
  margin-bottom: 20px;
}

.time-range-selector label {
  display: block;
  margin-bottom: 10px;
  cursor: pointer;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-buttons button {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.dialog-buttons button:last-child {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.dialog-buttons button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误提示 */
.error-message {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: #f5222d;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

/* 文章列表 */
.articles-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.article-item {
  background-color: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 15px;
  transition: box-shadow 0.3s;
}

.article-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.article-link {
  text-decoration: none;
  color: #333;
  display: block;
}

.article-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.article-meta {
  font-size: 14px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  margin: 0 4px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.hint {
  margin-top: 10px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .articles-page {
    padding: 10px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .article-title {
    font-size: 16px;
  }
  
  .article-meta {
    font-size: 12px;
  }
}
</style>