<template>
  <div class="admin-page">
    <h1>系统配置</h1>
    
    <div class="config-section">
      <h2>AI 模型配置</h2>
      
      <div class="config-form">
        <div class="form-group">
          <label for="volcengineToken">火山引擎 Token</label>
          <input 
            type="text" 
            id="volcengineToken" 
            v-model="config.volcengineToken" 
            placeholder="请输入火山引擎 Token"
          />
        </div>
        
        <div class="form-group">
          <label for="defaultModel">默认 AI 模型</label>
          <select id="defaultModel" v-model="config.defaultModel">
              <option value="doubao-seed-2-0-pro-260215">doubao-seed-2-0-pro</option>
              <option value="doubao-seed-2-0-lite-260215">doubao-seed-2-0-lite</option>
              <option value="doubao-seed-2-0-mini-260215">doubao-seed-2-0-mini</option>
              <option value="doubao-seed-2-0-code-preview-260215">doubao-seed-2-0-code</option>
          </select>
        </div>
        
        <div class="form-actions">
          <button @click="saveConfig" class="save-button" :disabled="loading">
            {{ loading ? '保存中...' : '保存配置' }}
          </button>
          <div v-if="message" class="message" :class="messageType">
            {{ message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(false)
const message = ref<string | null>(null)
const messageType = ref<'success' | 'error'>('success')

interface Config {
  volcengineToken: string
  defaultModel: string
}

const config = ref<Config>({
  volcengineToken: '',
  defaultModel: 'doubao-seed-2-0-pro-260215'
})

const loadConfig = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('请先登录')
    }
    
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${API_BASE_URL}/admin/config`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('获取配置失败')
    }
    
    const data = await response.json()
    config.value = {
      volcengineToken: data.volcengineToken || '',
      defaultModel: data.defaultModel || 'doubao-seed-2-0-pro-260215'
    }
  } catch (err) {
    console.error('获取配置失败:', err)
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('请先登录')
    }
    
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${API_BASE_URL}/admin/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(config.value)
    })
    
    if (!response.ok) {
      throw new Error('保存配置失败')
    }
    
    const data = await response.json()
    message.value = data.message || '配置保存成功'
    messageType.value = 'success'
    setTimeout(() => {
      message.value = null
    }, 3000)
  } catch (err) {
    message.value = err instanceof Error ? err.message : '保存失败'
    messageType.value = 'error'
    setTimeout(() => {
      message.value = null
    }, 3000)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.admin-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.admin-page h1 {
  font-size: 36px;
  color: #2c3e50;
  margin-bottom: 40px;
  text-align: center;
}

.config-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.config-section h2 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 12px;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-actions {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.save-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.3s ease;
  align-self: flex-start;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.message.success {
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.message.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

@media (max-width: 768px) {
  .admin-page {
    padding: 20px 16px;
  }
  
  .admin-page h1 {
    font-size: 28px;
  }
  
  .config-section {
    padding: 20px;
  }
  
  .config-section h2 {
    font-size: 20px;
  }
  
  .form-group input,
  .form-group select {
    padding: 10px 14px;
  }
  
  .save-button {
    align-self: stretch;
  }
}
</style>