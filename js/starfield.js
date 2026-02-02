(() => {
    const isMobile = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i.test(navigator.userAgent);
  
    const STATE = {
      rafId: null,
      running: false,
      canvas: null,
      ctx: null,
      stars: [],
      w: 0,
      h: 0,
      count: 0,
      firstFrame: true
    };
  
    function isDarkMode() {
      return document.documentElement.getAttribute("data-theme") === "dark";
    }
  
    function resize() {
      if (!STATE.canvas) return;
      STATE.w = window.innerWidth;
      STATE.h = window.innerHeight;
      STATE.count = Math.floor(STATE.w * 0.216);
      STATE.canvas.width = STATE.w;
      STATE.canvas.height = STATE.h;
    }
  
    function rand(min, max) { return Math.random() * (max - min) + min; }
    function chance(p) { return (Math.floor(Math.random() * 1000) + 1) < (10 * p); }
  
    function Star() {
      const baseSpeed = 0.05;
      const giantColor = "180,184,240";
      const starColor = "226,225,142";
      const cometColor = "226,225,224";
  
      this.reset = () => {
        this.giant = chance(3);
        this.comet = !this.giant && !STATE.firstFrame && chance(10);
  
        this.x = rand(0, STATE.w - 10);
        this.y = rand(0, STATE.h);
  
        this.r = rand(1.1, 2.6);
  
        this.dx = rand(baseSpeed, 6 * baseSpeed) + (this.comet ? baseSpeed * rand(50, 120) : 0) + 2 * baseSpeed;
        this.dy = -rand(baseSpeed, 6 * baseSpeed) - (this.comet ? baseSpeed * rand(50, 120) : 0);
  
        this.fadingOut = null;
        this.fadingIn = true;
        this.opacity = 0;
  
        this.opacityTresh = rand(0.2, 1 - (this.comet ? 0.4 : 0));
        this.do = rand(0.0005, 0.002) + (this.comet ? 0.001 : 0);
  
        this.colors = { giantColor, starColor, cometColor };
      };
  
      this.fadeIn = () => {
        if (!this.fadingIn) return;
        this.fadingIn = !(this.opacity > this.opacityTresh);
        this.opacity += this.do;
      };
  
      this.fadeOut = () => {
        if (!this.fadingOut) return;
        this.fadingOut = !(this.opacity < 0);
        this.opacity -= this.do / 2;
        if (this.x > STATE.w || this.y < 0) {
          this.fadingOut = false;
          this.reset();
        }
      };
  
      this.draw = () => {
        const ctx = STATE.ctx;
        const { giantColor, starColor, cometColor } = this.colors;
  
        ctx.beginPath();
        if (this.giant) {
          ctx.fillStyle = `rgba(${giantColor},${this.opacity})`;
          ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI, false);
        } else if (this.comet) {
          ctx.fillStyle = `rgba(${cometColor},${this.opacity})`;
          ctx.arc(this.x, this.y, 1.5, 0, 2 * Math.PI, false);
  
          for (let t = 0; t < 30; t++) {
            ctx.fillStyle = `rgba(${cometColor},${this.opacity - (this.opacity / 20) * t})`;
            ctx.rect(this.x - (this.dx / 4) * t, this.y - (this.dy / 4) * t - 2, 2, 2);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = `rgba(${starColor},${this.opacity})`;
          ctx.rect(this.x, this.y, this.r, this.r);
        }
        ctx.closePath();
        ctx.fill();
      };
  
      this.move = () => {
        this.x += this.dx;
        this.y += this.dy;
  
        if (this.fadingOut === false) this.reset();
        if (this.x > (STATE.w - STATE.w / 4) || this.y < 0) this.fadingOut = true;
      };
  
      setTimeout(() => { STATE.firstFrame = false; }, 50);
    }
  
    function ensureCanvas() {
      const canvas = document.getElementById("starfield");
      if (!canvas) return null;
      STATE.canvas = canvas;
      STATE.ctx = canvas.getContext("2d");
      resize();
      return canvas;
    }
  
    function initStars() {
      STATE.stars = [];
      for (let i = 0; i < STATE.count; i++) {
        const s = new Star();
        s.reset();
        STATE.stars.push(s);
      }
    }
  
    function drawFrame() {
      if (!STATE.running) return;
  
      if (!isDarkMode()) {
        stop();
        return;
      }
  
      const ctx = STATE.ctx;
      ctx.clearRect(0, 0, STATE.w, STATE.h);
  
      for (let i = 0; i < STATE.stars.length; i++) {
        const s = STATE.stars[i];
        s.move();
        s.fadeIn();
        s.fadeOut();
        s.draw();
      }
  
      STATE.rafId = requestAnimationFrame(drawFrame);
    }
  
    function start() {
      if (isMobile) return;
      if (!isDarkMode()) return;
  
      if (!STATE.canvas || !STATE.ctx) {
        if (!ensureCanvas()) return;
      }
  
      if (STATE.running) return;
      STATE.running = true;
  
      resize();
      initStars();
      STATE.rafId = requestAnimationFrame(drawFrame);
    }
  
    function stop() {
      STATE.running = false;
      if (STATE.rafId) cancelAnimationFrame(STATE.rafId);
      STATE.rafId = null;
  
      if (STATE.ctx && STATE.canvas) {
        STATE.ctx.clearRect(0, 0, STATE.canvas.width, STATE.canvas.height);
      }
    }
  
    function bindEventsOnce() {
      if (window.__starfieldBound) return;
      window.__starfieldBound = true;
  
      window.addEventListener("resize", () => {
        resize();
        if (STATE.running) initStars();
      });
  
      // 监听 data-theme 变化（开关星空）
      const mo = new MutationObserver(() => {
        if (isDarkMode()) start();
        else stop();
      });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }
  
    function boot() {
      bindEventsOnce();
      if (isDarkMode()) start();
      else stop();
    }
  
    boot();
    document.addEventListener("pjax:complete", boot);
  })();
  