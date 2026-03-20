// source/js/snowfall.js
(() => {
  const isMobile =
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i.test(
      navigator.userAgent
    );

  const SETTINGS = {
    count: isMobile ? 16 : 28,
    minDist: isMobile ? 90 : 140
  };

  const STATE = {
    rafId: null,
    running: false,
    ctx: null,
    canvas: null,
    particles: [],
    mouseX: -100,
    mouseY: -100
  };

  function getDayEffect() {
    return document.documentElement.getAttribute("data-day-effect") || "sakura";
  }

  function shouldRun() {
    return (
      document.documentElement.getAttribute("data-theme") === "light" &&
      getDayEffect() !== "off"
    );
  }

  function ensureCanvas() {
    const canvas = document.getElementById("snowfall");
    if (!canvas) return null;
    STATE.canvas = canvas;
    STATE.ctx = canvas.getContext("2d");
    resizeCanvas();
    return canvas;
  }

  function resizeCanvas() {
    if (!STATE.canvas) return;
    STATE.canvas.width = window.innerWidth;
    STATE.canvas.height = window.innerHeight;
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function resetParticle(p, fromTop = true) {
    const c = STATE.canvas;
    const mode = getDayEffect();

    p.mode = mode;
    p.depth = rand(0.7, 1.2);
    p.x = rand(0, c.width);
    p.y = fromTop ? rand(-60, -10) : rand(0, c.height);

    if (mode === "snow") {
      p.size = rand(isMobile ? 8 : 10, isMobile ? 15 : 20) * p.depth;
      p.speedY = rand(0.4, 1.0) * p.depth;
      p.speedX = rand(-0.05, 0.05);
      p.opacity = clamp(rand(0.5, 0.95), 0.4, 0.95);
      p.swing = rand(0.008, 0.017);
      p.swingAmp = rand(0.12, 0.28) * p.depth;
      p.rotation = rand(0, Math.PI * 2);
      p.rotationSpeed = rand(-0.006, 0.006);
      p.branches = Math.random() > 0.55 ? 8 : 6;
      p.glow = pick([
        "rgba(255, 220, 245, 0.20)",
        "rgba(240, 220, 255, 0.22)",
        "rgba(255, 235, 250, 0.18)"
      ]);
      p.coreTint = pick([
        [255, 235, 250],
        [245, 232, 255],
        [255, 242, 248]
      ]);
    } else {
      // p.size = rand(isMobile ? 11 : 13, isMobile ? 20 : 26) * p.depth;
      // p.speedY = rand(0.85, 1.8) * p.depth;
      // p.speedX = rand(-0.08, 0.08);
      // p.opacity = clamp(rand(0.7, 0.98), 0.5, 1);
      // p.swing = rand(0.008, 0.02);
      // p.swingAmp = rand(0.16, 0.45) * p.depth;
      p.size = rand(isMobile ? 11 : 13, isMobile ? 20 : 26) * p.depth;

      // ✅ 移动端樱花速度放慢，接近雪花观感
      p.speedY = isMobile
        ? rand(0.52, 0.10) * p.depth
        : rand(0.85, 1.8) * p.depth;

      // ✅ 横向漂移也略微收一点，移动端更柔和
      p.speedX = isMobile
        ? rand(-0.06, 0.06)
        : rand(-0.08, 0.08);

      p.opacity = clamp(rand(0.7, 0.98), 0.5, 1);
      p.swing = rand(0.008, 0.02);

      // ✅ 移动端摆动幅度减小，避免“飘太急”
      p.swingAmp = isMobile
        ? rand(0.10, 0.22) * p.depth
        : rand(0.16, 0.45) * p.depth;

      p.rotation = rand(0, Math.PI * 2);
      p.rotationSpeed = rand(-0.01, 0.01);
      p.tilt = rand(0.92, 1.08);
      p.flowerRotate = rand(0, Math.PI * 2);
      p.color = pick([
        [255, 210, 225],   // 珍珠玫瑰
        [252, 220, 235],   // 云雾粉
        [245, 205, 222],   // 薄雾樱
        [255, 228, 240],   // 晨露白粉
        [248, 215, 230]    // 浮光淡粉
      ]);
      p.core = pick([
        [255, 240, 200],   // 暖珍珠
        [255, 235, 210],   // 香槟金
        [252, 245, 220]    // 月光黄
      ]);
      p.glowColor = pick([
        "rgba(255, 200, 220, 0.18)",
        "rgba(255, 215, 230, 0.15)",
        "rgba(240, 190, 215, 0.20)"
      ]);
    }
  }

  function initParticles() {
    STATE.particles = [];
    for (let i = 0; i < SETTINGS.count; i++) {
      const p = {};
      resetParticle(p, false);
      STATE.particles.push(p);
    }
  }

  // ─── 雪花绘制（浪漫唯美加强版）─────────────────────────────────────────────
  function drawSnow(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;

    const r = p.size;
    const branches = p.branches || 6;
    const innerR = r * 0.22;

    // ① 外围朦胧柔光
    const outerGlow = ctx.createRadialGradient(0, 0, r * 0.05, 0, 0, r * 1.35);
    outerGlow.addColorStop(0, "rgba(255, 245, 252, 0.32)");
    outerGlow.addColorStop(0.45, p.glow || "rgba(245, 225, 255, 0.18)");
    outerGlow.addColorStop(1, "rgba(255, 220, 245, 0)");
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.28, 0, Math.PI * 2);
    ctx.fill();

    // ② 大片冰晶底座，让整体不再“只有细线”
    for (let i = 0; i < branches; i++) {
      const a = (Math.PI * 2 * i) / branches;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;

      const shardGrad = ctx.createLinearGradient(0, 0, x, y);
      shardGrad.addColorStop(0, "rgba(255, 248, 255, 0.35)");
      shardGrad.addColorStop(0.55, "rgba(245, 232, 255, 0.16)");
      shardGrad.addColorStop(1, "rgba(255, 220, 245, 0)");

      ctx.fillStyle = shardGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a - 0.09) * r * 0.72, Math.sin(a - 0.09) * r * 0.72);
      ctx.lineTo(x, y);
      ctx.lineTo(Math.cos(a + 0.09) * r * 0.72, Math.sin(a + 0.09) * r * 0.72);
      ctx.closePath();
      ctx.fill();
    }

    // ③ 主枝：加粗 + 珠光渐变
    const lineGrad = ctx.createLinearGradient(0, -r, 0, r);
    lineGrad.addColorStop(0, "rgba(255, 225, 245, 0.98)");
    lineGrad.addColorStop(0.5, "rgba(248, 242, 255, 1)");
    lineGrad.addColorStop(1, "rgba(255, 225, 245, 0.98)");

    ctx.strokeStyle = lineGrad;
    ctx.lineCap = "round";

    for (let i = 0; i < branches; i++) {
      const a = (Math.PI * 2 * i) / branches;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;

      // 主臂底层
      ctx.lineWidth = Math.max(1.8, r * 0.14);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.stroke();

      // 主臂高光层
      ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
      ctx.lineWidth = Math.max(0.7, r * 0.045);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x * 0.98, y * 0.98);
      ctx.stroke();

      // 恢复主枝颜色
      ctx.strokeStyle = lineGrad;

      // 两层侧枝：更粗、更自然
      const fracs = [
        { t: 0.66, len: 0.28, spread: Math.PI / 4.2 },
        { t: 0.42, len: 0.20, spread: Math.PI / 4.8 }
      ];

      for (const { t, len, spread } of fracs) {
        const bx = Math.cos(a) * r * t;
        const by = Math.sin(a) * r * t;
        const angle1 = a + spread;
        const angle2 = a - spread;
        const sl = r * len;

        ctx.lineWidth = Math.max(1.0, r * 0.082);
        ctx.beginPath();
        ctx.moveTo(bx + Math.cos(angle1) * sl, by + Math.sin(angle1) * sl);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx + Math.cos(angle2) * sl, by + Math.sin(angle2) * sl);
        ctx.stroke();

        // 侧枝高光
        ctx.strokeStyle = "rgba(255, 255, 255, 0.52)";
        ctx.lineWidth = Math.max(0.35, r * 0.026);
        ctx.beginPath();
        ctx.moveTo(bx + Math.cos(angle1) * sl * 0.92, by + Math.sin(angle1) * sl * 0.92);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx + Math.cos(angle2) * sl * 0.92, by + Math.sin(angle2) * sl * 0.92);
        ctx.stroke();

        ctx.strokeStyle = lineGrad;
      }

      // 末端晶点
      const tipGlow = ctx.createRadialGradient(x, y, 0, x, y, r * 0.12);
      tipGlow.addColorStop(0, "rgba(255,255,255,0.92)");
      tipGlow.addColorStop(0.5, "rgba(255,225,245,0.50)");
      tipGlow.addColorStop(1, "rgba(255,225,245,0)");
      ctx.fillStyle = tipGlow;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }

    // ④ 内层六边晶核
    const hexGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, innerR * 1.2);
    hexGrad.addColorStop(0, "rgba(255,255,255,0.96)");
    hexGrad.addColorStop(0.55, "rgba(248,232,255,0.88)");
    hexGrad.addColorStop(1, "rgba(238,210,255,0.18)");
    ctx.fillStyle = hexGrad;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i) / 6 - Math.PI / 6;
      const hx = Math.cos(a) * innerR;
      const hy = Math.sin(a) * innerR;
      i === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(245, 215, 255, 0.95)";
    ctx.lineWidth = Math.max(1.0, r * 0.07);
    ctx.stroke();

    // ⑤ 内层小六芒结构，增加细节但不显薄
    ctx.strokeStyle = "rgba(255,255,255,0.62)";
    ctx.lineWidth = Math.max(0.7, r * 0.04);
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i) / 6;
      const x = Math.cos(a) * r * 0.34;
      const y = Math.sin(a) * r * 0.34;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // ⑥ 中心珠光
    const [cr, cg, cb] = p.coreTint || [255, 238, 250];
    const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.42);
    coreGlow.addColorStop(0, "rgba(255,255,255,0.98)");
    coreGlow.addColorStop(0.28, `rgba(${cr}, ${cg}, ${cb}, 0.92)`);
    coreGlow.addColorStop(0.68, "rgba(245, 225, 255, 0.32)");
    coreGlow.addColorStop(1, "rgba(255, 215, 240, 0)");
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.34, 0, Math.PI * 2);
    ctx.fill();

    // ⑦ 中心高光点
    const pearl = ctx.createRadialGradient(-r * 0.06, -r * 0.07, 0, -r * 0.06, -r * 0.07, r * 0.14);
    pearl.addColorStop(0, "rgba(255,255,255,0.95)");
    pearl.addColorStop(0.45, "rgba(255,255,255,0.35)");
    pearl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = pearl;
    ctx.beginPath();
    ctx.arc(-r * 0.04, -r * 0.05, r * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ─── 花瓣绘制（浪漫唯美版）─────────────────────────────────────────────────
  function petalPath(ctx, size) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.06, -size * 0.78);
    ctx.bezierCurveTo(-size * 0.52, -size * 0.9, -size * 0.9, -size * 0.32, -size * 0.74, size * 0.22);
    ctx.bezierCurveTo(-size * 0.52, size * 0.66, -size * 0.14, size * 0.96, 0, size * 0.94);
    ctx.bezierCurveTo(size * 0.14, size * 0.96, size * 0.52, size * 0.66, size * 0.74, size * 0.22);
    ctx.bezierCurveTo(size * 0.9, -size * 0.32, size * 0.52, -size * 0.9, size * 0.06, -size * 0.78);
    ctx.bezierCurveTo(size * 0.03, -size * 0.94, -size * 0.03, -size * 0.94, -size * 0.06, -size * 0.78);
    ctx.closePath();
  }

  function drawPetal(ctx, size, rgb) {
    const [r, g, b] = rgb;

    // ① 外发光晕
    ctx.save();
    ctx.shadowColor = `rgba(${r}, ${Math.min(g + 30, 255)}, ${Math.min(b + 15, 255)}, 0.50)`;
    ctx.shadowBlur = size * 0.85;
    petalPath(ctx, size);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.01)`;
    ctx.fill();
    ctx.restore();

    // ② 主体：线性渐变，顶端近白→主粉→底部奶油暖
    petalPath(ctx, size);
    const baseGrad = ctx.createLinearGradient(0, -size * 0.85, 0, size * 0.95);
    baseGrad.addColorStop(0, `rgba(255, 250, 254, 0.97)`);
    baseGrad.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, 0.90)`);
    baseGrad.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.85)`);
    baseGrad.addColorStop(1, `rgba(255, 238, 215, 0.72)`);
    ctx.fillStyle = baseGrad;
    ctx.fill();

    // ③ 逆光透光层（从左上斜射）
    petalPath(ctx, size);
    const lightGrad = ctx.createLinearGradient(-size * 0.55, -size * 0.65, size * 0.45, size * 0.55);
    lightGrad.addColorStop(0, "rgba(255, 255, 255, 0.40)");
    lightGrad.addColorStop(0.4, "rgba(255, 255, 255, 0.12)");
    lightGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = lightGrad;
    ctx.fill();

    // ④ 珍珠高光（左上方晶莹亮斑）
    petalPath(ctx, size);
    ctx.save();
    ctx.clip();
    const pearl = ctx.createRadialGradient(-size * 0.22, -size * 0.42, 0, -size * 0.18, -size * 0.36, size * 0.28);
    pearl.addColorStop(0, "rgba(255, 255, 255, 0.75)");
    pearl.addColorStop(0.45, "rgba(255, 255, 255, 0.20)");
    pearl.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = pearl;
    ctx.fillRect(-size, -size, size * 2, size * 2);
    ctx.restore();

    // ⑤ 极细脉络（若隐若现）
    const vc = `rgba(${Math.max(r - 12, 210)}, ${Math.max(g - 18, 168)}, ${Math.max(b - 8, 185)}, 0.20)`;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(size * 0.02, -size * 0.62);
    ctx.bezierCurveTo(size * 0.04, size * 0.08, -size * 0.02, size * 0.48, 0, size * 0.80);
    ctx.strokeStyle = vc;
    ctx.lineWidth = Math.max(0.4, size * 0.02);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-size * 0.02, -size * 0.18);
    ctx.bezierCurveTo(-size * 0.18, size * 0.10, -size * 0.42, size * 0.22, -size * 0.56, size * 0.14);
    ctx.strokeStyle = `rgba(${Math.max(r - 10, 210)}, ${Math.max(g - 15, 168)}, ${Math.max(b - 6, 185)}, 0.14)`;
    ctx.lineWidth = Math.max(0.3, size * 0.015);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(size * 0.02, -size * 0.10);
    ctx.bezierCurveTo(size * 0.20, size * 0.18, size * 0.44, size * 0.26, size * 0.58, size * 0.16);
    ctx.strokeStyle = `rgba(${Math.max(r - 10, 210)}, ${Math.max(g - 15, 168)}, ${Math.max(b - 6, 185)}, 0.14)`;
    ctx.lineWidth = Math.max(0.3, size * 0.015);
    ctx.stroke();
  }

  function drawSakura(ctx, p) {
    const size = p.size;
    const petalSize = size * 0.46;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.scale(1, p.tilt);
    ctx.globalAlpha = p.opacity;

    // 整朵花外围柔光晕（浪漫雾感）
    const [fr, fg, fb] = p.color;
    const bloom = ctx.createRadialGradient(0, 0, size * 0.1, 0, 0, size * 1.1);
    bloom.addColorStop(0, `rgba(${fr}, ${Math.min(fg + 30, 255)}, ${Math.min(fb + 20, 255)}, 0.18)`);
    bloom.addColorStop(0.5, `rgba(${fr}, ${fg}, ${fb}, 0.06)`);
    bloom.addColorStop(1, "rgba(255, 220, 235, 0)");
    ctx.fillStyle = bloom;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.1, 0, Math.PI * 2);
    ctx.fill();

    // 投影（极轻）
    ctx.save();
    ctx.translate(size * 0.025, size * 0.04);
    ctx.globalAlpha *= 0.07;
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate(p.flowerRotate + (Math.PI * 2 * i) / 5);
      ctx.translate(0, -size * 0.34);
      drawPetal(ctx, petalSize, [220, 155, 175]);
      ctx.restore();
    }
    ctx.restore();

    // 五瓣花
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate(p.flowerRotate + (Math.PI * 2 * i) / 5);
      ctx.translate(0, -size * 0.34);
      drawPetal(ctx, petalSize, p.color);
      ctx.restore();
    }

    // 花心渐变
    const [cr, cg, cb] = p.core;
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.18);
    core.addColorStop(0, `rgba(255, 255, 245, 1)`);
    core.addColorStop(0.45, `rgba(${cr}, ${cg}, ${cb}, 0.92)`);
    core.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0.15)`);
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.16, 0, Math.PI * 2);
    ctx.fill();

    // 花蕊细丝（更纤细飘逸）
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8 + p.flowerRotate * 0.15;
      const dist = size * (i % 2 === 0 ? 0.082 : 0.068);
      const px = Math.cos(a) * dist;
      const py = Math.sin(a) * dist;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(px, py);
      ctx.strokeStyle = "rgba(210, 170, 100, 0.40)";
      ctx.lineWidth = Math.max(0.3, size * 0.014);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, py, size * 0.018, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 200, 80, 0.80)";
      ctx.fill();
    }

    ctx.restore();
  }

  function tick() {
    if (!STATE.running) return;

    if (!shouldRun()) {
      stop();
      return;
    }

    const ctx = STATE.ctx;
    const c = STATE.canvas;
    const mode = getDayEffect();

    ctx.clearRect(0, 0, c.width, c.height);

    for (let i = 0; i < STATE.particles.length; i++) {
      const p = STATE.particles[i];

      if (p.mode !== mode) resetParticle(p, false);

      const dx = STATE.mouseX - p.x;
      const dy = STATE.mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0 && dist < SETTINGS.minDist) {
        const ex = dx / dist;
        const ey = dy / dist;
        const force = SETTINGS.minDist / (dist * dist) / 2.6;
        p.x -= force * ex * (mode === "snow" ? 8 : 10);
        p.y -= force * ey * (mode === "snow" ? 4 : 6);
      }

      p.y += p.speedY;
      p.x += p.speedX + Math.cos((p.y + i * 9) * p.swing) * p.swingAmp;
      p.rotation += p.rotationSpeed;

      if (mode === "sakura") {
        p.flowerRotate += p.rotationSpeed * 0.35;
      }

      if (p.y > c.height + 50 || p.x < -70 || p.x > c.width + 70) {
        resetParticle(p, true);
      }

      if (mode === "snow") drawSnow(ctx, p);
      else drawSakura(ctx, p);
    }

    STATE.rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (!shouldRun()) return;
    if (!STATE.canvas || !STATE.ctx) {
      if (!ensureCanvas()) return;
    }
    if (STATE.running) return;

    STATE.running = true;
    initParticles();
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

  function bindEventsOnce() {
    if (window.__snowfallBound) return;
    window.__snowfallBound = true;

    document.addEventListener("mousemove", (e) => {
      STATE.mouseX = e.clientX;
      STATE.mouseY = e.clientY;
    });

    document.addEventListener(
      "touchmove",
      (e) => {
        const t = e.touches && e.touches[0];
        if (!t) return;
        STATE.mouseX = t.clientX;
        STATE.mouseY = t.clientY;
      },
      { passive: true }
    );

    window.addEventListener("resize", () => {
      resizeCanvas();
      if (STATE.running) initParticles();
    });

    const mo = new MutationObserver(() => {
      if (shouldRun()) start();
      else stop();
    });

    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-day-effect"]
    });
  }

  function boot() {
    bindEventsOnce();
    if (shouldRun()) start();
    else stop();
  }

  boot();
  document.addEventListener("pjax:complete", boot);
})();
