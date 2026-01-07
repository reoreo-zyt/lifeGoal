import "./style.css";
import mojsFunc from "../lib/example";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div id="test" style="font-size: 40px;font-family: Arial, sans-serif;font-weight: 800;">Nebula Play</div>
  </div>
`;

window.addEventListener("load", () => {
  console.log("页面及其所有依赖资源完全加载完成");
  mojsFunc(2);
});
