import "./style.css";
import mojsFunc from "../lib/example";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div id="test"></div>
  </div>
`;

window.addEventListener("load", () => {
  console.log("页面及其所有依赖资源完全加载完成");
  mojsFunc(1);
});
