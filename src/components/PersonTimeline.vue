<template>
  <div class="person-timeline">
    <h2 class="section-title">人物正史记载年份表</h2>
    <p class="person-count">共收录 {{ persons.length }} 位历史人物</p>

    <!-- 搜索和添加人物 -->
    <div class="search-add-container">
      <div class="search-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索人物..."
          class="search-input"
        />
      </div>
      <button v-if="isAdmin" @click="showAddPersonModal = true" class="add-person-btn">
        添加人物
      </button>
    </div>

    <!-- 人物列表 -->
    <div class="person-list">
      <div
        v-for="person in filteredPersons"
        :key="person.id"
        class="person-item"
        @click="selectPerson(person)"
      >
        <div class="person-info">
          <span class="person-name">{{ person.name }}</span>
          <span class="person-dynasty">{{ person.dynasty }}</span>
          <span v-if="person.birthYear || person.deathYear" class="person-years">
            {{ person.birthYear || '?' }}-{{ person.deathYear || '?' }}
          </span>
        </div>
        <div v-if="isAdmin" class="person-actions">
          <button @click.stop="editPerson(person)" class="action-btn edit-btn">
            编辑
          </button>
          <button @click.stop="deletePerson(person.id)" class="action-btn delete-btn">
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 人物详细信息弹窗（从底部弹出） -->
    <div v-if="showPersonModal && selectedPerson" class="modal-overlay bottom-modal" @click="closePersonModal">
      <div class="modal-content bottom-modal-content" @click.stop>
        <div class="detail-header">
          <h3 class="person-name">
            {{ selectedPerson.name }} 
            <span class="person-dynasty">{{ selectedPerson.dynasty }}</span>
            <span v-if="selectedPerson.birthYear || selectedPerson.deathYear" class="person-years">
              ({{ selectedPerson.birthYear || '?' }}-{{ selectedPerson.deathYear || '?' }})
            </span>
          </h3>
          <div class="detail-actions">
            <button class="copy-btn" @click="copyTable(selectedPerson)">
              复制表格
            </button>
            <button v-if="isAdmin" class="ai-btn" @click="showEventAiModal = true">
              AI生成事件
            </button>
          </div>
        </div>
        <div class="timeline-table">
          <table :id="`timeline-${selectedPerson.id}`">
            <thead>
              <tr>
                <th>公元年份</th>
                <th>{{ selectedPerson.name }}虚岁</th>
                <th>所用年号</th>
                <th>正史关键事迹</th>
                <th>正史原文摘要（出处）</th>
                <th v-if="isAdmin">操作</th>
              </tr>
            </thead>
            <tbody>
              <!-- 现有事件 -->
              <tr v-for="event in selectedPersonTimeline" :key="event.id" :class="{ 'editing': editingEvent && editingEvent.id === event.id }">
                <td>
                  <template v-if="editingEvent && editingEvent.id === event.id">
                    <input type="text" v-model="editingEvent.year" class="inline-input" />
                  </template>
                  <template v-else>
                    {{ event.year }}
                  </template>
                </td>
                <td>
                  <template v-if="editingEvent && editingEvent.id === event.id">
                    <input type="text" v-model="editingEvent.age" class="inline-input" />
                  </template>
                  <template v-else>
                    {{ event.age }}
                  </template>
                </td>
                <td>
                  <template v-if="editingEvent && editingEvent.id === event.id">
                    <input type="text" v-model="editingEvent.reignYear" class="inline-input" />
                  </template>
                  <template v-else>
                    {{ event.reignYear }}
                  </template>
                </td>
                <td>
                  <template v-if="editingEvent && editingEvent.id === event.id">
                    <textarea v-model="editingEvent.event" class="inline-textarea"></textarea>
                  </template>
                  <template v-else>
                    {{ event.event }}
                  </template>
                </td>
                <td>
                  <template v-if="editingEvent && editingEvent.id === event.id">
                    <textarea v-model="editingEvent.source" class="inline-textarea"></textarea>
                  </template>
                  <template v-else>
                    {{ event.source }}
                  </template>
                </td>
                <td v-if="isAdmin" class="event-actions">
                  <template v-if="editingEvent && editingEvent.id === event.id">
                    <button @click="saveInlineEvent()" class="action-btn save-btn">
                      保存
                    </button>
                    <button @click="cancelEditEvent()" class="action-btn cancel-btn">
                      取消
                    </button>
                  </template>
                  <template v-else>
                    <button @click="startEditEvent(event)" class="action-btn edit-btn">
                      编辑
                    </button>
                    <button @click="deleteEvent(event.id)" class="action-btn delete-btn">
                      删除
                    </button>
                    <button @click="moveEventUp(event)" class="action-btn move-btn">
                      ↑
                    </button>
                    <button @click="moveEventDown(event)" class="action-btn move-btn">
                      ↓
                    </button>
                  </template>
                </td>
              </tr>
              <!-- 新增事件行 -->
              <tr v-if="isAdmin" class="new-event-row">
                <td>
                  <input type="text" v-model="newEvent.year" class="inline-input" placeholder="公元年份" />
                </td>
                <td>
                  <input type="text" v-model="newEvent.age" class="inline-input" placeholder="虚岁" />
                </td>
                <td>
                  <input type="text" v-model="newEvent.reignYear" class="inline-input" placeholder="所用年号" />
                </td>
                <td>
                  <textarea v-model="newEvent.event" class="inline-textarea" placeholder="正史关键事迹"></textarea>
                </td>
                <td>
                  <textarea v-model="newEvent.source" class="inline-textarea" placeholder="正史原文摘要（出处）"></textarea>
                </td>
                <td class="event-actions">
                  <button @click="saveNewEvent()" class="action-btn save-btn">
                    保存
                  </button>
                  <button @click="resetNewEvent()" class="action-btn cancel-btn">
                    取消
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="close-btn" @click="closePersonModal">关闭</button>
      </div>
    </div>

    <!-- 添加人物弹窗 -->
    <div v-if="showAddPersonModal" class="modal-overlay" @click="showAddPersonModal = false">
      <div class="modal-content" @click.stop>
        <h3>{{ editingPerson ? '编辑人物' : '添加人物' }}</h3>
        <form @submit.prevent="savePerson">
          <div class="form-group">
            <label>姓名</label>
            <div class="input-with-button">
              <input type="text" v-model="personForm.name" required />
              <button type="button" @click="showAiModal = true" class="ai-btn">AI</button>
            </div>
          </div>
          <div class="form-group">
            <label>背景</label>
            <input type="text" v-model="personForm.background" required />
          </div>
          <div class="form-group">
            <label>出生地</label>
            <input type="text" v-model="personForm.birthPlace" required />
          </div>
          <div class="form-group">
            <label>性别</label>
            <input type="text" v-model="personForm.gender" required />
          </div>
          <div class="form-group">
            <label>性格</label>
            <input type="text" v-model="personForm.personality" required />
          </div>
          <div class="form-group">
            <label>朝代</label>
            <input type="text" v-model="personForm.dynasty" required />
          </div>
          <div class="form-group">
            <label>年份</label>
            <div class="year-inputs">
              <input type="text" v-model="personForm.birthYear" placeholder="出生年份" />
              <span class="year-separator">-</span>
              <input type="text" v-model="personForm.deathYear" placeholder="死亡年份" />
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddPersonModal = false" class="cancel-btn">
              取消
            </button>
            <button type="submit" class="save-btn">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- AI 弹窗 -->
    <div v-if="showAiModal" class="modal-overlay" @click="showAiModal = false">
      <div class="modal-content" @click.stop>
        <h3>AI 人物生成</h3>
        <div class="form-group">
          <label>人物名称</label>
          <input type="text" v-model="aiForm.name" placeholder="请输入人物名称" required />
        </div>
        <div class="form-group">
          <label>选择模型</label>
          <select v-model="aiForm.model" required class="model-select">
            <option value="doubao-seed-2-0-pro-260215">Doubao-Seed-2.0-pro</option>
            <option value="ep-20250721184613-99r2n">Doubao-1.5-pro</option>
            <option value="ep-20250721184613-99r2n">Doubao-1.5-flash</option>
            <option value="ep-20250721184613-99r2n">Doubao-2.0-pro</option>
            <option value="ep-20250721184613-99r2n">Doubao-2.0-flash</option>
            <option value="ep-20250721184613-99r2n">Doubao-3.0-pro</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" @click="showAiModal = false" class="cancel-btn">
            取消
          </button>
          <button type="button" @click="generatePersonWithAi" class="save-btn">
            生成
          </button>
        </div>
      </div>
    </div>

    <!-- AI 思考内容弹窗 -->
    <div v-if="showAiThinkingModal" class="modal-overlay" @click="closeAiThinkingModal">
      <div class="modal-content" @click.stop>
        <h3>AI 正在思考...</h3>
        <div class="ai-thinking-content">
          <p v-for="(chunk, index) in aiThinkingContent" :key="index">{{ chunk }}</p>
        </div>
        <div class="modal-actions">
          <button type="button" @click="closeAiThinkingModal" class="cancel-btn">
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- AI 事件生成思考内容弹窗 -->
    <div v-if="showAiEventThinkingModal" class="modal-overlay" @click="closeAiEventThinkingModal">
      <div class="modal-content" @click.stop>
        <h3>AI 正在生成事件...</h3>
        <div class="ai-thinking-content">
          <p v-for="(chunk, index) in aiEventThinkingContent" :key="index">{{ chunk }}</p>
        </div>
        <div class="modal-actions">
          <button type="button" @click="closeAiEventThinkingModal" class="cancel-btn">
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- AI 事件生成弹窗 -->
    <div v-if="showEventAiModal" class="modal-overlay" @click="showEventAiModal = false">
      <div class="modal-content" @click.stop>
        <h3>AI 事件生成</h3>
        <div class="form-group">
          <label>人物名称</label>
          <input type="text" :value="selectedPerson ? selectedPerson.name : ''" disabled />
        </div>
        <div class="form-group">
          <label>选择模型</label>
          <select v-model="eventAiForm.model" required class="model-select">
            <option value="doubao-seed-2-0-pro-260215">Doubao-Seed-2.0-pro</option>
            <option value="ep-20250721184613-99r2n">Doubao-1.5-pro</option>
            <option value="ep-20250721184613-99r2n">Doubao-1.5-flash</option>
            <option value="ep-20250721184613-99r2n">Doubao-2.0-pro</option>
            <option value="ep-20250721184613-99r2n">Doubao-2.0-flash</option>
            <option value="ep-20250721184613-99r2n">Doubao-3.0-pro</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" @click="showEventAiModal = false" class="cancel-btn">
            取消
          </button>
          <button type="button" @click="generateEventsWithAi" class="save-btn">
            生成
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

// API基础URL
const baseURL = import.meta.env.VITE_API_BASE_URL || 'baseURL';

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
});

const persons = ref([]);
const selectedPerson = ref(null);
const selectedPersonTimeline = ref([]);
const searchQuery = ref("");
const showAddPersonModal = ref(false);
const showAiModal = ref(false);
const showEventAiModal = ref(false);
const showAiThinkingModal = ref(false);
const showAiEventThinkingModal = ref(false);
const aiThinkingContent = ref([]);
const aiEventThinkingContent = ref([]);
const editingPerson = ref(null);
const editingEvent = ref(null);
const showPersonModal = ref(false);
const newEvent = ref({ year: '', age: '', reignYear: '', event: '', source: '', order: 0 });
const personForm = ref({ name: '', background: '', birthPlace: '', gender: '', personality: '', dynasty: '', birthYear: '', deathYear: '' });
const aiForm = ref({ name: '', model: 'doubao-seed-2-0-pro-260215', token: '' });
const eventAiForm = ref({ model: 'doubao-seed-2-0-pro-260215' });

// 计算用户是否为管理员
const isAdmin = computed(() => {
  return props.user && props.user.isAdmin;
});

// 过滤人物列表
const filteredPersons = computed(() => {
  if (!searchQuery.value) {
    return persons.value;
  }
  return persons.value.filter((person) =>
    person.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

// 获取所有人物
const fetchPersons = async () => {
  try {
    const response = await fetch(`${baseURL}/characters`);
    const data = await response.json();
    persons.value = data;
  } catch (error) {
    console.error('获取人物列表失败:', error);
  }
};

// 获取人物时间线
const fetchPersonTimeline = async (personId) => {
  try {
    const response = await fetch(`${baseURL}/characters/${personId}/timeline`);
    const data = await response.json();
    selectedPersonTimeline.value = data;
  } catch (error) {
    console.error('获取人物时间线失败:', error);
  }
};

// 选择人物
const selectPerson = async (person) => {
  selectedPerson.value = person;
  await fetchPersonTimeline(person.id);
  showPersonModal.value = true;
};

// 关闭人物弹窗
const closePersonModal = () => {
  showPersonModal.value = false;
  selectedPerson.value = null;
  selectedPersonTimeline.value = [];
};

// 打开添加人物弹窗
const addPerson = () => {
  editingPerson.value = null;
  personForm.value = { name: '', background: '', birthPlace: '', gender: '', personality: '', dynasty: '', birthYear: '', deathYear: '' };
  showAddPersonModal.value = true;
};

// 打开编辑人物弹窗
const editPerson = (person) => {
  editingPerson.value = person;
  personForm.value = { 
    name: person.name, 
    background: person.background || '', 
    birthPlace: person.birthPlace || '', 
    gender: person.gender || '', 
    personality: person.personality || '', 
    dynasty: person.dynasty, 
    birthYear: person.birthYear || '', 
    deathYear: person.deathYear || '' 
  };
  showAddPersonModal.value = true;
};

// 获取token
const getToken = () => {
  return localStorage.getItem('token');
};

// 保存人物
const savePerson = async () => {
  if (!isAdmin.value) {
    alert('您没有权限执行此操作');
    return;
  }
  
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 准备数据，确保包含所有必要字段
    const personData = {
      ...personForm.value,
      userId: 1, // 假设当前用户ID为1，实际应该从登录用户信息中获取
      birthYear: personForm.value.birthYear ? parseInt(personForm.value.birthYear) : 0,
      deathYear: personForm.value.deathYear ? parseInt(personForm.value.deathYear) : null
    };
    
    if (editingPerson.value) {
      // 更新人物
      await fetch(`${baseURL}/characters/${editingPerson.value.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(personData),
      });
    } else {
      // 添加人物
      await fetch(`${baseURL}/characters`, {
        method: 'POST',
        headers,
        body: JSON.stringify(personData),
      });
    }
    await fetchPersons();
    showAddPersonModal.value = false;
  } catch (error) {
    console.error('保存人物失败:', error);
    alert('保存失败，请确保您有管理员权限');
  }
};

// 删除人物
const deletePerson = async (personId) => {
  if (!isAdmin.value) {
    alert('您没有权限执行此操作');
    return;
  }
  
  if (confirm('确定要删除这个人物吗？')) {
    try {
      const token = getToken();
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await fetch(`${baseURL}/characters/${personId}`, {
        method: 'DELETE',
        headers,
      });
      await fetchPersons();
      if (selectedPerson.value && selectedPerson.value.id === personId) {
        selectedPerson.value = null;
        selectedPersonTimeline.value = [];
      }
    } catch (error) {
      console.error('删除人物失败:', error);
      alert('删除失败，请确保您有管理员权限');
    }
  }
};

// 开始编辑事件
const startEditEvent = (event) => {
  if (!isAdmin.value) {
    alert('您没有权限执行此操作');
    return;
  }
  
  // 创建事件的深拷贝，用于编辑
  editingEvent.value = JSON.parse(JSON.stringify(event));
};

// 保存内联编辑的事件
const saveInlineEvent = async () => {
  if (!isAdmin.value || !editingEvent.value) {
    alert('您没有权限执行此操作');
    return;
  }
  
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 更新事件
    await fetch(`${baseURL}/characters/timeline/${editingEvent.value.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(editingEvent.value),
    });
    
    await fetchPersonTimeline(selectedPerson.value.id);
    editingEvent.value = null;
  } catch (error) {
    console.error('保存事件失败:', error);
    alert('保存失败，请确保您有管理员权限');
  }
};

// 取消编辑事件
const cancelEditEvent = () => {
  editingEvent.value = null;
};

// 保存新事件
const saveNewEvent = async () => {
  if (!isAdmin.value || !selectedPerson.value) {
    alert('您没有权限执行此操作');
    return;
  }
  
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 添加事件
    await fetch(`${baseURL}/characters/${selectedPerson.value.id}/timeline`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newEvent.value),
    });
    
    await fetchPersonTimeline(selectedPerson.value.id);
    resetNewEvent();
  } catch (error) {
    console.error('保存事件失败:', error);
    alert('保存失败，请确保您有管理员权限');
  }
};

// 重置新事件表单
const resetNewEvent = () => {
  newEvent.value = { year: '', age: '', reignYear: '', event: '', source: '', order: selectedPersonTimeline.value.length };
};

// 向上移动事件
const moveEventUp = async (event) => {
  if (!isAdmin.value) {
    alert('您没有权限执行此操作');
    return;
  }
  
  try {
    const index = selectedPersonTimeline.value.findIndex(e => e.id === event.id);
    if (index > 0) {
      const prevEvent = selectedPersonTimeline.value[index - 1];
      // 交换顺序
      const tempOrder = event.order;
      event.order = prevEvent.order;
      prevEvent.order = tempOrder;
      
      // 更新两个事件的顺序
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await Promise.all([
        fetch(`${baseURL}/characters/timeline/${event.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ order: event.order }),
        }),
        fetch(`${baseURL}/characters/timeline/${prevEvent.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ order: prevEvent.order }),
        })
      ]);
      
      await fetchPersonTimeline(selectedPerson.value.id);
    }
  } catch (error) {
    console.error('移动事件失败:', error);
    alert('移动失败，请确保您有管理员权限');
  }
};

// 向下移动事件
const moveEventDown = async (event) => {
  if (!isAdmin.value) {
    alert('您没有权限执行此操作');
    return;
  }
  
  try {
    const index = selectedPersonTimeline.value.findIndex(e => e.id === event.id);
    if (index < selectedPersonTimeline.value.length - 1) {
      const nextEvent = selectedPersonTimeline.value[index + 1];
      // 交换顺序
      const tempOrder = event.order;
      event.order = nextEvent.order;
      nextEvent.order = tempOrder;
      
      // 更新两个事件的顺序
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await Promise.all([
        fetch(`${baseURL}/characters/timeline/${event.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ order: event.order }),
        }),
        fetch(`${baseURL}/characters/timeline/${nextEvent.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ order: nextEvent.order }),
        })
      ]);
      
      await fetchPersonTimeline(selectedPerson.value.id);
    }
  } catch (error) {
    console.error('移动事件失败:', error);
    alert('移动失败，请确保您有管理员权限');
  }
};

// 删除事件
const deleteEvent = async (eventId) => {
  if (!isAdmin.value) {
    alert('您没有权限执行此操作');
    return;
  }
  
  if (confirm('确定要删除这个事件吗？')) {
    try {
      const token = getToken();
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await fetch(`${baseURL}/characters/timeline/${eventId}`, {
        method: 'DELETE',
        headers,
      });
      await fetchPersonTimeline(selectedPerson.value.id);
    } catch (error) {
      console.error('删除事件失败:', error);
      alert('删除失败，请确保您有管理员权限');
    }
  }
};

// 更新事件顺序
const updateEventOrder = async (event) => {
  if (!isAdmin.value) {
    alert('您没有权限执行此操作');
    return;
  }
  
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    await fetch(`${baseURL}/characters/timeline/${event.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ order: event.order }),
    });
    await fetchPersonTimeline(selectedPerson.value.id);
  } catch (error) {
    console.error('更新事件顺序失败:', error);
    alert('更新失败，请确保您有管理员权限');
  }
};

// 复制表格到剪贴板
const copyTable = (person) => {
  // 构建简化的HTML表格，适合微信公众号
  let tableHTML = `<h3>${person.name} - 正史记载年份表</h3>`;
  tableHTML += `
  <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; font-size: 14px; line-height: 1.5;">
    <thead>
      <tr>
        <th style="background-color: #f5f5f5; text-align: center;">公元年份</th>
        <th style="background-color: #f5f5f5; text-align: center;">${person.name}虚岁</th>
        <th style="background-color: #f5f5f5; text-align: center;">所用年号</th>
        <th style="background-color: #f5f5f5; text-align: center;">正史关键事迹</th>
        <th style="background-color: #f5f5f5; text-align: center;">正史原文摘要</th>
      </tr>
    </thead>
    <tbody>`;

  // 限制复制的行数，避免内容过多
  const maxRows = 10;
  const timelineToCopy = selectedPersonTimeline.value.slice(0, maxRows);

  timelineToCopy.forEach((event) => {
    tableHTML += `
      <tr>
        <td style="text-align: center;">${event.year}</td>
        <td style="text-align: center;">${event.age}</td>
        <td style="text-align: center;">${event.reignYear}</td>
        <td style="text-align: left;">${event.event}</td>
        <td style="text-align: left;">${event.source}</td>
      </tr>`;
  });

  // 如果有更多行，添加省略提示
  if (selectedPersonTimeline.value.length > maxRows) {
    tableHTML += `
      <tr>
        <td colspan="5" style="text-align: center; font-style: italic;">（内容过多，仅显示前${maxRows}条）</td>
      </tr>`;
  }

  tableHTML += `
    </tbody>
  </table>`;

  // 创建临时元素并复制内容
  const tempElement = document.createElement("textarea");
  tempElement.value = tableHTML;
  document.body.appendChild(tempElement);
  tempElement.select();
  document.execCommand("copy");
  document.body.removeChild(tempElement);

  // 提示复制成功
  alert("表格已复制到剪贴板，可直接粘贴。");
};

// 关闭 AI 思考内容弹窗
const closeAiThinkingModal = () => {
  showAiThinkingModal.value = false;
  aiThinkingContent.value = [];
};

// 关闭 AI 事件生成思考内容弹窗
const closeAiEventThinkingModal = () => {
  showAiEventThinkingModal.value = false;
  aiEventThinkingContent.value = [];
};

// AI 生成人物
const generatePersonWithAi = async () => {
  if (!aiForm.value.name) {
    alert('请输入人物名称');
    return;
  }
  
  // 获取用户 token
  const token = getToken();
  if (!token) {
    alert('请先登录');
    return;
  }
  
  try {
    // 打开 AI 思考内容弹窗
    showAiThinkingModal.value = true;
    aiThinkingContent.value = [];
    
    // 调用后端的 AI 生成人物信息接口
    const response = await fetch(`${baseURL}/characters/ai-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: aiForm.value.name,
        model: aiForm.value.model
      })
    });
    
    if (!response.ok) {
      throw new Error('API 调用失败');
    }
    
    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let personData = null;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      
      // 解码响应数据
      const chunk = decoder.decode(value, { stream: true });
      console.log(chunk, '==chunk==')
      
      // 处理 SSE 格式的数据
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              console.log(parsed, '==parsed==')
              if (parsed.content) {
                // 添加 AI 思考内容
                aiThinkingContent.value.push(parsed.content);
              }
              if (parsed.complete) {
                // 生成完成，获取完整数据
                personData = parsed.data;
              }
              if (parsed.error) {
                // 处理错误
                throw new Error(parsed.error);
              }
            } catch (e) {
              console.error('解析数据失败:', e);
            }
          }
        }
      }
    }
    
    // 关闭 AI 思考内容弹窗
    showAiThinkingModal.value = false;
    aiThinkingContent.value = [];
    
    console.log(personData, '==personData==')

    if (personData) {
      // 填充表单
      personForm.value = {
        name: personData.name,
        background: personData.background || '',
        birthPlace: personData.birthPlace || '',
        gender: personData.gender || '',
        personality: personData.personality || '',
        dynasty: personData.dynasty,
        birthYear: personData.birthYear || '',
        deathYear: personData.deathYear || '',
      };
      
      // 关闭 AI 弹窗，返回人物添加弹窗
      showAiModal.value = false;
    } else {
      throw new Error('未获取到完整的人物数据');
    }
  } catch (error) {
    console.error('AI 生成失败:', error);
    // 关闭 AI 思考内容弹窗
    showAiThinkingModal.value = false;
    aiThinkingContent.value = [];
    alert('AI 生成失败，请检查您的权限并重试');
  }
};

// 生成事件
const generateEventsWithAi = async () => {
  if (!isAdmin.value || !selectedPerson.value) {
    alert('您没有权限执行此操作');
    return;
  }
  
  try {
    // 打开 AI 事件生成思考内容弹窗
    showAiEventThinkingModal.value = true;
    aiEventThinkingContent.value = [];
    
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 调用后端的AI生成事件接口
    const response = await fetch(`${baseURL}/characters/ai/generate-events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: selectedPerson.value.name,
        model: eventAiForm.value.model
      })
    });
    
    if (!response.ok) {
      throw new Error('API 调用失败');
    }
    
    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let events = null;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      
      // 解码响应数据
      const chunk = decoder.decode(value, { stream: true });
      console.log('收到流式数据:', chunk);
      
      // 处理 SSE 格式的数据
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              console.log('解析后的数据:', parsed);
              if (parsed.content) {
                // 添加 AI 思考内容
                aiEventThinkingContent.value.push(parsed.content);
              }
              if (parsed.complete) {
                // 生成完成，获取完整数据
                events = parsed.data;
                console.log('获取到的事件数据:', events);
              }
              if (parsed.error) {
                // 处理错误
                throw new Error(parsed.error);
              }
            } catch (e) {
              console.error('解析数据失败:', e);
            }
          }
        }
      }
    }
    
    // 关闭 AI 事件生成思考内容弹窗
    showAiEventThinkingModal.value = false;
    aiEventThinkingContent.value = [];
    
    // 批量保存事件
    if (events && events.length > 0) {
      const batchResponse = await fetch(`${baseURL}/characters/${selectedPerson.value.id}/timeline/batch`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ events }),
      });
      
      if (!batchResponse.ok) {
        throw new Error('批量保存事件失败');
      }
      
      const batchResult = await batchResponse.json();
      console.log('批量保存事件成功:', batchResult);
    }
    
    await fetchPersonTimeline(selectedPerson.value.id);
    showEventAiModal.value = false;
    alert('事件生成成功！');
  } catch (error) {
    console.error('生成失败:', error);
    // 关闭 AI 事件生成思考内容弹窗
    showAiEventThinkingModal.value = false;
    aiEventThinkingContent.value = [];
    alert('生成失败，请确保您有管理员权限');
  }
};

// 初始化
onMounted(async () => {
  await fetchPersons();
});
</script>

<style scoped>
.person-timeline {
  margin-top: 3rem;
  padding: 2rem;
  background-color: #f5f0e6;
  border-radius: 8px;
}

.section-title {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #2c1810;
  font-family: "Noto Serif SC", serif;
  font-size: 1.8rem;
}

.person-count {
  text-align: center;
  margin-bottom: 2rem;
  color: #666;
  font-size: 1rem;
  font-family: "Noto Serif SC", serif;
}

.search-add-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.search-container {
  flex: 1;
  display: flex;
  justify-content: center;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 0.8rem 1rem;
  border: 1px solid #d4af37;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  color: #2c1810;
}

.search-input::placeholder {
  color: #999;
}

.add-person-btn {
  padding: 0.8rem 1.5rem;
  background-color: #8b4513;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.add-person-btn:hover {
  background-color: #6b3410;
}

.person-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.person-item {
  padding: 1rem;
  background-color: white;
  border: 1px solid #d4af37;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  font-family: "Noto Serif SC", serif;
  color: #2c1810;
  cursor: pointer;
}

.person-item:hover {
  background-color: #f9f5f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.person-info {
  cursor: pointer;
}

.person-name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.person-dynasty {
  font-size: 0.9rem;
  color: #666;
}

.person-years {
  font-size: 0.85rem;
  color: #999;
  margin-left: 0.5rem;
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
}

.input-with-button input {
  flex: 1;
}

.ai-btn {
  padding: 0.75rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  white-space: nowrap;
  transition: background-color 0.3s;
}

.ai-btn:hover {
  background-color: #357abd;
}

.year-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.year-inputs input {
  flex: 1;
}

.year-separator {
  font-size: 1.2rem;
  color: #666;
  font-weight: bold;
  padding: 0 0.5rem;
}

.person-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.edit-btn {
  background-color: #d4af37;
  color: #2c1810;
}

.edit-btn:hover {
  background-color: #e6c760;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.delete-btn:hover {
  background-color: #c82333;
}

.person-details {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.detail-actions {
  display: flex;
  gap: 1rem;
}

.copy-btn, .add-event-btn, .ai-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.copy-btn {
  background-color: #8b4513;
  color: #fff;
}

.copy-btn:hover {
  background-color: #6b3410;
}

.add-event-btn {
  background-color: #28a745;
  color: #fff;
}

.add-event-btn:hover {
  background-color: #218838;
}

.ai-btn {
  background-color: #dc3545;
  color: #fff;
}

.ai-btn:hover {
  background-color: #c82333;
}

.timeline-table {
  overflow-x: auto;
}

.timeline-table table {
  width: 100%;
  border-collapse: collapse;
}

.timeline-table th,
.timeline-table td {
  padding: 0.8rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.timeline-table th {
  background-color: #f9f5f0;
  font-weight: bold;
  color: #2c1810;
  font-family: "Noto Serif SC", serif;
}

.timeline-table tr:hover {
  background-color: #f9f5f0;
}

.order-input {
  width: 60px;
  padding: 0.3rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
}

.close-btn {
  display: block;
  font-size: 16px;
  width: 120px;
  margin: 2rem auto 0;
  padding: 0.8rem 2rem;
  background-color: #2c1810;
  color: #d4af37;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Noto Serif SC", serif;
}

.close-btn:hover {
  background-color: #d4af37;
  color: #2c1810;
}

/* 弹窗样式 */
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
  max-width: 500px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
}

/* 底部弹窗样式 */
.bottom-modal {
  align-items: flex-end;
  justify-content: center;
}

.bottom-modal-content {
  width: 100%;
  max-width: none;
  border-radius: 8px 8px 0 0;
  max-height: 80vh;
  overflow-y: auto;
  padding: 2rem;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.5);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-family: "Noto Serif SC", serif;
  font-size: 1.3rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-family: "Noto Serif SC", serif;
}

.form-group input,
.form-group textarea,
.form-group select,
.model-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #d4af37;
  font-size: 1rem;
  font-family: "Noto Serif SC", serif;
}

.model-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23d4af37' viewBox='0 0 16 16'%3E%3Cpath d='M8 11l-5-5 1.41-1.41L8 8.17l3.59-3.58L13 6l-5 5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 16px;
  cursor: pointer;
}

.model-select:hover {
  border-color: rgba(212, 175, 55, 0.5);
}

.model-select:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.25);
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(212, 175, 55, 0.5);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn,
.save-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-family: "Noto Serif SC", serif;
  transition: all 0.3s ease;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.save-btn {
  background-color: #d4af37;
  color: #2c1810;
  font-weight: bold;
}

.save-btn:hover {
  background-color: #e6c760;
}

/* 内联编辑样式 */
.inline-input {
  width: 100%;
  padding: 0.25rem;
  border: 1px solid #d4af37;
  border-radius: 3px;
  font-size: 0.9rem;
  background-color: #fff;
  color: #2c1810;
}

.inline-textarea {
  width: 100%;
  padding: 0.25rem;
  border: 1px solid #d4af37;
  border-radius: 3px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 60px;
  background-color: #fff;
  color: #2c1810;
}

.new-event-row {
  background-color: #f9f5f0;
}

.new-event-row input,
.new-event-row textarea {
  background-color: #fff;
}

/* 编辑状态样式 */
tr.editing {
  background-color: #fff9e6;
}

/* 操作按钮样式 */
.event-actions {
  white-space: nowrap;
  display: flex;
  gap: 0.25rem;
}

.event-actions .action-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

/* AI 思考内容样式 */
.ai-thinking-content {
  max-height: 300px;
  overflow-y: auto;
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-family: "Noto Serif SC", serif;
  line-height: 1.6;
}

.ai-thinking-content p {
  margin: 0.5rem 0;
  color: #d4af37;
}

.ai-thinking-content::-webkit-scrollbar {
  width: 8px;
}

.ai-thinking-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.ai-thinking-content::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.5);
  border-radius: 4px;
}

.ai-thinking-content::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 175, 55, 0.8);
}

.event-actions .save-btn {
  background-color: #28a745;
  color: #fff;
}

.event-actions .save-btn:hover {
  background-color: #218838;
}

.event-actions .cancel-btn {
  background-color: #6c757d;
  color: #fff;
}

.event-actions .cancel-btn:hover {
  background-color: #5a6268;
}

.event-actions .move-btn {
  background-color: #ffc107;
  color: #212529;
  font-weight: bold;
}

.event-actions .move-btn:hover {
  background-color: #e0a800;
}

@media (max-width: 768px) {
  .person-timeline {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .search-add-container {
    flex-direction: column;
    align-items: stretch;
  }

  .add-person-btn {
    align-self: center;
  }

  .person-list {
    grid-template-columns: 1fr;
  }

  .person-details {
    padding: 1rem;
  }

  .detail-header {
    flex-direction: column;
    align-items: stretch;
  }

  .detail-actions {
    justify-content: center;
  }

  .timeline-table th,
  .timeline-table td {
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  .modal-content {
    padding: 1.5rem;
    width: 95%;
  }
}
</style>