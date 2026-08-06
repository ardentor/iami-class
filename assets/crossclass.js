/* 원데이클래스 서로 연결 팝업 — 골격진단 ↔ AI + 결과 자료 구독 + 지금 판매 중인 자료.
   짝 클래스 내용은 각 페이지가 window.CROSS 로 넘긴다 (REVIEWS·SHOP 과 같은 방식).
   구독은 이 파일 안 SUB 상수다 — 구독 페이지가 한 곳뿐이라 페이지가 넘길 이유가 없다.
   판매 중인 자료는 아무도 넘기지 않는다 — 링크 허브 sales.json 을 직접 읽는다.

   📌 팝업 한 장에 제안이 셋이다. 순서가 곧 우선순위다 —
   ① 짝 클래스(메인 CTA) → ② 결과 자료 구독 → ③ 지금 판매 중.
   🚫 이 순서를 바꾸거나 넷째를 더하지 않는다. 더하면 팝업이 전단지가 된다.

   🔴 판매 목록을 이 저장소에 복사하지 않는다 (2026-08-03 확정).
   메시지 부서가 판매를 열 때 고치는 곳은 `iami-link/sales.json` 한 곳이고,
   여기·링크 허브·팝업이 전부 그 한 파일을 본다. 복사해 두면 판매를 열 때마다
   두 곳을 고쳐야 하고, 한쪽만 고치면 끝난 판매가 팝업에 남는다.
   기간(start·end)이 지나면 자동으로 빠진다 — 지우러 올 필요가 없다.

   보여 주는 규칙 — 광고가 아니라 안내로 느껴지게 하는 선이다.
   ① 들어오고 1.2초 뒤에 뜬다. 즉시 띄우면 페이지를 보기도 전에 막혀 광고가 된다.
   ② 「오늘 하루 그만 보기」를 누르면 그날 자정까지 안 뜬다.
      그냥 닫은 것은 기록하지 않는다 — 안 보겠다고 하신 적이 없기 때문이다.
   ③ 팝업을 타고 건너온 분에게는 뜨지 않는다 (되돌아가라고 권하는 꼴이 된다).

   📌 확인용 — 주소 뒤에 `?xc=test` 를 붙이면 ②③ 을 무시하고 무조건 뜬다.
   그렇게 띄운 것은 「오늘 하루」를 눌러도 기록이 남지 않는다. */
'use strict';

(function () {
  var C = window.CROSS;
  if (!C || !C.href) return;

  /* 🔴 링크 허브와 같은 파일이다. 주소를 바꾸지 않는다. */
  var SALES = 'https://ardentor.github.io/iami-link/sales.json';

  /* ── 결과 자료 구독 (2026-08-05 신설) ──
     여기에 상수로 둔다. 각 페이지가 window.CROSS 로 넘기지 않는 이유는,
     짝 클래스와 달리 구독은 **한 곳뿐**이라 페이지마다 같은 값을 적어 두면
     문구를 고칠 때 두 파일을 고쳐야 하고 한쪽만 고치면 어긋나기 때문이다.

     🔴 문구의 정본은 `partner/index.html` 이다. 거기 카피를 압축한 것이므로
     구독 페이지 문구가 바뀌면 여기도 같이 고친다. 가격은 적지 않는다 —
     요금제가 바뀌면 팝업이 틀린 값을 말하게 된다 (정본은 구독 페이지 한 곳). */
  var SUB = {
    href:   '../partner/',
    tag:    '이미지컨설턴트 대상',
    title:  '컬러에 골격까지, 매주 갱신해 드립니다',
    sowhat: '같은 봄 라이트라도 웨이브와 스트레이트는 다른 옷을 입습니다.',
    desc:   '9가지 컬러 타입 × 골격 3종, 27가지 조합을 매주 일요일 갱신합니다. 품절은 빠지고, 선생님 상호와 연락처로 나갑니다.',
    end:    '후자료 만들던 시간을 쓰지 않고도, 고객이 계절마다 선생님 링크를 다시 엽니다.',
    cta:    '자료 구독 보기'
  };

  var KEY  = 'xc-hide-' + (C.key || 'x');
  var q    = location.search;
  var test = q.indexOf('xc=test') > -1;   /* 확인용 — 아래 두 규칙을 건너뛴다 */

  /* ③ 반대쪽 팝업을 타고 온 경우 — 링크에 ?xc=1 이 붙어 온다 */
  if (!test && q.indexOf('xc=1') > -1) {
    /* 표시를 주소에서 지운다. 남겨 두면 이 주소를 즐겨찾기하거나 새로고침할 때마다
       계속 안 뜨게 되어, 한 번 건너온 사람에게 영영 안 보인다. */
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
    return;
  }

  /* 날짜는 「그 사람이 보는 달력의 오늘」이어야 한다. UTC 로 재면 한국 자정과 아홉 시간 어긋난다. */
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  /* ② 오늘은 그만 보겠다고 하셨으면 조용히 넘어간다. localStorage 를 막아 둔
     브라우저에서는 그냥 매번 보여 준다 — 저장이 안 된다고 기능을 끄지는 않는다. */
  if (!test) {
    try { if (localStorage.getItem(KEY) === today()) return; } catch (e) {}
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var back = document.activeElement;   /* 닫은 뒤 원래 있던 자리로 초점을 돌려준다 */
  var box;
  var sales = [];

  /* 사진을 미리 받아 둔다. 팝업이 열린 뒤에 받기 시작하면 느린 회선에서
     빈 회색 칸부터 보이고 사진이 뒤늦게 채워져 조잡해 보인다. */
  if (C.img) { var pre = new Image(); pre.src = C.img; }

  /* ── 판매 중인 자료 ──
     기간 안에 있고 public 인 것만. 여러 건이면 마감이 가까운 순으로 최대 두 건.
     한 화면에 셋 넘게 들어가면 팝업이 전단지가 된다. */
  function pickSales(json) {
    var now = new Date();
    var list = (json && json.sales) || [];
    var live = [];
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if (!s || s.public === false || !s.url || !s.title) continue;
      /* popup:false — 링크 허브에는 띄우되 팝업에서만 뺀다 (2026-08-05 신설).
         🔴 없으면 public 을 따른다. 옛 회차에는 이 값이 없으므로 종전대로 뜬다.
         🚫 「팝업에 안 띄운다」와 「비공개」를 한 스위치로 묶지 않는다 —
         묶어 두면 허브에 걸고 싶은 회차를 팝업에서 빼려다 허브까지 꺼진다. */
      if (s.popup === false) continue;
      var st = s.start ? new Date(s.start) : null;
      var en = s.end   ? new Date(s.end)   : null;
      if (st && isFinite(st) && now < st) continue;
      if (en && isFinite(en) && now > en) continue;
      s._end = (en && isFinite(en)) ? en : null;
      live.push(s);
    }
    live.sort(function (a, b) {
      if (!a._end) return 1;
      if (!b._end) return -1;
      return a._end - b._end;
    });
    return live.slice(0, 2);
  }

  /* 「D-3」 보다 「3일 남음」이 먼저 읽힌다. 마감 당일은 날짜가 아니라 사실을 적는다. */
  function leftText(end) {
    if (!end) return '';
    var d0 = new Date(); d0.setHours(0, 0, 0, 0);
    var d1 = new Date(end); d1.setHours(0, 0, 0, 0);
    var days = Math.round((d1 - d0) / 864e5);
    if (days <= 0) return '오늘 마감';
    if (days === 1) return '내일 마감';
    return (end.getMonth() + 1) + '월 ' + end.getDate() + '일 마감 · ' + days + '일 남음';
  }

  /* 페이지가 window.CROSS.sub = false 를 주면 그 페이지에서만 뺀다.
     🔴 신청서 페이지에는 애초에 이 파일을 붙이지 않으므로 그쪽은 신경 쓸 필요가 없다. */
  function subHtml() {
    if (C.sub === false) return '';
    return '<a class="xc-sub" href="' + esc(SUB.href) + '">' +
             '<span class="xc-sub-tag">' + esc(SUB.tag) + '</span>' +
             '<b>'  + esc(SUB.title)  + '</b>' +
             '<em>' + esc(SUB.sowhat) + '</em>' +
             '<span class="xc-sub-d">' + esc(SUB.desc) + '</span>' +
             '<span class="xc-sub-e">' + esc(SUB.end)  + '</span>' +
             '<span class="xc-sub-go">' + esc(SUB.cta) + ' ↗</span>' +
           '</a>';
  }

  function salesHtml() {
    if (!sales.length) return '';
    var rows = '';
    for (var i = 0; i < sales.length; i++) {
      var s = sales[i], left = leftText(s._end);
      rows +=
        '<a class="xc-sale-i" href="' + esc(s.url) + '" target="_blank" rel="noopener">' +
          '<span>' +
            '<b>' + esc(s.title) + '</b>' +
            (s.sub ? '<em>' + esc(s.sub) + '</em>' : '') +
            (left ? '<i>' + esc(left) + '</i>' : '') +
          '</span>' +
          '<span class="xc-sale-go">보기 ↗</span>' +
        '</a>';
    }
    return '<div class="xc-sale"><b class="xc-sale-t">지금 판매 중</b>' + rows + '</div>';
  }

  function open() {
    box = document.createElement('div');
    box.className = 'xc';
    box.innerHTML =
      '<div class="xc-dim" data-close></div>' +
      '<div class="xc-box" role="dialog" aria-modal="true" aria-labelledby="xc-t">' +
        '<button class="xc-x" type="button" data-close aria-label="닫기">&times;</button>' +
        (C.img ? '<div class="xc-img"><img src="' + esc(C.img) + '" alt="" decoding="async"></div>' : '') +
        '<div class="xc-body">' +
          '<span class="xc-badge">' + esc(C.badge || '함께 들으면 좋습니다') + '</span>' +
          '<h2 id="xc-t">' + esc(C.title) + '</h2>' +
          '<p class="xc-so">'  + esc(C.sowhat) + '</p>' +
          '<p class="xc-d">'   + esc(C.desc)   + '</p>' +
          '<p class="xc-end">' + esc(C.end)    + '</p>' +
          '<a class="xc-go" href="' + esc(C.href) + '?xc=1">' + esc(C.cta) + ' →</a>' +
          subHtml() +
          salesHtml() +
          '<div class="xc-foot">' +
            '<button class="xc-today" type="button" data-today>오늘 하루 그만 보기</button>' +
            '<button class="xc-no" type="button" data-close>닫기</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(box);
    document.body.classList.add('xc-open');

    /* 초점을 팝업 안으로 넣는다. 「보러 가기」가 아니라 닫기에 두는 이유는,
       엔터를 잘못 눌러 원치 않는 페이지로 넘어가지 않게 하기 위해서다. */
    box.querySelector('.xc-x').focus();

    /* 사진을 못 받으면 회색 빈 칸이 남는다 — 차라리 사진 자리를 없앤다 */
    var im = box.querySelector('.xc-img img');
    if (im) im.onerror = function () {
      var w = im.parentNode; if (w && w.parentNode) w.parentNode.removeChild(w);
    };

    box.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== box) {
        if (t.hasAttribute && t.hasAttribute('data-today')) { close(true);  return; }
        if (t.hasAttribute && t.hasAttribute('data-close')) { close(false); return; }
        t = t.parentNode;
      }
    });
    document.addEventListener('keydown', onKey);
  }

  function onKey(e) { if (e.key === 'Escape' || e.key === 'Esc') close(false); }

  /* hideToday=true 일 때만 기록한다. 그냥 닫은 것은 「안 보겠다」가 아니다. */
  function close(hideToday) {
    document.removeEventListener('keydown', onKey);
    document.body.classList.remove('xc-open');
    if (box) { box.remove(); box = null; }        /* 닫으면 DOM 에서 지운다 */
    if (hideToday && !test) {
      try { localStorage.setItem(KEY, today()); } catch (e) {}
    }
    if (back && back.focus) back.focus();
  }

  /* 판매 목록을 먼저 받아 두고 연다. 팝업이 뜬 뒤에 「지금 판매 중」이 툭 나타나면
     읽던 자리가 밀린다. 다만 목록을 못 받는다고 팝업을 막지는 않는다 —
     짝 클래스 안내는 그것대로 값이 있다. 늦어도 2.6초에는 연다. */
  var t0 = Date.now(), ready = false;

  if (window.fetch) {
    var d = new Date();
    var bust = '' + d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) +
               ('0' + d.getDate()).slice(-2) + ('0' + d.getHours()).slice(-2);
    fetch(SALES + '?d=' + bust, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j) sales = pickSales(j); })
      ['catch'](function () {})
      .then(function () { ready = true; });
  } else {
    ready = true;
  }

  function tick() {
    if (ready || Date.now() - t0 > 2600) open();
    else setTimeout(tick, 120);
  }
  setTimeout(tick, 1200);   /* ① */
})();
