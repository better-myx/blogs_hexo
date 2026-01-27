// =====================================================
// menu_icons_injector.js (Final)
// 目标：把导航菜单文字替换成： [iconfont svg] + [原文字]
// CSS 统一放 nav_ui.css，不在 JS 里注入 style
// =====================================================

// 1) 菜单文字 -> iconfont symbol id + 动画 class 映射
// key 必须与导航显示文字完全一致
const MENU_ICON_MAP = {
    '首页': { icon: 'icon-shouye', anima: 'faa-tada' },
    '归档': { icon: 'icon-guidang', anima: 'faa-tada' },
    '分类': { icon: 'icon-fenlei', anima: 'faa-tada' },
    '标签': { icon: 'icon-biaoqian', anima: 'faa-tada' },
    '友链': { icon: 'icon-haoyoulianjie', anima: 'faa-tada' },
    '关于': { icon: 'icon-wenzhang', anima: 'faa-tada' },
  };
  
  // 等待 iconfont symbol sprite 注入到 DOM（避免 use 引用为空）
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
  
  function injectMenuIcons() {
    const menuLinks = document.querySelectorAll(
      '#nav .menus_items .menus_item > a, #nav .menus_items .menus_item_child a'
    );
    if (!menuLinks.length) return;
  
    menuLinks.forEach((link) => {
      if (link.dataset.injected === 'true') return;
  
      // 提取“纯文字标题”（避免子元素干扰）
      const rawText = (link.textContent || '').trim();
      const conf = MENU_ICON_MAP[rawText];
      if (!conf || !conf.icon) return;
  
      // 保留原 href，不动跳转
      const anima = conf.anima || 'faa-tada';
  
      // 动画父容器（font-awesome-animation）
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
  
  async function runMenuInjector() {
    const ok = await waitForIconSprite(3000);
    injectMenuIcons();
    if (!ok) {
      console.warn('[menu_icons_injector] iconfont sprite not found. Check iconfont JS link loading.');
    }
  }
  
  document.addEventListener('DOMContentLoaded', runMenuInjector);
  document.addEventListener('pjax:complete', runMenuInjector);
  