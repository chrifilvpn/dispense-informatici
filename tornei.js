// TORNEO A ELIMINAZIONE e SERATA A GIOCHI MISTI: due modi di giocare più partite di fila allo stesso tavolo.
//
// Torneo (giochi da 2): chi è al tavolo più chi guarda da spettatore si iscrive; i posti mancanti (fino a 4 o 8) li
// prende il computer. Si gioca un incontro alla volta: i due in campo siedono al tavolo, tutti gli altri guardano.
// Chi vince passa al turno dopo; in caso di pareggio si rigioca una volta, poi decide la monetina. Due computer
// contro non si fanno aspettare: decide la monetina.
//
// Serata: chi ha aperto il tavolo sceglie da 2 a 8 giochi; si giocano uno dopo l'altro con gli stessi giocatori.
// Ogni gioco vinto vale 3 punti (1 a testa in caso di pareggio); alla fine vince chi ha più punti.
const PAUSA_TORNEO = 6000, PAUSA_SERATA = 8000;
const NOMI_TURNI = { 1: 'Finale', 2: 'Semifinale', 4: 'Quarti di finale' };

module.exports = function tornei(api) {
  const { io, GIOCHI, stanze, iniziaPartita, messaggioSistema, aggiorna, FICHE_INIZIALI, pulisciOpzioni, NOMI_BOT } = api;
  const mescola = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const viva = (s) => stanze.get(s.codice) === s;

  // ---------------- torneo ----------------
  // iscritti: le persone al tavolo, poi gli spettatori, poi i computer già seduti
  function iscrivibili(s) {
    const lista = [];
    for (const g of s.posti) if (g && !g.bot) lista.push({ id: g.id, nome: g.nome, bot: null });
    if (s.spettatori) for (const sp of s.spettatori.values()) if (!lista.some((x) => x.id === sp.id)) lista.push({ id: sp.id, nome: sp.nome, bot: null });
    for (const g of s.posti) if (g && g.bot) lista.push({ id: g.id, nome: g.nome, bot: g.bot });
    return lista;
  }

  function iniziaTorneo(s, dim) {
    const mod = GIOCHI[s.gioco];
    if (s.posti.length !== 2) return 'Il torneo si fa con i giochi da 2';
    dim = [4, 8].includes(Number(dim)) ? Number(dim) : 4;
    const persone = iscrivibili(s).filter((x) => !x.bot);
    if (persone.length > dim) return `Siete in ${persone.length}: scegli il torneo da 8`;
    if (persone.length > 8) return 'Il torneo è al massimo da 8';
    const giocatori = [...persone];
    const usati = new Set(giocatori.map((x) => x.nome));
    // i posti mancanti: computer (o nessuno, nei giochi solo tra persone: chi capita contro "nessuno" passa il turno)
    while (giocatori.length < dim) {
      if (mod.meta.soloPersone) { giocatori.push(null); continue; }
      const nome = NOMI_BOT.find((n) => !usati.has(n)) || `Computer ${giocatori.length + 1}`;
      usati.add(nome);
      giocatori.push({ id: `bot-${Math.random().toString(36).slice(2)}`, nome, bot: 'medio' });
    }
    // chi non c'è (posti vuoti) si mette in coppia con le persone, così due "nessuno" non si incontrano
    const veri = mescola(giocatori.filter(Boolean)), vuoti = giocatori.filter((x) => !x);
    const ordinati = [];
    for (const g of veri) { ordinati.push(g); if (vuoti.length) ordinati.push(vuoti.pop()); }
    const t = { dim, giocatori: ordinati, turni: [], r: 0, pareggi: 0, finito: false, campione: null, prossimoAlle: null };
    const primo = [];
    for (let i = 0; i < dim; i += 2) primo.push({ a: i, b: i + 1, v: null });
    t.turni.push(primo);
    s.torneo = t;
    s.serata = null;
    messaggioSistema(s, `🏆 Inizia il torneo a ${dim} di ${mod.meta.nome}!`);
    prossimoIncontro(s);
    return null;
  }

  const nomeTurno = (t, r) => NOMI_TURNI[t.dim / 2 ** (r + 1)] || `Turno ${r + 1}`;
  const giocatore = (t, k) => (k === null || k === undefined ? null : t.giocatori[k]);

  // il socket di una persona: al tavolo o tra gli spettatori
  function socketDi(s, id) {
    const g = s.posti.find((x) => x && x.id === id && !x.bot);
    if (g && g.socketId) return g.socketId;
    if (s.spettatori) for (const [sid, sp] of s.spettatori) if (sp.id === id) return sid;
    return null;
  }

  function vince(s, inc, chi, perché) {
    const t = s.torneo;
    inc.v = chi;
    const w = giocatore(t, chi), l = giocatore(t, chi === inc.a ? inc.b : inc.a);
    if (w && l) messaggioSistema(s, `🏆 ${w.nome} batte ${l.nome}${perché ? ` (${perché})` : ''}`);
    else if (w) messaggioSistema(s, `🏆 ${w.nome} passa il turno senza giocare`);
  }

  function prossimoIncontro(s) {
    const t = s.torneo;
    if (!t || t.finito || !viva(s)) return;
    t.prossimoAlle = null;
    for (;;) {
      const turno = t.turni[t.r];
      const inc = turno.find((x) => x.v === null);
      if (!inc) {
        const vincenti = turno.map((x) => x.v);
        if (vincenti.length === 1) { chiudiTorneo(s, vincenti[0]); return; }
        const nuovo = [];
        for (let i = 0; i < vincenti.length; i += 2) nuovo.push({ a: vincenti[i], b: vincenti[i + 1], v: null });
        t.turni.push(nuovo); t.r++; t.pareggi = 0;
        messaggioSistema(s, `🏆 ${nomeTurno(t, t.r)}!`);
        continue;
      }
      const A = giocatore(t, inc.a), B = giocatore(t, inc.b);
      if (!A || !B) { vince(s, inc, A ? inc.a : inc.b); continue; }
      if (A.bot && B.bot) { vince(s, inc, Math.random() < 0.5 ? inc.a : inc.b, 'computer contro computer: decide la monetina'); continue; }
      siediIncontro(s, A, B);
      iniziaPartita(s);
      messaggioSistema(s, `🏆 ${nomeTurno(t, t.r)}: ${A.nome} contro ${B.nome}`);
      aggiorna(s);
      return;
    }
  }

  // i due dell'incontro al tavolo, tutti gli altri a guardare (seguono il primo dei due)
  function siediIncontro(s, A, B) {
    s.spettatori = s.spettatori || new Map();
    for (const g of s.posti) if (g && !g.bot && g.socketId) s.spettatori.set(g.socketId, { id: g.id, nome: g.nome, segue: 0 });
    s.posti = [A, B].map((x) => {
      const sid = x.bot ? null : socketDi(s, x.id);
      if (sid) s.spettatori.delete(sid);
      // chi è andato via gioca col computer al suo posto
      if (!x.bot && !sid) return { id: `bot-${Math.random().toString(36).slice(2)}`, idTorneo: x.id, nome: `${x.nome} (PC)`, socketId: null, connesso: true, bot: 'medio', sostituto: true, fiche: FICHE_INIZIALI };
      return { id: x.id, idTorneo: x.id, nome: x.nome, socketId: sid, connesso: true, bot: x.bot, fiche: FICHE_INIZIALI };
    });
    s.vittorie = [0, 0];
    for (const sp of s.spettatori.values()) sp.segue = 0;
  }

  function chiudiTorneo(s, k) {
    const t = s.torneo;
    t.finito = true; t.campione = k;
    const c = giocatore(t, k);
    messaggioSistema(s, `🥇 ${c ? c.nome : '?'} vince il torneo!`);
    aggiorna(s);
  }

  // a fine partita (chiamata dal server una volta sola per partita)
  function fineIncontro(s, g) {
    const t = s.torneo;
    if (!t || t.finito) return;
    const inc = t.turni[t.r].find((x) => x.v === null);
    if (!inc) return;
    const v = g.risultato.vincitori;
    const idA = t.giocatori[inc.a].id, idB = t.giocatori[inc.b].id;
    const chi = v.length === 1 && s.posti[v[0]] ? s.posti[v[0]].idTorneo || s.posti[v[0]].id : null;
    const vincitore = chi === null ? null : chi === idA ? inc.a : chi === idB ? inc.b : null;
    if (vincitore !== null) vince(s, inc, vincitore);
    else if (++t.pareggi < 2) messaggioSistema(s, '🏆 Pareggio: si rigioca!');
    else vince(s, inc, Math.random() < 0.5 ? inc.a : inc.b, 'dopo due pareggi decide la monetina');
    t.prossimoAlle = Date.now() + PAUSA_TORNEO;
    clearTimeout(s.timerTorneo);
    s.timerTorneo = setTimeout(() => {
      if (!viva(s) || s.torneo !== t) return;
      if (vincitore === null && t.pareggi < 2 && !inc.v) { t.prossimoAlle = null; iniziaPartita(s); aggiorna(s); return; }
      prossimoIncontro(s);
      if (t.finito) aggiorna(s);
    }, PAUSA_TORNEO);
  }

  const vistaTorneo = (s) => {
    const t = s.torneo;
    if (!t) return null;
    return {
      dim: t.dim, nomi: t.giocatori.map((x) => (x ? x.nome : null)), bot: t.giocatori.map((x) => !!(x && x.bot)),
      turni: t.turni.map((tu, r) => ({ nome: nomeTurno(t, r), incontri: tu })), r: t.r,
      finito: t.finito, campione: t.campione, resta: t.prossimoAlle ? Math.max(0, t.prossimoAlle - Date.now()) : null,
    };
  };

  // ---------------- serata ----------------
  function iniziaSerata(s, giochi) {
    if (!Array.isArray(giochi)) return 'Scegli i giochi della serata';
    const lista = [...new Set(giochi.map(String))].filter((id) => Object.prototype.hasOwnProperty.call(GIOCHI, id));
    if (lista.length < 2 || lista.length > 8) return 'Scegli da 2 a 8 giochi';
    const conBot = s.posti.some((g) => g && g.bot);
    for (const id of lista) {
      const m = GIOCHI[id].meta;
      if (!m.giocatori.includes(s.posti.length)) return `${m.nome} non si gioca in ${s.posti.length}`;
      if (m.soloPersone && conBot) return `${m.nome} si gioca solo tra persone: toglilo o togli i computer`;
    }
    if (s.posti.some((g) => !g)) return 'Riempi tutti i posti, anche con il computer';
    s.torneo = null;
    s.serata = { giochi: lista, k: 0, punti: new Array(s.posti.length).fill(0), storia: [], finita: false, prossimoAlle: null };
    messaggioSistema(s, `🎲 Inizia la serata: ${lista.map((id) => GIOCHI[id].meta.nome).join(', ')}`);
    avviaGiocoSerata(s);
    return null;
  }

  function avviaGiocoSerata(s) {
    const se = s.serata;
    se.prossimoAlle = null;
    s.gioco = se.giochi[se.k];
    s.opzioni = pulisciOpzioni(s.gioco, {});
    iniziaPartita(s);
    messaggioSistema(s, `🎲 Gioco ${se.k + 1} di ${se.giochi.length}: ${GIOCHI[s.gioco].meta.nome}`);
    aggiorna(s);
  }

  function fineGiocoSerata(s, g) {
    const se = s.serata;
    if (!se || se.finita || se.giochi[se.k] !== s.gioco) return;
    const r = g.risultato;
    if (r.pareggio || !r.vincitori.length) r.fazioni.forEach((f) => f.posti.forEach((p) => { se.punti[p] += 1; }));
    else for (const p of r.vincitori) se.punti[p] += 3;
    se.storia.push({ gioco: s.gioco, vincitori: r.pareggio ? [] : r.vincitori.slice() });
    se.k++;
    if (se.k >= se.giochi.length) {
      se.finita = true;
      const max = Math.max(...se.punti);
      const primi = se.punti.map((x, i) => (x === max ? i : -1)).filter((i) => i >= 0).map((i) => s.posti[i] ? s.posti[i].nome : '?');
      messaggioSistema(s, `🎲 Fine della serata! ${primi.length > 1 ? `Pari tra ${primi.join(' e ')}` : `Vince ${primi[0]}`} con ${max} punti`);
      return;
    }
    se.prossimoAlle = Date.now() + PAUSA_SERATA;
    clearTimeout(s.timerSerata);
    s.timerSerata = setTimeout(() => { if (viva(s) && s.serata === se && !se.finita) avviaGiocoSerata(s); }, PAUSA_SERATA);
  }

  const vistaSerata = (s) => {
    const se = s.serata;
    if (!se) return null;
    return { giochi: se.giochi, k: se.k, punti: se.punti, storia: se.storia, finita: se.finita, resta: se.prossimoAlle ? Math.max(0, se.prossimoAlle - Date.now()) : null };
  };

  // fine di una partita: torneo o serata vanno avanti da soli
  function finePartita(s, g) {
    if (s.torneo && !s.torneo.finito) fineIncontro(s, g);
    else if (s.serata && !s.serata.finita) fineGiocoSerata(s, g);
  }
  // il tavolo torna in sala o cambia gioco a mano: torneo e serata finiscono
  function annulla(s) {
    clearTimeout(s.timerTorneo); clearTimeout(s.timerSerata);
    s.torneo = null; s.serata = null;
  }
  const partecipa = (s, id) => !!(s.torneo && s.torneo.giocatori.some((x) => x && x.id === id));
  const inCorso = (s) => !!((s.torneo && !s.torneo.finito) || (s.serata && !s.serata.finita));

  return { iniziaTorneo, iniziaSerata, finePartita, annulla, inCorso, partecipa, vistaTorneo, vistaSerata, _prossimo: prossimoIncontro };
};
