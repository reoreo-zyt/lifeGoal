<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Home from "vue-material-design-icons/Home.vue";
import HelpCircle from "vue-material-design-icons/HelpCircle.vue";
import Account from "vue-material-design-icons/Account.vue";
import Brain from "vue-material-design-icons/Brain.vue";
import Logout from "vue-material-design-icons/Logout.vue";
import Cog from "vue-material-design-icons/Cog.vue";

const user = ref<any | null>(null);
const isSidebarOpen = ref(false);

onMounted(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
  }
});

const showSidebar = () => {
  isSidebarOpen.value = true;
};

const hideSidebar = () => {
  isSidebarOpen.value = false;
};
</script>

<template>
  <aside
    class="sidebar"
    :class="{ 'sidebar-open': isSidebarOpen }"
    @mouseenter="showSidebar"
    @mouseleave="hideSidebar"
  >
    <div class="sidebar-content">
      <div class="logo">
        <h1></h1>
      </div>
      <nav class="nav">
        <router-link to="/" class="nav-item" active-class="active">
          <span class="icon" title="首页"><Home /></span>
        </router-link>
        <router-link to="/game" class="nav-item" active-class="active">
          <span class="icon" title="卡牌"><HelpCircle /></span>
        </router-link>
        <div class="nav-item auth-item">
          <span class="icon" :title="user ? '个人' : '登录'"><Account /></span>
        </div>
      </nav>

      <div v-if="user" class="mobile-auth-actions">
        <div v-if="user.isAdmin" class="nav-item">
          <span class="icon" title="AI 生成"><Brain /></span>
        </div>
        <router-link v-if="user.isAdmin" to="/admin" class="nav-item">
          <span class="icon" title="配置"><Cog /></span>
        </router-link>
        <div class="nav-item">
          <span class="icon" title="退出"><Logout /></span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 65px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.sidebar.sidebar-open {
  transform: translateX(0);
}

.sidebar-content {
  width: 65px;
  height: 100%;
  display: flex;
  flex-direction: column;
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
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
    width: 200px;
  }

  .sidebar-content {
    width: 200px;
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
