/* mount #runtime + #workboard into footer, place ABOVE #footer-animal */
(function () {
    function mount() {
      // 防止重复挂载
      if (document.getElementById("runtime")) return;
  
      const footer = document.querySelector("footer#footer") || document.querySelector("footer");
      if (!footer) return;
  
      // runtime 容器
      const runtime = document.createElement("div");
      runtime.id = "runtime";
      runtime.innerHTML = `<div id="workboard"></div>`;
  
      // 目标：插到小动物之前
      const animal = document.getElementById("footer-animal");
      if (animal && animal.parentNode) {
        animal.parentNode.insertBefore(runtime, animal);
      } else {
        // 找不到小动物就放页脚最后
        footer.appendChild(runtime);
      }
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount);
    } else {
      mount();
    }
    document.addEventListener("pjax:complete", mount);
  })();
  