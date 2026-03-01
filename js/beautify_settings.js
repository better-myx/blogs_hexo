// source/js/beautify_settings.js
(() => {
  const LS_KEY = "beautify_settings_v2";

  // ✅ 先定义 isMobileDevice，再用于 DEFAULTS
  const isMobileDevice = window.innerWidth <= 768;

  const DEFAULTS = {
    font: "ZhuZiAWan",
    snowfall: true,
    starfield: true,

    // ✅ 白天/夜间分别存色
    themeColorLight: "green",
    themeColorDark: "blackgray",
    // ✅ 字体大小默认值（手机/桌面不同）
    fontSize: isMobileDevice ? 14 : 16,
    h1Size:   isMobileDevice ? 18 : 24,
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

  // ✅ 应用正文字体大小
  function applyFontSize(px) {
    px = Math.max(12, Math.min(26, px));
    let el = document.getElementById('bw-dynamic-fontsize');
    if (!el) {
      el = document.createElement('style');
      el.id = 'bw-dynamic-fontsize';
      document.head.appendChild(el);
    }
    el.textContent = `
      #article-container p,
      #article-container li,
      #article-container blockquote,
      #article-container td,
      #article-container th {
        font-size: ${px}px !important;
      }
    `;
  }

  // ✅ 应用标题字体大小（H1为基准，其余等比缩放）
  function applyH1Size(h1px) {
    h1px = Math.max(16, Math.min(48, h1px));
    const h2 = Math.round(h1px * 0.82);
    const h3 = Math.round(h1px * 0.70);
    const h4 = Math.round(h1px * 0.60);
    const h5 = Math.round(h1px * 0.52);

    let el = document.getElementById('bw-dynamic-h1size');
    if (!el) {
      el = document.createElement('style');
      el.id = 'bw-dynamic-h1size';
      document.head.appendChild(el);
    }
    el.textContent = `
      #article-container h1 { font-size: ${h1px}px !important; }
      #article-container h2 { font-size: ${h2}px !important; }
      #article-container h3 { font-size: ${h3}px !important; }
      #article-container h4 { font-size: ${h4}px !important; }
      #article-container h5, #article-container h6 { font-size: ${h5}px !important; }
    `;
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

    // ✅ 同步字体大小显示值
    const isMob = window.innerWidth <= 768;
    const fsEl = document.getElementById('bw-fontsize-val');
    const h1El = document.getElementById('bw-h1size-val');
    if (fsEl) fsEl.textContent = s.fontSize ?? (isMob ? 14 : 16);
    if (h1El) h1El.textContent = s.h1Size  ?? (isMob ? 18 : 24);
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
    applyFontSize,   // ✅ 新增
    applyH1Size,     // ✅ 新增
    syncActiveUI
  };

  function boot() {
    renderOptionsOnce();

    const s = load();
    const isMob = window.innerWidth <= 768;

    // 首次：按当前模式应用对应颜色（默认绿/黑灰）
    applyThemeColorBySettings(s);

    applyFont(s.font);
    applySnowfall(!!s.snowfall);
    applyStarfield(!!s.starfield);

    // ✅ 应用字体大小
    applyFontSize(s.fontSize ?? (isMob ? 14 : 16));
    applyH1Size(s.h1Size   ?? (isMob ? 18 : 24));

    syncActiveUI();

    bindThemeAutoResetOnce();
  }

  document.addEventListener("DOMContentLoaded", boot);
  document.addEventListener("pjax:complete", boot);
})();