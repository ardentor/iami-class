/* 퍼스널컬러 결과 자료 — data/<color>.json 을 읽어 화면을 그린다. (2026-08-03)
 *
 * 🔴 화면은 컬러를 모른다. <body data-color="spring-light"> 하나만 보고 JSON 을 찾는다.
 *    그래서 8종을 만들 때 이 파일을 건드릴 일이 없다 — 데이터만 늘어난다.
 *
 * 🔴 제품이 늘어나는 곳은 JSON 이다. 앞으로 대표님이 「봄 라이트 립 / 링크 / 제품명」
 *    한 줄을 주시면 센트리가 JSON 에 항목을 붙이고 이미지를 받아 넣는다.
 *    페이지를 다시 만들지 않는다.
 */
(function () {
  'use strict';

  var body  = document.body;
  var color = body.dataset.color;
  var root  = body.dataset.root || '..';      // color/ 기준 상대 경로

  /* 파트너 판(2026-08-04 대표님 지시) — 「구독하는 업체 정보만 따로 올릴 수 있을까」
     제품·영상·코디는 대표님 것을 그대로 쓰고, **화면에 뜨는 업체 정보만** 바꾼다.
     data-partner 가 없으면 지금까지와 똑같이 아엠아이브랜딩 판이다.

     🔴 이 검사는 브라우저 안에서 돈다 — **진짜 차단이 아니다.**
        개발자도구를 열 줄 아는 사람은 우회하고, JSON 주소를 직접 열면 목록이 보인다.
        기술로 못 막는 것은 **계약서와 라이선스 표시**로 막는다는 전제다.
        확실히 막으려면 서버가 자료를 발급해야 하고, 그건 파트너가 늘면 그때 간다. */
  var partner = body.dataset.partner || '';

  var $  = function (s, el) { return (el || document).querySelector(s); };
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  /* 「판매중」은 배지를 달지 않는다 — 거의 전부라 달면 소음만 된다.
     품절·단종만 눈에 띄게 하고, 재입고는 반가운 소식이라 초록으로 남긴다. */
  function badge(status) {
    if (!status || status === '판매중') return '';
    var cls = (status === '품절' || status === '단종') ? 'gone'
            : (status === '재입고') ? 'back' : '';
    return '<span class="badge ' + cls + '">' + esc(status) + '</span>';
  }

  /* 🔴 구매 링크가 없는 제품은 화면에 올리지 않는다 (2026-08-04 대표님 지시).
     「반드시 구매링크 다 채워. 앞으로 없이는 절대 올리지 마」
     살 수 없는 제품을 보여 주는 것은 고객을 두 번 움직이게 하는 일이다.
     🔴 자료(JSON)에서 지우지는 않는다 — 링크를 찾으면 그날로 다시 보인다.
        지워 버리면 제품명과 사진을 다시 모아야 한다. */
  function sellable(items) {
    return (items || []).filter(function (i) { return i && i.url; });
  }

  function card(it, imgBase) {
    var gone = (it.status === '품절' || it.status === '단종');
    var ph = it.img
      ? '<img src="' + imgBase + '/' + encodeURIComponent(it.img) + '" alt="' + esc(it.name) +
        '" loading="lazy" decoding="async">'
      : '<span class="noimg">이미지 준비 중</span>';

    var inner =
      '<div class="ph">' + ph + badge(it.status) + '</div>' +
      '<div class="txt">' +
        (it.brand ? '<span class="brand">' + esc(it.brand) + '</span>' : '') +
        '<span class="name">' + esc(it.name) + '</span>' +
        /* 여러 매체가 겹쳐 추천한 제품은 그 사실이 곧 근거다 — 숫자를 보여 준다 */
        (it.refs >= 2 ? '<span class="refs">추천 ' + it.refs + '곳</span>' : '') +
        (it.url ? '<span class="go">구매처 보기</span>' : '') +
      '</div>';

    // 링크가 없으면 <a> 로 만들지 않는다 — 눌러도 아무 일 없는 카드는 고장으로 보인다
    if (!it.url) return '<div class="card' + (gone ? ' gone' : '') + '">' + inner + '</div>';
    return '<a class="card' + (gone ? ' gone' : '') + '" href="' + esc(it.url) +
           '" target="_blank" rel="noopener noreferrer">' + inner + '</a>';
  }

  /* 진단 속성은 접어 둔다 (2026-08-03 대표님 지시).
     설명이 길어 다 펼쳐 두면 스크롤이 한참이라 아래 제품이 안 보인다.
     <details> 를 쓰므로 JS 없이도 열리고, 검색·인쇄에도 잡힌다. */
  function noteCard(it, imgBase) {
    var imgs = (it.imgs || []).map(function (f) {
      return '<img src="' + imgBase + '/' + encodeURIComponent(f) + '" alt="" loading="lazy" decoding="async">';
    }).join('');
    return '<details class="note">' +
             '<summary>' + esc(it.name) + '</summary>' +
             '<div class="body">' +
               (it.body ? '<p>' + esc(it.body) + '</p>' : '') +
               (imgs ? '<div class="imgs">' + imgs + '</div>' : '') +
             '</div>' +
           '</details>';
  }

  /* 유튜브 카드 — 썸네일은 img.youtube.com 이 주소만으로 내준다.
     🔴 iframe 으로 심지 않는다. 10개를 심으면 폰에서 페이지가 눈에 띄게 느려지고
        유튜브 쿠키가 따라붙는다. 눌렀을 때 유튜브로 보내는 편이 가볍고 정직하다. */
  function videoCard(it) {
    var thumb = 'https://i.ytimg.com/vi/' + encodeURIComponent(it.vid) + '/hqdefault.jpg';
    return '<a class="card vid" href="' + esc(it.url) + '" target="_blank" rel="noopener noreferrer">' +
             '<div class="ph">' +
               '<img src="' + thumb + '" alt="' + esc(it.name) + '" loading="lazy" decoding="async">' +
               '<span class="play" aria-hidden="true">▶</span>' +
               (it.meta ? '<span class="meta">' + esc(it.meta) + '</span>' : '') +
             '</div>' +
             '<div class="txt">' +
               (it.brand ? '<span class="brand">' + esc(it.brand) + '</span>' : '') +
               '<span class="name">' + esc(it.name) + '</span>' +
               '<span class="go">유튜브에서 보기</span>' +
             '</div>' +
           '</a>';
  }

  /* ── 갱신 안내 (2026-08-04 대표님 지시) ─────────────────────────────
     「각 링크 제일 상단에 언제 업데이트 예정인지 표기해. 단 봄라이트인데
       다른 건 넣지 말고, 여름뮤트인데 다른 건 넣지 말고 **자신의 링크가**
       언제 업데이트 예정인지 표기하고, 업데이트가 되었으면 되었다고 표기해」

     🔴 그래서 이 블록은 **자기 컬러의 일정만** 말한다. 다른 컬러의 주차는
        꺼내지 않는다 — 고객은 자기 자료만 받았고, 남의 일정은 소음이다.
     🔴 날짜를 자료에 적어 두지 않고 **볼 때마다 계산한다.** 적어 두면
        자동화가 한 번 밀리는 순간 화면이 거짓말을 하게 된다. */
  var WEEK = {
    'spring-light': 1, 'spring-bright': 1,
    'summer-light': 2, 'summer-mute': 2, 'summer-bright': 2,
    'autumn-mute': 3, 'autumn-deep': 3,
    'winter-deep': 4, 'winter-bright': 4
  };
  var WEEK_KO = { 1: '첫째', 2: '둘째', 3: '셋째', 4: '넷째' };

  /* 자동화는 ceil(일 / 7) 로 주차를 센다 (컬러자료-주간갱신.ps1 과 같은 셈법).
     즉 1~7일이 첫째 주다. 그 이레 안에는 일요일이 반드시 하나 있다. */
  function sundayOf(year, month, week) {
    for (var d = (week - 1) * 7 + 1; d <= week * 7; d++) {
      var t = new Date(year, month, d);
      if (t.getMonth() !== month) return null;
      if (t.getDay() === 0) return t;
    }
    return null;
  }
  function scheduled(week, from, dir) {
    var base = new Date(from.getFullYear(), from.getMonth(), 1);
    for (var i = 0; i <= 14; i++) {
      var m = new Date(base.getFullYear(), base.getMonth() + (dir > 0 ? i : -i), 1);
      var t = sundayOf(m.getFullYear(), m.getMonth(), week);
      if (!t) continue;
      if (dir > 0 && t > from) return t;
      if (dir < 0 && t <= from) return t;
    }
    return null;
  }
  function fmt(d) {
    return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' +
           ['일','월','화','수','목','금','토'][d.getDay()] + '요일';
  }
  function fmtShort(d) { return (d.getMonth() + 1) + '월 ' + d.getDate() + '일'; }

  function freshBlock(data) {
    var w = WEEK[color];
    if (!w) return '';
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var next = scheduled(w, today, 1);
    var last = scheduled(w, today, -1);
    if (!next) return '';

    /* 「되었으면 되었다고」 — 직전 예정일 이후에 손을 댔으면 마친 것으로 본다 */
    var done = false, updTxt = '';
    if (data.updated && /^\d{4}-\d{2}-\d{2}$/.test(data.updated)) {
      var p = data.updated.split('-');
      var u = new Date(+p[0], +p[1] - 1, +p[2]);
      updTxt = fmtShort(u);
      if (last && u >= last) { done = true; }
    }

    /* 🔴 마친 쪽 문구에 「무엇을 했다」를 적지 않는다.
       이 자리는 날짜만 아는 자리다. 실제로 그날 품절을 뺐는지 제품을 더했는지는
       화면이 모른다 — 8월 4일에 「품절된 제품을 뺐습니다」로 나갔다가 고쳤다.
       한 일을 적으려면 그 일을 실제로 세어 자료에 남겨야 한다. */
    var head = done
      ? '<strong class="ok">✅ ' + esc(updTxt) + ' 갱신을 마쳤습니다</strong>'
      : '<strong>다음 갱신 ' + esc(fmt(next)) + '</strong>';
    var tail = done
      ? '다음 갱신은 ' + esc(fmt(next)) + '입니다.'
      : '매달 ' + WEEK_KO[w] + ' 주 일요일에 품절된 제품을 빼고, 새로 나온 제품을 더합니다.';

    return '<div class="fresh' + (done ? ' done' : '') + '">' +
             '<span class="ic" aria-hidden="true">🔄</span>' +
             '<div class="t">' + head + '<span class="s">' + tail + '</span></div>' +
           '</div>';
  }

  /* 골격 공용 자료 (_frame.json) — 컬러 자료를 읽은 뒤 합쳐 둔다.
     🚫 못 읽어도 본 자료는 그대로 보여야 한다. 그래서 실패는 조용히 넘긴다. */
  var FRAME = null;

  function loadFrame(data) {
    return fetch(root + '/data/_frame.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (f) { FRAME = f; return data; })
      .catch(function () { return data; });
  }

  function frameType(key) {
    if (!FRAME || !FRAME.types) return null;
    for (var i = 0; i < FRAME.types.length; i++) {
      if (FRAME.types[i].key === key) return FRAME.types[i];
    }
    return null;
  }

  function frameBlock(items) {
    var btns = [], panes = [];

    items.forEach(function (it, idx) {
      var t = frameType(it.type) || { name: it.type, hint: '', insta: [], videos: [] };
      var on = (idx === 0) ? ' on' : '';

      btns.push('<button type="button" class="ftab' + on + '" data-f="' + esc(it.type) + '">' +
                esc(t.name) + '</button>');

      var body = '';
      if (t.hint) { body += '<p class="fhint">' + esc(t.hint) + '</p>'; }

      if ((it.tips || []).length) {
        body += '<ul class="ftips">' +
                it.tips.map(function (x) { return '<li>' + inlineB(x) + '</li>'; }).join('') +
                '</ul>';
      }
      if (it.point) {
        body += '<div class="fpoint"><b>핵심 한 줄</b><span>' + esc(it.point) + '</span></div>';
      }

      /* 인스타·영상은 골격 공용이다 — 9컬러가 같은 것을 본다.
         아직 고르지 않았으면 자리를 만들지 않는다. 빈 칸이 보이는 쪽이 나쁘다. */
      if ((t.insta || []).length) {
        body += '<div class="fsub">이 골격 코디를 자주 올리는 계정</div>' +
                '<div class="finsta">' + t.insta.map(instaCard).join('') + '</div>';
      }
      if ((t.shops || []).length) {
        body += '<div class="fsub">이 골격에 맞는 쇼핑몰</div>' +
                '<div class="finsta">' + t.shops.map(shopCard).join('') + '</div>';
      }
      if ((t.videos || []).length) {
        body += '<div class="fsub">이 골격 코디 영상</div>' +
                '<div class="grid video">' + t.videos.map(videoCard).join('') + '</div>';
      }

      panes.push('<div class="fpane' + on + '" data-f="' + esc(it.type) + '">' + body + '</div>');
    });

    /* 쇼핑몰·계정·영상은 매주 살아 있는지 점검한다 (컬러자료-골격점검.ps1).
       그 날짜를 밝혀 둔다 — 언제 확인한 목록인지 모르면 믿고 누르기 어렵다. */
    var upd = (FRAME && FRAME.updated)
      ? '<p class="fupd">쇼핑몰 · 계정 · 영상은 ' + esc(FRAME.updated) + ' 에 살아 있는지 확인했습니다</p>'
      : '';

    return '<div class="ftabs">' + btns.join('') + '</div>' +
           '<div class="fpanes">' + panes.join('') + '</div>' + upd;
  }

  /* 쇼핑몰 — 인스타 계정만 있는 곳도 있고 자체 홈페이지가 있는 곳도 있다.
     🔴 링크는 url 이 있으면 그쪽을, 없으면 인스타로 보낸다. 둘 다 없으면 카드를 만들지 않는다
        (눌러도 아무 데도 안 가는 카드는 고장으로 보인다). */
  function shopCard(s) {
    var id  = String(s.insta || '').replace(/^@/, '');
    var url = s.url || (id ? 'https://www.instagram.com/' + encodeURIComponent(id) + '/' : '');
    if (!url) return '';
    return '<a class="igc" href="' + esc(url) + '" target="_blank" rel="noopener">' +
           '<b>' + esc(s.name || id) + '</b>' +
           (s.note ? '<span>' + esc(s.note) + '</span>' : '') +
           '</a>';
  }

  function instaCard(a) {
    var id = String(a.id || '').replace(/^@/, '');
    if (!id) return '';
    return '<a class="igc" href="https://www.instagram.com/' + encodeURIComponent(id) + '/" ' +
           'target="_blank" rel="noopener">' +
           '<b>@' + esc(id) + '</b>' +
           (a.note ? '<span>' + esc(a.note) + '</span>' : '') +
           '</a>';
  }

  /* 해설 안에서 **굵게** 만 살린다. 다른 마크다운은 쓰지 않는다 —
     자료에 들어가는 글이라 문법이 새어 나오면 그대로 고객에게 보인다. */
  function inlineB(s) {
    return esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  }

  /* 탭 전환 — render 가 끝난 뒤 한 번만 건다. */
  function bindFrameTabs() {
    var wrap = document.getElementById('frame');
    if (!wrap) return;
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.ftab') : null;
      if (!b) return;
      var k = b.getAttribute('data-f');
      Array.prototype.forEach.call(wrap.querySelectorAll('.ftab'), function (x) {
        x.classList.toggle('on', x.getAttribute('data-f') === k);
      });
      Array.prototype.forEach.call(wrap.querySelectorAll('.fpane'), function (x) {
        x.classList.toggle('on', x.getAttribute('data-f') === k);
      });
    });
  }

  function render(data) {
    var imgBase = root + '/img/' + color;

    $('#en').textContent = data.titleEn || '';
    $('#ko').textContent = data.titleKo || '';
    document.title = (data.titleKo || data.titleEn) + ' — 아엠아이브랜딩';
    var upd = $('#upd'); if (upd && data.updated) upd.textContent = data.updated + ' 기준';

    /* 갱신 안내는 「개인 참고용」 배지 바로 아래, 이용 안내 위에 놓는다.
       9종이 이 파일 하나를 같이 읽으므로 HTML 은 손대지 않는다. */
    var chip = $('.hero .chip');
    if (chip) {
      var fb = freshBlock(data);
      if (fb) chip.insertAdjacentHTML('afterend', fb);
    }

    /* 해설 글은 그 대상 바로 위에 붙인다 (2026-08-03 대표님 지시).
       메이크업 가이드 → 메이크업 영상 위 / 향수 가이드 → 향수 위.
       글은 HTML 의 <template> 에 두고 여기서 자리만 잡아 준다 —
       긴 본문을 JS 문자열로 들고 있으면 고칠 때 눈이 아프다. */
    function essayFor(key) {
      var t = document.getElementById('essay-' + key);
      return t ? t.innerHTML : '';
    }

    var tabs = [], html = [];
    (data.sections || []).forEach(function (s) {
      var items = s.items || [];
      /* 제품 섹션은 살 수 있는 것만 남긴다. 남는 게 없으면 섹션 자체를 접는다. */
      if (s.kind === 'product') { items = sellable(items); }
      if (!items.length) return;
      /* 다른 컬러에서 끌어온 섹션은 그쪽 사진 폴더를 본다 */
      var base = s.imgFrom ? (root + '/img/' + s.imgFrom) : imgBase;
      tabs.push('<a href="#' + s.key + '" data-k="' + s.key + '">' + esc(s.label) + '</a>');
      html.push(essayFor(s.key));

      var inner;
      if (s.kind === 'note') {
        inner = '<div class="notes">' + items.map(function (i) { return noteCard(i, base); }).join('') + '</div>';
      } else if (s.kind === 'hairlist') {
        /* 헤어컬러는 사진을 쓰지 않는다 (2026-08-04 대표님 지적).
           붙어 있던 인물컷이 AI 로 만든 것이라 어색했다.
           색 이름만 칩으로 두고, 실제 발색은 영상으로 보여 준다 — 사진보다 정확하다. */
        inner =
          '<div class="chips">' +
            items.map(function (i) { return '<span class="chip-h">' + esc(i.name) + '</span>'; }).join('') +
          '</div>' +
          '<p class="hair-note">사진 대신 영상으로 보여 드립니다. 조명에 따라 발색이 달라 보이기 때문입니다.</p>' +
          '<div class="grid video">' + (s.videos || []).map(videoCard).join('') + '</div>';
      } else if (s.kind === 'video') {
        inner = '<div class="grid video">' + items.map(videoCard).join('') + '</div>';
      } else if (s.kind === 'frame') {
        /* 골격별 코디 — 같은 컬러라도 골격에 따라 답이 갈린다 (2026-08-05 대표님 지시).
           탭 3개를 두고 고른 것만 보여 준다. 세 개를 한꺼번에 펼치면
           자기 것이 아닌 글까지 읽게 되어 오히려 헷갈린다. */
        inner = frameBlock(items);
      } else {
        var cls = (s.kind === 'swatch') ? 'grid swatch' : 'grid';
        inner = '<div class="' + cls + '">' + items.map(function (i) { return card(i, base); }).join('') + '</div>';
      }

      html.push(
        '<section id="' + s.key + '">' +
          '<div class="sec-h"><h2>' + esc(s.label) + '</h2><span class="n">' + items.length + '</span></div>' +
          (s.note ? '<p class="sec-note">' + esc(s.note) + '</p>' : '') +
          inner +
        '</section>');
    });

    $('#tabs').innerHTML = tabs.join('');
    $('#main').innerHTML = html.join('');
    bindFrameTabs();
    spy();
  }

  /* 지금 보고 있는 섹션의 탭에 표시를 남긴다.
     IntersectionObserver 를 쓰면 스크롤마다 계산하지 않아 폰에서 부드럽다. */
  function spy() {
    var links = {};
    Array.prototype.forEach.call(document.querySelectorAll('#tabs a'), function (a) {
      links[a.dataset.k] = a;
    });
    var secs = document.querySelectorAll('#main section');
    if (!secs.length || !window.IntersectionObserver) return;

    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen[e.target.id] = e.isIntersecting; });
      var cur = null;
      Array.prototype.forEach.call(secs, function (s) { if (!cur && seen[s.id]) cur = s.id; });
      Object.keys(links).forEach(function (k) { links[k].classList.toggle('on', k === cur); });
    }, { rootMargin: '-110px 0px -70% 0px' });

    Array.prototype.forEach.call(secs, function (s) { io.observe(s); });
  }

  // 「맨 위로」
  var topBtn = $('#top');
  window.addEventListener('scroll', function () {
    topBtn.classList.toggle('show', window.scrollY > 700);
  }, { passive: true });
  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* 「진단 이후」 블록 — 8종이 같은 파일 하나를 읽는다.
     각 페이지에 복사해 두면 문구 하나 고칠 때 8군데를 고쳐야 하고,
     한 곳을 빠뜨리면 고객마다 다른 안내를 받게 된다. */
  var afterBox = document.getElementById('after');

  /* 🔴 파트너 판에는 「진단 이후」 블록을 넣지 않는다 (2026-08-04 대표님 지시).
     그 블록은 아엠아이브랜딩이 고객을 붙들어 두려고 만든 자리다.
     파트너는 카톡 채널이나 블로그가 없을 수도 있고, 있어도 그 문구가 그쪽 것이 아니다.
     연락 수단은 **푸터 한 줄**이면 충분하다 — 전화번호 · 인스타그램 · 예약 신청. */

  /* 업체 정보를 그 파트너 것으로 갈아 끼운다 — 맨 위 이름·아래 연락처·저작권 문구 */
  function dressPartner(p) {
    var home = document.querySelector('.topbar .home');
    if (home) { home.textContent = '‹ ' + p.name; home.removeAttribute('href'); home.classList.add('plain'); }

    var f = document.querySelector('footer .wrap');
    if (f) {
      /* 🔴 아래 줄에는 **연락 수단만** 둔다 (2026-08-04 대표님 지시).
         「채널 추가하기」·「이웃 추가」 같은 권유는 위 카드에서 이미 하고 있다.
         푸터까지 같은 말이 늘어서면 정작 전화번호가 묻힌다.
         → 링크에 foot:true 를 단 것만 내려온다. */
      var links = '';
      if (p.phone) { links += '<a href="tel:' + esc(p.phone) + '">' + esc(p.phone) + '</a>'; }
      (p.links || []).forEach(function (l) {
        if (!l.foot) return;
        /* 🔴 2026-08-04 — 종전 `/^https?:/` 는 **`https://` 만 적어도 통과**했다.
           그러면 눌러도 아무 데도 안 가는 죽은 버튼이 파트너 고객에게 뜬다 (실측).
           주소 몸통이 있어야 내보낸다. 없으면 그 버튼 자체를 안 만든다. */
        if (!/^https?:\/\/\S+/i.test(l.u || '')) return;
        links += '<a href="' + esc(l.u) + '" target="_blank" rel="noopener">' + esc(l.a || l.t) + '</a>';
      });
      /* 🔴 원저작자 표시는 지우지 않는다. 유출 추적의 근거이자 라이선스의 표식이다. */
      f.innerHTML =
        '<strong>' + esc(p.name) + '</strong>' +
        '<div class="links">' + links + '</div>' +
        '<p class="c">' + (p.addr ? esc(p.addr) + '<br>' : '') +
          '자료 제공 · 아엠아이브랜딩 (라이선스 ' + esc(p.code) + ')<br>' +
          '개인 참고용 자료입니다. 외부 공유를 금지합니다.</p>';
    }
    if (afterBox) { afterBox.innerHTML = ''; }
  }

  function expiredScreen(p) {
    $('#tabs').innerHTML = '';
    $('#main').innerHTML =
      '<div class="expired">' +
        '<strong>이 자료는 지금 볼 수 없습니다</strong>' +
        '<p>이용 기간이 지났습니다. 자료를 받으셨던 곳으로 문의해 주십시오.' +
        (p && p.phone ? '<br>' + esc(p.name) + ' ' + esc(p.phone) : '') + '</p>' +
      '</div>';
    if (afterBox) { afterBox.innerHTML = ''; }
  }

  if (afterBox && !partner) {
    fetch(root + '/assets/after.html', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw 0; return r.text(); })
      .then(function (html) { afterBox.innerHTML = html; })
      .catch(function () { /* 못 불러와도 자료 본문은 그대로 보인다 */ });
  }

  /* 다른 컬러의 한 섹션을 끌어다 붙인다 (2026-08-04 대표님 지시).
     가을 딥은 가을 뮤트의 립을 **데일리 립**으로 쓰기 좋다 — 딥 컬러는
     또렷해서 매일 바르기엔 부담스러운 날이 있기 때문이다.
     🔴 제품을 복사해 두지 않는다. 가을 뮤트 쪽을 고치면 여기도 같이 바뀌어야
        하는데, 복사해 두면 한쪽만 낡는다. 그래서 **읽어 올 때 가져온다.** */
  var BORROW = {
    'autumn-deep': [{ from: 'autumn-mute', key: 'lip', as: 'daily',
                      label: '데일리 립',
                      /* 🔴 립 **바로 위**에 놓는다 (2026-08-04 대표님 지시).
                         맨 뒤에 붙였더니 립과 한참 떨어져 서로 다른 이야기처럼 보였다.
                         둘은 같이 보면서 고르는 것이라 붙어 있어야 한다. */
                      before: 'lip',
                      note: '가을 뮤트 립입니다. 딥 컬러가 부담스러운 날, 매일 바르기 좋은 쪽으로 골라 두었습니다.' }]
  };

  function borrow(data) {
    var plan = BORROW[color];
    if (!plan) return Promise.resolve(data);
    return Promise.all(plan.map(function (b) {
      return fetch(root + '/data/' + b.from + '.json', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (src) {
          var s = (src.sections || []).filter(function (x) { return x.key === b.key; })[0];
          if (!s || !(s.items || []).length) return null;
          /* 🔴 사진은 원래 컬러 폴더에 있다. imgFrom 을 달아 주지 않으면
             autumn-deep 폴더에서 찾다가 전부 깨진다 (2026-08-04 실제로 깨졌다). */
          return { key: b.as, label: b.label, kind: 'product', note: b.note,
                   imgFrom: b.from, before: b.before, items: s.items };
        })
        .catch(function () { return null; });   /* 못 가져와도 본 자료는 그대로 보인다 */
    })).then(function (got) {
      got.filter(Boolean).forEach(function (s) {
        var at = -1;
        if (s.before) {
          for (var i = 0; i < data.sections.length; i++) {
            if (data.sections[i].key === s.before) { at = i; break; }
          }
        }
        if (at >= 0) { data.sections.splice(at, 0, s); }
        else { data.sections.push(s); }   /* 놓을 자리를 못 찾으면 맨 뒤 */
      });
      return data;
    });
  }

  function loadColor(p) {
    // cache:no-store — 대표님이 제품을 추가한 직후 옛 목록이 보이면 안 된다
    return fetch(root + '/data/' + color + '.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(borrow)
      .then(loadFrame)
      .then(render)
      .then(function () { if (p) { dressPartner(p); } })
      .catch(function () {
        $('#main').innerHTML =
          '<p class="failed">자료를 불러오지 못했습니다.<br>잠시 후 새로고침해 주시고, ' +
          '계속 보이면 ' + (p && p.phone ? esc(p.phone) : '010-2025-2767') + ' 로 알려 주십시오.</p>';
      });
  }

  if (!partner) {
    loadColor(null);
  } else {
    fetch(root + '/partners/' + encodeURIComponent(partner) + '.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (p) {
        /* 이용 기간 — 그날 자정까지 본다. 하루를 야박하게 끊지 않는다. */
        if (p.until && /^\d{4}-\d{2}-\d{2}$/.test(p.until)) {
          var q = p.until.split('-');
          var end = new Date(+q[0], +q[1] - 1, +q[2], 23, 59, 59);
          if (new Date() > end) { expiredScreen(p); return; }
        }
        return loadColor(p);
      })
      .catch(function () { expiredScreen(null); });
  }
})();
