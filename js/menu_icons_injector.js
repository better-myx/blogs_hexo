// =====================================================
// menu_icons_injector.js (Merged Final)
// 目标：
// 1) 导航菜单文字 → iconfont svg + 原文字
// 2) 移动端汉堡按钮 → iconfont svg
// 统一等待 iconfont sprite 后注入
// CSS 全部由 nav_ui.css 管理
// =====================================================

// ===============================
// 1) 菜单文字 → iconfont 映射
// ===============================
const MENU_ICON_MAP = {
  '首页': { icon: 'icon-shouye', anima: 'faa-tada' },
  '归档': { icon: 'icon-guidang', anima: 'faa-tada' },
  '分类': { icon: 'icon-fenlei', anima: 'faa-tada' },
  '标签': { icon: 'icon-biaoqian', anima: 'faa-tada' },
  '友链': { icon: 'icon-haoyoulianjie', anima: 'faa-tada' },
  '关于': { icon: 'icon-wenzhang', anima: 'faa-tada' },
};

// ===============================
// 2) 等待 iconfont symbol sprite
// ===============================
function waitForIconSprite(timeoutMs = 3000) {
  const start = Date.now();

  return new Promise((resolve) => {
    (function tick() {
      const hasSprite = document.querySelector('svg symbol[id^="icon-"]');
      if (hasSprite) return resolve(true);

      if (Date.now() - start > timeoutMs) return resolve(false);
      requestAnimationFrame(tick);
    })();
  });
}

// ===============================
// 3) 注入桌面 / 移动端菜单图标
// ===============================
function injectMenuIcons() {
  const menuLinks = document.querySelectorAll(
    '#nav .menus_items .menus_item > a, #nav .menus_items .menus_item_child a'
  );
  if (!menuLinks.length) return;

  menuLinks.forEach((link) => {
    if (link.dataset.injected === 'true') return;

    const rawText = (link.textContent || '').trim();
    const conf = MENU_ICON_MAP[rawText];
    if (!conf || !conf.icon) return;

    const anima = conf.anima || 'faa-tada';

    link.classList.add('faa-parent', 'animated-hover');
    link.innerHTML = `
      <svg class="menu-svg-icon ${anima}" aria-hidden="true">
        <use xlink:href="#${conf.icon}"></use>
      </svg>
      <span>${rawText}</span>
    `;

    link.dataset.injected = 'true';
  });
}

// ===============================
// 4) 注入移动端汉堡按钮图标
// ===============================
function injectHamburgerIcon() {
  const toggleMenu = document.querySelector('#toggle-menu .site-page');
  if (!toggleMenu) return;

  if (toggleMenu.dataset.injected === 'true') return;

  toggleMenu.innerHTML = `
    <svg class="menu-svg-icon faa-tada" aria-hidden="true">
      <use xlink:href="#icon-caidan"></use>
    </svg>
  `;

  toggleMenu.classList.add('faa-parent', 'animated-hover');
  toggleMenu.dataset.injected = 'true';
}

// ===============================
// 5) 主入口
// ===============================
async function runNavIconInjector() {
  const ok = await waitForIconSprite(3000);

  injectMenuIcons();
  injectHamburgerIcon();

  if (!ok) {
    console.warn(
      '[menu_icons_injector] iconfont sprite not found. Check iconfont JS link loading.'
    );
  }
}

// ===============================
// 6) DOM & PJAX 监听
// ===============================
document.addEventListener('DOMContentLoaded', runNavIconInjector);
document.addEventListener('pjax:complete', runNavIconInjector);
