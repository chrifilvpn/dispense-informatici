// MEMORY: le carte coperte che si girano con una rotazione 3D. Le figure sono emoji, le bandiere sono disegnate in SVG
// (le emoji delle bandiere non si vedono su tutti i computer). Il server manda solo il numero della figura.
(() => {
  const { esc, primaVolta, suono, ritardo, trascorso } = window.Nuovi;
  const COLORI = ['#2b6cb0', '#c05621', '#2f855a', '#b83280', '#6b46c1', '#b7791f'];
  const EMOJI = {
    animali: ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦉', '🐙'],
    cibo: ['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🍕', '🍔', '🍟', '🌭', '🍩', '🍪', '🧀', '🥐', '🍉', '🥕', '🍦'],
    informatica: ['💻', '🖥️', '⌨️', '🖱️', '💾', '💿', '🖨️', '📱', '🔌', '🔋', '📡', '🛰️', '🤖', '👾', '🕹️', '📶', '🧮', '🔍'],
  };
  // bandiere semplici: strisce (o = orizzontali, v = verticali) oppure con un simbolo
  const B = (nome, o, colori, extra = '') => ({ nome, o, colori, extra });
  const BANDIERE = [
    B('Italia', 'v', ['#009246', '#fff', '#ce2b37']), B('Francia', 'v', ['#0055a4', '#fff', '#ef4135']), B('Germania', 'o', ['#000', '#dd0000', '#ffce00']),
    B('Belgio', 'v', ['#000', '#fdda24', '#ef3340']), B('Irlanda', 'v', ['#169b62', '#fff', '#ff883e']), B('Austria', 'o', ['#ed2939', '#fff', '#ed2939']),
    B('Paesi Bassi', 'o', ['#ae1c28', '#fff', '#21468b']), B('Ungheria', 'o', ['#ce2939', '#fff', '#477050']), B('Romania', 'v', ['#002b7f', '#fcd116', '#ce1126']),
    B('Estonia', 'o', ['#0072ce', '#000', '#fff']), B('Lituania', 'o', ['#fdb913', '#006a44', '#c1272d']), B('Ucraina', 'o', ['#0057b7', '#ffd700']),
    B('Polonia', 'o', ['#fff', '#dc143c']), B('Giappone', 'o', ['#fff'], '<circle cx="30" cy="20" r="11" fill="#bc002d"/>'),
    B('Svizzera', 'o', ['#d52b1e'], '<rect x="25" y="8" width="10" height="24" fill="#fff"/><rect x="18" y="15" width="24" height="10" fill="#fff"/>'),
    B('Svezia', 'o', ['#006aa7'], '<rect x="16" y="0" width="8" height="40" fill="#fecc00"/><rect x="0" y="16" width="60" height="8" fill="#fecc00"/>'),
    B('Danimarca', 'o', ['#c8102e'], '<rect x="16" y="0" width="7" height="40" fill="#fff"/><rect x="0" y="16.5" width="60" height="7" fill="#fff"/>'),
    B('Finlandia', 'o', ['#fff'], '<rect x="16" y="0" width="9" height="40" fill="#002f6c"/><rect x="0" y="15.5" width="60" height="9" fill="#002f6c"/>'),
  ];
  function bandiera(k) {
    const b = BANDIERE[k];
    const n = b.colori.length;
    const strisce = b.colori.map((c, i) => (b.o === 'v' ? `<rect x="${(60 / n) * i}" y="0" width="${60 / n + 0.5}" height="40" fill="${c}"/>` : `<rect x="0" y="${(40 / n) * i}" width="60" height="${40 / n + 0.5}" fill="${c}"/>`)).join('');
    return `<svg class="mm-bandiera" viewBox="0 0 60 40" role="img" aria-label="${b.nome}">${strisce}${b.extra}<rect x=".5" y=".5" width="59" height="39" fill="none" stroke="rgba(0,0,0,.25)"/></svg><small>${b.nome}</small>`;
  }
  const figura = (tema, f) => (tema === 'bandiere' ? bandiera(f) : `<span class="mm-emoji">${EMOJI[tema][f]}</span>`);
  const fmt = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  let ctxM = null;
  const ricevuto = new WeakMap();
  const tempo = (p) => p.tempo + (p.corre ? Date.now() - (ricevuto.get(p) || Date.now()) : 0);
  setInterval(() => { const p = ctxM && ctxM.stato && ctxM.partita; const el = document.querySelector('.mm-tempo'); if (p && p.gioco === 'memory' && el) el.textContent = fmt(tempo(p)); }, 500);

  // quante colonne: 4 con 16 carte, 6 con 24 o 36 (la misura delle carte la decide il CSS)
  const colonne = (n) => (n === 16 ? 4 : 6);

  const tavolo = {
    libero: true,
    reset(ctx) {
      ctxM = ctx;
      const p = ctx.partita, ui = ctx.ui;
      if (!ricevuto.has(p)) ricevuto.set(p, Date.now());
      // partita nuova (rivincita: il contatore delle carte girate riparte): si dimentica lo stato delle carte
      if (!ui.mmSu || p.nGiro < (ui.mmGiro || 0) || p.carte.length !== ui.mmQuante) { ui.mmSu = {}; ui.mmCambio = {}; }
      ui.mmGiro = p.nGiro; ui.mmQuante = p.carte.length;
      // le carte che cambiano faccia: da quando (per far ripartire la rotazione da dove era se il tavolo si ridisegna)
      p.carte.forEach((c, i) => {
        const su = c.f !== null;
        if (ui.mmSu[i] === undefined) { ui.mmSu[i] = su; return; }
        if (ui.mmSu[i] !== su) { ui.mmSu[i] = su; ui.mmCambio[i] = Date.now(); }
      });
    },
    panno(ctx) {
      const p = ctx.partita, ui = ctx.ui;
      const mio = p.turno === ctx.mio && !p.inAttesa && !p.finita;
      const col = colonne(p.carte.length);
      const righe = Math.ceil(p.carte.length / col);
      const sbagliate = new Set(p.sbagliate || []);
      const nuovaCoppia = p.ultimaCoppia && trascorso(ui, `mm-c-${p.ultimaCoppia.id}`) < 1500 ? new Set(p.ultimaCoppia.carte) : new Set();
      const carte = p.carte.map((c, i) => {
        const su = c.f !== null;
        const quando = ui.mmCambio[i];
        const passati = quando ? Date.now() - quando : 9999;
        const anim = passati < 600 ? `animation-name:${su ? 'mm-apri' : 'mm-chiudi'};animation-delay:${-passati}ms` : '';
        const presa = c.presa !== null && c.presa !== undefined;
        const bordo = presa && p.n > 1 ? `--chi:${COLORI[c.presa % 6]};` : '';
        const cls = ['mm-carta', su ? 'su' : '', presa ? 'presa' : '', sbagliate.has(i) ? 'sbagliata' : '', nuovaCoppia.has(i) ? 'trovata' : ''].join(' ');
        const fronte = su ? figura(p.tema, c.f) : '';
        const cliccabile = mio && !su && !presa;
        const tag = cliccabile ? 'button type="button" data-az="gira"' : 'div';
        return `<${tag} class="${cls}" data-i="${i}" style="${bordo}" aria-label="${su ? 'Carta scoperta' : 'Carta coperta'} ${i + 1}"><span class="mm-interno" style="${anim}"><span class="mm-dorso"></span><span class="mm-fronte">${fronte}</span></span></${tag.split(' ')[0]}>`;
      }).join('');
      let barra;
      if (p.n === 1) barra = `<span>⏱ <b class="mm-tempo">${fmt(tempo(p))}</b></span><span>Mosse <b>${p.mosse[0]}</b></span><span>Coppie <b>${p.punti[0]}/${p.coppie}</b></span>`;
      else barra = `<span>Coppie trovate <b>${p.punti.reduce((a, b) => a + b, 0)}/${p.coppie}</b></span>${p.serie > 1 ? `<span class="mm-serie">🔥 ${p.serie} di fila</span>` : ''}`;
      let msg = '';
      if (p.finita) msg = '';
      else if (p.inAttesa) msg = 'Non sono uguali… guardale bene!';
      else if (p.n === 1) msg = p.scoperte.length ? 'Gira la seconda carta' : 'Gira due carte e trova le coppie';
      else if (mio) msg = p.scoperte.length ? 'Gira la seconda carta' : p.serie ? 'Coppia! Rigiochi: gira altre due carte' : 'Tocca a te: gira due carte';
      else msg = `Gioca ${esc(ctx.nome(p.turno))}…`;
      const rec = p.finita && p.record.length ? `<div class="bb-record mm-record"><b>🏆 Partite migliori · ${p.coppie} coppie</b><ol>${p.record.map((x, k) => `<li class="${k === p.posizioneRecord ? 'nuovo' : ''}">${x.mosse} mosse <small>(${fmt(x.ms)})</small></li>`).join('')}</ol></div>` : '';
      return `<div class="mm" style="--col:${col};--rig:${righe}">
        <div class="mm-barra">${barra}</div>
        <div class="mm-tavolo ${mio || (p.n === 1 && !p.finita) ? 'mio' : ''} ${p.tema}">${carte}</div>
        ${msg ? `<p class="pa-msg mm-msg" aria-live="polite">${msg}</p>` : ''}${rec}</div>`;
    },
    dopo(ctx) {
      const p = ctx.partita, ui = ctx.ui;
      if (primaVolta(ui, `mm-g-${p.nGiro}`) && p.nGiro) suono([[520, 0.04], [700, 0.04]], { tipo: 'triangle', volume: 0.04 });
      if (p.ultimaCoppia && primaVolta(ui, `mm-ok-${p.ultimaCoppia.id}`)) suono([[660, 0.07], [880, 0.07], [1175, 0.12]], { volume: 0.06 });
      if (p.inAttesa && primaVolta(ui, `mm-no-${p.nGiro}`)) suono([[300, 0.08], [220, 0.12]], { tipo: 'sine', volume: 0.05 });
      if (p.finita && primaVolta(ui, 'mm-fine')) suono([[523, 0.1], [659, 0.1], [784, 0.1], [1046, 0.3]], { volume: 0.08 });
    },
    statoAttesa: () => 'Le carte si ricoprono…',
    stato(ctx) {
      const p = ctx.partita;
      if (p.finita) return null;
      if (p.n === 1) return 'Trova tutte le coppie';
      return p.turno === ctx.mio ? 'Tocca a te' : `Gioca ${ctx.nome(p.turno)}`;
    },
    punteggio(ctx) {
      const p = ctx.partita;
      if (p.n === 1) return ''; // da soli mosse e tempo sono già sopra le carte
      return p.punti.map((x, i) => `<span style="color:${COLORI[i % 6]}">${esc(i === ctx.mio ? 'Tu' : ctx.nome(i))} <b>${x}</b></span>`).join('') + '<span class="obiettivo">coppie</span>';
    },
    infoPosto(ctx, posto) { const x = ctx.partita.punti[posto]; return `${x} ${x === 1 ? 'coppia' : 'coppie'}`; },
    clic(ctx, el) {
      if (el.dataset.az !== 'gira') return;
      el.disabled = true;
      el.classList.add('premuta');
      ctx.invia({ tipo: 'gira', carta: Number(el.dataset.i) });
    },
  };
  Object.assign(window.Tavoli, { memory: tavolo });
})();
