<template>
  <div class="home">
    <h1>历史人物</h1>
    <p>共收录 {{ characters.length }} 位正史记载人物</p>
    
    <!-- 搜索框 -->
    <div class="search-container">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="搜索人物..." 
        class="search-input"
      />
      <button @click="searchCharacters" class="search-button">搜索</button>
    </div>
    
    <!-- AI 生成人物按钮 -->
    <div class="generate-container">
      <button @click="openAIGenerateModal" class="generate-button">
        AI 生成人物
      </button>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchCharacters" class="retry-button">重试</button>
    </div>
    
    <!-- 人物列表 -->
    <div v-if="!loading && !error" class="characters-container">
      <div 
        v-for="character in filteredCharacters" 
        :key="character.id"
        class="character-item"
        @mouseenter="hoveredCharacter = character.id"
        @mouseleave="hoveredCharacter = null"
        @click="showCharacterInfo(character)"
      >
        <div class="character-image">
          <img :src="character.avatar ? `${character.avatar}` : (character.gender === '女' ? '/images/ancient_character_women.webp' : '/images/ancient_character_men.webp')" :alt="character.name" />
        </div>
        <div v-if="hoveredCharacter === character.id" class="character-tooltip">
          {{ character.name }}
        </div>
      </div>
    </div>
    
    <!-- 人物信息弹窗 -->
    <div v-if="selectedCharacter" class="character-modal-overlay" @click="closeModal">
      <div class="character-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedCharacter.name }}</h2>
          <button class="close-button" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="character-info-container">
            <!-- 左侧基本信息 -->
            <div class="character-basic-info">
              <p><strong>生卒年份:</strong> {{ selectedCharacter.birthYear }}年 - {{ selectedCharacter.deathYear || '不详' }}年</p>
              <p><strong>所处朝代:</strong> {{ selectedCharacter.dynasty }}</p>
              <p><strong>性别:</strong> {{ selectedCharacter.gender }}</p>
              <p><strong>出生地:</strong> {{ selectedCharacter.birthPlace }}</p>
              <p><strong>背景:</strong> {{ selectedCharacter.background }}</p>
              <p><strong>性格:</strong> {{ selectedCharacter.personality }}</p>
            </div>
            
            <!-- 右侧头像 -->
            <div class="character-avatar">
              <div class="avatar-container">
                <img 
                  :src="selectedCharacter.avatar ? `${selectedCharacter.avatar}` : (selectedCharacter.gender === '女' ? '/images/ancient_character_women.webp' : '/images/ancient_character_men.webp')" 
                  :alt="selectedCharacter.name" 
                  class="avatar-image"
                />
                <input 
                  type="file" 
                  id="avatar-upload" 
                  class="avatar-upload-input"
                  @change="handleAvatarUpload"
                  accept="image/*"
                />
                <label for="avatar-upload" class="avatar-upload-label">
                  更换头像
                </label>
              </div>
              <div v-if="uploading" class="uploading-indicator">
                上传中...
              </div>
              <div v-if="uploadMessage" class="upload-message" :class="uploadMessageType">
                {{ uploadMessage }}
              </div>
            </div>
          </div>
          
          <div class="character-records">
            <h3>正史事迹记载</h3>
            <div class="table-container">
              <table class="records-table">
                <thead>
                  <tr>
                    <th>公元年份</th>
                    <th>年龄</th>
                    <th>所用年号</th>
                    <th>正史关键事迹</th>
                    <th>正史原文摘要（出处）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(record, index) in selectedCharacter.records" :key="record.id || index">
                    <td>{{ record.year }}</td>
                    <td>{{ record.age }}</td>
                    <td>{{ record.reignYear }}</td>
                    <td>{{ record.event }}</td>
                    <td>{{ record.source }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- AI 生成人物弹窗 -->
    <AIGenerateModal 
      v-if="showAIGenerateModal" 
      @close="closeAIGenerateModal"
      @generated="handleCharacterGenerated"
      @refresh="fetchCharacters"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AIGenerateModal from '../components/AIGenerateModal.vue'

const hoveredCharacter = ref<number | null>(null)
const selectedCharacter = ref<Character | null>(null)
const searchQuery = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const showAIGenerateModal = ref(false)
const uploading = ref(false)
const uploadMessage = ref<string | null>(null)
const uploadMessageType = ref<'success' | 'error'>('success')

interface CharacterRecord {
  id: number
  year: string
  age: string
  reignYear: string
  event: string
  source: string
  order: number
}

interface Character {
  id: number
  name: string
  gender: string
  birthYear: number
  deathYear: number | null
  birthPlace: string
  background: string
  personality: string
  dynasty: string
  userId: number
  avatar: string;
  createdAt: string
  updatedAt: string
  records?: CharacterRecord[]
}

const characters = ref<Character[]>([])

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const fetchCharacters = async () => {
  try {
    loading.value = true
    error.value = null
    const token = localStorage.getItem('token')
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/characters`, {
      headers
    })
    if (!response.ok) {
      throw new Error('获取人物列表失败')
    }
    const data = await response.json()
    characters.value = data
    console.log(characters.value, '==人物列表==')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取数据失败'
    console.error('获取人物列表失败:', err)
  } finally {
    loading.value = false
  }
}

const fetchCharacterDetail = async (id: number) => {
  try {
    loading.value = true
    error.value = null
    const response = await fetch(`${API_BASE_URL}/characters/${id}/timeline`)
    if (!response.ok) {
      throw new Error('获取人物详情失败')
    }
    const data = await response.json()
    
    const character = characters.value.find(c => c.id === id)
    if (character) {
      selectedCharacter.value = {
        ...character,
        records: data
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取详情失败'
    console.error('获取人物详情失败:', err)
  } finally {
    loading.value = false
  }
}

const filteredCharacters = computed(() => {
  if (!searchQuery.value) {
    return characters.value
  }
  return characters.value.filter(character => 
    character.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const searchCharacters = () => {
  // 搜索逻辑已在 computed 中处理
}

const showCharacterInfo = async (character: Character) => {
  await fetchCharacterDetail(character.id)
}

const closeModal = () => {
  selectedCharacter.value = null
}

// AI 生成人物相关方法
const openAIGenerateModal = () => {
  showAIGenerateModal.value = true
}

const closeAIGenerateModal = () => {
  showAIGenerateModal.value = false
}

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file || !selectedCharacter.value) {
    return
  }
  
  try {
    uploading.value = true
    uploadMessage.value = null
    
    const formData = new FormData()
    formData.append('avatar', file)
    
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('请先登录')
    }
    
    const response = await fetch(`${API_BASE_URL}/characters/${selectedCharacter.value.id}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('上传失败')
    }
    
    const data = await response.json()
    if (data.success) {
      // 更新人物的头像路径
      if (selectedCharacter.value) {
        selectedCharacter.value.avatar = data.avatar
      }
      
      // 更新人物列表中的头像
      const index = characters.value.findIndex(c => c.id === selectedCharacter.value?.id)
      if (index !== -1) {
        characters.value[index].avatar = data.avatar
      }
      
      uploadMessage.value = '头像上传成功'
      uploadMessageType.value = 'success'
      setTimeout(() => {
        uploadMessage.value = null
      }, 3000)
    } else {
      throw new Error(data.message || '上传失败')
    }
  } catch (err) {
    uploadMessage.value = err instanceof Error ? err.message : '上传失败'
    uploadMessageType.value = 'error'
    setTimeout(() => {
      uploadMessage.value = null
    }, 3000)
  } finally {
    uploading.value = false
    // 重置文件输入
    const target = event.target as HTMLInputElement
    target.value = ''
  }
}

const handleCharacterGenerated = async (character: any) => {
  // 重新获取人物列表，确保新生成的人物显示在首页
  await fetchCharacters()
  
  // 关闭生成弹窗
  showAIGenerateModal.value = false
  
  // 查找新生成的人物并显示详情
  const newCharacter = characters.value.find(c => c.name === character.name)
  if (newCharacter) {
    await fetchCharacterDetail(newCharacter.id)
  }
}

onMounted(() => {
  fetchCharacters()
})
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.home h1 {
  font-size: 36px;
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
}

.home p {
  font-size: 18px;
  color: #7f8c8d;
  margin-bottom: 20px;
  text-align: center;
}

/* 搜索框样式 */
.search-container {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  gap: 10px;
}

.search-input {
  width: 300px;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* AI 生成按钮 */
.generate-container {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
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
}

.generate-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #7f8c8d;
  font-size: 16px;
  margin: 0;
}

/* 错误状态样式 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #fff5f5;
  border-radius: 8px;
  margin: 20px 0;
}

.error-state p {
  color: #e74c3c;
  font-size: 16px;
  margin: 0 0 20px 0;
  text-align: center;
}

.retry-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.characters-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding: 20px;
}

.character-item {
  position: relative;
  width: 100px;
  height: 100px;
  cursor: pointer;
  transition: transform 0.3s ease, filter 0.3s ease;
}

.character-item:hover {
  transform: scale(1.1);
  z-index: 10;
}

.character-item:hover ~ .character-item {
  filter: blur(2px);
}

.characters-container:hover .character-item:not(:hover) {
  filter: blur(2px);
  opacity: 0.7;
}

.character-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.character-item:hover .character-image {
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.6);
}

.character-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.character-item:hover .character-image img {
  transform: scale(1.1);
}

.character-tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 14px;
  white-space: nowrap;
  z-index: 20;
  animation: fadeIn 0.3s ease;
}

.character-tooltip::after {
  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px 5px 0;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.8) transparent transparent;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 弹窗样式 */
.character-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.character-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
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

.character-info-container {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.character-basic-info {
  flex: 1;
  min-width: 300px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.character-basic-info p {
  margin: 8px 0;
  text-align: left;
  font-size: 16px;
}

.character-avatar {
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-container {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.avatar-upload-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.avatar-upload-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
  padding: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
  z-index: 1;
}

.avatar-upload-label:hover {
  background: rgba(0, 0, 0, 0.9);
}

.uploading-indicator {
  margin-top: 10px;
  font-size: 14px;
  color: #667eea;
}

.upload-message {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  text-align: center;
}

.upload-message.success {
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.upload-message.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.character-records h3 {
    font-size: 20px;
    color: #2c3e50;
    margin-bottom: 16px;
  }

  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 0 -24px;
    padding: 0 24px;
  }

  .records-table {
    min-width: 900px;
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

.records-table th,
.records-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.records-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.records-table tr:hover {
  background: #f8f9fa;
}

.records-table td {
  font-size: 14px;
  color: #34495e;
}

.records-table td:first-child {
  font-weight: 500;
  color: #667eea;
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

@media (max-width: 768px) {
  .home h1 {
    font-size: 28px;
  }

  .home p {
    font-size: 16px;
  }

  .search-container {
    flex-direction: column;
    align-items: center;
  }

  .search-input {
    width: 100%;
    max-width: 300px;
  }

  .characters-container {
    gap: 15px;
  }

  .character-item {
    width: 80px;
    height: 80px;
  }

  .character-modal {
    width: 95%;
    max-height: 90vh;
  }

  .modal-header h2 {
    font-size: 20px;
  }

  .records-table {
    font-size: 12px;
  }

  .records-table th,
  .records-table td {
    padding: 8px 12px;
  }

}

@media (max-width: 480px) {
  .modal-body {
    padding: 16px;
  }
  
  .table-container {
    margin: 0 -16px;
    padding: 0 16px;
  }
  
  .records-table {
    min-width: 800px;
  }
  
  .records-table th,
  .records-table td {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .character-basic-info p {
    font-size: 14px;
  }
}
</style>
