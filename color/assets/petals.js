/* 계절 배경 — 컬러마다 어울리는 것이 흩날린다. (2026-08-03 대표님 지시)
 *
 * 컬러별 배경 (2026-08-04 대표님 확정)
 *   봄 라이트     → 벚꽃 흩날리는 길
 *   봄 브라이트   → 벚꽃 (더 선명한 톤)
 *   여름 라이트   → 잔잔한 바다
 *   여름 브라이트 → 지중해 푸른 바다
 *   여름 뮤트     → 안개 낀 새벽 바다
 *   가을 뮤트     → 노을진 들판
 *   가을 딥       → 풍성한 낙엽길
 *   겨울 딥       → 새벽 푸른 달빛의 강가
 *   겨울 브라이트 → 크리스마스 축제
 *
 * 쓰는 법 — <div class="petals" data-scene="spring-light"></div> 한 줄.
 *   장면 이름을 안 주면 body 의 data-color 를 그대로 쓴다.
 *
 * 🔴 왜 mp4 가 아니라 캔버스인가
 *    대표님이 「동영상」이라고 하셨지만 실사 영상을 배경으로 깔면 —
 *      · 5~10MB 를 고객 데이터로 내려받게 한다. 문자로 링크를 받아 밖에서 여는 자료다.
 *      · 폰에서 배터리를 눈에 띄게 먹고, 저전력 모드에서는 자동재생이 아예 막힌다.
 *      · 실사 위에 카드가 얹히면 글자가 읽기 어려워진다.
 *    캔버스로 그리면 **8KB 남짓**이고 화면 밀도·다크모드에 자유롭다.
 *    기존 우주 배경(assets/bgspace.js)도 같은 이유로 캔버스다 — 방식을 맞췄다.
 *    실사 영상으로 바꾸고 싶으시면 이 파일만 갈아 끼우면 된다.
 *
 * 🔴 배경이 본문을 방해하지 않게 하는 장치
 *    · prefers-reduced-motion 이면 아예 그리지 않는다 (멀미·주의력 배려)
 *    · 화면이 안 보이면(다른 탭) 멈춘다 — 배터리를 갉지 않는다
 *    · 폰에서는 꽃잎 수를 줄인다
 */
(function () {
  'use strict';

  var box = document.querySelector('.petals');
  if (!box) return;
  if (!document.createElement('canvas').getContext) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  box.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  var dark = window.matchMedia && matchMedia('(prefers-color-scheme:dark)').matches;
  var dpr  = Math.min(window.devicePixelRatio || 1, 2);   /* 3x 까지 그리면 폰이 뜨거워진다 */
  var W = 0, H = 0, petals = [], raf = 0, running = false;

  /* ── 장면 표 ────────────────────────────────────────────────
     shape  petal(꽃잎) / leaf(낙엽) / flake(눈) / dot(반짝임)
     drift  아래로 떨어지는가(1) 옆으로 흐르는가(0) — 물결·달빛은 옆으로 흐른다
     light  아래에 깔 은은한 빛의 색. 없으면 안 깐다.
     🔴 색은 밝은 화면 기준으로 잡고 다크에서 밝게 올린다.
        반대로 하면 라이트 화면에서 배경이 하얗게 날아가 안 보인다. */
  var SCENES = {
    'spring-light':   { shape:'petal', drift:1, size:[9,13],  speed:[14,26],
                        tint:['244,166,190','240,182,198','250,206,218'],
                        dtint:['255,214,229','255,196,214','255,232,240'] },
    'spring-bright':  { shape:'petal', drift:1, size:[9,14],  speed:[16,28],
                        tint:['238,128,168','246,150,186','252,186,208'],
                        dtint:['255,190,214','255,170,200','255,224,236'] },
    /* 여름 라이트 — 잔잔한 바다. 물비늘이 천천히 옆으로 흐른다 */
    'summer-light':   { shape:'dot',   drift:0, size:[3,9],   speed:[8,18],
                        tint:['120,176,204','150,198,220','186,220,234'],
                        dtint:['150,206,236','176,222,246','206,236,252'],
                        light:'186,222,236' },
    /* 여름 브라이트 — 지중해. 더 진한 파랑에 햇빛 반짝임 */
    'summer-bright':  { shape:'dot',   drift:0, size:[3,10],  speed:[12,24],
                        tint:['46,132,192','72,158,214','130,196,236'],
                        dtint:['96,182,244','130,204,250','180,228,254'],
                        light:'120,196,240' },
    /* 여름 뮤트 — 안개 낀 새벽 바다. 회색이 한 겹 섞인 쿨톤이라
       라이트보다 채도를 낮추고 더 느리게 흐르게 했다 (2026-08-04 신설) */
    'summer-mute':    { shape:'dot',   drift:0, size:[3,9],   speed:[6,14],
                        tint:['148,164,180','168,182,196','186,198,208'],
                        dtint:['178,192,208','198,210,222','214,224,232'],
                        light:'186,198,210' },
    /* 가을 뮤트 — 노을진 들판. 마른 씨앗이 낮게 떠다닌다 */
    'autumn-mute':    { shape:'leaf',  drift:1, size:[7,12],  speed:[10,20],
                        tint:['198,140,96','208,158,112','186,150,120'],
                        dtint:['226,176,130','236,192,146','214,180,150'],
                        light:'238,178,132' },
    /* 가을 딥 — 낙엽길. 크고 묵직하게 떨어진다 */
    'autumn-deep':    { shape:'leaf',  drift:1, size:[11,18], speed:[18,34],
                        tint:['166,86,44','186,104,48','142,72,40'],
                        dtint:['206,124,72','222,142,84','182,102,64'],
                        light:'190,110,64' },
    /* 겨울 딥 — 새벽 강가. 푸른 달빛이 느리게 번진다 */
    'winter-deep':    { shape:'dot',   drift:0, size:[2,7],   speed:[5,12],
                        tint:['96,124,178','122,150,200','156,180,220'],
                        dtint:['142,172,228','170,196,242','200,218,250'],
                        light:'130,158,206' },
    /* 겨울 브라이트 — 크리스마스. 눈과 축제 불빛이 섞인다 */
    'winter-bright':  { shape:'flake', drift:1, size:[5,11],  speed:[16,30],
                        tint:['150,170,200','196,120,120','130,170,140'],
                        dtint:['232,240,255','250,170,170','168,222,182'],
                        light:'214,226,246' }
  };

  var name  = box.dataset.scene || document.body.dataset.color || 'spring-light';
  var scene = SCENES[name] || SCENES['spring-light'];
  var TINTS = dark ? scene.dtint : scene.tint;

  function count() {
    var area = window.innerWidth * window.innerHeight;
    var n = Math.round(area / 18000);
    return Math.max(18, Math.min(n, window.innerWidth < 700 ? 34 : 66));
  }

  function make(seeded) {
    /* 카드가 불투명해 입자가 카드 사이 여백에서만 보인다.
       처음에 6~15px 로 뒀더니 폰에서 거의 안 보였다 — 키웠다 (2026-08-03). */
    var s = scene.size[0] + Math.random() * (scene.size[1] - scene.size[0]);
    var sp = scene.speed[0] + Math.random() * (scene.speed[1] - scene.speed[0]);
    var down = scene.drift === 1;
    return {
      /* 옆으로 흐르는 장면(바다·달빛)은 오른쪽 밖에서 들어온다 */
      x: down ? Math.random() * W : (seeded ? Math.random() * W : W + 20 + Math.random() * 60),
      /* 처음 한 번은 화면 전체에 흩어 둔다 — 안 그러면 맨 위에서 우르르 떨어진다 */
      y: down ? (seeded ? Math.random() * H : -20 - Math.random() * 60) : Math.random() * H,
      s: s,
      vy: down ? sp : (-4 + Math.random() * 8),
      vx: down ? (-8 + Math.random() * 16) : -sp,
      rot: Math.random() * Math.PI * 2,
      vr: down ? (-0.6 + Math.random() * 1.2) : (-0.2 + Math.random() * 0.4),
      sway: 0.4 + Math.random() * 0.9,      /* 흔들리는 폭 */
      phase: Math.random() * Math.PI * 2,
      a: (dark ? 0.40 : 0.55) + Math.random() * 0.3,
      tint: TINTS[(Math.random() * TINTS.length) | 0]
    };
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var want = count();
    if (!petals.length) { for (var i = 0; i < want; i++) petals.push(make(true)); }
    else if (petals.length > want) { petals.length = want; }
    else { while (petals.length < want) petals.push(make(true)); }
  }

  /* 입자 한 개 — 장면에 따라 모양만 바뀐다 */
  function draw(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = 'rgba(' + p.tint + ',' + p.a.toFixed(3) + ')';
    var s = p.s;

    if (scene.shape === 'petal') {
      /* 벚꽃잎 — 끝이 살짝 파인 타원 */
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.5);
      ctx.bezierCurveTo(s * 0.55, -s * 0.35, s * 0.45, s * 0.45, 0, s * 0.5);
      ctx.bezierCurveTo(-s * 0.45, s * 0.45, -s * 0.55, -s * 0.35, 0, -s * 0.5);
      ctx.fill();

    } else if (scene.shape === 'leaf') {
      /* 낙엽 — 양끝이 뾰족한 잎. 가운데 잎맥을 한 줄 그어 잎처럼 보이게 한다 */
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.5);
      ctx.quadraticCurveTo(s * 0.5, 0, 0, s * 0.5);
      ctx.quadraticCurveTo(-s * 0.5, 0, 0, -s * 0.5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(' + p.tint + ',' + (p.a * 0.5).toFixed(3) + ')';
      ctx.lineWidth = Math.max(0.6, s * 0.06);
      ctx.beginPath(); ctx.moveTo(0, -s * 0.42); ctx.lineTo(0, s * 0.42); ctx.stroke();

    } else if (scene.shape === 'flake') {
      /* 눈 — 여섯 갈래. 크리스마스 불빛도 이 모양으로 섞여 반짝인다 */
      ctx.strokeStyle = 'rgba(' + p.tint + ',' + p.a.toFixed(3) + ')';
      ctx.lineWidth = Math.max(0.8, s * 0.09);
      ctx.lineCap = 'round';
      for (var i = 0; i < 3; i++) {
        var a = (Math.PI / 3) * i;
        ctx.beginPath();
        ctx.moveTo(-Math.cos(a) * s * 0.5, -Math.sin(a) * s * 0.5);
        ctx.lineTo(Math.cos(a) * s * 0.5, Math.sin(a) * s * 0.5);
        ctx.stroke();
      }

    } else {
      /* 물비늘·달빛 — 옆으로 늘인 타원. 물 위에 뜬 빛처럼 보인다 */
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.9, s * 0.30, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  var last = 0;
  function frame(now) {
    if (!running) return;
    if (!last) last = now;
    var dt = Math.min((now - last) / 1000, 0.05);   /* 탭을 다시 켰을 때 확 튀지 않게 상한 */
    last = now;

    ctx.clearRect(0, 0, W, H);

    /* 바다·노을·달빛은 아래쪽에 은은한 빛을 한 겹 깐다 — 입자만으로는 장면이 안 선다 */
    if (scene.light) {
      var g = ctx.createLinearGradient(0, H * 0.55, 0, H);
      g.addColorStop(0, 'rgba(' + scene.light + ',0)');
      g.addColorStop(1, 'rgba(' + scene.light + ',' + (dark ? 0.10 : 0.16) + ')');
      ctx.fillStyle = g;
      ctx.fillRect(0, H * 0.55, W, H * 0.45);
    }

    var down = scene.drift === 1;
    for (var i = 0; i < petals.length; i++) {
      var p = petals[i];
      p.phase += dt * p.sway;
      p.y += (p.vy + (down ? 0 : Math.sin(p.phase) * 4)) * dt;
      p.x += (p.vx + (down ? Math.sin(p.phase) * 12 : 0)) * dt;
      p.rot += p.vr * dt;

      if (down) {
        if (p.y > H + 24) { petals[i] = make(false); continue; }
        if (p.x < -30) p.x = W + 20;
        if (p.x > W + 30) p.x = -20;
      } else {
        if (p.x < -40) { petals[i] = make(false); continue; }
        if (p.y < -20) p.y = H + 10;
        if (p.y > H + 20) p.y = -10;
      }
      draw(p);
    }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true; last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t); t = setTimeout(resize, 180);
  }, { passive: true });

  /* 안 보이는 동안에는 돌리지 않는다 */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  resize();
  start();
})();
