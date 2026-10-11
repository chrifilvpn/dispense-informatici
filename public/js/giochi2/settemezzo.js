// SETTE E MEZZO: il banco in alto con le sue carte, sotto i posti dei giocatori. Le carte napoletane sono disegnate
// qui in SVG (denari, coppe, spade, bastoni). Le fiche e le puntate funzionano come nel blackjack.
(() => {
  const { esc, primaVolta, suono } = window.Nuovi;

  // ---------- carte napoletane ----------
  const NOMI_SEMI = { d: 'denari', c: 'coppe', s: 'spade', b: 'bastoni' };
  const NOMI_RANGHI = { 1: 'Asso', 8: 'Fante', 9: 'Cavallo', 10: 'Re' };
  const SIGLE = { 8: 'F', 9: 'C', 10: 'R' };
  const nomeCarta = (c) => `${NOMI_RANGHI[c.rango] || c.rango} di ${NOMI_SEMI[c.seme]}`;
  const eMatta = (c) => !!c && c.rango === 10 && c.seme === 'd';
  // i semi (viewBox 0 0 100 100), definiti una volta sola nella pagina
  const SIMBOLI = {
    d: '<circle cx="50" cy="50" r="42" fill="#e3b437" stroke="#8a6410" stroke-width="5"/><circle cx="50" cy="50" r="29" fill="none" stroke="#8a6410" stroke-width="3"/><path d="M50 28 L56 44 L72 50 L56 56 L50 72 L44 56 L28 50 L44 44 Z" fill="#b5322a" stroke="#8a6410" stroke-width="2"/><circle cx="50" cy="50" r="5" fill="#f6e3a1"/>',
    c: '<path d="M18 16 H82 C82 44 70 58 50 60 C30 58 18 44 18 16 Z" fill="#c8362c" stroke="#7a1b14" stroke-width="4"/><path d="M18 16 H82" stroke="#e3b437" stroke-width="7" stroke-linecap="round"/><path d="M44 60 H56 V76 H44 Z" fill="#e3b437" stroke="#8a6410" stroke-width="3"/><path d="M28 88 C30 78 70 78 72 88 Z" fill="#e3b437" stroke="#8a6410" stroke-width="3"/><path d="M30 30 C33 42 40 48 46 50" stroke="#f3a097" stroke-width="4" fill="none" stroke-linecap="round"/>',
    s: '<path d="M50 4 L59 18 V66 H41 V18 Z" fill="#cfe0f5" stroke="#2b5a9e" stroke-width="4" stroke-linejoin="round"/><path d="M50 14 V62" stroke="#7fa6d8" stroke-width="3"/><path d="M24 66 H76 V74 H24 Z" fill="#e3b437" stroke="#8a6410" stroke-width="3"/><path d="M45 74 H55 V92 H45 Z" fill="#2b5a9e"/><circle cx="50" cy="94" r="5" fill="#e3b437" stroke="#8a6410" stroke-width="2"/>',
    b: '<path d="M36 92 C34 70 44 40 58 10 C62 4 72 6 70 14 C62 40 54 70 52 92 Z" fill="#a8743a" stroke="#5d3a14" stroke-width="4" stroke-linejoin="round"/><path d="M48 60 L36 54 M54 38 L66 32 M44 78 L56 74" stroke="#5d3a14" stroke-width="4" stroke-linecap="round"/><path d="M58 10 C60 6 66 4 69 8" stroke="#3f8f3a" stroke-width="6" fill="none" stroke-linecap="round"/>',
  };
  function definisciSimboli() {
    if (document.getElementById('sm-simboli')) return;
    const d = document.createElement('div');
    d.innerHTML = `<svg id="sm-simboli" width="0" height="0" style="position:absolute" aria-hidden="true">${Object.entries(SIMBOLI).map(([s, x]) => `<symbol id="sm-${s}" viewBox="0 0 100 100">${x}</symbol>`).join('')}</svg>`;
    document.body.append(d.firstChild);
  }
  const seme = (s, cls = '') => `<svg class="sm-seme ${cls}" aria-hidden="true"><use href="#sm-${s}"/></svg>`;
  // disposizione dei semi sulle carte numerate (x%, y%)
  const POS = {
    1: [[50, 50]], 2: [[50, 26], [50, 74]], 3: [[50, 20], [50, 50], [50, 80]], 4: [[30, 26], [70, 26], [30, 74], [70, 74]],
    5: [[30, 22], [70, 22], [50, 50], [30, 78], [70, 78]], 6: [[30, 20], [70, 20], [30, 50], [70, 50], [30, 80], [70, 80]],
    7: [[30, 18], [70, 18], [50, 34], [30, 52], [70, 52], [30, 82], [70, 82]],
  };
  // le figure: un personaggio semplice disegnato in SVG (fante a piedi, cavallo, re con la corona)
  const FIGURE = {
    8: '<circle cx="50" cy="26" r="12" fill="#f2c9a0" stroke="#3b2a1a" stroke-width="2.5"/><path d="M38 20 Q50 6 62 20 Z" fill="#7a3fa0"/><path d="M30 92 L36 46 Q50 38 64 46 L70 92 Z" fill="currentColor" opacity=".85"/><path d="M36 46 Q50 56 64 46" stroke="#e3b437" stroke-width="3" fill="none"/>',
    9: '<path d="M22 90 L28 60 Q30 42 46 36 L54 18 Q60 12 66 18 L74 34 Q80 42 74 46 L66 44 L62 56 Q72 64 74 90 Z" fill="#8a5a2b" stroke="#3b2a1a" stroke-width="2.5" stroke-linejoin="round"/><circle cx="64" cy="26" r="2.6" fill="#1b130b"/><path d="M50 22 Q44 30 46 38" stroke="#3b2a1a" stroke-width="4" fill="none"/>',
    10: '<path d="M34 22 L38 8 L45 18 L50 6 L55 18 L62 8 L66 22 Z" fill="#e3b437" stroke="#8a6410" stroke-width="2.5" stroke-linejoin="round"/><circle cx="50" cy="34" r="12" fill="#f2c9a0" stroke="#3b2a1a" stroke-width="2.5"/><path d="M40 40 Q50 52 60 40 L58 48 Q50 54 42 48 Z" fill="#d9d2c4"/><path d="M28 94 L34 52 Q50 44 66 52 L72 94 Z" fill="currentColor" opacity=".85"/><path d="M34 52 Q50 62 66 52" stroke="#e3b437" stroke-width="3" fill="none"/>',
  };
  function fronte(c, cls = '') {
    definisciSimboli();
    const sigla = SIGLE[c.rango] || c.rango;
    let centro;
    if (c.rango <= 7) centro = `<div class="sm-pip ${c.rango === 1 ? 'asso' : ''}">${POS[c.rango].map(([x, y]) => `<span style="left:${x}%;top:${y}%">${seme(c.seme)}</span>`).join('')}</div>`;
    else centro = `<div class="sm-figura"><svg class="sm-fig-disegno" viewBox="18 2 64 96" aria-hidden="true">${FIGURE[c.rango]}</svg>${seme(c.seme, 'sm-fig-seme')}</div>`;
    const matta = eMatta(c) ? '<span class="sm-matta-tag">matta</span>' : '';
    return `<div class="carta sm-carta sm-${c.seme} ${eMatta(c) ? 'sm-matta' : ''} ${cls}" data-id="${esc(c.id)}" title="${nomeCarta(c)}${eMatta(c) ? ' (la matta)' : ''}">
      <span class="sm-indice"><b>${sigla}</b>${seme(c.seme)}</span>${centro}${matta}</div>`;
  }

  // ---------- pezzi del casinò (come nel blackjack) ----------
  const ricevuto = new WeakMap();
  const segnaRicevuto = (ctx) => { if (ctx.partita && !ricevuto.has(ctx.partita)) ricevuto.set(ctx.partita, Date.now()); };
  const contoAlla = (ctx, ms, testo) => (ms == null ? '' : `<span class="cs-conto" data-fine="${(ricevuto.get(ctx.partita) || Date.now()) + ms}" data-testo="${esc(testo)}">${esc(testo)} ${Math.ceil(ms / 1000)}s</span>`);
  // (il conto alla rovescia lo fa scorrere il timer comune dei giochi da casinò, che aggiorna tutti i .cs-conto)
  const fmtFiche = (n) => Number(n).toLocaleString('it-IT');
  const GETTONI = [5, 25, 100, 500];
  const gettone = (v, cls = '') => `<span class="cs-gettone g${v >= 500 ? 500 : v >= 100 ? 100 : v >= 25 ? 25 : 5} ${cls}">${v >= 1000 ? `${Math.round(v / 100) / 10}k` : v}</span>`;
  function selettore(ctx, chiave, fiche) {
    const v = Math.min(ctx.ui[chiave] || 0, fiche);
    return `<div class="cs-selettore">
      <div class="cs-gettoni">${GETTONI.map((g) => `<button type="button" class="cs-gettone-bt" data-az="aggiungi" data-k="${chiave}" data-v="${g}" ${g > fiche - v ? 'disabled' : ''} aria-label="Aggiungi ${g}">${gettone(g)}</button>`).join('')}
        <button type="button" class="bottone mini-bt" data-az="tutto" data-k="${chiave}">Tutto</button>
        <button type="button" class="bottone mini-bt" data-az="azzera" data-k="${chiave}" ${v ? '' : 'disabled'}>Azzera</button></div>
      <p class="cs-importo">Puntata: <b>${fmtFiche(v)}</b> <small>su ${fmtFiche(fiche)} fiche</small></p></div>`;
  }
  function clicFiche(ctx, el) {
    const ui = ctx.ui, p = ctx.partita, az = el.dataset.az, k = el.dataset.k;
    const fiche = p.fiche[ctx.mio];
    if (az === 'aggiungi') { ui[k] = Math.min(fiche, (ui[k] || 0) + Number(el.dataset.v)); suono([[700, 0.03]], { volume: 0.03 }); ctx.ridisegna(); return true; }
    if (az === 'tutto') { ui[k] = fiche; ctx.ridisegna(); return true; }
    if (az === 'azzera') { ui[k] = 0; ctx.ridisegna(); return true; }
    if (az === 'passa') { ctx.invia({ tipo: 'passa' }); return true; }
    if (az === 'ricarica') { ctx.chat('!ricarica'); return true; }
    return false;
  }
  function statoPuntata(ctx, posto) {
    const p = ctx.partita;
    if (p.fiche[posto] <= 0 && !p.puntato[posto]) return '<span class="cs-badge rosso">senza fiche</span>';
    if (p.fase !== 'puntate' || p.inAttesa) return '';
    if (p.puntato[posto]) return '<span class="cs-badge verde">ha puntato ✓</span>';
    if (p.passato[posto]) return '<span class="cs-badge">passa</span>';
    return '<span class="cs-badge">sta puntando…</span>';
  }
  function pannelloPuntate(ctx, dentro) {
    const p = ctx.partita, io = ctx.mio;
    if (p.fase !== 'puntate' || p.inAttesa) return '';
    const conto = contoAlla(ctx, p.tempoPuntate, 'Puntate chiuse tra');
    if (p.fiche[io] <= 0 && !p.puntato[io]) {
      return `<div class="cs-pannello"><p><b>Hai finito le fiche.</b> Per averne altre 1000 scrivi <b>!ricarica</b> in chat.</p>
        <button type="button" class="bottone primario-bt" data-az="ricarica">💰 Ricarica 1000 fiche</button></div>`;
    }
    if (p.puntato[io] || p.passato[io]) return `<div class="cs-pannello"><p>${p.puntato[io] ? 'Puntata fatta ✓' : 'Salti questa mano'}. Aspettiamo gli altri… ${conto}</p></div>`;
    return `<div class="cs-pannello">${dentro}${conto ? `<p class="piccolo">${conto}</p>` : ''}</div>`;
  }
  // carte che entrano con un'animazione, ma solo la prima volta che si vedono; la carta coperta si gira quando si scopre
  function carta(ctx, c, chiave) {
    const ui = ctx.ui;
    ui.smViste = ui.smViste || new Set();
    if (!c) {
      const nuova = !ui.smViste.has(`${chiave}-coperta`);
      ui.smViste.add(`${chiave}-coperta`);
      return Carte.retro(`cs-carta ${nuova ? 'arriva' : ''}`);
    }
    const k = `${chiave}-${c.id}`;
    const nuova = !ui.smViste.has(k);
    ui.smViste.add(k);
    const gira = nuova && ui.smViste.has(`${chiave}-coperta`);
    return fronte(c, `cs-carta ${nuova ? (gira ? 'gira' : 'arriva') : ''}`);
  }
  const fmt = (m) => { const i = Math.floor(m / 2); return m % 2 ? (i ? `${i} e ½` : '½') : `${i}`; };
  const ESITI = { vince: 'Vinta', perde: 'Persa', sballato: 'Sballato', settemezzo: 'Sette e mezzo! ×2' };

  function manoSM(ctx, m, k, attiva) {
    const mano = ctx.ui.smMano || 0;
    const badge = m.esito ? `<span class="cs-badge ${['vince', 'settemezzo'].includes(m.esito) ? 'verde' : 'rosso'}">${ESITI[m.esito]}${m.vincita ? ` ${m.vincita > 0 ? '+' : ''}${fmtFiche(m.vincita)}` : ''}</span>`
      : m.stato === 'sballato' ? '<span class="cs-badge rosso">Sballato</span>' : m.setteMezzo ? '<span class="cs-badge verde">Sette e mezzo!</span>' : m.stato === 'stai' ? '<span class="cs-badge">sta</span>' : '';
    const tot = !m.carte.length ? '' : m.coperta ? (m.carte.length > 1 ? `${fmt(m.mezzi)} + ?` : '?') : fmt(m.mezzi);
    return `<div class="bj-mano sm-mano ${attiva ? 'attiva' : ''} ${m.stato === 'sballato' ? 'sm-sballata' : ''}"><div class="cs-carte">${m.carte.map((c, j) => carta(ctx, c, `${mano}-${k}-${j}`)).join('')}</div>
      <div class="bj-info"><span class="bj-tot">${tot}</span>${gettone(m.puntata)}${badge}</div></div>`;
  }

  const tavolo = {
    libero: true,
    reset(ctx) {
      segnaRicevuto(ctx);
      const ui = ctx.ui;
      if (ui.smConsiglio === undefined) { try { ui.smConsiglio = localStorage.getItem('if:smConsiglio') === '1'; } catch { ui.smConsiglio = false; } }
      if (ui.smMano !== ctx.partita.nMano) { ui.smMano = ctx.partita.nMano; ui.smViste = new Set(); }
    },
    panno(ctx) {
      const p = ctx.partita, io = ctx.mio, ui = ctx.ui;
      const b = p.banco;
      const bancoTot = !b.carte.length ? '' : b.coperta ? (b.carte.length > 1 ? `<b>${fmt(b.mezzi)}</b> + ?` : '<b>?</b>') : `<b>${fmt(b.mezzi)}</b>${b.sballato ? ' <span class="cs-badge rosso">sballa</span>' : ''}`;
      const banco = `<div class="bj-banco sm-banco"><p class="cs-etichetta">Banco ${bancoTot ? `· ${bancoTot}` : ''}</p>
        <div class="cs-carte">${b.carte.map((c, j) => carta(ctx, c, `${ui.smMano}-b-${j}`)).join('') || '<div class="carta vuota cs-carta"></div>'}</div>
        <p class="bj-regola">Il banco sta a ${p.soglia} · vince le parità · Sette e mezzo con due carte paga doppio · Re di denari matta</p></div>`;
      const posto = (k) => {
        const m = p.mani[k];
        const turno = p.turno === k;
        const netto = p.esiti && p.esiti[k] ? `<span class="cs-netto ${p.esiti[k].netto > 0 ? 'su' : p.esiti[k].netto < 0 ? 'giu' : ''}">${p.esiti[k].netto > 0 ? '+' : ''}${fmtFiche(p.esiti[k].netto)}</span>` : '';
        return `<div class="bj-posto sm-posto ${k === io ? 'mio' : ''} ${turno ? 'di-turno' : ''}">
          <p class="cs-nome">${esc(k === io ? 'Tu' : ctx.nome(k))} <small>${fmtFiche(p.fiche[k])} fiche</small> ${netto} ${p.fase === 'puntate' ? statoPuntata(ctx, k) : ''}</p>
          ${m ? `<div class="bj-mani">${manoSM(ctx, m, k, turno && p.fase === 'turni')}</div>` : p.fase !== 'puntate' ? '<p class="sm-fuori">non gioca questa mano</p>' : ''}</div>`;
      };
      const mio = io >= 0 && io < p.n ? posto(io) : '';
      const altri = Array.from({ length: p.n }, (_, k) => k).filter((k) => k !== io).map(posto).join('');
      let comandi = '';
      const az = p.azioni || {};
      if (az.carta) {
        const c = ui.smConsiglio && p.consiglio ? p.consiglio : null;
        const consiglio = c ? `<p class="sm-consiglio">Se chiedi carta: <b>${c.sballo}%</b> di sballare <span class="sm-barra"><i style="width:${c.sballo}%"></i></span> · il computer difficile ${c.mossa === 'carta' ? '<b>chiederebbe carta</b>' : '<b>starebbe</b>'}</p>` : '';
        comandi = `<div class="cs-pannello"><div class="bj-comandi">
          <button type="button" class="bottone primario-bt ${c && c.mossa === 'carta' ? 'bj-consigliato' : ''}" data-az="carta">Carta</button>
          <button type="button" class="bottone primario-bt ${c && c.mossa === 'stai' ? 'bj-consigliato' : ''}" data-az="stai">Stai</button></div>
          ${consiglio}
          <p class="piccolo">${contoAlla(ctx, p.tempoDecisione, 'Tempo per decidere:')}
          <button type="button" class="bottone mini-bt bj-cons-bt" data-az="consiglio" aria-pressed="${!!ui.smConsiglio}">💡 Consiglio</button></p></div>`;
      }
      const punta = pannelloPuntate(ctx, `${selettore(ctx, 'sm', p.fiche[io])}
        <div class="bj-comandi"><button type="button" class="bottone primario-bt" data-az="punta" ${(ui.sm || 0) > 0 ? '' : 'disabled'}>Punta ${fmtFiche(Math.min(ui.sm || 0, p.fiche[io]))}</button>
        <button type="button" class="bottone" data-az="passa">Passo questa mano</button></div>`);
      // sotto il banco il mio posto e i comandi, poi gli altri giocatori
      return `<div class="cs bj sm">${banco}<div class="bj-giocatori">${mio}</div>${comandi}${punta}${altri ? `<div class="bj-giocatori">${altri}</div>` : ''}<p class="cs-scarpa">Mazzo: ${p.carteMazzo} carte (si mescola a ogni mano)</p></div>`;
    },
    dopo(ctx) {
      const p = ctx.partita;
      const e = p.evento;
      if (e && primaVolta(ctx.ui, `sm-ev-${e.id}`)) {
        if (/sballa/.test(e.testo)) suono([[300, 0.12], [200, 0.25]], { volume: 0.05 });
        else if (e.forte) suono([[523, 0.09], [659, 0.09], [784, 0.18]], { volume: 0.06 });
      }
      if (p.fase === 'pagamenti' && p.esiti && p.esiti[ctx.mio] && primaVolta(ctx.ui, `sm-pag-${p.nMano}`)) {
        const n = p.esiti[ctx.mio].netto;
        if (n > 0) suono([[660, 0.08], [880, 0.14]], { volume: 0.06 });
        else if (n < 0) suono([[260, 0.18]], { volume: 0.04 });
      }
    },
    stato(ctx) {
      const p = ctx.partita;
      if (p.fase === 'puntate') return 'Fate le vostre puntate';
      if (p.fase === 'turni') return p.turno === ctx.mio ? 'Tocca a te: carta o stai?' : `Tocca a ${ctx.nome(p.turno)}`;
      return null;
    },
    statoAttesa(ctx) { return ctx.partita.fase === 'banco' ? 'Gioca il banco…' : 'Pagamenti'; },
    infoPosto(ctx, posto) { return `${fmtFiche(ctx.partita.fiche[posto])} fiche ${statoPuntata(ctx, posto)}`; },
    clic(ctx, el) {
      if (clicFiche(ctx, el)) return;
      const az = el.dataset.az, p = ctx.partita;
      if (az === 'punta') { const v = Math.min(ctx.ui.sm || 0, p.fiche[ctx.mio]); if (v > 0) ctx.invia({ tipo: 'punta', importo: v }); return; }
      if (az === 'consiglio') { ctx.ui.smConsiglio = !ctx.ui.smConsiglio; try { localStorage.setItem('if:smConsiglio', ctx.ui.smConsiglio ? '1' : ''); } catch {} ctx.ridisegna(); return; }
      if (az === 'carta' || az === 'stai') { el.disabled = true; ctx.invia({ tipo: az }); }
    },
    _fronte: fronte,
  };
  Object.assign(window.Tavoli, { settemezzo: tavolo });
})();
