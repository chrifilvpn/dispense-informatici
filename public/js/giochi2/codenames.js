// NOMI IN CODICE: il tavolo nel browser. In alto il punteggio e una fascia del colore della squadra di turno con
// l'indizio; al centro la griglia 5×5 (il capitano vede i colori segreti, tenui, sulle parole coperte); sotto i
// comandi (indizio per il capitano, Scopri/Passa per gli agenti) e il registro degli indizi.
(() => {
  const { esc, suono } = window.Nuovi;
  const NOMI = ['Rossi', 'Blu'];
  const CLASSE = ['rosso', 'blu', 'neutro', 'assassino'];
  let ctxN = null;

  const squadra = (p) => p % 2;
  const sonoCapitano = (ctx) => ctx.partita.capitani.includes(ctx.mio);
  const nomeCorto = (ctx, i) => (i === ctx.mio ? 'Tu' : ctx.nome(i));
  const iniziali = (ctx, i) => esc((i === ctx.mio ? 'Tu' : ctx.nome(i)).slice(0, 2));
  // posso scegliere le parole: sono un agente della squadra di turno e il capitano ha già dato l'indizio
  const possoCercare = (ctx) => {
    const p = ctx.partita;
    return !p.finita && !p.inAttesa && p.fase === 'ricerca' && squadra(ctx.mio) === p.sq && !sonoCapitano(ctx) && !ctx.stato.spettatore;
  };
  const possoIndizio = (ctx) => { const p = ctx.partita; return !p.finita && !p.inAttesa && p.fase === 'indizio' && p.turno === ctx.mio; };

  // parole lunghe: divise in due righe tra due sillabe (come in Connessioni), così stanno nella casella del telefono
  const VOC = 'AEIOUÀÈÉÌÒÙ';
  function puoSpezzare(w, i) {
    const a = w[i - 1], c = w[i], d = w[i + 1];
    if (!a || !d || VOC.includes(c)) return false;
    if (c === 'S' && d !== 'S' && !VOC.includes(d)) return VOC.includes(a);
    const attacco = VOC.includes(d) || ('LR'.includes(d) && 'BCDFGPTV'.includes(c)) || (d === 'H' && 'CG'.includes(c) && VOC.includes(w[i + 2] || ''));
    return attacco && (VOC.includes(a) || a === c || 'LMNR'.includes(a));
  }
  function spezza(parola) {
    const w = parola.toUpperCase();
    if (w.length < 8) return { html: esc(w), l: Math.max(4, w.length) };
    const m = Math.ceil(w.length / 2);
    let k = -1;
    for (let d = 0; d < 4 && k < 0; d++) for (const i of [m + d, m - d]) if (i >= 2 && i <= w.length - 2 && puoSpezzare(w, i)) { k = i; break; }
    if (k < 0 && w.length < 10) return { html: esc(w), l: w.length }; // meglio intera che divisa male
    if (k < 0) k = m;
    // a capo sempre (non solo se serve): così il carattere può restare grande
    return { html: `${esc(w.slice(0, k))}-<br>${esc(w.slice(k))}`, l: Math.max(k + 0.6, w.length - k) };
  }

  function testa(ctx) {
    const p = ctx.partita;
    const mia = squadra(ctx.mio);
    const punti = [0, 1].map((s) => `<div class="cdn-conta cdn-${CLASSE[s]} ${p.sq === s && !p.finita ? 'di-turno' : ''}"><b>${p.restano[s]}</b><span>${NOMI[s]}${s === mia ? ' (voi)' : ''}<small>da trovare su ${p.totali[s]}</small></span></div>`).join('');
    let banner;
    if (p.finita) {
      const motivo = p.motivo === 'assassino' ? `i ${NOMI[1 - p.vincitore]} hanno trovato l'assassino 💀` : p.motivo === 'regalo' ? `i ${NOMI[1 - p.vincitore]} hanno scoperto l'ultima parola avversaria` : 'tutte le parole trovate!';
      banner = `<div class="cdn-banner cdn-${CLASSE[p.vincitore]} fine">🏆 Vincono i ${NOMI[p.vincitore]}! <small>${motivo}</small></div>`;
    } else if (p.fase === 'indizio') {
      const cap = p.capitani[p.sq];
      banner = `<div class="cdn-banner cdn-${CLASSE[p.sq]}">Tocca ai ${NOMI[p.sq]} · ${cap === ctx.mio ? '<b>tocca a te dare l\'indizio</b>' : `il capitano <b>${esc(ctx.nome(cap))}</b> pensa all'indizio<span class="cdn-puntini"><i>.</i><i>.</i><i>.</i></span>`}${orologio(p)}</div>`;
    } else {
      const ind = p.indizio;
      banner = `<div class="cdn-banner cdn-${CLASSE[p.sq]}">${NOMI[p.sq]}: <span class="cdn-indizio">«${esc(ind.parola.toUpperCase())}» <b>${ind.numero}</b></span><small>${ind.fatti ? `${ind.fatti} ${ind.fatti === 1 ? 'scoperta' : 'scoperte'} · ` : ''}ancora ${Math.max(0, ind.resta)} ${ind.resta === 1 ? 'tentativo' : 'tentativi'}</small>${orologio(p)}</div>`;
    }
    return `<div class="cdn-testa"><div class="cdn-punti">${punti}</div>${banner}${ruolo(ctx)}</div>`;
  }

  function orologio(p) {
    if (!p.tempoFine || p.finita || p.inAttesa) return '';
    const resta = Math.max(0, p.tempoFine - p.ora);
    return `<span class="cdn-tempo" data-fine="${Date.now() + resta}">⏱ <b>${Math.ceil(resta / 1000)}</b>s</span>`;
  }

  function ruolo(ctx) {
    const p = ctx.partita;
    if (ctx.stato.spettatore || p.finita) return '';
    const s = squadra(ctx.mio);
    if (sonoCapitano(ctx)) return `<p class="cdn-ruolo"><i class="cdn-pallino cdn-${CLASSE[s]}"></i>Sei il <b>capitano dei ${NOMI[s]}</b>: vedi i colori segreti (💀 assassino)</p>`;
    return `<p class="cdn-ruolo"><i class="cdn-pallino cdn-${CLASSE[s]}"></i>Sei un <b>agente dei ${NOMI[s]}</b> · capitano: ${esc(nomeCorto(ctx, p.capitani[s]))}</p>`;
  }

  function griglia(ctx) {
    const p = ctx.partita;
    const cerca = possoCercare(ctx);
    const mioVoto = p.voti ? p.voti[ctx.mio] : null;
    const ultima = (() => { const r = p.registro[p.registro.length - 1]; const e = r && r.esiti[r.esiti.length - 1]; return e ? e.parola : null; })();
    const carte = p.parole.map((w, i) => {
      const sc = p.scoperte[i];
      const s = spezza(w);
      const cls = ['cdn-carta'];
      let extra = '';
      if (sc) { cls.push('scoperta', `cdn-${CLASSE[sc.colore]}`); if (w === ultima) cls.push('appena'); }
      else if (p.mappa) cls.push('segreta', `cdn-s-${CLASSE[p.mappa[i]]}`);
      if (!sc && p.voti) {
        const chi = p.voti.map((v, k) => (v === i ? k : -1)).filter((k) => k >= 0);
        if (chi.length) { cls.push('votata'); extra += `<span class="cdn-voti">${chi.map((k) => `<i class="${k === ctx.mio ? 'mio' : ''}" title="${esc(nomeCorto(ctx, k))}">${iniziali(ctx, k)}</i>`).join('')}</span>`; }
      }
      if (!sc && p.mappa && p.mappa[i] === 3) extra += '<span class="cdn-teschio" aria-hidden="true">💀</span>';
      if (sc && sc.colore === 3) extra += '<span class="cdn-teschio grande" aria-hidden="true">💀</span>';
      const etichetta = `${w}${sc ? `, scoperta: ${['rossa', 'blu', 'neutrale', 'assassino'][sc.colore]}` : ''}`;
      if (cerca && !sc) {
        const mia = mioVoto === i;
        return `<button type="button" class="${cls.join(' ')} ${mia ? 'mia' : ''}" data-az="carta" data-c="${i}" style="--l:${s.l}" aria-pressed="${mia}" aria-label="${esc(etichetta)}"><span class="cdn-parola">${s.html}</span>${extra}${mia ? '<span class="cdn-conferma" data-az="scopri" data-c="' + i + '">Scopri ✓</span>' : ''}</button>`;
      }
      return `<div class="${cls.join(' ')}" style="--l:${s.l}" aria-label="${esc(etichetta)}"><span class="cdn-parola">${s.html}</span>${extra}</div>`;
    }).join('');
    return `<div class="cdn-griglia">${carte}</div>`;
  }

  function comandi(ctx) {
    const p = ctx.partita, ui = ctx.ui;
    if (possoIndizio(ctx)) {
      const n = ui.numero || 0;
      return `<div class="cdn-comandi cdn-capo">
        <label for="cdn-indizio">Il tuo indizio: <b>una parola</b> e <b>quante parole</b> dei ${NOMI[p.sq]} c'entrano</label>
        <div class="riga"><input id="cdn-indizio" maxlength="20" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Una parola sola…" data-tieni="indizio" data-invio="indizio" value="${esc(ui.t_indizio || '')}"></div>
        <div class="cdn-numeri" role="group" aria-label="Numero">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => `<button type="button" class="cdn-num ${n === k ? 'scelto' : ''}" data-az="numero" data-n="${k}" aria-pressed="${n === k}">${k}</button>`).join('')}</div>
        <button type="button" class="bottone primario-bt" data-az="indizio">Dai l'indizio${n ? ` (${n})` : ''}</button></div>`;
    }
    if (possoCercare(ctx)) {
      const v = p.voti ? p.voti[ctx.mio] : null;
      const ind = p.indizio;
      return `<div class="cdn-comandi">
        <p class="cdn-aiuto">${v != null ? `Hai proposto <b>${esc(p.parole[v].toUpperCase())}</b>: premi Scopri per girarla, o tocca un'altra parola.` : 'Tocca una parola per proporla alla squadra, poi premi Scopri.'}</p>
        <div class="cdn-bottoni">
          <button type="button" class="bottone primario-bt" data-az="scopri" ${v != null ? `data-c="${v}"` : 'disabled'}>Scopri${v != null ? ` «${esc(p.parole[v].toUpperCase())}»` : ''}</button>
          <button type="button" class="bottone" data-az="passa" ${ind && ind.fatti ? '' : 'disabled'} title="Finisce il turno della squadra">Passa ✋</button>
        </div></div>`;
    }
    if (p.finita) return '';
    if (sonoCapitano(ctx) && p.fase === 'ricerca' && squadra(ctx.mio) === p.sq) return '<p class="cdn-aiuto">I tuoi agenti stanno cercando: niente suggerimenti in chat! 🤐</p>';
    return '';
  }

  function registro(ctx) {
    const p = ctx.partita;
    if (!p.registro.length) return `<aside class="cdn-registro"><h3>Indizi</h3><p class="cdn-vuoto">Ancora nessun indizio. Inizia${p.iniziale === 0 ? 'no i Rossi' : 'no i Blu'} (9 parole contro 8).</p></aside>`;
    const righe = [...p.registro].reverse().map((r) => `<li class="cdn-bordo-${CLASSE[r.squadra]}"><p><b>«${esc(r.parola.toUpperCase())}» ${r.numero}</b><small>${esc(nomeCorto(ctx, r.capitano))}</small></p>
      <div>${r.esiti.map((e) => `<span class="cdn-chip cdn-${CLASSE[e.colore]}">${esc(e.parola)}</span>`).join('') || '<span class="cdn-vuoto">…</span>'}</div></li>`).join('');
    return `<aside class="cdn-registro"><h3>Indizi</h3><ol>${righe}</ol></aside>`;
  }

  const tavolo = {
    libero: true,
    reset(ctx) { ctxN = ctx; window.NuoviTesto && window.NuoviTesto(ctx); },
    panno(ctx) {
      const p = ctx.partita;
      return `<div class="cdn cdn-turno-${CLASSE[p.sq]} ${p.mappa && !p.finita ? 'da-capitano' : ''}">
        <div class="cdn-centro">${testa(ctx)}${griglia(ctx)}${comandi(ctx)}</div>${registro(ctx)}</div>`;
    },
    dopo(ctx) {
      const p = ctx.partita, ui = ctx.ui;
      // il cursore torna nella casella dell'indizio se si stava scrivendo
      const k = ui.fuoco;
      if (k && !(window.Boss && Boss.attivo)) {
        const el = document.querySelector(`[data-tieni="${k}"]`);
        if (el && !el.disabled) { el.focus({ preventScroll: true }); try { el.setSelectionRange(el.value.length, el.value.length); } catch {} }
      }
      // conto alla rovescia (opzione tempo)
      clearInterval(ui._ncT);
      ui._ncT = setInterval(() => {
        const el = document.querySelector('.cdn-tempo'); if (!el) return clearInterval(ui._ncT);
        const resta = Math.max(0, Number(el.dataset.fine) - Date.now());
        el.querySelector('b').textContent = Math.ceil(resta / 1000); el.classList.toggle('poco', resta < 15000);
      }, 250);
      // suoni: una parola girata, l'assassino, un nuovo indizio
      const giro = p.scoperte.filter(Boolean).length;
      const nInd = p.registro.length;
      if (ui._giro === undefined) { ui._giro = giro; ui._nInd = nInd; return; }
      if (giro > ui._giro) {
        const r = p.registro[p.registro.length - 1];
        const e = r && r.esiti[r.esiti.length - 1];
        if (e && e.colore === 3) suono([[300, 0.15], [200, 0.2], [90, 0.5]], { tipo: 'sawtooth', volume: 0.09 });
        else if (e && e.colore === r.squadra) suono([[660, 0.07], [880, 0.12]], { volume: 0.06 });
        else suono([[330, 0.1], [250, 0.16]], { volume: 0.06 });
      } else if (nInd > ui._nInd) suono([[520, 0.06], [620, 0.06]], { volume: 0.05 });
      ui._giro = giro; ui._nInd = nInd;
    },
    statoAttesa(ctx) { const p = ctx.partita; return `Tocca ai ${NOMI[1 - p.sq]}…`; },
    stato(ctx) {
      const p = ctx.partita;
      if (p.finita) return null;
      if (possoIndizio(ctx)) return 'Tocca a te: dai l\'indizio';
      if (p.fase === 'indizio') return `Indizio del capitano ${p.sq === squadra(ctx.mio) ? 'della tua squadra' : `dei ${NOMI[p.sq]}`}`;
      if (possoCercare(ctx)) return 'Tocca alla tua squadra: scegliete';
      return `Cercano i ${NOMI[p.sq]}`;
    },
    punteggio(ctx) {
      const p = ctx.partita;
      return `<span class="cdn-p-rosso">Rossi <b>${p.restano[0]}</b></span><span class="cdn-p-blu">Blu <b>${p.restano[1]}</b></span>`;
    },
    infoPosto(ctx, posto) {
      const p = ctx.partita;
      const s = squadra(posto);
      const cap = p.capitani.includes(posto);
      const voto = p.voti && p.voti[posto] != null ? ` · 👉 ${esc(p.parole[p.voti[posto]])}` : '';
      return `<span class="cdn-info cdn-${CLASSE[s]}"><i class="cdn-pallino cdn-${CLASSE[s]}"></i>${cap ? 'capitano' : 'agente'} ${NOMI[s].toLowerCase()}${voto}</span>`;
    },
    clic(ctx, el) {
      const ui = ctx.ui, az = el.dataset.az;
      if (az === 'numero') { ui.numero = Number(el.dataset.n); return ctx.ridisegna(); }
      if (az === 'indizio') {
        const t = (ui.t_indizio || '').trim();
        if (!t) return ctx.avviso('Scrivi la parola dell\'indizio');
        if (/\s/.test(t)) return ctx.avviso('L\'indizio è una parola sola');
        if (!ui.numero) return ctx.avviso('Scegli anche il numero (da 1 a 9)');
        ctx.invia({ tipo: 'indizio', parola: t, numero: ui.numero });
        return;
      }
      if (az === 'carta') {
        if (!possoCercare(ctx)) return;
        return ctx.invia({ tipo: 'vota', carta: Number(el.dataset.c) });
      }
      if (az === 'scopri') {
        if (!possoCercare(ctx) || el.dataset.c === undefined) return;
        return ctx.invia({ tipo: 'scopri', carta: Number(el.dataset.c) });
      }
      if (az === 'passa') return ctx.invia({ tipo: 'passa' });
    },
  };

  // l'indizio accettato dal server: si svuota la casella (quando cambia il numero di indizi)
  const vecchioReset = tavolo.reset;
  tavolo.reset = (ctx) => {
    vecchioReset(ctx);
    const p = ctx.partita, ui = ctx.ui;
    if (ui._regVisti !== undefined && p.registro.length > ui._regVisti) { ui.t_indizio = ''; ui.numero = 0; ui.fuoco = null; }
    ui._regVisti = p.registro.length;
  };

  Object.assign(window.Tavoli, { codenames: tavolo });
})();
