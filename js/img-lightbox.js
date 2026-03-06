/* ============================================================
   Hexo/Butterfly 图片灯箱（Fancybox v5）— 点击时打开（兼容 lazyload）
   - 不依赖提前包裹 <a>，点击时实时取真图 Fancybox.show()
   - PJAX 切页自动重新生效（事件委托 + 防重复绑定）
   - 不破坏外链（img 在 a 内且 href 不是图片链接 → 放行）
   - 给“可打开灯箱”的图片加 class：.img-lightbox-clickable（用于 cursor:pointer）
   ============================================================ */
   (function () {
    'use strict';
  
    const CLICKABLE_CLASS = 'img-lightbox-clickable';
  
    function getArticle() {
      return (
        document.querySelector('#article-container') ||
        document.querySelector('.post-content') ||
        document.querySelector('.article') ||
        document.querySelector('.post') ||
        document.querySelector('.markdown-body')
      );
    }
  
    function isImageUrl(url) {
      return /\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?.*)?$/i.test(url || '');
    }
  
    function shouldLightbox(img) {
      if (!img) return false;
  
      // 过滤侧边栏/头像等区域
      if (
        img.closest(
          '.avatar, .site-avatar, #aside-content, .aside-content, .card-widget'
        )
      ) return false;
  
      // 手动禁用
      if (img.getAttribute('data-no-lightbox') === 'true') return false;
  
      // 小图（表情/图标）过滤：lazyload 未加载时 naturalWidth 可能为 0，所以只在有尺寸时判断
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      if (w && h && (w < 90 || h < 90)) return false;
  
      return true;
    }
  
    // 尽量拿到真图地址（兼容常见 lazyload 字段 + srcset）
    function getRealSrc(img) {
      if (!img) return '';
  
      const candidates = [
        img.getAttribute('data-src'),
        img.getAttribute('data-lazy-src'),
        img.getAttribute('data-original'),
        img.getAttribute('data-zoom-image'),
        img.getAttribute('data-img'),
        img.getAttribute('data-lazy'),
        img.dataset && img.dataset.src,
        img.dataset && img.dataset.lazySrc,
        img.dataset && img.dataset.original,
  
        img.getAttribute('data-srcset'),
        img.getAttribute('data-lazy-srcset'),
        img.dataset && img.dataset.srcset,
        img.dataset && img.dataset.lazySrcset,
  
        img.getAttribute('srcset'),
        img.getAttribute('src')
      ].filter(Boolean);
  
      for (const v of candidates) {
        const s = String(v).trim();
        if (!s) continue;
  
        // srcset: "url1 1x, url2 2x"
        if (s.includes(',') || /\s+\d+[wx]\b/.test(s)) {
          const first = s.split(',')[0].trim().split(/\s+/)[0];
          if (first) return first;
        }
  
        return s;
      }
  
      return '';
    }
  
    function isProbablyPlaceholder(url) {
      if (!url) return true;
      if (url.startsWith('data:')) return true;
      if (/placeholder|loading|lazy/i.test(url)) return true;
      return false;
    }
  
    // 这张 img 是否“应该放行外链”
    function isExternalLinkImage(img) {
      const parentLink = img.closest('a');
      if (!parentLink) return false;
      const href = parentLink.getAttribute('href') || '';
      return href && !isImageUrl(href);
    }
  
    function collectGalleryItems(article) {
      const imgs = Array.from(article.querySelectorAll('img')).filter(shouldLightbox);
  
      const items = [];
      const mapImgToIndex = new Map();
  
      imgs.forEach((img) => {
        if (isExternalLinkImage(img)) return;
  
        let src = getRealSrc(img);
  
        // 如果像占位图，且父级 a[href] 是图片，用 a[href]
        if (isProbablyPlaceholder(src)) {
          const a = img.closest('a');
          if (a) {
            const href = a.getAttribute('href') || '';
            if (isImageUrl(href)) src = href;
          }
        }
  
        if (!src || isProbablyPlaceholder(src)) return;
  
        const caption = img.getAttribute('alt') || img.getAttribute('title') || '';
  
        mapImgToIndex.set(img, items.length);
        items.push({ src, type: 'image', caption });
      });
  
      return { items, mapImgToIndex };
    }
  
    function showFancybox(items, startIndex) {
      window.Fancybox.show(items, {
        Hash: false,
        animated: true,
        dragToClose: true,
        placeFocusBack: false,
        Images: { zoom: true },
        Thumbs: { autoStart: true },
        Toolbar: {
          display: {
            left: ['infobar'],
            middle: ['zoomIn', 'zoomOut', 'toggle1to1', 'rotateCCW', 'rotateCW'],
            right: ['slideshow', 'thumbs', 'close']
          }
        },
        wheel: 'zoom',
        startIndex
      });
    }
  
    function openLightboxAt(img) {
      if (!window.Fancybox) return;
  
      const article = getArticle();
      if (!article) return;
  
      const { items, mapImgToIndex } = collectGalleryItems(article);
  
      // 点的那张可能没进 items（还没懒加载出真图），就单张打开
      const startIndex = mapImgToIndex.get(img);
      if (startIndex === undefined) {
        const one = getRealSrc(img);
        if (!one || isProbablyPlaceholder(one)) return;
  
        const caption = img.getAttribute('alt') || img.getAttribute('title') || '';
        showFancybox([{ src: one, type: 'image', caption }], 0);
        return;
      }
  
      if (items.length) showFancybox(items, startIndex);
    }
  
    // 给“可点开灯箱”的图片打标（用于 cursor:pointer）
    function markClickableImages() {
      const article = getArticle();
      if (!article) return;
  
      article.querySelectorAll('img').forEach((img) => {
        img.classList.remove(CLICKABLE_CLASS);
  
        if (!shouldLightbox(img)) return;
        if (isExternalLinkImage(img)) return;
  
        // 只要不是明确占位图，就标记为可点击（占位图往往滚动后会变真图）
        img.classList.add(CLICKABLE_CLASS);
      });
    }
  
    function bindClickDelegation() {
      const article = getArticle();
      if (!article) return;
  
      if (article.__lightboxBound) return;
      article.__lightboxBound = true;
  
      article.addEventListener(
        'click',
        function (e) {
          const img = e.target && e.target.closest && e.target.closest('img');
          if (!img) return;
  
          if (!shouldLightbox(img)) return;
  
          // 外链保护：放行
          if (isExternalLinkImage(img)) return;
  
          e.preventDefault();
          e.stopPropagation();
  
          openLightboxAt(img);
        },
        { passive: false }
      );
  
      // 懒加载完成后，重新标记一次（让 pointer 能跟上）
      article.addEventListener(
        'load',
        function (e) {
          const img = e.target && e.target.tagName === 'IMG' ? e.target : null;
          if (!img) return;
          markClickableImages();
        },
        true
      );
    }
  
    function init() {
      if (!window.Fancybox) return;
      bindClickDelegation();
      markClickableImages();
    }
  
    document.addEventListener('DOMContentLoaded', init);
    document.addEventListener('pjax:complete', init);
    document.addEventListener('pjax:end', init);
  })();
  