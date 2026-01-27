function toggleBeautifyPanel() {
    const panel = document.getElementById('beautify-panel');
    if (!panel) return;
    panel.classList.toggle('hidden');
  }
  
  // PJAX 切换后确保函数仍可用（函数本身全局，但保险起见）
  document.addEventListener('pjax:complete', () => {});
  