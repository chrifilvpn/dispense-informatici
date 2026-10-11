// IL GIOCO DEL CALAMARO: di notte, sotto la pioggia, sul terreno bagnato è disegnato il calamaro con il gesso
// (quadrato, vita, triangolo, testa con la casa). Le due linee lunghe della vita, da cui entrano gli attaccanti,
// sono tratteggiate in giallo. Le guardie in rosa stanno ai bordi. Chi salta a zoppo saltella; chi viene spinto
// a terra ha le stelline; la spinta è un'onda del colore della squadra.
(() => {
  const { lerp } = window.Arena;
  const { suono, esc } = window.Nuovi;
  const SQ = ['#e8453c', '#2f7fd8'], NOME_SQ = ['rossa', 'blu'];
  const NUMERI = [456, 218, 67, 199, 1, 240, 101, 212];
  let sfondo = null, onde = [], gocce = null;

  function guardia(g, x, y, forma, s = 1) {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(0, 30, 18, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#d63c72'; g.beginPath(); g.moveTo(-15, 30); g.lineTo(-13, -2); g.quadraticCurveTo(0, -10, 13, -2); g.lineTo(15, 30); g.closePath(); g.fill();
    g.fillStyle = '#b02e5e'; g.beginPath(); g.arc(0, -16, 13, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#111'; g.beginPath(); g.ellipse(0, -15, 9.5, 10.5, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#f2f2f2'; g.lineWidth = 2; g.beginPath();
    if (forma === 0) g.arc(0, -15, 4.5, 0, Math.PI * 2);
    else if (forma === 1) { g.moveTo(0, -21); g.lineTo(5.5, -11); g.lineTo(-5.5, -11); g.closePath(); } else g.rect(-4.5, -19.5, 9, 9);
    g.stroke();
    g.restore();
  }
  // il campo con il calamaro disegnato (si prepara una volta sola)
  function campo(W, H, ex) {
    const c = document.createElement('canvas'); c.width = W * 1.5; c.height = H * 1.5;
    const g = c.getContext('2d'); g.scale(1.5, 1.5);
    const { Q, VITA, TRI, TESTA, CASA } = ex;
    // terra bagnata di notte, con le pozzanghere e i fari dall'alto
    const t = g.createLinearGradient(0, 0, 0, H); t.addColorStop(0, '#4b4239'); t.addColorStop(1, '#2f2a25');
    g.fillStyle = t; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 340; k++) { g.fillStyle = k % 3 ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.05)'; g.beginPath(); g.arc((k * 173) % W, (k * 97) % H, 1 + (k % 3), 0, Math.PI * 2); g.fill(); }
    for (const [x, y, rx, ry] of [[90, 560, 60, 14], [930, 70, 50, 12], [610, 585, 70, 12], [260, 60, 46, 10], [960, 540, 40, 10]]) {
      const p = g.createRadialGradient(x, y, 2, x, y, rx); p.addColorStop(0, 'rgba(160,190,220,.28)'); p.addColorStop(1, 'rgba(160,190,220,0)');
      g.fillStyle = p; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    }
    for (const x of [200, 520, 840]) { const l = g.createRadialGradient(x, H / 2, 20, x, H / 2, 380); l.addColorStop(0, 'rgba(255,245,215,.13)'); l.addColorStop(1, 'rgba(255,245,215,0)'); g.fillStyle = l; g.fillRect(0, 0, W, H); }
    // il calamaro: prima i contorni di tutte le forme, larghi, poi gli interni sopra: così restano solo le linee
    // esterne (dove le forme si toccano, e dentro la vita, le linee spariscono come nel disegno vero)
    const forme = (fn) => {
      fn((h) => h.rect(Q.x0, Q.y0, Q.x1 - Q.x0, Q.y1 - Q.y0));
      fn((h) => { h.moveTo(TRI[0][0], TRI[0][1]); h.lineTo(TRI[1][0], TRI[1][1]); h.lineTo(TRI[2][0], TRI[2][1]); h.closePath(); });
      fn((h) => h.arc(TESTA.x, TESTA.y, TESTA.r, 0, Math.PI * 2));
    };
    g.lineJoin = 'round'; g.lineCap = 'round';
    g.strokeStyle = 'rgba(245,242,232,.92)'; g.lineWidth = 12;
    forme((f) => { g.beginPath(); f(g); g.stroke(); });
    g.fillStyle = '#5b5248';
    forme((f) => { g.beginPath(); f(g); g.fill(); });
    g.fillRect(VITA.x0 - 9, VITA.y0, VITA.x1 - VITA.x0 + 18, VITA.y1 - VITA.y0);
    // la vita: le due linee lunghe da cui entrano gli attaccanti
    g.save(); g.strokeStyle = '#ffd34d'; g.lineWidth = 6; g.setLineDash([14, 10]);
    g.beginPath(); g.moveTo(VITA.x0, VITA.y0); g.lineTo(VITA.x1, VITA.y0); g.moveTo(VITA.x0, VITA.y1); g.lineTo(VITA.x1, VITA.y1); g.stroke(); g.restore();
    g.fillStyle = 'rgba(255,211,77,.85)'; g.font = '800 14px system-ui, sans-serif'; g.textAlign = 'center';
    g.fillText('VITA ⬇', (VITA.x0 + VITA.x1) / 2, VITA.y0 - 10); g.fillText('VITA ⬆', (VITA.x0 + VITA.x1) / 2, VITA.y1 + 22);
    // la casa nella testa
    g.fillStyle = 'rgba(214,36,58,.35)'; g.beginPath(); g.arc(CASA.x, CASA.y, CASA.r, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(245,242,232,.95)'; g.lineWidth = 4; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '800 12px system-ui, sans-serif'; g.fillText('CASA', CASA.x, CASA.y + 4);
    // la partenza degli attaccanti
    g.fillStyle = 'rgba(255,255,255,.45)'; g.font = '700 13px system-ui, sans-serif';
    g.save(); g.translate(26, H / 2); g.rotate(-Math.PI / 2); g.fillText('PARTENZA · A ZOPPO', 0, 0); g.restore();
    // le guardie ai bordi
    [[30, 30, 0], [W - 30, 30, 1], [30, H - 40, 2], [W - 30, H - 40, 0], [600, 26, 1], [600, H - 36, 2], [W - 26, H / 2, 2]].forEach(([x, y, f]) => guardia(g, x, y, f, 0.75));
    return c;
  }
  function giocatore(g, x, y, r, col, nome, num, io, opz = {}) {
    g.save();
    if (opz.alfa !== undefined) g.globalAlpha = opz.alfa;
    const salto = opz.zoppo ? Math.abs(Math.sin(opz.t * 9 + num)) * 5 : 0;
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x + 2, y + r * 0.9, r * (0.9 - salto * 0.03), r * 0.33, 0, 0, Math.PI * 2); g.fill();
    y -= salto;
    if (opz.terra) { g.translate(x, y); g.rotate(1.2); g.scale(1, 0.75); g.translate(-x, -y); }
    g.fillStyle = '#2f8f7e'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.lineWidth = io ? 4 : 3; g.strokeStyle = col; g.stroke();
    if (io) { g.lineWidth = 2; g.strokeStyle = '#fff'; g.beginPath(); g.arc(x, y, r + 3, 0, Math.PI * 2); g.stroke(); }
    g.fillStyle = '#f0d2b5'; g.beginPath(); g.arc(x, y - r * 0.38, r * 0.42, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2a211c'; g.beginPath(); g.arc(x, y - r * 0.5, r * 0.42, Math.PI, 0); g.fill();
    g.fillStyle = '#fff'; g.fillRect(x - r * 0.62, y + r * 0.06, r * 1.24, r * 0.6);
    g.fillStyle = '#1d4d43'; g.font = `700 ${Math.round(r * 0.52)}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(String(num).padStart(3, '0'), x, y + r * 0.37);
    g.restore();
    if (nome) { g.save(); g.fillStyle = '#fff'; g.font = '600 13px system-ui, sans-serif'; g.textAlign = 'center'; g.strokeStyle = 'rgba(0,0,0,.7)'; g.lineWidth = 3; g.strokeText(nome, x, y - salto - r - 6); g.fillText(nome, x, y - salto - r - 6); g.restore(); }
    if (opz.terra) { g.save(); g.font = '15px system-ui'; g.textAlign = 'center'; g.fillText('💫', x, y - r - 20); g.restore(); }
  }
  const ruoloDi = (s, io) => { const e = s.s.e[io]; if (!e) return ''; return e.a ? (e.z ? 'attaccante a zoppo' : 'attaccante') : 'difensore'; };

  const tavolo = window.Arena.tavolo({
    id: 'calamaro',
    nomeAzione: '🤚 Spingi',
    obiettivo: 'punti',
    istruzioni: () => 'WASD o frecce (sul telefono il joystick) per muoverti, spazio (o 🤚) per spingere. Attaccanti: entrate dalle linee gialle della vita e toccate la CASA. Difensori: spingeteli fuori dal disegno!',
    sottotitolo: (p) => (p.extra ? `Squadre fisse · round da ${p.extra.durata} s` : ''),
    ruolo: (p, s, ctx) => {
      const ex = p.extra; if (!ex) return '';
      const mia = ex.squadra[ctx.mio], att = (s.round - 1) % 2;
      return `Sei nella squadra ${NOME_SQ[mia]}: ${mia === att ? 'ATTACCHI' : 'DIFENDI'}`;
    },
    statoGioco: (ctx, s) => {
      const e = s.s.e[ctx.mio];
      if (!e) return '';
      if (e.f) return 'Eliminato: guarda';
      if (e.c) return 'Sei arrivato alla casa! 🦑';
      if (e.tr) return 'A terra!';
      if (e.a) return e.z ? 'A zoppo: entra dalla vita!' : 'Corri alla casa!';
      return 'Difendi: spingili fuori!';
    },
    hud: (ctx, s) => {
      const ee = s.s.e, at = s.s.at;
      const arrivati = ee.filter((e) => e.c).length, fuori = ee.filter((e) => e.f).length;
      return `<span>⏱️ ${s.s.resta} s</span><span style="color:${SQ[at]}">⚔️ attacca la ${NOME_SQ[at]}</span><span>🧍 tu: ${esc(ruoloDi(s, ctx.mio))}</span><span>🏠 ${arrivati}</span><span>💀 ${fuori}</span>`;
    },
    fineRound: (p, s, ctx) => `Punti totali: ${p.punti[ctx.mio]}`,
    dopoTick(ctx, d, prima) {
      const ora = performance.now();
      for (const [x, y, p] of d.s.sp || []) {
        onde.push({ x, y, p, t: ora });
        if (p === ctx.mio) suono([[220, 0.04], [160, 0.08]], { tipo: 'square', volume: 0.05 });
      }
      if (!prima) return;
      d.s.e.forEach((e, i) => {
        const a = prima.s.e[i]; if (!a) return;
        if (!a.f && e.f) suono(i === ctx.mio ? [[300, 0.1], [200, 0.2], [100, 0.35]] : [[200, 0.05], [90, 0.2]], { tipo: 'sawtooth', volume: i === ctx.mio ? 0.09 : 0.05 });
        if (!a.c && e.c) suono([[523, 0.1], [659, 0.1], [784, 0.2]], { volume: i === ctx.mio ? 0.09 : 0.05 });
        if (a.z && !e.z && !e.f && i === ctx.mio) suono([[440, 0.06], [660, 0.1]], { volume: 0.07 });
      });
    },
    disegna(g, p, s, prima, u, ctx) {
      const W = p.W, H = p.H, ex = p.extra || {}, ora = performance.now(), t = s.t;
      if (!ex.Q) return;
      if (!sfondo) sfondo = campo(W, H, ex);
      g.drawImage(sfondo, 0, 0, W, H);
      const R = ex.r || 15, sq = ex.squadra || [];
      const ee = lerp(prima && prima.s.e, s.s.e, u);
      const nome = (i) => (i === ctx.mio ? 'Tu' : ctx.nome(i).slice(0, 10));
      // la casa pulsa per gli attaccanti
      const io = s.s.e[ctx.mio];
      if (io && io.a && !io.f && !io.c) { g.save(); g.strokeStyle = `rgba(255,211,77,${0.4 + 0.3 * Math.sin(t * 5)})`; g.lineWidth = 3; g.beginPath(); g.arc(ex.CASA.x, ex.CASA.y, ex.CASA.r + 8 + 3 * Math.sin(t * 5), 0, Math.PI * 2); g.stroke(); g.restore(); }
      ee.forEach((e, i) => { if (e.f) window.Squid.eliminato(g, e.x, e.y, R, SQ[sq[i] || 0], nome(i), Math.max(0, t - (e.el || 0)), i + 1); });
      // le onde delle spinte
      onde = onde.filter((o) => ora - o.t < 380);
      for (const o of onde) {
        const a = (ora - o.t) / 380, rr = R + ((ex.portata || 56) - R) * Math.min(1, a * 1.4);
        g.save(); g.globalAlpha = 1 - a; g.strokeStyle = SQ[sq[o.p] || 0]; g.lineWidth = 5; g.beginPath(); g.arc(o.x, o.y, rr, 0, Math.PI * 2); g.stroke();
        g.fillStyle = 'rgba(255,255,255,.12)'; g.fill(); g.restore();
      }
      ee.forEach((e, i) => {
        if (e.f) return;
        giocatore(g, e.x, e.y, R, SQ[sq[i] || 0], nome(i), NUMERI[i % NUMERI.length], i === ctx.mio, { zoppo: e.z && !e.tr, terra: e.tr, t, alfa: e.c ? 0.55 : 1 });
        if (e.c) { g.save(); g.font = '16px system-ui'; g.textAlign = 'center'; g.fillText('⭐', e.x + R, e.y - R); g.restore(); }
      });
      // la mia spinta: quando è pronta il cerchio della portata, mentre ricarica un arco grigio
      if (io && !io.f && !io.c) {
        const me = ee[ctx.mio];
        g.save(); g.lineWidth = 2; g.setLineDash([4, 6]);
        g.strokeStyle = io.ca ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.45)';
        g.beginPath(); g.arc(me.x, me.y, ex.portata || 56, 0, Math.PI * 2); g.stroke(); g.restore();
      }
      // la pioggia
      if (!gocce) gocce = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * H, v: 500 + Math.random() * 300, l: 10 + Math.random() * 12 }));
      g.save(); g.strokeStyle = 'rgba(190,210,235,.28)'; g.lineWidth = 1.5; g.beginPath();
      const sec = ora / 1000;
      for (const d of gocce) { const y = (d.y + sec * d.v) % (H + 40) - 20, x = (d.x + y * 0.18) % W; g.moveTo(x, y); g.lineTo(x + d.l * 0.18, y + d.l); }
      g.stroke(); g.restore();
      // il tempo che scade
      if (s.fase === 'gioco' && s.s.resta <= 10) { g.save(); g.textAlign = 'center'; g.font = '800 30px system-ui, sans-serif'; g.fillStyle = `rgba(255,90,90,${0.6 + 0.3 * Math.sin(t * 8)})`; g.fillText(`⏱️ ${s.s.resta}`, W / 2, 48); g.restore(); }
    },
  });
  Object.assign(window.Tavoli, { calamaro: tavolo });
})();
