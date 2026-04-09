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
              placeholder="请输入人物姓名，多个姓名用逗号分隔" 
              required
            />
            <small class="form-hint">支持批量生成，例如：李世民,李渊</small>
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
          <div v-if="streamingContent" class="streaming-content">
            <h4>AI 思考中：</h4>
            <p>{{ streamingContent }}</p>
          </div>
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
          <div v-if="remainingCharacters.length > 0" class="remaining-characters">
            <p>还需生成 {{ remainingCharacters.length }} 个人物：{{ remainingCharacters.join(', ') }}</p>
          </div>
          <div class="result-actions">
            <button @click="confirmGenerate" class="confirm-button" :disabled="remainingCharacters.length > 0">
              {{ remainingCharacters.length > 0 ? '生成中...' : '确认创建' }}
            </button>
          </div>
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
  (e: 'refresh'): void
}>()

const characterName = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const result = ref<any | null>(null)
const streamingContent = ref('')
const remainingCharacters = ref<string[]>([])

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

const generateSingleCharacter = async (name: string) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  const token = localStorage.getItem('token')
  
  if (!token) {
    throw new Error('请先登录')
  }
  
  const config = await getConfig()

  console.log(config, '==config==')
  
  // 不使用流式响应，直接获取完整响应
  const response = await fetch(`${API_BASE_URL}/characters/ai-generate-with-events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ 
      name,
      model: config.defaultModel,
      volcengineToken: config.volcengineToken
    })
  })
  
  if (!response.ok) {
    throw new Error('生成失败')
  }
  
  // 获取完整响应内容
  const responseText = await response.text()
  console.log('完整响应:', responseText)
  
  // 处理 SSE 格式的响应
  const lines = responseText.split('\n')
  let completeData = null
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const dataStr = line.slice(6)
      if (dataStr) {
        try {
          const data = JSON.parse(dataStr)
          if (data.content) {
            // 只显示 content 里的文本内容
            streamingContent.value = data.content
          }
          if (data.complete && data.data) {
            completeData = data.data
            result.value = data.data
            // 通知父组件生成了一个人物
            emit('generated', data.data)
          }
        } catch (e) {
          console.error('解析响应失败:', e)
          // 不要直接显示原始 JSON 数据，保持流式内容为空或显示友好提示
          streamingContent.value = 'AI 正在生成中...'
        }
      }
    }
  }
  
  // 即使 JSON 解析有错误，只要有完整数据就认为成功
  if (completeData) {
    return completeData
  } else {
    throw new Error('生成失败')
  }
}

const generateCharacter = async () => {
  try {
    // 解析输入的人物姓名，支持逗号分隔
    const characterNames = characterName.value
      .split(',')
      .map(name => name.trim())
      .filter(name => name)
    
    if (characterNames.length === 0) {
      throw new Error('请输入人物姓名')
    }
    
    loading.value = true
    error.value = null
    result.value = null
    streamingContent.value = ''
    remainingCharacters.value = [...characterNames]
    
    // 批量生成人物
    let successCount = 0
    for (const name of characterNames) {
      try {
        streamingContent.value = `正在生成 ${name}...`
        const result = await generateSingleCharacter(name)
        if (result) {
          successCount++
        }
        // 从剩余列表中移除当前生成的人物
        remainingCharacters.value = remainingCharacters.value.filter(n => n !== name)
      } catch (err) {
        console.error(`生成人物 ${name} 失败:`, err)
        // 继续生成下一个人物，不中断整个流程
        remainingCharacters.value = remainingCharacters.value.filter(n => n !== name)
      }
    }
    
    // 所有人物生成完成后，刷新人物列表
    emit('refresh')
    
    // 只有当所有人物都生成失败时才提示错误
    if (successCount === 0) {
      error.value = '所有人物生成失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '生成失败'
  } finally {
    loading.value = false
  }
}

const confirmGenerate = () => {
  closeModal()
}
</script>

<style scoped>
/* 原有样式保持不变 */
.form-hint {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 4px;
}

.streaming-content {
  margin-top: 20px;
  padding: 16px;
  background: #f0f4f8;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  max-height: 200px;
  overflow-y: auto;
}

.streaming-content h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #2c3e50;
}

.streaming-content p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #34495e;
  white-space: pre-wrap;
}

.remaining-characters {
  margin: 16px 0;
  padding: 12px;
  background: #e8f4fd;
  border-radius: 8px;
  font-size: 14px;
  color: #2980b9;
}

.result-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

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