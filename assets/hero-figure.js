/* ============================================================
   首屏右侧概念关系图
   ------------------------------------------------------------
   为什么是「body 下的绝对定位层 + 运行时定位」：
     首页的 hero 由 React 水合渲染，语言切换会重渲染整棵子树，
     任何插进 .hero 里的节点都会被抹掉（之前 hero 四图被 hydration
     复活过一次，就是同一个原因）。所以这块装饰性图形完全绕开 React：
     挂在 body 上，量 .hero 的 rect 把自己摆到右侧空白里。
   ============================================================ */
(function () {
  'use strict';

  var ID = 'hero-figure';
  var W_MIN = 360, W_MAX = 520;
  var ASPECT = 300 / 470;      // 画布 470×300（右边界留 40 个单位的空，给放大后的标签）

  // 四个节点 + 中心。画布 440×300（viewBox 只裁掉上下空白，图形本身不缩）。
  // 右侧两个节点比原来左移了 30 出头：英文标签放大到 17 个单位后，
  // UNDERSTAND 一词要占 ~120 个单位，不左移会顶出 440 的右边界。
  var NODES = [
    { id: 'perceive',   x: 92,  y: 126, lx: 92,  ly: 95,  lyz: 108, anchor: 'middle',
      en: 'PERCEIVE',   zh: '感知' },
    { id: 'understand', x: 298, y: 146, lx: 310, ly: 144, anchor: 'start',
      en: 'UNDERSTAND', zh: '理解' },
    { id: 'reflect',    x: 330, y: 272, lx: 342, ly: 277, anchor: 'start',
      en: 'REFLECT',    zh: '反思' },
    { id: 'act',        x: 156, y: 308, lx: 156, ly: 335, anchor: 'middle',
      en: 'ACT',        zh: '行动' }
  ];

  // 三条实线 + 一条回环虚线：从感知到行动是一条实路，行动回到感知是虚线，
  // 闭环只被「暗示」，不真的合上。
  var LINKS = [
    { t: 'perceive understand',  d: 'M92,126 Q194,96 298,146' },
    { t: 'understand reflect',   d: 'M298,146 Q370,204 330,272' },
    { t: 'reflect act',          d: 'M330,272 Q286,348 156,308' },
    { t: 'act perceive', ghost: 1, d: 'M156,308 Q58,232 92,126' },
    // 次级关系：更淡、虚线，只是暗示还有别的路径
    { t: 'perceive reflect',  sub: 1, d: 'M92,126 Q208,206 330,272' },
    { t: 'act understand',    sub: 1, d: 'M156,308 Q222,236 298,146' }
  ];

  // 中心伸出的短丝线：只画中段，不接圆心也不接节点，留气口
  var SPOKES = [
    { t: 'perceive insight',   d: 'M105,135 L194,198' },
    { t: 'understand insight', d: 'M287,155 L250,199' },
    { t: 'reflect insight',    d: 'M317,265 L254,232' },
    { t: 'act insight',        d: 'M165,295 L202,245' }
  ];

  var CAPTION = {
    en: 'From perception to understanding.',
    zh: '从感知，到理解。'
  };

  function svgMarkup() {
    var s = '';
    s += '<svg class="hf-svg" viewBox="-12 66 470 300" role="img" ' +
         'aria-label="Perceive, understand, reflect and act, connected around insight">';

    s += '<g class="hf-links">';
    LINKS.forEach(function (l) {
      s += '<path class="hf-link' + (l.ghost ? ' hf-link--ghost' : '') +
           (l.sub ? ' hf-link--sub' : '') +
           '" data-touch="' + l.t + '" d="' + l.d + '"/>';
    });
    SPOKES.forEach(function (l) {
      s += '<path class="hf-spoke" data-touch="' + l.t + '" d="' + l.d + '"/>';
    });
    s += '</g>';

    s += '<g class="hf-node hf-core" data-id="insight">' +
         '<circle class="hf-core-hit" cx="222" cy="218" r="16"/>' +
         '<path class="hf-core-mark" d="M222,211 V225 M214.9,214.5 L229.1,221.5 ' +
         'M229.1,214.5 L214.9,221.5"/>' +
         '<text class="hf-core-label" data-en="Insight" data-zh="洞察" x="222" y="190" ' +
         'text-anchor="middle">Insight</text>' +
         '</g>';

    NODES.forEach(function (n, i) {
      s += '<g class="hf-node" data-id="' + n.id + '" style="--d:' + (-i * 3.7) + 's">' +
           '<circle class="hf-halo" cx="' + n.x + '" cy="' + n.y + '" r="7.5"/>' +
           '<circle class="hf-dot" cx="' + n.x + '" cy="' + n.y + '" r="3"/>' +
           '<text class="hf-label" data-en="' + n.en + '" data-zh="' + n.zh + '" ' +
           'data-y-en="' + n.ly + '" data-y-zh="' + (n.lyz || n.ly) + '" ' +
           'x="' + n.lx + '" y="' + n.ly + '" text-anchor="' + n.anchor + '">' + n.en + '</text>' +
           '</g>';
    });

    s += '</svg>';
    s += '<p class="hf-caption"><i></i><span data-en="' + CAPTION.en + '" data-zh="' +
         CAPTION.zh + '">' + CAPTION.en + '</span></p>';
    return s;
  }

  function isZh() {
    var l = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    return l.indexOf('zh') === 0;
  }

  function applyLang(root) {
    var zh = isZh();
    var els = root.querySelectorAll('[data-en]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var v = el.getAttribute(zh ? 'data-zh' : 'data-en');
      if (v && el.textContent !== v) el.textContent = v;
      // 中文标签字号更大，基线要单独给一档，否则离节点太远
      var y = el.getAttribute(zh ? 'data-y-zh' : 'data-y-en');
      if (y) el.setAttribute('y', y);
    }
  }

  function wireHover(root) {
    var svg = root.querySelector('.hf-svg');
    if (!svg) return;

    var byTouch = function (id) {
      return svg.querySelectorAll('[data-touch~="' + id + '"]');
    };

    var clear = function () {
      svg.classList.remove('is-hot');
      var hot = svg.querySelectorAll('.is-hot');
      for (var i = 0; i < hot.length; i++) hot[i].classList.remove('is-hot');
    };

    svg.addEventListener('pointerover', function (e) {
      var g = e.target.closest ? e.target.closest('[data-id]') : null;
      if (!g) return;
      clear();
      var id = g.getAttribute('data-id');
      svg.classList.add('is-hot');
      g.classList.add('is-hot');
      var links = byTouch(id);
      for (var i = 0; i < links.length; i++) links[i].classList.add('is-hot');
    });

    svg.addEventListener('pointerleave', clear);
  }

  function layout(box) {
    var hero = document.querySelector('.hero');
    if (!hero) return false;
    var copy = hero.querySelector('.hero-copy');
    var topBar = hero.querySelector('.hero-top');
    var bottom = hero.querySelector('.hero-bottom');
    if (!copy || !topBar || !bottom) return false;

    var heroR = hero.getBoundingClientRect();
    var cs = getComputedStyle(hero);
    var padR = parseFloat(cs.paddingRight) || 0;
    var padL = parseFloat(cs.paddingLeft) || 0;
    var contentRight = heroR.right - padR;
    var contentLeft = heroR.left + padL;

    var copyR = copy.getBoundingClientRect();
    var avail = contentRight - copyR.right - 34;      // 与标题至少留 34px 气口
    if (avail < W_MIN) { box.style.display = 'none'; return false; }
    box.style.display = '';

    var w = Math.min(W_MAX, avail);
    var capH = 34;                                     // 图注那一行
    var totalH = w * ASPECT + capH;

    var topY = topBar.getBoundingClientRect().bottom;
    var botY = bottom.getBoundingClientRect().top;
    var area = botY - topY - 12;
    if (area < totalH) {
      w = Math.max(W_MIN, (area - capH) / ASPECT);
      totalH = w * ASPECT + capH;
    }

    var left = contentRight - w;
    var top = topY + Math.max(0, (area - totalH) * 0.42);

    // 保底：绝不越过左栏标题的右边界，也绝不压到底栏横线
    if (left < copyR.right + 24) left = copyR.right + 24;
    if (left < contentLeft) left = contentLeft;
    if (top + totalH > botY - 8) top = botY - 8 - totalH;

    box.style.width = Math.round(w) + 'px';
    box.style.left = Math.round(left + window.scrollX) + 'px';
    box.style.top = Math.round(top + window.scrollY) + 'px';
    return true;
  }

  function mount() {
    if (document.getElementById(ID)) return;
    if (!document.querySelector('.hero')) return;

    var root = document.createElement('div');
    root.id = ID;
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = '<div class="hf-box">' + svgMarkup() + '</div>';
    document.body.appendChild(root);

    var box = root.firstElementChild;

    applyLang(root);
    wireHover(root);

    var ok = layout(box);
    if (ok) requestAnimationFrame(function () { box.classList.add('is-in'); });

    var raf = 0;
    var relayout = function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        layout(root.querySelector('.hf-box'));
      });
    };
    window.addEventListener('resize', relayout, { passive: true });
    window.addEventListener('orientationchange', relayout, { passive: true });
    heroReady.then(relayout);

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);

    // 语言切换：站点改的是 <html lang>，盯着这个属性就够了
    new MutationObserver(relayout).observe(document.documentElement,
      { attributes: true, attributeFilter: ['lang'] });
    new MutationObserver(function () {
      var r = document.getElementById(ID);
      if (r) applyLang(r);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  var heroReady = new Promise(function (resolve) {
    if (document.readyState === 'complete') return resolve();
    window.addEventListener('load', function () { resolve(); }, { once: true });
  });

  // React 有时会把 body 的额外子节点清掉（语言切换 / 重渲染），掉了就补回来
  var guard = function () {
    if (!document.body) return;
    if (!document.getElementById(ID)) mount();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      if (records[i].removedNodes && records[i].removedNodes.length) {
        var gone = false;
        for (var j = 0; j < records[i].removedNodes.length; j++) {
          if (records[i].removedNodes[j].id === ID) gone = true;
        }
        if (gone) setTimeout(guard, 0);
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
