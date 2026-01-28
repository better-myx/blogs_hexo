// =====================================================
// sun_moon.js (Fixed - 图标统一版本)
// 目标：
// 1) 保留 Butterfly 原生 darkmode 逻辑（通过点击 #darkmode）
// 2) 提供 switchNightMode() 供右上/右下按钮调用
// 3) 所有 use.modeicon 图标同步（右上 + 右下）
// 4) PJAX 下不会重复绑定 observer / 重复注入 SVG
// 5) ⭐ 修复：统一使用阿里图标库的图标，不再自定义注入
// =====================================================

// ---- 0) 同步所有"模式图标"（右上 + 右下）----
function syncAllModeIcons() {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  // 暗黑模式显示太阳（提示点它切回白天）
  const href = theme === 'dark' ? '#icon-sun' : '#icon-moon';

  document.querySelectorAll('use.modeicon').forEach((el) => {
    el.setAttribute('xlink:href', href);
    el.setAttribute('href', href); // 兼容
  });
}

// ---- 1) 不再注入自定义 SVG symbols ----
// 因为我们统一使用阿里图标库的 icon-sun 和 icon-moon
function ensureSunMoonSymbols() {
  // 空函数，保留接口兼容性
  // 图标由阿里图标库的 JS 自动注入
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