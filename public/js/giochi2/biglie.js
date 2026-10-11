// BIGLIE (PARI O DISPARI): il vicolo al tramonto della puntata di Squid Game. In alto l'avversario e in basso tu,
// ognuno con il suo sacchetto di stoffa e le sue biglie di vetro colorate. In mezzo le mani: il pugno chiuso di chi
// nasconde, che si apre (con le biglie sul palmo) quando l'altro ha scommesso.
(() => {
  const { esc, primaVolta, suono, ritardo } = window.Nuovi;
  const TINTE = ['#e8453c', '#2f7fd8', '#2e9d57', '#e0a91c', '#8e55c9', '#1fa3a3', '#e36fa5', '#e07b2c', '#5c6bd6', '#7cb342'];
  const biglia = (k, extra = '') => `<i class="bg-biglia ${extra}" style="--c:${TINTE[(k * 7) % TINTE.length]}"></i>`;
  const mucchio = (n, max = 40) => Array.from({ length: Math.min(n, max) }, (_, k) => biglia(k)).join('');
  const sacchetto = (n) => `<span class="bg-sacco"><svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M20 16 Q32 22 44 16 L46 22 Q58 34 54 50 Q50 60 32 60 Q14 60 10 50 Q6 34 18 22 Z" fill="#b98b55" stroke="#6e4b25" stroke-width="2"/>
      <path d="M18 22 Q32 28 46 22" fill="none" stroke="#6e4b25" stroke-width="2"/>
      <path d="M22 20 Q18 10 26 8 M42 20 Q46 10 38 8" fill="none" stroke="#d6453a" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M16 40 Q22 44 18 52 M48 38 Q44 46 49 50" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="2"/>
    </svg><b>${n}</b></span>`;
  // il pugno chiuso (le nocche verso chi guarda) e la mano aperta con le biglie sul palmo
  const PELLE = '#f0c9a2', OMBRA = '#c99a72';
  const pugno = (cls = '') => `<svg class="bg-pugno ${cls}" viewBox="0 0 120 110" aria-hidden="true">
      <rect x="30" y="80" width="56" height="30" rx="8" fill="#2f8f7e"/><rect x="30" y="80" width="56" height="6" fill="#246f62"/>
      <path d="M22 44 Q20 30 34 28 L86 28 Q100 30 98 46 L96 70 Q94 86 76 86 L42 86 Q24 86 22 70 Z" fill="${PELLE}" stroke="${OMBRA}" stroke-width="2"/>
      ${[0, 1, 2, 3].map((k) => `<path d="M${30 + k * 17} 30 Q${38 + k * 17} 22 ${46 + k * 17} 30 L${46 + k * 17} 48 Q${38 + k * 17} 54 ${30 + k * 17} 48 Z" fill="${PELLE}" stroke="${OMBRA}" stroke-width="2"/>`).join('')}
      <path d="M26 58 Q40 50 62 56 Q66 62 58 66 Q42 68 28 66" fill="${PELLE}" stroke="${OMBRA}" stroke-width="2"/>
    </svg>`;
  // sul palmo ci stanno 12 biglie: oltre se ne disegnano 10 e si scrive quante sono
  const palmo = (n) => (n > 12 ? `${Array.from({ length: 10 }, (_, k) => biglia(k, 'piccola')).join('')}<em>+${n - 10}</em>` : Array.from({ length: n }, (_, k) => biglia(k, 'piccola')).join(''));
  function manoAperta(n) {
    return `<div class="bg-aperta"><svg viewBox="0 0 120 110" aria-hidden="true">
        <rect x="32" y="86" width="56" height="24" rx="8" fill="#2f8f7e"/>
        ${[0, 1, 2, 3].map((k) => `<rect x="${30 + k * 15}" y="${8 + Math.abs(k - 1.5) * 5}" width="13" height="44" rx="6.5" fill="${PELLE}" stroke="${OMBRA}" stroke-width="2"/>`).join('')}
        <path d="M94 56 Q110 40 112 48 Q112 58 96 74" fill="${PELLE}" stroke="${OMBRA}" stroke-width="2"/>
        <path d="M24 44 L96 44 Q100 70 92 84 Q80 92 60 92 Q38 92 28 84 Q20 70 24 44 Z" fill="${PELLE}" stroke="${OMBRA}" stroke-width="2"/>
        <path d="M34 66 Q60 74 86 62" fill="none" stroke="${OMBRA}" stroke-width="1.5"/>
      </svg><div class="bg-palmo">${palmo(n)}</div></div>`;
  }
  const mio = (ctx) => { const p = ctx.partita; return p.turno === ctx.mio && !p.inAttesa && !p.finita; };
  const chi = (ctx, i) => (i === ctx.mio ? 'Tu' : ctx.nome(i));
  const limiti = (ctx) => {
    const p = ctx.partita, ui = ctx.ui, max = p.biglie[ctx.mio] || 1;
    ui.bgN = Math.max(1, Math.min(max, ui.bgN || Math.min(max, 1 + Math.floor(Math.random() * Math.min(max, 5)))));
    ui.bgP = Math.max(1, Math.min(max, ui.bgP || Math.min(max, Math.max(1, Math.round(max / 3)))));
    return max;
  };

  const tavolo = {
    libero: true,
    panno(ctx) {
      const p = ctx.partita, io = ctx.mio, lui = 1 - io;
      const mieB = p.biglie[io], sueB = p.biglie[lui];
      const max = limiti(ctx);
      const ult = p.ultima;
      // la riga di un giocatore: nome, sacchetto, biglie
      const riga = (i, sopra) => `<div class="bg-giocatore ${sopra ? 'sopra' : 'sotto'} ${p.turno === i ? 'attivo' : ''}">
          <div class="bg-nome"><span class="bg-num">${i === 0 ? '456' : '001'}</span><b>${esc(chi(ctx, i))}</b>
            <span class="bg-ruolo">${p.finita ? '' : p.nasconde === i ? '✊ nasconde' : '🎲 scommette'}</span></div>
          <div class="bg-borsa">${sacchetto(p.biglie[i])}<div class="bg-mucchio">${mucchio(p.biglie[i])}</div></div>
        </div>`;
      // il centro: la mano (chiusa, che si apre, o la scelta)
      let centro = '', msg = '';
      const k = `bg-${p.nStoria}`;
      if (p.fase === 'aperta' && ult) {
        const giusto = ult.vinto !== ult.nasconde;
        centro = `<div class="bg-mano apre" style="${ritardo(ctx.ui, `${k}-apre`)}">${pugno('via')}${manoAperta(ult.quante)}</div>
          <div class="bg-esito ${giusto ? 'giusto' : 'sbagliato'}" style="${ritardo(ctx.ui, `${k}-esito`)}">
            <span class="bg-conto">${ult.quante} = <b>${ult.quante % 2 === 0 ? 'PARI' : 'DISPARI'}</b></span>
            <span>${esc(chi(ctx, ult.vinto))} ${ult.vinto === io ? 'prendi' : 'prende'} <b>${ult.passate}</b> ${ult.passate === 1 ? 'biglia' : 'biglie'}</span>
            <span class="bg-volano">${Array.from({ length: Math.min(ult.passate, 12) }, (_, j) => biglia(j, `vola ${ult.vinto === io ? 'giu' : 'su'}`)).join('')}</span>
          </div>`;
        msg = `${esc(chi(ctx, 1 - ult.nasconde))} ${1 - ult.nasconde === io ? 'hai' : 'ha'} detto <b>${ult.pari ? 'pari' : 'dispari'}</b> scommettendo ${ult.punta}: ${giusto ? 'indovinato!' : 'sbagliato!'}`;
      } else if (p.finita) {
        const v = p.risultato && p.risultato.vincitori[0];
        centro = `<div class="bg-mano">${v === undefined ? '🤝' : manoAperta(p.biglie[v])}</div>`;
        msg = v === undefined ? 'Pareggio!' : v === io ? '🔮 Hai vinto le biglie!' : `${esc(ctx.nome(v))} ha vinto le biglie`;
      } else if (p.fase === 'nascondi') {
        if (mio(ctx)) {
          centro = `<div class="bg-mano scelta">${manoAperta(ctx.ui.bgN)}</div><div class="bg-scelta">
              <p class="bg-domanda">Quante ne nascondi?</p>
              <div class="bg-stepper"><button type="button" class="bottone" data-az="meno" data-q="bgN" aria-label="Una in meno">−</button>
                <output class="bg-quante">${ctx.ui.bgN}<small>${ctx.ui.bgN % 2 === 0 ? 'pari' : 'dispari'}</small></output>
                <button type="button" class="bottone" data-az="piu" data-q="bgN" aria-label="Una in più">+</button></div>
              <input type="range" class="bg-cursore" min="1" max="${max}" value="${ctx.ui.bgN}" data-q="bgN" aria-label="Biglie da nascondere" ${max === 1 ? 'disabled' : ''}>
            </div>`;
          msg = max === 1 ? 'Hai una biglia sola: puoi nascondere solo quella (dispari!)' : 'Scegli e chiudi la mano: l\'altro non vede quante sono';
        } else {
          centro = `<div class="bg-mano agita">${pugno()}</div>`;
          msg = `${esc(ctx.nome(p.nasconde))} sta nascondendo le biglie…`;
        }
      } else if (p.fase === 'scommetti') {
        if (mio(ctx)) {
          centro = `<div class="bg-mano">${pugno()}<span class="bg-domanda-mano">?</span></div>
            <div class="bg-scelta">
              <p class="bg-domanda">Quante ne scommetti? ${sueB === 1 ? '<span class="bg-aiuto">(ha una biglia sola…)</span>' : ''}</p>
              <div class="bg-stepper"><button type="button" class="bottone" data-az="meno" data-q="bgP" aria-label="Una in meno">−</button>
                <output class="bg-quante">${ctx.ui.bgP}<small>di ${mieB}</small></output>
                <button type="button" class="bottone" data-az="piu" data-q="bgP" aria-label="Una in più">+</button></div>
              <input type="range" class="bg-cursore" min="1" max="${max}" value="${ctx.ui.bgP}" data-q="bgP" aria-label="Biglie da scommettere" ${max === 1 ? 'disabled' : ''}>
              ${ctx.ui.bgP > sueB ? `<p class="bg-aiuto">Se vinci ne prendi al massimo ${sueB} (quelle che ha)</p>` : ''}
            </div>`;
          msg = `${esc(ctx.nome(lui))} ha chiuso la mano: pari o dispari?`;
        } else {
          centro = `<div class="bg-mano">${pugno()}<span class="bg-segreto">${p.inPugno ?? '?'}</span></div>`;
          msg = `Hai nascosto <b>${p.inPugno}</b> (${p.inPugno % 2 === 0 ? 'pari' : 'dispari'}). ${esc(ctx.nome(lui))} sta scommettendo…`;
        }
      }
      const storia = p.storia.slice(-8).map((s) => `<li class="${s.vinto === io ? 'mia' : 'sua'}" title="${esc(chi(ctx, s.nasconde))} nasconde ${s.quante}">✊${s.quante} · ${s.pari ? 'pari' : 'disp.'} ${s.punta} → <b>${s.vinto === io ? '+' : '−'}${s.passate}</b></li>`).join('');
      return `<div class="bg">
        <p class="pa-round">Mano ${p.mano}${p.limite ? ` di ${p.limite}` : ''} · ${p.iniziali} biglie a testa</p>
        ${riga(lui, true)}
        <div class="bg-vicolo">${centro}</div>
        <p class="pa-msg" aria-live="polite">${msg}</p>
        ${riga(io, false)}
        ${storia ? `<ol class="bg-storia" aria-label="Ultime mani">${storia}</ol>` : ''}
      </div>`;
    },
    azioni(ctx) {
      const p = ctx.partita;
      if (!mio(ctx)) return '';
      if (p.fase === 'nascondi') return `<button type="button" class="bottone primario bg-conferma" data-az="nascondi">✊ Chiudi la mano (${ctx.ui.bgN})</button>`;
      if (p.fase === 'scommetti') return `<div class="bg-pd"><button type="button" class="bottone primario" data-az="pari">Pari</button><button type="button" class="bottone primario" data-az="dispari">Dispari</button></div>`;
      return '';
    },
    dopo(ctx) {
      const p = ctx.partita;
      // il cursore cambia il numero senza aspettare il server
      document.querySelectorAll('.bg-cursore').forEach((el) => {
        // mentre si trascina si aggiornano solo il numero e l'anteprima (ridisegnare tutto fermerebbe il dito)
        el.oninput = () => {
          const v = Number(el.value), q = el.dataset.q;
          ctx.ui[q] = v;
          const o = document.querySelector('.bg-quante');
          if (o) o.innerHTML = q === 'bgN' ? `${v}<small>${v % 2 === 0 ? 'pari' : 'dispari'}</small>` : `${v}<small>di ${p.biglie[ctx.mio]}</small>`;
          const a = document.querySelector('.bg-mano.scelta .bg-palmo'); if (a && q === 'bgN') a.innerHTML = palmo(v);
          const c = document.querySelector('.bg-conferma'); if (c) c.textContent = `✊ Chiudi la mano (${v})`;
        };
        el.onchange = () => ctx.ridisegna();
      });
      if (p.fase === 'aperta' && p.ultima && primaVolta(ctx.ui, `bg-s-${p.nStoria}`)) {
        suono([[700, 0.03], [500, 0.03]], { tipo: 'square', volume: 0.03 });
        setTimeout(() => {
          const vinco = p.ultima.vinto === ctx.mio;
          // il tintinnio delle biglie di vetro
          suono(Array.from({ length: Math.min(6, p.ultima.passate + 1) }, (_, j) => [vinco ? 1500 + j * 120 : 1300 - j * 90, 0.04]), { tipo: 'sine', volume: 0.05 });
        }, 650);
      }
      if (p.finita && primaVolta(ctx.ui, 'bg-fine')) {
        const v = p.risultato && p.risultato.vincitori[0];
        suono(v === ctx.mio ? [[523, 0.1], [659, 0.1], [784, 0.1], [1046, 0.3]] : [[300, 0.2], [200, 0.3]], { volume: 0.07 });
      }
    },
    statoAttesa: () => 'Si apre la mano…',
    stato(ctx) {
      const p = ctx.partita;
      if (p.finita || p.turno == null) return null;
      if (p.turno === ctx.mio) return p.fase === 'nascondi' ? 'Nascondi le biglie' : 'Pari o dispari?';
      return p.fase === 'nascondi' ? `Nasconde ${ctx.nome(p.turno)}` : `Scommette ${ctx.nome(p.turno)}`;
    },
    punteggio(ctx) { const p = ctx.partita; return p.biglie.map((x, i) => `<span>${esc(chi(ctx, i))} <b>${x}</b></span>`).join('') + '<span class="obiettivo">biglie</span>'; },
    infoPosto(ctx, posto) { const p = ctx.partita; return `${p.biglie[posto]} biglie`; },
    clic(ctx, el) {
      const p = ctx.partita, ui = ctx.ui, az = el.dataset.az, max = limiti(ctx);
      if (az === 'meno' || az === 'piu') { const q = el.dataset.q; ui[q] = Math.max(1, Math.min(max, ui[q] + (az === 'piu' ? 1 : -1))); suono([[600 + ui[q] * 20, 0.025]], { volume: 0.03 }); return ctx.ridisegna(); }
      if (az === 'nascondi' && p.fase === 'nascondi') { suono([[260, 0.05], [200, 0.06]], { volume: 0.05 }); return ctx.invia({ tipo: 'nascondi', quante: ui.bgN }); }
      if ((az === 'pari' || az === 'dispari') && p.fase === 'scommetti') return ctx.invia({ tipo: 'scommetti', punta: ui.bgP, pari: az === 'pari' });
    },
  };
  Object.assign(window.Tavoli, { biglie: tavolo });

  // tastiera: ← → (o − +) cambiano il numero, Invio chiude la mano, P e D dicono pari o dispari
  let ultimo = null;
  const vecchio = tavolo.panno;
  tavolo.panno = (ctx) => { ultimo = ctx; return vecchio(ctx); };
  window.addEventListener('keydown', (e) => {
    const ctx = ultimo;
    if (!ctx || !ctx.partita || ctx.partita.gioco !== 'biglie' || (window.Boss && Boss.attivo) || !mio(ctx)) return;
    if (e.target.closest && e.target.closest('input:not(.bg-cursore), textarea, select')) return;
    if (!document.querySelector('.bg')) return;
    const p = ctx.partita, q = p.fase === 'nascondi' ? 'bgN' : 'bgP', max = limiti(ctx);
    const k = e.key.toLowerCase();
    if (['arrowleft', 'arrowdown', '-'].includes(k)) { ctx.ui[q] = Math.max(1, ctx.ui[q] - 1); ctx.ridisegna(); }
    else if (['arrowright', 'arrowup', '+', '='].includes(k)) { ctx.ui[q] = Math.min(max, ctx.ui[q] + 1); ctx.ridisegna(); }
    else if (k === 'enter' && p.fase === 'nascondi') ctx.invia({ tipo: 'nascondi', quante: ctx.ui.bgN });
    else if ((k === 'p' || k === 'd') && p.fase === 'scommetti') ctx.invia({ tipo: 'scommetti', punta: ctx.ui.bgP, pari: k === 'p' });
    else return;
    e.preventDefault();
  });
})();
