// PAGINA FINTA "CLASSE VIRTUALE": lo spazio online di una classe (generico, nessun nome o logo di prodotti veri):
// bacheca con gli annunci dei professori, lavori assegnati con le scadenze, materiali. Si sceglie in
// "Modalità studio" al posto delle dispense. Le date si calcolano a partire da oggi.
window.BossClasse = (() => {
  const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
  const tra = (g) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + g); return d; };
  const data = (g) => { const d = tra(g); return `${d.getDate()} ${MESI[d.getMonth()]}`; };
  const PROF = { rossi: ['Prof. M. Rossi', '#1a73e8'], ferri: ['Prof.ssa A. Ferri', '#d93025'], conti: ['Prof. G. Conti', '#188038'], bianchi: ['Prof.ssa L. Bianchi', '#e37400'] };
  const POST = [
    ['rossi', 0, 'Ho caricato la soluzione commentata dell\'esercitazione sul subnetting. Controllate soprattutto il calcolo del broadcast nelle reti /27 e /28: è lì che si sbaglia di più.', ['Soluzione esercitazione subnetting.pdf', 'Tabella potenze di 2.pdf'], 3],
    ['ferri', -1, 'Per giovedì portate il progetto del server multithread funzionante. Chi ha problemi con il ServerSocket mi scriva qui sotto entro stasera.', ['Traccia progetto socket.pdf'], 5],
    ['bianchi', -2, 'Esercizi per casa: pagina 412 numeri 15-22 (aree tra due curve). Correzione in classe lunedì.', [], 1],
    ['conti', -4, 'Materiale del laboratorio: script SQL per creare il database della biblioteca con i dati di prova. Lanciatelo prima della prossima lezione.', ['biblioteca.sql', 'Schema ER biblioteca.png'], 2],
  ];
  const LAVORI = [
    ['ferri', 'Server multithread con socket TCP', 3, 'Assegnato'], ['rossi', 'Relazione di laboratorio: VLAN e trunk', 5, 'Assegnato'],
    ['conti', 'Query SQL: JOIN e raggruppamenti (12 esercizi)', 8, 'Assegnato'], ['bianchi', 'Esercizi sugli integrali definiti', -2, 'Consegnato'],
    ['rossi', 'Esercitazione subnetting', -6, 'Valutato · 8/10'],
  ];
  let root, scheda = 'bacheca';
  const avatar = (k) => `<span class="cv-av" style="background:${PROF[k][1]}">${PROF[k][0].split(' ').pop()[0]}</span>`;

  function html() {
    return `<div class="cv-app">
      <header class="cv-top">
        <div class="st-logo cv-logo"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="6" width="28" height="20" rx="3" fill="#188038"/><rect x="5" y="9" width="22" height="14" rx="1" fill="#e6f4ea"/><circle cx="16" cy="14" r="3" fill="#188038"/><path d="M10 21c1.5-3 4-4 6-4s4.5 1 6 4" fill="#188038"/></svg>
          <div><b>Classe virtuale</b><small>5ªB Informatica</small></div></div>
        <nav class="cv-tab">${[['bacheca', 'Bacheca'], ['lavori', 'Lavori del corso'], ['persone', 'Persone']].map(([k, t]) => `<button type="button" data-cv="${k}">${t}</button>`).join('')}</nav>
        <span class="cv-io">S</span>
      </header>
      <main class="cv-corpo" id="cv-corpo"></main>
    </div>`;
  }
  function disegna() {
    const c = root.querySelector('#cv-corpo');
    for (const b of root.querySelectorAll('[data-cv]')) b.classList.toggle('attiva', b.dataset.cv === scheda);
    if (scheda === 'bacheca') {
      c.innerHTML = `<div class="cv-banner"><h1>5ªB Informatica</h1><p>Sistemi e Reti · TPSIT · Informatica · Matematica</p></div>
        <div class="cv-colonne"><aside class="cv-scad"><b>In scadenza</b>${LAVORI.filter((l) => l[2] > 0).slice(0, 3).map(([, t, g]) => `<p><small>Scade il ${data(g)}</small>${t}</p>`).join('')}<button type="button" class="cv-link" data-cv="lavori">Mostra tutto</button></aside>
        <div class="cv-flusso"><div class="cv-scrivi">${'<span class="cv-av" style="background:#5f6368">S</span>'}<span>Comunica qualcosa alla classe…</span></div>
        ${POST.map(([k, g, testo, all, com]) => `<article class="cv-post"><header>${avatar(k)}<div><b>${PROF[k][0]}</b><small>${g === 0 ? 'Oggi' : data(g)}</small></div></header>
          <p>${testo}</p>${all.length ? `<div class="cv-all">${all.map((a) => `<span>${a.endsWith('.pdf') ? '📄' : a.endsWith('.sql') ? '🗃️' : '🖼️'} ${a}</span>`).join('')}</div>` : ''}
          <footer>💬 ${com} commenti del corso</footer></article>`).join('')}</div></div>`;
    } else if (scheda === 'lavori') {
      c.innerHTML = `<h2 class="cv-tit">Lavori del corso</h2>${LAVORI.map(([k, t, g, s]) => `<div class="cv-lavoro"><span class="cv-ic">📝</span><div><b>${t}</b><small>${PROF[k][0]} · ${g > 0 ? `Scadenza: ${data(g)}` : `Scaduto il ${data(g)}`}</small></div><span class="cv-stato ${s === 'Assegnato' ? 'aperto' : 'fatto'}">${s}</span></div>`).join('')}`;
    } else {
      const studenti = ['Alessandro B.', 'Beatrice C.', 'Chiara D.', 'Davide F.', 'Elena G.', 'Federico L.', 'Giulia M.', 'Luca N.', 'Martina P.', 'Matteo R.', 'Sara S.', 'Tommaso V.'];
      c.innerHTML = `<h2 class="cv-tit">Docenti</h2>${Object.keys(PROF).map((k) => `<div class="cv-persona">${avatar(k)}<span>${PROF[k][0]}</span></div>`).join('')}
        <h2 class="cv-tit">Studenti <small>${studenti.length + 1}</small></h2>${['Tu', ...studenti].map((n) => `<div class="cv-persona"><span class="cv-av" style="background:#80868b">${n[0]}</span><span>${n}</span></div>`).join('')}`;
    }
  }
  function avvia(el) {
    root = el;
    disegna();
    root.addEventListener('click', (e) => { const b = e.target.closest('[data-cv]'); if (b) { scheda = b.dataset.cv; disegna(); } });
  }
  return { html, avvia, query: () => '', mostrata() {}, titolo: 'Classe virtuale · 5ªB Informatica' };
})();
