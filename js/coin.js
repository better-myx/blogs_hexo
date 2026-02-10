(function () {
    function initCoinButtons() {
      var tipButtons = document.querySelectorAll('.tip-button');
      tipButtons.forEach(function (button) {
        // 防止 PJAX/重复初始化导致重复绑定
        if (button.dataset.coinInit === '1') return;
        button.dataset.coinInit = '1';
  
        var coin = button.querySelector('.coin');
        if (!coin) return;
  
        function playCoinAudio() {
          var audio = document.getElementById("coinAudio");
          if (audio) {
            // 可选：设置音量 0~1
            // audio.volume = 0.6;
            audio.currentTime = 0;
            audio.play();
          }
        }
  
        coin.maxMoveLoopCount = 90;
  
        button.addEventListener('click', function () {
          // 原作者：移动端不执行动画（你也可以删除这行让移动端执行）
          if (/Android|webOS|BlackBerry/i.test(navigator.userAgent)) return true;
          if (button.clicked) return;
  
          button.classList.add('clicked');
  
          setTimeout(function () {
            coin.sideRotationCount = Math.floor(Math.random() * 5) * 90;
            coin.maxFlipAngle = (Math.floor(Math.random() * 4) + 3) * Math.PI;
            button.clicked = true;
            flipCoin();
            playCoinAudio();
          }, 50);
        });
  
        function flipCoin() {
          coin.moveLoopCount = 0;
          flipCoinLoop();
        }
  
        function resetCoin() {
          coin.style.setProperty('--coin-x-multiplier', 0);
          coin.style.setProperty('--coin-scale-multiplier', 0);
          coin.style.setProperty('--coin-rotation-multiplier', 0);
          coin.style.setProperty('--shine-opacity-multiplier', 0.4);
          coin.style.setProperty('--shine-bg-multiplier', '50%');
          coin.style.setProperty('opacity', 1);
  
          setTimeout(function () {
            button.clicked = false;
          }, 300);
        }
  
        function flipCoinLoop() {
          coin.moveLoopCount++;
          var p = coin.moveLoopCount / coin.maxMoveLoopCount;
          coin.angle = -coin.maxFlipAngle * Math.pow((p - 1), 2) + coin.maxFlipAngle;
  
          coin.style.setProperty('--coin-y-multiplier', -11 * Math.pow(p * 2 - 1, 4) + 11);
          coin.style.setProperty('--coin-x-multiplier', p);
          coin.style.setProperty('--coin-scale-multiplier', p * 0.6);
          coin.style.setProperty('--coin-rotation-multiplier', p * coin.sideRotationCount);
  
          coin.style.setProperty('--front-scale-multiplier', Math.max(Math.cos(coin.angle), 0));
          coin.style.setProperty('--front-y-multiplier', Math.sin(coin.angle));
  
          coin.style.setProperty('--middle-scale-multiplier', Math.abs(Math.cos(coin.angle), 0));
          coin.style.setProperty('--middle-y-multiplier', Math.cos((coin.angle + Math.PI / 2) % Math.PI));
  
          coin.style.setProperty('--back-scale-multiplier', Math.max(Math.cos(coin.angle - Math.PI), 0));
          coin.style.setProperty('--back-y-multiplier', Math.sin(coin.angle - Math.PI));
  
          coin.style.setProperty('--shine-opacity-multiplier', 4 * Math.sin((coin.angle + Math.PI / 2) % Math.PI) - 3.2);
          coin.style.setProperty('--shine-bg-multiplier', (-40 * (Math.cos((coin.angle + Math.PI / 2) % Math.PI) - 0.5)) + '%');
  
          if (coin.moveLoopCount < coin.maxMoveLoopCount) {
            if (coin.moveLoopCount === coin.maxMoveLoopCount - 6) button.classList.add('shrink-landing');
            window.requestAnimationFrame(flipCoinLoop);
          } else {
            button.classList.add('coin-landed');
            coin.style.setProperty('opacity', 0);
  
            setTimeout(function () {
              button.classList.remove('clicked', 'shrink-landing', 'coin-landed');
              setTimeout(resetCoin, 300);
            }, 1500);
          }
        }
      });
    }
  
    // 首次加载
    document.addEventListener('DOMContentLoaded', initCoinButtons);
  
    // Butterfly 常见 PJAX 事件（不同版本可能触发其一）
    document.addEventListener('pjax:complete', initCoinButtons);
    document.addEventListener('pjax:end', initCoinButtons);
  
    // 有些主题用这个
    document.addEventListener('swup:contentReplaced', initCoinButtons);
})();
