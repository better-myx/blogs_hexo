// source/js/holiday_greeting.js
// 🎊 中国节日问候弹窗 —— 每逢节日当天，每次打开都弹出温馨祝福
(() => {
    'use strict';
  
    // ================================================================
    // 🗓️ 节日数据表
    // 格式: 'YYYY-MM-DD': { name, emoji, greeting, desc, color }
    // ✏️ 说明:
    //   - 清明、冬至 为公历，每年相差不大（± 1天）
    //   - 其余均为农历转公历，每年需核对更新
    //   - 建议每年年初在「中国日历」类网站核对并补充新一年数据
    // ================================================================
    const HOLIDAYS = {
  
      // ══════════════════════════════
      //  2025 年
      // ══════════════════════════════
      '2025-01-29': {
        name: '春节', emoji: '🧨', subEmoji: '🎊🎉',
        greeting: '新春大吉，万事如意！',
        desc: '爆竹声中一岁除，春风送暖入屠苏。\n千门万户曈曈日，总把新桃换旧符。',
        color: '#e74c3c', bg: 'rgba(231,76,60,0.08)',
      },
      '2025-02-12': {
        name: '元宵节', emoji: '🏮', subEmoji: '🌕✨',
        greeting: '元宵节快乐，花好月圆！',
        desc: '火树银花合，星桥铁锁开。\n灯树千光照，明月逐人来。',
        color: '#e67e22', bg: 'rgba(230,126,34,0.08)',
      },
      '2025-03-01': {
        name: '龙抬头', emoji: '🐉', subEmoji: '☁️🌧️',
        greeting: '二月二，龙抬头，大家都抬头！',
        desc: '金鳞化作春雨洒，万紫千红分外娇。\n今日剃头鸿运来，龙年好运伴你行。',
        color: '#27ae60', bg: 'rgba(39,174,96,0.08)',
      },
      '2025-04-04': {
        name: '清明节', emoji: '🌿', subEmoji: '🌸🍃',
        greeting: '清明时节，思念绵绵',
        desc: '清明时节雨纷纷，路上行人欲断魂。\n踏青赏春，缅怀先人，愿逝者安息。',
        color: '#2ecc71', bg: 'rgba(46,204,113,0.07)',
      },
      '2025-05-31': {
        name: '端午节', emoji: '🎋', subEmoji: '🛶🧉',
        greeting: '端午安康，粽情粽意！',
        desc: '节分端午自谁言，万古传闻为屈原。\n粽叶飘香，龙舟竞渡，佳节安康！',
        color: '#16a085', bg: 'rgba(22,160,133,0.08)',
      },
      '2025-08-02': {
        name: '七夕节', emoji: '🌌', subEmoji: '💫💕',
        greeting: '七夕快乐，愿有人陪你看星星！',
        desc: '纤云弄巧，飞星传恨，银汉迢迢暗度。\n金风玉露一相逢，便胜却人间无数。',
        color: '#8e44ad', bg: 'rgba(142,68,173,0.08)',
      },
      '2025-08-10': {
        name: '中元节', emoji: '🕯️', subEmoji: '🪷🙏',
        greeting: '中元祭祖，慎终追远',
        desc: '慎终追远，民德归厚矣。\n愿逝去的亲人在天堂安好，护佑家人平安。',
        color: '#7f8c8d', bg: 'rgba(127,140,141,0.08)',
      },
      '2025-10-06': {
        name: '中秋节', emoji: '🌕', subEmoji: '🥮🐰',
        greeting: '中秋节快乐，月圆人团圆！',
        desc: '但愿人长久，千里共婵娟。\n明月几时有？把酒问青天。',
        color: '#f39c12', bg: 'rgba(243,156,18,0.08)',
      },
      '2025-10-29': {
        name: '重阳节', emoji: '🌼', subEmoji: '🏔️🍵',
        greeting: '重阳节快乐，登高望远！',
        desc: '独在异乡为异客，每逢佳节倍思亲。\n遥知兄弟登高处，遍插茱萸少一人。',
        color: '#d35400', bg: 'rgba(211,84,0,0.08)',
      },
      '2025-12-22': {
        name: '冬至', emoji: '❄️', subEmoji: '🥟🍲',
        greeting: '冬至快乐，吃汤圆啦～',
        desc: '天时人事日相催，冬至阳生春又来。\n冬至到，一阳生，从此白昼渐渐长。',
        color: '#2980b9', bg: 'rgba(41,128,185,0.08)',
      },
  
      // 2025 农历年 → 公历 2026 年初的节日
      '2026-01-17': {
        name: '腊八节', emoji: '🥣', subEmoji: '🫘🍯',
        greeting: '腊八节快乐，喝碗腊八粥暖暖身！',
        desc: '过了腊八就是年，香甜腊八粥，寓意五谷丰登。\n愿你生活甜蜜，幸福绵长～',
        color: '#c0392b', bg: 'rgba(192,57,43,0.08)',
      },
      '2026-02-07': {
        name: '小年', emoji: '🏠', subEmoji: '🧹🎆',
        greeting: '小年到啦，新年脚步近了！',
        desc: '腊月二十三，灶王上天去，言好事，降吉祥。\n扫尘迎新，辞旧迎新，新年大吉！',
        color: '#e74c3c', bg: 'rgba(231,76,60,0.08)',
      },
      '2026-02-16': {
        name: '除夕', emoji: '🎆', subEmoji: '🧨🎊',
        greeting: '除夕快乐！旧岁辞去，新年将至！',
        desc: '旧岁已展千重锦，新年再展一段长。\n守岁迎新春，愿你新的一年平安喜乐！',
        color: '#e74c3c', bg: 'rgba(231,76,60,0.08)',
      },
  
      // ══════════════════════════════
      //  2026 年
      // ══════════════════════════════
      '2026-02-17': {
        name: '春节', emoji: '🧨', subEmoji: '🎊🎉',
        greeting: '丙午年新春大吉，万事如意！',
        desc: '爆竹声中一岁除，春风送暖入屠苏。\n千门万户曈曈日，总把新桃换旧符。',
        color: '#e74c3c', bg: 'rgba(231,76,60,0.08)',
      },
      '2026-03-03': {
        name: '元宵节', emoji: '🏮', subEmoji: '🌕✨',
        greeting: '元宵节快乐，花好月圆！',
        desc: '火树银花合，星桥铁锁开。\n灯树千光照，明月逐人来。',
        color: '#e67e22', bg: 'rgba(230,126,34,0.08)',
      },
      '2026-03-20': {
        name: '龙抬头', emoji: '🐉', subEmoji: '☁️🌧️',
        greeting: '二月二，龙抬头，鸿运当头！',
        desc: '金鳞化作春雨洒，万紫千红分外娇。\n今日龙气升，好运自然来～',
        color: '#27ae60', bg: 'rgba(39,174,96,0.08)',
      },
      '2026-04-05': {
        name: '清明节', emoji: '🌿', subEmoji: '🌸🍃',
        greeting: '清明时节，思念绵绵',
        desc: '清明时节雨纷纷，路上行人欲断魂。\n踏青赏春，缅怀先人，愿逝者安息。',
        color: '#2ecc71', bg: 'rgba(46,204,113,0.07)',
      },
      '2026-06-19': {
        name: '端午节', emoji: '🎋', subEmoji: '🛶🧉',
        greeting: '端午安康，粽情粽意！',
        desc: '节分端午自谁言，万古传闻为屈原。\n粽叶飘香，龙舟竞渡，佳节安康！',
        color: '#16a085', bg: 'rgba(22,160,133,0.08)',
      },
      '2026-08-20': {
        name: '七夕节', emoji: '🌌', subEmoji: '💫💕',
        greeting: '七夕快乐，愿有人陪你看星星！',
        desc: '纤云弄巧，飞星传恨，银汉迢迢暗度。\n金风玉露一相逢，便胜却人间无数。',
        color: '#8e44ad', bg: 'rgba(142,68,173,0.08)',
      },
      '2026-09-25': {
        name: '中秋节', emoji: '🌕', subEmoji: '🥮🐰',
        greeting: '中秋节快乐，月圆人团圆！',
        desc: '但愿人长久，千里共婵娟。\n明月几时有？把酒问青天。',
        color: '#f39c12', bg: 'rgba(243,156,18,0.08)',
      },
      '2026-10-16': {
        name: '重阳节', emoji: '🌼', subEmoji: '🏔️🍵',
        greeting: '重阳节快乐，登高望远！',
        desc: '独在异乡为异客，每逢佳节倍思亲。\n遥知兄弟登高处，遍插茱萸少一人。',
        color: '#d35400', bg: 'rgba(211,84,0,0.08)',
      },
      '2026-12-22': {
        name: '冬至', emoji: '❄️', subEmoji: '🥟🍲',
        greeting: '冬至快乐，吃汤圆啦～',
        desc: '天时人事日相催，冬至阳生春又来。\n冬至到，一阳生，从此白昼渐渐长。',
        color: '#2980b9', bg: 'rgba(41,128,185,0.08)',
      },
  
      // ══════════════════════════════
      //  2027 年（参考值，建议每年年初核对）
      // ══════════════════════════════
      '2027-02-06': {
        name: '春节', emoji: '🧨', subEmoji: '🎊🎉',
        greeting: '丁未年新春大吉，万事如意！',
        desc: '爆竹声中一岁除，春风送暖入屠苏。\n千门万户曈曈日，总把新桃换旧符。',
        color: '#e74c3c', bg: 'rgba(231,76,60,0.08)',
      },
      '2027-02-20': {
        name: '元宵节', emoji: '🏮', subEmoji: '🌕✨',
        greeting: '元宵节快乐，花好月圆！',
        desc: '火树银花合，星桥铁锁开。\n灯树千光照，明月逐人来。',
        color: '#e67e22', bg: 'rgba(230,126,34,0.08)',
      },
      '2027-04-05': {
        name: '清明节', emoji: '🌿', subEmoji: '🌸🍃',
        greeting: '清明时节，思念绵绵',
        desc: '清明时节雨纷纷，路上行人欲断魂。\n踏青赏春，缅怀先人，愿逝者安息。',
        color: '#2ecc71', bg: 'rgba(46,204,113,0.07)',
      },
      '2027-06-09': {
        name: '端午节', emoji: '🎋', subEmoji: '🛶🧉',
        greeting: '端午安康，粽情粽意！',
        desc: '节分端午自谁言，万古传闻为屈原。\n粽叶飘香，龙舟竞渡，佳节安康！',
        color: '#16a085', bg: 'rgba(22,160,133,0.08)',
      },
      '2027-10-15': {
        name: '中秋节', emoji: '🌕', subEmoji: '🥮🐰',
        greeting: '中秋节快乐，月圆人团圆！',
        desc: '但愿人长久，千里共婵娟。\n明月几时有？把酒问青天。',
        color: '#f39c12', bg: 'rgba(243,156,18,0.08)',
      },
      '2027-12-22': {
        name: '冬至', emoji: '❄️', subEmoji: '🥟🍲',
        greeting: '冬至快乐，吃汤圆啦～',
        desc: '天时人事日相催，冬至阳生春又来。',
        color: '#2980b9', bg: 'rgba(41,128,185,0.08)',
      },
  
      // ══════════════════════════════
      //  2028 年（参考值）
      // ══════════════════════════════
      '2028-01-26': {
        name: '春节', emoji: '🧨', subEmoji: '🎊🎉',
        greeting: '戊申年新春大吉，万事如意！',
        desc: '爆竹声中一岁除，春风送暖入屠苏。',
        color: '#e74c3c', bg: 'rgba(231,76,60,0.08)',
      },
      '2028-04-04': {
        name: '清明节', emoji: '🌿', subEmoji: '🌸🍃',
        greeting: '清明时节，思念绵绵',
        desc: '清明时节雨纷纷，路上行人欲断魂。',
        color: '#2ecc71', bg: 'rgba(46,204,113,0.07)',
      },
      '2028-09-22': {
        name: '中秋节', emoji: '🌕', subEmoji: '🥮🐰',
        greeting: '中秋节快乐，月圆人团圆！',
        desc: '但愿人长久，千里共婵娟。',
        color: '#f39c12', bg: 'rgba(243,156,18,0.08)',
      },
      '2028-12-21': {
        name: '冬至', emoji: '❄️', subEmoji: '🥟🍲',
        greeting: '冬至快乐，吃汤圆啦～',
        desc: '冬至到，一阳生，从此白昼渐渐长。',
        color: '#2980b9', bg: 'rgba(41,128,185,0.08)',
      },
  
    }; // ← HOLIDAYS 结束
  
    // ================================================================
    // 🔧 核心逻辑
    // ================================================================
  
    /** 获取今日 YYYY-MM-DD 字符串 */
    function todayStr() {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  
    /** 检测今天是否有节日 */
    function getTodayHoliday() {
      return HOLIDAYS[todayStr()] || null;
    }
  
    // ================================================================
    // 🎨 弹窗 DOM 注入
    // ================================================================
  
    function ensureHolidayDOM() {
      if (document.getElementById('holiday-greeting-overlay')) return;
  
      const el = document.createElement('div');
      el.innerHTML = `
        <div id="holiday-greeting-overlay" aria-modal="true" role="dialog">
          <div id="holiday-greeting-card">
            <!-- 装饰粒子 -->
            <div class="hg-particles" id="hg-particles"></div>
  
            <!-- 大 emoji -->
            <div class="hg-main-emoji" id="hg-main-emoji"></div>
  
            <!-- 副 emoji 装饰 -->
            <div class="hg-sub-emojis" id="hg-sub-emojis"></div>
  
            <!-- 节日名 -->
            <div class="hg-name" id="hg-name"></div>
  
            <!-- 祝福语 -->
            <div class="hg-greeting" id="hg-greeting"></div>
  
            <!-- 古诗 / 描述 -->
            <div class="hg-desc" id="hg-desc"></div>
  
            <!-- 日期 -->
            <div class="hg-date" id="hg-date"></div>
  
            <!-- 确认按钮 -->
            <button class="hg-btn" id="hg-btn" type="button">
              <span>知道啦，继续浏览</span>
              <span class="hg-btn-arrow">→</span>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(el);
  
      // 点击蒙层/按钮关闭
      document.getElementById('hg-btn').addEventListener('click', closeHolidayGreeting);
      document.getElementById('holiday-greeting-overlay').addEventListener('click', function(e) {
        if (e.target === this) closeHolidayGreeting();
      });
  
      // ESC 关闭
      document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
          closeHolidayGreeting();
          document.removeEventListener('keydown', escHandler);
        }
      });
    }
  
    /** 生成彩色粒子 */
    function spawnParticles(container, color) {
      const emojis = ['✨', '🌟', '⭐', '💫', '🎊', '🎉', '🎈'];
      container.innerHTML = '';
      for (let i = 0; i < 12; i++) {
        const p = document.createElement('span');
        p.className = 'hg-particle';
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.cssText = `
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          animation-delay: ${Math.random() * 2}s;
          animation-duration: ${2.5 + Math.random() * 2}s;
          font-size: ${12 + Math.random() * 14}px;
        `;
        container.appendChild(p);
      }
    }
  
    /** 填充并显示弹窗 */
    function showHolidayGreeting(holiday) {
      ensureHolidayDOM();
  
      const card = document.getElementById('holiday-greeting-card');
      const overlay = document.getElementById('holiday-greeting-overlay');
  
      // 填充内容
      document.getElementById('hg-main-emoji').textContent = holiday.emoji;
      document.getElementById('hg-sub-emojis').textContent = holiday.subEmoji || '';
      document.getElementById('hg-name').textContent = holiday.name;
      document.getElementById('hg-greeting').textContent = holiday.greeting;
      document.getElementById('hg-desc').textContent = holiday.desc || '';
  
      // 日期
      const d = new Date();
      document.getElementById('hg-date').textContent =
        `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 · ${holiday.name}`;
  
      // 主题色
      card.style.setProperty('--hg-color', holiday.color || 'var(--theme-color)');
      card.style.setProperty('--hg-bg', holiday.bg || 'rgba(57,197,187,0.08)');
  
      // 粒子
      spawnParticles(document.getElementById('hg-particles'), holiday.color);
  
      // 按钮颜色
      document.getElementById('hg-btn').style.background = holiday.color || 'var(--theme-color)';
  
      // 显示 & 入场动画
      overlay.classList.remove('hg-hide');
      overlay.classList.add('hg-show');
      requestAnimationFrame(() => {
        card.classList.add('hg-card-in');
      });
    }
  
    function closeHolidayGreeting() {
      const overlay = document.getElementById('holiday-greeting-overlay');
      const card = document.getElementById('holiday-greeting-card');
      if (!overlay) return;
      card.classList.remove('hg-card-in');
      card.classList.add('hg-card-out');
      setTimeout(() => {
        overlay.classList.remove('hg-show');
        overlay.classList.add('hg-hide');
        card.classList.remove('hg-card-out');
      }, 380);
    }
  
    // ================================================================
    // 🚀 入口
    // ================================================================
  
    function boot() {
      const holiday = getTodayHoliday();
      if (!holiday) return; // 今天不是节日，静默退出
  
      // 稍微延迟，让页面先渲染完
      setTimeout(() => showHolidayGreeting(holiday), 800);
    }
  
    document.addEventListener('DOMContentLoaded', boot);
    // document.addEventListener('pjax:complete', boot);
  
  })();