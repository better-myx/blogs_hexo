// =====================================================
// hamburger_icon_injector.js
// 目标：等待 iconfont 加载完成后，注入汉堡按钮图标
// 解决移动端汉堡按钮图标不显示的问题
// =====================================================

// 等待 iconfont symbol sprite 注入到 DOM
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
  
  // 注入汉堡按钮图标
  function injectHamburgerIcon() {
    const toggleMenu = document.querySelector('#toggle-menu .site-page');
    if (!toggleMenu) return;
  
    // 如果已经注入过，跳过
    if (toggleMenu.dataset.injected === 'true') return;
  
    // 清空原有内容，注入 iconfont SVG
    toggleMenu.innerHTML = `
      <svg class="menu-svg-icon faa-tada" aria-hidden="true">
        <use xlink:href="#icon-caidan"></use>
      </svg>
    `;
  
    // 添加动画类
    toggleMenu.classList.add('faa-parent', 'animated-hover');
    toggleMenu.dataset.injected = 'true';
  }
  
  // 主函数：等待 iconfont 加载后注入
  async function runHamburgerInjector() {
    const ok = await waitForIconSprite(3000);
    
    if (ok) {
      injectHamburgerIcon();
    } else {
      console.warn('[hamburger_icon_injector] iconfont sprite not found. Check iconfont JS link loading.');
    }
  }
  
  // 在 DOM 加载完成和 PJAX 切换后都执行
  document.addEventListener('DOMContentLoaded', runHamburgerInjector);
  document.addEventListener('pjax:complete', runHamburgerInjector);