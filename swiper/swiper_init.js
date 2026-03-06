(function () {
  function ready() {
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

  function forceUpdate(sw) {
    if (!sw) return;
    try {
      sw.update();
      sw.updateSize();
      sw.updateSlides();
    } catch (e) {}
  }

  function initSwiper() {
    var ok = ready();
    if (!ok) return false;

    var container = ok.container;

    // 首屏高度兜底（避免冷启动高度为 0 出白块）
    if (container.offsetHeight === 0) {
      container.style.minHeight = '260px';
    }

    destroyOld();

    window.__swiper = new Swiper('.blog-slider', {
      passiveListeners: true,
      spaceBetween: 30,
      effect: 'fade',
      fadeEffect: { crossFade: true },

      // ✅ 关键：关闭 loop（避免克隆页 + 随机封面导致串图/错图）
      loop: false,

      // ✅ 关键：用 rewind 实现“末尾回到开头”，但不克隆 slide
      rewind: true,

      autoplay: {
        disableOnInteraction: true,
        delay: 3000
      },

      mousewheel: true,

      pagination: {
        el: '.blog-slider__pagination',
        clickable: true
      },

      // ✅ 更稳：DOM/父级变化时自动重算
      observer: true,
      observeParents: true,
      watchOverflow: true,
      updateOnWindowResize: true,

      // ✅ 首屏不要等懒加载（轮播封面建议直接加载）
      preloadImages: true,
      lazy: false,

      on: {
        init: function () {
          // 初始化后立刻强制回到第 1 张并 update
          try { this.slideTo(0, 0); } catch (e) {}
          forceUpdate(this);
          setTimeout(forceUpdate.bind(null, this), 60);
          setTimeout(forceUpdate.bind(null, this), 300);
        },
        imagesReady: function () {
          // 图片解码完成再 update 一次（解决首屏空白/错位）
          forceUpdate(this);
        },
        resize: function () {
          forceUpdate(this);
        }
      }
    });

    // hover 停止/开始（移动端不触发，不影响）
    container.onmouseenter = function () {
      try { window.__swiper.autoplay.stop(); } catch (e) {}
    };
    container.onmouseleave = function () {
      try { window.__swiper.autoplay.start(); } catch (e) {}
    };

    // 再补几刀：移动端图片解码慢时很关键
    setTimeout(function () {
      try {
        window.__swiper.slideTo(0, 0);
        forceUpdate(window.__swiper);
      } catch (e) {}
    }, 500);

    patchPjaxFallback();
    return true;
  }

  // 重试：等资源和 DOM 到位
  function initWithRetry() {
    var times = 0;
    var timer = setInterval(function () {
      times++;
      if (initSwiper() || times > 30) {
        clearInterval(timer);
      }
    }, 100);
  }

  document.addEventListener('DOMContentLoaded', initWithRetry);
  window.addEventListener('load', initWithRetry);
  document.addEventListener('pjax:complete', initWithRetry);
  document.addEventListener('pjax:end', initWithRetry);
  document.addEventListener('pjax:success', initWithRetry);
})();
