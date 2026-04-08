<template>
  <div class="ai-generate-modal-overlay" @click="closeModal">
    <div class="ai-generate-modal" @click.stop>
      <div class="modal-header">
        <h2>AI 生成人物</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="generateCharacter" class="ai-form">
          <div class="form-group">
            <label for="characterName">人物姓名</label>
            <input 
              type="text" 
              id="characterName" 
              v-model="characterName" 
              placeholder="请输入人物姓名" 
              required
            />
          </div>

          <div class="form-actions">
            <button type="submit" class="generate-button" :disabled="loading || !characterName">
              {{ loading ? '生成中...' : '生成人物' }}
            </button>
          </div>
        </form>
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>AI 正在生成人物信息，请稍候...</p>
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <div v-if="result" class="result-container">
          <h3>生成结果</h3>
          <div class="result-content">
            <p><strong>姓名:</strong> {{ result.name }}</p>
            <p><strong>朝代:</strong> {{ result.dynasty }}</p>
            <p><strong>简介:</strong> {{ result.background }}</p>
          </div>
          <button @click="confirmGenerate" class="confirm-button">
            确认创建
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'generated', character: any): void
}>()

const characterName = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const result = ref<any | null>(null)

// 从配置接口获取配置信息
const getConfig = async () => {
  try {
    const token = localStorage.getItem('token')
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    
    const response = await fetch(`${API_BASE_URL}/admin/config`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const config = await response.json()
      return {
        defaultModel: config.defaultModel || 'doubao-seed-2-0-pro-260215',
        volcengineToken: config.volcengineToken || ''
      }
    }
  } catch (err) {
    console.error('获取配置失败:', err)
  }
  return {
    defaultModel: 'doubao-seed-2-0-pro-260215',
    volcengineToken: ''
  }
}

const closeModal = () => {
  emit('close')
}

const generateCharacter = async () => {
  try {
    loading.value = true
    error.value = null
    result.value = null
    
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('请先登录')
    }
    
    const config = await getConfig()

    console.log(config, '==config==')
    
    const response = await fetch(`${API_BASE_URL}/characters/ai-generate-with-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        name: characterName.value, 
        model: config.defaultModel,
        volcengineToken: config.volcengineToken
      })
    })
    
    if (!response.ok) {
      throw new Error('生成失败')
    }
    
    // 处理流式响应
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应')
    }
    
    let generatedContent = ''
    let completeData = null
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = new TextDecoder().decode(value)
      // 处理 SSE 格式的响应
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6)
          if (dataStr) {
            try {
              const data = JSON.parse(dataStr)
              if (data.content) {
                generatedContent += data.content
                // 可以在这里更新 UI 显示生成进度
              }
              if (data.complete && data.data) {
                completeData = data.data
              }
            } catch (e) {
              console.error('解析响应失败:', e)
            }
          }
        }
      }
    }
    
    if (completeData) {
      result.value = completeData
    } else {
      throw new Error('生成失败')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '生成失败'
  } finally {
    loading.value = false
  }
}

const confirmGenerate = () => {
  if (result.value) {
    emit('generated', result.value)
    closeModal()
  }
}
</script>

<style scoped>
.ai-generate-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.ai-generate-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.modal-header h2 {
  font-size: 24px;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 24px;
}

.ai-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
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
  margin-top: 8px;
}

.generate-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.3s ease;
  width: 100%;
}

.generate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
  text-align: center;
}

.error-message {
  margin: 20px 0;
  padding: 12px;
  background: #fff5f5;
  color: #e74c3c;
  border-radius: 8px;
  font-size: 14px;
}

.result-container {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.result-container h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 16px;
}

.result-content {
  margin-bottom: 20px;
}

.result-content p {
  margin: 8px 0;
  font-size: 14px;
  color: #34495e;
}

.confirm-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.confirm-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 480px) {
  .ai-generate-modal {
    width: 95%;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .form-group input,
  .form-group select {
    padding: 10px 14px;
  }
  
  .generate-button {
    padding: 10px 20px;
  }
}
</style>