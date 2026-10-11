// PAGINA FINTA "REGISTRO ELETTRONICO": un'area studenti generica (nessun nome o logo di prodotti veri) con voti,
// agenda, assenze e bacheca. Si sceglie in "Modalità studio" al posto delle dispense. I dati sono inventati ma
// credibili e restano uguali per tutta la giornata (generatore con seme sulla data); le date si calcolano da oggi.
window.BossRegistro = (() => {
  const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
  const GIORNI = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  const tra = (g) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + g); return d; };
  const data = (g) => { const d = tra(g); return `${GIORNI[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]}`; };
  // numeri "a caso" ma uguali per tutto il giorno
  let seme = Number(new Date().toISOString().slice(0, 10).replace(/-/g, '')) % 2147483647;
  const rnd = () => { seme = (seme * 16807) % 2147483647; return (seme - 1) / 2147483646; };
  const MATERIE = [
    ['Sistemi e Reti', 'Prof. M. Rossi'], ['TPSIT', 'Prof.ssa A. Ferri'], ['Informatica', 'Prof. G. Conti'],
    ['Gestione progetto', 'Prof. P. Galli'], ['Matematica', 'Prof.ssa L. Bianchi'], ['Lingua e letteratura italiana', 'Prof.ssa R. Marino'],
    ['Storia', 'Prof.ssa R. Marino'], ['Lingua inglese', 'Prof.ssa S. Greco'], ['Scienze motorie', 'Prof. D. Lombardi'], ['Religione', 'Prof. F. Costa'],
  ];
  const TIPI = ['Scritto', 'Orale', 'Pratico'];
  const voto = () => { const v = Math.round((5 + rnd() * 4) * 4) / 4; return Math.min(9.5, v); };
  const fmt = (v) => { const i = Math.floor(v), f = v - i; return f === 0 ? `${i}` : f === 0.25 ? `${i}+` : f === 0.5 ? `${i}½` : `${i + 1}-`; };
  const voti = MATERIE.map(([nome, prof]) => {
    const n = 2 + Math.floor(rnd() * 3), lista = [];
    let g = -4 - Math.floor(rnd() * 6);
    for (let k = 0; k < n; k++) { lista.push({ v: voto(), tipo: TIPI[Math.floor(rnd() * (nome === 'Religione' || nome === 'Scienze motorie' ? 1 : 3))], g }); g -= 6 + Math.floor(rnd() * 12); }
    return { nome, prof, lista };
  });
  const colore = (v) => (v < 6 ? 'rg-insuf' : v < 7 ? 'rg-suff' : 'rg-buono');
  const media = (l) => l.reduce((s, x) => s + x.v, 0) / l.length;
  const AGENDA = [
    [1, 'Sistemi e Reti', 'Verifica scritta: subnetting e VLSM'], [2, 'Lingua inglese', 'Reading comprehension: «Cybersecurity»'],
    [3, 'TPSIT', 'Consegna esercizi sui socket (cartella condivisa)'], [6, 'Matematica', 'Verifica: integrali definiti e aree'],
    [8, 'Informatica', 'Presentazione del progetto: database della biblioteca'], [10, 'Storia', 'Interrogazioni: la Prima guerra mondiale'],
    [13, 'Lingua e letteratura italiana', 'Simulazione della prima prova (6 ore)'],
  ];
  const BACHECA = [
    [-1, 'Circ. n. 112', 'Simulazione delle prove dell\'Esame di Stato', 'Le classi quinte svolgeranno la simulazione della prima prova secondo il calendario allegato. Gli studenti porteranno il dizionario della lingua italiana.'],
    [-3, 'Circ. n. 109', 'Orientamento in uscita: incontro con le università', 'Incontro in aula magna con i docenti dei corsi di laurea in Informatica e Ingegneria. Partecipano le classi quarte e quinte.'],
    [-6, 'Circ. n. 104', 'PCTO: consegna del diario di bordo', 'Gli studenti delle classi quinte completano il diario delle attività di PCTO entro la fine del mese.'],
    [-9, 'Circ. n. 98', 'Assemblea di istituto', 'L\'assemblea si terrà nelle ultime due ore. Ordine del giorno: elezioni dei rappresentanti, varie ed eventuali.'],
  ];
  let root, scheda = 'voti';

  function html() {
    return `<div class="rg-app">
      <header class="rg-top">
        <div class="st-logo rg-logo"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="3" width="24" height="26" rx="3" fill="#0f6e5c"/><rect x="8" y="8" width="16" height="2.4" rx="1" fill="#fff"/><rect x="8" y="13" width="16" height="2.4" rx="1" fill="#fff"/><rect x="8" y="18" width="10" height="2.4" rx="1" fill="#fff"/><circle cx="22" cy="22" r="4" fill="#ffd166"/></svg>
          <div><b>Registro elettronico</b><small>Istituto Tecnico Statale · Area studenti</small></div></div>
        <div class="rg-utente"><span class="rg-classe">5ªB · Informatica</span><span class="rg-avatar">S</span></div>
      </header>
      <nav class="rg-tab" role="tablist">${[['voti', '📊 Voti'], ['agenda', '📅 Agenda'], ['assenze', '🕑 Assenze'], ['bacheca', '📌 Bacheca'], ['oggi', '📖 Lezioni di oggi']].map(([k, t]) => `<button type="button" role="tab" data-rg="${k}">${t}</button>`).join('')}</nav>
      <main class="rg-corpo" id="rg-corpo"></main>
      <footer class="rg-piede">Anno scolastico in corso · Ultimo accesso: oggi alle ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}</footer>
    </div>`;
  }
  function disegna() {
    const c = root.querySelector('#rg-corpo');
    for (const b of root.querySelectorAll('[data-rg]')) b.setAttribute('aria-selected', String(b.dataset.rg === scheda));
    if (scheda === 'voti') {
      const tutte = voti.flatMap((m) => m.lista);
      c.innerHTML = `<div class="rg-riassunto"><div><small>Media generale</small><b>${media(tutte).toFixed(2).replace('.', ',')}</b></div><div><small>Valutazioni</small><b>${tutte.length}</b></div><div><small>Periodo</small><b>Secondo</b></div></div>
        <div class="rg-tabella"><table><thead><tr><th>Materia</th><th>Valutazioni</th><th>Media</th></tr></thead><tbody>
        ${voti.map((m) => `<tr><td><b>${m.nome}</b><small>${m.prof}</small></td><td class="rg-voti">${m.lista.map((x) => `<span class="rg-voto ${colore(x.v)}" title="${x.tipo} · ${data(x.g)}">${fmt(x.v)}<small>${x.tipo[0]} · ${data(x.g).slice(4)}</small></span>`).join('')}</td><td><span class="rg-media ${colore(media(m.lista))}">${media(m.lista).toFixed(2).replace('.', ',')}</span></td></tr>`).join('')}
        </tbody></table></div>`;
    } else if (scheda === 'agenda') {
      c.innerHTML = `<h2>Prossimi impegni</h2><ul class="rg-lista">${AGENDA.map(([g, m, t]) => `<li><span class="rg-data">${data(g)}</span><div><b>${m}</b><p>${t}</p></div></li>`).join('')}</ul>`;
    } else if (scheda === 'assenze') {
      const ass = [[-12, 'Assenza', 'Giustificata'], [-27, 'Ritardo (2ª ora)', 'Giustificato'], [-40, 'Uscita anticipata', 'Giustificata'], [-55, 'Assenza', 'Giustificata']];
      c.innerHTML = `<div class="rg-riassunto"><div><small>Assenze</small><b>2</b></div><div><small>Ritardi</small><b>1</b></div><div><small>Uscite</small><b>1</b></div><div><small>Da giustificare</small><b>0</b></div></div>
        <ul class="rg-lista">${ass.map(([g, t, s]) => `<li><span class="rg-data">${data(g)}</span><div><b>${t}</b><p>${s}</p></div></li>`).join('')}</ul>`;
    } else if (scheda === 'bacheca') {
      c.innerHTML = `<h2>Bacheca</h2>${BACHECA.map(([g, n, t, testo]) => `<article class="rg-circ"><small>${n} · ${data(g)}</small><h3>${t}</h3><p>${testo}</p><span class="rg-allegato">📄 ${n.replace(/\W+/g, '_')}.pdf</span></article>`).join('')}`;
    } else {
      const ore = [['8:00', 'Sistemi e Reti', 'Subnetting con maschere a lunghezza variabile (VLSM): esercizi guidati.'], ['9:00', 'Sistemi e Reti', 'Laboratorio: configurazione delle VLAN con il simulatore.'], ['10:00', 'Matematica', 'Integrali definiti: area tra due curve.'], ['11:00', 'Lingua e letteratura italiana', 'Pirandello: la poetica dell\'umorismo; lettura da «Il fu Mattia Pascal».'], ['12:00', 'Lingua inglese', 'Cloud computing: vocabulary and reading.'], ['13:00', 'TPSIT', 'Socket TCP in Java: il server multithread.']];
      c.innerHTML = `<h2>Lezioni di oggi · ${data(0)}</h2><ul class="rg-lista">${ore.map(([o, m, t]) => `<li><span class="rg-data">${o}</span><div><b>${m}</b><p>${t}</p></div></li>`).join('')}</ul>`;
    }
  }
  function avvia(el) {
    root = el;
    disegna();
    root.addEventListener('click', (e) => { const b = e.target.closest('[data-rg]'); if (b) { scheda = b.dataset.rg; disegna(); } });
  }
  return { html, avvia, query: () => '', mostrata() {}, titolo: 'Registro elettronico · Area studenti' };
})();
