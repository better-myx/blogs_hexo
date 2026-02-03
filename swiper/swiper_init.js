(function () {
  // 防止重复初始化
  function destroyOld() {
    try {
      if (window.__mySwiper && window.__mySwiper.destroy) {
        window.__mySwiper.destroy(true, true);
      }
    } catch (e) {}
    window.__mySwiper = null;
  }

  // 兜底：如果 pjax 没加载出来，让点击至少能正常跳转
  function patchPjaxFallback() {
    const els = document.querySelectorAll('a[onclick*="pjax.loadUrl"]');
    if (!els || !els.length) return;

    const hasPjax = window.pjax && typeof window.pjax.loadUrl === 'function';

    els.forEach((el) => {
      // 已经处理过就跳过
      if (el.__patched) return;
      el.__patched = true;

      const onclick = el.getAttribute('onclick') || '';
      const m = onclick.match(/pjax\.loadUrl\("([^"]+)"\)/);
      const url = m && m[1];

      if (!url) return;

      // 如果没有 pjax，就把 href 设为真实链接 + 监听点击跳转
      if (!hasPjax) {
        el.setAttribute('href', url);
        el.addEventListener('click', function (e) {
          e.preventDefault();
          window.location.href = url;
        });
      }
    });
  }

  function initSwiperOnceReady() {
    // 条件：Swiper 已加载 + 容器存在 + 至少有 slide
    const container = document.querySelector('#swiper_container');
    const slides = document.querySelectorAll('#swiper_container .swiper-slide');

    if (!container || !slides || slides.length === 0) return false;
    if (typeof window.Swiper !== 'function') return false;

    // 容器高度为 0 时，移动端会“白板”，先强制一个最小高度（避免首屏空白）
    if (container.offsetHeight === 0) {
      container.style.minHeight = '260px';
    }

    destroyOld();

    // 初始化 Swiper：加 observer，解决 DOM 后插入/尺寸变化导致不显示
    window.__mySwiper = new Swiper('#swiper_container', {
      effect: 'fade',
      loop: true,
      speed: 450,
      autoplay: { delay: 4000, disableOnInteraction: false },
      pagination: { el: '.blog-slider__pagination', clickable: true },

      // 关键：监听 DOM/父级变化，移动端首屏更稳
      observer: true,
      observeParents: true,
      watchOverflow: true,

      // 有些情况下第一次计算尺寸不准，强制刷新
      on: {
        init: function () {
          setTimeout(() => {
            try { this.update(); this.updateSize(); this.updateSlides(); } catch (e) {}
          }, 50);
        }
      }
    });

    patchPjaxFallback();
    return true;
  }

  // 重试机制：移动端首次加载经常“脚本先到、DOM后到”
  function initWithRetry() {
    let times = 0;
    const timer = setInterval(() => {
      times++;
      if (initSwiperOnceReady() || times > 30) { // 最多等 3 秒(30*100ms)
        clearInterval(timer);
      }
    }, 100);
  }

  // 首次页面加载
  document.addEventListener('DOMContentLoaded', initWithRetry);
  window.addEventListener('load', initWithRetry);

  // PJAX 切页后（Butterfly 常用事件）
  document.addEventListener('pjax:complete', initWithRetry);
  document.addEventListener('pjax:end', initWithRetry);
})();
