/* 아엠아이브랜딩 프로그램 예약 신청 — 공통 동작
   페이지마다 다른 것은 index.html 맨 위 CONFIG 블록뿐이다.

   설계 원칙
     · 예약양식(예약관리팀 공통 §①)의 4항목을 그대로 옮겼다.
       1) 날짜·시간 1순위/2순위  2) 프로그램·인원  3) 예약 경로  4) 성함·연락처
     · 금액은 화면에서 계산해 보여 주지만 「참고용」이다.
       최종 금액은 대표님이 재무관리팀 가격표로 확인하고 예약금 안내를 보낸다.
     · ENDPOINT 가 비면 제출이 잠긴다. 가짜 완료 화면을 절대 띄우지 않는다. */
'use strict';

(function () {

var C = window.CONFIG || {};
var $ = function (id) { return document.getElementById(id); };

function esc(s){
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function comma(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

/* ── 성별 먼저 고르기 (통합 페이지 전용) ────────────────────
   CONFIG.genders 가 있으면 「성별 선택 → 그 성별 내용 표시」로 동작한다.
   없으면 예전처럼 단일 페이지로 그냥 뜬다. 두 방식 모두 지원한다. */
var GENDERS = C.genders || null;
var gKey = '';

function headline(){
  document.title = (C.title || '예약 신청') + ' — 아엠아이브랜딩';
  $('h1').textContent   = C.title || '';
  $('lead').textContent = C.lead  || '';
}

function applyGender(key){
  var g = GENDERS && GENDERS[key];
  if (!g) return;
  gKey = key;

  /* 성별이 정하는 것만 갈아끼운다. 계좌·안내문·경로는 공통이라 건드리지 않는다. */
  C.kind     = g.kind;
  C.title    = g.title;
  C.lead     = g.lead || C.lead;
  C.programs = g.programs;

  var see = $('seeProg');
  if (see) { see.href = g.link || see.href; see.style.display = g.link ? '' : 'none'; }

  headline();

  /* 성별을 바꾸면 앞서 고른 프로그램은 무효다 — 남녀 프로그램이 다르다 */
  var old = document.querySelector('input[name="program"]:checked');
  if (old) old.checked = false;
  var wrap = $('optionWrap'); if (wrap) wrap.style.display = 'none';

  $('rest').style.display = '';
  drawPrograms();
}

if (GENDERS) {
  $('genderBox').innerHTML = Object.keys(GENDERS).map(function (k) {
    var g = GENDERS[k];
    return '<label class="opt"><input type="radio" name="gender" value="' + esc(k) + '">' +
           '<span>' + esc(g.pick || g.title) +
           (g.sub ? '<em>' + esc(g.sub) + '</em>' : '') + '</span></label>';
  }).join('');

  $('genderBox').addEventListener('change', function () {
    paint('genderBox');
    applyGender(pick('gender'));
    /* 고른 뒤 다음 칸이 눈에 들어오도록 살짝 내려준다 */
    var r = $('rest');
    if (r) setTimeout(function(){ r.scrollIntoView({ block:'start', behavior:'smooth' }); }, 60);
  });

  /* 예전 주소(/booking/women, /booking/men)로 들어오면 ?g= 로 넘어온다 */
  var q = (location.search.match(/[?&]g=([a-z]+)/i) || [])[1];
  if (q && GENDERS[q]) {
    var pre = document.querySelector('input[name="gender"][value="' + q + '"]');
    if (pre) { pre.checked = true; paint('genderBox'); applyGender(q); }
  }
}

headline();

/* ── 인원 ─────────────────────────────────────────────── */
var PEOPLE = ['1인', '2인', '3인'];
$('peopleBox').innerHTML = PEOPLE.map(function (p) {
  return '<label class="opt"><input type="radio" name="people" value="' + p + '"><span>' + p + '</span></label>';
}).join('');

/* ── 프로그램 ─────────────────────────────────────────── */
function programHTML(){
  var n = pick('people');
  return (C.programs || []).map(function (p, i) {
    var won = n ? p.price[n] : null;
    var off = n && !won;                          // 이 인원수로는 안 되는 프로그램
    return '<label class="opt' + (off ? ' off' : '') + '">' +
             '<input type="radio" name="program" value="' + esc(p.name) + '" data-i="' + i + '"' + (off ? ' disabled' : '') + '>' +
             '<span>' + esc(p.name) +
               '<em>' + (off ? '이 인원수로는 진행하지 않습니다'
                             : (won ? comma(won) + '원' + (n !== '1인' ? ' (1인당)' : '') : '인원을 먼저 골라 주세요')) +
                 (p.note ? ' · ' + esc(p.note) : '') + '</em>' +
               /* 설명은 있는 것만 붙인다 — 정본이 없는 프로그램은 desc 를 비워 두고 아무것도 안 쓴다 */
               (p.desc ? '<i class="d">' + esc(p.desc) + '</i>' : '') +
             '</span></label>';
  }).join('');
}
function drawPrograms(){
  var keep = pick('program');
  $('programBox').innerHTML = programHTML();
  if (keep) {
    var el = document.querySelector('input[name="program"][value="' + keep.replace(/"/g,'\\"') + '"]');
    if (el && !el.disabled) el.checked = true;
  }
  paint('programBox'); drawOption(); calc();
}

/* ── 옵션 (ICRU 레포트 28p/42p 등) ───────────────────── */
function currentProgram(){
  var el = document.querySelector('input[name="program"]:checked');
  if (!el) return null;
  return (C.programs || [])[Number(el.getAttribute('data-i'))];
}
function drawOption(){
  var p = currentProgram();
  var box = $('optionBox'), wrap = $('optionWrap');
  if (!p || !p.options || !p.options.length) { wrap.style.display = 'none'; box.innerHTML = ''; return; }
  wrap.style.display = 'block';
  box.innerHTML = p.options.map(function (o, i) {
    return '<label class="opt"><input type="radio" name="option" value="' + esc(o.name) + '" data-add="' + (o.add || 0) + '"' +
           (i === 0 ? ' checked' : '') + '><span>' + esc(o.name) +
           (o.add ? '<em>+' + comma(o.add) + '원</em>' : '<em>기본</em>') + '</span></label>';
  }).join('');
  paint('optionBox');
}

/* ── 자주 묻는 질문 ──────────────────────────────────
   답이 하나도 없으면 카드째 감춘다 — 빈 상자를 보여주지 않는다. */
(function(){
  var box = $('faqList'), card = $('faqCard');
  if (!box || !card) return;
  var list = C.faq || [];
  if (!list.length) { card.style.display = 'none'; return; }
  box.innerHTML = list.map(function (f) {
    return '<details class="faq"><summary>' + esc(f.q) + '</summary>' +
           '<div class="a">' + esc(f.a) + '</div></details>';
  }).join('');
})();

/* ── 예약 경로 ───────────────────────────────────────── */
$('routeBox').innerHTML = (C.routes || []).map(function (r) {
  return '<label class="opt"><input type="radio" name="route" value="' + esc(r) + '"><span>' + esc(r) + '</span></label>';
}).join('');

/* ── 선택 표시 ───────────────────────────────────────── */
function paint(id){
  var box = $(id);
  [].forEach.call(box.querySelectorAll('.opt'), function (el) {
    el.classList.toggle('on', el.querySelector('input').checked);
  });
  box.classList.remove('bad');
}
function pick(name){
  var el = document.querySelector('input[name="' + name + '"]:checked');
  return el ? el.value : '';
}

['peopleBox','programBox','optionBox','routeBox'].forEach(function (id) {
  var box = $(id); if (!box) return;
  box.addEventListener('change', function () {
    paint(id);
    if (id === 'peopleBox') drawPrograms();
    if (id === 'programBox') { drawOption(); calc(); }
    if (id === 'optionBox') calc();
  });
});

/* ── 금액 계산 ───────────────────────────────────────── */
function total(){
  var p = currentProgram(), n = pick('people');
  if (!p || !n || !p.price[n]) return 0;
  var per = p.price[n];
  var opt = document.querySelector('input[name="option"]:checked');
  if (opt) per += Number(opt.getAttribute('data-add')) || 0;
  return per * Number(n.replace('인',''));
}
function calc(){
  var t = total();
  if (!t) { $('sum').style.display = 'none'; return; }
  $('sum').style.display = 'block';
  $('sumWon').textContent = comma(t) + '원';
  $('sumDetail').textContent = pick('program') + ' · ' + pick('people') +
    (pick('option') ? ' · ' + pick('option') : '');
}

/* ── 날짜 최소값: 내일부터 ──────────────────────────── */
(function(){
  var kst = new Date(Date.now() + 9*3600e3 + 86400e3);
  var min = kst.toISOString().slice(0,10);
  $('f_d1').min = min; $('f_d2').min = min;
})();

/* ── 안내문 ─────────────────────────────────────────── */
$('acctBank').textContent = C.account.bank;
$('acctNo').textContent   = C.account.no;
$('acctWho').textContent  = '예금주 ' + C.account.holder;
$('noticeList').innerHTML = (C.notices || []).map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('');
$('doneBack').href = C.home;
$('foot').innerHTML =
  '아엠아이브랜딩 · 대표 허우영<br>대구 중구 명덕로 143 1층<br>' +
  '문의 010-2025-2767 · 네이버 톡톡';

$('copyBtn').addEventListener('click', function () {
  var txt = C.account.no.replace(/[^0-9]/g, ''), btn = this;
  var ok = function () { btn.textContent = '복사됨'; setTimeout(function(){ btn.textContent = '계좌 복사'; }, 1600); };
  if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok).catch(function(){ prompt('계좌번호', txt); });
  else prompt('계좌번호', txt);
});

/* ── 잠금 ───────────────────────────────────────────── */
var LOCKED = !C.endpoint;
if (LOCKED) {
  $('submit').disabled = true;
  show('warn', '지금은 온라인 예약 신청을 받을 수 없습니다. ' +
               '네이버 톡톡 또는 010-2025-2767 로 연락 주시면 바로 도와드리겠습니다.');
}
function show(kind, text){ var m = $('msg'); m.className = 'msg show ' + kind; m.textContent = text; }
function hide(){ $('msg').className = 'msg'; }

/* ── 검증 ───────────────────────────────────────────── */
function when(dId, tId){
  var d = $(dId).value, t = $(tId).value;
  return (d && t) ? (d + 'T' + t) : '';
}
function validate(){
  var bad = [];
  [].forEach.call(document.querySelectorAll('.bad'), function(e){ e.classList.remove('bad'); });

  /* 성별을 안 고르면 프로그램 자체가 안 떠 있다. 가장 먼저 잡는다 */
  if (GENDERS && !gKey) { $('genderBox').classList.add('bad'); return ['성별']; }

  if ($('f_name').value.trim().length < 2) { $('f_name').classList.add('bad'); bad.push('성함'); }
  var digits = $('f_tel').value.replace(/[^0-9]/g, '');
  if (digits.length < 9 || digits.length > 11) { $('f_tel').classList.add('bad'); bad.push('연락처'); }
  /* 결과 자료를 메일로만 보내므로 주소가 틀리면 자료가 영영 안 간다 — 형식까지 본다 */
  var mail = $('f_email').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(mail)) { $('f_email').classList.add('bad'); bad.push('자료 받으실 메일'); }
  if (!pick('people'))  { $('peopleBox').classList.add('bad');  bad.push('인원'); }
  if (!pick('program')) { $('programBox').classList.add('bad'); bad.push('프로그램'); }
  if (!pick('route'))   { $('routeBox').classList.add('bad');   bad.push('예약 경로'); }
  if (!when('f_d1','f_t1')) { $('f_d1').classList.add('bad'); $('f_t1').classList.add('bad'); bad.push('1순위 날짜·시간'); }
  /* 2인 이상인데 동반자를 안 적으면 확정 문자에 이름이 빈다 */
  if (pick('people') && pick('people') !== '1인' && !$('f_partner').value.trim()) {
    $('f_partner').classList.add('bad'); bad.push('동반자 성함');
  }
  return bad;
}

/* ── 제출 ───────────────────────────────────────────── */
var sending = false;

$('form').addEventListener('submit', function (ev) {
  ev.preventDefault();
  if (LOCKED || sending) return;
  hide();

  var bad = validate();
  if (bad.length) {
    show('err', '아래 항목을 확인해 주세요 — ' + bad.join(' · '));
    var first = document.querySelector('.bad');
    if (first) first.scrollIntoView({ block: 'center', behavior: 'smooth' });
    return;
  }

  var tel = $('f_tel').value.trim();
  var payload = {
    kind:    C.kind,
    name:    $('f_name').value.trim(),
    partner: $('f_partner').value.trim(),
    telRaw:  tel,
    tel:     tel.replace(/[^0-9]/g, ''),
    email:   $('f_email').value.trim().toLowerCase(),
    program: pick('program'),
    option:  pick('option'),
    people:  pick('people'),
    when1:   when('f_d1','f_t1'),
    when2:   when('f_d2','f_t2'),
    route:   pick('route'),
    note:    $('f_note').value.trim(),
    deposit: total(),
    ua:      navigator.userAgent
  };

  sending = true;
  $('submit').disabled = true;
  $('submit').textContent = '보내는 중…';

  /* Apps Script 는 CORS 프리플라이트를 못 받는다.
     text/plain 으로 보내면 프리플라이트 없이 통과한다. */
  fetch(C.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  })
  .then(function (r) { return r.json().catch(function(){ return { ok: r.ok }; }); })
  .then(function (res) {
    if (!res || res.ok !== true) throw new Error('서버가 접수를 확인하지 않았습니다');
    $('form').style.display = 'none';
    $('head').style.display = 'none';
    $('done').style.display = 'block';
    window.scrollTo(0, 0);
  })
  .catch(function () {
    sending = false;
    $('submit').disabled = false;
    $('submit').textContent = '예약 신청하기';
    show('err', '전송에 실패했습니다. 잠시 후 다시 시도해 주세요. ' +
                '계속 안 되면 010-2025-2767 로 연락 주시면 바로 접수해 드리겠습니다.');
  });
});

/* 통합 페이지는 성별을 고른 뒤에 그린다 (?g= 로 들어왔으면 위에서 이미 그렸다) */
if (!GENDERS) drawPrograms();

})();
