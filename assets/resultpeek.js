/* 프로그램별 「무엇을 받으시나」 팝업 (2026-08-05 대표님 지시)
   ① 「퍼스널컬러 온라인 링크를 컨설팅 끝난 뒤에 나눠주잖아, 이걸 여성 프로그램 신청에
      팝업 형태로 홍보하는 건 어때. 약간 동영상처럼」
   ② 「프로그램을 선택하면 어떤 자료를 주는지 띄우는 것도 좋겠다.
      골격진단을 신청하면 브로슈어를 주는 것처럼. 팝업창을 여러 개 띄우는 거지」

   🔴 창을 네 개 띄우지 않았다.
      팝업이 연달아 뜨면 광고가 된다. **한 창 안에서 프로그램을 고르시게** 했다.
      고르시면 그 프로그램에서 받으시는 것으로 화면이 바뀐다 — 창은 하나, 내용은 넷이다.

   🔴 영상 파일을 쓰지 않는다.
      mp4 는 무겁고, 짧은 루프는 되감기는 순간이 눈에 띈다.
      **길게 자른 JPEG 한 장**을 폰 목업 안에서 위아래로 천천히 흘린다 (`alternate`).
      왕복이라 이어 붙일 필요가 없다.

   🔴 소재에 실제 사람 얼굴이 없다.
      · `peek-result.jpg`   — 자료의 립 그리드 구간(2100~4600). 그 밖에는 유튜브 썸네일·모델 컷이 있다.
      · `peek-brochure.jpg` — 브로슈어 상세의 지면 구간(4250~6650). 인물은 **AI 실사 이미지**다.
      🚫 구간을 늘릴 때는 반드시 눈으로 확인한다 (`본사\작업\결과자료-팝업\`).

   보여 주는 규칙 — 광고가 아니라 안내로 느껴지게 하는 선이다.
     ① 들어오고 1.6초 뒤 · ② 하루 한 번 · ③ 「30일 보지 않기」
     ④ 바깥 클릭·Esc 로 닫힌다 · ⑤ 움직임을 싫어하는 기기에서는 흐르지 않는다
*/
(function () {
  'use strict';

  var KEY_DAY  = 'rp-hide-day';
  var KEY_LONG = 'rp-hide-long';
  var BASE     = 'https://ardentor.github.io/iami-class/';

  /* 🔴 남자 프로그램은 **전부 같은 것 세 가지**를 드린다 (2026-08-05 대표님 확인).
        그래서 프로그램별로 가르지 않고 **받으시는 것 세 가지**를 탭으로 둔다.
        여자 쪽은 프로그램마다 다르므로 프로그램별로 가른다. */
  var MEN = [
    {
      id: 'card', tab: 'AI 카드', img: '../assets/peek-card-men.jpg', flow: 400,
      h: '진단이 끝나면,<br><em>퍼스널컬러 카드</em>를 드립니다.',
      d: '<b>90 × 50mm</b> 카드에 내 계절과 어울리는 컬러가 담깁니다.<br>'
       + '지갑에 넣고 다니시다가 <b>옷 고를 때 꺼내 보시면</b> 됩니다.',
      go: 'https://smartstore.naver.com/iami_branding/products/13205500180', goTx: '카드 자세히'
    },
    {
      id: 'report', tab: '결과 레포트', img: '../assets/peek-report.jpg', flow: 2200,
      h: '진단이 끝나면,<br><em>결과 레포트</em>를 보내 드립니다.',
      d: '색의 <b>온도 · 명도 · 채도 · 청탁</b> 네 가지를 내 얼굴 기준으로 풀어 드립니다.<br>'
       + '무엇이 <b>좋고 무엇이 안 좋은지</b> 사진으로 나란히 놓여 있어, 나중에 다시 봐도 그대로 씁니다.',
      go: '', goTx: ''
    },
    {
      id: 'brochure', tab: '브로슈어', img: '../assets/peek-brochure-men.jpg', flow: 700,
      h: '진단이 끝나면,<br><em>브로슈어</em>를 드립니다.',
      d: '<b>A5 3단 폴더</b>로 만든 내 체형 브로슈어를 손에 들고 가십니다.<br>'
       + '어울리는 실루엣과 피할 것이 사진과 함께 담겨 있어, <b>옷 앞에서 망설일 때</b> 꺼내 보시면 됩니다.',
      go: 'https://smartstore.naver.com/iami_branding/products/9852866140', goTx: '브로슈어 자세히'
    },
    /* 프리미엄 골격에만 붙는 1년 구독 (2026-08-05 대표님 지시).
       화면은 실제 구독 페이지의 **웨이브 체형**을 그대로 담았다. */
    {
      id: 'sub', tab: '구독', img: '../assets/peek-sub-wave.jpg',
      h: '프리미엄 골격은,<br><em>1년 구독</em>이 따라옵니다.',
      d: '내 체형에 맞는 <b>아이템과 코디</b>가 계절마다 쌓입니다.<br>'
       + '눌러 보시면 그 옷을 <b>어디서 사는지</b>까지 이어집니다. 화면은 <b>웨이브 체형</b> 예시입니다.',
      go: '', goTx: ''
    },
    {
      id: 'icru', tab: 'ICRU', img: '../assets/peek-icru.jpg',
      h: '기질을 읽고,<br><em>레포트</em>로 남겨 드립니다.',
      d: '융의 인지기능을 바탕으로 <b>네 가지 기질</b> 가운데 내 자리를 찾습니다.<br>'
       + '강점과 소통 방식, 성장 방향까지 <b>한 권</b>으로 정리해 드립니다.',
      go: '', goTx: ''
    }
  ];

  /* 파트너(이미지컨설턴트) 모집 페이지용 (2026-08-06 대표님 지시).
     🔴 여기는 **선생님들**이 보시는 자리다. 고객 페이지와 호칭이 다르다.
     🔴 링크는 **샘플**로 건다 — 파트너께 보여 드리는 예시 자료가 맞다.
        고객 페이지에서는 본판을 걸었는데, 여기서는 반대다. 읽는 사람이 다르기 때문이다.
     📌 보여 드릴 것이 하나뿐이라 탭 줄은 감춘다 (아래 length 검사). */
  var PARTNER = [
    {
      id: 'sub', tab: '자료', img: '../assets/peek-result.jpg', flow: 620,
      h: '선생님 상호로,<br><em>이 자료</em>가 나갑니다.',
      d: '립 · 팔레트 · 블러셔 · 향수 · 헤어에 <b>골격별 코디</b>까지 담겨 있습니다.<br>'
       + '<b>매주 일요일</b> 저희가 갱신하고, 맨 아래 <b>한 줄</b>만 저희 자리입니다.',
      go: 'color/c/sample/spring-light/', goTx: '샘플 자료 보기'
    }
  ];

  /* 🔴 프로그램 이름은 /women/ 의 programs 와 같아야 한다. 한쪽만 고치면 어긋난다. */
  var TABS = [
    {
      id: 'basic', tab: '베이직', name: '퍼스널컬러 베이직',
      img: '../assets/peek-result.jpg', flow: 620,
      h: '진단이 끝나면,<br><em>온라인 자료</em>를 드립니다.',
      d: '내 컬러에 맞는 <b>립 · 팔레트 · 블러셔 · 향수 · 헤어</b>가 담긴 링크를 보내 드립니다.<br>'
       + '지갑에 넣고 다니실 <b>퍼스널컬러 카드</b>도 함께 드립니다.<br>'
       + '<b>매주 일요일 갱신</b>되니, 옷 사실 때 열어 보시면 됩니다.',
      go: 'color/spring-light/', goTx: '자료 미리 보기'
    },
    {
      id: 'frame', tab: '골격진단', name: '골격진단 (체형분석)',
      img: '../assets/peek-brochure.jpg', flow: 700,
      h: '진단이 끝나면,<br><em>브로슈어</em>를 드립니다.',
      d: '<b>A5 3단 폴더</b>로 만든 내 체형 브로슈어를 손에 들고 가십니다.<br>'
       + '어울리는 실루엣과 피할 것이 사진과 함께 담겨 있어, <b>옷 앞에서 망설일 때</b> 꺼내 보시면 됩니다.',
      go: 'https://smartstore.naver.com/iami_branding/products/9767726182', goTx: '브로슈어 자세히'
    },
    /* 🔴 프리미엄·토탈은 받는 것이 여럿이다 (2026-08-06 대표님 지시).
       브로슈어 하나만 왔다 갔다 하면 나머지가 없는 것처럼 보인다.
       → 자료 → 브로슈어 (→ ICRU) 를 이어 붙여, 흐르는 동안 전부 지나가게 했다. */
    {
      id: 'premium', tab: '프리미엄', name: '프리미엄 (컬러 + 골격)',
      img: '../assets/peek-premium-w.jpg',
      h: '기준이<br><em>두 개</em> 섭니다.',
      d: '퍼스널컬러 <b>온라인 자료 · 카드</b>와 골격 <b>브로슈어</b>를 함께 드립니다.<br>'
       + '여기에 컬러·골격을 한 장에 담은 <b>포스트카드</b>까지 더해집니다.',
      go: 'color/spring-light/', goTx: '온라인 자료 보기'
    },
    {
      id: 'total', tab: '토탈', name: '토탈 프리미엄',
      img: '../assets/peek-total-w.jpg',
      h: '안과 밖을<br><em>같은 날</em> 정리합니다.',
      d: '프리미엄에 드리는 것 전부에 <b>ICRU 기질 레포트</b>가 더해집니다.<br>'
       + '방문 전 온라인으로 5분이면 끝나고, 결과는 그날 상담에 그대로 쓰입니다.',
      go: 'color/spring-light/', goTx: '온라인 자료 보기'
    },
    {
      id: 'icru', tab: 'ICRU', name: 'ICRU 성향분석',
      img: '../assets/peek-icru.jpg',
      h: '기질을 읽고,<br><em>레포트</em>로 남겨 드립니다.',
      d: '융의 인지기능을 바탕으로 <b>네 가지 기질</b> 가운데 내 자리를 찾습니다.<br>'
       + '강점과 소통 방식, 성장 방향까지 <b>한 권</b>으로 정리해 드립니다.',
      go: '', goTx: ''
    }
  ];

  var test = location.search.indexOf('rp=test') > -1;   /* 확인용 — 아래 두 규칙을 건너뛴다 */

  /* 🔴 「30일 보지 않기」를 누르면 되돌릴 방법이 없었다 (2026-08-06).
     대표님이 확인하시다 한 번 누르시면 그 뒤로 팝업이 안 떠서 「고장났나」로 보인다.
     → 주소 뒤에 `?rp=reset` 을 붙이면 기록을 지우고 다시 뜬다. */
  if (location.search.indexOf('rp=reset') > -1) {
    try { localStorage.removeItem(KEY_DAY); localStorage.removeItem(KEY_LONG); } catch (e) {}
  }

  if (!test) {
    try {
      var today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem(KEY_DAY) === today) return;
      var until = localStorage.getItem(KEY_LONG);
      if (until && new Date(until) > new Date()) return;
    } catch (e) { /* 저장소를 못 쓰면 그냥 보여 준다 */ }
  }

  var css = ''
    + '.rp-dim{position:fixed;inset:0;z-index:9000;background:rgba(10,10,16,.62);'
    +   'backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);'
    +   'display:flex;align-items:center;justify-content:center;padding:18px;'
    +   'opacity:0;transition:opacity .28s ease}'
    + '.rp-dim.on{opacity:1}'
    + '.rp-box{position:relative;width:100%;max-width:362px;border-radius:22px;overflow:hidden;'
    +   'background:#14151b;color:#f2f1f6;box-shadow:0 24px 60px rgba(0,0,0,.5);'
    +   'transform:translateY(14px) scale(.98);transition:transform .3s cubic-bezier(.2,0,0,1);'
    +   'font-family:"Paperlogy",-apple-system,BlinkMacSystemFont,"Malgun Gothic",sans-serif}'
    + '.rp-dim.on .rp-box{transform:none}'
    /* 🔴 닫기는 탭 줄 아래(폰 무대 위)에 둔다. 같은 높이에 두면 마지막 탭을 덮는다. */
    + '.rp-x{position:absolute;top:56px;right:10px;z-index:4;width:30px;height:30px;'
    +   'border:0;border-radius:50%;background:rgba(0,0,0,.45);color:#fff;font-size:16px;'
    +   'line-height:30px;cursor:pointer;padding:0}'
    /* 프로그램 고르는 줄 — 창을 여러 개 띄우지 않고 여기서 바꾼다 */
    + '.rp-tabs{display:flex;gap:5px;padding:12px 12px 0;background:#14151b}'
    /* 탭이 다섯이 되면 글자가 눌린다 — 조금 줄이고 줄바꿈을 막는다 (2026-08-06) */
    + '.rp-tabs button{flex:1;padding:8px 2px;border:0;border-radius:9px;cursor:pointer;'
    +   'font-family:inherit;font-size:10.8px;font-weight:700;letter-spacing:-.04em;white-space:nowrap;'
    +   'background:rgba(255,255,255,.07);color:#8d8c97}'
    + '.rp-tabs button.on{background:#ea5ec1;color:#fff}'
    /* 폰 목업 — 자료가 이 안에서 흐른다 */
    + '.rp-stage{position:relative;height:224px;margin-top:12px;'
    +   'background:linear-gradient(180deg,#241b30,#14151b);'
    +   'display:flex;align-items:center;justify-content:center;overflow:hidden}'
    + '.rp-glow{position:absolute;width:270px;height:270px;border-radius:50%;'
    +   'background:radial-gradient(circle,rgba(234,94,193,.32),transparent 62%)}'
    + '.rp-phone{position:relative;width:128px;height:192px;border-radius:15px;'
    +   'background:#fff;overflow:hidden;box-shadow:0 12px 28px rgba(0,0,0,.45);border:3px solid #2b2c36}'
    + '.rp-phone img{position:absolute;left:0;top:0;width:100%;display:block}'
    + '.rp-phone img.fl{animation:rp-flow var(--dur,46s) ease-in-out infinite alternate}'
    + '@keyframes rp-flow{from{transform:translateY(0)}to{transform:translateY(calc(var(--sh,620px) * -1))}}'
    + '@media (prefers-reduced-motion:reduce){.rp-phone img.fl{animation:none}}'
    + '.rp-phone::before,.rp-phone::after{content:"";position:absolute;left:0;right:0;height:20px;z-index:2;pointer-events:none}'
    + '.rp-phone::before{top:0;background:linear-gradient(180deg,#fff,transparent)}'
    + '.rp-phone::after{bottom:0;background:linear-gradient(0deg,#fff,transparent)}'
    + '.rp-tag{position:absolute;left:13px;top:13px;z-index:3;padding:5px 11px;border-radius:100px;'
    +   'background:rgba(234,94,193,.92);color:#fff;font-size:11px;font-weight:800;letter-spacing:-.01em}'
    + '.rp-body{padding:17px 20px 19px}'
    + '.rp-h{font-size:17.5px;font-weight:800;line-height:1.42;letter-spacing:-.03em;margin:0 0 9px}'
    + '.rp-h em{font-style:normal;color:#f58bd3}'
    + '.rp-d{margin:0;font-size:13.2px;line-height:1.68;color:#b9b8c4;min-height:66px}'
    + '.rp-d b{color:#f2f1f6;font-weight:700}'
    + '.rp-btns{display:flex;gap:8px;margin-top:15px}'
    + '.rp-btns a,.rp-btns button{flex:1;padding:12px 8px;border:0;border-radius:100px;cursor:pointer;'
    +   'font-family:inherit;font-size:13.5px;font-weight:700;text-align:center;text-decoration:none}'
    + '.rp-go{background:#1456f0;color:#fff}'
    + '.rp-no{background:rgba(255,255,255,.09);color:#b9b8c4}'
    + '.rp-never{display:block;width:100%;margin-top:9px;background:none;border:0;cursor:pointer;'
    +   'color:#75747f;font-family:inherit;font-size:12px;padding:4px}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var dim = document.createElement('div');
  dim.className = 'rp-dim';
  dim.setAttribute('role', 'dialog');
  dim.setAttribute('aria-label', '프로그램별로 받으시는 자료 안내');

  /* 어느 페이지인지에 따라 보여 줄 것을 고른다.
     🔴 주소로 가른다 — 페이지마다 스크립트를 따로 두면 고칠 곳이 셋이 된다. */
  var TAG = '진단 후 드립니다';
  if (location.pathname.indexOf('/men/') > -1)          TABS = MEN;
  else if (location.pathname.indexOf('/partner/') > -1) {
    TABS = PARTNER;
    /* 파트너는 진단을 **하시는** 분이다. 「진단 후 드립니다」는 받는 쪽 말이라 맞지 않는다. */
    TAG = '구독하시면';
  }

  var tabsHtml = TABS.map(function (t, i) {
    return '<button type="button" data-i="' + i + '"' + (i === 0 ? ' class="on"' : '') + '>' + t.tab + '</button>';
  }).join('');

  dim.innerHTML = ''
    + '<div class="rp-box">'
    +   '<button class="rp-x" type="button" aria-label="닫기">✕</button>'
    /* 보여 드릴 것이 하나뿐이면 탭 줄을 감춘다 — 고를 것이 없는데 탭만 있으면 어색하다.
       닫기 단추도 그만큼 위로 올린다. */
    +   (TABS.length > 1 ? '<div class="rp-tabs">' + tabsHtml + '</div>' : '')
    +   '<div class="rp-stage">'
    +     '<span class="rp-tag">' + TAG + '</span>'
    +     '<div class="rp-glow"></div>'
    +     '<div class="rp-phone"><img id="rpImg" alt="받으시는 자료"></div>'
    +   '</div>'
    +   '<div class="rp-body">'
    +     '<p class="rp-h" id="rpH"></p>'
    +     '<p class="rp-d" id="rpD"></p>'
    +     '<div class="rp-btns">'
    +       '<a class="rp-go" id="rpGo" target="_blank" rel="noopener"></a>'
    +       '<button class="rp-no" type="button">닫기</button>'
    +     '</div>'
    +     '<button class="rp-never" type="button">30일 동안 보지 않기</button>'
    +   '</div>'
    + '</div>';

  /* 🔴 얼마나 내려갈지는 **그림이 실린 뒤에 재서** 정한다 (2026-08-05).
     처음에는 손으로 적은 값(flow)을 썼는데, 그림이 폰 폭(128px)에 맞춰 **작게 줄어드는 것**을
     빠뜨렸다. 390px 폭 그림이 128px 로 줄면 높이도 1/3 이 된다.
     그래서 브로슈어가 끝까지 내려간 뒤 **흰 여백이 한참 보였다.**
     → 줄어든 실제 높이에서 폰 높이를 뺀 만큼만 움직인다. 여백이 남을 수 없다. */
  function fit(img) {
    var phone = dim.querySelector('.rp-phone');
    if (!phone || !img.clientHeight) return;
    var shift = Math.max(0, img.clientHeight - phone.clientHeight);
    img.style.setProperty('--sh', shift + 'px');
    /* 초당 78px (대표님 지시로 13 → 26 → 78). 짧은 그림은 너무 빨리 끝나지 않게 4초를 바닥으로 둔다. */
    img.style.setProperty('--dur', Math.max(4, Math.round(shift / 78)) + 's');
    /* 움직일 거리가 거의 없으면(카드처럼 짧은 그림) 흐르게 두지 않는다 — 덜덜거리기만 한다 */
    if (shift < 24) { img.classList.remove('fl'); return; }
    img.classList.add('fl');
  }

  function paint(i) {
    var t = TABS[i];
    var img = dim.querySelector('#rpImg');
    /* 애니메이션을 잠깐 껐다 켜야 새 그림이 처음부터 흐른다 */
    img.classList.remove('fl');
    img.removeAttribute('style');
    img.onload = function () { requestAnimationFrame(function () { fit(img); }); };
    img.src = t.img;
    if (img.complete) img.onload();

    dim.querySelector('#rpH').innerHTML = t.h;
    dim.querySelector('#rpD').innerHTML = t.d;
    var go = dim.querySelector('#rpGo');
    if (t.go) {
      go.style.display = '';
      go.href = (t.go.indexOf('http') === 0) ? t.go : (BASE + t.go);
      go.textContent = t.goTx;
    } else {
      /* 살 수 있는 물건이 아닌 것(결과 레포트)은 버튼을 감춘다 — 눌러도 갈 곳이 없다 */
      go.style.display = 'none';
    }

    Array.prototype.forEach.call(dim.querySelectorAll('.rp-tabs button'), function (b, n) {
      b.className = (n === i) ? 'on' : '';
    });
  }

  function close(long) {
    try {
      if (long) {
        var d = new Date(); d.setDate(d.getDate() + 30);
        localStorage.setItem(KEY_LONG, d.toISOString());
      } else {
        localStorage.setItem(KEY_DAY, new Date().toISOString().slice(0, 10));
      }
    } catch (e) {}
    dim.classList.remove('on');
    setTimeout(function () { if (dim.parentNode) dim.parentNode.removeChild(dim); }, 300);
  }

  setTimeout(function () {
    document.body.appendChild(dim);
    if (TABS.length <= 1) {
      /* 탭 줄이 없으면 무대가 맨 위로 올라오므로 닫기도 제자리로 돌린다 */
      dim.querySelector('.rp-x').style.top = '10px';
      dim.querySelector('.rp-stage').style.marginTop = '0';
    }
    paint(0);
    requestAnimationFrame(function () { dim.classList.add('on'); });

    Array.prototype.forEach.call(dim.querySelectorAll('.rp-tabs button'), function (b) {
      b.addEventListener('click', function () { paint(parseInt(b.getAttribute('data-i'), 10)); });
    });
    dim.querySelector('.rp-x').addEventListener('click', function () { close(false); });
    dim.querySelector('.rp-no').addEventListener('click', function () { close(false); });
    dim.querySelector('.rp-never').addEventListener('click', function () { close(true); });
    dim.querySelector('#rpGo').addEventListener('click', function () { close(false); });
    /* 바깥을 눌러도 닫힌다 — 갇힌 느낌을 주지 않는다 */
    dim.addEventListener('click', function (e) { if (e.target === dim) close(false); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape' || e.key === 'Esc') { close(false); document.removeEventListener('keydown', esc); }
    });
  }, 1600);
})();
