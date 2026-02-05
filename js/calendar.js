(function () {
    function isHomePage() {
        const p = window.location.pathname;
        return (
          p === "/" ||
          p === "/index.html" ||
          p === "/blogs_hexo/" ||
          p === "/blogs_hexo/index.html"
        );
      }
      
  
    function dayOfYear(d) {
      const start = new Date(d.getFullYear(), 0, 0);
      return Math.floor((d - start) / 86400000);
    }
  
    function weekOfYear(d) {
      const t = new Date(d);
      t.setHours(0, 0, 0, 0);
      t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7));
      const week1 = new Date(t.getFullYear(), 0, 4);
      return (
        1 +
        Math.round(
          ((t - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
        )
      );
    }
  
    // 农历（浏览器支持的情况下很稳：zh-u-ca-chinese）
    function lunarText(d) {
      try {
        const fmt = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        return fmt.format(d).replace(/\s/g, "");
      } catch (e) {
        return "农历信息不可用";
      }
    }
  
    function ensureCalendarCard() {
      const aside = document.querySelector("#aside-content");
      if (!aside) return null;
  
      // 已经插入过就直接用
      let card = document.getElementById("card-calendar");
      if (card) return card;
  
      // 找公告栏，插到它后面；没有公告栏就插到侧栏顶部
      const anchor = aside.querySelector(".card-announcement");
      const wrap = document.createElement("div");
      wrap.className = "card-widget wow animate__zoomIn";
      wrap.id = "card-calendar";
      wrap.setAttribute("data-wow-duration", "2s");
      wrap.setAttribute("data-wow-delay", "200ms");
      wrap.setAttribute("data-wow-offset", "30");
      wrap.setAttribute("data-wow-iteration", "1");
  
      wrap.innerHTML = `
        <div id="calendar-area-left">
          <div id="calendar-week"></div>
          <div id="calendar-date"></div>
          <div id="calendar-solar"></div>
          <div id="calendar-lunar"></div>
        </div>
        <div id="calendar-area-right">
          <div id="calendar-main"></div>
        </div>
      `;
  
      if (anchor && anchor.nextSibling) {
        anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
      } else if (anchor) {
        anchor.parentNode.appendChild(wrap);
      } else {
        aside.insertBefore(wrap, aside.firstChild);
      }
  
      return wrap;
    }
  
    function renderCalendar(retry = 0) {
        if (!isHomePage()) return;
      
        const aside = document.querySelector("#aside-content");
        if (!aside) {
          if (retry < 20) setTimeout(() => renderCalendar(retry + 1), 150);
          return;
        }
      const card = ensureCalendarCard();
      if (!card) return;
  
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth(); // 0-11
      const date = now.getDate();
  
      const weekNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  
      const weekEl = card.querySelector("#calendar-week");
      const dateEl = card.querySelector("#calendar-date");
      const solarEl = card.querySelector("#calendar-solar");
      const lunarEl = card.querySelector("#calendar-lunar");
      const mainEl = card.querySelector("#calendar-main");
  
      if (!weekEl || !dateEl || !solarEl || !lunarEl || !mainEl) return;
  
      weekEl.innerHTML = `${String(y).slice(2)}年${m + 1}月&nbsp;${weekNames[now.getDay()]}`;
      dateEl.textContent = String(date).padStart(2, "0");
      solarEl.innerHTML = `第${weekOfYear(now)}周&nbsp;第${dayOfYear(now)}天`;
      lunarEl.textContent = lunarText(now);
  
      // 生成当月格子
      const first = new Date(y, m, 1);
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const startDay = first.getDay(); // 0(日) - 6(六)
  
      const cells = [];
      for (let i = 0; i < startDay; i++) cells.push("");
      for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  
      // 补齐到 28/35/42 格
      while (cells.length % 7 !== 0) cells.push("");
  
      const rows = Math.ceil(cells.length / 7);
      let html = "";
      for (let r = 0; r < rows; r++) {
        html += `<div class="calendar-r${r}">`;
        for (let c = 0; c < 7; c++) {
          const val = cells[r * 7 + c];
          const isNow = val === date ? "now" : "";
          html += `<div class="calendar-d${c}"><a class="${isNow}">${val || ""}</a></div>`;
        }
        html += `</div>`;
      }
      mainEl.innerHTML = html;
    }
  
    // 首次加载 + PJAX
    window.addEventListener("load", renderCalendar);
    document.addEventListener("pjax:complete", renderCalendar);
  })();
  