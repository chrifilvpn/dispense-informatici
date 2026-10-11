// Test di CONNESSIONI: la raccolta dei puzzle, le regole (gruppo giusto, "quasi", errori, prove ripetute, ultimo
// gruppo automatico), cosa vede ognuno, chi vince la sfida, e centinaia di partite complete tra computer.
const assert = require('assert');
const { GIOCHI } = require('../../giochi');

const M = GIOCHI.connessioni;
const { PUZZLE } = M._test;

// ---- la raccolta ----
assert.ok(PUZZLE.length >= 60, `servono almeno 60 puzzle (sono ${PUZZLE.length})`);
const visti = new Set();
for (const [k, p] of PUZZLE.entries()) {
  assert.strictEqual(p.length, 4, `puzzle ${k + 1}: 4 gruppi`);
  assert.deepStrictEqual(p.map((g) => g.colore), ['giallo', 'verde', 'blu', 'viola'], `puzzle ${k + 1}: colori in ordine di difficoltà`);
  const parole = p.flatMap((g) => g.parole);
  assert.strictEqual(parole.length, 16, `puzzle ${k + 1}: 16 parole`);
  assert.strictEqual(new Set(parole).size, 16, `puzzle ${k + 1}: nessuna parola ripetuta (${parole.filter((w, i) => parole.indexOf(w) !== i)})`);
  for (const g of p) {
    assert.ok(g.tema.length >= 3, `puzzle ${k + 1}: ogni gruppo ha il suo tema`);
    for (const w of g.parole) assert.ok(/^[A-ZÀÈÉÌÒÙ0-9]{2,14}$/.test(w), `puzzle ${k + 1}: parola strana «${w}»`);
  }
  const firma = [...parole].sort().join(' ');
  assert.ok(!visti.has(firma), `puzzle ${k + 1} doppio`);
  visti.add(firma);
}
console.log(`✓ Connessioni: ${PUZZLE.length} puzzle, ognuno con 16 parole diverse in 4 gruppi (giallo, verde, blu, viola)`);

// ---- regole di una partita ----
{
  const g = M.crea({ n: 2, opzioni: { puzzle: 0 } });
  const [giallo, verde, blu, viola] = PUZZLE[0].map((x) => x.parole);
  assert.ok(g.azione(0, { tipo: 'prova', parole: giallo.slice(0, 3) }).errore, 'servono 4 parole');
  assert.ok(g.azione(0, { tipo: 'prova', parole: [giallo[0], giallo[0], giallo[1], giallo[2]] }).errore, 'parole diverse');
  assert.ok(g.azione(0, { tipo: 'prova', parole: [...giallo.slice(0, 3), 'BANANONE'] }).errore, 'solo parole sul tavolo');
  assert.ok(g.azione(0, { tipo: 'prova', parole: 'ABCD' }).errore, 'input non valido');
  assert.ok(g.azione(5, { tipo: 'prova', parole: giallo }).errore, 'posto inesistente');
  // quasi: 3 su 4
  assert.ok(g.azione(0, { tipo: 'prova', parole: [...giallo.slice(0, 3), verde[0]] }).ok);
  assert.strictEqual(g.giocatori[0].errori, 1);
  assert.strictEqual(g.giocatori[0].ultimo.esito, 'quasi');
  assert.ok(g.azione(0, { tipo: 'prova', parole: [verde[0], giallo[1], giallo[0], giallo[2]].map((w) => w.toLowerCase()) }).errore, 'la stessa combinazione (in un altro ordine) non si ripete');
  assert.strictEqual(g.giocatori[0].errori, 1, 'la prova ripetuta non costa un errore');
  // 2 + 2: sbagliato e basta
  g.azione(0, { tipo: 'prova', parole: [giallo[0], giallo[1], verde[0], verde[1]] });
  assert.strictEqual(g.giocatori[0].ultimo.esito, 'sbagliato');
  // gruppo giusto (in minuscolo va bene lo stesso)
  assert.ok(g.azione(0, { tipo: 'prova', parole: giallo.map((w) => w.toLowerCase()) }).ok);
  assert.deepStrictEqual(g.giocatori[0].trovati, [0]);
  let v = g.vista(0);
  assert.strictEqual(v.parole.length, 12, 'le parole del gruppo trovato lasciano il tavolo');
  assert.strictEqual(v.trovati[0].tema, PUZZLE[0][0].tema);
  assert.strictEqual(v.soluzione, null, 'la soluzione non si vede prima della fine');
  assert.ok(g.azione(0, { tipo: 'prova', parole: [giallo[0], ...verde.slice(0, 3)] }).errore, 'le parole già trovate non si possono riusare');
  // l'avversario vede solo i colori trovati e gli errori
  const altro = g.vista(1);
  assert.deepStrictEqual(altro.altri[0], { colori: ['giallo'], errori: 2, fatto: null, bot: false });
  assert.ok(!JSON.stringify(altro.altri).includes(giallo[0]), 'gli altri non vedono le parole');
  assert.strictEqual(altro.parole.length, 16);
  // dopo il terzo gruppo l'ultimo si scopre da solo e il giocatore ha finito
  g.azione(0, { tipo: 'prova', parole: viola });
  g.azione(0, { tipo: 'prova', parole: verde });
  assert.deepStrictEqual(g.giocatori[0].trovati, [0, 3, 1, 2]);
  assert.ok(g.giocatori[0].fatto.vinto && g.giocatori[0].fatto.errori === 2);
  assert.ok(g.azione(0, { tipo: 'prova', parole: blu }).errore, 'chi ha finito non gioca più');
  assert.ok(g.vista(0).soluzione, 'chi ha finito vede la soluzione');
  assert.ok(!g.finita, 'la sfida aspetta l\'altro giocatore');
  // l'altro sbaglia 4 volte: perde
  for (const prova of [[giallo[0], verde[0], blu[0], viola[0]], [giallo[1], verde[1], blu[1], viola[1]], [giallo[2], verde[2], blu[2], viola[2]], [giallo[3], verde[3], blu[3], viola[3]]]) g.azione(1, { tipo: 'prova', parole: prova });
  assert.ok(g.finita && !g.giocatori[1].fatto.vinto);
  assert.deepStrictEqual(g.risultato.vincitori, [0]);
  v = g.vista(1);
  assert.strictEqual(v.soluzione.length, 4);
}
// 6 errori con l'opzione più facile; arrendersi; vince chi sbaglia meno, poi chi fa prima
{
  const g = M.crea({ n: 1, opzioni: { errori: 6, puzzle: 3 } });
  const [a, b, c, d] = PUZZLE[3].map((x) => x.parole);
  const sbagliate = [[a[0], b[0], c[0], d[0]], [a[1], b[1], c[1], d[1]], [a[2], b[2], c[2], d[2]], [a[3], b[3], c[3], d[3]], [a[0], b[1], c[2], d[3]]];
  for (const s of sbagliate) g.azione(0, { tipo: 'prova', parole: s });
  assert.ok(!g.finita, 'con 6 errori ammessi dopo 5 si continua');
  g.azione(0, { tipo: 'prova', parole: [a[1], b[2], c[3], d[0]] });
  assert.ok(g.finita && g.risultato.vincitori.length === 0, 'al sesto errore è persa');
  const h = M.crea({ n: 1, opzioni: {} });
  assert.strictEqual(h.maxErrori, 4);
  assert.ok(h.azione(0, { tipo: 'arrenditi' }).ok && h.finita && h.giocatori[0].fatto.ritirato);

  const s = M.crea({ n: 3, opzioni: { puzzle: 5 } });
  const gr = PUZZLE[5].map((x) => x.parole);
  const risolvi = (p, errori) => {
    if (errori) s.azione(p, { tipo: 'prova', parole: [gr[0][0], gr[1][0], gr[2][0], gr[3][0]] });
    for (const x of gr.slice(0, 3)) s.azione(p, { tipo: 'prova', parole: x });
  };
  risolvi(2, 1);
  risolvi(1, 0);
  s.giocatori[1].fatto.ms = s.giocatori[2].fatto.ms + 5000; // il giocatore 1 è più lento ma senza errori
  risolvi(0, 0);
  s.giocatori[0].fatto.ms = s.giocatori[1].fatto.ms + 1000;
  s.chiudi();
  assert.deepStrictEqual(s.risultato.vincitori, [1], 'meno errori, poi chi ha fatto prima');
  const pt = s.risultato.fazioni.map((f) => f.punti);
  assert.ok(pt[1] === pt[0] && pt[1] > pt[2], 'punti: 10 per gruppo + 5 per errore risparmiato');
}
// nella sfida chi è via si ritira; i computer hanno un orologio loro (scadenza) e non sono tra gli "attesi"
{
  const g = M.crea({ n: 3, opzioni: {}, bot: [null, 'medio', 'difficile'] });
  assert.deepStrictEqual(g.attesi(), [0], 'il server aspetta solo le persone');
  assert.ok(g.scadenza() !== null, 'i computer hanno la loro scadenza');
  g.salta(0);
  assert.ok(g.giocatori[0].fatto.ritirato);
  assert.deepStrictEqual(g.attesi(), []);
}
console.log('✓ Connessioni: 4 parole per prova, "quasi!" con 3 su 4, prove ripetute gratis, errori (4 o 6), ultimo gruppo automatico, gli altri vedono solo i colori, vince chi sbaglia meno e poi chi fa prima');

// ---- partite complete tra computer (come le fa il server: con l'orologio dei computer) ----
const VELOCE = !!process.env.TEST_VELOCE;
const LIVELLI = ['facile', 'medio', 'difficile'];
const vinte = { facile: [0, 0], medio: [0, 0], difficile: [0, 0] };
let partite = 0;
for (const n of M.meta.giocatori) {
  const quante = VELOCE ? 300 : 800;
  for (let k = 0; k < quante; k++) {
    const livelli = Array.from({ length: n }, () => LIVELLI[Math.floor(Math.random() * 3)]);
    // il posto 0 è una persona (che qui gioca come il computer medio), gli altri sono computer
    const bot = livelli.map((l, i) => (i === 0 ? null : l));
    const g = M.crea({ n, opzioni: { errori: k % 5 === 0 ? 6 : 4 }, bot });
    let giri = 0;
    while (!g.finita) {
      assert.ok(++giri < 200, 'la partita deve finire');
      if (g.attesi().includes(0)) {
        const r = g.azione(0, M.bot(g, 0, 'medio'));
        assert.ok(r.ok, `mossa del computer rifiutata: ${r.errore}`);
      }
      for (let p = 1; p < n; p++) if (g.prossimaBot[p] !== null) g.prossimaBot[p] = 0; // il tempo di riflessione è passato
      if (g.scadenza() !== null) {
        const prima = g.giocatori.map((x) => x.prove.length + (x.fatto ? 100 : 0)).join();
        assert.ok(g.controllaTempo(), 'controllaTempo fa muovere i computer');
        assert.notStrictEqual(g.giocatori.map((x) => x.prove.length + (x.fatto ? 100 : 0)).join(), prima);
        for (let p = 1; p < n; p++) assert.ok(!g.giocatori[p].fatto || !g.giocatori[p].fatto.ritirato, 'un computer non deve mai ritirarsi per una mossa rifiutata');
      }
    }
    partite++;
    for (let p = 1; p < n; p++) { vinte[livelli[p]][0]++; if (g.giocatori[p].fatto.vinto) vinte[livelli[p]][1]++; }
    assert.ok(g.risultato && g.risultato.fazioni.length === n);
    for (const v of g.risultato.vincitori) assert.ok(g.giocatori[v].fatto.vinto);
  }
}
const perc = (l) => vinte[l][1] / Math.max(1, vinte[l][0]);
assert.ok(perc('difficile') > 0.93, `il difficile risolve quasi sempre (${perc('difficile')})`);
assert.ok(perc('facile') < perc('medio') && perc('medio') < perc('difficile'), 'facile < medio < difficile');
assert.ok(perc('facile') < 0.5, `il facile sbaglia spesso (${perc('facile')})`);
console.log(`✓ Connessioni: ${partite} partite complete tra computer (da 1 a 8 giocatori), nessuna mossa rifiutata; puzzle risolti: facile ${Math.round(perc('facile') * 100)}%, medio ${Math.round(perc('medio') * 100)}%, difficile ${Math.round(perc('difficile') * 100)}%`);
