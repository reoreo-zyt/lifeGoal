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
import { ref, computed } from "vue";

// 人物数据
const persons = ref([
  {
    id: 1,
    name: "李密",
    timeline: [
      {
        year: "582",
        age: "1岁",
        reignYear: "隋・开皇二年",
        event: "生于长安，关陇世家，祖、父皆国公，门第显赫",
        source: "《旧唐书》：密，世为豪门，父宽，隋蒲山公。"
      },
      {
        year: "604",
        age: "23岁",
        reignYear: "隋・仁寿四年",
        event: "荫补入仕，任宫廷宿卫；气质不凡，炀帝忌惮，遂弃官苦读",
        source: "《旧唐书》：密以父荫为亲侍，后谢役，专精读书。"
      },
      {
        year: "613",
        age: "32岁",
        reignYear: "隋・大业九年",
        event: "投奔杨玄感，为第一谋主。献上中下三策，玄感弃上策而败",
        source: "《隋书》：密劝玄感：入蓟绝援为上，据关中为中，攻洛阳为下。"
      },
      {
        year: "614",
        age: "33岁",
        reignYear: "隋・大业十年",
        event: "杨玄感兵败身死，李密被俘，途中冒险越狱，亡命江湖",
        source: "《旧唐书》：玄感败，密被执，中路脱身，流离草野。"
      },
      {
        year: "616",
        age: "35岁",
        reignYear: "隋・大业十二年",
        event: "穷途投瓦岗，依附翟让，以智略收服人心，崭露头角",
        source: "《资治通鉴》：密往依翟让，让奇其才，渐委兵柄。"
      },
      {
        year: "617",
        age: "36岁",
        reignYear: "隋・大业十三年",
        event: "破荥阳、斩张须陀；夺洛口仓、开仓赈民，聚众百万，声势滔天",
        source: "《旧唐书》：密袭兴洛仓，恣民取食，归者如流。"
      },
      {
        year: "617",
        age: "36岁",
        reignYear: "隋・大业十三年",
        event: "取代翟让，自立魏公，建政权、设百官；传檄天下，列炀帝十大罪",
        source: "《旧唐书》：立密为魏公，置幕府，移檄郡县，声震四海。"
      },
      {
        year: "618",
        age: "37岁",
        reignYear: "隋・大业十四年",
        event: "久战洛阳，兵疲财竭；猜忌加深，诛杀翟让，瓦岗内部离心",
        source: "《资治通鉴》：密诛翟让，麾下将士始生离贰。"
      },
      {
        year: "618",
        age: "37岁",
        reignYear: "唐・武德元年",
        event: "邙山惨败，主力溃散，无路可走，率众入关投降李渊",
        source: "《旧唐书》：邙山大败，众散，密奔归于唐。"
      },
      {
        year: "619",
        age: "38岁",
        reignYear: "唐・武德二年",
        event: "嫌唐礼遇微薄，心生怨望，谋叛出关；于熊耳山遭伏，兵败被杀",
        source: "《旧唐书》：密谋叛，行军总管盛彦师邀击，斩之。"
      }
    ],
  },
  {
    id: 2,
    name: "李渊",
    timeline: [
      {
        year: "566",
        age: "1岁",
        reignYear: "北周天和元年",
        event:
          "出生于长安，出身关陇贵族，为西魏八柱国之一李昞之子，母为独孤氏（隋文帝独孤皇后亲姐）",
        source: "《旧唐书·高祖纪》：周天和元年，生于长安",
      },
      {
        year: "573",
        age: "8岁",
        reignYear: "北周宣政元年",
        event:
          "父亲李昞去世，袭封唐国公，自幼丧父，由姨母独孤皇后抚育，与隋文帝、隋炀帝关系亲近",
        source:
          "《旧唐书·高祖纪》：皇考崩，时年七岁，袭封唐国公（古籍虚岁差异，正史载七岁袭爵）",
      },
      {
        year: "581",
        age: "16岁",
        reignYear: "隋开皇元年",
        event:
          "隋文帝代周建隋，李渊因外戚身份受重用，授千牛备身，负责皇宫宿卫，步入仕途",
        source: "《旧唐书·高祖纪》：文帝受禅，补千牛备身，见亲待",
      },
      {
        year: "586-604",
        age: "21-39岁",
        reignYear: "隋开皇、仁寿年间",
        event:
          "历任谯州、陇州、岐州刺史，外任地方，积累治理经验，为官沉稳，深得地方民心",
        source: "《旧唐书·高祖纪》：累转谯、陇、岐三州刺史",
      },
      {
        year: "605",
        age: "40岁",
        reignYear: "隋大业元年",
        event:
          "隋炀帝即位，调任荥阳、楼烦二郡太守，后征入朝任殿内少监，仕途平稳，避炀帝猜忌",
        source:
          "《旧唐书·高祖纪》：炀帝即位，转荥阳、楼烦二郡太守，征为殿内少监",
      },
      {
        year: "613",
        age: "48岁",
        reignYear: "隋大业九年",
        event:
          "杨玄感叛乱，李渊奉命镇守弘化郡，兼知关右诸军事，开始掌握兵权，暗中结交豪杰，收拢人心",
        source: "《资治通鉴》：玄感反，诏高祖驰驿镇弘化郡，兼知关右诸军事",
      },
      {
        year: "615",
        age: "50岁",
        reignYear: "隋大业十一年",
        event:
          "任山西河东慰抚大使，奉命镇压当地农民起义，击败母端儿、柴保昌等部，收编降兵，扩充实力",
        source:
          "《旧唐书·高祖纪》：拜山西河东慰抚大使，击母端儿，破之，降者万余人",
      },
      {
        year: "616",
        age: "51岁",
        reignYear: "隋大业十二年",
        event:
          "升任太原留守，成为北方重镇最高军政长官，掌控太原粮草、兵马，此地为起兵核心根据地",
        source: "《旧唐书·高祖纪》：十二年，迁太原留守",
      },
      {
        year: "617",
        age: "52岁",
        reignYear: "隋大业十三年",
        event:
          "五月，于太原起兵反隋，诛杀副留守王威、高君雅；十一月，率军攻破长安，拥立代王杨侑为帝，遥尊炀帝为太上皇，自任大丞相，进封唐王",
        source:
          "《旧唐书·高祖纪》：五月甲子，高祖及太宗举义兵；十一月丙辰，攻拔京城；迎代王侑即帝位，尊炀帝为太上皇，自为大丞相，封唐王",
      },
      {
        year: "618",
        age: "53岁",
        reignYear: "隋义宁二年/唐武德元年",
        event:
          "三月，江都兵变，隋炀帝被杀；五月，逼迫杨侑禅位，正式称帝，建立唐朝，定都长安，改元武德，立李建成为皇太子",
        source:
          "《旧唐书·高祖纪》：五月戊午，废隋帝侑为酅国公，高祖即皇帝位于太极殿，改隋义宁二年为唐武德元年",
      },
      {
        year: "619",
        age: "54岁",
        reignYear: "唐武德二年",
        event:
          "颁布武德律，推行均田制、租庸调制，稳定内政；命李世民等率军征讨各地割据势力，逐步统一全国",
        source: "《旧唐书·高祖纪》：颁新格；定均田、租庸调法",
      },
      {
        year: "621",
        age: "56岁",
        reignYear: "唐武德四年",
        event:
          "李世民率军平定王世充、窦建德两大割据势力，北方基本平定，唐朝统一大势已定",
        source: "《资治通鉴》：秦王世民俘王世充、窦建德以献，天下大定",
      },
      {
        year: "624",
        age: "59岁",
        reignYear: "唐武德七年",
        event:
          "平定江南辅公祏叛乱，全国基本统一；颁布《武德律》《唐六典》雏形，完善唐朝典章制度",
        source: "《旧唐书·高祖纪》：七年，辅公祏伏诛，江南悉平",
      },
      {
        year: "626",
        age: "61岁",
        reignYear: "唐武德九年",
        event:
          "六月，玄武门之变爆发，李世民诛杀李建成、李元吉；八月，被迫禅位于李世民，自称太上皇，退居大安宫",
        source:
          "《旧唐书·高祖纪》：六月庚申，秦王以皇太子建成、齐王元吉作乱，率兵诛之；八月癸亥，诏传位于皇太子，尊为太上皇",
      },
      {
        year: "635",
        age: "70岁",
        reignYear: "唐贞观九年",
        event:
          "五月，病逝于长安大安宫，享年七十岁，庙号高祖，葬于献陵，谥号太武皇帝",
        source:
          "《旧唐书·高祖纪》：贞观九年五月庚子，崩于大安宫之垂拱前殿，年七十，庙号高祖，葬献陵",
      },
    ],
  },
  {
    id: 3,
    name: "李世民",
    timeline: [
      {
        year: "598",
        age: "1岁",
        reignYear: "隋开皇十八年",
        event: "生于武功之别馆，李渊次子，母窦氏",
        source: "《旧唐书・太宗纪》：隋开皇十八年十二月，生于武功之别馆。"
      },
      {
        year: "615",
        age: "18岁",
        reignYear: "隋大业十一年",
        event: "应募从军，赴雁门勤王，解救被围隋炀帝，初露军事才干",
        source: "《资治通鉴》：世民应募，隶云定兴，献策多张旗鼓，疑突厥兵。"
      },
      {
        year: "616",
        age: "19岁",
        reignYear: "隋大业十二年",
        event: "随父至太原，结交豪杰，暗募死士，为主谋起兵",
        source: "《旧唐书》：时隋祚已终，太宗潜图义举，每折节下士。"
      },
      {
        year: "617",
        age: "20岁",
        reignYear: "隋大业十三年",
        event: "力劝李渊太原起兵；率兵克西河、破霍邑、渡黄河、先入长安，战功第一",
        source: "《旧唐书》：五月，高祖起义太原，太宗引兵先入西河，平之。"
      },
      {
        year: "618",
        age: "21岁",
        reignYear: "唐武德元年",
        event: "唐朝建立，封秦王；击薛仁杲，平定陇西，首灭强敌",
        source: "《旧唐书》：武德元年，进封秦王，大破薛仁杲，陇右平。"
      },
      {
        year: "619",
        age: "22岁",
        reignYear: "唐武德二年",
        event: "刘武周南下侵唐，关中震动，太宗率军东进抵御",
        source: "《资治通鉴》：刘武周陷晋阳，秦王世民帅兵拒之。"
      },
      {
        year: "620",
        age: "23岁",
        reignYear: "唐武德三年",
        event: "柏壁之战，大破刘武周、宋金刚，收复并州全境",
        source: "《旧唐书》：太宗大破宋金刚，刘武周奔突厥，河东悉定。"
      },
      {
        year: "621",
        age: "24岁",
        reignYear: "唐武德四年",
        event: "一战擒两王：灭王世充、擒窦建德，平定中原；加号 天策上将，位在王公之上",
        source: "《旧唐书》：世民平洛阳，擒建德、降世充。诏授天策上将。"
      },
      {
        year: "622",
        age: "25岁",
        reignYear: "唐武德五年",
        event: "击破刘黑闼，平定河北；开文学馆，延揽十八学士，收揽文臣人心",
        source: "《旧唐书》：置文学馆，以待四方之士，号十八学士。"
      },
      {
        year: "624",
        age: "27岁",
        reignYear: "唐武德七年",
        event: "辅公祏平定，天下一统；兄弟储位之争白热化",
        source: "《新唐书》：江南平，海内一统。"
      },
      {
        year: "626",
        age: "29岁",
        reignYear: "唐武德九年",
        event: "发动 玄武门之变，诛李建成、李元吉；旋即被立皇太子，八月受禅即位",
        source: "《旧唐书》：六月庚申，秦王诛建成、元吉；八月癸亥，即皇帝位。"
      },
      {
        year: "627",
        age: "30岁",
        reignYear: "贞观元年",
        event: "改元贞观；精简官制，省并州县，力行节俭，首倡吏治清明",
        source: "《旧唐书》：改元贞观，务从简约，轻徭薄赋。"
      },
      {
        year: "628",
        age: "31岁",
        reignYear: "贞观二年",
        event: "放宫女、抑奢靡；旱灾亲恤，以民为本",
        source: "《资治通鉴》：上谓侍臣，民者国之本也。"
      },
      {
        year: "630",
        age: "33岁",
        reignYear: "贞观四年",
        event: "灭东突厥，擒颉利可汗；西域、诸族尊为 天可汗",
        source: "《旧唐书》：大破突厥，俘颉利，四夷君长，请上为天可汗。"
      },
      {
        year: "634",
        age: "37岁",
        reignYear: "贞观八年",
        event: "分道巡察天下，完善法制，贞观之治走向鼎盛",
        source: "《新唐书》：遣使分行天下，察吏治，申冤狱。"
      },
      {
        year: "635",
        age: "38岁",
        reignYear: "贞观九年",
        event: "高祖李渊驾崩；平定吐谷浑，稳固西北",
        source: "《旧唐书》：贞观九年，高祖崩；李靖破吐谷浑。"
      },
      {
        year: "640",
        age: "43岁",
        reignYear: "贞观十四年",
        event: "灭高昌，置安西都护府，控制西域要道",
        source: "《旧唐书》：平高昌，以其地为西州，置安西都护。"
      },
      {
        year: "641",
        age: "44岁",
        reignYear: "贞观十五年",
        event: "文成公主入藏和亲，唐蕃和好",
        source: "《资治通鉴》：以文成公主妻吐蕃松赞干布。"
      },
      {
        year: "643",
        age: "46岁",
        reignYear: "贞观十七年",
        event: "图画 凌烟阁二十四功臣；太子李承乾谋反被废，立李治为太子",
        source: "《旧唐书》：图功臣于凌烟阁；承乾废，立晋王为皇太子。"
      },
      {
        year: "645",
        age: "48岁",
        reignYear: "贞观十九年",
        event: "亲征高句丽，破城颇多，因天时班师，未竟全功",
        source: "《旧唐书》：车驾东征高丽，攻取数城，值寒潦，乃班师。"
      },
      {
        year: "646",
        age: "49岁",
        reignYear: "贞观二十年",
        event: "平定薛延陀，北疆彻底安定",
        source: "《新唐书》：讨平薛延陀，漠北悉定。"
      },
      {
        year: "649",
        age: "52岁",
        reignYear: "贞观二十三年",
        event: "五月，崩于翠微宫含风殿；庙号太宗，葬昭陵",
        source: "《旧唐书・太宗纪》：贞观二十三年五月，上崩，年五十二。"
      }
    ],
  },
  {
    id: 4,
    name: "窦建德",
    timeline: [
      {
        year: "573",
        age: "1岁",
        reignYear: "隋开皇十三年",
        event: "生于贝州漳南，世代务农，重信义、好侠气，乡里敬重",
        source: "《旧唐书》：建德，贝州漳南人也，世为农，少尚然诺。"
      },
      {
        year: "611",
        age: "39岁",
        reignYear: "隋大业七年",
        event: "炀帝征高句丽，征兵困苦，建德仗义护民，被迫起兵反隋",
        source: "《旧唐书》：大业七年，募人伐辽东，建德不忍，遂聚众起义。"
      },
      {
        year: "612–614",
        age: "40–42岁",
        reignYear: "隋大业中",
        event: "收拢流民，军纪严明，不掠百姓，势力迅速壮大于河北",
        source: "《资治通鉴》：建德每破城，一无所掠，士卒乐为之用。"
      },
      {
        year: "616",
        age: "44岁",
        reignYear: "隋大业十二年",
        event: "击杀隋将郭绚，声势大振，成为河北最强义军领袖",
        source: "《旧唐书》：袭郭绚，破之，威名日盛。"
      },
      {
        year: "617",
        age: "45岁",
        reignYear: "隋大业十三年",
        event: "于乐寿称王，建立政权，国号夏，善待隋臣，抚定河北全境",
        source: "《旧唐书》：建德定都乐寿，国号大夏，抚循百姓，境内安宁。"
      },
      {
        year: "618",
        age: "46岁",
        reignYear: "唐武德元年",
        event: "击杀宇文化及，为隋报仇，礼遇萧皇后及隋宗室，深得人心",
        source: "《新唐书》：破聊城，斩宇文化及，尊礼隋室。"
      },
      {
        year: "619",
        age: "47岁",
        reignYear: "唐武德二年",
        event: "收服山东州县，与唐、郑三分天下，拥兵数十万，根基稳固",
        source: "《资治通鉴》：河朔之地，尽归于夏。"
      },
      {
        year: "621",
        age: "49岁",
        reignYear: "唐武德四年",
        event: "为救王世充，率大军驰援洛阳，于虎牢关被李世民一战击溃，兵败被俘",
        source: "《旧唐书》：建德驰援洛阳，兵至虎牢，为王世民所破。"
      },
      {
        year: "621",
        age: "49岁",
        reignYear: "唐武德四年",
        event: "押送长安，李渊下令处斩，河北百姓闻之痛哭，民心尽丧",
        source: "《旧唐书》：送至京师，斩于市，河北人情莫不嗟痛。"
      }
    ],
  },
]);

const searchQuery = ref("");
const selectedPerson = ref(null);

// 过滤人物列表
const filteredPersons = computed(() => {
  if (!searchQuery.value) {
    return persons.value;
  }
  return persons.value.filter((person) =>
    person.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
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
  font-family: "Noto Serif SC", serif;
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
  font-family: "Noto Serif SC", serif;
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
  font-family: "Noto Serif SC", serif;
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
  font-family: "Noto Serif SC", serif;
}

.timeline-table tr:hover {
  background-color: #f9f5f0;
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
