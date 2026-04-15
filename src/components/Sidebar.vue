<template>
  <aside class="sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
    <div class="logo">
      <h1></h1>
    </div>
    <nav class="nav">
      <router-link to="/" class="nav-item" active-class="active" @click="toggleSidebar">
        <span class="icon" title="首页"><Home /></span>
      </router-link>
      <router-link to="/ask" class="nav-item" active-class="active" @click="toggleSidebar">
        <span class="icon" title="AI"><HelpCircle /></span>
      </router-link>
      <div class="nav-item auth-item" @click="() => { openAuthModal(); toggleSidebar(); }">
        <span class="icon" :title="user ? '个人' : '登录'"><Account /></span>
      </div>
    </nav>
  
    <!-- 登录后显示的功能 -->
    <div v-if="user" class="mobile-auth-actions">
      <div v-if="user.isAdmin" class="nav-item" @click="() => { openAIGenerateModal(); toggleSidebar(); }">
        <span class="icon" title="AI 生成"><Brain /></span>
      </div>
      <router-link v-if="user.isAdmin" to="/admin" class="nav-item" @click="toggleSidebar">
        <span class="icon" title="配置"><Cog /></span>
      </router-link>
      <div class="nav-item" @click="() => { logout(); toggleSidebar(); }">
        <span class="icon" title="退出"><Logout /></span>
      </div>
    </div>
    
    <!-- 移动端顶部导航栏 -->
    <div class="mobile-header">
      <div class="logo-text">HistoryEcho <span class="beta-tag">Beta</span></div>
      <button class="menu-button" @click="toggleSidebar">
        <div class="menu-icon"></div>
      </button>
    </div>
    
    <!-- 认证弹窗 -->
    <AuthModal 
      v-if="showAuthModal" 
      :is-login="isLogin"
      @close="showAuthModal = false"
      @login="handleLogin"
    />
    
    <!-- AI 生成弹窗 -->
    <AIGenerateModal 
      v-if="showAIGenerateModal" 
      @close="showAIGenerateModal = false"
      @generated="handleAIGenerated"
    />
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Home from "vue-material-design-icons/Home.vue";
import HelpCircle from "vue-material-design-icons/HelpCircle.vue";
import Account from "vue-material-design-icons/Account.vue";
import Brain from "vue-material-design-icons/Brain.vue";
import Logout from "vue-material-design-icons/Logout.vue";
import Cog from "vue-material-design-icons/Cog.vue";
import AuthModal from './AuthModal.vue';
import AIGenerateModal from './AIGenerateModal.vue';

const user = ref<any | null>(null);
const showAuthModal = ref(false);
const showAIGenerateModal = ref(false);
const isLogin = ref(true);
const isSidebarOpen = ref(false);

// 检查本地存储中的用户信息
onMounted(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
  }
});

const openAuthModal = () => {
  isLogin.value = true;
  showAuthModal.value = true;
};

const handleLogin = (loginData: any) => {
  // 存储用户信息到本地存储
  user.value = loginData.user;
  localStorage.setItem('user', JSON.stringify(loginData.user));
  localStorage.setItem('token', loginData.access_token);
};

const openAIGenerateModal = () => {
  showAIGenerateModal.value = true;
};

const handleAIGenerated = (character: any) => {
  // 可以在这里处理生成的人物数据
  console.log('AI 生成的人物:', character);
  // 例如，可以跳转到首页并显示生成的人物
};

const logout = () => {
  user.value = null;
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<style scoped>
.sidebar {
  width: 65px;
  background: #ffffff;
  color: white;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: all 0.3s ease;
}

/* 移动端顶部导航栏 */
.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 10px 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  font-family: 'SimSun', serif;
}

.beta-tag {
  font-size: 12px;
  color: #999;
  margin-left: 5px;
}

.menu-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.menu-icon {
  width: 24px;
  height: 2px;
  background: #333;
  position: relative;
  transition: all 0.3s ease;
}

.menu-icon::before,
.menu-icon::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 2px;
  background: #333;
  transition: all 0.3s ease;
}

.menu-icon::before {
  top: -8px;
}

.menu-icon::after {
  bottom: -8px;
}

.logo {
  padding: 0 20px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  background: #6a7282;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  padding: 20px 0;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: #6a7282;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #9eadec;
  color: white;
}

.nav-item.active {
  background: rgba(102, 126, 234, 0.2);
  color: #8193e7;
  border-left-color: #667eea;
}

.nav-item .icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  width: 24px;
  height: 24px;
}

.nav-item .icon svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.nav-item .text {
  font-size: 16px;
}

.auth-item {
  cursor: pointer;
}

.user-section {
  margin-top: auto;
  padding: 20px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.user-info {
  padding: 0 20px 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.user-name {
  font-size: 14px;
  color: #6a7282;
  font-weight: 500;
}

.user-actions {
  padding: 10px 0;
}

@media (max-width: 894px) {
  /* 显示移动端顶部导航栏 */
  .mobile-header {
    display: flex;
  }
  
  /* 隐藏默认侧边栏 */
  .sidebar {
    width: 70px;
    left: -250px;
    top: 0;
    height: 100vh;
    flex-direction: column;
    padding: 20px 0;
    background: #ffffff;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }
  
  /* 侧边栏打开状态 */
  .sidebar.sidebar-open {
    left: 0;
  }
  
  .logo {
    padding: 0 20px 30px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .logo h1 {
    font-size: 24px;
  }
  
  .nav {
    display: flex;
    flex-direction: column;
    padding: 20px 0;
    flex: 1;
  }
  
  .nav-item {
    flex-direction: row;
    padding: 15px 20px;
    border-left: 3px solid transparent;
    min-width: auto;
    text-align: left;
  }
  
  .nav-item.active {
    border-left-color: #667eea;
    border-bottom-color: transparent;
  }
  
  .nav-item .icon {
    margin-right: 12px;
    margin-bottom: 0;
    width: 24px;
    height: 24px;
  }
  
  .nav-item .icon svg {
    width: 24px;
    height: 24px;
  }
  
  .nav-item .text {
    font-size: 16px;
  }
  
  .user-section {
    display: none;
  }
  
  /* 移动端登录后显示的功能 */
  .mobile-auth-actions {
    display: flex;
    flex-direction: column;
    padding: 20px 0;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .mobile-auth-actions .nav-item {
    min-width: auto;
  }
}
</style>
