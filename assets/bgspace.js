/* 우주 배경 — 마크업은 <div class="space"></div> 한 줄이면 된다.
   별은 캔버스로 512px 타일을 한 번 그려 반복시킨다. 이미지 파일을 두지 않는 이유는
   화면 밀도(1x·2x·3x)마다 선명도가 달라지는 문제를 아예 없애기 위해서다. */
(function () {
  var box = document.querySelector('.space');
  if (!box) return;
  if (!document.createElement('canvas').getContext) return;   /* 캔버스가 없으면 배경도 없다 */

  var T = 512;                      /* 🔴 bgspace.css 의 512px 과 반드시 같아야 한다 */
  var dark = window.matchMedia && matchMedia('(prefers-color-scheme:dark)').matches;

  /* 라이트 화면은 배경이 밝아 흰 별이 보이지 않는다 — 짙은 남색 점으로 뒤집는다.
     다크 화면은 흰 별에 브랜드 컬러 별을 조금 섞는다. */
  function color(a) {
    if (!dark) return 'rgba(28,42,104,' + (a * 0.72).toFixed(3) + ')';
    var r = Math.random();
    if (r < 0.13) return 'rgba(157,184,255,' + a.toFixed(3) + ')';   /* 브랜드 블루 계열 */
    if (r < 0.20) return 'rgba(243,166,220,' + a.toFixed(3) + ')';   /* 브랜드 핑크 계열 */
    return 'rgba(255,255,255,' + a.toFixed(3) + ')';
  }

  /* halo=true 면 큰 별 둘레에 옅은 번짐을 깐다. 이게 있어야 점이 아니라 별로 보인다.
     라이트 화면에서는 얼룩처럼 보여 쓰지 않는다. */
  function tile(n, rMin, rMax, aMin, aMax, halo) {
    var c = document.createElement('canvas');
    c.width = c.height = T;
    var g = c.getContext('2d');
    for (var i = 0; i < n; i++) {
      var x = Math.random() * T, y = Math.random() * T;
      var r = rMin + Math.random() * (rMax - rMin);
      var a = aMin + Math.random() * (aMax - aMin);
      var col = color(a);
      /* 가장자리에 걸친 별은 반대편에도 찍어야 타일을 이어붙였을 때 잘리지 않는다 */
      for (var dx = -T; dx <= T; dx += T) {
        for (var dy = -T; dy <= T; dy += T) {
          var px = x + dx, py = y + dy;
          if (halo && dark && r > 1) {
            var gd = g.createRadialGradient(px, py, 0, px, py, r * 5);
            gd.addColorStop(0,   'rgba(255,255,255,' + (a * 0.30).toFixed(3) + ')');
            gd.addColorStop(1,   'rgba(255,255,255,0)');
            g.fillStyle = gd;
            g.fillRect(px - r * 5, py - r * 5, r * 10, r * 10);
          }
          g.beginPath();
          g.arc(px, py, r, 0, 6.2832);
          g.fillStyle = col;
          g.fill();
        }
      }
    }
    return c.toDataURL('image/png');
  }

  function layer(cls, url) {
    var d = document.createElement('div');
    d.className = cls;
    d.style.backgroundImage = 'url(' + url + ')';
    return d;
  }

  /* 🔴 층을 늘리지 않는다 — 은하수·성운은 bgspace.css 의 .space 배경에 그려 넣었다.
     화면보다 큰 층이 셋을 넘으면 폰 GPU 가 못 버티고, 밀려난 층이 비는 순간이
     곧 번쩍임이다 (2026-08-03). 여기서 만드는 움직이는 층은 별 두 겹뿐이다. */
  var f = document.createDocumentFragment();
  /* 먼지처럼 깔리는 잔별이 많아야 하늘이 비어 보이지 않는다.
     가까운 별에는 예전에 따로 한 겹이던 큰 별(반짝임)을 함께 섞어 넣었다. */
  f.appendChild(layer('stars far',  tile(300, 0.30, 0.85, 0.22, 0.68, false)));
  f.appendChild(layer('stars near', tile(88,  0.75, 1.90, 0.50, 1.00, true)));
  ['met m1', 'met m2'].forEach(function (cls) {
    var d = document.createElement('div'); d.className = cls; f.appendChild(d);
  });
  f.appendChild(document.createElement('i'));   /* 스크림 */
  box.appendChild(f);

  document.body.classList.add('space-on');
  requestAnimationFrame(function () { box.classList.add('on'); });
})();
