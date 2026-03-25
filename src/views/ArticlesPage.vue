<template>
  <div class="articles-page">
    <div class="container">
      <h2 class="page-title">公众号文章</h2>
      <p class="page-description">戚景山</p>

      <div class="articles-list">
        <div
          v-for="article in articles"
          :key="article.id"
          class="article-card"
          @click="openArticle(article.link)"
        >
          <div class="article-header">
            <h3 class="article-title">{{ article.title }}</h3>
            <span class="article-date">{{ article.date }}</span>
          </div>
          <p class="article-excerpt">{{ article.excerpt }}</p>
          <div class="article-footer">
            <span class="article-source">{{ article.source }}</span>
            <span class="article-read-more">阅读更多 →</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const articles = ref([
  {
    id: 1,
    title: "隋末风云 | 李密：半生王侯梦，一朝落尘埃",
    date: "2026-03-24",
    excerpt:
      "他出身名门望族，智冠当世、胸藏天下。献策倾覆大隋，号令百万瓦岗，雄踞中原，威慑两京。离江山只差一步，却骤兴骤亡、身死荒野。他是隋末乱世最耀眼、也最悲情的枭雄。",
    source: "隋朝末年",
    link: "https://mp.weixin.qq.com/s/cGX3j5A5LwQnY0ZKjLplEw",
  },
  {
    id: 2,
    title: "隋末风云 | 李渊：隐忍半生，一朝定天下",
    date: "2026-03-24",
    excerpt:
      "他出身顶级关陇门阀，历周、隋两朝。半生低调蛰伏，躲过炀帝猜忌；一朝太原起兵，百日入主长安，代隋立唐，开启近三百年大唐盛世。他是被低估的开国帝王。",
    source: "隋朝末年",
    link: "https://mp.weixin.qq.com/s/IHssJJSrQEip_OI5UtxwoQ",
  },
  {
    id: 3,
    title: "隋末风云 | 李世民：从太原公子到千古一帝",
    date: "2026-03-25",
    excerpt:
      "他出身关陇贵胄，少年从军，百战百胜。十八岁起兵，二十岁扫平群雄，二十九岁登基，开创贞观之治。他不仅是战无不胜的军事天才，更是开创盛世的千古一帝。",
    source: "隋朝末年",
    link: "https://mp.weixin.qq.com/s/lqTqgVNWVs27Z8iW22Pv6Q",
  },
]);

const openArticle = (link) => {
  if (link && link !== "#") {
    window.open(link, "_blank");
  } else {
    alert("文章链接暂未提供");
  }
};
</script>

<style scoped>
.articles-page {
  padding: 2rem 0;
  background-color: #f5f0e6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-title {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #2c1810;
  font-family: "Noto Serif SC", serif;
  font-size: 2rem;
}

.page-description {
  text-align: center;
  margin-bottom: 2rem;
  color: #666;
  font-size: 1.1rem;
}

.articles-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.article-card {
  background-color: white;
  border: 1px solid #d4af37;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.article-header {
  margin-bottom: 1rem;
}

.article-title {
  margin: 0 0 0.5rem 0;
  color: #2c1810;
  font-family: "Noto Serif SC", serif;
  font-size: 1.2rem;
  line-height: 1.4;
}

.article-date {
  font-size: 0.9rem;
  color: #999;
}

.article-excerpt {
  margin-bottom: 1rem;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #999;
}

.article-source {
  font-weight: 500;
}

.article-read-more {
  color: #d4af37;
  transition: color 0.3s ease;
}

.article-card:hover .article-read-more {
  color: #b89220;
}

@media (max-width: 768px) {
  .articles-list {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .article-card {
    padding: 1.2rem;
  }
}
</style>
