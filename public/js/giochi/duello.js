// DUELLO SULLE PIATTAFORME: quattro mappe, ognuna col suo cielo e le sue piattaforme (isole d'erba al tramonto, torri
// di pietra di notte, nuvole nel cielo azzurro, rocce del vulcano con la lava che sale), personaggi con i cuori sopra la
// testa, oggetti disegnati (bomba, palla di neve, martello, cuore, scudo, e gli esclusivi molla, gancio, ali, pietra lavica).
(() => {
  const { COLORI, lerp, omino } = window.Arena;
  let botti = [], colpi = [];
  const sfondi = {};
  const NOMI_OGG = { bomba: 'bomba', neve: 'palla di neve', gancio: 'gancio', pietra: 'pietra lavica' };
  function icona(g, tipo, x, y, s = 1) {
    g.save(); g.translate(x, y); g.scale(s, s);
    if (tipo === 'bomba') { g.fillStyle = '#23262e'; g.beginPath(); g.arc(0, 2, 10, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(-3, -1, 3, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#8a6a3a'; g.lineWidth = 2; g.beginPath(); g.moveTo(5, -6); g.quadraticCurveTo(9, -12, 13, -11); g.stroke(); g.fillStyle = '#ffb02a'; g.beginPath(); g.arc(13, -11, 2.6 + Math.random(), 0, Math.PI * 2); g.fill(); }
    else if (tipo === 'neve') { g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 9, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#b8d8ec'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 6, 0.4, 2); g.stroke(); }
    else if (tipo === 'martello') { g.rotate(-0.5); g.fillStyle = '#8a5a30'; g.fillRect(-2, -4, 4, 20); g.fillStyle = '#9aa3b0'; g.fillRect(-10, -12, 20, 10); g.fillStyle = '#c8d0dc'; g.fillRect(-10, -12, 20, 3); }
    else if (tipo === 'cuore') { g.fillStyle = '#e8322a'; g.beginPath(); g.moveTo(0, 9); g.bezierCurveTo(-14, -2, -8, -12, 0, -5); g.bezierCurveTo(8, -12, 14, -2, 0, 9); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(-4, -4, 2, 0, Math.PI * 2); g.fill(); }
    else if (tipo === 'molla') { g.strokeStyle = '#9aa3b0'; g.lineWidth = 3; g.beginPath(); for (let k = 0; k <= 6; k++) g.lineTo(k % 2 ? 7 : -7, 9 - k * 3); g.stroke(); g.fillStyle = '#e8322a'; g.fillRect(-10, -11, 20, 4); g.fillRect(-10, 9, 20, 4); }
    else if (tipo === 'gancio') { g.strokeStyle = '#6b7482'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -12); g.lineTo(0, 4); g.arc(-5, 4, 5, 0, Math.PI * 0.9); g.stroke(); g.fillStyle = '#c8d0dc'; g.beginPath(); g.moveTo(-10, 5); g.lineTo(-13, -1); g.lineTo(-7, 2); g.fill(); g.fillStyle = '#8a5a30'; g.fillRect(-3, -14, 6, 4); }
    else if (tipo === 'ali') { g.fillStyle = '#fff'; for (const s2 of [-1, 1]) { g.beginPath(); g.moveTo(0, 2); g.quadraticCurveTo(s2 * 16, -14, s2 * 14, 6); g.quadraticCurveTo(s2 * 8, 2, 0, 2); g.fill(); } g.strokeStyle = '#b8d8ec'; g.lineWidth = 1.2; g.stroke(); g.fillStyle = '#f2c230'; g.beginPath(); g.arc(0, 3, 3, 0, Math.PI * 2); g.fill(); }
    else if (tipo === 'pietra') { g.fillStyle = '#3a2a24'; g.beginPath(); g.moveTo(-9, 4); g.lineTo(-6, -7); g.lineTo(5, -9); g.lineTo(10, 1); g.lineTo(3, 9); g.closePath(); g.fill(); g.strokeStyle = '#ff7a1a'; g.lineWidth = 2; g.beginPath(); g.moveTo(-5, -2); g.lineTo(0, 1); g.lineTo(5, -4); g.moveTo(0, 1); g.lineTo(2, 6); g.stroke(); }
    else if (tipo === 'scudo') { g.fillStyle = '#2f6fd8'; g.beginPath(); g.moveTo(0, -11); g.lineTo(10, -7); g.lineTo(8, 5); g.lineTo(0, 11); g.lineTo(-8, 5); g.lineTo(-10, -7); g.closePath(); g.fill(); g.strokeStyle = '#f2c230'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#f2c230'; g.fillRect(-1.5, -6, 3, 12); }
    g.restore();
  }
  // il cielo di ogni mappa (disegnato una volta sola)
  function cielo(W, H, mappa) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const col = { isole: ['#3b5fa8', '#e89a6a', '#f6c77a'], torri: ['#0e1430', '#27305a', '#4a3f6b'], nuvole: ['#5aa9e6', '#9ed2f5', '#e3f4ff'], vulcano: ['#2a0e0e', '#6b1e12', '#c2461a'] }[mappa] || ['#3b5fa8', '#e89a6a', '#f6c77a'];
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, col[0]); gr.addColorStop(0.55, col[1]); gr.addColorStop(1, col[2]);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (mappa === 'torri') {
      g.fillStyle = 'rgba(255,255,255,.7)'; for (let k = 0; k < 70; k++) g.fillRect((k * 137) % W, (k * 53) % (H * 0.6), 1.5, 1.5);
      g.fillStyle = '#f4efd8'; g.beginPath(); g.arc(W * 0.8, 90, 36, 0, Math.PI * 2); g.fill();
      // castello lontano
      g.fillStyle = 'rgba(20,20,45,.8)'; for (const [x, h] of [[60, 260], [180, 200], [820, 280], [930, 210]]) { g.fillRect(x, H - h, 60, h); for (let k = 0; k < 3; k++) g.fillRect(x + k * 24, H - h - 14, 12, 14); }
    } else if (mappa === 'vulcano') {
      g.fillStyle = '#1c0a08'; g.beginPath(); g.moveTo(250, H); g.lineTo(440, 170); g.lineTo(560, 170); g.lineTo(750, H); g.fill();
      g.fillStyle = 'rgba(255,120,30,.8)'; g.beginPath(); g.moveTo(440, 170); g.lineTo(470, 230); g.lineTo(500, 190); g.lineTo(530, 240); g.lineTo(560, 170); g.fill();
      g.fillStyle = 'rgba(60,40,40,.5)'; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(470 + k * 14, 140 - k * 22, 18 + k * 5, 0, Math.PI * 2); g.fill(); }
    } else if (mappa === 'nuvole') {
      g.fillStyle = 'rgba(255,255,255,.6)'; for (let k = 0; k < 6; k++) { const cx = (k * 190) % W, cy = 420 + (k % 3) * 60; g.beginPath(); g.arc(cx, cy, 50, 0, Math.PI * 2); g.arc(cx + 60, cy - 20, 60, 0, Math.PI * 2); g.arc(cx + 120, cy, 45, 0, Math.PI * 2); g.fill(); }
    } else {
      g.fillStyle = 'rgba(255,240,200,.9)'; g.beginPath(); g.arc(W * 0.78, H * 0.62, 55, 0, Math.PI * 2); g.fill();
      // montagne lontane
      g.fillStyle = 'rgba(90,60,110,.45)'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 50) g.lineTo(x, H - 90 - Math.abs(Math.sin(x / 130)) * 90); g.lineTo(W, H); g.fill();
      g.fillStyle = 'rgba(70,45,90,.55)'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 40) g.lineTo(x, H - 40 - Math.abs(Math.sin(x / 90 + 1)) * 60); g.lineTo(W, H); g.fill();
    }
    return c;
  }
  // piattaforme a tema: torri di pietra, nuvole, rocce del vulcano (le isole d'erba sono sotto)
  function piattaforma(g, mappa, x0, x1, y, base, crolla, t) {
    if (x1 - x0 < 4) return;
    const l = x1 - x0;
    if (mappa === 'torri') {
      if (base) { g.fillStyle = '#4a4e5c'; g.fillRect(x0 + l * 0.15, y + 12, l * 0.7, 700); }
      g.fillStyle = '#7b8090'; g.fillRect(x0, y, l, 16); g.fillStyle = '#5f6474';
      for (let x = x0; x < x1; x += 22) g.fillRect(x, y + 7, 1.5, 9); g.fillRect(x0, y + 7, l, 1.5);
      g.fillStyle = '#9aa0b0'; for (let x = x0; x < x1 - 8; x += 20) g.fillRect(x + 2, y - 8, 10, 8);
      g.fillStyle = '#f2c230'; if (base) for (let k = 1; k < 3; k++) g.fillRect(x0 + l * 0.15 + k * l * 0.22, y + 60, 8, 12);
    } else if (mappa === 'nuvole') {
      g.fillStyle = base ? '#f4f8ff' : '#ffffff';
      g.beginPath(); for (let x = x0 + 10; x <= x1 - 10; x += 22) g.arc(x, y + 6, 16, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(160,190,230,.5)'; g.fillRect(x0 + 4, y + 14, l - 8, 6);
    } else if (mappa === 'vulcano') {
      g.fillStyle = '#2b2220'; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.lineTo(x1 - l * 0.1, y + (base ? 90 : 34)); g.lineTo(x0 + l * 0.2, y + (base ? 110 : 42)); g.closePath(); g.fill();
      g.fillStyle = '#4a3a34'; g.fillRect(x0, y, l, 8);
      g.strokeStyle = `rgba(255,${110 + Math.round(40 * Math.sin(t * 3))},30,.8)`; g.lineWidth = 2; g.beginPath();
      for (let x = x0 + 12; x < x1 - 12; x += 38) { g.moveTo(x, y + 10); g.lineTo(x + 8, y + 20); g.lineTo(x + 3, y + 28); } g.stroke();
    } else return isola(g, x0, x1, y, crolla);
    if (crolla) { g.fillStyle = 'rgba(80,70,60,.8)'; for (let k = 0; k < 3; k++) { const a = (performance.now() / 300 + k) % 1; g.fillRect(x0 + 4, y + 10 + a * 50, 5, 5); g.fillRect(x1 - 9, y + 14 + ((a + 0.5) % 1) * 50, 5, 5); } }
  }
  function isola(g, x0, x1, y, crolla) {
    if (x1 - x0 < 4) return;
    const l = x1 - x0;
    // roccia sotto, a punta
    g.fillStyle = '#6b5a4a'; g.beginPath(); g.moveTo(x0, y + 6); g.lineTo(x1, y + 6);
    g.lineTo(x1 - l * 0.15, y + 40); g.lineTo(x0 + l * 0.62, y + 70 + l * 0.12); g.lineTo(x0 + l * 0.35, y + 52); g.lineTo(x0 + l * 0.12, y + 34); g.closePath(); g.fill();
    g.fillStyle = '#54463a'; g.beginPath(); g.moveTo(x0 + l * 0.5, y + 6); g.lineTo(x1 - l * 0.15, y + 40); g.lineTo(x0 + l * 0.62, y + 70 + l * 0.12); g.closePath(); g.fill();
    // terra ed erba
    g.fillStyle = '#7a5230'; g.fillRect(x0, y, l, 12);
    g.fillStyle = '#4fb05a'; g.beginPath(); g.moveTo(x0 - 4, y + 2); for (let x = x0 - 4; x <= x1 + 4; x += 8) g.lineTo(x, y - 4 - ((x * 7) % 5)); g.lineTo(x1 + 4, y + 6); g.lineTo(x0 - 4, y + 6); g.fill();
    g.fillStyle = '#3c9447'; g.fillRect(x0 - 2, y + 3, l + 4, 4);
    if (crolla) { g.fillStyle = '#6b5a4a'; for (let k = 0; k < 4; k++) { const a = (performance.now() / 300 + k) % 1; g.fillRect(x0 + 4 + (k % 2) * (l - 12), y + 10 + a * 60, 6, 6); g.fillRect(x1 - 10 - (k % 2) * (l - 12), y + 14 + ((a + 0.5) % 1) * 60, 5, 5); } }
  }
  const tavolo = window.Arena.tavolo({
    id: 'duello',
    nomeAzione: '💥 Usa',
    obiettivo: 'punti',
    istruzioni: () => 'A e D (o frecce) per muoverti, W per saltare (anche un secondo salto in aria), spazio per usare l\'oggetto. Non cadere nel vuoto!',
    statoGioco: (ctx, s) => { const e = s.s.e[ctx.mio]; return !e ? '' : e.f ? 'Fuori: guarda gli altri' : e.r ? 'Ricompari…' : e.o ? `Hai: ${e.o === 'martello' ? `martello (${e.u})` : NOMI_OGG[e.o]}` : e.al ? 'Hai le ali: tieni su per volare!' : e.ml ? 'Hai la molla: salti altissimo!' : 'Raccogli un oggetto!'; },
    sottotitolo: (p) => { const s = p.stato && p.stato.s; return s && s.m && p.extra && p.extra.mappe ? p.extra.mappe[s.m] : ''; },
    hud: (ctx, s) => { const e = s.s.e[ctx.mio]; return e ? `<span>${'❤️'.repeat(Math.max(0, e.c))}${'🖤'.repeat(Math.max(0, 3 - e.c))}</span><span>🧍 in gara: ${s.s.e.filter((x) => !x.f).length}</span>${s.t > 60 ? '<span style="color:#ff8a80">⚠️ le piattaforme crollano!</span>' : s.s.lv !== null && s.s.lv !== undefined && s.s.lv < 620 ? '<span style="color:#ffb074">🌋 la lava sale!</span>' : ''}` : ''; },
    fineRound: (p, s, ctx) => `Punti totali: ${p.punti[ctx.mio]}`,
    dopoTick(ctx, d, prima) {
      for (const b of d.s.b || []) { botti.push({ ...b, t: performance.now() }); window.Nuovi.suono(b.tipo === 'bomba' ? [[90, 0.08], [60, 0.25]] : [[700, 0.05]], { tipo: b.tipo === 'bomba' ? 'sawtooth' : 'triangle', volume: 0.07 }); }
      for (const c of d.s.cl || []) { colpi.push({ ...c, t: performance.now() }); window.Nuovi.suono([[160, 0.07]], { tipo: 'square', volume: 0.06 }); }
      const a = prima && prima.s.e[ctx.mio], b = d.s.e[ctx.mio];
      if (a && b && b.colpo > a.colpo) window.Nuovi.suono([[260, 0.08], [180, 0.15]], { volume: 0.07 });
    },
    disegna(g, p, s, prima, u, ctx) {
      const W = p.W, H = p.H, x = s.s, ora = performance.now(), t = s.t;
      const mappa = x.m || 'isole';
      if (!sfondi[mappa]) sfondi[mappa] = cielo(W, H, mappa);
      g.drawImage(sfondi[mappa], 0, 0);
      // nuvole (o fumo) che scorrono
      g.fillStyle = mappa === 'vulcano' ? 'rgba(60,40,40,.35)' : mappa === 'torri' ? 'rgba(200,200,255,.08)' : 'rgba(255,255,255,.55)';
      for (let k = 0; k < 5; k++) { const cx = ((k * 260 + t * (12 + k * 4)) % (W + 200)) - 100, cy = 60 + k * 45; g.beginPath(); g.arc(cx, cy, 22, 0, Math.PI * 2); g.arc(cx + 24, cy - 8, 26, 0, Math.PI * 2); g.arc(cx + 50, cy, 20, 0, Math.PI * 2); g.fill(); }
      const is = x.is || (p.extra ? p.extra.isole.map((q) => [q.x0, q.x1, q.y, 1]) : []);
      const isP = prima && prima.s.is && prima.s.is.length === is.length ? prima.s.is : null;
      is.forEach((q, k) => { let [a, b, y, base] = q; if (a < -500) return; if (isP && isP[k][0] > -500) { a = isP[k][0] + (a - isP[k][0]) * u; b = isP[k][1] + (b - isP[k][1]) * u; } piattaforma(g, mappa, a, b, y, base, t > 60, t); });
      // pozze di pietra lavica
      for (const [zx, zy, zr, resta] of x.pz || []) { g.globalAlpha = Math.min(1, resta / 1.5); const gl = g.createRadialGradient(zx, zy, 4, zx, zy, zr); gl.addColorStop(0, '#ffe07a'); gl.addColorStop(0.5, '#ff7a1a'); gl.addColorStop(1, 'rgba(160,30,10,.2)'); g.fillStyle = gl; g.beginPath(); g.ellipse(zx, zy - 2, zr, 7, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
      // la lava che sale (Vulcano)
      if (x.lv !== null && x.lv !== undefined && x.lv < H + 20) {
        const ly = x.lv; const gl = g.createLinearGradient(0, ly, 0, H); gl.addColorStop(0, '#ffb13b'); gl.addColorStop(0.2, '#ff5a14'); gl.addColorStop(1, '#8a1406');
        g.fillStyle = gl; g.beginPath(); g.moveTo(0, H); for (let xx = 0; xx <= W; xx += 20) g.lineTo(xx, ly + Math.sin(xx / 40 + t * 3) * 5); g.lineTo(W, H); g.fill();
        g.fillStyle = 'rgba(255,230,120,.8)'; for (let k = 0; k < 8; k++) { const bx = (k * 131 + t * 40) % W, by = ly + 12 + ((k * 17 + t * 30) % 30); g.beginPath(); g.arc(bx, by, 3, 0, Math.PI * 2); g.fill(); }
      }
      // oggetti a terra che galleggiano un po', con un alone
      for (const o of x.o) { const b = Math.sin(t * 4 + o.id) * 3; const gl = g.createRadialGradient(o.x, o.y + b, 2, o.x, o.y + b, 22); gl.addColorStop(0, 'rgba(255,255,220,.8)'); gl.addColorStop(1, 'rgba(255,255,220,0)'); g.fillStyle = gl; g.beginPath(); g.arc(o.x, o.y + b, 22, 0, Math.PI * 2); g.fill(); icona(g, o.t, o.x, o.y + b, 1.1); }
      for (const q of x.p) { if (q.t === 'gancio') { g.save(); g.translate(q.x, q.y); g.rotate(q.d > 0 ? Math.PI / 2 : -Math.PI / 2); icona(g, 'gancio', 0, 0, 1); g.restore(); } else icona(g, q.t, q.x, q.y, 1); }
      // i giocatori
      const ee = lerp(prima && prima.s.e, x.e, u);
      ee.forEach((e, i) => {
        if (e.f || e.r) return;
        const lampeggia = e.im && Math.floor(t * 12) % 2;
        g.save(); g.globalAlpha = lampeggia ? 0.4 : 1;
        omino(g, e.x, e.y + 4, 16, COLORI[i % COLORI.length], i === ctx.mio ? 'Tu' : ctx.nome(i).slice(0, 10), { io: i === ctx.mio, stordito: e.st });
        // piedi che camminano
        g.fillStyle = '#2a2d35'; const passo = e.t ? Math.sin(t * 14 + i) * 3 : 0; g.fillRect(e.x - 9 + passo, e.y + 16, 7, 4); g.fillRect(e.x + 2 - passo, e.y + 16, 7, 4);
        g.restore();
        // cuori sopra la testa
        for (let k = 0; k < 3; k++) { g.globalAlpha = k < e.c ? 1 : 0.25; icona(g, 'cuore', e.x - 14 + k * 14, e.y - 40, 0.55); } g.globalAlpha = 1;
        if (e.o) icona(g, e.o, e.x + e.d * 20, e.y, 0.9);
        if (e.al) { g.fillStyle = 'rgba(255,255,255,.9)'; const ba = Math.sin(t * 16) * 6; for (const s2 of [-1, 1]) { g.beginPath(); g.moveTo(e.x, e.y - 4); g.quadraticCurveTo(e.x + s2 * 30, e.y - 26 - ba, e.x + s2 * 26, e.y + 2); g.quadraticCurveTo(e.x + s2 * 12, e.y - 2, e.x, e.y - 4); g.fill(); } }
        if (e.ml) { g.strokeStyle = '#c8d0dc'; g.lineWidth = 2; g.beginPath(); for (let k = 0; k <= 4; k++) g.lineTo(e.x + (k % 2 ? 6 : -6), e.y + 20 + k * 2.5); g.stroke(); }
        if (e.sc) { g.strokeStyle = `rgba(90,160,255,${0.6 + 0.3 * Math.sin(t * 6)})`; g.lineWidth = 3; g.beginPath(); g.arc(e.x, e.y + 2, 26, 0, Math.PI * 2); g.stroke(); }
      });
      // martellate: un arco davanti
      colpi = colpi.filter((c) => ora - c.t < 250);
      for (const c of colpi) { const a = (ora - c.t) / 250; g.strokeStyle = `rgba(255,255,255,${1 - a})`; g.lineWidth = 6; g.beginPath(); g.arc(c.x, c.y, 46, c.d > 0 ? -1.2 + a : Math.PI + 1.2 - a, c.d > 0 ? 0.4 + a : Math.PI - 0.4 - a, c.d < 0); g.stroke(); }
      // esplosioni e sbuffi di neve
      botti = botti.filter((b) => ora - b.t < 500);
      for (const b of botti) {
        const a = (ora - b.t) / 500;
        if (b.tipo === 'pietra') { g.fillStyle = `rgba(255,${120 + Math.round(80 * (1 - a))},30,${1 - a})`; for (let k = 0; k < 8; k++) { g.beginPath(); g.arc(b.x + Math.cos(k) * a * 34, b.y - Math.abs(Math.sin(k)) * a * 30, 4, 0, Math.PI * 2); g.fill(); } }
        else if (b.tipo === 'gancio') { g.strokeStyle = `rgba(220,230,255,${1 - a})`; g.lineWidth = 3; g.beginPath(); g.arc(b.x, b.y, 10 + a * 24, 0, Math.PI * 2); g.stroke(); }
        else if (b.tipo === 'bomba') { const gl = g.createRadialGradient(b.x, b.y, 4, b.x, b.y, 20 + a * 80); gl.addColorStop(0, `rgba(255,240,150,${1 - a})`); gl.addColorStop(0.5, `rgba(255,120,30,${0.8 * (1 - a)})`); gl.addColorStop(1, 'rgba(120,40,10,0)'); g.fillStyle = gl; g.beginPath(); g.arc(b.x, b.y, 20 + a * 80, 0, Math.PI * 2); g.fill(); }
        else { g.fillStyle = `rgba(255,255,255,${1 - a})`; for (let k = 0; k < 7; k++) { g.beginPath(); g.arc(b.x + Math.cos(k) * a * 30, b.y + Math.sin(k) * a * 30, 4, 0, Math.PI * 2); g.fill(); } }
      }
    },
  });
  Object.assign(window.Tavoli, { duello: tavolo });
})();
