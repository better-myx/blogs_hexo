// source/js/beautify_mount.js
(() => {
  function ensureDOM() {
    if (document.getElementById("beautify-window")) return;

    const wrap = document.createElement("div");
    wrap.innerHTML = `
        <div id="beautify-window" class="hidden" aria-hidden="true">
          <div class="bw-card" role="dialog" aria-label="美化设置">
            <div class="bw-titlebar" id="bw-titlebar">
              <div class="bw-title">
                <span class="bw-title-text">美化设置</span>
              </div>

              <div class="bw-controls">
                <button class="bw-ctl min" title="最小化" type="button" aria-label="最小化"></button>
                <button class="bw-ctl max" title="最大化" type="button" aria-label="最大化"></button>
                <button class="bw-ctl close" title="关闭" type="button" aria-label="关闭"></button>
              </div>
            </div>

            <div class="bw-body">
              <section class="bw-section">
                <h3 class="bw-h3">一、显示偏好</h3>
                <div class="bw-grid">
                  <div class="bw-item">
                    <div class="bw-item-text">
                      <div class="bw-item-title">雪花特效（白天）</div>
                      <div class="bw-item-desc">仅在日间模式显示</div>
                    </div>
                    <button class="bw-switch" id="bw-toggle-snowfall" type="button" role="switch" aria-checked="true">
                      <span class="bw-knob"></span>
                    </button>
                  </div>

                  <div class="bw-item">
                    <div class="bw-item-text">
                      <div class="bw-item-title">星空特效（夜间）</div>
                      <div class="bw-item-desc">仅在夜间模式显示</div>
                    </div>
                    <button class="bw-switch" id="bw-toggle-starfield" type="button" role="switch" aria-checked="true">
                      <span class="bw-knob"></span>
                    </button>
                  </div>
                </div>
              </section>

              <section class="bw-section">
                <h3 class="bw-h3">二、字体设置</h3>
                <div class="bw-fonts" id="bw-fonts"></div>
                <div class="bw-hint">切换后立即生效，并会保存到浏览器。</div>
              </section>

              <section class="bw-section">
                <h3 class="bw-h3">三、主题色设置</h3>
                <div class="bw-colors" id="bw-colors"></div>
                <div class="bw-hint">颜色仅作用于当前日/夜模式；切换日夜会自动回到默认色（白天绿、夜晚黑灰）。</div>
              </section>

              <section class="bw-section">
                <h3 class="bw-h3">四、字体大小设置</h3>
                <div class="bw-fontsize-grid">

                  <div class="bw-fontsize-item">
                    <div class="bw-item-text">
                      <div class="bw-item-title">正文字体大小</div>
                      <div class="bw-item-desc">段落、列表、引用等文字（px）</div>
                    </div>
                    <div class="bw-stepper">
                      <button class="bw-step-btn" data-target="fontSize" data-action="dec" type="button">−</button>
                      <span class="bw-step-val" id="bw-fontsize-val">16</span>
                      <button class="bw-step-btn" data-target="fontSize" data-action="inc" type="button">+</button>
                    </div>
                  </div>

                  <div class="bw-fontsize-item">
                    <div class="bw-item-text">
                      <div class="bw-item-title">标题字体大小</div>
                      <div class="bw-item-desc">H1 基准，H2~H6 等比缩小（px）</div>
                    </div>
                    <div class="bw-stepper">
                      <button class="bw-step-btn" data-target="h1Size" data-action="dec" type="button">−</button>
                      <span class="bw-step-val" id="bw-h1size-val">24</span>
                      <button class="bw-step-btn" data-target="h1Size" data-action="inc" type="button">+</button>
                    </div>
                  </div>

                </div>
                <div class="bw-hint" style="margin-top:10px;">
                  电脑端默认：正文 16px / 标题 24px；手机端默认：正文 14px / 标题 18px。
                  <button class="bw-reset-fontsize" id="bw-reset-fontsize" type="button">重置为默认</button>
                </div>
              </section>
            </div>

            <!-- ✅ 8 个拉伸手柄 -->
            <div class="bw-r bw-r-n" data-dir="n"></div>
            <div class="bw-r bw-r-s" data-dir="s"></div>
            <div class="bw-r bw-r-e" data-dir="e"></div>
            <div class="bw-r bw-r-w" data-dir="w"></div>
            <div class="bw-r bw-r-ne" data-dir="ne"></div>
            <div class="bw-r bw-r-nw" data-dir="nw"></div>
            <div class="bw-r bw-r-se" data-dir="se"></div>
            <div class="bw-r bw-r-sw" data-dir="sw"></div>
          </div>
        </div>

        <div id="beautify-tray" class="hidden">
          <button type="button" title="打开美化设置">
            <span class="tray-dot"></span><span>美化设置</span>
          </button>
        </div>
      `;
      document.body.appendChild(wrap);
    }

    window.__beautifyEnsureDOM = ensureDOM;
    document.addEventListener("DOMContentLoaded", ensureDOM);
    document.addEventListener("pjax:complete", ensureDOM);
  })();


  document.addEventListener('DOMContentLoaded', bindHomeBtnMobile);
  document.addEventListener('pjax:complete', bindHomeBtnMobile);
  
  document.addEventListener('pjax:send', function () {
    clearHomeBtnState();
  });
  
  function clearHomeBtnState() {
    const bi = document.getElementById('blog-info');
    if (!bi) return;
    bi.classList.remove('mobile-active');
    clearTimeout(bi._homeBtnTimer);
  }
  
  function bindHomeBtnMobile() {
    clearHomeBtnState();
  
    const blogInfo = document.getElementById('blog-info');
    if (!blogInfo || blogInfo._homeBtnBound) return;
    blogInfo._homeBtnBound = true;
  
    blogInfo.addEventListener('click', function (e) {
      // 桌面端不处理
      if (window.innerWidth > 900) return;
  
      const isActive = this.classList.contains('mobile-active');
  
      if (!isActive) {
        // ✅ 第一次点击：拦截跳转，显示房子
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('mobile-active');
  
        // 2.5 秒后自动收起
        clearTimeout(this._homeBtnTimer);
        this._homeBtnTimer = setTimeout(() => {
          this.classList.remove('mobile-active');
        }, 2500);
      } else {
        // ✅ 第二次点击（房子状态）：清除状态，正常跳转
        clearHomeBtnState();
        // 不阻止默认行为，链接自然跳转
      }
    });
  
    // 点击其他区域收起
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#blog-info')) {
        clearHomeBtnState();
      }
    });
  }