/* ============================================================
   长代码块：截断 + “展开全部/收起”按钮（Hexo + Butterfly）
   ✅ 解决问题：
   1）行号与代码同步滚动（通过 .cb-scroll 包裹）
   2）长代码默认截断，底部按钮展开/收起
   3）Butterfly 全屏/放大后仍显示“截断内容”：
      - 监听全屏按钮点击
      - 识别“全屏中的代码块”（宽高接近视口）
      - 全屏时强制展开并隐藏按钮（CSS 控制）
      - 退出全屏后恢复原先状态（如果之前是截断/展开）
   4）避免卡顿：MutationObserver 只监听新增节点，不监听 attributes/class
   ============================================================ */
   (function () {
    'use strict';
  
    // 截断高度（单位：px），可按需调整：220 ~ 360
    const LIMIT = 260;
  
    // 简单节流，避免频繁扫描
    let initTimer = null;
    function scheduleInit(root) {
      if (initTimer) return;
      initTimer = setTimeout(() => {
        initTimer = null;
        init(root);
      }, 60);
    }
  
    /* ------------------------------------------------------------
       为代码块创建滚动包裹层 .cb-scroll（让行号和代码一起滚动）
       ------------------------------------------------------------ */
    function ensureScroller(block) {
      const table = block.querySelector('table');
      const pre =
        block.querySelector('.code pre') ||
        block.querySelector('pre') ||
        block.querySelector('code');
  
      const target = table || pre;
      if (!target) return null;
  
      let scroller = block.querySelector(':scope > .cb-scroll');
      if (!scroller) {
        scroller = document.createElement('div');
        scroller.className = 'cb-scroll';
        target.parentNode.insertBefore(scroller, target);
        scroller.appendChild(target);
      }
      return scroller;
    }
  
    /* ------------------------------------------------------------
       增强单个代码块：判断长短 + 添加按钮 + 默认截断
       ------------------------------------------------------------ */
    function enhanceBlock(block) {
      if (!block || !(block.matches && block.matches('figure.highlight, .highlight'))) return;
  
      const scroller = ensureScroller(block);
      if (!scroller) return;
  
      const fullHeight = scroller.scrollHeight;
      const isLong = fullHeight > LIMIT + 8;
  
      if (!isLong) {
        // 不够长：清理长代码相关 class
        block.classList.remove('cb-long', 'cb-clamped', 'cb-expanded', 'cb-fullpage');
        return;
      }
  
      // 长代码：默认截断
      block.classList.add('cb-long', 'cb-clamped');
      block.style.setProperty('--cb-limit', LIMIT + 'px');
  
      // 创建底部按钮（只创建一次）
      if (!block.querySelector(':scope > .cb-toggle')) {
        const btn = document.createElement('button');
        btn.className = 'cb-toggle';
        btn.type = 'button';
        btn.setAttribute('aria-label', '展开全部代码');
        btn.textContent = '展开全部';
  
        btn.addEventListener('click', () => {
          const expanded = block.classList.toggle('cb-expanded');
          block.classList.toggle('cb-clamped', !expanded);
          btn.textContent = expanded ? '收起' : '展开全部';
        });
  
        block.appendChild(btn);
      }
    }
  
    /* ------------------------------------------------------------
       识别“全屏中的代码块”
       逻辑：找出占据视口面积最大的代码块（宽高都接近窗口）
       ------------------------------------------------------------ */
    function findFullpageCodeBlock() {
      const blocks = document.querySelectorAll('figure.highlight, .highlight');
      let best = null;
      let bestScore = 0;
  
      const vw = window.innerWidth;
      const vh = window.innerHeight;
  
      blocks.forEach((b) => {
        const rect = b.getBoundingClientRect();
  
        // 过滤掉不可见/太小的
        if (rect.width < vw * 0.6) return;
        if (rect.height < vh * 0.5) return;
  
        // 评分：面积占比越大越可能是全屏
        const score = (rect.width / vw) * (rect.height / vh);
        if (score > bestScore) {
          bestScore = score;
          best = b;
        }
      });
  
      return best;
    }
  
    /* ------------------------------------------------------------
       进入全屏：强制展开（并保存原状态，退出时可还原）
       ------------------------------------------------------------ */
    function applyFullpage(block) {
      if (!block) return;
  
      // 保存原状态（只保存一次）
      if (!block.dataset.cbPrevSaved) {
        block.dataset.cbPrevSaved = '1';
        block.dataset.cbPrevClamped = block.classList.contains('cb-clamped') ? '1' : '0';
        block.dataset.cbPrevExpanded = block.classList.contains('cb-expanded') ? '1' : '0';
      }
  
      // 确保结构存在
      ensureScroller(block);
  
      // 全屏标记：CSS 会取消截断并隐藏按钮
      block.classList.add('cb-fullpage');
  
      // 强制展开
      block.classList.add('cb-expanded');
      block.classList.remove('cb-clamped');
  
      // 按钮文案同步（虽然全屏里会隐藏，但保持状态一致）
      const btn = block.querySelector(':scope > .cb-toggle');
      if (btn) btn.textContent = '收起';
    }
  
    /* ------------------------------------------------------------
       退出全屏：恢复原状态
       ------------------------------------------------------------ */
    function restoreFromFullpage(block) {
      if (!block) return;
      if (!block.classList.contains('cb-fullpage')) return;
  
      block.classList.remove('cb-fullpage');
  
      // 如果没保存过，就不动
      if (!block.dataset.cbPrevSaved) return;
  
      const prevClamped = block.dataset.cbPrevClamped === '1';
      const prevExpanded = block.dataset.cbPrevExpanded === '1';
  
      // 恢复状态
      block.classList.toggle('cb-expanded', prevExpanded);
      block.classList.toggle('cb-clamped', prevClamped);
  
      // 还原按钮文案
      const btn = block.querySelector(':scope > .cb-toggle');
      if (btn) btn.textContent = prevExpanded ? '收起' : '展开全部';
  
      // 清理保存标记（下次全屏重新保存）
      delete block.dataset.cbPrevSaved;
      delete block.dataset.cbPrevClamped;
      delete block.dataset.cbPrevExpanded;
    }
  
    function restoreAllFullpage() {
      const blocks = document.querySelectorAll('figure.highlight.cb-fullpage, .highlight.cb-fullpage');
      blocks.forEach(restoreFromFullpage);
    }
  
    /* ------------------------------------------------------------
       处理全屏按钮点击：
       - 点击后稍微延迟，等待主题把全屏 DOM / 样式切换完成
       - 然后识别全屏代码块并强制展开
       - 如果识别不到（说明退出全屏），就还原
       ------------------------------------------------------------ */
    function handleFullpageToggle() {
      setTimeout(() => {
        const fp = findFullpageCodeBlock();
        if (fp) {
          applyFullpage(fp);
        } else {
          restoreAllFullpage();
        }
      }, 80);
    }
  
    /* ------------------------------------------------------------
       初始化：扫描页面上所有代码块
       ------------------------------------------------------------ */
    function init(root) {
      const scope = root && root.querySelectorAll ? root : document;
      const blocks = scope.querySelectorAll('figure.highlight, .highlight');
      blocks.forEach(enhanceBlock);
    }
  
    /* ------------------------------------------------------------
       监听 DOM 新增节点（PJAX/全屏有时会插入新 DOM）
       - 只监听 childList/subtree，避免监听 attributes 导致卡顿
       ------------------------------------------------------------ */
    function observeDom() {
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (!m.addedNodes || !m.addedNodes.length) continue;
  
          m.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;
            if (node.matches && node.matches('figure.highlight, .highlight')) {
              scheduleInit(node.parentElement || document);
              return;
            }
            if (node.querySelector && node.querySelector('figure.highlight, .highlight')) {
              scheduleInit(node);
            }
          });
        }
      });
  
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  
    /* ------------------------------------------------------------
       全局点击监听：捕获 Butterfly 代码块工具栏“全屏/放大”按钮点击
       说明：不同版本按钮 class 不同，所以用更宽松的匹配策略：
       - 点击发生在 .highlight-tools 内
       - 点击的元素或其父级包含 “expand/fullpage/fullscreen/compress” 关键词
       ------------------------------------------------------------ */
    function bindFullpageClick() {
      document.addEventListener('click', (e) => {
        const tools = e.target.closest && e.target.closest('.highlight-tools');
        if (!tools) return;
  
        const btn = e.target.closest('button, a, i, svg, span');
        if (!btn) return;
  
        const cls = (btn.className || '').toString();
        const aria = (btn.getAttribute && (btn.getAttribute('aria-label') || '')) || '';
        const title = (btn.getAttribute && (btn.getAttribute('title') || '')) || '';
  
        // 宽松判断：命中“全屏/放大/退出全屏”等关键词
        if (/fullpage|fullscreen|expand|compress|full-screen/i.test(cls + ' ' + aria + ' ' + title)) {
          handleFullpageToggle();
        } else {
          // 有些主题按钮没有 class，但图标类名在子元素上
          const inner = (e.target.className || '').toString();
          if (/expand|compress|full/i.test(inner)) {
            handleFullpageToggle();
          }
        }
      }, true);
    }
  
    // 首次加载
    document.addEventListener('DOMContentLoaded', () => {
      init();
      observeDom();
      bindFullpageClick();
    });
  
    // PJAX 跳转后重新执行
    document.addEventListener('pjax:complete', () => init());
    document.addEventListener('pjax:end', () => init());
  })();
  