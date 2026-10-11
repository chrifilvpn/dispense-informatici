// CALCIO BALILLA: il tavolo visto dall'alto in verticale, panno verde con le righe, stecche cromate con le
// manopole, omini blu e rossi che ruotano quando si tira, pallina bianca. Chi gioca in alto vede il tavolo girato:
// la propria porta è sempre in basso.
(() => {
  const { suono } = window.Nuovi;
  const COL = [{ maglia: '#2f6fd8', scuro: '#1d4a99', nome: 'blu' }, { maglia: '#e0402f', scuro: '#9c2516', nome: 'rossa' }];
  let colpi = [];

  function tavoloDisegnato(g, W, H, ex) {
    // bordo di legno e panno
    g.fillStyle = '#6b4325'; g.fillRect(0, 0, W, H);
    const pan = g.createLinearGradient(0, 0, W, 0); pan.addColorStop(0, '#2c8a43'); pan.addColorStop(0.5, '#35a050'); pan.addColorStop(1, '#2c8a43');
    g.fillStyle = pan; g.fillRect(6, 6, W - 12, H - 12);
    g.fillStyle = 'rgba(255,255,255,.05)'; for (let y = 0; y < H; y += 100) g.fillRect(6, y, W - 12, 50);
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 3;
    g.strokeRect(14, 14, W - 28, H - 28);
    g.beginPath(); g.moveTo(14, H / 2); g.lineTo(W - 14, H / 2); g.stroke();
    g.beginPath(); g.arc(W / 2, H / 2, 70, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(W / 2, H / 2, 4, 0, Math.PI * 2); g.fill();
    for (const y of [14, H - 14]) { const s = y < H / 2 ? 1 : -1; g.strokeRect(W / 2 - 150, y, 300, s * 110); g.strokeRect(W / 2 - 80, y, 160, s * 45); }
    // porte
    for (const [y, sq] of [[0, 1], [H, 0]]) {
      g.fillStyle = '#1b1d22'; g.fillRect(W / 2 - ex.PORTA / 2, y === 0 ? -2 : H - 8, ex.PORTA, 10);
      g.fillStyle = COL[sq].maglia; g.fillRect(W / 2 - ex.PORTA / 2 - 8, y === 0 ? 0 : H - 8, 8, 8); g.fillRect(W / 2 + ex.PORTA / 2, y === 0 ? 0 : H - 8, 8, 8);
    }
  }
  function omino(g, x, y, col, dir, tiro, mio) {
    // tiro: 1 appena calciato → 0; i piedi vanno avanti (verso dir) e tornano
    const k = tiro > 0 ? Math.sin((1 - tiro) * Math.PI) : 0;
    g.save(); g.translate(x, y);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(4, 5, 15, 9, 0, 0, Math.PI * 2); g.fill();
    // gambe e piedi (si allungano nel tiro)
    g.fillStyle = '#222'; g.fillRect(-7, 0, 5, dir * (10 + k * 14)); g.fillRect(2, 0, 5, dir * (10 + k * 14));
    g.fillStyle = '#111'; g.fillRect(-8, dir * (10 + k * 14) - (dir < 0 ? 4 : 0), 7, 4); g.fillRect(1, dir * (10 + k * 14) - (dir < 0 ? 4 : 0), 7, 4);
    // spalle (maglia) e testa
    g.fillStyle = col.maglia; g.beginPath(); g.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = col.scuro; g.fillRect(-15, -1.5, 30, 3);
    if (mio) { g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, 16, 9, 0, 0, Math.PI * 2); g.stroke(); }
    g.fillStyle = '#f2c79b'; g.beginPath(); g.arc(0, -dir * 2, 6.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#3a2416'; g.beginPath(); g.arc(0, -dir * 4, 5.5, Math.PI, 0, dir > 0); g.fill();
    g.restore();
  }

  const tavolo = window.Arena.tavolo({
    id: 'calcetto',
    mouse: 'bersaglio',
    comandi: 'tasto',
    nomeAzione: '⚽ Tira',
    obiettivo: 'gol',
    suonoAzione: [[300, 0.03]],
    istruzioni: () => (window.Arena.touch() ? 'Trascina il dito sul campo: gli omini si mettono dove tocchi. Premi ⚽ Tira per calciare.' : 'Muovi il mouse (o frecce destra/sinistra, A/D): gli omini si mettono dove punti. Clic o spazio per tirare.') + ' La tua porta è in basso.',
    ruolo: (p, s, ctx) => {
      const ex = p.extra; if (!ex) return '';
      const sq = ctx.mio % 2, cosa = !ex.aSquadre ? 'tutte le stecche' : ctx.mio < 2 ? 'portiere e difesa' : 'centrocampo e attacco';
      return `squadra ${COL[sq].nome}: ${cosa}`;
    },
    sottotitolo: (p, ctx) => (p.extra ? `squadra ${COL[ctx.mio % 2].nome} · si vince a ${p.extra.obiettivo}` : ''),
    statoGioco: (ctx, s) => (s.s.gp ? 'GOL!' : 'Gioca!'),
    hud: (ctx, s) => { const sq = ctx.mio % 2; return `<span style="color:${COL[sq].maglia}">● Voi ${s.s.g[sq]}</span><span style="color:${COL[1 - sq].maglia}">● Loro ${s.s.g[1 - sq]}</span>`; },
    fineRound: (p, s, ctx) => `${s.s.g[ctx.mio % 2]} – ${s.s.g[1 - (ctx.mio % 2)]}`,
    dopoTick(ctx, d, prima) {
      for (const [x, y, forte] of d.s.c || []) { colpi.push({ x, y, t: performance.now(), forte }); suono([[forte ? 220 : 600, forte ? 0.06 : 0.03]], { tipo: forte ? 'square' : 'triangle', volume: forte ? 0.06 : 0.03 }); }
      if (prima && prima.s && d.s.g && (d.s.g[0] !== prima.s.g[0] || d.s.g[1] !== prima.s.g[1])) {
        const nostro = d.s.g[ctx.mio % 2] !== prima.s.g[ctx.mio % 2];
        suono(nostro ? [[523, 0.1], [659, 0.1], [784, 0.25]] : [[300, 0.15], [200, 0.3]], { volume: 0.08 });
      }
    },
    disegna(g, p, s, prima, u, ctx) {
      const ex = p.extra; if (!ex || !s.s || !s.s.a) return;
      const W = p.W, H = p.H, sq = ctx.mio % 2, giro = sq === 1;
      g.save();
      if (giro) { g.translate(W, H); g.rotate(Math.PI); }
      tavoloDisegnato(g, W, H, ex);
      const pa = prima && prima.s && prima.s.a ? prima.s.a : null;
      // la pallina (sotto gli omini)
      const pb = prima && prima.s && prima.s.b, b = s.s.b;
      const bx = pb && Math.hypot(pb.x - b.x, pb.y - b.y) < 120 ? pb.x + (b.x - pb.x) * u : b.x, by = pb && Math.hypot(pb.x - b.x, pb.y - b.y) < 120 ? pb.y + (b.y - pb.y) * u : b.y;
      const r = ex.R_PALLA;
      g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(bx + 3, by + 4, r, r * 0.8, 0, 0, Math.PI * 2); g.fill();
      const gr = g.createRadialGradient(bx - r * 0.4, by - r * 0.4, 1, bx, by, r); gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#cfd3da');
      g.fillStyle = gr; g.beginPath(); g.arc(bx, by, r, 0, Math.PI * 2); g.fill();
      // stecche e omini
      ex.aste.forEach((a, i) => {
        const [s1, t1] = s.s.a[i], sh = pa ? pa[i][0] + (s1 - pa[i][0]) * u : s1;
        const mia = a.chi === ctx.mio;
        g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, a.y + 3, W, 6);
        const met = g.createLinearGradient(0, a.y - 4, 0, a.y + 4); met.addColorStop(0, '#f4f6f8'); met.addColorStop(0.5, '#9aa1ab'); met.addColorStop(1, '#e2e5ea');
        g.fillStyle = met; g.fillRect(0, a.y - 4, W, 8);
        if (mia) { g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, a.y - 9, W, 18); }
        for (const x of a.base) omino(g, x + sh, a.y, COL[a.sq], a.sq === 0 ? -1 : 1, t1, mia);
      });
      const ora = performance.now();
      colpi = colpi.filter((c) => ora - c.t < 250);
      for (const c of colpi) { const k = (ora - c.t) / 250; g.strokeStyle = `rgba(255,255,200,${1 - k})`; g.lineWidth = 3; g.beginPath(); g.arc(c.x, c.y, 12 + k * (c.forte ? 26 : 12), 0, Math.PI * 2); g.stroke(); }
      g.restore();
      // punteggio sul bordo (sempre dritto)
      g.font = '800 34px system-ui, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle';
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(16, H / 2 - 52, 58, 104);
      g.fillStyle = COL[1 - sq].maglia; g.fillText(String(s.s.g[1 - sq]), 30, H / 2 - 24);
      g.fillStyle = COL[sq].maglia; g.fillText(String(s.s.g[sq]), 30, H / 2 + 26);
      g.textBaseline = 'alphabetic';
      if (s.s.gp) { g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, H / 2 - 70, W, 140); g.fillStyle = '#ffd76a'; g.textAlign = 'center'; g.font = '900 88px system-ui, sans-serif'; g.fillText('GOL!', W / 2, H / 2 + 30); }
    },
  });
  // il punteggio in alto: le due squadre
  tavolo.punteggio = (ctx) => {
    const p = ctx.partita, esc = window.Nuovi.esc;
    const nomi = (sq) => Array.from({ length: p.n }, (_, i) => i).filter((i) => i % 2 === sq).map((i) => (i === ctx.mio ? 'Tu' : esc(ctx.nome(i)))).join(' e ');
    const g = (p.stato && p.stato.s && p.stato.s.g) || [0, 0];
    return `<span style="color:${COL[0].maglia}">${nomi(0)} <b>${g[0]}</b></span><span style="color:${COL[1].maglia}">${nomi(1)} <b>${g[1]}</b></span><span class="obiettivo">a ${p.extra ? p.extra.obiettivo : 5} gol</span>`;
  };
  Object.assign(window.Tavoli, { calcetto: tavolo });
})();
