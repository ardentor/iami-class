/* 프로그램 소개 페이지 렌더러.
   내용은 각 페이지의 window.PROG 한 곳에만 둔다 — 두 곳에 두면 한쪽이 반드시 낡는다. */
'use strict';

function $(id){ return document.getElementById(id); }
function esc(s){
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

(function(){
  var C = window.PROG;
  if(!C) return;

  document.title = C.title + ' — 아엠아이브랜딩';
  $('h1').textContent   = C.title;
  $('lead').textContent = C.lead;
  $('hero').innerHTML   = '<img src="' + esc(C.hero) + '" alt="">';
  $('sowhat').textContent = C.sowhat;
  $('sowhatSub').textContent = C.sowhatSub;

  /* 주력 프로그램 카드 — 첫 장만 강조색을 준다 (고객이 가장 많이 고르는 것) */
  $('list').innerHTML = (C.programs || []).map(function(p, i){
    var steps = (p.steps || []).map(function(s){
      return '<li><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></li>';
    }).join('');
    return '<section class="prog' + (i === 0 ? ' lead' : '') + '">' +
      '<div class="p-top">' +
        '<span class="p-thumb"><img src="' + esc(p.thumb) + '" alt=""></span>' +
        '<span class="p-head">' +
          '<h3 class="p-name">' + esc(p.name) + '</h3>' +
          '<span class="p-time">' + esc(p.time) + '</span>' +
        '</span>' +
      '</div>' +
      '<p class="p-desc">' + esc(p.desc) + '</p>' +
      (steps ? '<details class="p-steps"><summary>진행 순서 보기</summary><ol>' + steps + '</ol></details>' : '') +
      '<a class="p-go" href="' + esc(C.apply) + '">이 프로그램으로 신청하기</a>' +
    '</section>';
  }).join('');

  /* 그 밖의 프로그램 — 카드로 만들면 화면이 길어져 목록으로 줄인다 */
  $('more').innerHTML = (C.more || []).map(function(m){
    return '<div><b>' + esc(m.name) + '</b><em>' + esc(m.time) + '</em></div>' +
           (m.desc ? '<p style="margin:-6px 0 12px">' + esc(m.desc) + '</p>' : '');
  }).join('');

  $('apply1').href = C.apply;
  $('apply2').href = C.apply;
})();
