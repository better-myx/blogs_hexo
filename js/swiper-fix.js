(function () {
    function getSwiperInstance() {
      return window.swiper || window.SwiperInstance || window.mySwiper || window.__swiper__;
    }
  
    function fixSwiper() {
      const sw = getSwiperInstance();
      if (!sw || typeof sw.update !== 'function') return;
  
      sw.update();
      try { sw.slideTo(0, 0); } catch (e) {}
    }
  
    window.addEventListener('load', () => {
      fixSwiper();
      setTimeout(fixSwiper, 300);
      setTimeout(fixSwiper, 1000);
    });
  
    document.addEventListener('pjax:complete', () => {
      setTimeout(fixSwiper, 300);
    });
  })();
  