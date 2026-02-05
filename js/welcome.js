console.log("[comments.js] loaded");

(function () {
  const tips = [
    "输入 QQ 号会自动补全邮箱并更新头像 ✨",
    "收到回复将会发送到您的邮箱 📩",
    "可以通过昵称访问您的网站 🔗"
  ];

  const QQ_REGEX = /^\d{5,11}$/;

  function $(sel) {
    return document.querySelector(sel);
  }

  // ✅ 不依赖 .tk-meta-input，直接从提交框里拿 3 个输入框
  function getThreeInputs() {
    const root = $("#twikoo");
    if (!root) return [];

    // Twikoo 提交区（输入昵称/邮箱/网址那块）
    const submit = root.querySelector(".tk-submit");
    if (!submit) return [];

    // ElementUI 的 input
    const inputs = Array.from(submit.querySelectorAll("input.el-input__inner"));

    // 取前三个：昵称/邮箱/网址
    return inputs.slice(0, 3);
  }

  function bindTipForInput(inputEl, text) {
    if (!inputEl || inputEl.dataset.tipBound === "1") return;
    inputEl.dataset.tipBound = "1";

    // input 外层一般是 .el-input-group 或 .el-input
    const wrap =
      inputEl.closest(".el-input-group") ||
      inputEl.closest(".el-input") ||
      inputEl.parentElement;

    if (!wrap) return;

    if (!wrap.style.position) wrap.style.position = "relative";

    let tipEl = wrap.querySelector(".tk-field-tip");
    if (!tipEl) {
      tipEl = document.createElement("div");
      tipEl.className = "tk-field-tip";
      tipEl.textContent = text;
      wrap.appendChild(tipEl);
    } else {
      tipEl.textContent = text;
    }

    const show = () => tipEl.classList.add("show");
    const hide = () => tipEl.classList.remove("show");

    // ✅ focusin/focusout 冒泡更稳
    inputEl.addEventListener("focusin", show);
    inputEl.addEventListener("focusout", hide);

    // ✅ 点下去就显示（有些主题会延迟 focus）
    inputEl.addEventListener("pointerdown", show, { passive: true });
  }

  function bindAllTips() {
    const inputs = getThreeInputs();
    if (inputs.length < 3) return;

    bindTipForInput(inputs[0], tips[0]); // nick
    bindTipForInput(inputs[1], tips[1]); // mail
    bindTipForInput(inputs[2], tips[2]); // link
  }

  function bindQQAutoFill() {
    const inputs = getThreeInputs();
    if (inputs.length < 2) return;

    const nickInput = inputs[0];
    const mailInput = inputs[1];

    if (nickInput.dataset.qqBound === "1") return;
    nickInput.dataset.qqBound = "1";

    nickInput.addEventListener("input", () => {
      const v = (nickInput.value || "").trim();
      if (!QQ_REGEX.test(v)) return;

      const targetEmail = `${v}@qq.com`;
      const current = (mailInput.value || "").trim();

      // 用户已填其他邮箱，不覆盖
      if (current && current !== targetEmail) return;

      mailInput.value = targetEmail;
      mailInput.dispatchEvent(new Event("input", { bubbles: true }));
      mailInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  let observer = null;

  function applyAll() {
    bindAllTips();
    bindQQAutoFill();
  }

  function attachObserver() {
    const root = $("#twikoo");
    if (!root) return;

    if (observer) observer.disconnect();
    observer = new MutationObserver(() => applyAll());
    observer.observe(root, { childList: true, subtree: true });
  }

  function boot() {
    applyAll();
    attachObserver();

    // Twikoo 异步渲染，补两次
    setTimeout(applyAll, 150);
    setTimeout(applyAll, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // PJAX 兼容
  document.addEventListener("pjax:complete", () => setTimeout(boot, 60));
  document.addEventListener("pjax:success", () => setTimeout(boot, 60));
})();
