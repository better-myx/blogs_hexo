// =====================================================
// card_author_enhance.js
// 目标：只增强“作者卡片”（你已经改了 card_author.pug 的结构）
// - 站名：精灵探险家
// - 欢迎语：欢迎来到 精灵探险家🍭🍭🍭
// - Articles/Tags/Categories -> 中文（只改作者卡片）
// - 按钮：前往站长小窝 + 小车（移除左侧 GitHub 图标）
// - 社交：GitHub/B站/QQ/微信 -> iconfont svg（不匹配不动）
// 兼容 PJAX：DOMContentLoaded + pjax:complete
// =====================================================

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
  
  const SITE_DATA_TEXT_MAP = {
    Articles: '文章',
    Tags: '标签',
    Categories: '分类',
  };
  
  const CAR_ICON_ID = 'icon-xiaoqiche';
  
  // 你的 iconfont symbol id（按你的截图）
  // icon-github / icon-bilibili / icon-qq / icon-weixin
  const SOCIAL_ICON_MAP = [
    { match: /github/i, icon: 'icon-github' },
    { match: /bilibili/i, icon: 'icon-bilibili' },
    { match: /qq/i, icon: 'icon-qq' },
    { match: /weixin|wechat|qrcode|QRCode\.jpg/i, icon: 'icon-weixin' },
  ];
  
  function getCard() {
    return document.querySelector('#aside-content .card-widget.card-info');
  }
  
  /**
   * 站名 + 欢迎语（只改内容，不改位置）
   */
  function setNameAndDesc(card) {
    const nameEl = card.querySelector('.author-info__name');
    if (nameEl) nameEl.textContent = '精灵探险家';
  
    const desc = card.querySelector('.author-info__description');
    if (desc) desc.textContent = '欢迎来到 精灵探险家🍭🍭🍭';
  }
  
  /**
   * 统计文字改中文（只改作者卡片）
   */
  function injectSiteDataChinese(card) {
    const heads = card.querySelectorAll('.card-info-data .headline');
    heads.forEach((el) => {
      const t = (el.textContent || '').trim();
      if (SITE_DATA_TEXT_MAP[t]) el.textContent = SITE_DATA_TEXT_MAP[t];
    });
  }
  
  /**
   * 按钮：前往站长小窝 + 小车，并删除左侧 GitHub 图标
   */
  function injectButtonCar(card) {
    const btn = card.querySelector('#card-info-btn');
    if (!btn) return;
  
    // PJAX 防重复
    if (btn.dataset.enhanced === 'true') return;
  
    // 文案：确保只有一个 span
    let span = btn.querySelector('span');
    if (!span) {
      span = document.createElement('span');
      btn.appendChild(span);
    }
    span.textContent = '前往站长小窝';
  
    // 清理按钮里除 span 以外的图标（主题原来的 i）
    btn.querySelectorAll('i').forEach((el) => el.remove());
    btn.querySelectorAll('svg').forEach((el) => {
      // 如果 svg 在 span 里就不删（一般不会）
      if (!span.contains(el)) el.remove();
    });
  
    // 插入小车（避免重复）
    btn.insertAdjacentHTML(
      'beforeend',
      `
      <i class="faa-passing animated" style="padding-left:14px;display:inline-block;vertical-align:middle;">
        <svg class="icon" style="height:18px;width:18px;fill:currentColor;position:relative;top:2px">
          <use xlink:href="#${CAR_ICON_ID}"></use>
        </svg>
      </i>
      `
    );
  
    btn.classList.add('faa-parent', 'animated-hover');
    btn.dataset.enhanced = 'true';
  }
  
  /**
   * 社交图标替换为 iconfont（只改作者卡片底部社交）
   */
  function injectSocialIcons(card) {
    const box = card.querySelector('.card-info-social-icons');
    if (!box) return;
  
    const links = box.querySelectorAll('a');
    links.forEach((a) => {
      if (a.dataset.iconfontInjected === 'true') return;
  
      const title = (a.getAttribute('title') || '').trim();
      const href = (a.getAttribute('href') || '').trim();
  
      const hit = SOCIAL_ICON_MAP.find((x) => x.match.test(title) || x.match.test(href));
      if (!hit) return; // 不匹配不动，避免“少图标”
  
      a.classList.add('faa-parent', 'animated-hover');
      a.innerHTML = `
        <svg class="social_icon faa-tada" aria-hidden="true">
          <use xlink:href="#${hit.icon}"></use>
        </svg>
      `;
      a.dataset.iconfontInjected = 'true';
    });
  }
  
  async function run() {
    const card = getCard();
    if (!card) return;
  
    await waitForIconSprite(3000);
  
    setNameAndDesc(card);
    injectSiteDataChinese(card);
    injectButtonCar(card);
    injectSocialIcons(card);
  }
  
  document.addEventListener('DOMContentLoaded', run);
  document.addEventListener('pjax:complete', run);
  