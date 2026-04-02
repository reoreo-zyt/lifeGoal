<script setup>
import { ref, computed } from 'vue';
import { RouterView, RouterLink } from 'vue-router';
import BookPreview from './components/BookPreview.vue';

// API基础URL
const baseURL = import.meta.env.VITE_API_BASE_URL || 'baseURL';

const selectedBook = ref(null);
const showLoginModal = ref(false);
const isLoggedIn = ref(false);
const user = ref(null);
const activeTab = ref('login');
const email = ref('');
const password = ref('');
const name = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const showSettingsModal = ref(false);
const aiToken = ref('');

const previewBook = (book) => {
  selectedBook.value = book;
};

const closePreview = () => {
  selectedBook.value = null;
};

const openLoginModal = () => {
  showLoginModal.value = true;
  activeTab.value = 'login';
  resetForm();
};

const closeLoginModal = () => {
  showLoginModal.value = false;
  resetForm();
};

const resetForm = () => {
  email.value = '';
  password.value = '';
  name.value = '';
  errorMessage.value = '';
  isLoading.value = false;
};

const switchTab = (tab) => {
  activeTab.value = tab;
  errorMessage.value = '';
};

const handleSubmit = async () => {
  errorMessage.value = '';
  isLoading.value = true;
  
  try {
    let response;
    if (activeTab.value === 'login') {
      response = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.value, password: password.value }),
      });
    } else {
      response = await fetch(`${baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.value, password: password.value, name: name.value }),
      });
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '登录失败');
    }
    
    // 存储token和用户信息
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // 更新登录状态
    user.value = data.user;
    isLoggedIn.value = true;
    closeLoginModal();
  } catch (error) {
    errorMessage.value = error.message || '操作失败，请重试';
  } finally {
    isLoading.value = false;
  }
};

const handleLogout = () => {
  user.value = null;
  isLoggedIn.value = false;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const openSettingsModal = () => {
  showSettingsModal.value = true;
  // 从用户信息中获取AI Token
  if (user.value && user.value.aiToken) {
    aiToken.value = user.value.aiToken;
  } else {
    aiToken.value = '';
  }
};

const closeSettingsModal = () => {
  showSettingsModal.value = false;
  aiToken.value = '';
};

const saveAiSettings = async () => {
  if (!isLoggedIn.value) {
    alert('请先登录');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseURL}/users/ai-token`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ aiToken: aiToken.value }),
    });
    
    if (!response.ok) {
      throw new Error('保存失败');
    }
    
    const data = await response.json();
    // 更新用户信息
    user.value = data.user;
    localStorage.setItem('user', JSON.stringify(data.user));
    alert('保存成功');
    closeSettingsModal();
  } catch (error) {
    console.error('保存失败:', error);
    alert('保存失败，请重试');
  }
};

// 检查本地存储中的登录状态
const checkLoginStatus = () => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  if (token && userData) {
    isLoggedIn.value = true;
    user.value = JSON.parse(userData);
  }
};

// 初始化时检查登录状态
checkLoginStatus();
</script>

<template>
  <div class="app">
    <header class="app-header fixed-header">
      <div class="header-content">
        <div class="header-left">
          <h1>历史书籍库</h1>
          <p>探索历史的智慧，下载经典的电子书籍</p>
        </div>
        <div class="header-right">
          <nav class="tab-nav">
            <RouterLink to="/" class="tab-link" active-class="active">首页</RouterLink>
            <RouterLink to="/articles" class="tab-link" active-class="active">文章</RouterLink>
            <RouterLink to="/character-list" class="tab-link" active-class="active">人物</RouterLink>
          </nav>
          <div class="user-actions">
            <button v-if="!isLoggedIn" @click="openLoginModal" class="login-btn">登录</button>
            <div v-else class="user-info">
              <span>{{ user.name }}</span>
              <button @click="openSettingsModal" class="settings-btn">系统配置</button>
              <button @click="handleLogout" class="logout-btn">退出</button>
            </div>
          </div>
        </div>
      </div>
    </header>
    <main class="app-main header-fixed">
      <RouterView @preview-book="previewBook" :is-logged-in="isLoggedIn" :user="user" />
    </main>
    <BookPreview v-if="selectedBook" :book="selectedBook" @close="closePreview" />
    <div v-if="showLoginModal" class="modal-overlay" @click="closeLoginModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>登录/注册</h2>
          <button @click="closeLoginModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="auth-tabs">
            <button 
              class="auth-tab" 
              :class="{ active: activeTab === 'login' }"
              @click="switchTab('login')"
            >
              登录
            </button>
            <button 
              class="auth-tab" 
              :class="{ active: activeTab === 'register' }"
              @click="switchTab('register')"
            >
              注册
            </button>
          </div>
          <form class="auth-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>邮箱</label>
              <input 
                type="email" 
                placeholder="请输入邮箱" 
                v-model="email"
                required
              />
            </div>
            <div class="form-group">
              <label>密码</label>
              <input 
                type="password" 
                placeholder="请输入密码" 
                v-model="password"
                required
              />
            </div>
            <div v-if="activeTab === 'register'" class="form-group">
              <label>姓名</label>
              <input 
                type="text" 
                placeholder="请输入姓名" 
                v-model="name"
                required
              />
            </div>
            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
            <button 
              type="submit" 
              class="auth-btn"
              :disabled="isLoading"
            >
              {{ isLoading ? '处理中...' : (activeTab === 'login' ? '登录' : '注册') }}
            </button>
          </form>
        </div>
      </div>
    </div>
    <div v-if="showSettingsModal" class="modal-overlay" @click="closeSettingsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>系统配置</h2>
          <button @click="closeSettingsModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <form class="auth-form" @submit.prevent="saveAiSettings">
            <div class="form-group">
              <label>火山引擎 API Token</label>
              <input 
                type="text" 
                placeholder="请输入火山引擎 API Token" 
                v-model="aiToken"
                required
              />
            </div>
            <button 
              type="submit" 
              class="auth-btn"
            >
              保存
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #2c1810;
  color: #d4af37;
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.header-left {
  text-align: left;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.app-header h1 {
  margin-bottom: 0.25rem;
  color: #d4af37;
  font-size: 1.2rem;
}

.app-header p {
  margin-top: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.tab-nav {
  display: flex;
  gap: 1rem;
}

.tab-link {
  color: #d4af37;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease;
  padding: 0.4rem 1.2rem;
  border-radius: 4px;
}

.tab-link:hover {
  background-color: rgba(212, 175, 55, 0.2);
}

.tab-link.active {
  background-color: rgba(212, 175, 55, 0.3);
  font-weight: bold;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.login-btn, .logout-btn, .settings-btn {
  background-color: #d4af37;
  color: #2c1810;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.login-btn:hover, .logout-btn:hover, .settings-btn:hover {
  background-color: #e6c760;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #d4af37;
}

.app-main {
  flex: 1;
  margin-top: 100px;
}

/* 登录弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #2c1810;
  color: #d4af37;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  color: #d4af37;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-tabs {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
}

.auth-tab {
  background: none;
  border: none;
  color: #d4af37;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.auth-tab.active {
  border-bottom-color: #d4af37;
  font-weight: bold;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  color: #d4af37;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #d4af37;
  font-size: 1rem;
}

.form-group input::placeholder {
  color: rgba(212, 175, 55, 0.5);
}

.auth-btn {
  background-color: #d4af37;
  color: #2c1810;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.auth-btn:hover {
  background-color: #e6c760;
}

.auth-btn:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin: 0.5rem 0;
  text-align: center;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    padding: 0.75rem;
  }
  
  .header-left {
    text-align: center;
  }
  
  .header-right {
    flex-direction: column;
    gap: 1rem;
  }
  
  .app-header h1 {
    font-size: 1.1rem;
  }
  
  .tab-link {
    font-size: 0.9rem;
    padding: 0.3rem 1rem;
  }
  
  .app-main {
    margin-top: 160px;
  }
  
  .modal-content {
    padding: 1.5rem;
    width: 95%;
  }
}
</style>