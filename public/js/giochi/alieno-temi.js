// CHI È L'ALIENO — i disegni a tema delle mappe: sfondo intorno alla base, dettagli dei pavimenti, passaggi, mobili,
// decorazioni, corpi e scene di espulsione. Tutto sul canvas, senza immagini. Il file principale (alieno.js) chiama
// AlienoTemi.* passando il tema della mappa (dati in giochi/alieno-mappe/).
window.AlienoTemi = (() => {
  const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const tondo = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const luce = (g, x, y, r, c) => { const gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
  const emoji = (g, e, x, y, px) => { g.font = `${px}px system-ui, "Noto Color Emoji", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, x, y); g.textBaseline = 'alphabetic'; };

  // ---------- lo sfondo fuori dalla base ----------
  function fondo(g, tema, mw, mh) {
    const f = tema.fondo;
    if (f === 'lava') {
      g.fillStyle = '#2a0c06'; g.fillRect(0, 0, mw, mh);
      for (let k = 0; k < 60; k++) { g.strokeStyle = `rgba(255,${90 + rnd(k) * 80},20,${0.3 + rnd(k + 1) * 0.5})`; g.lineWidth = 2 + rnd(k + 2) * 6; g.beginPath(); const x = rnd(k + 3) * mw, y = rnd(k + 4) * mh; g.moveTo(x, y); g.bezierCurveTo(x + 60, y + 40 * (rnd(k + 5) - 0.5), x + 120, y + 60 * (rnd(k + 6) - 0.5), x + 200, y + 30 * (rnd(k + 7) - 0.5)); g.stroke(); }
      for (let k = 0; k < 40; k++) luce(g, rnd(k + 20) * mw, rnd(k + 21) * mh, 40 + rnd(k) * 80, 'rgba(255,110,20,.35)');
    } else if (f === 'giungla') {
      g.fillStyle = '#0d2412'; g.fillRect(0, 0, mw, mh);
      for (let k = 0; k < 500; k++) { g.fillStyle = `hsla(${100 + rnd(k) * 60},${40 + rnd(k + 1) * 30}%,${12 + rnd(k + 2) * 18}%,.9)`; g.beginPath(); g.ellipse(rnd(k + 3) * mw, rnd(k + 4) * mh, 20 + rnd(k + 5) * 40, 8 + rnd(k + 6) * 16, rnd(k + 7) * 3, 0, Math.PI * 2); g.fill(); }
      for (let k = 0; k < 50; k++) luce(g, rnd(k + 30) * mw, rnd(k + 31) * mh, 25, 'rgba(180,120,255,.35)');
    } else if (f === 'abisso') {
      const gr = g.createLinearGradient(0, 0, 0, mh); gr.addColorStop(0, '#0a3350'); gr.addColorStop(1, '#020b16'); g.fillStyle = gr; g.fillRect(0, 0, mw, mh);
      for (let k = 0; k < 14; k++) { g.fillStyle = 'rgba(120,200,255,.05)'; g.beginPath(); const x = rnd(k) * mw; g.moveTo(x, 0); g.lineTo(x + 120, 0); g.lineTo(x + 380, mh); g.lineTo(x + 200, mh); g.fill(); }
      for (let k = 0; k < 600; k++) { g.fillStyle = `rgba(180,230,255,${0.1 + rnd(k) * 0.4})`; g.fillRect(rnd(k + 1) * mw, rnd(k + 2) * mh, 2, 2); }
    } else if (f === 'neve') {
      g.fillStyle = '#e9f1f7'; g.fillRect(0, 0, mw, mh);
      for (let k = 0; k < 90; k++) { g.strokeStyle = 'rgba(120,160,190,.35)'; g.lineWidth = 1.5; g.beginPath(); let x = rnd(k) * mw, y = rnd(k + 1) * mh; g.moveTo(x, y); for (let j = 0; j < 4; j++) { x += 20 + rnd(k + j) * 30; y += (rnd(k + j + 9) - 0.5) * 30; g.lineTo(x, y); } g.stroke(); }
      for (let k = 0; k < 900; k++) { g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(rnd(k + 5) * mw, rnd(k + 6) * mh, 1 + rnd(k + 7) * 2, 0, Math.PI * 2); g.fill(); }
    } else {
      g.fillStyle = '#05070f'; g.fillRect(0, 0, mw, mh);
      for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(255,255,255,${0.3 + rnd(k) * 0.7})`; g.fillRect(rnd(k + 1) * mw, rnd(k + 2) * mh, rnd(k + 3) < 0.9 ? 1 : 2, rnd(k + 3) < 0.9 ? 1 : 2); }
      const neb = g.createRadialGradient(mw * 0.8, mh * 0.2, 10, mw * 0.8, mh * 0.2, 700); neb.addColorStop(0, 'rgba(120,60,180,.25)'); neb.addColorStop(1, 'rgba(120,60,180,0)'); g.fillStyle = neb; g.fillRect(0, 0, mw, mh);
    }
  }
  // ---------- dettagli sul pavimento delle stanze ----------
  function pavimento(g, tema, x, y, T, k, r) {
    const s = rnd(k * 31 + r * 17);
    if (tema.fondo === 'lava' && s < 0.35) { g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.arc(x + 6 + s * 28, y + 8 + rnd(k + r) * 24, 2 + s * 3, 0, Math.PI * 2); g.fill(); }
    else if (tema.fondo === 'giungla' && s < 0.4) { g.fillStyle = 'rgba(140,220,110,.25)'; g.beginPath(); g.ellipse(x + 10 + s * 20, y + 10 + rnd(k * r) * 20, 5, 2.5, s * 3, 0, Math.PI * 2); g.fill(); }
    else if (tema.fondo === 'abisso') { g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(x + 4, y + 4, 1.4, 0, Math.PI * 2); g.arc(x + T - 4, y + 4, 1.4, 0, Math.PI * 2); g.fill(); }
    else if (tema.fondo === 'neve' && s < 0.3) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x + s * 30, y + rnd(k + 3) * 30, 2, 2); }
  }
  // ---------- i passaggi tra le stanze ----------
  function corridoio(g, tema, x, y, T, k, r) {
    const tipo = tema.corridoio;
    if (tipo === 'sentiero') {
      g.fillStyle = (k + r) % 2 ? '#7a5b3b' : '#735537'; g.fillRect(x, y, T, T);
      for (let j = 0; j < 3; j++) { g.fillStyle = 'rgba(40,25,15,.35)'; g.beginPath(); g.ellipse(x + rnd(k * 3 + j + r) * T, y + rnd(r * 5 + j + k) * T, 3, 2, 0, 0, Math.PI * 2); g.fill(); }
    } else if (tipo === 'radici') {
      g.fillStyle = '#3e2e1f'; g.fillRect(x, y, T, T);
      g.strokeStyle = 'rgba(120,85,50,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y + 8 + rnd(k + r) * 20); g.bezierCurveTo(x + 14, y + rnd(k) * T, x + 26, y + rnd(r) * T, x + T, y + 10 + rnd(k * r) * 20); g.stroke();
      if (rnd(k * 7 + r) < 0.2) { g.fillStyle = 'rgba(170,255,140,.4)'; g.beginPath(); g.arc(x + T / 2, y + T / 2, 3, 0, Math.PI * 2); g.fill(); }
    } else if (tipo === 'tubo') {
      g.fillStyle = '#34485a'; g.fillRect(x, y, T, T);
      g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x, y + 4, T, 4); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, y + T - 6, T, 6);
      if ((k + r) % 3 === 0) { g.fillStyle = '#597389'; g.fillRect(x + T / 2 - 2, y, 4, T); }
    } else if (tipo === 'ghiaccio') {
      g.fillStyle = (k + r) % 2 ? '#bcd9ea' : '#b3d2e6'; g.fillRect(x, y, T, T);
      g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + 4, y + rnd(k + r) * T); g.lineTo(x + T - 6, y + rnd(k * r + 1) * T); g.stroke();
    } else {
      g.fillStyle = '#2c313b'; g.fillRect(x, y, T, T);
      g.strokeStyle = '#3b4250'; g.lineWidth = 2; for (let j = 5; j < T; j += 8) { g.beginPath(); g.moveTo(x, y + j); g.lineTo(x + T, y + j); g.stroke(); }
      g.fillStyle = 'rgba(255,200,80,.25)'; if ((k + r) % 7 === 0) g.fillRect(x + T / 2 - 2, y + T / 2 - 2, 4, 4);
    }
  }
  // ponti di corda (isola vulcanica): assi e corde sopra i passaggi indicati
  function ponte(g, T, [x0, y0, w, h]) {
    const oriz = w >= h, X = x0 * T, Y = y0 * T, Wp = w * T, Hp = h * T;
    g.fillStyle = 'rgba(255,90,20,.35)'; g.fillRect(X, Y, Wp, Hp); // la lava sotto, che si intravede
    for (let k = 0; k < (oriz ? w * 3 : h * 3); k++) {
      g.fillStyle = k % 2 ? '#9a6a3a' : '#8a5d32';
      if (oriz) g.fillRect(X + k * (T / 3) + 1, Y + 3, T / 3 - 3, Hp - 6); else g.fillRect(X + 3, Y + k * (T / 3) + 1, Wp - 6, T / 3 - 3);
    }
    g.strokeStyle = '#d8c39a'; g.lineWidth = 2.5;
    g.beginPath(); if (oriz) { g.moveTo(X, Y + 2); g.lineTo(X + Wp, Y + 2); g.moveTo(X, Y + Hp - 2); g.lineTo(X + Wp, Y + Hp - 2); } else { g.moveTo(X + 2, Y); g.lineTo(X + 2, Y + Hp); g.moveTo(X + Wp - 2, Y); g.lineTo(X + Wp - 2, Y + Hp); } g.stroke();
  }
  // ---------- mobili (quelli nuovi delle mappe a tema; quelli della base li disegna alieno.js) ----------
  function mobile(g, x, y, w, h, tipo) {
    const cx = x + w / 2, cy = y + h / 2;
    const base = (c1, c2, r = 8) => { g.fillStyle = 'rgba(0,0,0,.28)'; tondo(g, x + 4, y + 6, w, h, r); g.fill(); g.fillStyle = c1; tondo(g, x + 2, y + 2, w - 4, h - 4, r); g.fill(); g.strokeStyle = c2; g.lineWidth = 2; g.stroke(); };
    switch (tipo) {
      case 'capanna': base('#8a6236', '#5a3d1e', 6); g.fillStyle = '#c7a25a'; g.beginPath(); g.moveTo(x - 4, cy); g.lineTo(cx, y - 10); g.lineTo(x + w + 4, cy); g.closePath(); g.fill(); g.strokeStyle = '#8a6f3a'; g.stroke(); g.fillStyle = '#3a2512'; g.fillRect(cx - 7, cy + 6, 14, h / 2 - 8); return true;
      case 'faro': base('#e8e2d6', '#8a8176', w / 2); g.fillStyle = '#c8302a'; g.fillRect(x + 6, cy - 6, w - 12, 12); luce(g, cx, cy, 70, 'rgba(255,240,150,.35)'); return true;
      case 'lava': { const gr = g.createRadialGradient(cx, cy, 2, cx, cy, Math.max(w, h) / 1.6); gr.addColorStop(0, '#ffe07a'); gr.addColorStop(0.5, '#ff7a1a'); gr.addColorStop(1, '#8a1e08'); g.fillStyle = gr; tondo(g, x + 2, y + 2, w - 4, h - 4, Math.min(w, h) / 2); g.fill(); luce(g, cx, cy, Math.max(w, h), 'rgba(255,120,20,.25)'); return true; }
      case 'roccia': g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(cx + 4, cy + 6, w / 2, h / 2.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#4a4040'; g.beginPath(); g.moveTo(x + 4, y + h - 4); g.lineTo(x + w * 0.2, y + 6); g.lineTo(x + w * 0.7, y + 2); g.lineTo(x + w - 3, y + h * 0.6); g.lineTo(x + w - 6, y + h - 3); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(x + w * 0.22, y + 8); g.lineTo(x + w * 0.62, y + 5); g.lineTo(x + w * 0.45, y + h * 0.4); g.fill(); return true;
      case 'barca': g.fillStyle = '#6b4424'; g.beginPath(); g.moveTo(x, cy - 6); g.lineTo(x + w, cy - 6); g.lineTo(x + w - 10, cy + 10); g.lineTo(x + 10, cy + 10); g.closePath(); g.fill(); return true;
      case 'telescopio': base('#5b6272', '#353a45'); g.strokeStyle = '#c9d0da'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 14, y + h - 14); g.lineTo(x + w - 10, y + 12); g.stroke(); return true;
      case 'fiore-gigante': for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.fillStyle = k % 2 ? '#e0559a' : '#f07ab8'; g.beginPath(); g.ellipse(cx + Math.cos(a) * w * 0.28, cy + Math.sin(a) * h * 0.28, w * 0.24, h * 0.14, a, 0, Math.PI * 2); g.fill(); } g.fillStyle = '#f2c230'; g.beginPath(); g.arc(cx, cy, Math.min(w, h) * 0.18, 0, Math.PI * 2); g.fill(); return true;
      case 'fungo': luce(g, cx, cy, w, 'rgba(120,200,255,.3)'); g.fillStyle = '#e8e0d0'; g.fillRect(cx - w * 0.12, cy, w * 0.24, h / 2 - 2); g.fillStyle = '#5ab0ff'; g.beginPath(); g.ellipse(cx, cy, w / 2 - 2, h / 3, 0, Math.PI, 0); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(cx - w * 0.15, cy - h * 0.12, 3, 0, Math.PI * 2); g.arc(cx + w * 0.12, cy - h * 0.18, 2.5, 0, Math.PI * 2); g.fill(); return true;
      case 'stagno': { const gr = g.createRadialGradient(cx, cy, 2, cx, cy, w / 1.6); gr.addColorStop(0, '#6fe0c8'); gr.addColorStop(1, '#1f6b62'); g.fillStyle = gr; tondo(g, x + 2, y + 2, w - 4, h - 4, h / 2); g.fill(); luce(g, cx, cy, w, 'rgba(111,224,200,.2)'); return true; }
      case 'liana': g.fillStyle = '#2d6b2a'; g.beginPath(); g.arc(cx, cy, w / 2 - 2, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#4c9a3a'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, w / 3, 0, Math.PI * 1.5); g.stroke(); return true;
      case 'sacco': base('#b09062', '#7a6040', 10); g.strokeStyle = '#7a6040'; g.beginPath(); g.moveTo(cx - 6, y + 8); g.lineTo(cx + 6, y + 8); g.stroke(); return true;
      case 'fiore': for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; g.fillStyle = '#f5a3d0'; g.beginPath(); g.arc(cx + Math.cos(a) * w * 0.25, cy + Math.sin(a) * h * 0.25, w * 0.2, 0, Math.PI * 2); g.fill(); } g.fillStyle = '#ffe07a'; g.beginPath(); g.arc(cx, cy, w * 0.15, 0, Math.PI * 2); g.fill(); return true;
      case 'radice': g.fillStyle = '#6b4a2a'; tondo(g, x + 4, y + 4, w - 8, h - 8, 6); g.fill(); g.strokeStyle = '#8a6238'; g.lineWidth = 2; g.stroke(); return true;
      case 'vasca': base('#1f6b8a', '#9ad8f0', 6); g.fillStyle = 'rgba(160,230,255,.35)'; g.fillRect(x + 6, y + 6, w - 12, 8); emoji(g, '🐟', x + w * 0.3, cy + 4, 18); emoji(g, '🐠', x + w * 0.7, cy - 2, 16); return true;
      case 'serbatoio': base('#7c8a96', '#4a5560', w / 2); g.fillStyle = '#3de0a8'; g.fillRect(cx - 4, y + 10, 8, h - 20); return true;
      case 'capsula': base('#c9d3dc', '#6c7a88', w / 2); g.fillStyle = '#1b2a4a'; g.beginPath(); g.arc(cx, cy - 6, w * 0.25, 0, Math.PI * 2); g.fill(); return true;
      case 'pompa': base('#5a6570', '#343c45', 10); g.strokeStyle = '#f2c230'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, w * 0.25, 0, Math.PI * 1.6); g.stroke(); return true;
      case 'motoslitta': g.fillStyle = '#e0413a'; tondo(g, x + 2, y + 4, w - 4, h - 10, 8); g.fill(); g.fillStyle = '#222'; g.fillRect(x, y + h - 6, w, 4); g.fillStyle = '#9ad8f0'; g.fillRect(x + w - 18, y + 7, 10, 8); return true;
      case 'igloo': g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(cx + 4, y + h - 4, w / 2, 8, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#f4f9fc'; g.beginPath(); g.ellipse(cx, y + h, w / 2, h, 0, Math.PI, 0); g.fill(); g.strokeStyle = '#b8cfdd'; g.lineWidth = 1.5; for (let k = 1; k < 3; k++) { g.beginPath(); g.ellipse(cx, y + h, w / 2, h * (1 - k * 0.3), 0, Math.PI, 0); g.stroke(); } g.fillStyle = '#3a4a5a'; g.beginPath(); g.ellipse(cx, y + h, 12, 16, 0, Math.PI, 0); g.fill(); return true;
      case 'trivella': base('#e8a33a', '#9a6a1a', 6); g.fillStyle = '#6c7482'; g.beginPath(); g.moveTo(cx - 6, cy - 4); g.lineTo(cx + 6, cy - 4); g.lineTo(cx, y + h + 6); g.closePath(); g.fill(); return true;
      default: return false;
    }
  }
  // ---------- decorazioni (non ostacolano) ----------
  function decoro(g, T, [tipo, c, r]) {
    const x = c * T + T / 2, y = r * T + T / 2;
    const e = { fumarola: '💨', palma: '🌴', 'fungo-luce': '🍄', foglia: '🌿', fiore: '🌸', corallo: '🪸', alga: '🌿', bolle: '🫧', ghiacciolo: '🧊', cumulo: '❄️', pinguino: '🐧', lava: '🔥', roccia: '🪨', liana: '🌱' }[tipo] || '✦';
    if (tipo === 'fumarola') { for (let k = 0; k < 4; k++) { g.fillStyle = `rgba(220,220,220,${0.25 - k * 0.05})`; g.beginPath(); g.arc(x + k * 6, y - k * 16, 12 + k * 6, 0, Math.PI * 2); g.fill(); } }
    if (tipo === 'fungo-luce') luce(g, x, y, 60, 'rgba(120,200,255,.3)');
    if (tipo === 'lava') luce(g, x, y, 70, 'rgba(255,120,20,.35)');
    emoji(g, e, x, y, tipo === 'palma' || tipo === 'corallo' ? 34 : 26);
  }
  // ---------- il corpo a terra: stessa tuta, qualche dettaglio a tema (niente di cruento) ----------
  function corpo(g, tema, x, y) {
    if (tema.fondo === 'lava') { g.fillStyle = 'rgba(80,80,80,.35)'; for (let k = 0; k < 7; k++) { g.beginPath(); g.arc(x - 18 + rnd(k) * 36, y - 14 + rnd(k + 3) * 28, 3 + rnd(k + 5) * 3, 0, Math.PI * 2); g.fill(); } emoji(g, '💨', x + 14, y - 26, 14); }
    else if (tema.fondo === 'giungla') { g.strokeStyle = '#3f8a34'; g.lineWidth = 3; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x - 22, y - 16 + k * 12); g.bezierCurveTo(x - 6, y - 26 + k * 12, x + 6, y - 6 + k * 12, x + 22, y - 14 + k * 12); g.stroke(); } emoji(g, '🍃', x + 16, y - 24, 14); }
    else if (tema.fondo === 'abisso') { g.strokeStyle = 'rgba(200,240,255,.8)'; g.lineWidth = 1.5; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x - 10 + k * 7, y - 30 - k * 6, 3 + k, 0, Math.PI * 2); g.stroke(); } }
    else if (tema.fondo === 'neve') { g.fillStyle = 'rgba(200,235,255,.45)'; tondo(g, x - 28, y - 30, 56, 52, 8); g.fill(); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 2; g.stroke(); }
  }

  // ---------- le scene di espulsione (stessa struttura per tutte: animazione, scritta, Alieni rimasti) ----------
  function espulsione(g, W, H, esp, tema, astronauta, colore) {
    const e = esp.e, chi = esp.chi, t = tema.fondo;
    if (t === 'lava') {
      const cielo = g.createLinearGradient(0, 0, 0, H); cielo.addColorStop(0, '#3a0d08'); cielo.addColorStop(1, '#a5360e'); g.fillStyle = cielo; g.fillRect(0, 0, W, H);
      // il vulcano
      g.fillStyle = '#2a1a16'; g.beginPath(); g.moveTo(W * 0.18, H); g.lineTo(W * 0.44, H * 0.52); g.lineTo(W * 0.56, H * 0.52); g.lineTo(W * 0.82, H); g.closePath(); g.fill();
      g.fillStyle = '#ff7a1a'; g.beginPath(); g.ellipse(W / 2, H * 0.52, W * 0.06, 10, 0, 0, Math.PI * 2); g.fill();
      if (chi !== null && e < 2.2) { const k = e / 2.2, x = W * 0.08 + (W / 2 - W * 0.08) * k, y = H * 0.25 - Math.sin(k * Math.PI) * 120 + k * H * 0.27; g.save(); g.translate(x, y); g.rotate(e * 5); astronauta(g, 0, 0, colore, 1, e, { fermo: true }); g.restore(); }
      if (e > 2.1) for (let k = 0; k < 40; k++) { const a = -Math.PI / 2 + (rnd(k) - 0.5) * 1.6, v = 120 + rnd(k + 1) * 260, tt = Math.min(2.2, e - 2.1); const x = W / 2 + Math.cos(a) * v * tt, y = H * 0.52 + Math.sin(a) * v * tt + 180 * tt * tt; g.fillStyle = `rgba(255,${120 + rnd(k) * 100},20,${Math.max(0, 1 - tt / 2.2)})`; g.beginPath(); g.arc(x, y, 4 + rnd(k + 2) * 6, 0, Math.PI * 2); g.fill(); }
      if (e > 2.1) { const a = Math.max(0, 1 - (e - 2.1) / 1.5); g.fillStyle = `rgba(255,220,120,${a * 0.5})`; g.fillRect(0, 0, W, H); }
    } else if (t === 'giungla') {
      // giungla scura con le foglie
      const cielo = g.createLinearGradient(0, 0, 0, H); cielo.addColorStop(0, '#0b2412'); cielo.addColorStop(1, '#1d4a22'); g.fillStyle = cielo; g.fillRect(0, 0, W, H);
      for (let k = 0; k < 46; k++) { g.fillStyle = `hsla(${100 + rnd(k) * 50},45%,${14 + rnd(k + 1) * 14}%,1)`; g.beginPath(); g.ellipse(rnd(k + 2) * W, rnd(k + 3) * H, 46, 15, rnd(k) * 3, 0, Math.PI * 2); g.fill(); }
      for (let k = 0; k < 14; k++) luce(g, rnd(k + 40) * W, rnd(k + 41) * H, 30, 'rgba(180,120,255,.25)');
      // la pianta carnivora: il gambo dal basso e la testa con due fauci incernierate dietro, la bocca verso sinistra
      const px = W * 0.66, py = H * 0.52, cx = px + 70; // cerniera delle fauci
      const T_ARRIVO = 1.8, T_CHIUSA = 2.0;
      let ap;
      if (chi === null) ap = 0.05 + Math.sin(e * 2) * 0.03;
      else if (e < T_ARRIVO) ap = 0.25 + 0.5 * Math.min(1, e / 1.2);
      else if (e < T_CHIUSA) ap = 0.75 * (1 - (e - T_ARRIVO) / (T_CHIUSA - T_ARRIVO)) + 0.02;
      else ap = 0.02 + Math.max(0, Math.sin((e - T_CHIUSA) * 14)) * 0.07 * Math.max(0, 1 - (e - T_CHIUSA) / 1.6); // mastica
      const dondola = Math.sin(e * 2.2) * 6 + (e > T_CHIUSA && e < T_CHIUSA + 1.6 ? Math.sin(e * 28) * 3 : 0);
      // gambo e foglie del gambo
      g.strokeStyle = '#2f7a2a'; g.lineWidth = 22; g.lineCap = 'round';
      g.beginPath(); g.moveTo(px + 40, H + 20); g.bezierCurveTo(px + 140, H * 0.9, px + 150, py + 80, cx, py + dondola + 10); g.stroke();
      g.strokeStyle = '#3d9a34'; g.lineWidth = 8; g.beginPath(); g.moveTo(px + 44, H + 20); g.bezierCurveTo(px + 140, H * 0.9, px + 146, py + 80, cx - 4, py + dondola + 8); g.stroke();
      for (const [fx, fy, a] of [[px + 120, H * 0.86, -0.6], [px + 150, H * 0.72, 0.5]]) { g.fillStyle = '#3f8f36'; g.beginPath(); g.ellipse(fx, fy, 50, 16, a, 0, Math.PI * 2); g.fill(); }
      // l'astronauta vola dentro la bocca aperta (disegnato prima delle fauci: quando si chiudono sparisce)
      if (chi !== null && e < T_CHIUSA + 0.05) {
        const k = Math.min(1, e / T_ARRIVO), mx = cx - 92, my = py + dondola;
        const x = -60 + (mx + 60) * k, y = H * 0.3 + (my - H * 0.3) * k - Math.sin(k * Math.PI) * 90;
        g.save(); g.translate(x, y); g.rotate(e * 4); g.scale(1 - k * 0.25, 1 - k * 0.25); astronauta(g, 0, 0, colore, 1, e, { fermo: true }); g.restore();
      }
      // le due fauci: fuori verdi a macchie, dentro rosse, denti bianchi sul labbro
      const fauce = (verso) => {
        g.save(); g.translate(cx, py + dondola); g.rotate(-verso * ap);
        const su = verso > 0; // fauce di sopra
        const meta = (rx, ry) => { g.beginPath(); g.ellipse(-92, 0, rx, ry, 0, su ? Math.PI : 0, su ? Math.PI * 2 : Math.PI); g.closePath(); };
        g.fillStyle = '#4c9a3a'; meta(98, 58); g.fill();
        g.fillStyle = '#356f2a'; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(-160 + k * 32, (su ? -1 : 1) * (28 + (k % 2) * 10), 6, 0, Math.PI * 2); g.fill(); }
        g.fillStyle = '#c8302a'; meta(86, 44); g.fill();
        g.fillStyle = '#f4f1e6';
        for (let k = 0; k < 8; k++) { const x0 = -178 + k * 21; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + 10, (su ? 1 : -1) * 15); g.lineTo(x0 + 20, 0); g.closePath(); g.fill(); }
        // ciglia sul bordo esterno
        g.strokeStyle = '#2f6b25'; g.lineWidth = 3;
        for (let k = 0; k < 9; k++) { const a = Math.PI + (k + 0.5) * (Math.PI / 9), bx = -92 + Math.cos(a) * 98, by = Math.sin(a) * 58 * (su ? 1 : -1); g.beginPath(); g.moveTo(bx, by); g.lineTo(-92 + Math.cos(a) * 118, Math.sin(a) * 74 * (su ? 1 : -1)); g.stroke(); }
        g.restore();
      };
      fauce(-1); fauce(1);
      // dopo il boccone: qualche foglia che cade e un piccolo rutto di spore
      if (chi !== null && e > T_CHIUSA) {
        const q = e - T_CHIUSA;
        for (let k = 0; k < 6; k++) { g.save(); g.globalAlpha = Math.max(0, 1 - q / 2.2); g.translate(cx - 120 + k * 26, py - 40 + q * 90 + k * 6); g.rotate(q * 3 + k); g.fillStyle = '#5fb04a'; g.beginPath(); g.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
        if (q > 0.8 && q < 2.4) { g.globalAlpha = Math.max(0, 1 - (q - 0.8) / 1.6); for (let k = 0; k < 5; k++) { g.fillStyle = 'rgba(220,255,200,.5)'; g.beginPath(); g.arc(cx - 190 - (q - 0.8) * 40 - k * 9, py - 20 - k * 12 - (q - 0.8) * 30, 6 + k * 2, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1; }
      }
    } else if (t === 'abisso') {
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0d3a5c'); gr.addColorStop(1, '#010810'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (let k = 0; k < 60; k++) { g.fillStyle = 'rgba(180,230,255,.3)'; g.beginPath(); g.arc(rnd(k) * W, (rnd(k + 1) * H - e * 40 * (1 + rnd(k))) % H + (rnd(k + 1) * H - e * 40 < 0 ? H : 0), 2, 0, Math.PI * 2); g.fill(); }
      // la creatura degli abissi con la sua lucina, che arriva e apre la bocca
      const cx = -300 + Math.min(1, e / 2.3) * (W * 0.55 + 300), cy = H * 0.58, bocca = e < 2.3 ? 0.35 : Math.max(0.02, 0.35 - (e - 2.3) * 1.2);
      g.fillStyle = '#16283a'; g.beginPath(); g.ellipse(cx, cy, 230, 130, 0, bocca, Math.PI * 2 - bocca); g.lineTo(cx, cy); g.closePath(); g.fill();
      g.fillStyle = '#e8f6ff'; for (let k = 0; k < 6; k++) { const a = bocca * (1 - k / 6); g.beginPath(); g.moveTo(cx + Math.cos(a) * 200, cy + Math.sin(a) * 110); g.lineTo(cx + Math.cos(a) * 170, cy + Math.sin(a) * 90 + 12); g.lineTo(cx + Math.cos(a) * 185, cy + Math.sin(a) * 90 - 5); g.fill(); g.beginPath(); g.moveTo(cx + Math.cos(-a) * 200, cy + Math.sin(-a) * 110); g.lineTo(cx + Math.cos(-a) * 170, cy + Math.sin(-a) * 90 - 12); g.lineTo(cx + Math.cos(-a) * 185, cy - Math.sin(a) * 90 + 5); g.fill(); }
      g.fillStyle = '#ffe07a'; g.beginPath(); g.arc(cx + 60, cy - 70, 7, 0, Math.PI * 2); g.fill(); luce(g, cx + 60, cy - 70, 60, 'rgba(255,230,120,.4)');
      g.strokeStyle = '#16283a'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx + 20, cy - 110); g.quadraticCurveTo(cx + 60, cy - 150, cx + 60, cy - 76); g.stroke();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(cx + 70, cy - 40, 10, 0, Math.PI * 2); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(cx + 73, cy - 40, 5, 0, Math.PI * 2); g.fill();
      if (chi !== null && e < 2.6) { const x = W * 0.72, y = -40 + Math.min(1, e / 2.4) * (cy + 40); g.save(); g.translate(x, y); g.rotate(Math.sin(e * 2) * 0.5); astronauta(g, 0, 0, colore, -1, e, { fermo: true }); g.restore(); }
    } else if (t === 'neve') {
      g.fillStyle = '#dcebf5'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#bcd6e8'; g.fillRect(0, H * 0.6, W, H * 0.4);
      // la crepa nel ghiaccio che si allarga
      const lar = 30 + Math.min(1, e / 1.5) * 40;
      g.fillStyle = '#1c3550'; g.beginPath(); g.moveTo(W * 0.62 - lar, H * 0.6); for (let k = 0; k <= 6; k++) g.lineTo(W * 0.62 - lar * (1 - k / 6) * 0.6 + (k % 2 ? 8 : -8), H * 0.6 + k * 40); g.lineTo(W * 0.62 + lar * 0.2, H); for (let k = 6; k >= 0; k--) g.lineTo(W * 0.62 + lar * (1 - k / 6) * 0.6 + (k % 2 ? -6 : 6), H * 0.6 + k * 40); g.lineTo(W * 0.62 + lar, H * 0.6); g.closePath(); g.fill();
      if (chi !== null && e < 2.6) {
        const k = Math.min(1, e / 1.8), x = -40 + (W * 0.62 + 40) * k, cade = Math.max(0, e - 1.8), y = H * 0.6 - 26 + cade * cade * 500;
        g.save(); g.beginPath(); g.rect(0, 0, W, H * 0.6 + (x > W * 0.62 - lar ? 0 : H)); if (cade > 0) g.clip(); g.translate(x, y); g.rotate(cade * 3); astronauta(g, 0, 0, colore, 1, e, { fermo: true }); g.restore();
      }
      if (e > 1.8 && e < 3) for (let k = 0; k < 18; k++) { g.fillStyle = `rgba(255,255,255,${1 - (e - 1.8)})`; g.beginPath(); g.arc(W * 0.62 + (rnd(k) - 0.5) * 120 * (e - 1.6), H * 0.6 - rnd(k + 1) * 60 * (e - 1.6), 5, 0, Math.PI * 2); g.fill(); }
      for (let k = 0; k < 80; k++) { g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc((rnd(k) * W + e * 20) % W, (rnd(k + 1) * H + e * 60 * (0.5 + rnd(k + 2))) % H, 2, 0, Math.PI * 2); g.fill(); }
    } else return false; // lo spazio lo disegna alieno.js
    return true;
  }
  return { fondo, pavimento, corridoio, ponte, mobile, decoro, corpo, espulsione };
})();
