// APlayer 默认关闭歌词
var observer = new MutationObserver(function (mutations) {
    var lrcButton = document.querySelector(".aplayer-icon-lrc");
    if (lrcButton) {
      setTimeout(function () {
        // 检查当前状态，防止重复点击导致逻辑反转
        if (lrcButton && !lrcButton.classList.contains('aplayer-icon-lrc-inactivity')) {
            lrcButton.click();
        }
      }, 1);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });