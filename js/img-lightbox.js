/* ============================================================
   Hexo/Butterfly 图片灯箱（Fancybox v5）— 终极稳妥版（兼容 lazyload）
   思路：不再依赖提前包裹 <a>，而是“点击时”实时取真图地址并 Fancybox.show()
   解决：
   - lazyload 占位图导致 href 错误
   - PJAX 切页后绑定丢失/重复绑定
   - 不破坏外链图片（a[href] 非图片链接则放行）
   ============================================================ */
   (function () {
    'use strict';
  
    const GALLERY = 'gallery';
  
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
      ) {
        return false;
      }
  
      // 手动禁用：<img data-no-lightbox="true">
      if (img.getAttribute('data-no-lightbox') === 'true') return false;
  
      // 过滤太小的图（表情/图标）——注意：lazyload 未加载时 naturalWidth 可能为 0，所以要更宽松
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      if (w && h && (w < 90 || h < 90)) return false;
  
      return true;
    }
  
    // 尽可能从各种 lazyload/图床字段拿到“真图”
    function getRealSrc(img) {
      if (!img) return '';
  
      // 1) 常见 lazyload 字段
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
  
        // 2) srcset 有时才是高清真图
        img.getAttribute('data-srcset'),
        img.getAttribute('data-lazy-srcset'),
        img.dataset && img.dataset.srcset,
        img.dataset && img.dataset.lazySrcset,
  
        // 3) 最后才用 src（可能是占位）
        img.getAttribute('src')
      ].filter(Boolean);
  
      // srcset 取第一条 URL
      for (const v of candidates) {
        const s = String(v).trim();
        if (!s) continue;
  
        // srcset: "url1 1x, url2 2x"
        if (s.includes(',') || /\s+\d+[wx]\b/.test(s)) {
          const first = s.split(',')[0].trim().split(/\s+/)[0];
          if (first) return first;
        }
  
        // 普通 URL
        return s;
      }
  
      return '';
    }
  
    // 判断当前 img 是否“已经有真图了”（尽量避免拿 placeholder）
    function isProbablyPlaceholder(url) {
      if (!url) return true;
      // 常见占位特征（透明图、base64、小 gif 等）
      if (url.startsWith('data:')) return true;
      if (/placeholder|loading|lazy/i.test(url)) return true;
      return false;
    }
  
    // 收集文章内可用图片，生成 Fancybox items
    function collectGalleryItems(article) {
      const imgs = Array.from(article.querySelectorAll('img')).filter(shouldLightbox);
  
      const items = [];
      const mapImgToIndex = new Map();
  
      imgs.forEach((img) => {
        // 外链保护：如果在 a 中且 href 非图片链接，则这张图不进灯箱相册（也不拦截点击）
        const parentLink = img.closest('a');
        if (parentLink) {
          const href = parentLink.getAttribute('href') || '';
          if (href && !isImageUrl(href)) return;
        }
  
        let src = getRealSrc(img);
  
        // 如果 src 看起来像占位，且父级 a[href] 是图片，就用 a[href]
        if (isProbablyPlaceholder(src)) {
          const a = img.closest('a');
          if (a) {
            const href = a.getAttribute('href') || '';
            if (isImageUrl(href)) src = href;
          }
        }
  
        // 仍然拿不到就跳过
        if (!src || isProbablyPlaceholder(src)) return;
  
        const caption = img.getAttribute('alt') || img.getAttribute('title') || '';
  
        mapImgToIndex.set(img, items.length);
        items.push({
          src,
          type: 'image',
          caption
        });
      });
  
      return { items, mapImgToIndex };
    }
  
    function openLightboxAt(img) {
      if (!window.Fancybox) return;
  
      const article = getArticle();
      if (!article) return;
  
      const { items, mapImgToIndex } = collectGalleryItems(article);
      if (!items.length) return;
  
      // 找到当前点击图片在 items 里的索引
      let startIndex = mapImgToIndex.get(img);
  
      // 如果点击的这张因为“还没 lazyload 出真图”没进 items，那就尝试只开单张
      if (startIndex === undefined) {
        let one = getRealSrc(img);
        if (!one || isProbablyPlaceholder(one)) return;
  
        const caption = img.getAttribute('alt') || img.getAttribute('title') || '';
        window.Fancybox.show(
          [{ src: one, type: 'image', caption }],
          {
            Hash: false,
            Images: { zoom: true },
            Thumbs: { autoStart: true },
            Toolbar: {
              display: {
                left: ['infobar'],
                middle: ['zoomIn', 'zoomOut', 'toggle1to1', 'rotateCCW', 'rotateCW'],
                right: ['slideshow', 'thumbs', 'close']
              }
            },
            wheel: 'zoom'
          }
        );
        return;
      }
  
      window.Fancybox.show(items, {
        // ✅ 关闭 hash，避免 #gallery-x + PJAX 刷新感
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
  
        // ✅ 从点击的那张开始
        startIndex
      });
    }
  
    function bindClickDelegation() {
      const article = getArticle();
      if (!article) return;
  
      // 防重复绑定
      if (article.__lightboxBound) return;
      article.__lightboxBound = true;
  
      article.addEventListener(
        'click',
        function (e) {
          const img = e.target && e.target.closest && e.target.closest('img');
          if (!img) return;
  
          if (!shouldLightbox(img)) return;
  
          // 外链保护：图片在 a 内且 href 不是图片链接 → 放行，不拦截
          const parentLink = img.closest('a');
          if (parentLink) {
            const href = parentLink.getAttribute('href') || '';
            if (href && !isImageUrl(href)) return;
          }
  
          // ✅ 拦截默认行为，打开灯箱
          e.preventDefault();
          e.stopPropagation();
  
          openLightboxAt(img);
        },
        { passive: false }
      );
    }
  
    function init() {
      // Fancybox 未加载就不绑（避免报错）
      if (!window.Fancybox) return;
      bindClickDelegation();
    }
  
    document.addEventListener('DOMContentLoaded', init);
    document.addEventListener('pjax:complete', init);
    document.addEventListener('pjax:end', init);
  })();
  