(() => {
    const isMobile = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i.test(navigator.userAgent);
  
    const SETTINGS = {
      flakeCount: 50,
      minDist: 150,
      color: "255, 255, 255",
      size: 1.5,
      speed: 0.5,
      opacity: 0.7,
      stepsize: 0.5
    };
    // ✅ 移动端降配（推荐）
  if (isMobile) {
      SETTINGS.flakeCount = 22;
      SETTINGS.minDist = 90;
      SETTINGS.speed = 0.35;
      SETTINGS.size = 1.2;
      SETTINGS.stepsize = 0.35;
    };
  
  
    const STATE = {
      rafId: null,
      running: false,
      ctx: null,
      canvas: null,
      flakes: [],
      mouseX: -100,
      mouseY: -100
    };
  
    function isLightMode() {
      return document.documentElement.getAttribute("data-theme") === "light";
    }
  
    function ensureCanvas() {
      const canvas = document.getElementById("snowfall");
      if (!canvas) return null;
      const ctx = canvas.getContext("2d");
      STATE.canvas = canvas;
      STATE.ctx = ctx;
      resizeCanvas();
      return canvas;
    }
  
    function resizeCanvas() {
      if (!STATE.canvas) return;
      STATE.canvas.width = window.innerWidth;
      STATE.canvas.height = window.innerHeight;
    }
  
    function resetFlake(f) {
      const c = STATE.canvas;
      f.x = Math.floor(Math.random() * c.width);
      f.y = 0;
      f.size = 3 * Math.random() + 2;
      f.speed = 1 * Math.random() + 0.5;
      f.velY = f.speed;
      f.velX = 0;
      f.opacity = 0.5 * Math.random() + 0.3;
    }
  
    function initFlakes() {
      STATE.flakes = [];
      const c = STATE.canvas;
      for (let i = 0; i < SETTINGS.flakeCount; i++) {
        const x = Math.floor(Math.random() * c.width);
        const y = Math.floor(Math.random() * c.height);
        const size = 3 * Math.random() + SETTINGS.size;
        const speed = 1 * Math.random() + SETTINGS.speed;
        const opacity = 0.5 * Math.random() + SETTINGS.opacity;
        STATE.flakes.push({
          speed,
          velX: 0,
          velY: speed,
          x,
          y,
          size,
          stepSize: (Math.random() / 30) * SETTINGS.stepsize,
          step: 0,
          angle: 180,
          opacity
        });
      }
    }
  
    function tick() {
      if (!STATE.running) return;
  
      // 如果不在白天模式，停止
      if (!isLightMode()) {
        stop();
        return;
      }
  
      const ctx = STATE.ctx;
      const c = STATE.canvas;
      ctx.clearRect(0, 0, c.width, c.height);
  
      const r = SETTINGS.minDist;
      for (let i = 0; i < SETTINGS.flakeCount; i++) {
        const f = STATE.flakes[i];
        const dx = STATE.mouseX - f.x;
        const dy = STATE.mouseY - f.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
  
        if (dist < r) {
          const ex = dx / dist;
          const ey = dy / dist;
          const force = r / (dist * dist) / 2;
          f.velX -= force * ex;
          f.velY -= force * ey;
        } else {
          f.velX *= 0.98;
          if (f.velY < f.speed && f.speed - f.velY > 0.01) {
            f.velY += 0.01 * (f.speed - f.velY);
          }
          f.velX += Math.cos((f.step += 0.05)) * f.stepSize;
        }
  
        ctx.fillStyle = `rgba(${SETTINGS.color}, ${f.opacity})`;
  
        f.y += f.velY;
        f.x += f.velX;
  
        if (f.y >= c.height || f.y <= 0) resetFlake(f);
        if (f.x >= c.width || f.x <= 0) resetFlake(f);
  
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, 2 * Math.PI);
        ctx.fill();
      }
  
      STATE.rafId = requestAnimationFrame(tick);
    }
  
    function start() {
    //   if (isMobile) return;
      if (!isLightMode()) return;
  
      if (!STATE.canvas || !STATE.ctx) {
        if (!ensureCanvas()) return;
      }
  
      // 防止重复 start
      if (STATE.running) return;
  
      STATE.running = true;
      initFlakes();
      STATE.rafId = requestAnimationFrame(tick);
    }
  
    function stop() {
      STATE.running = false;
      if (STATE.rafId) cancelAnimationFrame(STATE.rafId);
      STATE.rafId = null;
      if (STATE.ctx && STATE.canvas) {
        STATE.ctx.clearRect(0, 0, STATE.canvas.width, STATE.canvas.height);
      }
    }
  
    // 绑定事件（只绑一次）
    function bindEventsOnce() {
      if (window.__snowfallBound) return;
      window.__snowfallBound = true;
  
      document.addEventListener("mousemove", (e) => {
        STATE.mouseX = e.clientX;
        STATE.mouseY = e.clientY;
      });
      document.addEventListener("touchmove", (e) => {
        const t = e.touches && e.touches[0];
        if (!t) return;
        STATE.mouseX = t.clientX;
        STATE.mouseY = t.clientY;
      }, { passive: true });
      
  
      window.addEventListener("resize", () => {
        resizeCanvas();
      });
  
      // 监听 data-theme 变化（开关雪花）
      const mo = new MutationObserver(() => {
        if (isLightMode()) start();
        else stop();
      });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }
  
    function boot() {
      bindEventsOnce();
      // 首次按当前模式启动/停止
      if (isLightMode()) start();
      else stop();
    }
  
    // 初次加载
    boot();
  
    // PJAX：每次页面切换后再 boot（不会重复绑定/重复 raf）
    document.addEventListener("pjax:complete", boot);
  })();
  