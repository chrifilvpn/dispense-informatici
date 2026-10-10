// PONTE FRAGILE: il ponte di vetro disegnato in verticale (si parte in basso, si arriva in alto), così sta bene
// anche sul telefono. Chi è davanti sceglie sinistra o destra toccando un pannello della riga che brilla
// o con i due pulsanti grandi sotto il ponte (tasti ← e → sul computer).
(() => {
  const { esc, primaVolta, suono } = window.Nuovi;
  const COLORI = ['#e8453c', '#2f7fd8', '#2e9d57', '#d19a2a', '#8e55c9', '#e36fa5', '#1fa3a3', '#e07b2c'];
  const col = (i) => COLORI[i % COLORI.length];
  const pedina = (ctx, i, extra = '') => `<span class="pf-pedina ${extra}" style="--col:${col(i)}" title="${esc(i === ctx.mio ? 'Tu' : ctx.nome(i))}">${esc((i === ctx.mio ? 'Tu' : ctx.nome(i)).slice(0, 2))}</span>`;
  const mioTurno = (ctx) => { const p = ctx.partita; return p.turno === ctx.mio && !p.finita && !p.inAttesa; };

  const tavolo = {
    libero: true,
    panno(ctx) {
      const p = ctx.partita;
      const mio = mioTurno(ctx);
      const fineRound = p.sicuroFinale;
      // chi sta sul ponte (al massimo uno: quello davanti) e dove
      const sul = p.ordine.filter((i) => p.stato[i] === 'ponte' && p.passi[i] > 0);
      const righe = [];
      for (let r = p.L - 1; r >= 0; r--) {
        const celle = [0, 1].map((lato) => {
          const buono = p.noto[r] === lato, rotto = p.rotto[r] === lato;
          const qui = sul.filter((i) => p.passi[i] - 1 === r && p.noto[r] === lato);
          const appena = p.ultimo && p.ultimo.riga === r && p.ultimo.lato === lato ? 'appena' : '';
          const svelato = fineRound && p.noto[r] === null ? (fineRound[r] === lato ? 'svelato-buono' : 'svelato-rotto') : '';
          let cls = buono ? 'buono' : rotto ? 'rotto' : 'vetro';
          const attiva = mio && r === p.fronte;
          const indizio = attiva && p.indizio === lato ? 'indizio' : '';
          const dentro = qui.map((i) => pedina(ctx, i)).join('') + (rotto ? '<span class="pf-crepa" aria-hidden="true">💥</span>' : '') + (indizio ? '<span class="pf-luce" aria-hidden="true">✨</span>' : '');
          const nome = `${lato ? 'destra' : 'sinistra'}, riga ${r + 1}`;
          if (attiva) return `<button type="button" class="pf-vetro ${cls} attiva ${indizio}" data-az="salta" data-lato="${lato}" aria-label="Salta a ${nome}">${dentro}</button>`;
          if (r === p.fronte && !p.finita) cls += ' prossima';
          return `<div class="pf-vetro ${cls} ${appena} ${svelato}" aria-label="${nome}">${dentro}</div>`;
        }).join('');
        righe.push(`<div class="pf-riga ${r === p.fronte ? 'fronte' : ''}"><span class="pf-num">${r + 1}</span>${celle}</div>`);
      }
      const salvi = p.ordine.filter((i) => p.stato[i] === 'salvo');
      const partenza = p.ordine.filter((i) => p.stato[i] === 'fila' || (p.stato[i] === 'ponte' && p.passi[i] === 0));
      const caduti = p.ordine.filter((i) => p.stato[i] === 'caduto');
      let msg;
      if (p.finita) msg = 'Partita finita!';
      else if (p.fase === 'fineRound') msg = `Fine del round ${p.round}: ecco dov'erano i vetri buoni`;
      else if (p.fase === 'caduta') msg = p.ultimo && p.ultimo.posto === ctx.mio ? '💥 Il vetro si è rotto: sei caduto!' : `💥 ${esc(ctx.nome(p.ultimo.posto))} è caduto!`;
      else if (p.fase === 'arrivo') msg = p.ultimo && p.ultimo.posto === ctx.mio ? '🎉 Sei arrivato dall\'altra parte!' : `🎉 ${esc(ctx.nome(p.ultimo.posto))} è arrivato!`;
      else if (mio) msg = p.indizio !== null ? `Il riflesso dice <b>${p.indizio ? 'destra' : 'sinistra'}</b>… ti fidi?` : `Tocca a te: riga <b>${p.fronte + 1}</b>, sinistra o destra?`;
      else if (p.turno != null) msg = `Salta ${esc(ctx.nome(p.turno))} (riga ${p.fronte + 1})`;
      else msg = '&nbsp;';
      return `<div class="pf">
        <div class="pf-ponte" style="--righe:${p.L}">
          <div class="pf-riva arrivo"><span class="pf-etichetta">🏁 Arrivo</span>${salvi.map((i) => pedina(ctx, i)).join('')}</div>
          <div class="pf-righe">${righe.join('')}</div>
          <div class="pf-riva partenza"><span class="pf-etichetta">Partenza</span>${partenza.map((i) => pedina(ctx, i, p.turno === i ? 'davanti' : '')).join('')}</div>
        </div>
        <p class="pa-msg" aria-live="polite">${msg}</p>
        <p class="pa-info">Round ${p.round} di ${p.nRound}${caduti.length ? ` · caduti: ${caduti.map((i) => esc(i === ctx.mio ? 'tu' : ctx.nome(i))).join(', ')}` : ''}</p>
      </div>`;
    },
    azioni(ctx) {
      const p = ctx.partita;
      if (!mioTurno(ctx)) return '';
      return `<div class="pf-scelta">
        <button type="button" class="bottone primario" data-az="salta" data-lato="0">⬅ Sinistra</button>
        <button type="button" class="bottone" data-az="riflesso" ${p.riflessi[ctx.mio] && p.indizio === null ? '' : 'disabled'}>🔍 Riflesso${p.riflessi[ctx.mio] ? '' : ' (usato)'}</button>
        <button type="button" class="bottone primario" data-az="salta" data-lato="1">Destra ➡</button>
      </div>`;
    },
    dopo(ctx) {
      const p = ctx.partita;
      if (!p.ultimo) return;
      if (primaVolta(ctx.ui, `pf-${p.round}-${p.ultimo.riga}`)) {
        if (p.ultimo.regge) suono([[520, 0.05], [780, 0.08]], { tipo: 'triangle', volume: 0.05 });
        else suono([[1800, 0.03], [1200, 0.04], [300, 0.1], [90, 0.4]], { tipo: 'sawtooth', volume: 0.1 });
      }
    },
    tasto(ctx, e) {
      if (!mioTurno(ctx)) return false;
      if (e.key === 'ArrowLeft') { ctx.invia({ tipo: 'salta', lato: 0 }); return true; }
      if (e.key === 'ArrowRight') { ctx.invia({ tipo: 'salta', lato: 1 }); return true; }
      return false;
    },
    statoAttesa: (ctx) => { const f = ctx.partita.fase; return f === 'caduta' ? 'Caduto!' : f === 'arrivo' ? 'Arrivato!' : 'Fine round'; },
    stato(ctx) { const p = ctx.partita; if (p.finita || p.turno == null) return null; return p.turno === ctx.mio ? 'Tocca a te' : `Salta ${ctx.nome(p.turno)}`; },
    punteggio(ctx) { const p = ctx.partita; return p.punti.map((x, i) => `<span style="color:${col(i)}">${esc(i === ctx.mio ? 'Tu' : ctx.nome(i))} <b>${x}</b></span>`).join(''); },
    infoPosto(ctx, posto) {
      const p = ctx.partita;
      const s = { fila: 'in fila', ponte: 'sul ponte', salvo: 'arrivato 🎉', caduto: 'caduto 💥' }[p.stato[posto]] || '';
      return `${p.punti[posto]} punti · ${s}`;
    },
    clic(ctx, el) {
      if (el.dataset.az === 'salta') { el.classList.add('premuta'); return ctx.invia({ tipo: 'salta', lato: Number(el.dataset.lato) }); }
      if (el.dataset.az === 'riflesso') return ctx.invia({ tipo: 'riflesso' });
    },
  };
  Object.assign(window.Tavoli, { ponte: tavolo });

  // frecce della tastiera: valgono solo durante la partita a Ponte fragile e fuori dai campi di testo
  let ultimo = null;
  const vecchio = tavolo.panno;
  tavolo.panno = (ctx) => { ultimo = ctx; return vecchio(ctx); };
  window.addEventListener('keydown', (e) => {
    const ctx = ultimo;
    if (!ctx || !ctx.partita || ctx.partita.gioco !== 'ponte' || (window.Boss && Boss.attivo)) return;
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    if (!document.querySelector('.pf')) return;
    if (tavolo.tasto(ctx, e)) e.preventDefault();
  });
})();
