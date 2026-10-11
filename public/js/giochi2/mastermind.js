// CODICE SEGRETO: la plancia di legno con le 10 file di buchi, i pioli colorati e i piolini neri e bianchi della
// risposta. Il codice si compone toccando i colori (o con i tasti 1-8) e si manda con "Prova" (o Invio).
(() => {
  const { esc, ritardo, primaVolta, suono } = window.Nuovi;
  const COLORI = [
    { nome: 'rosso', c: '#e53935' }, { nome: 'blu', c: '#1e6fd9' }, { nome: 'verde', c: '#2e9d4f' }, { nome: 'giallo', c: '#fbd52b' },
    { nome: 'arancio', c: '#fb8c00' }, { nome: 'viola', c: '#8e3fc0' }, { nome: 'azzurro', c: '#3fc6e0' }, { nome: 'rosa', c: '#f27bb5' },
  ];
  let ctxC = null;
  const puoGiocare = (p) => p && p.gioco === 'mastermind' && !p.finita && !p.mioFatto;
  const piolo = (k, extra = '', st = '') => `<span class="mmd-piolo ${extra}" style="--c:${COLORI[k].c};${st}" aria-label="${COLORI[k].nome}"></span>`;
  // i piolini della risposta: prima i neri, poi i bianchi, poi i buchi vuoti
  function risposta(neri, bianchi, n, st = '') {
    const pin = [];
    for (let k = 0; k < n; k++) pin.push(`<i class="${k < neri ? 'nero' : k < neri + bianchi ? 'bianco' : ''}" style="--k:${k};${st}"></i>`);
    return `<span class="mmd-risp n${n}" aria-label="${neri} neri e ${bianchi} bianchi">${pin.join('')}</span>`;
  }

  function scrivi(ctx, k) {
    const p = ctx.partita, ui = ctx.ui;
    if (!puoGiocare(p) || k < 0 || k >= p.colori) return;
    ui.codice = ui.codice || [];
    if (!p.ripetuti && ui.codice.includes(k)) { ui.scossa = Date.now(); return ctx.ridisegna(); }
    const vuoto = Array.from({ length: p.pioli }, (_, i) => i).find((i) => ui.codice[i] == null);
    if (vuoto === undefined) return;
    ui.codice[vuoto] = k;
    ui.messo = { i: vuoto, t: Date.now() }; // solo l'ultimo piolo messo fa il saltello
    suono([[392 + k * 45, 0.05]], { tipo: 'triangle', volume: 0.04 });
    ctx.ridisegna();
  }
  function togli(ctx, i) {
    const ui = ctx.ui;
    ui.codice = ui.codice || [];
    if (i == null) { for (let k = ctx.partita.pioli - 1; k >= 0; k--) if (ui.codice[k] != null) { i = k; break; } }
    if (i == null) return;
    ui.codice[i] = null;
    ctx.ridisegna();
  }
  function prova(ctx) {
    const p = ctx.partita, ui = ctx.ui;
    const c = ui.codice || [];
    if (!puoGiocare(p) || c.length < p.pioli || c.slice(0, p.pioli).some((x) => x == null)) { ui.scossa = Date.now(); return ctx.ridisegna(); }
    ctx.invia({ tipo: 'prova', codice: c.slice(0, p.pioli) });
  }

  function plancia(ctx) {
    const p = ctx.partita, ui = ctx.ui;
    const righe = [];
    const codice = ui.codice || [];
    for (let r = 0; r < p.tentativi; r++) {
      const fatta = p.mie[r];
      const corrente = !fatta && r === p.mie.length && puoGiocare(p);
      const nuova = fatta && r === p.mie.length - 1;
      const st = nuova ? ritardo(ui, `mmd-r-${p.mie.length}-${p.inizio}`) : '';
      let buchi = '';
      for (let i = 0; i < p.pioli; i++) {
        if (fatta) buchi += piolo(fatta.codice[i], '');
        else if (corrente && codice[i] != null) buchi += `<button type="button" class="mmd-buco pieno" data-az="togli" data-i="${i}" aria-label="Togli il piolo ${i + 1}">${piolo(codice[i], ui.messo && ui.messo.i === i && Date.now() - ui.messo.t < 250 ? 'messo' : '')}</button>`;
        else buchi += `<span class="mmd-buco ${corrente ? 'attivo' : ''}"></span>`;
      }
      const scossa = corrente && ui.scossa && Date.now() - ui.scossa < 500 ? 'scossa' : '';
      righe.push(`<div class="mmd-riga ${fatta ? 'fatta' : ''} ${corrente ? 'corrente' : ''} ${nuova ? 'nuova' : ''} ${scossa}" style="--n:${p.pioli}">
        <span class="mmd-num">${r + 1}</span><span class="mmd-buchi">${buchi}</span>${fatta ? risposta(fatta.neri, fatta.bianchi, p.pioli, st) : risposta(0, 0, p.pioli)}</div>`);
    }
    // il codice segreto: coperto da uno sportello finché non si svela
    const segreto = p.segreto
      ? `<div class="mmd-segreto aperto" style="${ritardo(ui, 'mmd-svela')}"><span class="mmd-buchi">${p.segreto.map((k) => piolo(k)).join('')}</span></div>`
      : `<div class="mmd-segreto"><span class="mmd-sportello">🔒 codice segreto</span></div>`;
    return `<div class="mmd-plancia" style="--n:${p.pioli}">${segreto}<div class="mmd-righe">${righe.reverse().join('')}</div></div>`;
  }

  function tavolozza(ctx) {
    const p = ctx.partita, ui = ctx.ui;
    if (!puoGiocare(p)) return '';
    const usati = new Set((ui.codice || []).filter((x) => x != null));
    const pieno = (ui.codice || []).slice(0, p.pioli).filter((x) => x != null).length === p.pioli;
    const colori = COLORI.slice(0, p.colori).map((x, k) => `<button type="button" class="mmd-colore" data-az="colore" data-k="${k}" style="--c:${x.c}" aria-label="${x.nome}" ${(!p.ripetuti && usati.has(k)) || pieno ? 'disabled' : ''}><span>${k + 1}</span></button>`).join('');
    return `<div class="mmd-comandi"><div class="mmd-tavolozza c${p.colori}">${colori}</div>
      <div class="mmd-tasti"><button type="button" class="bottone" data-az="canc" aria-label="Togli l'ultimo piolo">⌫</button><button type="button" class="bottone primario-bt mmd-prova" data-az="prova" ${pieno ? '' : 'disabled'}>Prova ✓</button></div></div>`;
  }

  function avversari(ctx) {
    const p = ctx.partita;
    if (p.n < 2) return '';
    return `<aside class="mmd-altri" aria-label="Gli altri giocatori">${p.altri.map((a, i) => {
      if (i === ctx.mio) return '';
      const stato = a.fatto ? (a.fatto.vinto ? `✅ in ${a.fatto.tentativi}` : a.fatto.ritirato ? 'ritirato' : '❌') : `${a.tentativi}/${p.tentativi}`;
      const righe = a.righe.map((x) => `<div class="mmd-mini">${x.codice ? x.codice.map((k) => `<b style="--c:${COLORI[k].c}"></b>`).join('') : ''}${risposta(x.neri, x.bianchi, p.pioli)}</div>`).join('');
      return `<div class="mmd-altro ${a.fatto && a.fatto.vinto ? 'vinto' : ''}"><p><b>${esc(ctx.nome(i))}</b><span>${stato}</span></p>${righe || '<small>nessun tentativo</small>'}</div>`;
    }).join('')}</aside>`;
  }

  const tavolo = {
    libero: true,
    reset(ctx) {
      ctxC = ctx;
      const p = ctx.partita, ui = ctx.ui;
      // tentativo accettato dal server (o partita nuova): il codice in costruzione si svuota
      const firma = `${p.inizio}:${p.mie.length}`;
      if (ui.csFirma !== firma) { ui.csFirma = firma; ui.codice = []; }
    },
    panno(ctx) {
      const p = ctx.partita;
      let testa;
      if (p.mioFatto || p.finita) {
        const f = p.mioFatto;
        testa = `<p class="mmd-esito ${f && f.vinto ? 'si' : 'no'}">${f && f.vinto ? `Codice trovato in ${f.tentativi} ${f.tentativi === 1 ? 'tentativo' : 'tentativi'}! 🎉` : f && f.ritirato ? 'Ti sei ritirato' : 'Tentativi finiti: ecco il codice'}${!p.finita ? '<small>Aspetta che finiscano gli altri.</small>' : ''}</p>`;
      } else testa = `<p class="mmd-info">${p.pioli} pioli · ${p.colori} colori${p.ripetuti ? ' (anche ripetuti)' : ', tutti diversi'} · tentativo ${p.mie.length + 1} di ${p.tentativi}${p.n > 1 ? ' · stesso codice per tutti' : ''}</p>`;
      const legenda = '<p class="mmd-legenda"><i class="nero"></i> colore e posto giusti · <i class="bianco"></i> colore giusto, posto sbagliato</p>';
      return `<div class="mmd"><div class="mmd-centro">${testa}${plancia(ctx)}${tavolozza(ctx)}${legenda}</div>${avversari(ctx)}</div>`;
    },
    dopo(ctx) {
      const p = ctx.partita, ui = ctx.ui;
      const ultima = p.mie[p.mie.length - 1];
      if (ultima && primaVolta(ui, `mmd-s-${p.inizio}-${p.mie.length}`)) {
        if (ultima.neri === p.pioli) suono([[523, 0.1], [659, 0.1], [784, 0.1], [1046, 0.3]], { volume: 0.08 });
        else suono(Array.from({ length: ultima.neri + ultima.bianchi }, (_, k) => [k < ultima.neri ? 880 : 660, 0.05]).concat([[200, 0.02]]), { tipo: 'sine', volume: 0.05 });
      }
    },
    stato(ctx) {
      const p = ctx.partita;
      if (p.finita) return null;
      if (p.mioFatto) return 'Aspetta gli altri';
      return p.n > 1 ? 'Sfida: trova il codice per primo' : 'Trova il codice segreto';
    },
    punteggio(ctx) {
      const p = ctx.partita;
      if (p.n < 2) return ''; // da soli i tentativi sono già scritti sopra la plancia
      return p.altri.map((a, i) => `<span>${esc(i === ctx.mio ? 'Tu' : ctx.nome(i))} <b>${a.fatto ? (a.fatto.vinto ? `✅${a.fatto.tentativi}` : '❌') : a.tentativi}</b></span>`).join('') + '<span class="obiettivo">meno tentativi vince</span>';
    },
    infoPosto(ctx, posto) {
      const a = ctx.partita.altri[posto];
      return a.fatto ? (a.fatto.vinto ? `✅ in ${a.fatto.tentativi}` : a.fatto.ritirato ? 'ritirato' : '❌ non trovato') : `${a.tentativi} tentativi`;
    },
    clic(ctx, el) {
      const az = el.dataset.az;
      if (az === 'colore') return scrivi(ctx, Number(el.dataset.k));
      if (az === 'togli') return togli(ctx, Number(el.dataset.i));
      if (az === 'canc') return togli(ctx, null);
      if (az === 'prova') return prova(ctx);
    },
  };

  document.addEventListener('keydown', (e) => {
    const ctx = ctxC;
    if (!ctx || !ctx.stato || !puoGiocare(ctx.partita) || (window.Boss && Boss.attivo)) return;
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    if (/^[1-8]$/.test(e.key)) { e.preventDefault(); return scrivi(ctx, Number(e.key) - 1); }
    if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); return togli(ctx, null); }
    if (e.key === 'Enter' && !(e.target.closest && e.target.closest('[data-az], button'))) { e.preventDefault(); return prova(ctx); }
  });
  Object.assign(window.Tavoli, { mastermind: tavolo });
})();
