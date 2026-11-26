/* samsbench site script: the tool list, the "on this device" reader, search on the home page,
   Your bench (/my/), the ask-for-a-tool note and the 404 finder. No libraries, nothing leaves the device
   except GoatCounter counts (queued 700 ms apart: GoatCounter drops more than ~4 hits a second per visitor).
   Every tool lives at samsbench.com/<slug>/, the same origin as this page, so its localStorage is readable here.
   Keys: every tool keeps its keys under one prefix ("bd." for Bake Day ...). `data` = the keys that hold the work. */
(function () {
  'use strict';
  var TOOLS = [
    { slug: 'family-formals', name: 'Family Formals', p: 'ffp', data: ['ffp.v1', 'ffp.weddings'], trades: ['weddings'],
      who: 'Couples and wedding photographers', price: 'Free · Pro from $39',
      words: 'wedding photographer bride groom couple family photo shot list group formals divorced blended parents call card' },
    { slug: 'food-truck-event', name: 'Booking Check', p: 'bc', data: ['bc.plan.v2', 'bc.plan.mine', 'bc.log.v1'], trades: ['food', 'weddings'],
      who: 'Food truck owners', price: 'Free · Pro $3 once',
      words: 'food truck vendor festival event fee booth organizer percentage commission catering market' },
    { slug: 'bake-day', name: 'Bake Day', p: 'bd', data: ['bd.v1', 'bd.days'], trades: ['food'],
      who: 'Micro bakeries', price: 'Free to start · Pro $9 once',
      words: 'bakery micro bakery cottage sourdough bread levain starter dough bake schedule orders baker' },
    { slug: 'bunch-order', name: 'Bunch Order', p: 'bo', data: ['bo.v2'], trades: ['weddings', 'makers'],
      who: 'Event florists', price: 'Free to start · Pro $29 once',
      words: 'florist flowers wedding flowers stems bunches wholesale recipe bouquet centerpiece event floral' },
    { slug: 'recital-order', name: 'Recital Order', p: 'ro', data: ['ro.v1'], trades: ['music'],
      who: 'Dance studios', price: 'Free to start · Pro $29 once',
      words: 'dance studio recital running order show program costume change routines dancers ballet' },
    { slug: 'lesson-slots', name: 'Lesson Slots', p: 'lsl', data: ['lsl.v1'], trades: ['music'],
      who: 'Private music teachers', price: 'Free to start · Pro $19 once',
      words: 'music teacher piano violin guitar lessons students schedule availability siblings timetable tutor' },
    { slug: 'handbell-chart', name: 'Handbell Chart', p: 'hbc', data: ['hbc.v2'], trades: ['music'],
      who: 'Handbell directors', price: 'Free to start · Pro $9 once',
      words: 'handbell bells choir church ringers bell assignment chart director' },
    { slug: 'show-secretary', name: 'Show Secretary', p: 'sss', data: ['sss.v1', 'sss.saved'], trades: ['clubs'],
      who: 'Flower, produce and village show secretaries', price: 'Free to start · Pro $29 once',
      words: 'village show flower show produce horticultural society entries exhibit cards prize money cups trophies secretary' },
    { slug: 'fair-season', name: 'Show Season', p: 'fss', data: ['fss.v1'], trades: ['makers'],
      who: 'Artists who apply to art fairs', price: 'Free to start · Pro $15 once',
      words: 'art fair craft fair artist booth fee jury application deadlines show calendar zapplication maker' },
    { slug: 'discgolf-league', name: 'Tag Night', p: 'tn', data: ['tn.v1'], trades: ['clubs', 'hobbies'],
      who: 'Disc golf league organizers', price: 'Free to start · Pro $9 once',
      words: 'disc golf league bag tags udisc payouts ace pot doubles club' },
    { slug: 'car-cards', name: 'Car Card Press', p: 'ccp', data: ['ccp.state'], trades: ['hobbies'],
      who: 'Model railroaders', price: 'Free to start · Pro $9 once',
      words: 'model railroad railway trains freight car cards waybills operations layout ho n scale' },
    { slug: 'observing-log', name: 'Observing Log', p: 'olog', data: ['olog.v1', 'olog.night'], trades: ['hobbies'],
      who: 'Amateur astronomers', price: 'Free to start · Pro $9 once',
      words: 'astronomy telescope messier caldwell herschel astronomical league observing program log stars' },
    { slug: 'ship-or-hold', name: 'Ship or Hold', p: 'sh', data: ['sh.v1'], trades: ['makers'],
      who: 'Sellers who mail live plants and animals', price: 'Free to start · Pro $19 once',
      words: 'live plants shipping weather heat pack cold pack reptiles fish insects nursery etsy seller' },
    { slug: 'cohost-statement', name: 'Co-Host Statement', p: 'cos', data: ['cos.v1', 'cos.csv'], trades: ['services'],
      who: 'Airbnb co-hosts', price: 'Free to start · Pro $49 once',
      words: 'airbnb co-host cohost vrbo short term rental property owner statement payout earnings csv' },
    { slug: 'rate-raise', name: 'Rate Raise', p: 'rr', data: ['rr.v1'], trades: ['services'],
      who: 'Cleaners, lawn, pool and window pros', price: 'Free to start · Pro $19 once',
      words: 'cleaning cleaner house cleaning lawn care pool service window cleaning price increase rate letter clients' },
    { slug: 'bond-hours', name: 'Bond Hours', p: 'bh', data: ['bh.v1'], trades: ['clubs'],
      who: 'Youth hockey and sports associations', price: 'Free to start · Pro $49 once',
      words: 'youth hockey minor hockey sports association volunteer hours bond cheque check families' },
    { slug: 'fuzzy-grid', name: 'Fuzzy Grid', p: 'fg', data: ['fg.v1'], trades: ['services'],
      who: 'Freelance translators', price: 'Free to start · Pro $15 once',
      words: 'translator translation freelance cat tool trados memoq fuzzy match grid agency per word rate' }
  ];
  var TRADES = {
    weddings: 'Weddings & events', food: 'Food', music: 'Music & dance', clubs: 'Clubs & shows',
    hobbies: 'Hobbies', makers: 'Makers & sellers', services: 'Freelance & services'
  };
  var SKIP = /^(skipgc$|.*\.selftest$)/;   // test flags, never copied or counted

  function ls() { try { return window.localStorage; } catch (e) { return null; } }
  function keysOf(t) {
    var s = ls(), out = [];
    if (!s) return out;
    try {
      for (var i = 0; i < s.length; i++) {
        var k = s.key(i);
        if (k && k.indexOf(t.p + '.') === 0 && !SKIP.test(k)) out.push(k);
      }
    } catch (e) {}
    return out.sort();
  }
  function bytesOf(keys) {
    var s = ls(), n = 0;
    keys.forEach(function (k) { try { n += (k.length + (s.getItem(k) || '').length) * 2; } catch (e) {} });
    return n;
  }
  function isPro(t) {
    var s = ls();
    try { var v = s && s.getItem(t.p + '.pro'); return !!v && v !== '0' && v !== 'false' && v !== 'null'; } catch (e) { return false; }
  }
  /* What this browser holds for each tool: used = the tool's work keys are present. */
  function onDevice() {
    return TOOLS.map(function (t) {
      var keys = keysOf(t), s = ls(), used = false;
      t.data.forEach(function (k) { try { if (s && s.getItem(k) != null) used = true; } catch (e) {} });
      return { tool: t, keys: keys, bytes: bytesOf(keys), used: used, pro: isPro(t) };
    });
  }

  /* GoatCounter, one hit at a time */
  var q = [], busy = false;
  function count(path, title) {
    try { if (ls() && ls().getItem('skipgc')) return; } catch (e) {}
    q.push({ path: path, title: title || path, event: true });
    pump();
  }
  function pump() {
    if (busy || !q.length) return;
    if (!(window.goatcounter && window.goatcounter.count)) { setTimeout(pump, 1500); return; }
    busy = true;
    try { window.goatcounter.count(q.shift()); } catch (e) {}
    setTimeout(function () { busy = false; pump(); }, 700);
  }

  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function kb(n) { return n < 1024 ? '1 KB' : Math.round(n / 1024) + ' KB'; }
  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }

  /* ---------- search + trade filter (home and 404) ---------- */
  function matches(t, words) {
    if (!words.length) return true;
    var hay = ' ' + norm(t.name + ' ' + t.who + ' ' + t.words + ' ' + t.trades.map(function (x) { return TRADES[x]; }).join(' ')) + ' ';
    return words.every(function (w) { return hay.indexOf(' ' + w) >= 0; });
  }
  function initFinder() {
    var box = document.getElementById('find'), input = document.getElementById('find-q');
    if (!box || !input) return;
    var chips = box.querySelectorAll('[data-trade]');
    var items = document.querySelectorAll('[data-tool]');
    var status = document.getElementById('find-status');
    var none = document.getElementById('find-none');
    var trade = '';
    var missSent = {};
    var missTimer = null;
    function apply(fromUser) {
      var words = norm(input.value).split(' ').filter(Boolean);
      var shown = 0;
      items.forEach(function (it) {
        var t = byslug[it.getAttribute('data-tool')];
        var ok = t && matches(t, words) && (!trade || t.trades.indexOf(trade) >= 0);
        it.hidden = !ok;
        if (ok) shown++;
      });
      document.querySelectorAll('[data-hide-when-filtered]').forEach(function (x) { x.hidden = !!(words.length || trade); });
      document.querySelectorAll('[data-rack]').forEach(function (r) {
        r.hidden = !r.querySelector('[data-tool]:not([hidden])');
      });
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-trade') === trade ? 'true' : 'false'); });
      var filtered = words.length || trade;
      var clr = document.getElementById('find-clear');
      if (clr) clr.hidden = !filtered;
      status.textContent = filtered && shown ? (shown === 1 ? '1 tool' : shown + ' tools') + (trade ? ' for ' + TRADES[trade].toLowerCase() : '') + (words.length ? ' matching “' + input.value.trim() + '”' : '') : '';
      none.hidden = shown > 0;
      if (!shown) {
        var w = document.getElementById('none-q');
        if (w) w.textContent = input.value.trim() || TRADES[trade] || '';
        var who = document.getElementById('ask-who');
        if (who && !who.value && words.length) who.value = input.value.trim();
      }
      if (fromUser) {
        var u = new URL(location.href);
        if (words.length) u.searchParams.set('q', input.value.trim()); else u.searchParams.delete('q');
        if (trade) u.searchParams.set('for', trade); else u.searchParams.delete('for');
        try { history.replaceState(null, '', u.pathname + (u.search || '') + u.hash); } catch (e) {}
        clearTimeout(missTimer);
        if (!shown && words.length) {
          missTimer = setTimeout(function () {
            var key = norm(input.value).slice(0, 40);
            if (key && !missSent[key]) { missSent[key] = 1; count('search-miss/' + key.replace(/ /g, '-'), 'search with no tool: ' + key); }
          }, 1800);
        }
      }
    }
    input.addEventListener('input', function () { apply(true); });
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var v = c.getAttribute('data-trade');
        trade = trade === v ? '' : v;
        apply(true);
        if (trade) count('filter/' + trade, 'filter ' + TRADES[trade]);
      });
    });
    var clear = document.getElementById('find-clear');
    if (clear) clear.addEventListener('click', function () { input.value = ''; trade = ''; apply(true); input.focus(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); input.focus();
      }
    });
    var sp = new URLSearchParams(location.search);
    if (sp.get('q')) input.value = sp.get('q');
    if (sp.get('for') && TRADES[sp.get('for')]) trade = sp.get('for');
    apply(false);
  }

  /* ---------- "on this device" strip on the home page ---------- */
  function initStrip() {
    var strip = document.getElementById('mine');
    if (!strip) return;
    var used = onDevice().filter(function (d) { return d.used || d.pro; });
    if (!used.length) return;
    var list = strip.querySelector('.mine-list');
    used.forEach(function (d, i) {
      var a = el('a', { href: '/' + d.tool.slug + '/?via=home-mine' }, [d.tool.name]);
      list.appendChild(a);
      if (d.pro) list.appendChild(el('span', { class: 'pro-dot', text: 'Pro' }));
      if (i < used.length - 1) list.appendChild(document.createTextNode(' · '));
    });
    strip.hidden = false;
  }

  /* ---------- ask for a tool ---------- */
  var ASK_TO = 'sam' + '@' + 'samsbench.com';
  function askText() {
    var who = (document.getElementById('ask-who') || {}).value || '';
    var job = (document.getElementById('ask-job') || {}).value || '';
    var now = (document.getElementById('ask-now') || {}).value || '';
    return {
      subject: '[samsbench request] ' + (who.trim() || 'a tool idea').slice(0, 80),
      body: 'Who I am / my trade: ' + who.trim() + '\n\nThe job I still do by hand:\n' + job.trim() +
        '\n\nHow I do it now: ' + now + '\n\n(sent from samsbench.com/#ask)'
    };
  }
  function initAsk() {
    var form = document.getElementById('ask-form');
    if (!form) return;
    var msg = document.getElementById('ask-msg');
    function valid() {
      var job = document.getElementById('ask-job').value.trim();
      if (job.length < 10) { msg.textContent = 'Say a little about the job first (a sentence is plenty).'; msg.className = 'ask-msg bad'; document.getElementById('ask-job').focus(); return false; }
      return true;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!valid()) return;
      var t = askText();
      count('ask/email', 'ask for a tool: opened email');
      location.href = 'mailto:' + ASK_TO + '?subject=' + encodeURIComponent(t.subject) + '&body=' + encodeURIComponent(t.body);
      msg.textContent = 'Your email app should open with the note filled in. If nothing opened, use Copy the note and paste it into an email to ' + ASK_TO + '.';
      msg.className = 'ask-msg ok';
    });
    document.getElementById('ask-copy').addEventListener('click', function () {
      if (!valid()) return;
      var t = askText(), text = 'To: ' + ASK_TO + '\nSubject: ' + t.subject + '\n\n' + t.body;
      count('ask/copy', 'ask for a tool: copied');
      function done() { msg.textContent = 'Copied. Paste it into an email to ' + ASK_TO + '.'; msg.className = 'ask-msg ok'; }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
      function fallback() {
        var ta = el('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { msg.textContent = 'Could not copy. Select the text in the boxes and email it to ' + ASK_TO + '.'; msg.className = 'ask-msg bad'; }
        ta.remove();
      }
    });
  }

  /* ---------- Your bench (/my/) ---------- */
  function initMy() {
    var root = document.getElementById('bench');
    if (!root) return;
    var flash = document.getElementById('flash');
    function say(text, bad) { flash.textContent = text; flash.className = 'flash' + (bad ? ' bad' : ''); flash.hidden = false; }
    if (!ls()) {
      root.appendChild(el('p', { class: 'empty', text: 'This browser is not letting pages save anything (private window or blocked site data), so there is nothing to show. The tools still work; they just forget when you close the tab.' }));
      document.getElementById('backup').hidden = true;
      return;
    }
    function render() {
      root.innerHTML = '';
      var all = onDevice(), used = all.filter(function (d) { return d.used || d.pro; }), unused = all.filter(function (d) { return !(d.used || d.pro); });
      var head = document.getElementById('bench-count');
      head.textContent = used.length ? used.length + (used.length === 1 ? ' tool has' : ' tools have') + ' work saved in this browser' : 'Nothing saved in this browser yet';
      if (!used.length) {
        root.appendChild(el('p', { class: 'empty' }, ['When you use a tool, what you type is saved in this browser and shows up here. ',
          el('a', { href: '/' }, ['Pick a tool on the bench']), '.']));
      }
      used.forEach(function (d) {
        var t = d.tool;
        var row = el('li', { class: 'bench-row' }, [
          el('div', { class: 'bench-name' }, [
            el('h3', null, [el('a', { href: '/' + t.slug + '/?via=my' }, [t.name])]),
            el('p', { class: 'bench-meta', text: (d.used ? 'Work saved · ' + kb(d.bytes) : 'No work saved') + (d.pro ? '' : '') })
          ]),
          d.pro ? el('span', { class: 'stamp', text: 'PRO' }) : el('span', { class: 'stamp free', text: 'FREE' }),
          el('div', { class: 'bench-acts' }, [
            el('a', { class: 'btn', href: '/' + t.slug + '/?via=my' }, ['Open']),
            el('button', { class: 'btn ghost', type: 'button', 'data-clear': t.slug }, ['Clear'])
          ])
        ]);
        root.appendChild(row);
      });
      var rest = document.getElementById('rest');
      rest.innerHTML = '';
      unused.forEach(function (d) {
        rest.appendChild(el('li', null, [el('a', { href: '/' + d.tool.slug + '/?via=my' }, [d.tool.name]), ' — ' + d.tool.who]));
      });
      document.getElementById('rest-wrap').hidden = !unused.length;
      document.getElementById('dl').disabled = !used.length;
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-clear]');
      if (!b) return;
      var t = byslug[b.getAttribute('data-clear')];
      if (!confirm('Delete everything ' + t.name + ' saved in this browser' + (isPro(t) ? ', including Pro (you can unlock it again with the email you paid with)' : '') + '? A backup file you downloaded is not affected.')) return;
      keysOf(t).forEach(function (k) { try { ls().removeItem(k); } catch (x) {} });
      count('my/clear', 'your bench: cleared a tool');
      render();
      say(t.name + ' cleared from this browser.');
    });

    /* backup: one JSON file with every tool key */
    document.getElementById('dl').addEventListener('click', function () {
      var data = {}, n = 0;
      TOOLS.forEach(function (t) { keysOf(t).forEach(function (k) { try { data[k] = ls().getItem(k); n++; } catch (e) {} }); });
      var d = new Date(), stamp = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
      var file = { kind: 'samsbench-backup', version: 1, saved: d.toISOString(), keys: data };
      var blob = new Blob([JSON.stringify(file, null, 1)], { type: 'application/json' });
      var a = el('a', { href: URL.createObjectURL(blob), download: 'samsbench-backup-' + stamp + '.json' });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      count('my/backup', 'your bench: downloaded backup');
      say('Backup saved (' + n + ' items). Keep the file somewhere safe; open it here on any device to put everything back.');
    });

    var pending = null;
    var pick = document.getElementById('up');
    pick.addEventListener('change', function () {
      var f = pick.files && pick.files[0];
      pick.value = '';
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) { say('That file is too big to be a samsbench backup.', true); return; }
      var r = new FileReader();
      r.onload = function () {
        var j;
        try { j = JSON.parse(r.result); } catch (e) { say('That file is not a samsbench backup (it is not readable JSON).', true); return; }
        if (!j || j.kind !== 'samsbench-backup' || typeof j.keys !== 'object') { say('That file is not a samsbench backup.', true); return; }
        var ok = {}, per = {};
        Object.keys(j.keys).forEach(function (k) {
          var t = TOOLS.filter(function (x) { return k.indexOf(x.p + '.') === 0; })[0];
          if (!t || SKIP.test(k) || typeof j.keys[k] !== 'string') return;
          ok[k] = j.keys[k];
          if (t.data.indexOf(k) >= 0 || k === t.p + '.pro') per[t.name] = 1;   // name only tools with real work or Pro
        });
        var names = Object.keys(per);
        if (!names.length) { say('That backup has nothing in it for these tools.', true); return; }
        pending = ok;
        var when = j.saved ? new Date(j.saved) : null;
        document.getElementById('restore-what').textContent = 'Backup from ' + (when && !isNaN(when) ? when.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'an unknown date') +
          ' with work for ' + names.join(', ') + '. Putting it back replaces what these tools have saved in this browser now.';
        document.getElementById('restore').hidden = false;
        document.getElementById('restore-go').focus();
      };
      r.readAsText(f);
    });
    document.getElementById('restore-go').addEventListener('click', function () {
      if (!pending) return;
      var n = 0, fail = 0;
      Object.keys(pending).forEach(function (k) { try { ls().setItem(k, pending[k]); n++; } catch (e) { fail++; } });
      pending = null;
      document.getElementById('restore').hidden = true;
      count('my/restore', 'your bench: restored backup');
      render();
      say(fail ? 'Put back ' + n + ' items; ' + fail + ' did not fit (the browser is out of space).' : 'Done: everything from the backup is back in this browser.', !!fail);
    });
    document.getElementById('restore-no').addEventListener('click', function () { pending = null; document.getElementById('restore').hidden = true; });
    render();
  }

  var byslug = {};
  TOOLS.forEach(function (t) { byslug[t.slug] = t; });
  window.SB = { tools: TOOLS, trades: TRADES, onDevice: onDevice, count: count };
  /* 404: hang every tool as a tag, then let the finder filter them */
  function initList() {
    var ul = document.getElementById('tl');
    if (!ul) return;
    TOOLS.forEach(function (t) {
      ul.appendChild(el('li', { 'data-tool': t.slug }, [el('a', { href: '/' + t.slug + '/?via=404' }, [el('b', { text: t.name }), el('span', { text: t.who })])]));
    });
    count('404' + location.pathname.replace(/[^a-z0-9\/-]/gi, '').slice(0, 60), '404 ' + location.pathname.slice(0, 60));
  }
  function start() { initList(); initFinder(); initStrip(); initAsk(); initMy(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
