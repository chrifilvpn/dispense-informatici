// BURRACO: tallone e scarti in alto (gli scarti sono tutti in vista: si prendono tutti insieme), poi le combinazioni
// della mia squadra (si toccano per attaccare) e quelle degli avversari. Sotto la mano: si toccano le carte per
// selezionarle; con 3 o più carte che stanno insieme appare "Cala", con una sola "Scarta".
(() => {
  const { esc, primaVolta, suono } = window.Nuovi;

  // ---- regole delle combinazioni: copia di giochi2/burraco-regole.js (un test controlla che siano uguali) ----
  const SEMI = ['c', 'q', 'f', 'p'];
  const punti = (c) => (c.jolly ? 30 : c.rango === 2 ? 20 : c.rango === 1 ? 15 : c.rango >= 8 ? 10 : 5);
  const eMatta = (c) => !!c.jolly || c.rango === 2;
  function provaScala(nat, matta) {
    if (nat.length < 2 || nat.some((c) => c.jolly)) return null;
    const s = nat[0].seme;
    if (!nat.every((c) => c.seme === s)) return null;
    const assi = nat.filter((c) => c.rango === 1);
    if (assi.length > 2) return null;
    const altre = nat.filter((c) => c.rango !== 1);
    const modi = assi.length === 0 ? [[]] : assi.length === 1 ? [[1], [14]] : [[1, 14]];
    let migliore = null;
    for (const m of modi) {
      const pos = [...altre.map((c) => c.rango), ...m];
      const carte = [...altre, ...assi];
      if (new Set(pos).size !== pos.length) continue;
      const min = Math.min(...pos), max = Math.max(...pos);
      const buchi = max - min + 1 - pos.length;
      if (buchi > (matta ? 1 : 0)) continue;
      let posMatta = null;
      if (matta) {
        if (buchi === 1) { for (let x = min; x <= max; x++) if (!pos.includes(x)) posMatta = x; }
        else if (max < 14) posMatta = max + 1;
        else if (min > 1) posMatta = min - 1;
        else continue;
      }
      const da = posMatta != null ? Math.min(min, posMatta) : min;
      const a = posMatta != null ? Math.max(max, posMatta) : max;
      const fila = [];
      for (let x = da; x <= a; x++) fila.push(x === posMatta ? matta : carte[pos.indexOf(x)]);
      const r = { tipo: 'scala', seme: s, carte: fila, matta: matta ? matta.id : null, da, a };
      if (!migliore) migliore = r;
    }
    return migliore;
  }
  function provaGruppo(nat, matta) {
    if (nat.length < 2 || nat.some((c) => c.jolly)) return null;
    const r = nat[0].rango;
    if (r === 2 || !nat.every((c) => c.rango === r)) return null;
    const ordinate = [...nat].sort((a, b) => SEMI.indexOf(a.seme) - SEMI.indexOf(b.seme));
    return { tipo: 'gruppo', rango: r, carte: matta ? [...ordinate, matta] : ordinate, matta: matta ? matta.id : null };
  }
  function valuta(carte, tipo) {
    if (!Array.isArray(carte) || carte.length < 3 || carte.some((c) => !c)) return null;
    if (carte.filter((c) => c.jolly).length > 1) return null;
    const jolly = carte.find((c) => c.jolly);
    const scelte = jolly ? [jolly] : [null, ...carte.filter((c) => c.rango === 2)];
    for (const t of tipo ? [tipo] : ['scala', 'gruppo']) {
      for (const m of scelte) {
        const nat = carte.filter((c) => c !== m);
        const v = t === 'scala' ? provaScala(nat, m) : provaGruppo(nat, m);
        if (v) return completa(v);
      }
    }
    return null;
  }
  function completa(v) {
    v.punti = v.carte.reduce((s, c) => s + punti(c), 0);
    v.burraco = v.carte.length >= 7 ? (v.matta ? 'sporco' : 'pulito') : null;
    return v;
  }
  // ---- fine della copia ----

  const NOMI_RANGO = { 1: 'assi', 11: 'fanti', 12: 'donne', 13: 're' };
  const NOMI_SEME = { c: 'cuori', q: 'quadri', f: 'fiori', p: 'picche' };
  const ORD_SEMI = ['c', 'f', 'q', 'p']; // rosso, nero, rosso, nero
  const valoreOrd = (c) => (c.rango === 1 ? 14 : c.rango);
  function ordina(mano, modo) {
    return [...mano].sort((a, b) => {
      const ma = eMatta(a), mb = eMatta(b);
      if (ma !== mb) return ma ? 1 : -1; // le matte in fondo
      if (ma) return (a.jolly ? 1 : 0) - (b.jolly ? 1 : 0) || ORD_SEMI.indexOf(a.seme) - ORD_SEMI.indexOf(b.seme);
      if (modo === 'valore') return valoreOrd(a) - valoreOrd(b) || ORD_SEMI.indexOf(a.seme) - ORD_SEMI.indexOf(b.seme);
      return ORD_SEMI.indexOf(a.seme) - ORD_SEMI.indexOf(b.seme) || valoreOrd(a) - valoreOrd(b);
    });
  }
  // le pinelle hanno un piccolo segno ★ (sono matte)
  const F = (c, cls = '', attr = '') => Carte.fronte(c, `${cls} ${c.rango === 2 ? 'bu-pinella' : ''}`, attr);
  const nomeComb = (m) => (m.tipo === 'scala' ? `Scala di ${NOMI_SEME[m.seme]}` : `Combinazione di ${NOMI_RANGO[m.rango] || `${m.rango}`}`);
  const plur = (n, a, b) => `${n} ${n === 1 ? a : b}`;

  function statoUi(ctx) {
    const ui = ctx.ui;
    const ids = new Set((ctx.partita.mano || []).map((c) => c.id));
    ui.sel = (ui.sel || []).filter((id) => ids.has(id));
    if (!ui.ordine) { try { ui.ordine = localStorage.getItem('bu-ordine') === 'valore' ? 'valore' : 'seme'; } catch { ui.ordine = 'seme'; } }
    ui.vistiComb = ui.vistiComb || {};
    return ui;
  }
  const carteSel = (ctx) => ctx.ui.sel.map((id) => ctx.partita.mano.find((c) => c.id === id)).filter(Boolean);
  const mioTurnoGioca = (ctx) => { const mt = ctx.partita.mioTurno; return !!mt && mt.fase === 'gioca'; };
  // come sul server: con il pozzetto preso bisogna tenere una carta da scartare, e una sola solo con un burraco
  function restoOk(ctx, quante, burracoDopo) {
    const p = ctx.partita, mt = p.mioTurno;
    if (!mt || !mt.pozzetto) return true;
    const rimaste = p.mano.length - quante;
    return rimaste >= 2 || (rimaste === 1 && (mt.burraco || burracoDopo));
  }
  function attaccaQui(ctx, m, sel) {
    const v = sel.length ? valuta([...m.carte, ...sel], m.tipo) : null;
    return !!v && restoOk(ctx, sel.length, !!v.burraco);
  }
  const nomeSquadra = (ctx, t, maiuscola = true) => {
    const p = ctx.partita;
    if (p.aSquadre) return t === p.squadra ? (maiuscola ? 'Voi' : 'voi') : (maiuscola ? 'Loro' : 'loro');
    return t === p.squadra ? (maiuscola ? 'Tu' : 'te') : ctx.nome(t);
  };

  function disegnaComb(ctx, m, attaccabile) {
    const ui = ctx.ui;
    const prima = ui.vistiComb[m.id];
    const nuova = prima === undefined ? 'bu-nuova' : prima < m.carte.length ? 'bu-cresce' : '';
    ui.vistiComb[m.id] = m.carte.length;
    const badge = m.burraco ? `<span class="bu-badge ${m.burraco}">Burraco ${m.burraco}</span>` : m.carte.length === 6 ? '<span class="bu-badge quasi">manca 1</span>' : '';
    const attr = attaccabile ? `data-az="attacca" data-comb="${esc(m.id)}" role="button" tabindex="0" aria-label="Attacca a ${nomeComb(m)}"` : '';
    return `<div class="bu-comb ${m.burraco ? `bu-burraco ${m.burraco}` : ''} ${attaccabile ? 'selezionabile' : ''} ${nuova}" ${attr} title="${nomeComb(m)}: ${m.carte.length} carte, ${m.punti} punti">
      <div class="bu-comb-carte">${m.carte.map((c) => F(c, `mini ${c.id === m.matta ? 'bu-matta' : ''}`)).join('')}</div>
      <div class="bu-comb-info">${badge}<span>${m.carte.length}</span></div></div>`;
  }

  function zona(ctx, t) {
    const p = ctx.partita;
    const mia = t === p.squadra;
    const comb = p.combinazioni[t];
    const sel = mia && mioTurnoGioca(ctx) ? carteSel(ctx) : [];
    const sulTavolo = comb.reduce((s, m) => s + m.punti + (m.burraco === 'pulito' ? 200 : m.burraco === 'sporco' ? 100 : 0), 0);
    const nB = comb.filter((m) => m.burraco).length;
    const pozzetto = p.pozzettoPreso[t] ? '<span class="bu-tag ok">pozzetto preso</span>' : '';
    const titolo = mia ? (p.aSquadre ? 'Le vostre combinazioni' : 'Le tue combinazioni') : (p.aSquadre ? 'Combinazioni degli avversari' : `Combinazioni di ${esc(ctx.nome(t))}`);
    const elenco = comb.length
      ? comb.map((m) => disegnaComb(ctx, m, attaccaQui(ctx, m, sel))).join('')
      : `<p class="bu-vuoto">${mia ? 'Ancora niente: seleziona 3 o più carte nella mano e premi Cala' : 'Ancora niente'}</p>`;
    return `<section class="bu-zona ${mia ? 'mia' : 'loro'}">
      <h3><span>${titolo}</span><span class="bu-zona-punti">${sulTavolo} punti${nB ? ` · ${plur(nB, 'burraco', 'burraco')}` : ''}</span>${pozzetto}</h3>
      <div class="bu-combs">${elenco}</div></section>`;
  }

  const tavolo = {
    libero: true,
    manoLarga: true,
    panno(ctx) {
      const p = ctx.partita;
      statoUi(ctx);
      const mt = p.mioTurno;
      const pesca = !!mt && mt.fase === 'pesca';
      const prendibili = pesca && p.scarti.length > 0;
      const scarti = p.scarti.length
        ? p.scarti.map((c, i) => F(c, `mini ${i === p.scarti.length - 1 ? 'bu-cima' : ''}`)).join('')
        : '<div class="carta mini vuota"></div>';
      const pozz = Array.from({ length: p.pozzetti }, () => Carte.retro('mini bu-pozzetto')).join('') || '<span class="bu-niente">finiti</span>';
      const chi = [0, 1].map((t) => `<span class="bu-tag ${p.pozzettoPreso[t] ? 'ok' : ''}">${esc(nomeSquadra(ctx, t))} ${p.pozzettoPreso[t] ? '✓' : '–'}</span>`).join('');
      const banco = `<div class="bu-banco">
        <div class="bu-tallone ${pesca ? 'selezionabile' : ''}" ${pesca ? 'data-az="pesca" role="button" tabindex="0" aria-label="Pesca dal tallone"' : ''}>
          ${Carte.retro('bu-retro')}<span class="bu-conta">${p.tallone}</span><small>tallone</small></div>
        <div class="bu-scarti ${prendibili ? 'selezionabile' : ''}" ${prendibili ? 'data-az="scarti" role="button" tabindex="0" aria-label="Prendi tutti gli scarti"' : ''}>
          <small>Scarti${p.scarti.length ? ` (${p.scarti.length})` : ''}${prendibili ? ' · tocca per prenderli tutti' : ''}</small>
          <div class="bu-scarti-fila">${scarti}</div></div>
        <div class="bu-pozzetti"><small>Pozzetti</small><div class="bu-pozz-carte">${pozz}</div><div class="bu-pozz-chi">${chi}</div></div>
      </div>`;
      return `<div class="bu">${banco}<div class="bu-zone">${zona(ctx, p.squadra)}${zona(ctx, 1 - p.squadra)}</div></div>`;
    },
    mano(ctx) {
      const p = ctx.partita;
      const ui = statoUi(ctx);
      if (!p.mano || !p.mano.length) return '';
      const attiva = mioTurnoGioca(ctx);
      return `<div class="bu-mano ${p.mano.length > 14 ? 'tante' : ''}">${ordina(p.mano, ui.ordine).map((c) =>
        F(c, `giocabile ${ui.sel.includes(c.id) ? 'alzata' : ''}`, `data-az="sel" role="button" tabindex="0" aria-pressed="${ui.sel.includes(c.id)}" aria-label="${Carte.nome(c)}${attiva ? '' : ' (aspetta il tuo turno)'}"`)).join('')}</div>`;
    },
    azioni(ctx) {
      const p = ctx.partita;
      const mt = p.mioTurno;
      const ui = statoUi(ctx);
      const b = [];
      if (p.fase === 'riepilogo') return '';
      const bottoniOrdine = `<span class="ordina">Ordina <button class="bottone mini-bt ${ui.ordine === 'seme' ? 'attivo' : ''}" data-az="ordina" data-modo="seme">seme</button><button class="bottone mini-bt ${ui.ordine === 'valore' ? 'attivo' : ''}" data-az="ordina" data-modo="valore">valore</button></span>`;
      if (mt && mt.fase === 'pesca') {
        b.push('<button class="bottone piccolo-bt primario-bt" data-az="pesca">Pesca dal tallone</button>');
        if (p.scarti.length) b.push(`<button class="bottone piccolo-bt" data-az="scarti">Prendi gli scarti (${p.scarti.length})</button>`);
      } else if (mt && mt.fase === 'gioca') {
        const sel = carteSel(ctx);
        if (sel.length >= 3) {
          const v = valuta(sel);
          if (!v) b.push('<span class="suggerimento bu-no">Queste carte non formano una scala né una combinazione</span>');
          else if (!restoOk(ctx, sel.length, !!v.burraco)) b.push(`<span class="suggerimento bu-no">${p.mano.length === sel.length ? 'Tieni almeno una carta da scartare' : 'Senza un burraco non puoi restare con una carta sola'}</span>`);
          else b.push(`<button class="bottone piccolo-bt primario-bt" data-az="cala">Cala ${v.tipo === 'scala' ? 'la scala' : 'la combinazione'} (${sel.length})</button>`);
        }
        const attaccabili = sel.length && p.combinazioni[p.squadra].some((m) => attaccaQui(ctx, m, sel));
        if (attaccabili) b.push('<span class="suggerimento">tocca una combinazione illuminata per attaccare</span>');
        if (sel.length === 1) {
          const ultima = p.mano.length === 1;
          const chiude = ultima && mt.pozzetto;
          b.push(`<button class="bottone piccolo-bt ${sel.length === 1 && !attaccabili ? 'primario-bt' : ''}" data-az="scarta" ${chiude && !mt.burraco ? 'disabled' : ''}>${chiude ? 'Scarta e chiudi' : ultima ? 'Scarta e prendi il pozzetto' : 'Scarta e passa'}</button>`);
        }
        if (sel.length) b.push('<button class="bottone mini-bt" data-az="deseleziona">Deseleziona</button>');
        else b.push(`<span class="suggerimento">${mt.pozzetto && !mt.burraco ? 'Per chiudere vi serve un burraco. ' : ''}Seleziona le carte: 3 o più per calare, una per scartare</span>`);
      } else if (p.turno != null && !p.finita) {
        b.push(`<span class="suggerimento">Gioca ${esc(ctx.nome(p.turno))}${p.aSquadre && p.turno % 2 === p.squadra ? ' (il tuo compagno)' : ''}</span>`);
      }
      if (p.mano && p.mano.length > 1) b.push(bottoniOrdine);
      return b.join('');
    },
    dopo(ctx) {
      const p = ctx.partita;
      const e = p.evento;
      if (e && primaVolta(ctx.ui, `bu-ev-${e.id}`) && e.forte) suono([[523, 0.09], [659, 0.09], [784, 0.16]], { volume: 0.06 });
      if (p.mioTurno && p.mioTurno.fase === 'gioca' && primaVolta(ctx.ui, `bu-pesca-${p.nSmazzata}-${p.tallone}-${p.scarti.length}`)) suono([[420, 0.04]], { volume: 0.03 });
    },
    infoPosto(ctx, posto) {
      const p = ctx.partita;
      const n = p.carteInMano[posto];
      const preso = p.chiPozzetto[posto % 2] === posto;
      return `${plur(n, 'carta', 'carte')}${preso ? ' · <span class="bu-tag ok">pozzetto</span>' : ''}${p.mazziere === posto ? ' · <small>mazziere</small>' : ''}`;
    },
    punteggio(ctx) {
      const p = ctx.partita;
      const obiettivo = p.obiettivo === 1 ? 'una sola smazzata' : `si vince a ${p.obiettivo}`;
      return [p.squadra, 1 - p.squadra].map((t) => `<span>${esc(nomeSquadra(ctx, t))} <b>${p.totali[t]}</b></span>`).join('') + `<span class="obiettivo">${obiettivo}${p.nSmazzata ? ` · smazzata ${p.nSmazzata + (p.fase === 'riepilogo' ? 0 : 1)}` : ''}</span>`;
    },
    stato(ctx) {
      const p = ctx.partita;
      if (!p.mioTurno) return null;
      return p.mioTurno.fase === 'pesca' ? 'Tocca a te: pesca o prendi gli scarti' : 'Tocca a te: cala, attacca, poi scarta';
    },
    statoAttesa: () => 'Fine smazzata',
    riepilogo(ctx) {
      const p = ctx.partita;
      const r = p.riepilogo;
      if (!r) return null;
      const ord = [p.squadra, 1 - p.squadra].map((t) => r.righe[t]);
      const titolo = r.chi == null ? 'Il tallone è finito' : `${esc(ctx.nome(r.chi))} ${r.chi === ctx.mio ? 'hai chiuso' : 'ha chiuso'}`;
      const riga = (nome, f, cls = '') => `<tr class="${cls}"><th>${nome}</th>${ord.map((x) => `<td>${f(x)}</td>`).join('')}</tr>`;
      const segno = (v) => (v > 0 ? `+${v}` : `${v}`);
      return `<h2>${titolo}</h2><p class="piccolo">Smazzata ${r.smazzata}</p>
        <div class="tabella-scorre"><table class="conti">
          <thead><tr><th></th>${ord.map((x) => `<th>${esc(nomeSquadra(ctx, x.squadra))}</th>`).join('')}</tr></thead>
          <tbody>
            ${riga('Carte calate', (x) => segno(x.tavolo))}
            ${riga('Burraco', (x) => `${segno(x.burraco)}${x.puliti || x.sporchi ? ` <small>(${[x.puliti ? `${x.puliti} pulit${x.puliti === 1 ? 'o' : 'i'}` : '', x.sporchi ? `${x.sporchi} sporc${x.sporchi === 1 ? 'o' : 'hi'}` : ''].filter(Boolean).join(', ')})</small>` : ''}`)}
            ${riga('Chiusura', (x) => (x.chiusura ? '+100' : '–'))}
            ${riga('Carte in mano', (x) => segno(x.mano))}
            ${riga('Pozzetto', (x) => (x.pozzetto ? '−100 <small>(non preso)</small>' : 'preso'))}
            ${riga('Smazzata', (x) => `<b>${segno(x.smazzata)}</b>`, 'somma')}
            ${riga('Totale', (x) => `<b>${x.totale}</b>`, 'somma')}
          </tbody></table></div>
        <p class="piccolo">${p.obiettivo === 1 ? 'Partita da una sola smazzata.' : `Si vince a ${p.obiettivo} punti.`}</p>`;
    },
    clic(ctx, el) {
      const ui = statoUi(ctx);
      const az = el.dataset.az;
      switch (az) {
        case 'pesca': ui.sel = []; return ctx.invia({ tipo: 'pesca', da: 'tallone' });
        case 'scarti': ui.sel = []; return ctx.invia({ tipo: 'pesca', da: 'scarti' });
        case 'sel': {
          const id = el.dataset.id;
          ui.sel = ui.sel.includes(id) ? ui.sel.filter((x) => x !== id) : [...ui.sel, id];
          suono([[ui.sel.includes(id) ? 620 : 480, 0.03]], { volume: 0.025 });
          return ctx.ridisegna();
        }
        case 'ordina': ui.ordine = el.dataset.modo === 'valore' ? 'valore' : 'seme'; try { localStorage.setItem('bu-ordine', ui.ordine); } catch {} return ctx.ridisegna();
        case 'deseleziona': ui.sel = []; return ctx.ridisegna();
        case 'cala': { const carte = ui.sel; ui.sel = []; ctx.invia({ tipo: 'cala', carte }); return ctx.ridisegna(); }
        case 'attacca': { if (!ui.sel.length) return undefined; const carte = ui.sel; ui.sel = []; ctx.invia({ tipo: 'attacca', combinazione: el.dataset.comb, carte }); return ctx.ridisegna(); }
        case 'scarta': { if (ui.sel.length !== 1) return undefined; const carta = ui.sel[0]; ui.sel = []; ctx.invia({ tipo: 'scarta', carta }); return ctx.ridisegna(); }
      }
      return undefined;
    },
    _valuta: valuta,
  };
  Object.assign(window.Tavoli, { burraco: tavolo });
})();
