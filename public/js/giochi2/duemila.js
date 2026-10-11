// 2048: la griglia è un elemento vivo (non si ridisegna a ogni aggiornamento) con una tessera HTML per ogni tessera del
// server: quando si muovono scorrono con una transizione, quelle che si fondono vanno una sull'altra e la nuova
// tessera "salta fuori". Comandi: frecce, WASD, scorrimento del dito sulla griglia (senza far scorrere la pagina).
(() => {
  const { esc, primaVolta, suono } = window.Nuovi;
  const SCORRE_MS = 110;
  let ctxD = null, tav = null, partitaVista = null, mossaVista = -1, ricevuto = 0;
  const elementi = new Map(); // id della tessera → elemento
  const fmt = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const attivo = () => ctxD && ctxD.stato && ctxD.partita && ctxD.partita.gioco === 'duemila';
  const puoMuovere = () => attivo() && !ctxD.partita.finita && !ctxD.partita.fatto && !ctxD.partita.inPausa;
  setInterval(() => {
    if (!attivo()) return;
    const p = ctxD.partita, el = document.querySelector('.dm-resta');
    if (el && p.resta != null) { const r = p.resta - (p.finita ? 0 : Date.now() - ricevuto); el.textContent = fmt(r); el.classList.toggle('poco', r < 20000); }
  }, 250);

  function crea() {
    tav = document.createElement('div');
    tav.className = 'dm-tavola';
    tav.innerHTML = `<div class="dm-fondo">${'<i></i>'.repeat(16)}</div><div class="dm-tessere"></div>`;
    // scorrimento del dito (o del mouse): niente scorrimento della pagina sulla griglia
    let inizio = null;
    tav.addEventListener('pointerdown', (e) => { inizio = { x: e.clientX, y: e.clientY, id: e.pointerId }; e.preventDefault(); });
    tav.addEventListener('pointerup', (e) => {
      if (!inizio || inizio.id !== e.pointerId) return;
      const dx = e.clientX - inizio.x, dy = e.clientY - inizio.y;
      inizio = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
      muovi(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'dx' : 'sx') : (dy > 0 ? 'giu' : 'su'));
    });
    tav.addEventListener('pointercancel', () => { inizio = null; });
    tav.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }
  function muovi(dir) {
    if (!puoMuovere()) return;
    ctxD.invia({ tipo: 'muovi', dir });
  }
  const pos = (el, i) => { el.style.setProperty('--r', Math.floor(i / 4)); el.style.setProperty('--c', i % 4); };
  function nuovaTessera(t, cls) {
    const el = document.createElement('div');
    el.className = `dm-t v${Math.min(t.v, 4096)} ${cls}`;
    el.style.setProperty('--cifre', String(t.v).length);
    el.innerHTML = `<span>${t.v}</span>`;
    pos(el, t.i);
    tav.querySelector('.dm-tessere').append(el);
    elementi.set(t.id, el);
    // l'animazione si toglie quando è finita: la griglia viene spostata a ogni aggiornamento e ripartirebbe da capo
    if (cls) setTimeout(() => el.classList.remove(cls), 450);
    return el;
  }
  // allinea le tessere HTML alla griglia del server, con le animazioni dell'ultima mossa
  function disponi(p) {
    const box = tav.querySelector('.dm-tessere');
    const nuovaPartita = partitaVista !== p.partita || p.nMossa < mossaVista;
    if (nuovaPartita) { box.innerHTML = ''; elementi.clear(); partitaVista = p.partita; }
    const animare = !nuovaPartita && p.nMossa !== mossaVista;
    mossaVista = p.nMossa;
    const presenti = new Set(p.tessere.map((t) => t.id));
    const fuse = new Map((animare ? p.fusioni : []).map((f) => [f.id, f]));
    // le tessere che si sono fuse: scivolano dove nasce la nuova, poi spariscono
    for (const f of fuse.values()) for (const id of f.da) {
      const el = elementi.get(id);
      if (!el) continue;
      pos(el, f.dove); el.classList.add('via');
      elementi.delete(id);
      setTimeout(() => el.remove(), SCORRE_MS + 30);
    }
    for (const [id, el] of elementi) if (!presenti.has(id)) { el.remove(); elementi.delete(id); }
    for (const t of p.tessere) {
      const el = elementi.get(t.id);
      if (el) { pos(el, t.i); continue; }
      const cls = !animare ? '' : fuse.has(t.id) ? 'fusa' : t.id === p.nuova ? 'nuova' : '';
      nuovaTessera(t, cls);
    }
    tav.classList.toggle('ferma', !!(p.fatto || p.finita));
  }

  function minigriglia(v) {
    return `<div class="dm-mini">${v.map((x) => `<i class="v${Math.min(x, 4096)}">${x || ''}</i>`).join('')}</div>`;
  }

  const tavolo = {
    libero: true,
    reset(ctx) { ctxD = ctx; ricevuto = Date.now(); },
    panno(ctx) {
      const p = ctx.partita;
      const migliore = p.record.length ? Math.max(p.record[0].punti, p.punti) : p.punti;
      const tempo = p.resta != null ? `<span class="dm-box"><small>tempo</small><b class="dm-resta">${fmt(p.resta)}</b></span>` : '';
      const testa = `<div class="dm-testa"><span class="dm-logo">2048</span><span class="dm-box"><small>punti</small><b>${p.punti}</b></span>${p.n === 1 ? `<span class="dm-box"><small>record</small><b>${migliore}</b></span>` : ''}${tempo}</div>`;
      let msg;
      if (p.finita) msg = p.n === 1 ? `Partita finita: tessera più alta <b>${p.max}</b>` : '';
      else if (p.fatto) msg = p.fatto.motivo === 'bloccato' ? 'Niente più mosse: aspetta gli altri' : 'Hai finito';
      else if (p.vinto && p.n === 1) msg = '🏆 2048! Continua per fare più punti';
      else msg = p.n > 1 ? 'Primo a 2048, o più punti allo scadere' : 'Unisci le tessere uguali fino a 2048';
      const altri = p.n > 1 ? `<div class="dm-altri">${p.altri.map((a, i) => (i === ctx.mio ? '' : `<div class="dm-altro ${a.fatto ? 'fatto' : ''}"><p><b>${esc(ctx.nome(i))}</b><span>${a.punti}</span></p>${minigriglia(a.mini)}</div>`)).join('')}</div>` : '';
      const rec = p.finita && p.record.length ? `<div class="bb-record dm-record"><b>🏆 Punteggi migliori${p.n > 1 ? ` · sfida da ${p.minuti} minuti` : ''}</b><ol>${p.record.map((x, k) => `<li class="${k === p.posizioneRecord ? 'nuovo' : ''}">${x.punti} punti <small>(tessera ${x.max}, ${x.mosse} mosse)</small></li>`).join('')}</ol></div>` : '';
      const frecce = p.finita || p.fatto ? '' : `<div class="dm-frecce" aria-label="Frecce">
        <button type="button" class="bottone" data-az="muovi" data-dir="sx" aria-label="Sinistra">◀</button><button type="button" class="bottone" data-az="muovi" data-dir="su" aria-label="Su">▲</button><button type="button" class="bottone" data-az="muovi" data-dir="giu" aria-label="Giù">▼</button><button type="button" class="bottone" data-az="muovi" data-dir="dx" aria-label="Destra">▶</button></div>`;
      return `<div class="dm ${p.n > 1 ? 'sfida' : ''}"><div class="dm-centro">${testa}<div class="dm-posto"></div>${msg ? `<p class="pa-msg dm-msg">${msg}</p>` : ''}${frecce}${rec}</div>${altri}</div>`;
    },
    dopo(ctx) {
      ctxD = ctx;
      const p = ctx.partita;
      if (!tav) crea();
      const posto = document.querySelector('.dm-posto');
      if (posto && tav.parentElement !== posto) posto.append(tav);
      disponi(p);
      if (p.fusioni && p.fusioni.length && primaVolta(ctx.ui, `dm-f-${p.partita}-${p.nMossa}`)) {
        const max = Math.max(...p.fusioni.map((f) => p.tessere.find((t) => t.id === f.id)?.v || 4));
        suono([[220 + Math.log2(max) * 40, 0.05]], { tipo: 'triangle', volume: 0.04 });
      }
      if (p.vinto && primaVolta(ctx.ui, `dm-2048-${p.partita}`)) suono([[523, 0.1], [659, 0.1], [784, 0.1], [1046, 0.3]], { volume: 0.08 });
    },
    stato(ctx) { const p = ctx.partita; if (p.finita) return null; return p.fatto ? 'Aspetta gli altri' : p.n > 1 ? 'Sfida a 2048' : 'Arriva a 2048'; },
    punteggio(ctx) {
      const p = ctx.partita;
      if (p.n === 1) return `<span>Punti <b>${p.punti}</b></span><span>Tessera <b>${p.max}</b></span>`;
      return p.altri.map((a, i) => `<span>${esc(i === ctx.mio ? 'Tu' : ctx.nome(i))} <b>${a.punti}</b></span>`).join('') + '<span class="obiettivo">2048 o più punti</span>';
    },
    infoPosto(ctx, posto) { const a = ctx.partita.altri[posto]; return `${a.punti} punti · ${a.max}${a.fatto ? (a.fatto.motivo === '2048' ? ' 🏆' : ' · fermo') : ''}`; },
    clic(ctx, el) { if (el.dataset.az === 'muovi') muovi(el.dataset.dir); },
  };

  const TASTI = { ArrowUp: 'su', ArrowDown: 'giu', ArrowLeft: 'sx', ArrowRight: 'dx', w: 'su', s: 'giu', a: 'sx', d: 'dx', W: 'su', S: 'giu', A: 'sx', D: 'dx' };
  document.addEventListener('keydown', (e) => {
    if (!attivo() || (window.Boss && Boss.attivo)) return;
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    const d = TASTI[e.key];
    if (!d) return;
    e.preventDefault();
    if (!e.repeat) muovi(d);
  });
  Object.assign(window.Tavoli, { duemila: tavolo });
})();
