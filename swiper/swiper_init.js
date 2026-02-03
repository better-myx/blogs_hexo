(function () {
  function ready() {
    // 你的结构里容器是 #swiper_container，Swiper 容器 class 是 .blog-slider
    var container = document.getElementById('swiper_container');
    var slider = document.querySelector('.blog-slider');
    var slides = document.querySelectorAll('.blog-slider .swiper-slide');

    if (!container || !slider) return false;
    if (!slides || slides.length === 0) return false;
    if (typeof window.Swiper !== 'function') return false;

    return { container, slider };
  }

  function destroyOld() {
    try {
      if (window.__swiper && window.__swiper.destroy) {
        window.__swiper.destroy(true, true);
      }
    } catch (e) {}
    window.__swiper = null;
  }

  // 没有 pjax 时，onclick 里写了 pjax.loadUrl 会失效；做一个降级跳转
  function patchPjaxFallback() {
    var hasPjax = window.pjax && typeof window.pjax.loadUrl === 'function';
    if (hasPjax) return;

    var els = document.querySelectorAll('a[onclick*="pjax.loadUrl"]');
    if (!els || !els.length) return;

    els.forEach(function (el) {
      if (el.__patched) return;
      el.__patched = true;

      var onclick = el.getAttribute('onclick') || '';
      var m = onclick.match(/pjax\.loadUrl\("([^"]+)"\)/);
      var url = m && m[1];
      if (!url) return;

      el.setAttribute('href', url);
      el.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = url;
      });
    });
  }

  function initSwiper() {
    var ok = ready();
    if (!ok) return false;

    var container = ok.container;

    // 关键：移动端首次可能高度为0，先给个最小高度避免白屏
    if (container.offsetHeight === 0) {
      container.style.minHeight = '260px';
    }

    destroyOld();

    // 保留你原来的参数，顺便加 observer 让移动端更稳
    window.__swiper = new Swiper('.blog-slider', {
      passiveListeners: true,
      spaceBetween: 30,
      effect: 'fade',
      loop: true,
      autoplay: {
        disableOnInteraction: true,
        delay: 3000
      },
      mousewheel: true,
      pagination: {
        el: '.blog-slider__pagination',
        clickable: true
      },
      observer: true,
      observeParents: true,
      watchOverflow: true
    });

    // 保留你原来的 hover 停止/开始（移动端不会触发 hover，不影响）
    container.onmouseenter = function () {
      try { window.__swiper.autoplay.stop(); } catch (e) {}
    };
    container.onmouseleave = function () {
      try { window.__swiper.autoplay.start(); } catch (e) {}
    };

    // 初始化后强制 update 一次，解决首屏尺寸计算不准
    setTimeout(function () {
      try {
        window.__swiper.update();
        window.__swiper.updateSize();
        window.__swiper.updateSlides();
      } catch (e) {}
    }, 60);

    patchPjaxFallback();
    return true;
  }

  // 重试：等资源和 DOM 到位（移动端冷启动必需）
  function initWithRetry() {
    var times = 0;
    var timer = setInterval(function () {
      times++;
      if (initSwiper() || times > 30) { // 最多等 3 秒
        clearInterval(timer);
      }
    }, 100);
  }

  // 首次加载
  document.addEventListener('DOMContentLoaded', initWithRetry);
  window.addEventListener('load', initWithRetry);

  // PJAX 切页后再 init（多监听几个事件，兼容不同实现）
  document.addEventListener('pjax:complete', initWithRetry);
  document.addEventListener('pjax:end', initWithRetry);
  document.addEventListener('pjax:success', initWithRetry);
})();
