// SERPENTONI: la telecamera segue il proprio serpente su un fondo a esagoni; cibo che brilla, serpenti a strisce con
// gli occhi che guardano dove vanno, classifica in alto a destra e mappa piccola in basso a destra.
(() => {
  const { COLORI } = window.Arena;
  const { suono } = window.Nuovi;
  const COL_CIBO = ['#ff5a5a', '#ffb13a', '#ffe14a', '#7dff5a', '#4affd2', '#4aa8ff', '#9a6bff', '#ff6bd6', '#ffffff', '#ffd27a'];
  const larghezzaVista = (r) => Math.min(2000, 1000 + (r - 9) * 32);
  let cam = null, zoom = null, ultimaL = 0, sfondo = null;

  const colore = (ex, id) => (ex && ex.col && ex.col[id]) || COLORI[id % COLORI.length];
  const nomeDi = (ctx, ex, id) => (id === ctx.mio ? 'Tu' : ex && ex.nomi && ex.nomi[id] ? ex.nomi[id] : ctx.nome(id).slice(0, 10));
  function chiaro(hex, k) {
    const n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const f = (c) => Math.round(k > 0 ? c + (255 - c) * k : c * (1 + k));
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  }
  // il fondo a esagoni (una piastrella ripetuta)
  function piastrella() {
    const c = document.createElement('canvas'); c.width = 104; c.height = 120;
    const g = c.getContext('2d');
    g.fillStyle = '#161c2c'; g.fillRect(0, 0, 104, 120);
    g.strokeStyle = 'rgba(80,110,160,.22)'; g.lineWidth = 3;
    const esa = (x, y, r) => { g.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + (k * Math.PI) / 3; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); g.stroke(); };
    for (const [x, y] of [[0, 0], [104, 0], [52, 30], [0, 60], [104, 60], [52, 90], [0, 120], [104, 120]]) esa(x, y, 32);
    return c;
  }

  function serpente(g, s, ex, ctx, k, cx, cy, t, hx, hy, px) {
    const col = colore(ex, s.id), r = s.r;
    const X = (x) => (x - cx) * k + 500, Y = (y) => (y - cy) * k + 500;
    const pt = s.p;
    // dalla coda alla testa: tanti cerchi, a strisce
    if (s.t) { g.save(); g.shadowColor = col; g.shadowBlur = 18; }
    const scuro = chiaro(col, -0.25), luce = chiaro(col, 0.25);
    let idx = 0;
    const pezzi = [];
    for (let j = 0; j < pt.length; j += 2) { if (pt[j] === null) { j--; continue; } pezzi.push([pt[j], pt[j + 1], idx++]); }
    for (let n = pezzi.length - 1; n >= 0; n--) {
      const [x, y, q] = pezzi[n];
      g.fillStyle = Math.floor(q / 3) % 2 ? scuro : col;
      g.beginPath(); g.arc(X(x), Y(y), r * k, 0, Math.PI * 2); g.fill();
    }
    if (s.t) g.restore();
    // collo fino alla testa interpolata e la testa
    const tx = X(hx), ty = Y(hy);
    if (pezzi.length) { g.strokeStyle = col; g.lineWidth = r * 2 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(X(pezzi[0][0]), Y(pezzi[0][1])); g.lineTo(tx, ty); g.stroke(); }
    g.fillStyle = col; g.beginPath(); g.arc(tx, ty, r * 1.08 * k, 0, Math.PI * 2); g.fill();
    g.fillStyle = luce; g.beginPath(); g.arc(tx - Math.cos(s.a) * r * 0.2 * k, ty - Math.sin(s.a) * r * 0.2 * k, r * 0.55 * k, 0, Math.PI * 2); g.fill();
    for (const lato of [-1, 1]) {
      const ax = tx + (Math.cos(s.a) * 0.35 + Math.cos(s.a + Math.PI / 2) * 0.48 * lato) * r * k;
      const ay = ty + (Math.sin(s.a) * 0.35 + Math.sin(s.a + Math.PI / 2) * 0.48 * lato) * r * k;
      g.fillStyle = '#fff'; g.beginPath(); g.arc(ax, ay, r * 0.38 * k, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#111'; g.beginPath(); g.arc(ax + Math.cos(s.a) * r * 0.14 * k, ay + Math.sin(s.a) * r * 0.14 * k, r * 0.2 * k, 0, Math.PI * 2); g.fill();
    }
    const io = s.id === ctx.mio;
    g.font = `700 ${Math.round((io ? 12 : 11) * px)}px system-ui, sans-serif`; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.75)';
    const nome = nomeDi(ctx, ex, s.id);
    g.strokeText(nome, tx, ty - r * k - 14); g.fillStyle = io ? '#fff' : chiaro(col, 0.4); g.fillText(nome, tx, ty - r * k - 14);
  }

  const tavolo = window.Arena.tavolo({
    id: 'slither',
    mouse: 'bersaglio',
    nomeAzione: '🚀 Turbo',
    obiettivo: 'lunghezza',
    istruzioni: () => (window.Arena.touch() ? 'Tocca il campo (o usa il joystick) per girare, tieni premuto 🚀 per accelerare.' : 'Il serpente va verso il mouse (o frecce/WASD); tieni premuto il tasto del mouse o lo spazio per accelerare.') + ' Fai sbattere gli altri contro il tuo corpo!',
    statoGioco: (ctx, s) => { const io = s.s.io; return !io ? '' : io[0] ? `Lunghezza ${io[3]}` : `Rinasci tra ${io[4]}…`; },
    hud: (ctx, s) => {
      const io = s.s.io; if (!io) return '';
      const m = Math.floor(s.s.resta / 60), sec = String(s.s.resta % 60).padStart(2, '0');
      const pos = s.s.cl.findIndex((c) => c[0] === ctx.mio);
      const mio = (s.s.s || []).find((x) => x.id === ctx.mio);
      return `${mio && mio.t ? '<span>🚀 Turbo!</span>' : ''}<span>🐍 ${io[0] ? io[3] : '—'}</span>${pos >= 0 ? `<span>🏅 ${pos + 1}°</span>` : ''}<span>💥 ${io[5]}</span><span>⏱️ ${m}:${sec}</span>`;
    },
    fineRound: (p, s, ctx) => `La tua lunghezza: ${p.punti[ctx.mio]}`,
    dopoTick(ctx, d, prima) {
      const io = d.s && d.s.io, pr = prima && prima.s && prima.s.io;
      if (!io || !pr) return;
      if (pr[0] && !io[0]) suono([[300, 0.1], [180, 0.15], [90, 0.35]], { volume: 0.09 });
      if (io[0] && io[3] > ultimaL + 3) { suono([[880 + Math.random() * 200, 0.03]], { volume: 0.02 }); ultimaL = io[3]; }
      if (io[3] < ultimaL) ultimaL = io[3];
    },
    disegna(g, p, s, prima, u, ctx) {
      const ex = p.extra, st = s.s; if (!ex || !st || !st.io) return;
      const io = st.io, mio = st.s.find((x) => x.id === ctx.mio);
      const pm = prima && prima.s && prima.s.s ? new Map(prima.s.s.map((x) => [x.id, x])) : new Map();
      const testa = (x) => { const a = pm.get(x.id); return a && Math.hypot(a.x - x.x, a.y - x.y) < 120 ? [a.x + (x.x - a.x) * u, a.y + (x.y - a.y) * u] : [x.x, x.y]; };
      // telecamera: segue la testa (morbida) e si allontana quando si cresce
      const [tx, ty] = mio ? testa(mio) : [io[1], io[2]];
      if (!cam || Math.hypot(cam[0] - tx, cam[1] - ty) > 600) cam = [tx, ty]; else { cam[0] += (tx - cam[0]) * 0.5; cam[1] += (ty - cam[1]) * 0.5; }
      // px: quante unità del campo fanno un pixel dello schermo (per scritte sempre leggibili); sul telefono si
      // guarda un po' più da vicino
      const sc = (g.canvas.clientWidth || 1000) / 1000, px = 1 / Math.max(0.3, sc);
      const zv = (1000 / larghezzaVista(mio ? mio.r : 12)) * (sc < 0.5 ? 1.25 : 1);
      zoom = zoom === null ? zv : zoom + (zv - zoom) * 0.05;
      const k = zoom, [cx, cy] = cam, t = performance.now() / 1000;
      // fondo che scorre
      if (!sfondo) sfondo = g.createPattern(piastrella(), 'repeat');
      g.save(); g.translate(500 - cx * k, 500 - cy * k); g.scale(k, k);
      g.fillStyle = sfondo; g.fillRect(cx - 500 / k - 10, cy - 500 / k - 10, 1000 / k + 20, 1000 / k + 20);
      // fuori dall'arena: scuro, con il bordo rosso
      g.fillStyle = 'rgba(40,0,10,.75)'; g.beginPath(); g.rect(cx - 600 / k, cy - 600 / k, 1200 / k, 1200 / k); g.arc(0, 0, ex.R, 0, Math.PI * 2, true); g.fill();
      g.strokeStyle = '#ff3b4e'; g.lineWidth = 10 / k + 4; g.beginPath(); g.arc(0, 0, ex.R, 0, Math.PI * 2); g.stroke();
      g.restore();
      // cibo
      const f = st.f;
      for (let j = 0; j < f.length; j += 3) {
        const v = Math.floor(f[j + 2] / 10), c = f[j + 2] % 10;
        const x = (f[j] - cx) * k + 500, y = (f[j + 1] - cy) * k + 500;
        if (x < -20 || y < -20 || x > 1020 || y > 1020) continue;
        const rr = (3 + Math.sqrt(v) * 1.6) * k * (1 + 0.12 * Math.sin(t * 4 + f[j]));
        g.fillStyle = COL_CIBO[c] || '#fff'; g.globalAlpha = 0.3; g.beginPath(); g.arc(x, y, rr * 2.1, 0, Math.PI * 2); g.fill();
        g.globalAlpha = 1; g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.fill();
      }
      // serpenti: prima gli altri, poi il mio sopra
      const ordine = st.s.slice().sort((a, b) => (a.id === ctx.mio) - (b.id === ctx.mio) || a.r - b.r);
      for (const x of ordine) { const [hx, hy] = testa(x); serpente(g, x, ex, ctx, k, cx, cy, t, hx, hy, px); }
      // classifica (in alto a destra)
      g.save();
      const fs = 11 * px, riga = fs * 1.45, larg = fs * 11, x0 = 1000 - larg - 8;
      g.fillStyle = 'rgba(10,14,26,.6)'; g.fillRect(x0, 8, larg, riga * (st.cl.length + 1) + fs * 0.6);
      g.font = `700 ${fs}px system-ui, sans-serif`; g.textAlign = 'left'; g.fillStyle = '#ffd76a'; g.fillText('🏆 I più lunghi', x0 + fs * 0.5, 8 + riga);
      st.cl.forEach(([id, l], n) => {
        g.font = `${id === ctx.mio ? 800 : 600} ${fs}px system-ui, sans-serif`;
        g.fillStyle = colore(ex, id); g.textAlign = 'left'; g.fillText(`${n + 1}. ${nomeDi(ctx, ex, id)}`, x0 + fs * 0.5, 8 + riga * (n + 2));
        g.textAlign = 'right'; g.fillStyle = '#fff'; g.fillText(String(l), 1000 - 8 - fs * 0.5, 8 + riga * (n + 2));
      });
      // mappa piccola (in basso a destra)
      const MR = Math.min(120, 34 * px), mx = 1000 - MR - 12, my = 1000 - MR - 12, ks = (MR / ex.R) * 20;
      g.fillStyle = 'rgba(10,14,26,.6)'; g.beginPath(); g.arc(mx, my, MR, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(255,90,100,.7)'; g.lineWidth = 2; g.stroke();
      for (const [id, x, y] of st.mm) { g.fillStyle = id === ctx.mio ? '#fff' : colore(ex, id); g.beginPath(); g.arc(mx + x * ks, my + y * ks, (id === ctx.mio ? 3 : 2.2) * px, 0, Math.PI * 2); g.fill(); }
      g.restore();
      if (!io[0]) {
        g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 500 - 22 * px, 1000, 44 * px);
        g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `700 ${Math.round(20 * px)}px system-ui, sans-serif`; g.fillText(`💥 Rinasci tra ${io[4]}…`, 500, 500); g.textBaseline = 'alphabetic';
      }
    },
  });
  const reset0 = tavolo.reset;
  tavolo.reset = (ctx) => { if (ctx.partita && ctx.partita.stato && ctx.partita.stato.fase === 'via') { cam = null; zoom = null; } reset0.call(tavolo, ctx); };
  Object.assign(window.Tavoli, { slither: tavolo });
})();
