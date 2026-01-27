// =====================================================
// sun_moon.js (Final)
// 目标：
// 1) 保留 Butterfly 原生 darkmode 逻辑（通过点击 #darkmode）
// 2) 提供 switchNightMode() 供右上/右下按钮调用
// 3) 所有 use.modeicon 图标同步（右上 + 右下）
// 4) PJAX 下不会重复绑定 observer / 重复注入 SVG
// =====================================================

// ---- 0) 同步所有“模式图标”（右上 + 右下）----
function syncAllModeIcons() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    // 暗黑模式显示太阳（提示点它切回白天）
    const href = theme === 'dark' ? '#icon-sun' : '#icon-moon';
  
    document.querySelectorAll('use.modeicon').forEach((el) => {
      el.setAttribute('xlink:href', href);
      el.setAttribute('href', href); // 兼容
    });
  }
  
  // ---- 1) 注入一次 SVG symbols（sun/moon）----
  function ensureSunMoonSymbols() {
    if (document.getElementById('icon-sun')) return;
  
    const svgIcons = `
      <svg aria-hidden="true" style="position:absolute; overflow:hidden; width:0; height:0">
        <symbol id="icon-sun" viewBox="0 0 1024 1024">
          <path d="M960 512l-128 128v192h-192l-128 128-128-128H192v-192l-128-128 128-128V192h192l128-128 128 128h192v192z" fill="#FFD878"></path>
          <path d="M736 512a224 224 0 1 0-448 0 224 224 0 1 0 448 0z" fill="#FFE4A9"></path>
          <path d="M512 109.248L626.752 224H800v173.248L914.752 512 800 626.752V800h-173.248L512 914.752 397.248 800H224v-173.248L109.248 512 224 397.248V224h173.248L512 109.248M512 64l-128 128H192v192l-128 128 128 128v192h192l128 128 128-128h192v-192l128-128-128-128V192h-192l-128-128z" fill="#4D5152"></path>
          <path d="M512 320c105.888 0 192 86.112 192 192s-86.112 192-192 192-192-86.112-192-192 86.112-192 192-192m0-32a224 224 0 1 0 0 448 224 224 0 0 0 0-448z" fill="#4D5152"></path>
        </symbol>
        <symbol id="icon-moon" viewBox="0 0 1024 1024">
          <path d="M611.370667 167.082667a445.013333 445.013333 0 0 1-38.4 161.834666 477.824 477.824 0 0 1-244.736 244.394667 445.141333 445.141333 0 0 1-161.109334 38.058667 85.077333 85.077333 0 0 0-65.066666 135.722666A462.08 462.08 0 1 0 747.093333 102.058667a85.077333 85.077333 0 0 0-135.722666 65.024z" fill="#FFB531"></path>
          <path d="M329.728 274.133333l35.157333-35.157333a21.333333 21.333333 0 1 0-30.165333-30.165333l-35.157333 35.157333-35.114667-35.157333a21.333333 21.333333 0 0 0-30.165333 30.165333l35.114666 35.157333-35.114666 35.157334a21.333333 21.333333 0 1 0 30.165333 30.165333l35.114667-35.157333 35.157333 35.157333a21.333333 21.333333 0 1 0 30.165333-30.165333z" fill="#030835"></path>
        </symbol>
      </svg>
    `;
  
    document.body.insertAdjacentHTML('afterbegin', svgIcons);
  }
  
  // ---- 2) 确保右下角自定义按钮存在（并隐藏原生按钮）----
  function ensureBottomButton() {
    const origin = document.getElementById('darkmode');
    if (!origin) return;
  
    // 隐藏原生按钮，但保留其 click 行为
    origin.style.display = 'none';
  
    // 创建右下角按钮（如果你已经有了就不重复）
    if (!document.getElementById('custom-darkmode-button')) {
      const btn = document.createElement('a');
      btn.id = 'custom-darkmode-button';
      btn.className = 'icon-V';
      btn.title = '切换模式';
      btn.setAttribute('onclick', 'switchNightMode()');
      btn.innerHTML = `
        <svg width="25" height="25" viewBox="0 0 1024 1024">
          <use class="modeicon" xlink:href="#icon-moon"></use>
        </svg>
      `;
      origin.parentNode.insertBefore(btn, origin.nextSibling);
    }
  }
  
  // ---- 3) 主题变化监听（只注册一次）----
  function ensureThemeObserver() {
    if (window.__sunMoonObserver) return;
  
    window.__sunMoonObserver = new MutationObserver(() => {
      syncAllModeIcons();
    });
  
    window.__sunMoonObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }
  
  // ---- 4) 对外：切换函数（右上/右下都调用它）----
  function switchNightMode() {
    // 动画遮罩 DOM
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div class="Cuteen_DarkSky"><div class="Cuteen_DarkPlanet"><div id="sun"></div><div id="moon"></div></div></div>'
    );
  
    const sky = document.querySelector('.Cuteen_DarkSky');
    const sun = document.getElementById('sun');
    const moon = document.getElementById('moon');
    const nowMode = document.documentElement.getAttribute('data-theme');
  
    if (nowMode === 'light' || nowMode === null) {
      sun.style.opacity = '1';
      moon.style.opacity = '0';
      setTimeout(() => { sun.style.opacity = '0'; moon.style.opacity = '1'; }, 1000);
    } else {
      sun.style.opacity = '0';
      moon.style.opacity = '1';
      setTimeout(() => { sun.style.opacity = '1'; moon.style.opacity = '0'; }, 1000);
    }
  
    // 触发主题切换：点击隐藏的原生按钮
    const origin = document.getElementById('darkmode');
    if (origin) origin.click();
  
    // 兜底：立即同步一次
    setTimeout(syncAllModeIcons, 50);
  
    // 动画结束移除
    setTimeout(() => {
      sky.style.transition = 'opacity 1s';
      sky.style.opacity = '0';
      setTimeout(() => sky.remove(), 1000);
    }, 2000);
  }
  
  // ---- 5) 初始化：加载 + PJAX 都可重入 ----
  function sunMoonInit() {
    ensureSunMoonSymbols();
    ensureBottomButton();
    ensureThemeObserver();
    syncAllModeIcons();
  }
  
  function runInit() {
    requestAnimationFrame(sunMoonInit);
  }
  
  document.addEventListener('DOMContentLoaded', runInit);
  document.addEventListener('pjax:complete', runInit);
  