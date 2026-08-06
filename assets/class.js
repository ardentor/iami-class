/* 원데이클래스 소개 페이지 — 후기·판매링크만 그린다. 나머지는 HTML 에 그대로 둔다. */
'use strict';

function esc(s){
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

(function(){
  var rl = document.getElementById('revList');
  if (rl && window.REVIEWS) {
    rl.innerHTML = window.REVIEWS.map(function(r){
      return '<div class="rev"><p>' + esc(r[0]) + '</p><cite>' + esc(r[1]) + '</cite></div>';
    }).join('');
  }

  var sl = document.getElementById('shopList');
  if (sl && window.SHOP) {
    sl.innerHTML = window.SHOP.map(function(s){
      return '<a href="' + esc(s[2]) + '" target="_blank" rel="noopener">' +
               '<span><b>' + esc(s[0]) + '</b><p>' + esc(s[1]) + '</p></span>' +
               '<i>보기 →</i>' +
             '</a>';
    }).join('');
  }
})();
