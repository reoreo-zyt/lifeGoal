import i18next from "i18next";
import "./style.css";
import "./language/i18n";

const languages = [
  "ca",
  "da",
  "de",
  "en", // 英文
  "es-419",
  "es-ES",
  "fr",
  "he",
  "it",
  "ja",
  "ko",
  "nb-NO",
  "pt-BR",
  "ro",
  "ru",
  "th",
  "tl",
  "tr",
  "zh-Hans", // 中文
  "zh-Hant",
];

let innerHTML = `<div>${i18next.t("menu:loadingAsset", {
  assetName: "111",
})}</div>`;

for (let i = 0; i < languages.length; i++) {
  innerHTML += `<button id="test${i + 1}">切换${languages[i]}</button>`;
}

document.querySelector<HTMLDivElement>("#app")!.innerHTML = innerHTML;

for (let i = 0; i < languages.length; i++) {
  document
    .getElementById(`test${i + 1}`)
    .addEventListener("click", function () {
      i18next.changeLanguage(languages[i]);
      location.reload();
    });
}
