// CONNESSIONI: il tavolo nel browser. 4×4 tessere da toccare (ne scegli 4 e confermi), i gruppi trovati salgono in
// alto con il loro colore e la spiegazione; sotto gli errori rimasti e i comandi. Nella sfida, nella fila in alto,
// accanto a ogni nome i colori dei gruppi trovati dagli altri (non le parole) e i loro errori.
(() => {
  const { esc, suono, ritardo } = window.Nuovi;
  const NOMI_COLORE = { giallo: 'Giallo', verde: 'Verde', blu: 'Blu', viola: 'Viola' };
  let ctxC = null;

  const gioca = (ctx) => { const p = ctx.partita; return p && p.gioco === 'connessioni' && !p.finita && !p.mioFatto; };
  const mescola = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // parole lunghe: un trattino "morbido" tra due sillabe vicino a metà, così vanno a capo bene nella tessera del
  // telefono (SETTEN-TRIONE, TRAMON-TANA, PISTAC-CHIO). Si spezza prima di una consonante seguita da vocale (o da L/R,
  // come in TR, BR…, o da H, come in CH e GH) se prima c'è una vocale, una doppia o L, M, N, R.
  const VOC = 'AEIOUÀÈÉÌÒÙ';
  function puoSpezzare(w, i) {
    const a = w[i - 1], c = w[i], d = w[i + 1];
    if (!a || !d || VOC.includes(c)) return false;
    const attacco = VOC.includes(d) || ('LR'.includes(d) && 'BCDFGPTV'.includes(c)) || (d === 'H' && 'CG'.includes(c) && VOC.includes(w[i + 2] || ''));
    // la S seguita da consonante va con la sillaba dopo (INDU-STRIALE, JAVA-SCRIPT)
    if (c === 'S' && d !== 'S' && !VOC.includes(d)) return VOC.includes(a);
    return attacco && (VOC.includes(a) || a === c || 'LMNR'.includes(a));
  }
  function spezza(w) {
    if (w.length < 10) return { html: esc(w), l: w.length };
    const m = Math.ceil(w.length / 2);
    let k = -1;
    for (let d = 0; d < 5 && k < 0; d++) for (const i of [m + d, m - d]) if (i >= 2 && i <= w.length - 2 && puoSpezzare(w, i)) { k = i; break; }
    if (k < 0) k = m;
    return { html: `${esc(w.slice(0, k))}&shy;${esc(w.slice(k))}`, l: Math.max(k, w.length - k) + 1 };
  }

  // l'ordine delle tessere: quello del server, rimescolato quando si preme Mescola
  function ordine(ctx) {
    const p = ctx.partita, ui = ctx.ui;
    const ci = new Set(p.parole);
    if (!ui.ordine) ui.ordine = [...p.parole];
    ui.ordine = ui.ordine.filter((w) => ci.has(w));
    for (const w of p.parole) if (!ui.ordine.includes(w)) ui.ordine.push(w);
    ui.sel = (ui.sel || []).filter((w) => ci.has(w));
    return ui.ordine;
  }

  function fascia(g, extra = '', stile = '') {
    return `<div class="cn-gruppo cn-${g.colore} ${extra}" style="${stile}" role="group" aria-label="Gruppo ${NOMI_COLORE[g.colore]}: ${esc(g.tema)}">
      <b>${esc(g.tema)}</b><span>${g.parole.map(esc).join(' · ')}</span>${g.spiegazione ? `<small>${esc(g.spiegazione)}</small>` : ''}</div>`;
  }

  function griglia(ctx) {
    const p = ctx.partita, ui = ctx.ui;
    const trovati = p.trovati.map((g, i) => fascia(g, 'trovato', i === p.trovati.length - 1 || (p.ultimo && p.ultimo.anche != null && i === p.trovati.length - 2) ? ritardo(ui, `cn-g-${g.colore}`) : '')).join('');
    let resto = '';
    if (p.soluzione && p.parole.length) {
      // a partita finita (o persa) si vedono anche i gruppi non trovati
      const presi = new Set(p.trovati.map((g) => g.colore));
      resto = p.soluzione.filter((g) => !presi.has(g.colore)).map((g) => fascia(g, 'mancato')).join('');
    } else {
      const attiva = gioca(ctx);
      const scossa = ui.scossa && Date.now() - ui.scossa < 600;
      resto = ordine(ctx).map((w) => {
        const sel = ui.sel.includes(w);
        const s = spezza(w);
        return `<button type="button" class="cn-tessera ${sel ? 'sel' : ''} ${sel && scossa ? 'scossa' : ''}" data-az="tessera" data-w="${esc(w)}" style="--l:${s.l}" aria-pressed="${sel}" ${attiva ? '' : 'disabled'}><span>${s.html}</span></button>`;
      }).join('');
    }
    return `<div class="cn-griglia">${trovati}${resto}</div>`;
  }

  function errori(p) {
    const restano = Math.max(0, p.maxErrori - p.errori);
    const pallini = Array.from({ length: p.maxErrori }, (_, i) => `<i class="${i < restano ? 'pieno' : ''}"></i>`).join('');
    return `<p class="cn-errori" aria-label="Errori rimasti: ${restano}">Errori rimasti <span>${pallini}</span></p>`;
  }

  function comandi(ctx) {
    const p = ctx.partita, ui = ctx.ui;
    if (!gioca(ctx)) return '';
    const n = ui.sel.length;
    return `<div class="cn-comandi">
      <button type="button" class="bottone" data-az="mescola">🔀 Mescola</button>
      <button type="button" class="bottone" data-az="deseleziona" ${n ? '' : 'disabled'}>Deseleziona</button>
      <button type="button" class="bottone primario-bt" data-az="conferma" ${n === 4 ? '' : 'disabled'}>Conferma${n && n < 4 ? ` <small>${n}/4</small>` : ''}</button>
    </div>
    <p class="cn-arrendi"><button type="button" class="cn-link" data-az="arrenditi">${ui.arrendi ? 'Sicuro? Tocca ancora per arrenderti' : 'Mi arrendo'}</button></p>`;
  }

  // i quadratini delle prove (come la condivisione del gioco originale): un colore per parola
  function prove(p) {
    if (!p.prove.length || !p.soluzione) return '';
    const colDi = {};
    for (const g of p.soluzione) for (const w of g.parole) colDi[w] = g.colore;
    return `<div class="cn-prove" aria-label="Le tue prove">${p.prove.map((x) => `<div>${x.parole.map((w) => `<i class="cn-q cn-${colDi[w]}"></i>`).join('')}</div>`).join('')}</div>`;
  }

  function testa(ctx) {
    const p = ctx.partita;
    const f = p.mioFatto;
    if (f || p.finita) {
      const vinto = f && f.vinto;
      const msg = vinto ? (f.errori === 0 ? 'Perfetto! Nessun errore 🎉' : `Risolto con ${f.errori} ${f.errori === 1 ? 'errore' : 'errori'}! 🎉`)
        : f && f.ritirato ? 'Ti sei arreso: ecco la soluzione' : 'Errori finiti… ecco la soluzione';
      return `<p class="cn-esito ${vinto ? 'si' : 'no'}">${msg}${!p.finita ? '<small>Aspetta che finiscano gli altri.</small>' : ''}</p>`;
    }
    return `<p class="cn-info">Crea quattro gruppi di quattro${p.n > 1 ? ' · stesso puzzle per tutti' : ''}</p>`;
  }

  const tavolo = {
    libero: true,
    reset(ctx) { ctxC = ctx; },
    panno(ctx) {
      const p = ctx.partita;
      return `<div class="cn"><div class="cn-centro">${testa(ctx)}${griglia(ctx)}${p.mioFatto || p.finita ? prove(p) : errori(p)}${comandi(ctx)}</div></div>`;
    },
    dopo(ctx) {
      const p = ctx.partita, ui = ctx.ui;
      const u = p.ultimo;
      // appena entrati (o tornati al tavolo): niente suoni per le prove vecchie
      if (ui._vista === undefined) { ui._vista = u ? u.n : 0; return; }
      if (!u || u.n <= ui._vista) return;
      ui._vista = u.n;
      if (u.esito === 'giusto') { suono([[523, 0.08], [659, 0.08], [784, 0.14]], { volume: 0.06 }); ui.sel = []; }
      else {
        suono([[220, 0.12], [180, 0.18]], { tipo: 'sawtooth', volume: 0.05 });
        ui.scossa = Date.now();
        ctx.avviso(u.esito === 'quasi' ? 'Quasi! Ne manca una…' : 'Non è un gruppo', 1600);
        setTimeout(() => { if (ctxC === ctx && ctx.stato) ctx.ridisegna(); }, 650);
        ctx.ridisegna();
      }
    },
    stato(ctx) {
      const p = ctx.partita;
      if (p.finita) return null;
      if (p.mioFatto) return 'Aspetta gli altri';
      return p.n > 1 ? 'Sfida: trova i 4 gruppi' : 'Trova i 4 gruppi';
    },
    punteggio(ctx) {
      const p = ctx.partita;
      if (p.n < 2) return `<span>Gruppi <b>${p.trovati.length}</b>/4</span><span>Errori <b>${p.errori}</b>/${p.maxErrori}</span>`;
      return p.altri.map((a, i) => `<span>${esc(i === ctx.mio ? 'Tu' : ctx.nome(i))} <b>${a.colori.length}</b><small>/4</small>${a.fatto && a.fatto.vinto ? ' ✅' : ''}</span>`).join('');
    },
    infoPosto(ctx, posto) {
      const a = ctx.partita.altri[posto];
      if (!a) return '';
      // i colori dei gruppi trovati (non le parole) e gli errori
      const quadri = [0, 1, 2, 3].map((k) => `<i class="${a.colori[k] ? `cn-${a.colori[k]}` : ''}"></i>`).join('');
      const stato = a.fatto ? (a.fatto.vinto ? ' ✅' : a.fatto.ritirato ? ' ritirato' : ' ❌') : '';
      return `<span class="cn-mini" title="${a.colori.length} gruppi su 4">${quadri}</span> ${a.errori} err.${stato}`;
    },
    clic(ctx, el) {
      const ui = ctx.ui, az = el.dataset.az;
      if (az !== 'arrenditi') ui.arrendi = false;
      if (az === 'tessera') {
        if (!gioca(ctx)) return;
        const w = el.dataset.w;
        if (ui.sel.includes(w)) ui.sel = ui.sel.filter((x) => x !== w);
        else if (ui.sel.length < 4) ui.sel.push(w);
        else return ctx.avviso('Hai già scelto 4 parole', 1100);
        return ctx.ridisegna();
      }
      if (az === 'mescola') { ui.ordine = mescola([...ctx.partita.parole]); return ctx.ridisegna(); }
      if (az === 'deseleziona') { ui.sel = []; return ctx.ridisegna(); }
      if (az === 'conferma') return conferma(ctx);
      if (az === 'arrenditi') {
        if (!ui.arrendi) { ui.arrendi = true; return ctx.ridisegna(); }
        ui.arrendi = false;
        return ctx.invia({ tipo: 'arrenditi' });
      }
    },
  };

  function conferma(ctx) {
    const ui = ctx.ui;
    if (!gioca(ctx)) return;
    if (ui.sel.length !== 4) return ctx.avviso('Scegli 4 parole', 1200);
    const p = ctx.partita;
    const k = [...ui.sel].sort().join('|');
    if (p.prove.some((x) => [...x.parole].sort().join('|') === k)) return ctx.avviso('Hai già provato queste quattro', 1500);
    ctx.invia({ tipo: 'prova', parole: [...ui.sel] });
  }

  // Invio sulla tastiera = Conferma
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !ctxC || !ctxC.stato || !gioca(ctxC)) return;
    if (e.ctrlKey || e.metaKey || e.altKey || (e.target.closest && e.target.closest('input, textarea, select, button'))) return;
    if ((window.Boss && Boss.attivo) || !document.querySelector('.cn')) return;
    e.preventDefault();
    conferma(ctxC);
  });

  Object.assign(window.Tavoli, { connessioni: tavolo });
})();
