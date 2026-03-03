/* ============================================================
   code-expand.js（最终精准版）
   目标：
   1）长代码默认截断，按钮展开/收起
   2）行号与代码同步滚动（.cb-scroll）
   3）点击工具栏“全屏/放大”：
      - 进入：自动展开 + 加 cb-fullpage（CSS 隐藏按钮）
      - 退出：恢复原状态（展开/截断保持不变）
   关键改动：
   - 不再用“面积识别全屏代码块”，而是从点击的工具栏按钮向上找到所属代码块
   ============================================================ */
   (function () {
    'use strict';
  
    const LIMIT = 260;
  
    // 节流
    let initTimer = null;
    function scheduleInit(root) {
      if (initTimer) return;
      initTimer = setTimeout(() => {
        initTimer = null;
        init(root);
      }, 60);
    }
  
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
  
    function ensureToggleBtn(block) {
      let btn = block.querySelector(':scope > .cb-toggle');
      if (btn) return btn;
  
      btn = document.createElement('button');
      btn.className = 'cb-toggle';
      btn.type = 'button';
      btn.textContent = '展开全部';
  
      btn.addEventListener('click', () => {
        const expanded = block.classList.toggle('cb-expanded');
        block.classList.toggle('cb-clamped', !expanded);
        btn.textContent = expanded ? '收起' : '展开全部';
      });
  
      block.appendChild(btn);
      return btn;
    }
  
    function enhanceBlock(block) {
      if (!block || !(block.matches && block.matches('figure.highlight, .highlight'))) return;
  
      const scroller = ensureScroller(block);
      if (!scroller) return;
  
      // 注意：cb-fullpage 状态由 applyFullpage 控制，这里不主动清
      const fullHeight = scroller.scrollHeight;
      const isLong = fullHeight > LIMIT + 8;
  
      if (!isLong) {
        block.classList.remove('cb-long', 'cb-clamped', 'cb-expanded');
        const btn = block.querySelector(':scope > .cb-toggle');
        if (btn) btn.remove();
        return;
      }
  
      block.classList.add('cb-long');
      block.style.setProperty('--cb-limit', LIMIT + 'px');
  
      // 默认截断（如果用户没展开过）
      if (!block.classList.contains('cb-expanded')) {
        block.classList.add('cb-clamped');
      }
  
      const btn = ensureToggleBtn(block);
      btn.textContent = block.classList.contains('cb-expanded') ? '收起' : '展开全部';
    }
  
    function init(root) {
      const scope = root && root.querySelectorAll ? root : document;
      const blocks = scope.querySelectorAll('figure.highlight, .highlight');
      blocks.forEach(enhanceBlock);
    }
  
    /* ============================================================
       ✅ 全屏逻辑（精准定位，不靠面积）
       ============================================================ */
  
    function savePrevState(block) {
      if (block.dataset.cbPrevSaved) return;
      block.dataset.cbPrevSaved = '1';
      block.dataset.cbPrevClamped = block.classList.contains('cb-clamped') ? '1' : '0';
      block.dataset.cbPrevExpanded = block.classList.contains('cb-expanded') ? '1' : '0';
    }
  
    function applyFullpage(block) {
      if (!block) return;
  
      savePrevState(block);
  
      ensureScroller(block);
  
      // ✅ 全屏标记：CSS 会隐藏按钮
      block.classList.add('cb-fullpage');
  
      // ✅ 全屏强制展开（你要的：自动展开、正常滚动）
      block.classList.add('cb-expanded');
      block.classList.remove('cb-clamped');
  
      // 同步按钮文案（虽然全屏会隐藏）
      const btn = block.querySelector(':scope > .cb-toggle');
      if (btn) btn.textContent = '收起';
    }
  
    function restoreFromFullpage(block) {
      if (!block) return;
  
      block.classList.remove('cb-fullpage');
  
      if (!block.dataset.cbPrevSaved) {
        // 没保存过就直接重新增强一下
        enhanceBlock(block);
        return;
      }
  
      const prevClamped = block.dataset.cbPrevClamped === '1';
      const prevExpanded = block.dataset.cbPrevExpanded === '1';
  
      // ✅ 恢复到进入全屏前的状态（你要的）
      block.classList.toggle('cb-expanded', prevExpanded);
      block.classList.toggle('cb-clamped', prevClamped);
  
      // 还原按钮文案
      const btn = ensureToggleBtn(block);
      btn.textContent = prevExpanded ? '收起' : '展开全部';
  
      delete block.dataset.cbPrevSaved;
      delete block.dataset.cbPrevClamped;
      delete block.dataset.cbPrevExpanded;
  
      // 全屏退出后再跑一遍增强，防止 DOM 被主题替换导致按钮丢
      enhanceBlock(block);
    }
  
    // 退出全屏时，可能不知道是哪一个 block，被标记的都还原
    function restoreAllFullpage() {
      const blocks = document.querySelectorAll('figure.highlight.cb-fullpage, .highlight.cb-fullpage');
      blocks.forEach(restoreFromFullpage);
    }
  
    /* ------------------------------------------------------------
       捕获工具栏“全屏/放大”按钮点击：
       - 直接拿到当前代码块并 apply/restore
       ------------------------------------------------------------ */
    function bindFullpageClick() {
      document.addEventListener('click', (e) => {
        const tools = e.target.closest && e.target.closest('.highlight-tools');
        if (!tools) return;
  
        const clickEl = e.target.closest('button, a, i, svg, span');
        if (!clickEl) return;
  
        const cls = (clickEl.className || '').toString();
        const aria = (clickEl.getAttribute && (clickEl.getAttribute('aria-label') || '')) || '';
        const title = (clickEl.getAttribute && (clickEl.getAttribute('title') || '')) || '';
        const inner = (e.target.className || '').toString();
        const key = (cls + ' ' + aria + ' ' + title + ' ' + inner).toLowerCase();
  
        // 命中全屏/放大/退出全屏关键词
        if (!/(fullpage|fullscreen|expand|compress|full-screen)/i.test(key)) return;
  
        const block = tools.closest('figure.highlight, .highlight');
        if (!block) return;
  
        // 点击时延迟一点点，等主题把全屏状态切换完（尤其移动端）
        setTimeout(() => {
          // 如果已经处于 fullpage，则认为是退出
          if (block.classList.contains('cb-fullpage')) {
            restoreFromFullpage(block);
          } else {
            applyFullpage(block);
          }
        }, 80);
      }, true);
    }
  
    /* ------------------------------------------------------------
       兜底：按 Esc 退出全屏时，恢复状态
       ------------------------------------------------------------ */
    function bindEscRestore() {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          setTimeout(() => restoreAllFullpage(), 80);
        }
      });
    }
  
    /* ------------------------------------------------------------
       监听 DOM 新增（PJAX/全屏可能插入节点）
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
  
      observer.observe(document.body, { childList: true, subtree: true });
    }
  
    document.addEventListener('DOMContentLoaded', () => {
      init();
      observeDom();
      bindFullpageClick();
      bindEscRestore();
    });
  
    document.addEventListener('pjax:complete', () => init());
    document.addEventListener('pjax:end', () => init());
  })();
  