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
      <button @click="showAddPersonModal = true" class="add-person-btn">
        添加人物
      </button>
    </div>

    <!-- 人物列表 -->
    <div class="person-list">
      <div
        v-for="person in filteredPersons"
        :key="person.id"
        class="person-item"
      >
        <div class="person-info" @click="selectPerson(person)">
          <span class="person-name">{{ person.name }}</span>
          <span class="person-dynasty">{{ person.dynasty }}</span>
        </div>
        <div class="person-actions">
          <button @click.stop="editPerson(person)" class="action-btn edit-btn">
            编辑
          </button>
          <button @click.stop="deletePerson(person.id)" class="action-btn delete-btn">
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 人物详细信息 -->
    <div v-if="selectedPerson" class="person-details">
      <div class="detail-header">
        <h3 class="person-name">{{ selectedPerson.name }} <span class="person-dynasty">{{ selectedPerson.dynasty }}</span></h3>
        <div class="detail-actions">
          <button class="copy-btn" @click="copyTable(selectedPerson)">
            复制表格
          </button>
          <button class="add-event-btn" @click="showAddEventModal = true">
            添加事件
          </button>
        </div>
      </div>
      <div class="timeline-table">
        <table :id="`timeline-${selectedPerson.id}`">
          <thead>
            <tr>
              <th>顺序</th>
              <th>公元年份</th>
              <th>{{ selectedPerson.name }}虚岁</th>
              <th>所用年号</th>
              <th>正史关键事迹</th>
              <th>正史原文摘要（出处）</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in selectedPersonTimeline" :key="event.id">
              <td>
                <input 
                  type="number" 
                  v-model.number="event.order" 
                  @change="updateEventOrder(event)"
                  class="order-input"
                />
              </td>
              <td>{{ event.year }}</td>
              <td>{{ event.age }}</td>
              <td>{{ event.reignYear }}</td>
              <td>{{ event.event }}</td>
              <td>{{ event.source }}</td>
              <td class="event-actions">
                <button @click="editEvent(event)" class="action-btn edit-btn">
                  编辑
                </button>
                <button @click="deleteEvent(event.id)" class="action-btn delete-btn">
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="close-btn" @click="selectedPerson = null">关闭</button>
    </div>

    <!-- 添加人物弹窗 -->
    <div v-if="showAddPersonModal" class="modal-overlay" @click="showAddPersonModal = false">
      <div class="modal-content" @click.stop>
        <h3>{{ editingPerson ? '编辑人物' : '添加人物' }}</h3>
        <form @submit.prevent="savePerson">
          <div class="form-group">
            <label>姓名</label>
            <input type="text" v-model="personForm.name" required />
          </div>
          <div class="form-group">
            <label>朝代</label>
            <input type="text" v-model="personForm.dynasty" required />
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

    <!-- 添加/编辑事件弹窗 -->
    <div v-if="showAddEventModal" class="modal-overlay" @click="showAddEventModal = false">
      <div class="modal-content" @click.stop>
        <h3>{{ editingEvent ? '编辑事件' : '添加事件' }}</h3>
        <form @submit.prevent="saveEvent">
          <div class="form-group">
            <label>公元年份</label>
            <input type="text" v-model="eventForm.year" required />
          </div>
          <div class="form-group">
            <label>虚岁</label>
            <input type="text" v-model="eventForm.age" required />
          </div>
          <div class="form-group">
            <label>所用年号</label>
            <input type="text" v-model="eventForm.reignYear" required />
          </div>
          <div class="form-group">
            <label>正史关键事迹</label>
            <textarea v-model="eventForm.event" required></textarea>
          </div>
          <div class="form-group">
            <label>正史原文摘要（出处）</label>
            <textarea v-model="eventForm.source" required></textarea>
          </div>
          <div class="form-group">
            <label>顺序</label>
            <input type="number" v-model.number="eventForm.order" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddEventModal = false" class="cancel-btn">
              取消
            </button>
            <button type="submit" class="save-btn">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const persons = ref([]);
const selectedPerson = ref(null);
const selectedPersonTimeline = ref([]);
const searchQuery = ref("");
const showAddPersonModal = ref(false);
const showAddEventModal = ref(false);
const editingPerson = ref(null);
const editingEvent = ref(null);
const personForm = ref({ name: '', dynasty: '' });
const eventForm = ref({ year: '', age: '', reignYear: '', event: '', source: '', order: 0 });

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
    const response = await fetch('http://localhost:3000/characters');
    const data = await response.json();
    persons.value = data;
  } catch (error) {
    console.error('获取人物列表失败:', error);
  }
};

// 获取人物时间线
const fetchPersonTimeline = async (personId) => {
  try {
    const response = await fetch(`http://localhost:3000/characters/${personId}/timeline`);
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
};

// 打开添加人物弹窗
const addPerson = () => {
  editingPerson.value = null;
  personForm.value = { name: '', dynasty: '' };
  showAddPersonModal.value = true;
};

// 打开编辑人物弹窗
const editPerson = (person) => {
  editingPerson.value = person;
  personForm.value = { name: person.name, dynasty: person.dynasty };
  showAddPersonModal.value = true;
};

// 保存人物
const savePerson = async () => {
  try {
    if (editingPerson.value) {
      // 更新人物
      await fetch(`http://localhost:3000/characters/${editingPerson.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personForm.value),
      });
    } else {
      // 添加人物
      await fetch('http://localhost:3000/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personForm.value),
      });
    }
    await fetchPersons();
    showAddPersonModal.value = false;
  } catch (error) {
    console.error('保存人物失败:', error);
  }
};

// 删除人物
const deletePerson = async (personId) => {
  if (confirm('确定要删除这个人物吗？')) {
    try {
      await fetch(`http://localhost:3000/characters/${personId}`, {
        method: 'DELETE',
      });
      await fetchPersons();
      if (selectedPerson.value && selectedPerson.value.id === personId) {
        selectedPerson.value = null;
        selectedPersonTimeline.value = [];
      }
    } catch (error) {
      console.error('删除人物失败:', error);
    }
  }
};

// 打开添加事件弹窗
const addEvent = () => {
  editingEvent.value = null;
  eventForm.value = { year: '', age: '', reignYear: '', event: '', source: '', order: selectedPersonTimeline.value.length };
  showAddEventModal.value = true;
};

// 打开编辑事件弹窗
const editEvent = (event) => {
  editingEvent.value = event;
  eventForm.value = { ...event };
  showAddEventModal.value = true;
};

// 保存事件
const saveEvent = async () => {
  try {
    if (editingEvent.value) {
      // 更新事件
      await fetch(`http://localhost:3000/characters/timeline/${editingEvent.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm.value),
      });
    } else {
      // 添加事件
      await fetch(`http://localhost:3000/characters/${selectedPerson.value.id}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm.value),
      });
    }
    await fetchPersonTimeline(selectedPerson.value.id);
    showAddEventModal.value = false;
  } catch (error) {
    console.error('保存事件失败:', error);
  }
};

// 删除事件
const deleteEvent = async (eventId) => {
  if (confirm('确定要删除这个事件吗？')) {
    try {
      await fetch(`http://localhost:3000/characters/timeline/${eventId}`, {
        method: 'DELETE',
      });
      await fetchPersonTimeline(selectedPerson.value.id);
    } catch (error) {
      console.error('删除事件失败:', error);
    }
  }
};

// 更新事件顺序
const updateEventOrder = async (event) => {
  try {
    await fetch(`http://localhost:3000/characters/timeline/${event.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: event.order }),
    });
    await fetchPersonTimeline(selectedPerson.value.id);
  } catch (error) {
    console.error('更新事件顺序失败:', error);
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
  alert("表格已复制到剪贴板，可直接粘贴到微信公众号");
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

.copy-btn, .add-event-btn {
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
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #d4af37;
  font-size: 1rem;
  font-family: "Noto Serif SC", serif;
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
