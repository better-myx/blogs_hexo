/* footer runtime timer (2 lines: site runtime + voyager distance) */
(function () {
  const SITE_START = new Date("08/09/2025 00:00:00"); // 你的建站时间（改这里）

  // 旅行者 1 号：从这个时间开始按速度累计（你给的教程逻辑）
  const VOYAGER_START = new Date("01/01/2025 00:00:00");
  const VOYAGER_BASE_KM = 24685400000; // 基础距离（km）
  const VOYAGER_SPEED_KM_S = 17;       // 速度（km/s）
  const AU_KM = 149600000;             // 1 AU = 149,600,000 km

  let timer = null;

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function render() {
    const el = document.getElementById("workboard");
    if (!el) return;

    const now = new Date();

    // 站点运行时间
    const diff = now - SITE_START;
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    const hours = Math.floor(diff / 1000 / 60 / 60 - 24 * days);
    const minutes = Math.floor(diff / 1000 / 60 - 1440 * days - 60 * hours);
    const seconds = Math.floor(diff / 1000 - 86400 * days - 3600 * hours - 60 * minutes);

    // 旅行者 1 号距离
    const voyagerSeconds = Math.floor((now - VOYAGER_START) / 1000);
    const disKm = Math.trunc(VOYAGER_BASE_KM + voyagerSeconds * VOYAGER_SPEED_KM_S);
    const au = (disKm / AU_KM).toFixed(6);

    el.innerHTML = `
      <div class="runtime-text">
        <div>本站居然运行了 ${days} 天 ${pad2(hours)} 小时 ${pad2(minutes)} 分 ${pad2(seconds)} 秒 <span id="heartbeat">❤</span></div>
        <div>旅行者 1 号当前距离地球 ${disKm} 千米，约为 ${au} 个天文单位 🚀</div>
      </div>
    `;
  }

  function startWhenReady() {
    if (timer) clearInterval(timer);

    let tries = 0;
    const waiter = setInterval(() => {
      tries++;
      if (document.getElementById("workboard")) {
        clearInterval(waiter);
        render();
        timer = setInterval(render, 1000);
      }
      if (tries >= 50) clearInterval(waiter);
    }, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startWhenReady);
  } else {
    startWhenReady();
  }
  document.addEventListener("pjax:complete", startWhenReady);
})();
