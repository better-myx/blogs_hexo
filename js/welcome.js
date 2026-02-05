// source/js/welcome.js
(() => {
    let ipLocation = null;
  
    // ✅ 首页判断（兼容 GitHub Pages 的 /blogs_hexo/）
    function isHomePage() {
      const p = window.location.pathname;
      return (
        p === "/" ||
        p === "/index.html" ||
        p === "/blogs_hexo/" ||
        p === "/blogs_hexo/index.html"
      );
    }
  
    // ✅ 非首页隐藏公告卡片（文章页/归档页等不显示）
    function toggleAnnouncementVisible(visible) {
      const card = document.querySelector("#aside-content .card-announcement");
      if (!card) return;
      card.style.display = visible ? "" : "none";
    }
  
    // ✅ 距离计算：经纬度（lon/lat）
    function getDistance(lon1, lat1, lon2, lat2) {
      const R = 6371;
      const { cos, sin, asin, PI, hypot } = Math;
  
      const toPoint = (lon, lat) => {
        lon *= PI / 180;
        lat *= PI / 180;
        return { x: cos(lat) * cos(lon), y: cos(lat) * sin(lon), z: sin(lat) };
      };
  
      const a = toPoint(lon1, lat1);
      const b = toPoint(lon2, lat2);
      const c = hypot(a.x - b.x, a.y - b.y, a.z - b.z);
      return Math.round(asin(c / 2) * 2 * R);
    }
  
    // ✅ 把不同接口返回统一成：{ ip, data:{country, prov, city, district, lat, lng} }
    function normalize(payload, provider) {
      // ipapi.co/json
      if (provider === "ipapi") {
        return {
          ip: payload.ip || "",
          data: {
            country: payload.country_name || payload.country || "",
            prov: payload.region || payload.region_code || "",
            city: payload.city || "",
            district: "",
            lat: Number(payload.latitude),
            lng: Number(payload.longitude),
          },
        };
      }
  
      // ipinfo.io/json
      if (provider === "ipinfo") {
        let lat = NaN, lng = NaN;
        if (typeof payload.loc === "string" && payload.loc.includes(",")) {
          const [la, lo] = payload.loc.split(",");
          lat = Number(la);
          lng = Number(lo);
        }
        return {
          ip: payload.ip || "",
          data: {
            country: payload.country || "",
            prov: payload.region || "",
            city: payload.city || "",
            district: "",
            lat,
            lng,
          },
        };
      }
  
      // ip-api.com/json
      if (provider === "ipapi_com") {
        return {
          ip: payload.query || "",
          data: {
            country: payload.country || "",
            prov: payload.regionName || "",
            city: payload.city || "",
            district: "",
            lat: Number(payload.lat),
            lng: Number(payload.lon),
          },
        };
      }
  
      return null;
    }
  
    // ✅ 多接口获取定位（无 key 平替）
    async function fetchLocation() {
      const tries = [
        { name: "ipapi", url: "https://ipapi.co/json/" },
        { name: "ipinfo", url: "https://ipinfo.io/json" },
        {
          name: "ipapi_com",
          url: "https://ip-api.com/json/?fields=status,message,country,regionName,city,lat,lon,query",
        },
      ];
  
      for (const t of tries) {
        try {
          const res = await fetch(t.url, { cache: "no-store" });
          if (!res.ok) throw new Error(`${t.name} http ${res.status}`);
          const json = await res.json();
  
          if (t.name === "ipapi_com" && json.status && json.status !== "success") {
            throw new Error(`ip-api status: ${json.message || "fail"}`);
          }
  
          const normalized = normalize(json, t.name);
          if (
            normalized &&
            normalized.data &&
            Number.isFinite(normalized.data.lat) &&
            Number.isFinite(normalized.data.lng)
          ) {
            return normalized;
          }
        } catch (e) {
          console.warn("[welcome] location fetch failed:", t.name, e);
        }
      }
      return null;
    }
  
    function getTimeGreeting() {
      const h = new Date().getHours();
      if (h >= 5 && h < 11) return "🌤️ 早上好，加油加油 💪";
      if (h >= 11 && h < 13) return "☀️ 中午好，记得午休喔 🍹";
      if (h >= 13 && h < 17) return "🕞 下午好，饮茶先啦 ☕";
      if (h >= 17 && h < 19) return "🚶‍♂️ 即将下班，按时吃饭喔 🍚";
      if (h >= 19 && h < 23) return "🌙 晚上好，夜生活嗨起来 🍻";
      return "🛏️ 夜深了，早点休息 🌃";
    }
  
    // ✅ 国家文案（宽松匹配：中/英/代码）
    function getPosDesc(countryRaw) {
      const country = String(countryRaw || "").trim();
      const c = country.toLowerCase();
  
      if (c.includes("united states") || c.includes("usa") || c === "us" || country === "美国") {
        return "Let us live in peace!";
      }
      if (c.includes("japan") || c === "jp" || country === "日本") {
        return "よろしく，一起去看樱花吗";
      }
      if (c.includes("china") || c === "cn" || country === "中国") {
        return "带我去你的城市逛逛吧！";
      }
      return "带我去你的国家逛逛吧";
    }
  
    function buildOverviewBlock() {
      return `
        <div class="ann-box ann-box--overview">
          <div class="ann-text">
            本站使用框架 Hexo 8.1.1、主题 Butterfly 5.5.3 搭建，托管在 Github 上，
            图床使用「GitHub 公共仓库 + Vercel + 自己的二级域名」。
          </div>
        </div>
      `;
    }
  
    function buildWelcomeBlock() {
      return `
        <div class="ann-box ann-box--welcome">
          <div id="welcome-lines" class="welcome-info">正在获取定位信息…</div>
        </div>
      `;
    }
  
    function ensureWelcomeDOM() {
      const host = document.getElementById("welcome-info");
      if (!host) return null;
  
      host.classList.add("welcome-host");
      if (host.dataset.built === "1") return host;
  
      host.innerHTML = `
        ${buildOverviewBlock()}
        ${buildWelcomeBlock()}
      `;
      host.dataset.built = "1";
      return host;
    }
  
    function showWelcome() {
      const host = ensureWelcomeDOM();
      if (!host) return;
  
      const lines = host.querySelector("#welcome-lines");
      if (!lines) return;
  
      if (!ipLocation || !ipLocation.data) {
        lines.textContent = "定位信息获取失败（可能被接口限频或浏览器拦截），请稍后刷新页面～";
        return;
      }
  
      // ✅ 你“开始那组”坐标：保持不变
      const myLng = 116.680584;
      const myLat = 35.649829;
  
      const uLat = ipLocation.data.lat;
      const uLng = ipLocation.data.lng;
  
      const dist = getDistance(myLng, myLat, uLng, uLat);
  
      // ✅ 本次修改：只展示“国家”，不再拼省市区
      const country = ipLocation.data.country || "未知地区";
      const pos = country;
  
      // IP（IPv6 简化）
      let ip = ipLocation.ip || "未知IP";
      if (typeof ip === "string" && ip.includes(":")) ip = "好复杂，咱看不懂~(ipv6)";
  
      const greet = getTimeGreeting();
      const posdesc = getPosDesc(country);
  
      lines.innerHTML = `
        <div class="w-row w-row--from">
          <span class="w-label">欢迎来自</span>
          <span class="w-val">${pos}</span>
          <span>的朋友💖</span>
        </div>
  
        <div class="w-row">
          <span class="w-label">距博主约：</span>
          <span class="w-val">${Number(dist).toFixed(2)}</span>
          <span>公里 🚗</span>
        </div>
  
        <div class="w-row">
          <span class="w-label">IP 地址是：</span>
          <span class="w-val">${ip}</span>
        </div>
  
        <div class="w-row">
          <span>${greet}</span>
        </div>
  
        <div class="w-tip">${posdesc}</div>
      `;
    }
  
    async function boot() {
      if (!isHomePage()) {
        toggleAnnouncementVisible(false);
        return;
      }
      toggleAnnouncementVisible(true);
  
      const host = ensureWelcomeDOM();
      if (!host) return;
  
      const lines = host.querySelector("#welcome-lines");
      if (lines) lines.textContent = "正在获取定位信息…";
  
      ipLocation = await fetchLocation();
      showWelcome();
    }
  
    window.addEventListener("load", boot);
    document.addEventListener("pjax:complete", () => {
      const host = document.getElementById("welcome-info");
      if (host) host.dataset.built = "0";
      boot();
    });
  })();
  