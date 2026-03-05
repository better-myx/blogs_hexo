// source/js/copy_notify.js
(() => {
    function bindOnce() {
      if (window.__copyNotifyBound) return;
      window.__copyNotifyBound = true;
  
      document.addEventListener("copy", () => {
        if (window.btf && typeof window.btf.snackbarShow === "function") {
          window.btf.snackbarShow("耶嘿！复制成功🍬");
        }
      });
    }
  
    document.addEventListener("DOMContentLoaded", bindOnce);
    document.addEventListener("pjax:complete", bindOnce);
  })();
  