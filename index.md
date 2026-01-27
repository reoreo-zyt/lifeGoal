Nebula Play

专注像素艺术、模拟经营、角色扮演

### 产品：凡人修仙

- 像素风格
- 在番茄上连载长篇小说和短篇小说
  - 用 [ai 网站](https://luobi.net/)辅助编写
- 开发 web 端
- 用 godot 开发 steam 游戏

#### 小说

分析下当前修仙小说第一章为何吸引人看：

- 《道心参天》用三个关键设计牢牢抓住读者

1. ‌ 开局“凡人逆袭”的强代入感 ‌
   主角余羡作为孤儿，靠一棵老榆树获得灵根，没有系统外挂或家族背景，这种“寒门逆袭”的设定直接戳中普通人的共鸣点。

2. ‌ 真实感拉满的生存困境 ‌
   从矿洞挖矿到宗门测灵根，余羡的每一步都充满现实感——资源靠捡漏、修行靠算计，这种“接地气”的成长线让读者更容易代入。

3. ‌ 配角与意象的深度刻画 ‌
   配角如冷漠执事、克扣资源的监工，甚至路边卖假药的老修士，都鲜活得像现实社会中的人物。而“榆树娘”这一设定，更通过树的死亡与重生，暗喻修仙路上“初心”的消磨与坚守，比堆砌法宝灵兽更有深意。

#### web 端

版本：

- nodejs v20.18.1
- mysql v8.4.3

注意 mysql 本地连接

`web-frontend`

前端：

前端用 vite ts 实现

- 实现多语言切换 `@/demo/vite-ts-i18next`
- 实现动画效果 `@/demo/vite-ts-mojs`
  - [introduction-mo-js](https://css-tricks.com/introduction-mo-js/)
- 主页水墨画 `@/demo/AquaInkGL`
  - [AquaInkGL](https://github.com/WishMelz/AquaInkGL)
- 参考 `shuimo-ui` 写一个自己的组件库
  - [《Vue3 组件库搭建指北：pnpm + monorepo + 代码提交规范+ BEM 环境配置》](https://blog.csdn.net/weixin_30980795/article/details/156947872)
  - [15分钟学会 pnpm monorepo+vue3+vite 搭建组件库并发布到私有仓库（人人都能学会）](https://juejin.cn/post/7212538330829996092?searchId=20260127141409538ABAD580B8C2D32766)

后端：

后端用 nest mysql ts 实现

- 实现登录鉴权 `@/demo/nest-login`
  - [nestjs 入门实战最强篇](https://juejin.cn/post/7434059234760556594?searchId=202601081113378DCD897FC6AC690CCE22)
