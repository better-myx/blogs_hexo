/* ============================================================
   Hexo/Butterfly 图片灯箱（Fancybox v5）
   效果：文章内图片点击 → 灯箱相册（计数/左右切换/缩放/全屏/缩略图）
   解决的问题：
   1）关闭 hash（不再出现 #gallery-x），避免关闭灯箱触发 PJAX“像刷新一样”
   2）保证缩放功能可用（zoomIn/zoomOut/toggle1to1 生效）
   3）PJAX 切页后自动重新绑定，避免重复绑定/重复包裹
   4）不破坏外链图片（图片已在 a 里且 href 不是图片链接 → 跳过）
   ============================================================ */
   (function () {
    'use strict';
  
    // Fancybox 绑定选择器（全站统一用一个 gallery）
    const GALLERY = 'gallery';
    const SELECTOR = `[data-fancybox="${GALLERY}"]`;
  
    /* ------------------------------------------------------------
       找到文章内容容器（Butterfly 常见）
       ------------------------------------------------------------ */
    function getArticle() {
      return (
        document.querySelector('#article-container') ||
        document.querySelector('.post-content') ||
        document.querySelector('.article') ||
        document.querySelector('.post') ||
        document.querySelector('.markdown-body')
      );
    }
  
    /* ------------------------------------------------------------
       判断一个 href 是否“看起来像图片链接”
       ------------------------------------------------------------ */
    function isImageUrl(url) {
      return /\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?.*)?$/i.test(url || '');
    }
  
    /* ------------------------------------------------------------
       过滤掉不需要灯箱的图片（头像/侧栏/小图标等）
       ------------------------------------------------------------ */
    function shouldLightbox(img) {
      if (!img) return false;
  
      // 过滤太小的图（表情/图标）
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (w && h && (w < 90 || h < 90)) return false;
  
      // 过滤侧边栏/头像等区域
      if (img.closest('.avatar, .site-avatar, #aside-content, .aside-content, .card-widget')) return false;
  
      // 手动禁用：<img data-no-lightbox="true">
      if (img.getAttribute('data-no-lightbox') === 'true') return false;
  
      return true;
    }
  
    /* ------------------------------------------------------------
       获取图片真实地址（兼容懒加载/图床）
       - 优先 data-src / data-lazy-src
       - 再取 src
       ------------------------------------------------------------ */
    function getImgSrc(img) {
      return (
        img.getAttribute('data-src') ||
        img.getAttribute('data-lazy-src') ||
        img.getAttribute('src') ||
        ''
      );
    }
  
    /* ------------------------------------------------------------
       给文章内图片自动包裹 a[data-fancybox]，组成相册
       ------------------------------------------------------------ */
    function wrapImages() {
      const article = getArticle();
      if (!article) return;
  
      const imgs = article.querySelectorAll('img');
      imgs.forEach((img) => {
        if (!shouldLightbox(img)) return;
  
        const src = getImgSrc(img);
        if (!src) return;
  
        // 已经被我们包过就跳过
        if (img.closest(`a[data-fancybox="${GALLERY}"]`)) return;
  
        // 如果图片本来就在 a 标签里：
        // - 如果 a 的 href 也是图片链接：直接改成 fancybox gallery（不破坏原意）
        // - 如果 a 的 href 不是图片（比如跳转网页）：不动它，避免破坏外链
        const parentLink = img.closest('a');
        if (parentLink) {
          const href = parentLink.getAttribute('href') || '';
          if (isImageUrl(href)) {
            parentLink.setAttribute('data-fancybox', GALLERY);
            parentLink.setAttribute('data-caption', img.getAttribute('alt') || '');
          }
          return;
        }
  
        // 否则：创建 a 包裹
        const a = document.createElement('a');
        a.setAttribute('href', src);
        a.setAttribute('data-fancybox', GALLERY);
        a.setAttribute('data-caption', img.getAttribute('alt') || '');
  
        // 插入并包裹
        img.parentNode.insertBefore(a, img);
        a.appendChild(img);
      });
    }
  
    /* ------------------------------------------------------------
       绑定 Fancybox
       关键点：
       - Hash: false 关闭 hash（避免关闭时触发“像刷新一样”）
       - Images.zoom: true 确保缩放相关按钮生效
       ------------------------------------------------------------ */
    function bindFancybox() {
      if (!window.Fancybox) return;
  
      // 先销毁旧绑定，避免 PJAX 重复绑定导致异常
      try { window.Fancybox.destroy(); } catch (e) {}
  
      window.Fancybox.bind(SELECTOR, {
        animated: true,
        dragToClose: true,
        placeFocusBack: false,
  
        // ✅ 关闭 hash：不会再出现 #gallery-x，关闭灯箱也不会触发 PJAX 刷新感
        Hash: false,
  
        // ✅ 确保缩放功能可用
        Images: {
          zoom: true
        },
  
        // 缩略图：默认开启（更接近你参考图）
        Thumbs: {
          autoStart: true
        },
  
        // 工具栏布局
        Toolbar: {
          display: {
            left: ["infobar"],
            middle: ["zoomIn", "zoomOut", "toggle1to1", "rotateCCW", "rotateCW"],
            right: ["slideshow", "thumbs", "close"]
          }
        },
  
        // 让滚轮/触控板更顺滑（可选）
        wheel: "zoom"
      });
    }
  
    function init() {
      wrapImages();
      bindFancybox();
    }
  
    // 首次加载 + PJAX
    document.addEventListener('DOMContentLoaded', init);
    document.addEventListener('pjax:complete', init);
    document.addEventListener('pjax:end', init);
  })();
  