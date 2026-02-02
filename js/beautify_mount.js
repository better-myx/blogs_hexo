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
  