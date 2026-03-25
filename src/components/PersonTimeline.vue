<template>
  <div class="person-timeline">
    <h2 class="section-title">人物正史记载年份表</h2>
    
    <!-- 搜索框 -->
    <div class="search-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="搜索人物..." 
        class="search-input"
      />
    </div>
    
    <!-- 人物列表 -->
    <div class="person-list">
      <div 
        v-for="person in filteredPersons" 
        :key="person.id" 
        class="person-item" 
        @click="selectPerson(person)"
      >
        {{ person.name }}
      </div>
    </div>
    
    <!-- 人物详细信息 -->
    <div v-if="selectedPerson" class="person-details">
      <h3 class="person-name">{{ selectedPerson.name }}</h3>
      <div class="timeline-table">
        <table>
          <thead>
            <tr>
              <th>公元年份</th>
              <th>{{ selectedPerson.name }}虚岁</th>
              <th>所用年号</th>
              <th>正史关键事迹</th>
              <th>正史原文摘要（出处）</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(event, index) in selectedPerson.timeline" :key="index">
              <td>{{ event.year }}</td>
              <td>{{ event.age }}</td>
              <td>{{ event.reignYear }}</td>
              <td>{{ event.event }}</td>
              <td>{{ event.source }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="close-btn" @click="selectedPerson = null">关闭</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 人物数据
const persons = ref([
  {
    id: 1,
    name: "李渊",
    timeline: [
      {
        year: "566",
        age: "1岁",
        reignYear: "北周天和元年",
        event: "出生于长安，出身关陇贵族，为西魏八柱国之一李昞之子，母为独孤氏（隋文帝独孤皇后亲姐）",
        source: "《旧唐书·高祖纪》：周天和元年，生于长安"
      },
      {
        year: "573",
        age: "8岁",
        reignYear: "北周宣政元年",
        event: "父亲李昞去世，袭封唐国公，自幼丧父，由姨母独孤皇后抚育，与隋文帝、隋炀帝关系亲近",
        source: "《旧唐书·高祖纪》：皇考崩，时年七岁，袭封唐国公（古籍虚岁差异，正史载七岁袭爵）"
      },
      {
        year: "581",
        age: "16岁",
        reignYear: "隋开皇元年",
        event: "隋文帝代周建隋，李渊因外戚身份受重用，授千牛备身，负责皇宫宿卫，步入仕途",
        source: "《旧唐书·高祖纪》：文帝受禅，补千牛备身，见亲待"
      },
      {
        year: "586-604",
        age: "21-39岁",
        reignYear: "隋开皇、仁寿年间",
        event: "历任谯州、陇州、岐州刺史，外任地方，积累治理经验，为官沉稳，深得地方民心",
        source: "《旧唐书·高祖纪》：累转谯、陇、岐三州刺史"
      },
      {
        year: "605",
        age: "40岁",
        reignYear: "隋大业元年",
        event: "隋炀帝即位，调任荥阳、楼烦二郡太守，后征入朝任殿内少监，仕途平稳，避炀帝猜忌",
        source: "《旧唐书·高祖纪》：炀帝即位，转荥阳、楼烦二郡太守，征为殿内少监"
      },
      {
        year: "613",
        age: "48岁",
        reignYear: "隋大业九年",
        event: "杨玄感叛乱，李渊奉命镇守弘化郡，兼知关右诸军事，开始掌握兵权，暗中结交豪杰，收拢人心",
        source: "《资治通鉴》：玄感反，诏高祖驰驿镇弘化郡，兼知关右诸军事"
      },
      {
        year: "615",
        age: "50岁",
        reignYear: "隋大业十一年",
        event: "任山西河东慰抚大使，奉命镇压当地农民起义，击败母端儿、柴保昌等部，收编降兵，扩充实力",
        source: "《旧唐书·高祖纪》：拜山西河东慰抚大使，击母端儿，破之，降者万余人"
      },
      {
        year: "616",
        age: "51岁",
        reignYear: "隋大业十二年",
        event: "升任太原留守，成为北方重镇最高军政长官，掌控太原粮草、兵马，此地为起兵核心根据地",
        source: "《旧唐书·高祖纪》：十二年，迁太原留守"
      },
      {
        year: "617",
        age: "52岁",
        reignYear: "隋大业十三年",
        event: "五月，于太原起兵反隋，诛杀副留守王威、高君雅；十一月，率军攻破长安，拥立代王杨侑为帝，遥尊炀帝为太上皇，自任大丞相，进封唐王",
        source: "《旧唐书·高祖纪》：五月甲子，高祖及太宗举义兵；十一月丙辰，攻拔京城；迎代王侑即帝位，尊炀帝为太上皇，自为大丞相，封唐王"
      },
      {
        year: "618",
        age: "53岁",
        reignYear: "隋义宁二年/唐武德元年",
        event: "三月，江都兵变，隋炀帝被杀；五月，逼迫杨侑禅位，正式称帝，建立唐朝，定都长安，改元武德，立李建成为皇太子",
        source: "《旧唐书·高祖纪》：五月戊午，废隋帝侑为酅国公，高祖即皇帝位于太极殿，改隋义宁二年为唐武德元年"
      },
      {
        year: "619",
        age: "54岁",
        reignYear: "唐武德二年",
        event: "颁布武德律，推行均田制、租庸调制，稳定内政；命李世民等率军征讨各地割据势力，逐步统一全国",
        source: "《旧唐书·高祖纪》：颁新格；定均田、租庸调法"
      },
      {
        year: "621",
        age: "56岁",
        reignYear: "唐武德四年",
        event: "李世民率军平定王世充、窦建德两大割据势力，北方基本平定，唐朝统一大势已定",
        source: "《资治通鉴》：秦王世民俘王世充、窦建德以献，天下大定"
      },
      {
        year: "624",
        age: "59岁",
        reignYear: "唐武德七年",
        event: "平定江南辅公祏叛乱，全国基本统一；颁布《武德律》《唐六典》雏形，完善唐朝典章制度",
        source: "《旧唐书·高祖纪》：七年，辅公祏伏诛，江南悉平"
      },
      {
        year: "626",
        age: "61岁",
        reignYear: "唐武德九年",
        event: "六月，玄武门之变爆发，李世民诛杀李建成、李元吉；八月，被迫禅位于李世民，自称太上皇，退居大安宫",
        source: "《旧唐书·高祖纪》：六月庚申，秦王以皇太子建成、齐王元吉作乱，率兵诛之；八月癸亥，诏传位于皇太子，尊为太上皇"
      },
      {
        year: "635",
        age: "70岁",
        reignYear: "唐贞观九年",
        event: "五月，病逝于长安大安宫，享年七十岁，庙号高祖，葬于献陵，谥号太武皇帝",
        source: "《旧唐书·高祖纪》：贞观九年五月庚子，崩于大安宫之垂拱前殿，年七十，庙号高祖，葬献陵"
      }
    ]
  }
]);

const searchQuery = ref('');
const selectedPerson = ref(null);

// 过滤人物列表
const filteredPersons = computed(() => {
  if (!searchQuery.value) {
    return persons.value;
  }
  return persons.value.filter(person => 
    person.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 选择人物
const selectPerson = (person) => {
  selectedPerson.value = person;
};
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
  margin-bottom: 2rem;
  color: #2c1810;
  font-family: 'Noto Serif SC', serif;
  font-size: 1.8rem;
}

.search-container {
  margin-bottom: 1.5rem;
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

.person-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.person-item {
  padding: 1rem;
  background-color: white;
  border: 1px solid #d4af37;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Noto Serif SC', serif;
  color: #2c1810;
}

.person-item:hover {
  background-color: #d4af37;
  color: #2c1810;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.person-details {
  margin-top: 2rem;
  padding: 2rem;
  background-color: white;
  border: 1px solid #d4af37;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.person-name {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #2c1810;
  font-family: 'Noto Serif SC', serif;
  font-size: 1.5rem;
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
  font-family: 'Noto Serif SC', serif;
}

.timeline-table tr:hover {
  background-color: #f9f5f0;
}

.close-btn {
  display: block;
  margin: 2rem auto 0;
  padding: 0.8rem 2rem;
  background-color: #2c1810;
  color: #d4af37;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Noto Serif SC', serif;
}

.close-btn:hover {
  background-color: #d4af37;
  color: #2c1810;
}

@media (max-width: 768px) {
  .person-timeline {
    padding: 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .person-list {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .person-details {
    padding: 1rem;
  }
  
  .timeline-table th,
  .timeline-table td {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}
</style>