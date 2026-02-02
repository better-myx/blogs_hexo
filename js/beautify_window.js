// source/js/beautify_window.js
(() => {
    function win() { return document.getElementById("beautify-window"); }
    function tray() { return document.getElementById("beautify-tray"); }
    function card() { return document.querySelector("#beautify-window .bw-card"); }
  
    const STATE = {
      prevRect: null // {left, top, width, height}
    };
  
    function openWindow() {
      const w = win(), t = tray();
      if (!w) return;
      w.classList.remove("hidden");
      // ✅ 手机端默认全屏（配合 CSS @media）
      const isMobile = window.matchMedia && window.matchMedia("(max-width: 600px)").matches;
      if (isMobile) w.classList.add("is-max");

      w.setAttribute("aria-hidden", "false");
      if (t) t.classList.add("hidden");
  
      // 默认打开居中（清掉可能残留的 left/top/transform）
      const c = card();
      if (c && !w.classList.contains("is-max") && !isMobile) {
        c.style.position = "fixed";
        c.style.left = "50%";
        c.style.top = "55%";
        c.style.transform = "translate(-50%, -50%)";
        c.style.width = "";
        c.style.height = "";
      }
    }
  
    function closeWindow() {
      const w = win(), t = tray();
      if (!w) return;
      w.classList.add("hidden");
      w.classList.remove("is-max");
      w.setAttribute("aria-hidden", "true");
      if (t) t.classList.add("hidden");
    }
  
    function minimizeWindow() {
      const w = win(), t = tray();
      if (!w || !t) return;
      w.classList.add("hidden");
      w.classList.remove("is-max");
      w.setAttribute("aria-hidden", "true");
      t.classList.remove("hidden");
    }
  
    function saveRect() {
      const c = card();
      if (!c) return;
      const r = c.getBoundingClientRect();
      STATE.prevRect = { left: r.left, top: r.top, width: r.width, height: r.height };
    }
  
    function applyRect(rect) {
      const c = card();
      if (!c || !rect) return;
      c.style.position = "fixed";
      c.style.transform = "none";
      c.style.left = rect.left + "px";
      c.style.top = rect.top + "px";
      c.style.width = rect.width + "px";
      c.style.height = rect.height + "px";
    }
  
    function maximize() {
      const w = win();
      if (!w) return;
      if (!w.classList.contains("is-max")) saveRect();
      w.classList.add("is-max");
    }
  
    function restore() {
      const w = win();
      if (!w) return;
      w.classList.remove("is-max");
      if (STATE.prevRect) applyRect(STATE.prevRect);
    }
  
    function toggleMaximize() {
      const w = win();
      if (!w) return;
      if (w.classList.contains("is-max")) restore();
      else maximize();
    }
  
    // ✅ Windows 策略：最大化时拖标题栏 -> 自动还原并跟随鼠标
    function enableDrag() {
      const bar = document.getElementById("bw-titlebar");
      const c = card();
      if (!bar || !c) return;
      if (bar.dataset.dragBound) return;
      bar.dataset.dragBound = "1";
  
      let dragging = false;
      let startX = 0, startY = 0;
      let startLeft = 0, startTop = 0;
  
      bar.addEventListener("mousedown", (e) => {
        const w = win();
        if (!w) return;
  
        // 如果是最大化，先还原到上一次的窗口大小（没有则用默认）
        if (w.classList.contains("is-max")) {
          const before = STATE.prevRect || { left: (window.innerWidth-920)/2, top: (window.innerHeight-560)/2, width: 920, height: 560 };
          restore();
  
          // 让鼠标位于标题栏的相对位置（接近 Windows）
          const ratioX = e.clientX / window.innerWidth;
          const newLeft = Math.max(0, Math.min(window.innerWidth - before.width, e.clientX - before.width * ratioX));
          const newTop = Math.max(0, Math.min(window.innerHeight - before.height, e.clientY - 16));
  
          applyRect({ left: newLeft, top: newTop, width: before.width, height: before.height });
        }
  
        dragging = true;
        startX = e.clientX; startY = e.clientY;
  
        const rect = c.getBoundingClientRect();
        startLeft = rect.left; startTop = rect.top;
  
        c.style.position = "fixed";
        c.style.transform = "none";
        c.style.left = `${startLeft}px`;
        c.style.top = `${startTop}px`;
      });
  
      window.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        c.style.left = `${startLeft + dx}px`;
        c.style.top = `${startTop + dy}px`;
      });
  
      window.addEventListener("mouseup", () => dragging = false);
    }
  
    // ✅ 8 方向拉伸
    function enableResize() {
      const c = card();
      const w = win();
      if (!c || !w) return;
      if (c.dataset.resizeBound) return;
      c.dataset.resizeBound = "1";
  
      let resizing = false;
      let dir = "";
      let startX = 0, startY = 0;
      let startRect = null;
  
      function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
  
      c.addEventListener("mousedown", (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        const handle = target.closest(".bw-r");
        if (!handle) return;
  
        if (w.classList.contains("is-max")) return; // 最大化不拉伸
  
        dir = handle.dataset.dir || "";
        resizing = true;
        startX = e.clientX; startY = e.clientY;
        const r = c.getBoundingClientRect();
        startRect = { left: r.left, top: r.top, width: r.width, height: r.height };
  
        c.style.position = "fixed";
        c.style.transform = "none";
        c.style.left = `${startRect.left}px`;
        c.style.top = `${startRect.top}px`;
        c.style.width = `${startRect.width}px`;
        c.style.height = `${startRect.height}px`;
  
        e.preventDefault();
        e.stopPropagation();
      });
  
      window.addEventListener("mousemove", (e) => {
        if (!resizing || !startRect) return;
  
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
  
        const minW = 560, minH = 380;
        let left = startRect.left;
        let top = startRect.top;
        let width = startRect.width;
        let height = startRect.height;
  
        if (dir.includes("e")) width = startRect.width + dx;
        if (dir.includes("s")) height = startRect.height + dy;
  
        if (dir.includes("w")) {
          width = startRect.width - dx;
          left = startRect.left + dx;
        }
        if (dir.includes("n")) {
          height = startRect.height - dy;
          top = startRect.top + dy;
        }
  
        // clamp 最小尺寸
        if (width < minW) {
          if (dir.includes("w")) left -= (minW - width);
          width = minW;
        }
        if (height < minH) {
          if (dir.includes("n")) top -= (minH - height);
          height = minH;
        }
  
        // clamp 不要拖出屏幕太多（留一点余量）
        const maxLeft = window.innerWidth - 80;
        const maxTop = window.innerHeight - 60;
        left = clamp(left, -20, maxLeft);
        top = clamp(top, -10, maxTop);
  
        c.style.left = `${left}px`;
        c.style.top = `${top}px`;
        c.style.width = `${width}px`;
        c.style.height = `${height}px`;
      });
  
      window.addEventListener("mouseup", () => {
        if (!resizing) return;
        resizing = false;
        dir = "";
        startRect = null;
      });
    }
  
    function bindEventsOnce() {
      if (window.__beautifyWindowBound) return;
      window.__beautifyWindowBound = true;
  
      document.addEventListener("click", (e) => {
        const t = e.target;
        if (!(t instanceof HTMLElement)) return;
  
        if (t.closest("#beautify-tray")) { openWindow(); return; }
        if (t.matches("#beautify-window .bw-ctl.close")) { closeWindow(); return; }
        if (t.matches("#beautify-window .bw-ctl.min")) { minimizeWindow(); return; }
        if (t.matches("#beautify-window .bw-ctl.max")) { toggleMaximize(); return; }
  
        // 雪花开关
        if (t.closest("#bw-toggle-snowfall") && window.__beautifySettings){
          const s = window.__beautifySettings.load();
          s.snowfall = !s.snowfall;
          window.__beautifySettings.save(s);
          window.__beautifySettings.applySnowfall(!!s.snowfall);
          window.__beautifySettings.syncActiveUI();
          return;
        }
  
        // 星空开关
        if (t.closest("#bw-toggle-starfield") && window.__beautifySettings){
          const s = window.__beautifySettings.load();
          s.starfield = !s.starfield;
          window.__beautifySettings.save(s);
          window.__beautifySettings.applyStarfield(!!s.starfield);
          window.__beautifySettings.syncActiveUI();
          return;
        }
  
        // 字体点击
        const fontBtn = t.closest("#bw-fonts .bw-font");
        if (fontBtn && window.__beautifySettings){
          const s = window.__beautifySettings.load();
          s.font = fontBtn.dataset.font ?? "ZhuZiAWan";
          window.__beautifySettings.save(s);
          window.__beautifySettings.applyFont(s.font);
          window.__beautifySettings.syncActiveUI();
          return;
        }
  
        // 主题色点击（只改当前模式）
        const dot = t.closest("#bw-colors .bw-dot");
        if (dot && window.__beautifySettings){
          const s = window.__beautifySettings.load();
          const key = dot.dataset.color ?? "green";
          const isDark = document.documentElement.getAttribute("data-theme") === "dark";
          if (isDark) s.themeColorDark = key;
          else s.themeColorLight = key;
  
          window.__beautifySettings.save(s);
          window.__beautifySettings.applyThemeColorBySettings(s);
          window.__beautifySettings.syncActiveUI();
          return;
        }
      });
    }
  
    // ✅ 单一入口：确保 nav onclick 一定能调用
    window.toggleBeautifyPanel = function () {
      window.__beautifyEnsureDOM && window.__beautifyEnsureDOM();
      window.__beautifySettings && window.__beautifySettings.renderOptionsOnce && window.__beautifySettings.renderOptionsOnce();
  
      bindEventsOnce();
      enableDrag();
      enableResize();
  
      const w = win();
      if (!w) return;
  
      if (w.classList.contains("hidden")) openWindow();
      else closeWindow();
  
      // 同步一次
      if (window.__beautifySettings) {
        const s = window.__beautifySettings.load();
        window.__beautifySettings.applyThemeColorBySettings(s);
        window.__beautifySettings.applyFont(s.font);
        window.__beautifySettings.applySnowfall(!!s.snowfall);
        window.__beautifySettings.applyStarfield(!!s.starfield);
        window.__beautifySettings.syncActiveUI();
      }
    };
  
    function boot() {
      window.__beautifyEnsureDOM && window.__beautifyEnsureDOM();
      window.__beautifySettings && window.__beautifySettings.renderOptionsOnce && window.__beautifySettings.renderOptionsOnce();
      bindEventsOnce();
      enableDrag();
      enableResize();
    }
  
    document.addEventListener("DOMContentLoaded", boot);
    document.addEventListener("pjax:complete", boot);
  })();
  