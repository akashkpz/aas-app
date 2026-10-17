(function () {
  if (window.__aasOn) return;
  window.__aasOn = true;
  var t0 = Date.now(), revealed = false;

  function T(e) { return (e.textContent || '').replace(/\s+/g, ' ').trim(); }
  function hide(e) { if (e && e.style) e.style.setProperty('display', 'none', 'important'); }
  function fixed(e) {
    while (e && e !== document.body) {
      var p = getComputedStyle(e).position;
      if (p === 'fixed' || p === 'sticky') return true;
      e = e.parentElement;
    }
    return false;
  }
  function isNav(e) { var t = T(e); return /Home/.test(t) && /Tests/.test(t) && /Profile/.test(t); }
  function smallest(re, max) {
    var out = [], all = document.body ? document.body.getElementsByTagName('*') : [];
    for (var i = 0; i < all.length; i++) {
      var e = all[i];
      if (e.tagName === 'SCRIPT' || e.tagName === 'STYLE') continue;
      var t = T(e);
      if (t.length > max || !re.test(t)) continue;
      var inner = false;
      for (var j = 0; j < e.children.length; j++) {
        if (re.test(T(e.children[j]))) { inner = true; break; }
      }
      if (!inner) out.push(e);
    }
    return out;
  }
  function hideNode(s) {
    if (fixed(s)) return;
    if (isNav(s)) {
      for (var i = 0; i < s.children.length; i++) hideNode(s.children[i]);
    } else hide(s);
  }
  function hideAfter(start) {
    var cur = start;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      var s = cur.nextElementSibling;
      while (s) { hideNode(s); s = s.nextElementSibling; }
      cur = cur.parentElement;
    }
  }
  function toolbox() {
    var r = smallest(/^Toolbox\b/, 60);
    if (!r.length) return false;
    var a = r[0];
    while (a.parentElement && a.parentElement !== document.body &&
           !/PYQ Bank/.test(T(a.parentElement)) && !/Hey,/.test(T(a.parentElement))) a = a.parentElement;
    hide(a);
    hideAfter(a);
    return true;
  }
  function teacher() {
    var r = smallest(/^Teacher App$/, 20);
    if (!r.length) return false;
    var c = r[0];
    while (c.parentElement && c.parentElement !== document.body &&
           !/Hey,/.test(T(c.parentElement))) c = c.parentElement;
    hide(c);
    [c.nextElementSibling, c.previousElementSibling].forEach(function (s) {
      if (s && T(s) === '' && !/Hey,/.test(T(s)) &&
          (s.tagName === 'BUTTON' || s.querySelector('svg,img,button'))) hide(s);
    });
    return true;
  }
  function premium() {
    var r = smallest(/^premium$/i, 12), ok = false;
    for (var i = 0; i < r.length; i++) {
      if (!fixed(r[i])) continue;
      var c = r[i];
      while (c.parentElement && c.parentElement !== document.body && !isNav(c.parentElement)) c = c.parentElement;
      hide(c);
      ok = true;
    }
    return ok;
  }
  function misc() {
    var sel = 'a[href*="youtube.com"],a[href*="youtu.be"],a[href*="instagram.com"],a[href*="t.me"],' +
      'a[href*="facebook.com"],a[href*="linkedin.com"],a[href*="wa.me"],a[href*="whatsapp.com"],' +
      '[aria-label*="otification" i]';
    var l = document.querySelectorAll(sel);
    for (var i = 0; i < l.length; i++) hide(l[i]);
    if (/exambro/i.test(document.title)) document.title = 'AAKASH ACADEMY OF SCIENCE';
  }
  function reveal() { revealed = true; document.documentElement.style.visibility = 'visible'; }
  function run() {
    var a = toolbox(), b = teacher(), c = premium();
    misc();
    if (!revealed && ((a && b && c) || Date.now() - t0 > 1500)) reveal();
  }

  var timer = null;
  new MutationObserver(function () {
    if (timer) return;
    timer = setTimeout(function () { timer = null; run(); }, 60);
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  run();
  setTimeout(run, 1600);
})();
