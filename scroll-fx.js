/* 코인스쿨 공통 스크롤 애니메이션 보강
   - 각 페이지의 IntersectionObserver가 빠른 스크롤·앵커 이동·새로고침 복원으로 놓친 요소를 뒤늦게 보이게 한다.
   - 페이지별 클래스 규약(.reveal→visible/on, .rv→on)을 그대로 따르며 페이지 고유 애니메이션은 건드리지 않는다. */
(function () {
  var SEL = '.reveal,.reveal-left,.reveal-right,.reveal-scale,.reveal-blur,.rv,.rv-s,.rv-l,.rv-r';
  var RV = '.rv,.rv-s,.rv-l,.rv-r';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pending = [];
  var ticking = false;

  function reveal(el) {
    if (el.matches(RV)) el.classList.add('on');
    else { el.classList.add('visible'); el.classList.add('on'); }
  }

  function sweep() {
    ticking = false;
    var limit = window.innerHeight - 30;
    pending = pending.filter(function (el) {
      if (el.classList.contains('visible') || el.classList.contains('on')) return false;
      if (reduce || el.getBoundingClientRect().top < limit) { reveal(el); return false; }
      return true;
    });
    if (!pending.length) {
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    }
  }

  function request() {
    if (!ticking) { ticking = true; requestAnimationFrame(sweep); }
  }

  function init() {
    pending = Array.prototype.slice.call(document.querySelectorAll(SEL));
    if (!pending.length) return;
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request, { passive: true });
    window.addEventListener('hashchange', request);
    setTimeout(sweep, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
