<template>
  <div class="ask">
    <h1>春秋AI</h1>
    <p>提问有关正史历史记载的任何问题</p>
    <div class="content">
      <div class="ask-form">
        <textarea 
          v-model="question" 
          placeholder="请输入您的问题..." 
          rows="6"
        ></textarea>
        <button @click="submitQuestion" class="submit-btn">
          提交问题
        </button>
      </div>
      <div class="faq">
        <h2>已问问题</h2>
        <div class="faq-item">
          <h3>春秋时期是什么时候？</h3>
          <p>春秋时期是指公元前770年至公元前476年，共294年。</p>
        </div>
        <div class="faq-item">
          <h3>春秋五霸是谁？</h3>
          <p>春秋五霸一般指齐桓公、晋文公、秦穆公、宋襄公、楚庄王。</p>
        </div>
        <div class="faq-item">
          <h3>孔子生活在春秋时期吗？</h3>
          <p>是的，孔子（公元前551年-公元前479年）生活在春秋末期。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const question = ref('')

const submitQuestion = () => {
  if (question.value.trim()) {
    alert('您的问题已提交：' + question.value)
    question.value = ''
  }
}
</script>

<style scoped>
.ask {
  max-width: 1200px;
  margin: 0 auto;
}

.ask h1 {
  font-size: 36px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.ask > p {
  font-size: 18px;
  color: #7f8c8d;
  margin-bottom: 40px;
}

.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.ask-form {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.ask-form textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.ask-form textarea:focus {
  outline: none;
  border-color: #667eea;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
}

.faq {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.faq h2 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 20px;
}

.faq-item {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-item h3 {
  font-size: 18px;
  color: #667eea;
  margin-bottom: 10px;
}

.faq-item p {
  color: #7f8c8d;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .ask h1 {
    font-size: 28px;
  }

  .ask > p {
    font-size: 16px;
  }

  .content {
    grid-template-columns: 1fr;
  }
}
</style>
