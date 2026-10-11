// PATATA BOLLENTE: la sala dei giochi color pastello (pareti rosa con le scale, pavimento a riquadri), le quattro
// colonne, le guardie in tuta rosa con la maschera ○ △ □ agli angoli. I giocatori hanno la tuta con il numero sul
// petto; chi tiene la patata ha la bomba che fuma sopra la testa e un alone rosso che pulsa con il ticchettio.
(() => {
  const { COLORI, lerp } = window.Arena;
  const { suono } = window.Nuovi;
  const NUMERI = [456, 218, 67, 199, 1, 240, 101, 212];
  const intervallo = (t) => Math.max(0.11, 0.72 * Math.pow(0.92, t)); // come sul server
  let sfondo = null, fumo = [], botti = [], ultimoTic = { ma: -1 };

  // la guardia in tuta rosa con la maschera nera (forma: 0 cerchio, 1 triangolo, 2 quadrato)
  function guardia(g, x, y, forma, s = 1) {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 30, 18, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#e0457b'; g.beginPath(); g.moveTo(-15, 30); g.lineTo(-13, -2); g.quadraticCurveTo(0, -10, 13, -2); g.lineTo(15, 30); g.closePath(); g.fill();
    g.fillStyle = '#c23466'; g.fillRect(-2, -2, 4, 30);
    g.fillStyle = '#d63c72'; g.beginPath(); g.arc(0, -16, 13, 0, Math.PI * 2); g.fill(); // cappuccio
    g.fillStyle = '#111'; g.beginPath(); g.ellipse(0, -15, 9.5, 10.5, 0, 0, Math.PI * 2); g.fill(); // maschera
    g.strokeStyle = '#f2f2f2'; g.lineWidth = 2; g.beginPath();
    if (forma === 0) g.arc(0, -15, 4.5, 0, Math.PI * 2);
    else if (forma === 1) { g.moveTo(0, -21); g.lineTo(5.5, -11); g.lineTo(-5.5, -11); g.closePath(); } else g.rect(-4.5, -19.5, 9, 9);
    g.stroke();
    g.restore();
  }
  function sala(W, H, ex) {
    const c = document.createElement('canvas'); c.width = W * 1.5; c.height = H * 1.5;
    const g = c.getContext('2d'); g.scale(1.5, 1.5);
    const B = ex.bordo || 40;
    // le pareti rosa con le scale pastello (come nel labirinto di scale della serie)
    g.fillStyle = '#f2a7c3'; g.fillRect(0, 0, W, H);
    const scale = ['#9fd8d0', '#f7e08a', '#b9a6e8'];
    for (let k = 0; k < 26; k++) {
      g.fillStyle = scale[k % 3];
      const x = (k * 97) % W;
      for (let s = 0; s < 4; s++) g.fillRect(x + s * 7, k % 2 ? 0 : H - B + s * 8, 11, B - s * 8);
    }
    // il pavimento a riquadri pastello
    g.fillStyle = '#e9f1ee'; g.fillRect(B, B, W - B * 2, H - B * 2);
    for (let y = B; y < H - B; y += 48) for (let x = B; x < W - B; x += 48) {
      if (((x - B) / 48 + (y - B) / 48) % 2 < 1) { g.fillStyle = 'rgba(126,196,182,.18)'; g.fillRect(x, y, 48, 48); }
    }
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 3; g.strokeRect(B, B, W - B * 2, H - B * 2);
    // il cerchio di gioco al centro e i simboli ○ △ □ dipinti per terra
    g.strokeStyle = 'rgba(214,60,114,.35)'; g.lineWidth = 6; g.beginPath(); g.arc(W / 2, H / 2, 90, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 5; g.strokeStyle = 'rgba(214,60,114,.22)';
    g.beginPath(); g.arc(W / 2 - 34, H / 2, 14, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(W / 2, H / 2 - 15); g.lineTo(W / 2 + 14, H / 2 + 12); g.lineTo(W / 2 - 14, H / 2 + 12); g.closePath(); g.stroke();
    g.strokeRect(W / 2 + 22, H / 2 - 13, 26, 26);
    // le colonne
    const tinte = ['#f6b7cf', '#9fd8d0', '#f7e08a', '#b9a6e8'];
    (ex.colonne || []).forEach(([x, y], k) => {
      const r = ex.rCol || 32;
      g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(x + 6, y + 8, r, r * 0.9, 0, 0, Math.PI * 2); g.fill();
      const gr = g.createRadialGradient(x - r * 0.4, y - r * 0.4, 3, x, y, r); gr.addColorStop(0, '#fff'); gr.addColorStop(0.35, tinte[k % 4]); gr.addColorStop(1, '#8f7a86');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 2; g.stroke();
    });
    // le guardie agli angoli e a metà dei lati lunghi
    // le guardie sul bordo: agli angoli e a metà dei lati
    [[22, 24, 0], [W - 22, 24, 1], [22, H - 30, 2], [W - 22, H - 30, 0], [W / 2, 10, 2], [W / 2, H - 30, 1], [16, H / 2 - 8, 1], [W - 16, H / 2 - 8, 2]].forEach(([x, y, f]) => guardia(g, x, y, f, 0.72));
    return c;
  }
  // il giocatore con la tuta verde acqua, il colore del posto sul bordo e il numero sul petto
  function giocatore(g, x, y, r, col, nome, num, io) {
    g.save();
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x + 2, y + r * 0.9, r * 0.9, r * 0.35, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2f8f7e'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.lineWidth = io ? 4 : 3; g.strokeStyle = io ? '#fff' : col; g.stroke();
    if (io) { g.lineWidth = 2; g.strokeStyle = col; g.beginPath(); g.arc(x, y, r - 3, 0, Math.PI * 2); g.stroke(); }
    // la testa (vista dall'alto, un po' avanti) e la pettorina col numero
    g.fillStyle = '#f0d2b5'; g.beginPath(); g.arc(x, y - r * 0.38, r * 0.42, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2a211c'; g.beginPath(); g.arc(x, y - r * 0.5, r * 0.42, Math.PI, 0); g.fill();
    g.fillStyle = '#fff'; g.fillRect(x - r * 0.62, y + r * 0.06, r * 1.24, r * 0.6);
    g.fillStyle = '#1d4d43'; g.font = `700 ${Math.round(r * 0.52)}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(String(num).padStart(3, '0'), x, y + r * 0.37);
    if (nome) { g.fillStyle = '#fff'; g.font = '600 13px system-ui, sans-serif'; g.textBaseline = 'alphabetic'; g.strokeStyle = 'rgba(0,0,0,.65)'; g.lineWidth = 3; g.strokeText(nome, x, y - r - 6); g.fillText(nome, x, y - r - 6); }
    g.restore();
  }
  // la bomba che fuma (sopra la testa di chi la tiene)
  function bomba(g, x, y, t, sfrigola, battito) {
    g.save(); g.translate(x, y);
    const s = 1 + battito * 0.12;
    g.scale(s, s);
    const gr = g.createRadialGradient(-4, -4, 1, 0, 0, 12); gr.addColorStop(0, '#6b6b6b'); gr.addColorStop(1, '#111');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 11, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#333'; g.fillRect(-4, -14, 8, 5);
    g.strokeStyle = '#8a6a3a'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -14); g.quadraticCurveTo(6, -22, 3, -26); g.stroke();
    // la scintilla in cima alla miccia
    const sc = sfrigola ? '#ff2a2a' : '#ffd23a';
    for (let k = 0; k < 6; k++) { const a = t * 20 + k; g.strokeStyle = sc; g.lineWidth = 1.5; g.beginPath(); g.moveTo(3, -26); g.lineTo(3 + Math.cos(a) * (sfrigola ? 8 : 5), -26 + Math.sin(a) * (sfrigola ? 8 : 5)); g.stroke(); }
    g.fillStyle = '#fff6c0'; g.beginPath(); g.arc(3, -26, 2.2, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  const tavolo = window.Arena.tavolo({
    id: 'patata',
    obiettivo: 'punti',
    istruzioni: () => 'WASD o frecce (sul telefono il joystick). Se hai la patata 💣 tocca qualcuno per passarla; se non ce l\'hai, scappa!',
    sottotitolo: (p) => (p.extra ? `Miccia ${p.extra.miccia}` : ''),
    statoGioco: (ctx, s) => {
      const io = s.s.e[ctx.mio];
      if (!io || io.f) return 'Saltato in aria: guarda';
      if (s.s.b && s.s.b.c === ctx.mio) return s.s.b.sf ? 'STA PER SCOPPIARE! Passala!' : 'Hai la patata: tocca qualcuno!';
      if (s.s.b) return `Scappa da ${ctx.nome(s.s.b.c)}!`;
      return 'Pronti…';
    },
    hud: (ctx, s) => {
      const b = s.s.b, vivi = s.s.e.filter((e) => !e.f).length;
      const chi = b ? (b.c === ctx.mio ? '<b>TU</b>' : window.Nuovi.esc(ctx.nome(b.c))) : '';
      return `<span>🧍 in gioco: ${vivi}</span>${b ? `<span>💣 ce l'ha: ${chi}</span><span>🔥 accesa da ${Math.floor(b.ma)} s</span>` : s.s.pr !== null ? `<span>💣 la patata riparte tra ${Math.ceil(s.s.pr)} s</span>` : ''}`;
    },
    fineRound: (p, s, ctx) => `Punti totali: ${p.punti[ctx.mio]}`,
    dopoTick(ctx, d, prima) {
      const ora = performance.now();
      for (const [x, y] of d.s.sc || []) {
        botti.push({ x, y, t: ora });
        for (let k = 0; k < 14; k++) fumo.push({ x: x + (Math.random() - 0.5) * 40, y: y + (Math.random() - 0.5) * 30, vx: (Math.random() - 0.5) * 60, vy: -20 - Math.random() * 50, r: 10 + Math.random() * 14, t: ora, vita: 1200 + Math.random() * 600 });
        suono([[120, 0.08], [70, 0.25], [45, 0.45]], { tipo: 'sawtooth', volume: 0.12 });
      }
      const b = d.s.b;
      // il ticchettio: si conta dal momento in cui la miccia è stata accesa
      if (b) {
        if (b.ma < ultimoTic.ma) ultimoTic = { ma: -1 }; // miccia nuova: si riparte da capo
        if (ultimoTic.ma < 0 || b.ma - ultimoTic.ma >= intervallo(ultimoTic.ma)) {
          ultimoTic.ma = b.ma;
          const mia = b.c === ctx.mio;
          suono([[b.sf ? 1400 : 950, 0.025]], { tipo: 'square', volume: mia ? 0.06 : 0.025 });
          ctx.ui.paBattito = ora;
        }
        if (prima && prima.s.b && prima.s.b.c !== b.c && b.c === ctx.mio) suono([[300, 0.05], [600, 0.08]], { volume: 0.07 });
        if (prima && prima.s.b && prima.s.b.c === ctx.mio && b.c !== ctx.mio) suono([[660, 0.05], [880, 0.08]], { volume: 0.06 });
      } else ultimoTic = { ma: -1 };
    },
    disegna(g, p, s, prima, u, ctx) {
      const W = p.W, H = p.H, ex = p.extra || {}, ora = performance.now();
      if (!sfondo) sfondo = sala(W, H, ex);
      g.drawImage(sfondo, 0, 0, W, H);
      const t = s.t, b = s.s.b, R = ex.r || 16;
      const ee = lerp(prima && prima.s.e, s.s.e, u);
      const nome = (i) => (i === ctx.mio ? 'Tu' : ctx.nome(i).slice(0, 10));
      const battito = Math.max(0, 1 - (ora - (ctx.ui.paBattito || 0)) / 160);
      // gli eliminati sotto
      ee.forEach((e, i) => { if (e.f) window.Squid.eliminato(g, e.x, e.y, R, COLORI[i % COLORI.length], nome(i), Math.max(0, t - (e.el || 0)), i + 1); });
      // l'alone rosso di chi ha la patata
      if (b) {
        const h = ee[b.c];
        if (h && !h.f) {
          const rr = R + 12 + battito * 10;
          const al = g.createRadialGradient(h.x, h.y, R * 0.6, h.x, h.y, rr + 16); al.addColorStop(0, `rgba(255,70,40,${0.35 + battito * 0.3})`); al.addColorStop(1, 'rgba(255,70,40,0)');
          g.fillStyle = al; g.beginPath(); g.arc(h.x, h.y, rr + 16, 0, Math.PI * 2); g.fill();
        }
        // chi l'ha appena passata è al sicuro per un secondo da chi l'ha ricevuta
        if (b.im && b.da !== null && ee[b.da] && !ee[b.da].f) {
          const d = ee[b.da];
          g.save(); g.setLineDash([5, 5]); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 2; g.beginPath(); g.arc(d.x, d.y, R + 7, 0, Math.PI * 2); g.stroke(); g.restore();
        }
      }
      ee.forEach((e, i) => { if (!e.f) giocatore(g, e.x, e.y, R, COLORI[i % COLORI.length], nome(i), NUMERI[i % NUMERI.length], i === ctx.mio); });
      // la bomba e il suo fumo
      if (b && ee[b.c] && !ee[b.c].f) {
        const h = ee[b.c];
        if (Math.random() < 0.5) fumo.push({ x: h.x + R + 13, y: h.y - 30, vx: (Math.random() - 0.5) * 16, vy: -25 - Math.random() * 20, r: 3 + Math.random() * 3, t: ora, vita: 700 + Math.random() * 400 });
        bomba(g, h.x + R + 10, h.y - 2, t, b.sf, battito);
      }
      fumo = fumo.filter((f) => ora - f.t < f.vita).slice(-160);
      for (const f of fumo) {
        const a = (ora - f.t) / f.vita, dt = (ora - f.t) / 1000;
        g.fillStyle = `rgba(90,90,90,${0.45 * (1 - a)})`; g.beginPath(); g.arc(f.x + f.vx * dt, f.y + f.vy * dt, f.r * (1 + a * 1.5), 0, Math.PI * 2); g.fill();
      }
      // le esplosioni
      botti = botti.filter((k) => ora - k.t < 700);
      for (const k of botti) {
        const a = (ora - k.t) / 700;
        const gr = g.createRadialGradient(k.x, k.y, 0, k.x, k.y, 30 + a * 110);
        gr.addColorStop(0, `rgba(255,250,200,${1 - a})`); gr.addColorStop(0.4, `rgba(255,150,40,${0.9 * (1 - a)})`); gr.addColorStop(1, 'rgba(200,40,20,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(k.x, k.y, 30 + a * 110, 0, Math.PI * 2); g.fill();
        g.strokeStyle = `rgba(255,220,120,${1 - a})`; g.lineWidth = 3;
        for (let j = 0; j < 12; j++) { const an = j * Math.PI / 6; g.beginPath(); g.moveTo(k.x + Math.cos(an) * (20 + a * 40), k.y + Math.sin(an) * (20 + a * 40)); g.lineTo(k.x + Math.cos(an) * (40 + a * 90), k.y + Math.sin(an) * (40 + a * 90)); g.stroke(); }
      }
      // la scritta grande quando la patata è tua
      if (b && b.c === ctx.mio && s.fase === 'gioco') {
        g.save(); g.textAlign = 'center'; g.font = '800 26px system-ui, sans-serif';
        g.fillStyle = b.sf ? `rgba(255,40,40,${0.6 + 0.4 * Math.sin(t * 30)})` : 'rgba(190,30,40,.85)';
        g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 4;
        const testo = b.sf ? '💣 STA PER SCOPPIARE!' : '💣 Hai la patata: passala!';
        g.strokeText(testo, W / 2, 66); g.fillText(testo, W / 2, 66); g.restore();
      } else if (!b && s.s.pr !== null && s.fase === 'gioco') {
        g.save(); g.textAlign = 'center'; g.font = '700 22px system-ui, sans-serif'; g.fillStyle = 'rgba(60,20,40,.8)';
        g.fillText('💣 Una nuova patata sta arrivando…', W / 2, 66); g.restore();
      }
    },
  });
  Object.assign(window.Tavoli, { patata: tavolo });
})();
