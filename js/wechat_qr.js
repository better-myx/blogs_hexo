// =====================================================
// wechat_qr.js (Final Stable)
// - PC：hover 显示二维码气泡
// - Mobile：点击图标弹出 modal
// - 事件委托：永远拦截跳转（不怕 PJAX / 动态渲染）
// =====================================================

const WECHAT_QR_URL = 'https://img.66686666.xyz/img/common/wechat.jpg';
const WECHAT_QR_TEXT = '微信扫一扫';

function ensureModal() {
  if (document.getElementById('wechat-qr-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'wechat-qr-modal';
  modal.className = 'hidden';
  modal.innerHTML = `
    <div class="wechat-qr-mask"></div>
    <div class="wechat-qr-card" role="dialog" aria-modal="true">
      <div class="wechat-qr-close" aria-label="close">×</div>
      <img id="wechat-qr-modal-img" alt="wechat qr" />
      <div class="wechat-qr-title">${WECHAT_QR_TEXT}</div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.classList.add('hidden');
  modal.querySelector('.wechat-qr-mask').addEventListener('click', close);
  modal.querySelector('.wechat-qr-close').addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

function openModal() {
  ensureModal();
  const modal = document.getElementById('wechat-qr-modal');
  const img = document.getElementById('wechat-qr-modal-img');
  img.src = WECHAT_QR_URL;
  modal.classList.remove('hidden');
}

function isWechatAnchor(a) {
  if (!a) return false;

  // 1) title 匹配（你的配置 title 就是“微信”）
  const title = (a.getAttribute('title') || '').trim();
  if (title === '微信') return true;

  // 2) iconfont use 匹配（#icon-weixin）
  if (a.querySelector('use[xlink\\:href="#icon-weixin"], use[href="#icon-weixin"]')) return true;

  return false;
}

function injectPop(a) {
  if (a.dataset.wechatQrEnhanced === 'true') return;

  a.classList.add('wechat-qr-trigger');

  // hover 气泡（PC 用）
  if (!a.querySelector('.wechat-qr-pop')) {
    const pop = document.createElement('span');
    pop.className = 'wechat-qr-pop';
    pop.innerHTML = `
      <img src="${WECHAT_QR_URL}" alt="wechat qr" />
      <div class="wechat-qr-text">${WECHAT_QR_TEXT}</div>
    `;
    a.appendChild(pop);
  }

  a.dataset.wechatQrEnhanced = 'true';
}

function scanAndEnhance() {
  // 只扫描可能的社交区域，减少误伤
  const scopeSelectors = [
    '#aside-content .card-info-social-icons a',
    '#page-header #hero_social_icons a',
    '#page-header #site_social_icons a',
    'a.social-icon',
    'a.hero-social-icon',
  ];

  const anchors = document.querySelectorAll(scopeSelectors.join(','));
  anchors.forEach((a) => {
    if (isWechatAnchor(a)) injectPop(a);
  });
}

// ========== 事件委托：永远拦截“微信点击” ==========
function bindDelegationOnce() {
  if (window.__wechatQrDelegationBound) return;
  window.__wechatQrDelegationBound = true;

  // capture 阶段先拦截，保证不会被 target=_blank / 其它监听抢先跳走
  document.addEventListener(
    'click',
    (e) => {
      const a = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!a) return;
      if (!isWechatAnchor(a) && !a.classList.contains('wechat-qr-trigger')) return;

      // 只处理微信
      if (!isWechatAnchor(a) && !a.querySelector('.wechat-qr-pop')) return;

      e.preventDefault();
      e.stopPropagation();
      openModal();
    },
    true
  );
}

function runWechatQR() {
  bindDelegationOnce();
  scanAndEnhance();
}

document.addEventListener('DOMContentLoaded', runWechatQR);
document.addEventListener('pjax:complete', runWechatQR);
