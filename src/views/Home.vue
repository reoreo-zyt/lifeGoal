<template>
  <div class="home">
    <h1>历史人物</h1>
    <p>共收录 {{ totalCharacters }} 位正史记载人物</p>
    
    <!-- 搜索框 -->
    <div class="search-container">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="搜索人物姓名..." 
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <button @click="openAdvancedSearchModal()" class="advanced-search-button">
        高级搜索
      </button>
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
    <div v-if="!loading && !error" class="characters-wrapper">
      <div class="characters-container">
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
    </div>
    
    <!-- 分页控件 -->
    <div 
      v-if="totalPages > 1" 
      class="pagination"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <button 
        class="pagination-button"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        上一页
      </button>
      <span class="pagination-info">
        第 {{ currentPage }} 页，共 {{ totalPages }} 页
      </span>
      <button 
        class="pagination-button"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        下一页
      </button>
    </div>
    
    <!-- 高级搜索弹窗 -->
    <div v-if="showAdvancedSearchModal" class="modal-overlay" @click="closeAdvancedSearchModal">
      <div class="modal-content advanced-search-modal bottom-up-modal" @click.stop>
        <div class="modal-header">
          <h2>高级搜索</h2>
          <button class="close-button" @click="closeAdvancedSearchModal">×</button>
        </div>
        <div class="modal-body">
          <div class="search-form">
            <div class="form-group">
              <label>性别</label>
              <select v-model="advancedSearchGender" class="form-select ink-style">
                <option value="">所有性别</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div class="form-group">
              <label>朝代</label>
              <select v-model="advancedSearchDynasty" class="form-select ink-style">
                <option value="">所有朝代</option>
                <option value="夏朝">夏朝</option>
                <option value="商朝">商朝</option>
                <option value="周朝">周朝</option>
                <option value="秦朝">秦朝</option>
                <option value="汉朝">汉朝</option>
                <option value="三国">三国</option>
                <option value="晋朝">晋朝</option>
                <option value="南北朝">南北朝</option>
                <option value="隋朝">隋朝</option>
                <option value="唐朝">唐朝</option>
                <option value="五代十国">五代十国</option>
                <option value="宋朝">宋朝</option>
                <option value="元朝">元朝</option>
                <option value="明朝">明朝</option>
                <option value="清朝">清朝</option>
                <option value="民国">民国</option>
                <option value="现代">现代</option>
              </select>
            </div>
            <div class="form-group">
              <label>年份范围</label>
              <div class="year-inputs">
                <input 
                  v-model.number="advancedSearchYearStart" 
                  type="number" 
                  placeholder="开始年份" 
                  class="year-input ink-style"
                />
                <span class="year-separator">至</span>
                <input 
                  v-model.number="advancedSearchYearEnd" 
                  type="number" 
                  placeholder="结束年份" 
                  class="year-input ink-style"
                />
                <button class="dynasty-toggle ink-style" @click="toggleAdvancedDynastyTimeline">
                  <span class="dynasty-icon">📅</span>
                </button>
              </div>
              <div v-if="showAdvancedDynastyTimeline" class="dynasty-timeline">
                <h4>朝代时间轴</h4>
                <div class="timeline-container">
                  <div 
                    v-for="dynasty in dynastyMarkers" 
                    :key="dynasty.name"
                    class="dynasty-item"
                    @click="selectAdvancedDynasty(dynasty)"
                  >
                    <div class="dynasty-dot"></div>
                    <div class="dynasty-info">
                      <div class="dynasty-name">{{ dynasty.name }}</div>
                      <div class="dynasty-years">{{ dynasty.start }}年 - {{ dynasty.end }}年</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-actions">
              <button @click="applyAdvancedSearch" class="action-button ink-style">应用搜索</button>
              <button @click="resetAdvancedSearch" class="action-button ink-style">重置</button>
            </div>
          </div>
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
              <p><strong>生卒年份:</strong> {{ selectedCharacter.birthYear === 3000 ? '?' : selectedCharacter.birthYear }}年 - {{ selectedCharacter.deathYear === 3000 || !selectedCharacter.deathYear ? '?' : selectedCharacter.deathYear }}年</p>
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
const searchDynasty = ref('')
const searchGender = ref('')
const searchYearStart = ref<number | null>(null)
const searchYearEnd = ref<number | null>(null)
const showAdvancedSearchModal = ref(false)
const showAdvancedDynastyTimeline = ref(false)
const advancedSearchDynasty = ref('')
const advancedSearchGender = ref('')
const advancedSearchYearStart = ref<number | null>(null)
const advancedSearchYearEnd = ref<number | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const showAIGenerateModal = ref(false)
const uploading = ref(false)
const uploadMessage = ref<string | null>(null)
const uploadMessageType = ref<'success' | 'error'>('success')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(100)
const totalPages = ref(1)
const totalCharacters = ref(0)

// 滑动相关变量
const touchStartX = ref(0)
const touchEndX = ref(0)
const mouseStartX = ref(0)
const mouseEndX = ref(0)

// 朝代标记数据
const dynastyMarkers = [
  { name: '夏朝', start: -2070, end: -1600, position: 0 },
  { name: '商朝', start: -1600, end: -1046, position: 0 },
  { name: '周朝', start: -1046, end: -256, position: 0 },
  { name: '秦朝', start: -221, end: -207, position: 0 },
  { name: '汉朝', start: -202, end: 220, position: 0 },
  { name: '三国', start: 220, end: 280, position: 0 },
  { name: '晋朝', start: 265, end: 420, position: 0 },
  { name: '南北朝', start: 420, end: 589, position: 0 },
  { name: '隋朝', start: 581, end: 618, position: 0 },
  { name: '唐朝', start: 618, end: 907, position: 0 },
  { name: '五代十国', start: 907, end: 960, position: 0 },
  { name: '宋朝', start: 960, end: 1279, position: 0 },
  { name: '元朝', start: 1271, end: 1368, position: 0 },
  { name: '明朝', start: 1368, end: 1644, position: 0 },
  { name: '清朝', start: 1644, end: 1912, position: 0 },
  { name: '民国', start: 1912, end: 1949, position: 0 },
  { name: '现代', start: 1949, end: 2026, position: 0 }
]

// 计算朝代标记的位置
const calculateDynastyPositions = () => {
  const minYear = -10000
  const maxYear = 2026
  const totalRange = maxYear - minYear
  
  dynastyMarkers.forEach(dynasty => {
    dynasty.position = ((dynasty.start - minYear) / totalRange) * 100
  })
}

// 初始化朝代位置
calculateDynastyPositions()

// 拖动处理
const dragging = ref<'start' | 'end' | null>(null)

const handleDrag = (event: MouseEvent) => {
  if (!dragging.value) return
  
  const sliderContainer = document.querySelector('.year-range-slider') as HTMLElement
  if (!sliderContainer) return
  
  const rect = sliderContainer.getBoundingClientRect()
  const x = event.clientX - rect.left
  const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
  
  const minYear = -10000
  const maxYear = 2026
  const year = Math.round(minYear + (percentage / 100) * (maxYear - minYear))
  
  if (dragging.value === 'start') {
    if (year < (searchYearEnd.value || maxYear)) {
      searchYearStart.value = year
    }
  } else {
    if (year > (searchYearStart.value || minYear)) {
      searchYearEnd.value = year
    }
  }
  
  handleSearch()
}

const stopDrag = () => {
  dragging.value = null
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 打开高级搜索弹窗
const openAdvancedSearchModal = () => {
  // 初始化高级搜索参数
  advancedSearchDynasty.value = searchDynasty.value
  advancedSearchGender.value = searchGender.value
  advancedSearchYearStart.value = searchYearStart.value
  advancedSearchYearEnd.value = searchYearEnd.value
  showAdvancedSearchModal.value = true
  showAdvancedDynastyTimeline.value = false
}

// 关闭高级搜索弹窗
const closeAdvancedSearchModal = () => {
  showAdvancedSearchModal.value = false
  showAdvancedDynastyTimeline.value = false
}

// 切换高级搜索中的朝代时间轴
const toggleAdvancedDynastyTimeline = () => {
  showAdvancedDynastyTimeline.value = !showAdvancedDynastyTimeline.value
}

// 选择高级搜索中的朝代
const selectAdvancedDynasty = (dynasty: any) => {
  advancedSearchYearStart.value = dynasty.start
  advancedSearchYearEnd.value = dynasty.end
  advancedSearchDynasty.value = dynasty.name
  // 选择朝代后关闭时间轴
  showAdvancedDynastyTimeline.value = false
}

// 应用高级搜索
const applyAdvancedSearch = () => {
  searchDynasty.value = advancedSearchDynasty.value
  searchGender.value = advancedSearchGender.value
  searchYearStart.value = advancedSearchYearStart.value
  searchYearEnd.value = advancedSearchYearEnd.value
  showAdvancedSearchModal.value = false
  showAdvancedDynastyTimeline.value = false
  handleSearch()
}

// 重置高级搜索
const resetAdvancedSearch = () => {
  advancedSearchDynasty.value = ''
  advancedSearchGender.value = ''
  advancedSearchYearStart.value = null
  advancedSearchYearEnd.value = null
  showAdvancedDynastyTimeline.value = false
}

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
    
    // 构建查询参数
    const params = new URLSearchParams()
    if (searchQuery.value) {
      // 只传递一个search参数，让后端处理搜索逻辑
      params.append('search', searchQuery.value)
    }
    if (searchDynasty.value && !searchQuery.value) {
      params.append('dynasty', searchDynasty.value)
    }
    if (searchGender.value) {
      params.append('gender', searchGender.value)
    }
    if (searchYearStart.value !== null) {
      params.append('yearStart', searchYearStart.value.toString())
    }
    if (searchYearEnd.value !== null) {
      params.append('yearEnd', searchYearEnd.value.toString())
    }
    params.append('page', currentPage.value.toString())
    params.append('pageSize', pageSize.value.toString())
    
    const response = await fetch(`${API_BASE_URL}/characters?${params.toString()}`, {
      headers
    })
    if (!response.ok) {
      throw new Error('获取人物列表失败')
    }
    const data = await response.json()
    characters.value = data.data || []
    totalCharacters.value = data.total || 0
    totalPages.value = Math.ceil(totalCharacters.value / pageSize.value)
    console.log('搜索参数:', params.toString())
    console.log('人物列表:', characters.value)
    console.log('总人数:', totalCharacters.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取数据失败'
    console.error('获取人物列表失败:', err)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 搜索时重置到第一页
  currentPage.value = 1
  fetchCharacters()
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchCharacters()
  }
}

// 触摸事件处理
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.changedTouches[0].screenX
}

const handleTouchMove = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0].screenX
}

const handleTouchEnd = () => {
  const swipeThreshold = 50
  const diff = touchStartX.value - touchEndX.value
  
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // 向左滑动，下一页
      if (currentPage.value < totalPages.value) {
        changePage(currentPage.value + 1)
      }
    } else {
      // 向右滑动，上一页
      if (currentPage.value > 1) {
        changePage(currentPage.value - 1)
      }
    }
  }
  
  // 重置触摸值
  touchStartX.value = 0
  touchEndX.value = 0
}

// 鼠标事件处理
const handleMouseDown = (e: MouseEvent) => {
  mouseStartX.value = e.screenX
}

const handleMouseMove = (e: MouseEvent) => {
  mouseEndX.value = e.screenX
}

const handleMouseUp = () => {
  const swipeThreshold = 50
  const diff = mouseStartX.value - mouseEndX.value
  
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // 向左滑动，下一页
      if (currentPage.value < totalPages.value) {
        changePage(currentPage.value + 1)
      }
    } else {
      // 向右滑动，上一页
      if (currentPage.value > 1) {
        changePage(currentPage.value - 1)
      }
    }
  }
  
  // 重置鼠标值
  mouseStartX.value = 0
  mouseEndX.value = 0
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
  return characters.value.filter(character => {
    // 姓名搜索
    if (searchQuery.value && !character.name.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false
    }
    
    // 朝代搜索
    if (searchDynasty.value && character.dynasty !== searchDynasty.value) {
      return false
    }
    
    // 性别搜索
    if (searchGender.value && character.gender !== searchGender.value) {
      return false
    }
    
    // 年份范围搜索
    if (searchYearStart.value !== null || searchYearEnd.value !== null) {
      // 生年过滤
      if (searchYearStart.value !== null && character.birthYear !== 3000 && character.birthYear < searchYearStart.value) {
        return false
      }
      // 卒年过滤
      if (searchYearEnd.value !== null && character.deathYear !== null && character.deathYear !== 3000 && character.deathYear > searchYearEnd.value) {
        return false
      }
    }
    
    return true
  })
})

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

<style>
/* 全局样式 */
* {
  box-sizing: border-box;
}

body {
  overflow-x: hidden;
  margin: 0;
  padding: 0;
  background: #f8f9fa;
}

html {
  overflow-x: hidden;
}

/* 隐藏横向滚动条但保留垂直滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 0;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 兼容Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
  -ms-overflow-style: auto;
}
</style>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
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
  gap: 20px;
  flex-wrap: wrap;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
  padding: 0 10px;
}

.search-input,
.search-select,
.year-input {
  padding: 12px 15px;
  border: 2px solid #666;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
  font-family: 'SimSun', serif;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-input {
  width: 400px;
}

.search-select {
  cursor: pointer;
}

.year-input {
  width: 100px;
}

.search-input:focus, .search-select:focus, .year-input:focus {
  outline: none;
  border-color: #6e6b6b;
  background: white;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transform: translateY(-2px);
}

.advanced-search-button {
  padding: 12px 20px;
  border: 2px solid #6e6b6b;
  border-radius: 8px;
  background: white;
  color: #6e6b6b;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'SimSun', serif;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.advanced-search-button:hover {
  border-color: #000;
  background: #6e6b6b;
  color: white;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transform: translateY(-2px);
}

.year-range-search {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 400px;
}

.year-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.year-input {
  width: 120px;
  padding: 12px 15px;
  border: 2px solid #6e6b6b;
  border-radius: 0;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  font-family: 'SimSun', serif;
}

.year-input:focus {
  outline: none;
  border-color: #000;
  background: white;
  box-shadow: 2px 2px 0 #000;
}

.year-separator {
  font-size: 16px;
  color: #6e6b6b;
  font-family: 'SimSun', serif;
}

.dynasty-toggle {
  padding: 12px 15px;
  border: 2px solid #6e6b6b;
  border-radius: 0;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'SimSun', serif;
}

.dynasty-toggle:hover {
  border-color: #000;
  background: white;
  box-shadow: 2px 2px 0 #000;
}

.dynasty-icon {
  font-size: 18px;
}

.dynasty-timeline {
  margin-top: 10px;
}

.dynasty-timeline h4 {
  font-size: 16px;
  color: #6e6b6b;
  font-family: 'SimSun', serif;
  margin-bottom: 10px;
  text-align: center;
}

.timeline-container {
  position: relative;
  padding-left: 20px;
  border-left: 2px solid #6e6b6b;
  max-height: 300px;
  overflow-y: auto;
}

.dynasty-item {
  position: relative;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 12px;
  background: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.dynasty-item:hover {
  background: #f0f0f0;
  transform: translateX(5px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dynasty-dot {
  position: absolute;
  left: -26px;
  top: 15px;
  width: 10px;
  height: 10px;
  background: #6e6b6b;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #6e6b6b;
}

.dynasty-info {
  font-family: 'SimSun', serif;
}

.dynasty-name {
  font-size: 14px;
  font-weight: bold;
  color: #6e6b6b;
  margin-bottom: 2px;
}

.dynasty-years {
  font-size: 12px;
  color: #666;
}

/* 自定义滚动条 */
.timeline-container::-webkit-scrollbar {
  width: 6px;
}

.timeline-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.timeline-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.timeline-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 15px 20px;
  background: white;
  border: 2px solid #6e6b6b;
  border-radius: 0;
  box-shadow: 3px 3px 0 #555454;
  position: sticky;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 90%;
  z-index: 100;
  font-family: 'SimSun', serif;
  margin: 0 auto;
  margin-top: 30px;
  margin-bottom: 30px;
}

.pagination-button {
  padding: 10px 20px;
  border: 2px solid #6e6b6b;
  background: white;
  color: #6e6b6b;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'SimSun', serif;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.pagination-button:hover:not(:disabled) {
  background: #6e6b6b;
  color: white;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transform: translateY(-2px);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f0f0f0;
  color: #999;
  border-color: #ccc;
  box-shadow: none;
}

.pagination-info {
  font-size: 16px;
  color: #6e6b6b;
  font-family: 'SimSun', serif;
  font-weight: bold;
  padding: 0 10px;
}

/* AI 生成按钮 */
.generate-container {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.generate-button {
  background: white;
  color: #6e6b6b;
  border: 2px solid #6e6b6b;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'SimSun', serif;
  box-shadow: 0 2px 4px rgba(105, 104, 104, 0.1);
}

.generate-button:hover {
  background: #6e6b6b;
  color: white;
  box-shadow: 0 4px 8px rgba(110, 108, 108, 0.2);
  transform: translateY(-2px);
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

.characters-wrapper {
  max-height: 60vh;
  overflow-y: auto;
  margin: 20px 0;
  padding: 0 10px;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
  /* 隐藏滚动条但保留滚动功能 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.characters-wrapper::-webkit-scrollbar {
  display: none;
}

.characters-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
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

  .characters-wrapper {
    max-height: 50vh;
    overflow-y: auto;
    overflow-x: hidden;
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

  .pagination {
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
  }

  .pagination-button {
    padding: 6px 12px;
    font-size: 12px;
  }

  body {
    overflow-x: hidden;
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

/* 高级搜索弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px 8px 0 0;
  max-width: 100%;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
}

.bottom-up-modal {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.advanced-search-modal {
  max-width: 100%;
  width: 100%;
}

.advanced-search-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #6e6b6b;
  background: none;
  color: #6e6b6b;
  border-radius: 0;
  padding: 0 0 10px 0;
}

.advanced-search-modal .modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #6e6b6b;
  font-family: 'SimSun', serif;
}

.advanced-search-modal .close-button {
  background: white;
  border: 2px solid #666;
  font-size: 24px;
  cursor: pointer;
  color: #6e6b6b;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.advanced-search-modal .close-button:hover {
  background: #6e6b6b;
  color: white;
  border-color: #6e6b6b;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transform: translateY(-2px);
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 14px;
  font-weight: bold;
  color: #6e6b6b;
  font-family: 'SimSun', serif;
}

/* 水墨风格 */
.ink-style {
  border: 2px solid #6e6b6b;
  border-radius: 0;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  font-family: 'SimSun', serif;
}

.ink-style:focus {
  outline: none;
  border-color: #000;
  background: white;
  box-shadow: 2px 2px 0 #000;
}

.form-select.ink-style {
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
}

.year-input.ink-style {
  padding: 10px 15px;
  font-size: 16px;
}

.dynasty-toggle.ink-style {
  padding: 10px 15px;
  cursor: pointer;
}

.dynasty-toggle.ink-style:hover {
  border-color: #000;
  background: white;
  box-shadow: 2px 2px 0 #000;
}

.action-button.ink-style {
  padding: 12px 20px;
  background: white;
  color: #6e6b6b;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  border: 2px solid #666;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.action-button.ink-style:hover {
  border-color: #6e6b6b;
  background: #6e6b6b;
  color: white;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transform: translateY(-2px);
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 确保内容完全显示，无外部拖拽条 */
body {
  overflow-x: hidden;
}

.timeline-container {
  max-height: 250px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 分页位置调整 */
.pagination {
  position: relative;
  z-index: 10;
  margin-bottom: 20px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .modal-content {
    max-height: 90vh;
  }
  
  .timeline-container {
    max-height: 200px;
  }
  
  .dynasty-timeline {
    margin-top: 10px;
  }
  
  .year-inputs {
    flex-wrap: wrap;
  }
  
  .year-input {
    flex: 1;
    min-width: 100px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .action-button.ink-style {
    width: 100%;
  }
}
</style>
