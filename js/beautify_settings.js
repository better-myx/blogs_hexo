// source/js/beautify_settings.js
(() => {
    const LS_KEY = "beautify_settings_v2";
  
    const DEFAULTS = {
      font: "ZhuZiAWan",
      snowfall: true,
      starfield: true,
  
      // ✅ 白天/夜间分别存色
      themeColorLight: "green",
      themeColorDark: "blackgray"
    };
  
    const COLORS = {
      red: "rgb(241, 71, 71)",
      orange: "rgb(241, 162, 71)",
      yellow: "rgb(241, 238, 71)",
      green: "rgb(57, 197, 187)",
      blue: "rgb(102, 204, 255)",
      heoblue: "rgb(66, 90, 239)",
      darkblue: "rgb(97, 100, 159)",
      purple: "rgb(179, 71, 241)",
      pink: "rgb(237, 112, 155)",
      black: "rgb(0, 0, 0)",
      blackgray: "rgb(60, 60, 67)" // ✅ 夜间默认黑灰
    };
  
    const FONT_OPTIONS = [
      { label: "朱字圆体（默认）", value: "ZhuZiAWan" },
      { label: "小石头", value: "XiaoShiTou" },
      { label: "甜甜圈海报", value: "TTQHB" },
      { label: "鼎列珠海", value: "dingliezhuhai" },
      { label: "Heavy", value: "Heavy" },
      { label: "系统默认", value: "" }
    ];
  
    function load() {
      try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(LS_KEY)) || {}) }; }
      catch { return { ...DEFAULTS }; }
    }
    function save(s) { localStorage.setItem(LS_KEY, JSON.stringify(s)); }
  
    function isDark() {
      return document.documentElement.getAttribute("data-theme") === "dark";
    }
  
    function applyFont(fontValue) {
      const sysStack = '-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
      if (!fontValue) {
        document.documentElement.style.setProperty("--global-font", sysStack);
        return;
      }
      document.documentElement.style.setProperty("--global-font", `"${fontValue}", ${sysStack}`);
    }
  
    function applyThemeColor(colorKey) {
      const v = COLORS[colorKey] || COLORS.green;
      document.documentElement.style.setProperty("--theme-color", v);
      document.documentElement.style.setProperty("--btn-bg", v);
      document.documentElement.style.setProperty("--scrollbar-color", v);
    }
  
    // ✅ 按当前日/夜，从 settings 里取色并应用
    function applyThemeColorBySettings(s) {
      const key = isDark()
        ? (s.themeColorDark ?? DEFAULTS.themeColorDark)
        : (s.themeColorLight ?? DEFAULTS.themeColorLight);
      applyThemeColor(key);
    }
  
    function applySnowfall(on) {
      document.documentElement.setAttribute("data-snowfall", on ? "on" : "off");
    }
    function applyStarfield(on) {
      document.documentElement.setAttribute("data-starfield", on ? "on" : "off");
    }
  
    function renderOptionsOnce() {
      window.__beautifyEnsureDOM && window.__beautifyEnsureDOM();
  
      const fontWrap = document.getElementById("bw-fonts");
      const colorWrap = document.getElementById("bw-colors");
      if (!fontWrap || !colorWrap) return;
  
      if (!fontWrap.dataset.rendered) {
        fontWrap.innerHTML = FONT_OPTIONS.map(o => {
          const fam = o.value ? o.value : '-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
          return `<a class="bw-font" data-font="${o.value}" style="font-family:${fam}">${o.label}</a>`;
        }).join("");
        fontWrap.dataset.rendered = "1";
      }
  
      if (!colorWrap.dataset.rendered) {
        colorWrap.innerHTML = Object.entries(COLORS).map(([k, v]) =>
          `<span class="bw-dot" data-color="${k}" style="background:${v}"></span>`
        ).join("");
        colorWrap.dataset.rendered = "1";
      }
    }
  
    function syncActiveUI() {
      const s = load();
  
      const currentFont = (s.font ?? DEFAULTS.font);
      document.querySelectorAll("#bw-fonts .bw-font").forEach(a => {
        const v = a.dataset.font ?? "";
        a.classList.toggle("active", v === currentFont);
      });
  
      const currentColorKey = isDark()
        ? (s.themeColorDark ?? DEFAULTS.themeColorDark)
        : (s.themeColorLight ?? DEFAULTS.themeColorLight);
  
      document.querySelectorAll("#bw-colors .bw-dot").forEach(dot => {
        dot.classList.toggle("active", dot.dataset.color === currentColorKey);
      });
  
      const snowBtn = document.getElementById("bw-toggle-snowfall");
      const starBtn = document.getElementById("bw-toggle-starfield");
      if (snowBtn){
        snowBtn.classList.toggle("on", !!s.snowfall);
        snowBtn.setAttribute("aria-checked", String(!!s.snowfall));
      }
      if (starBtn){
        starBtn.classList.toggle("on", !!s.starfield);
        starBtn.setAttribute("aria-checked", String(!!s.starfield));
      }
    }
  
    // ✅ 需求 3：只要切换日夜模式，就自动回到默认色（白天绿/夜晚黑灰）
    function bindThemeAutoResetOnce() {
      if (window.__beautifyThemeAutoResetBound) return;
      window.__beautifyThemeAutoResetBound = true;
  
      const mo = new MutationObserver(() => {
        const s = load();
        if (isDark()) s.themeColorDark = DEFAULTS.themeColorDark;
        else s.themeColorLight = DEFAULTS.themeColorLight;
  
        save(s);
        applyThemeColorBySettings(s);
        syncActiveUI();
      });
  
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }
  
    // 供 window.js 调用
    window.__beautifySettings = {
      load,
      save,
      applyFont,
      applyThemeColor,
      applyThemeColorBySettings,
      renderOptionsOnce,
      applySnowfall,
      applyStarfield,
      syncActiveUI
    };
  
    function boot() {
      renderOptionsOnce();
  
      const s = load();
      // 首次：按当前模式应用对应颜色（默认绿/黑灰）
      applyThemeColorBySettings(s);
  
      applyFont(s.font);
      applySnowfall(!!s.snowfall);
      applyStarfield(!!s.starfield);
      syncActiveUI();
  
      bindThemeAutoResetOnce();
    }
  
    document.addEventListener("DOMContentLoaded", boot);
    document.addEventListener("pjax:complete", boot);
  })();
  