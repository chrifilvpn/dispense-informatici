// NONOGRAM: la griglia con i numeri di righe e colonne. La griglia è un elemento che resta vivo tra un aggiornamento e
// l'altro (come in Sblocca il blocco): così un trascinamento non si interrompe quando colorano gli altri giocatori.
// Tocco/clic: colora (o cancella); trascinando si colora lungo una riga o una colonna. Con "Croce" (o con il tasto
// destro) si segnano le caselle vuote.
(() => {
  const { esc, primaVolta, suono, trascorso } = window.Nuovi;
  const COLORI = ['#2b6cb0', '#c05621', '#2f855a', '#b83280'];
  const VUOTA = 0, PIENA = 1, CROCE = 2;
  let ctxN = null, tav = null, chiave = null, stato = null, drag = null, evid = null;
  const cursori = new Map();
  const ricevuto = new WeakMap();
  const fmt = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const tempo = (p) => p.tempo + (p.corre ? Date.now() - (ricevuto.get(p) || Date.now()) : 0);
  setInterval(() => { const p = ctxN && ctxN.stato && ctxN.partita; const el = document.querySelector('.ng-tempo'); if (p && p.gioco === 'nonogram' && el) el.textContent = fmt(tempo(p)); }, 500);
  const indiziLinea = (l) => { const o = []; let k = 0; for (const x of l) { if (x === PIENA) k++; else if (k) { o.push(k); k = 0; } } if (k) o.push(k); return o; };

  // misura delle caselle: tutta la griglia (con i numeri) deve stare nello schermo
  function misura(p) {
    const maxR = Math.max(1, ...p.indizi.righe.map((x) => x.length)), maxC = Math.max(1, ...p.indizi.colonne.map((x) => x.length));
    const W = Math.min(document.documentElement.clientWidth - 16, 680);
    const H = window.innerWidth < 700 ? 9999 : window.innerHeight - 250;
    const perW = (W - 10 - 4 * maxR) / (p.lato + 0.5 * maxR);
    const perH = (H - 10) / (p.lato + 0.62 * maxC);
    return Math.max(15, Math.min(40, Math.floor(Math.min(perW, perH))));
  }

  function crea(p) {
    tav = document.createElement('div');
    tav.className = 'ng-tavola';
    const L = p.lato;
    let html = '<div class="ng-angolo"></div>';
    p.indizi.colonne.forEach((ind, c) => { html += `<div class="ng-ic ${c % 5 === 4 && c < L - 1 ? 'bordo-dx' : ''}" data-c="${c}">${(ind.length ? ind : [0]).map((x) => `<b>${x}</b>`).join('')}</div>`; });
    for (let r = 0; r < L; r++) {
      const ind = p.indizi.righe[r];
      html += `<div class="ng-ir ${r % 5 === 4 && r < L - 1 ? 'bordo-giu' : ''}" data-r="${r}">${(ind.length ? ind : [0]).map((x) => `<b>${x}</b>`).join('')}</div>`;
      for (let c = 0; c < L; c++) html += `<div class="ng-c ${c % 5 === 4 && c < L - 1 ? 'bordo-dx' : ''} ${r % 5 === 4 && r < L - 1 ? 'bordo-giu' : ''}" data-i="${r * L + c}"></div>`;
    }
    tav.innerHTML = html;
    tav.style.setProperty('--lato', L);
    tav.addEventListener('contextmenu', (e) => e.preventDefault());
    tav.addEventListener('pointerdown', (e) => {
      const el = e.target.closest('.ng-c');
      if (!el || !stato || !puoi()) return;
      e.preventDefault();
      const i = Number(el.dataset.i);
      const base = ctxN.ui.croce || e.button === 2 ? CROCE : PIENA;
      const valore = stato.celle[i] === base ? VUOTA : base;
      drag = { start: i, valore, celle: [i] };
      ctxN.emetti('cursore', i);
      disponi();
    });
  }
  const puoi = () => stato && !stato.finita && !stato.inPausa;

  function cellaSotto(x, y) {
    const el = document.elementFromPoint(x, y);
    const c = el && el.closest && el.closest('.ng-c');
    return c && tav.contains(c) ? Number(c.dataset.i) : null;
  }
  document.addEventListener('pointermove', (e) => {
    if (!tav || !stato) return;
    const i = cellaSotto(e.clientX, e.clientY);
    if (i !== null && i !== evid) { evid = i; if (!drag) evidenzia(); }
    if (!drag || i === null) return;
    const L = stato.lato;
    const r0 = Math.floor(drag.start / L), c0 = drag.start % L, r = Math.floor(i / L), c = i % L;
    const celle = [];
    // si resta sulla riga o sulla colonna dove ci si è spostati di più
    if (Math.abs(c - c0) >= Math.abs(r - r0)) for (let k = Math.min(c, c0); k <= Math.max(c, c0); k++) celle.push(r0 * L + k);
    else for (let k = Math.min(r, r0); k <= Math.max(r, r0); k++) celle.push(k * L + c0);
    if (celle.join() !== drag.celle.join()) { drag.celle = celle; disponi(); }
  });
  const lascia = () => {
    if (!drag) return;
    const d = drag; drag = null;
    if (!puoi()) return disponi();
    // si mandano solo le caselle che cambiano davvero
    const celle = d.celle.filter((i) => stato.celle[i] !== d.valore && !(stato.sbagliate && stato.sbagliate[i]));
    if (celle.length) {
      stato.celle = stato.celle.slice();
      for (const i of celle) stato.celle[i] = d.valore; // subito sullo schermo, il server conferma
      ctxN.invia({ tipo: 'segna', celle, valore: d.valore });
      suono([[d.valore === PIENA ? 440 : d.valore === CROCE ? 300 : 240, 0.03], ...(celle.length > 1 ? [[d.valore === PIENA ? 520 : 330, 0.03]] : [])], { tipo: 'triangle', volume: 0.04 });
    }
    disponi();
  };
  document.addEventListener('pointerup', lascia);
  document.addEventListener('pointercancel', lascia);

  function evidenzia() {
    if (!tav || !stato) return;
    const L = stato.lato;
    tav.querySelectorAll('.evid').forEach((x) => x.classList.remove('evid'));
    if (evid == null) return;
    const r = Math.floor(evid / L), c = evid % L;
    const ir = tav.querySelector(`.ng-ir[data-r="${r}"]`), ic = tav.querySelector(`.ng-ic[data-c="${c}"]`);
    if (ir) ir.classList.add('evid'); if (ic) ic.classList.add('evid');
  }

  // aggiorna le caselle della griglia viva con lo stato (più l'anteprima del trascinamento)
  function disponi() {
    if (!tav || !stato) return;
    const p = stato, L = p.lato;
    // la misura stimata, poi un controllo vero: se la griglia esce dallo schermo le caselle si stringono
    let c = misura(p);
    tav.style.setProperty('--c', `${c}px`);
    const spazio = Math.min(document.documentElement.clientWidth - 12, 700);
    for (let k = 0; k < 4 && tav.isConnected && tav.offsetWidth > spazio && c > 13; k++) {
      c -= Math.max(1, Math.ceil((tav.offsetWidth - spazio) / (L + 1)));
      tav.style.setProperty('--c', `${c}px`);
    }
    tav.classList.toggle('finita', !!p.finita);
    tav.classList.toggle('svela', !!p.finita && trascorso(ctxN.ui, 'ng-svela') < 2500);
    tav.classList.toggle('ng-in-croce', !!(ctxN && ctxN.ui.croce));
    const anteprima = new Set(drag ? drag.celle : []);
    const celle = tav.querySelectorAll('.ng-c');
    const altri = new Map();
    for (const [posto, cella] of cursori) if (posto !== ctxN.mio && cella != null) altri.set(cella, posto);
    celle.forEach((el, i) => {
      let v = p.celle[i];
      if (anteprima.has(i)) v = drag.valore;
      const sol = p.soluzione ? p.soluzione[i] : null;
      const piena = p.finita ? !!sol : v === PIENA;
      // la casella appena colorata fa un piccolo salto (la classe si toglie subito: la griglia si sposta a ogni
      // aggiornamento e un'animazione lasciata lì ripartirebbe)
      if (piena && !el.classList.contains('piena') && !anteprima.has(i) && !p.finita) { el.classList.add('pop'); setTimeout(() => el.classList.remove('pop'), 220); }
      el.classList.toggle('piena', piena);
      el.classList.toggle('ng-croce', !p.finita && v === CROCE);
      el.classList.toggle('sbagliata', !!(p.sbagliate && p.sbagliate[i]));
      el.classList.toggle('anteprima', anteprima.has(i));
      el.classList.toggle('aiutata', !!(p.ultimoAiuto && p.ultimoAiuto.cella === i && !p.finita && trascorso(ctxN.ui, `ng-aiuto-${p.ultimoAiuto.id}`) < 3000));
      const chi = p.n > 1 && v === PIENA && p.chi[i] != null && !p.finita ? COLORI[p.chi[i] % 4] : '';
      if (el.style.getPropertyValue('--chi') !== chi) el.style.setProperty('--chi', chi);
      const alt = altri.has(i) ? COLORI[altri.get(i) % 4] : '';
      el.classList.toggle('altro', !!alt);
      if (alt) el.style.setProperty('--alt', alt);
      if (p.finita) el.style.setProperty('--d', `${(Math.floor(i / L) + (i % L)) * 18}ms`);
    });
    // i numeri delle linee già completate diventano grigi
    const vals = Array.from({ length: L * L }, (_, i) => (anteprima.has(i) ? drag.valore : p.celle[i]));
    tav.querySelectorAll('.ng-ir').forEach((el, r) => el.classList.toggle('fatta', indiziLinea(vals.slice(r * L, r * L + L)).join() === p.indizi.righe[r].join()));
    tav.querySelectorAll('.ng-ic').forEach((el, c) => el.classList.toggle('fatta', indiziLinea(Array.from({ length: L }, (_, r) => vals[r * L + c])).join() === p.indizi.colonne[c].join()));
  }

  const tavolo = {
    libero: true,
    reset(ctx) { ctxN = ctx; if (!ricevuto.has(ctx.partita)) ricevuto.set(ctx.partita, Date.now()); },
    cursore(ctx, d) { cursori.set(d.posto, d.cella); disponi(); },
    panno(ctx) {
      const p = ctx.partita, ui = ctx.ui;
      const rec = p.finita && p.record.length ? `<div class="bb-record ng-record"><b>🏆 Tempi migliori · ${p.lato}×${p.lato}${p.n > 1 ? ' in squadra' : ''}</b><ol>${p.record.map((x, k) => `<li class="${k === p.posizioneRecord ? 'nuovo' : ''}">${fmt(x.ms)} <small>(${x.errori} errori${x.aiuti ? `, ${x.aiuti} aiuti` : ''}${x.giocatori > 1 ? `, ${x.giocatori} giocatori` : ''})</small></li>`).join('')}</ol></div>` : '';
      const comandi = p.finita ? '' : `<div class="ng-comandi" role="group" aria-label="Strumento">
        <button type="button" class="bottone ng-modo ${ui.croce ? '' : 'attivo'}" data-az="colora" aria-pressed="${!ui.croce}">⬛ Colora</button>
        <button type="button" class="bottone ng-modo ${ui.croce ? 'attivo' : ''}" data-az="croce" aria-pressed="${!!ui.croce}">✕ Croce</button>
        <button type="button" class="bottone" data-az="aiuto" title="Sistema o colora una casella: +30 secondi">💡 Aiuto <small>+30 s</small></button></div>`;
      const msg = p.finita ? `<p class="pa-msg ng-fine">${p.nomeDisegno ? `Era: <b>${esc(p.nomeDisegno)}</b> 🎉` : 'Completato! 🎉'}</p>`
        : `<p class="ng-aiuto-testo">${ui.croce ? 'Tocca le caselle che sono sicuramente vuote' : 'Tocca o trascina per colorare · tasto destro per la croce'}</p>`;
      return `<div class="ng">
        <div class="ng-barra"><span>⏱ <b class="ng-tempo">${fmt(tempo(p))}</b></span><span>${p.lato}×${p.lato}</span><span>Colorate <b>${p.fatte}/${p.piene}</b></span>${p.errori != null ? `<span>Errori <b>${p.errori}</b></span>` : ''}${p.aiuti ? `<span>Aiuti <b>${p.aiuti}</b></span>` : ''}</div>
        <div class="ng-posto"></div>${msg}${comandi}${rec}</div>`;
    },
    dopo(ctx) {
      ctxN = ctx;
      const p = ctx.partita;
      const k = `${p.lato}:${JSON.stringify(p.indizi)}`;
      if (!tav || chiave !== k) { chiave = k; crea(p); cursori.clear(); }
      stato = { ...p, celle: drag && stato ? stato.celle : p.celle.slice(), inPausa: !p.corre && !p.finita };
      if (!drag) stato.celle = p.celle.slice();
      const posto = document.querySelector('.ng-posto');
      if (posto && tav.parentElement !== posto) posto.append(tav);
      disponi();
      if (p.ultimoAiuto && primaVolta(ctx.ui, `ng-a-${p.ultimoAiuto.id}`)) suono([[700, 0.06], [900, 0.08]], { volume: 0.05 });
      if (p.errori && primaVolta(ctx.ui, `ng-e-${p.errori}`)) suono([[180, 0.12]], { tipo: 'sawtooth', volume: 0.03 });
      if (p.finita && primaVolta(ctx.ui, 'ng-fine')) suono([[523, 0.1], [659, 0.1], [784, 0.1], [1046, 0.3]], { volume: 0.08 });
    },
    stato(ctx) { const p = ctx.partita; return p.finita ? null : p.n > 1 ? 'Risolvetelo insieme' : 'Scopri il disegno'; },
    punteggio(ctx) { const p = ctx.partita; return p.n > 1 ? p.colorate.map((x, i) => `<span style="color:${COLORI[i % 4]}">${esc(i === ctx.mio ? 'Tu' : ctx.nome(i))} <b>${x}</b></span>`).join('') : ''; },
    infoPosto(ctx, posto) { const x = ctx.partita.colorate[posto]; return `${x} ${x === 1 ? 'casella' : 'caselle'}`; },
    clic(ctx, el) {
      const az = el.dataset.az;
      if (az === 'colora' || az === 'croce') { ctx.ui.croce = az === 'croce'; return ctx.ridisegna(); }
      if (az === 'aiuto') return ctx.invia({ tipo: 'aiuto' });
    },
  };
  // tasto X: cambia strumento
  document.addEventListener('keydown', (e) => {
    const ctx = ctxN;
    if (!ctx || !ctx.stato || !ctx.partita || ctx.partita.gioco !== 'nonogram' || (window.Boss && Boss.attivo)) return;
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    if (e.key === 'x' || e.key === 'X') { ctx.ui.croce = !ctx.ui.croce; ctx.ridisegna(); }
  });
  window.addEventListener('resize', () => disponi());
  Object.assign(window.Tavoli, { nonogram: tavolo });
})();
