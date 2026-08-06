/* 아엠아이브랜딩 클래스 신청서 — 공통 동작
   페이지마다 다른 것은 index.html 맨 위 CONFIG 블록뿐이다.

   🔴 지켜야 할 잠금 (메시지부서 §0)
     ENDPOINT 가 비어 있으면 제출 버튼이 잠긴다. 가짜 완료 화면을 절대 띄우지 않는다.
     이 잠금을 지우지 말 것 — 접수가 아무 데도 안 남은 채 「신청 완료」를 보여주면
     고객은 신청했다고 믿고 대표님은 명단을 못 받는다. */
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

/* ── 화면 구성 ─────────────────────────────────────────────── */

document.title = C.title + ' 신청 — 아엠아이브랜딩';
$('h1').textContent = C.title;
$('lead').textContent = C.lead || '';

// 가격 안내
if (C.prices && C.prices.length) {
  $('priceList').innerHTML = C.prices.map(function (p) {
    return '<li>' + esc(p.label) + ' — <b>' + comma(p.won) + '원</b>' + (p.note ? ' <span style="opacity:.75">' + esc(p.note) + '</span>' : '') + '</li>';
  }).join('');
  if (C.priceNote) $('priceNote').textContent = C.priceNote;
} else {
  $('priceBox').style.display = 'none';
}

// 라디오 그룹 (클래스 형태 / 인원 규모)
function radios(boxId, name, list){
  var box = $(boxId);
  if (!list || !list.length) { box.closest('.f').style.display = 'none'; return; }
  box.innerHTML = list.map(function (o, i) {
    return '<label class="opt"><input type="radio" name="' + name + '" value="' + esc(o.value) + '">' +
             '<span>' + esc(o.label) + (o.sub ? '<em>' + esc(o.sub) + '</em>' : '') + '</span></label>';
  }).join('');
  box.addEventListener('change', function () {
    [].forEach.call(box.querySelectorAll('.opt'), function (el) {
      el.classList.toggle('on', el.querySelector('input').checked);
    });
    box.classList.remove('bad');
  });
}
radios('formBox', 'form', C.forms);
radios('sizeBox', 'size', C.sizes);

// 직책
$('f_role').innerHTML = '<option value="">선택해 주세요</option>' +
  (C.roles || []).map(function (r) { return '<option>' + esc(r) + '</option>'; }).join('');

// 계좌
/* 계좌번호는 절대 줄바꿈시키지 않는다 — 중간에 끊기면 고객이 잘못 옮겨 적는다.
   은행명은 위에 따로 두고, 숫자만 한 줄로 크게 보여 준다. */
$('acctBank').textContent = C.account.bank;
$('acctNo').textContent = C.account.no;
$('acctWho').textContent = '예금주 ' + C.account.holder;
$('paidLabel').innerHTML = '<input type="checkbox" id="f_paid"><span>' + esc(C.paidLabel) + '</span>';
$('noticeList').innerHTML = (C.notices || []).map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('');

$('backLink').href = C.landing;
$('doneBack').href = C.landing;
$('foot').innerHTML =
  '아엠아이브랜딩 · 대표 허우영<br>' +
  '문의 010-2025-2767 · ownmyway_ib@naver.com<br>' +
  '<a href="' + esc(C.landing) + '">클래스 안내 페이지로 돌아가기</a>';

/* ── 계좌 복사 ─────────────────────────────────────────────── */
$('copyBtn').addEventListener('click', function () {
  var txt = C.account.no.replace(/[^0-9]/g, '');
  var btn = this;
  var ok = function () {
    btn.textContent = '복사됨';
    setTimeout(function () { btn.textContent = '계좌 복사'; }, 1600);
  };
  if (navigator.clipboard) {
    navigator.clipboard.writeText(txt).then(ok).catch(function () { prompt('계좌번호', txt); });
  } else { prompt('계좌번호', txt); }
});

/* ── 엔드포인트 잠금 ───────────────────────────────────────── */
var LOCKED = !C.endpoint;
if (LOCKED) {
  $('submit').disabled = true;
  show('warn', '지금은 신청을 받을 수 없습니다. 접수 창구가 아직 연결되지 않았습니다. ' +
               '전화 010-2025-2767 또는 네이버 톡톡으로 연락 주시면 바로 도와드리겠습니다.');
}

function show(kind, text){
  var m = $('msg');
  m.className = 'msg show ' + kind;
  m.textContent = text;
}
function hide(){ $('msg').className = 'msg'; }

/* ── 검증 ──────────────────────────────────────────────────── */

function pick(name){
  var el = document.querySelector('input[name="' + name + '"]:checked');
  return el ? el.value : '';
}

function validate(){
  var bad = [];
  [].forEach.call(document.querySelectorAll('.bad'), function (e) { e.classList.remove('bad'); });

  var name = $('f_name').value.trim();
  var tel  = $('f_tel').value.trim();
  var org  = $('f_org').value.trim();
  var role = $('f_role').value;

  if (name.length < 2) { $('f_name').classList.add('bad'); bad.push('성함'); }
  // 010-1234-5678 / 01012345678 / 지역번호 전부 허용. 숫자 9~11자리면 통과.
  var digits = tel.replace(/[^0-9]/g, '');
  if (digits.length < 9 || digits.length > 11) { $('f_tel').classList.add('bad'); bad.push('연락처'); }
  if (!org) { $('f_org').classList.add('bad'); bad.push('소속 업체'); }
  if (!role) { $('f_role').classList.add('bad'); bad.push('직책'); }

  if (C.forms && C.forms.length && !pick('form')) { $('formBox').classList.add('bad'); bad.push('클래스 형태'); }
  if (C.sizes && C.sizes.length && !pick('size')) { $('sizeBox').classList.add('bad'); bad.push('인원'); }

  return bad;
}

/* ── 제출 ──────────────────────────────────────────────────── */

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
    kind:   C.kind,
    name:   $('f_name').value.trim(),
    telRaw: tel,
    tel:    tel.replace(/[^0-9]/g, ''),
    org:    $('f_org').value.trim(),
    role:   $('f_role').value,
    form:   pick('form'),
    size:   pick('size'),
    note:   $('f_note').value.trim(),
    paid:   $('f_paid').checked ? 'Y' : 'N',
    ua:     navigator.userAgent
  };

  sending = true;
  $('submit').disabled = true;
  $('submit').textContent = '보내는 중…';

  /* Apps Script 는 CORS 프리플라이트를 못 받는다.
     text/plain 으로 보내면 프리플라이트 없이 통과한다 — 서버는 본문을 JSON 으로 읽는다. */
  fetch(C.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  })
  .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
  .then(function (res) {
    if (!res || res.ok !== true) throw new Error('서버가 접수를 확인하지 않았습니다');
    $('form').style.display = 'none';
    $('priceBox').style.display = 'none';
    $('head').style.display = 'none';
    $('done').style.display = 'block';
    window.scrollTo(0, 0);
  })
  .catch(function (e) {
    sending = false;
    $('submit').disabled = false;
    $('submit').textContent = '신청서 제출하기';
    show('err', '전송에 실패했습니다. 잠시 후 다시 시도해 주세요. ' +
                '계속 안 되면 010-2025-2767 로 연락 주시면 바로 접수해 드리겠습니다.');
  });
});

})();
