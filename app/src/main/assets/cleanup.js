(function () {
  if (window.__aasOn) return;
  window.__aasOn = true;
  var t0 = Date.now(), revealed = false, hidden = [], cool = 0, lastFloat = 0;
  var KEEP = /Hey,|PYQ Bank/;
  var OTHER = /PYQ Mock Tests|Solve DPPs|Chapter AI|WhatsApp Community|Chat with Support|Toolbox|Digital Books|Advance Bank/;
  var PAGE = /Your Daily Goal|My Weekly Activity|[\w.+-]+@[\w-]+\.\w+/;
  var NAVONLY = /^(Home|Tests|Premium|Profile|\s)+$/;

  function T(e) { return (e.textContent || '').replace(/\s+/g, ' ').trim(); }
  function BT() { return (document.body && document.body.innerText) || ''; }
  function safe(e) {
    return e && e.style && e !== document.body && e !== document.documentElement &&
      e.parentElement !== document.body && !KEEP.test(T(e));
  }
  function hide(e) {
    if (!safe(e)) return false;
    e.style.setProperty('display', 'none', 'important');
    if (hidden.indexOf(e) < 0) hidden.push(e);
    return true;
  }
  function restore() {
    for (var i = 0; i < hidden.length; i++) hidden[i].style.removeProperty('display');
    hidden = [];
  }
  function fixed(e) {
    while (e && e !== document.body) {
      var p = getComputedStyle(e).position;
      if (p === 'fixed' || p === 'sticky') return true;
      e = e.parentElement;
    }
    return false;
  }
  function isNav(e) { var t = T(e); return /Home/.test(t) && /Tests/.test(t) && /Profile/.test(t); }
  function smallest(re, max, root) {
    root = root || document.body;
    var out = [], all = root.getElementsByTagName('*');
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
  function climb(el, stopRe) {
    var c = el;
    while (c.parentElement && c.parentElement !== document.body && !stopRe.test(T(c.parentElement))) c = c.parentElement;
    return c;
  }
  function lca(a, b) { var e = a; while (e && !e.contains(b)) e = e.parentElement; return e; }
  function hideNode(s) {
    if (fixed(s)) return;
    if (isNav(s)) {
      for (var i = 0; i < s.children.length; i++) hideNode(s.children[i]);
    } else hide(s);
  }

  /* ---------- dashboard: hide Toolbox..social, keep Join Online Mock Tests ---------- */
  function sweep(node, H, K) {
    for (var i = 0; i < node.children.length; i++) {
      var c = node.children[i];
      if (c === K || K.contains(c)) continue;
      if (c === H) { hideNode(c); continue; }
      if (c.contains(K) || c.contains(H)) { sweep(c, H, K); continue; }
      if (H.compareDocumentPosition(c) & 4) hideNode(c);
    }
  }
  function dashboard() {
    if (!/PYQ Bank/.test(BT())) return false;
    var hs = smallest(/^Toolbox\b/, 60);
    var ks = smallest(/^Join Online Mock Tests/, 120);
    if (!hs.length || !ks.length) return false;
    sweep(document.body, hs[0], climb(ks[0], OTHER));
    return true;
  }
  function teacher() {
    if (!/Hey,/.test(BT())) return false;
    var r = smallest(/^Teacher App$/, 20);
    if (!r.length) return false;
    var c = r[0];
    while (c.parentElement && c.parentElement !== document.body &&
           !/Hey,/.test(T(c.parentElement))) c = c.parentElement;
    if (!hide(c)) return false;
    [c.nextElementSibling, c.previousElementSibling].forEach(function (s) {
      if (s && T(s) === '' && (s.tagName === 'BUTTON' || s.querySelector('svg,img,button'))) hide(s);
    });
    return true;
  }

  /* ---------- bottom nav: Premium + Tests ---------- */
  function navItem(re) {
    var r = smallest(re, 12), ok = false;
    for (var i = 0; i < r.length; i++) {
      if (!fixed(r[i])) continue;
      var c = r[i], n = 0;
      while (c.parentElement && n < 5 && !isNav(c.parentElement)) { c = c.parentElement; n++; }
      if (c.parentElement && isNav(c.parentElement) && !/Home/.test(T(c))) { hide(c); ok = true; }
    }
    return ok;
  }

  /* ---------- MHT CET page banner ---------- */
  function banner() {
    var t = smallest(/seeing free past-paper/i, 220);
    var b = smallest(/^Unlock\s*&\s*continue/i, 40);
    if (!t.length || !b.length) return false;
    var x = lca(t[0], b[0]);
    return !!(x && T(x).length < 500 && hide(x));
  }

  /* ---------- profile page ---------- */
  function profile() {
    var ok = false;
    [/^Switch to Teacher$/, /^View My Purchases$/, /^Exam Info$/].forEach(function (re) {
      var r = smallest(re, 40);
      for (var i = 0; i < r.length; i++) {
        if (fixed(r[i])) continue;
        if (hide(climb(r[i], PAGE))) ok = true;
      }
    });
    var em = smallest(/^[\w.+-]+@[\w-]+\.[\w.]+$/, 80);
    if (em.length) {
      var cur = em[0];
      for (var n = 0; n < 5 && cur.parentElement && cur.parentElement !== document.body; n++) {
        cur = cur.parentElement;
        if (/Your Daily Goal/.test(T(cur))) break;
        var ps = smallest(/^Profile$/, 10, cur).filter(function (x) { return !fixed(x); });
        if (ps.length) {
          var t = ps[0];
          var b = t.closest ? t.closest('button,a,[role="button"]') : null;
          hide(b && cur.contains(b) ? b : t);
          ok = true;
          break;
        }
      }
    }
    return ok;
  }

  /* ---------- login page logo ---------- */
  function login() {
    if (!/Login with Google/i.test(BT())) return false;
    var r = smallest(/^exambro$/i, 12), ok = false;
    for (var i = 0; i < r.length; i++) {
      var c = r[i], n = 0;
      while (c.parentElement && c.parentElement !== document.body && n < 3 &&
             !/Login with Google/i.test(T(c.parentElement))) { c = c.parentElement; n++; }
      if (hide(c)) ok = true;
      var p = c.previousElementSibling;
      if (p && T(p) === '' && p.querySelector('img,svg') && !/Login with Google/i.test(T(p))) hide(p);
    }
    return ok;
  }

  /* ---------- small floating logo bottom-left + misc ---------- */
  function floaters() {
    var now = Date.now();
    if (now - lastFloat < 700) return;
    lastFloat = now;
    if (/Login with Google/i.test(BT())) return;
    var all = document.body.getElementsByTagName('*'), H = window.innerHeight;
    for (var i = 0; i < all.length; i++) {
      var e = all[i], tn = e.tagName;
      if (tn === 'SCRIPT' || tn === 'STYLE' || e.style.display === 'none') continue;
      var r = e.getBoundingClientRect();
      if (r.width < 30 || r.width > 150 || r.height < 30 || r.height > 150) continue;
      if (r.left > 170 || r.bottom < H - 260 || r.top > H) continue;
      if (T(e) !== '' || !(tn === 'IMG' || e.querySelector('img,svg'))) continue;
      if (!fixed(e)) continue;
      var a = e.parentElement, inNav = false;
      while (a && a !== document.body) { if (NAVONLY.test(T(a))) { inNav = true; break; } a = a.parentElement; }
      if (!inNav) hide(e);
    }
  }
  function misc() {
    var sel = 'a[href*="youtube.com"],a[href*="youtu.be"],a[href*="instagram.com"],a[href*="t.me"],' +
      'a[href*="facebook.com"],a[href*="linkedin.com"],a[href*="wa.me"],a[href*="whatsapp.com"],' +
      '[aria-label*="otification" i],img[src*="exambro" i],img[alt*="exambro" i],img[title*="exambro" i]';
    var l = document.querySelectorAll(sel);
    for (var i = 0; i < l.length; i++) hide(l[i]);
    var im = document.querySelectorAll('img[alt]');
    for (var k = 0; k < im.length; k++) if (/^(app )?logo$/i.test(im[k].alt)) hide(im[k]);
    var tx = smallest(/^exambro( premium)?$/i, 20);
    for (var j = 0; j < tx.length; j++) hide(tx[j]);
    if (/exambro/i.test(document.title)) document.title = 'AAKASH ACADEMY OF SCIENCE';
  }

  function reveal() { revealed = true; document.documentElement.style.visibility = 'visible'; }
  function run() {
    try {
      if (Date.now() >= cool) {
        dashboard(); teacher(); navItem(/^premium$/i); navItem(/^tests$/i);
        banner(); profile(); login(); misc(); floaters();
        if (hidden.length && BT().trim().length < 30) { restore(); cool = Date.now() + 2000; }
      }
    } catch (e) {}
    var age = Date.now() - t0;
    if (!revealed && ((hidden.length && age > 400) || age > 1500)) reveal();
  }

  var timer = null;
  new MutationObserver(function () {
    if (timer) return;
    timer = setTimeout(function () { timer = null; run(); }, 60);
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  run();
  setTimeout(run, 450);
  setTimeout(run, 1600);
})();
