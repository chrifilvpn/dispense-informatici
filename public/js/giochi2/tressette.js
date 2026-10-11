// TRESSETTE: tavolo come la briscola (carte giocate a croce, la carta che sta prendendo evidenziata), in due il
// mazzo con le carte appena pescate scoperte, gli accusi dichiarati, l'ultima presa da rivedere e il riepilogo a terzi.
(() => {
  const { esc, primaVolta, suono } = window.Nuovi;
  const SEMI = ['c', 'q', 'f', 'p'];
  const FORZA = { 3: 10, 2: 9, 1: 8, 13: 7, 12: 6, 11: 5, 7: 4, 6: 3, 5: 2, 4: 1 };
  const NOMI_SEMI = { c: 'cuori', q: 'quadri', f: 'fiori', p: 'picche' };
  // numerino in alto a destra: quanto vale la carta (asso 1, tre, due e figure un terzo)
  const vale = (c) => (c.rango === 1 ? '1' : c.rango === 2 || c.rango === 3 || c.rango >= 11 ? '⅓' : null);
  const F = (c, cls = '', attr = '') => { const v = vale(c); return Carte.fronte(c, cls, attr, v ? { valore: v } : {}); };
  // la mano: per seme, dalla più debole alla più forte (4 … 3)
  const ordina = (mano) => [...mano].sort((a, b) => SEMI.indexOf(a.seme) - SEMI.indexOf(b.seme) || FORZA[a.rango] - FORZA[b.rango]);
  const chi = (ctx, i) => (i === ctx.mio ? 'Tu' : ctx.nome(i));
  const nomeF = (ctx, f) => (ctx.partita.aSquadre ? (f === ctx.mio % 2 ? 'Voi' : 'Loro') : chi(ctx, f));
  const plur = (n, uno, tanti) => `${n} ${n === 1 ? uno : tanti}`;
  const terzi = (t) => { const p = Math.floor(t / 3), r = t % 3; return r ? `${p || ''}<small>${r === 1 ? '⅓' : '⅔'}</small>` : String(p); };

  const tavolo = {
    panno(ctx) {
      const p = ctx.partita, ui = ctx.ui;
      const raccolta = p.inAttesa && p.tavolo.length === p.n;
      const giocate = p.tavolo.map((g, i) =>
        `<div class="giocata slot-${ctx.slot(g.posto)} ${g.posto === p.vince ? (raccolta ? 'ts-vince' : 'ts-sta') : ''}" style="z-index:${i + 1}">${F(g.carta)}</div>`).join('');
      let lato = '';
      if (p.n === 2) {
        const pescate = p.pescate ? `<div class="ts-pescate" title="Le carte appena pescate si mostrano a tutti">
            <small>Pescate</small><div>${p.pescate.map((x) => `<div class="ts-pescata">${F(x.carta, 'mini')}<span>${esc(chi(ctx, x.posto))}</span></div>`).join('')}</div></div>` : '';
        lato = `<div class="ts-lato">${p.mazzo ? `<div class="mazzo-grande" title="Carte nel mazzo">${Carte.retro()}<span>${p.mazzo}</span></div>` : '<div class="ts-finito">mazzo<br>finito</div>'}${pescate}</div>`;
      }
      const accusi = p.accusati.length ? `<div class="ts-accusi">${p.accusati.map((a) =>
        `<div><b>${esc(chi(ctx, a.posto))}</b> ${esc(a.nome)} <span>+${a.punti}</span></div>`).join('')}</div>` : '';
      const u = p.ultimaMano;
      const ultima = ui.vediUltima && u ? `<div class="ts-ultima" data-az="ultima" role="button" tabindex="0">
          <p>Ultima presa: <b>${esc(chi(ctx, u.vincitore))}</b></p>
          <div>${u.tavolo.map((g) => `<div class="ts-u">${F(g.carta, g.posto === u.vincitore ? 'ts-presa' : '')}<span>${esc(chi(ctx, g.posto))}</span></div>`).join('')}</div>
          <small>tocca per chiudere</small></div>` : '';
      const vuoto = !p.tavolo.length && p.turno != null && !p.finita
        ? `<p class="ts-apre">${p.turno === ctx.mio ? 'Apri tu: gioca una carta' : `Apre ${esc(ctx.nome(p.turno))}`}</p>` : '';
      return `${lato}<div class="croce ${p.n === 2 ? '' : 'ts-piena'}">${giocate}${vuoto}</div>${accusi}${ultima}`;
    },
    mano(ctx) {
      const p = ctx.partita;
      return ordina(p.mano).map((c) => {
        const ok = !!p.valide && p.valide.includes(c.id);
        return F(c, `${ok ? 'giocabile' : ''} ${p.valide && !ok ? 'ts-no' : ''}`,
          ok ? `data-az="gioca" role="button" tabindex="0" aria-label="Gioca ${Carte.nome(c)}"` : '');
      }).join('');
    },
    azioni(ctx) {
      const p = ctx.partita;
      const out = [];
      if (p.valide && p.tavolo.length && p.valide.length < p.mano.length) out.push(`<span class="suggerimento">Devi rispondere a ${Carte.seme(p.tavolo[0].carta.seme, 'ts-seme')} ${NOMI_SEMI[p.tavolo[0].carta.seme]}</span>`);
      if (p.ultimaMano) out.push(`<button class="bottone piccolo-bt" data-az="ultima">${ctx.ui.vediUltima ? 'Chiudi' : '👁 Ultima presa'}</button>`);
      return out.join('');
    },
    dopo(ctx) {
      const p = ctx.partita;
      if (p.giocate && primaVolta(ctx.ui, `ts-g-${p.giocate}`)) suono([[260 + (p.giocate % 4) * 20, 0.04]], { tipo: 'sine', volume: 0.04 });
      if (p.inAttesa && p.vince != null && p.tavolo.length === p.n && primaVolta(ctx.ui, `ts-p-${p.giocate}`)) {
        if (p.vince % 2 === ctx.mio % 2) suono([[523, 0.06], [659, 0.09]], { volume: 0.05 });
      }
    },
    infoPosto(ctx, posto) {
      const p = ctx.partita;
      return `${plur(p.maniVinte[posto], 'presa', 'prese')}${p.mazziere === posto ? ' · mazziere' : ''}`;
    },
    punteggio(ctx) {
      const p = ctx.partita;
      return [0, 1].map((f) => `<span>${esc(nomeF(ctx, f))} <b>${p.totali[f]}</b></span>`).join('')
        + `<span class="obiettivo">si vince a ${p.obiettivo}${p.accuso ? ' · con accuso' : ''}</span>`;
    },
    stato(ctx) {
      const p = ctx.partita;
      if (p.finita || p.inAttesa || p.turno !== ctx.mio) return null;
      if (p.tavolo.length && p.valide && p.valide.length < p.mano.length) return `Tocca a te: rispondi a ${NOMI_SEMI[p.tavolo[0].carta.seme]}`;
      return null;
    },
    statoAttesa(ctx) {
      const p = ctx.partita;
      if (p.vince == null) return null;
      return p.vince === ctx.mio ? 'Prendi tu' : `Prende ${ctx.nome(p.vince)}`;
    },
    riepilogo(ctx) {
      const r = ctx.partita.riepilogo;
      if (!r) return null;
      const riga = (titolo, fmt, vinto = () => false) => `<tr><th>${titolo}</th>${r.righe.map((x) => `<td class="${vinto(x) ? 'vinto' : ''}">${fmt(x)}</td>`).join('')}</tr>`;
      return `<h2>Fine smazzata ${r.smazzata}</h2>
        <div class="tabella-scorre"><table class="conti">
          <thead><tr><th></th>${r.righe.map((x, f) => `<th>${esc(nomeF(ctx, f))}</th>`).join('')}</tr></thead>
          <tbody>
            ${riga('Carte prese', (x) => x.carte)}
            ${riga('Ultima presa', (x) => (x.ultima ? '+1' : ''), (x) => x.ultima)}
            ${riga('Terzi', (x) => `${x.terzi} <small>(${terzi(x.terzi)})</small>`)}
            ${riga('Punti dalle carte', (x) => x.puntiCarte)}
            ${r.accusati.length ? riga('Accusi', (x) => (x.accusi ? `+${x.accusi}` : ''), (x) => x.accusi > 0) : ''}
            <tr class="somma"><th>Punti fatti</th>${r.righe.map((x) => `<td>${x.punti}</td>`).join('')}</tr>
            <tr class="somma"><th>Totale</th>${r.righe.map((x) => `<td>${x.totale}</td>`).join('')}</tr>
          </tbody></table></div>
        ${r.accusati.length ? `<p class="piccolo">Accusi: ${r.accusati.map((a) => `${esc(chi(ctx, a.posto))} ${esc(a.nome)} (+${a.punti})`).join(' · ')}</p>` : ''}
        <p class="piccolo">Asso 3 terzi, tre, due e figure 1 terzo, ultima presa 3 terzi: ogni 3 terzi fanno un punto, quelli avanzati si perdono.</p>`;
    },
    clic(ctx, el) {
      const az = el.dataset.az;
      if (az === 'gioca') { el.classList.add('via'); ctx.ui.vediUltima = false; return ctx.invia({ tipo: 'gioca', carta: el.dataset.id }); }
      if (az === 'ultima') { ctx.ui.vediUltima = !ctx.ui.vediUltima; return ctx.ridisegna(); }
      return undefined;
    },
  };
  Object.assign(window.Tavoli, { tressette: tavolo });
})();
