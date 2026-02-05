console.log("[comments.js] loaded");

(function () {
  const TIP_TEXT = {
    nick: "输入QQ号会自动补全邮箱并更新头像🐧",
    mail: "收到回复将会发送到您的邮箱📧",
    link: "可以通过昵称访问您的网站🔗"
  };

  const QQ_REGEX = /^\d{5,11}$/;

  function $(sel) {
    return document.querySelector(sel);
  }

  function getTwikooRoot() {
    return $("#twikoo");
  }

  // 找到当前输入框对应的“外壳”，用于放 tip
  function getWrap(inputEl) {
    return (
      inputEl.closest(".el-input-group") ||
      inputEl.closest(".el-input") ||
      inputEl.parentElement
    );
  }

  // 根据 input 所在组判断是 nick/mail/link（按顺序）
  function detectFieldType(inputEl) {
    const root = getTwikooRoot();
    if (!root) return null;

    const submit = root.querySelector(".tk-submit");
    if (!submit) return null;

    const inputs = Array.from(submit.querySelectorAll("input.el-input__inner")).slice(0, 3);
    const idx = inputs.indexOf(inputEl);
    if (idx === 0) return "nick";
    if (idx === 1) return "mail";
    if (idx === 2) return "link";
    return null;
  }

  // 确保 tip 节点存在，并挂到当前输入框的 wrap 上
  function ensureTipOnInput(inputEl, text) {
    const wrap = getWrap(inputEl);
    if (!wrap) return null;

    if (!wrap.style.position) wrap.style.position = "relative";

    let tipEl = wrap.querySelector(".tk-field-tip");
    if (!tipEl) {
      tipEl = document.createElement("div");
      tipEl.className = "tk-field-tip";
      wrap.appendChild(tipEl);
    }
    tipEl.textContent = text;
    return tipEl;
  }

  // 事件委托：无论 input 重建多少次都有效
  function bindDelegatedEvents() {
    const root = getTwikooRoot();
    if (!root) return;

    if (root.dataset.tipDelegated === "1") return;
    root.dataset.tipDelegated = "1";

    // focusin/focusout 冒泡，适合委托
    root.addEventListener("focusin", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (!t.matches("input.el-input__inner")) return;

      const field = detectFieldType(t);
      if (!field) return;

      const tipEl = ensureTipOnInput(t, TIP_TEXT[field]);
      if (tipEl) tipEl.classList.add("show");
    });

    root.addEventListener("focusout", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (!t.matches("input.el-input__inner")) return;

      const wrap = getWrap(t);
      const tipEl = wrap ? wrap.querySelector(".tk-field-tip") : null;
      if (tipEl) tipEl.classList.remove("show");
    });

    // QQ 自动补邮箱（同样用委托，不怕重建）
    root.addEventListener("input", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLInputElement)) return;
      if (!t.matches("input.el-input__inner")) return;

      const field = detectFieldType(t);
      if (field !== "nick") return;

      const qq = (t.value || "").trim();
      if (!QQ_REGEX.test(qq)) return;

      const submit = root.querySelector(".tk-submit");
      if (!submit) return;

      const inputs = Array.from(submit.querySelectorAll("input.el-input__inner")).slice(0, 3);
      const mailInput = inputs[1];
      if (!mailInput) return;

      const targetEmail = `${qq}@qq.com`;
      const current = (mailInput.value || "").trim();

      // 用户填了其他邮箱就不覆盖
      if (current && current !== targetEmail) return;

      mailInput.value = targetEmail;
      mailInput.dispatchEvent(new Event("input", { bubbles: true }));
      mailInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  // lazyload: true 时，twikoo 可能晚一点才渲染 .tk-submit
  // 用轮询确保绑定发生在 root 出现后（但绑定是委托，所以只要 root 在就行）
  function waitAndBoot() {
    const root = getTwikooRoot();
    if (root) {
      bindDelegatedEvents();
      return;
    }
    // root 还没出现，稍后再试
    setTimeout(waitAndBoot, 200);
  }

  function boot() {
    waitAndBoot();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // PJAX 支持
  document.addEventListener("pjax:complete", () => setTimeout(boot, 60));
  document.addEventListener("pjax:success", () => setTimeout(boot, 60));
})();
