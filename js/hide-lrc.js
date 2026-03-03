// APlayer 歌词显示状态记忆：首次默认隐藏；用户手动改了就按用户的来
(function () {
  const KEY = "aplayer_lrc_visible"; // localStorage 键

  // 默认：未设置过就认为 false（隐藏）
  function getWantedVisible() {
    const v = localStorage.getItem(KEY);
    if (v === null) return false;
    return v === "true";
  }

  function setWantedVisible(visible) {
    localStorage.setItem(KEY, visible ? "true" : "false");
  }

  function isCurrentlyHidden(btn) {
    // 你原脚本用的判断：带 aplayer-icon-lrc-inactivity 代表“歌词未激活/隐藏”
    return btn.classList.contains("aplayer-icon-lrc-inactivity");
  }

  function syncLrcState() {
    const btn = document.querySelector(".aplayer-icon-lrc");
    if (!btn) return false;

    const wantVisible = getWantedVisible();
    const hiddenNow = isCurrentlyHidden(btn);

    // wantVisible=true 但现在是隐藏 -> 点一下打开
    if (wantVisible && hiddenNow) btn.click();

    // wantVisible=false 但现在是显示 -> 点一下关闭
    if (!wantVisible && !hiddenNow) btn.click();

    // 监听用户手动点击，把选择记住
    if (!btn.__lrcBound) {
      btn.__lrcBound = true;
      btn.addEventListener("click", function () {
        // click 发生后等状态更新，再读取
        setTimeout(() => {
          const hidden = isCurrentlyHidden(btn);
          setWantedVisible(!hidden);
        }, 0);
      });
    }

    return true;
  }

  // PJAX 下播放器可能已存在/或稍后出现，所以用 observer 等它出现
  const observer = new MutationObserver(function () {
    if (syncLrcState()) observer.disconnect();
  });

  // 先试一次（有时按钮已存在）
  if (!syncLrcState()) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
