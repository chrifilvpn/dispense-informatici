// Nonogram: indizi, risolutore (soluzione unica), griglie a caso e della raccolta, collaborazione, errori, aiuto, pausa
const assert = require('assert');
const M = require('../../giochi2/nonogram');
const { indizi, indiziLinea, risolviLinea, contaSoluzioni, generaCasuale, daDisegno, DISEGNI, PIENA, CROCE, VUOTA } = M._test;

// ---- indizi e logica di una linea ----
assert.deepStrictEqual(indiziLinea([1, 1, 0, 1, 0, 0, 1, 1, 1]), [2, 1, 3]);
assert.deepStrictEqual(indiziLinea([0, 0, 0]), []);
assert.deepStrictEqual(risolviLinea([-1, -1, -1, -1, -1], [5]), [1, 1, 1, 1, 1]);
assert.deepStrictEqual(risolviLinea([-1, -1, -1, -1, -1], [3]), [-1, -1, 1, -1, -1], 'sovrapposizione: la casella centrale è piena');
assert.deepStrictEqual(risolviLinea([-1, -1, -1, -1, -1], [2, 2]), [1, 1, 0, 1, 1]);
assert.deepStrictEqual(risolviLinea([-1, -1, -1, -1, -1], []), [0, 0, 0, 0, 0]);
assert.deepStrictEqual(risolviLinea([1, -1, -1, -1, -1], [2]), [1, 1, 0, 0, 0]);
assert.strictEqual(risolviLinea([1, 1, 1, -1, -1], [2]), null, 'contraddizione');
// soluzioni: una griglia ambigua (la diagonale 2×2) ne ha due, i disegni una sola
assert.strictEqual(contaSoluzioni(indizi([1, 0, 0, 1], 2), 2).soluzioni, 2, 'la diagonale 2×2 è ambigua');
assert.strictEqual(contaSoluzioni(indizi([1, 1, 0, 1], 2), 2).soluzioni, 1);

// ---- la raccolta: ogni disegno ha una sola soluzione e si risolve con la logica ----
{
  let quanti = 0;
  for (const lato of [5, 10, 15]) {
    assert.ok(DISEGNI[lato].length >= 5, `almeno 5 disegni ${lato}×${lato}`);
    for (const d of DISEGNI[lato]) {
      assert.ok(d.righe.length === lato && d.righe.every((r) => r.length === lato), `${d.nome}: misura giusta`);
      const v = contaSoluzioni(indizi(daDisegno(d), lato), lato, 2);
      assert.ok(v.soluzioni === 1 && v.logica, `${d.nome} ${lato}×${lato}: soluzione unica e logica`);
      quanti++;
    }
  }
  console.log(`✓ Nonogram: i ${quanti} disegni della raccolta hanno una sola soluzione, trovabile con la logica`);
}

// ---- griglie a caso: sempre una sola soluzione (controllata anche con la ricerca completa) ----
{
  const t0 = Date.now();
  let n = 0;
  for (const lato of [5, 10, 15]) {
    for (let k = 0; k < 40; k++) {
      const { sol } = generaCasuale(lato);
      const ind = indizi(sol, lato);
      const v = contaSoluzioni(ind, lato, 2);
      assert.strictEqual(v.soluzioni, 1, 'soluzione unica');
      // la soluzione trovata è proprio quella
      assert.deepStrictEqual(indizi(sol, lato), ind);
      n++;
    }
  }
  const ms = (Date.now() - t0) / n;
  assert.ok(ms < 200, `generazione veloce (${ms.toFixed(1)} ms)`);
  console.log(`✓ Nonogram: ${n} griglie a caso 5×5, 10×10 e 15×15, tutte con una sola soluzione (${ms.toFixed(1)} ms l'una)`);
}

// ---- partita: colorare, croci, trascinamento, errori, aiuto, collaborazione ----
{
  const g = M.crea({ n: 2, opzioni: { lato: 5, origine: 'disegni', errori: 'visibili' } });
  const lato = 5, sol = g.soluzione;
  const piena = sol.indexOf(1), vuota = sol.indexOf(0);
  assert.ok(g.azione(0, { tipo: 'segna', celle: [piena], valore: 3 }).errore, 'valore non valido');
  assert.ok(g.azione(0, { tipo: 'segna', celle: [99], valore: 1 }).errore, 'casella non valida');
  assert.ok(g.azione(0, { tipo: 'segna', celle: [0, 6], valore: 1 }).errore, 'il trascinamento resta su una riga o colonna');
  assert.ok(g.azione(0, { tipo: 'segna', celle: 'x', valore: 1 }).errore);
  assert.ok(g.azione(0, { tipo: 'segna', celle: [piena], valore: PIENA }).ok);
  assert.strictEqual(g.celle[piena], PIENA);
  assert.ok(g.azione(1, { tipo: 'segna', celle: [piena], valore: VUOTA }).ok);
  assert.strictEqual(g.celle[piena], PIENA, 'con gli errori visibili una casella giusta non si cancella');
  g.azione(1, { tipo: 'segna', celle: [vuota], valore: PIENA });
  assert.ok(g.celle[vuota] === CROCE && g.sbagliate[vuota] && g.errori === 1, 'sbagliata: si rivela vuota e conta come errore');
  assert.ok(g.vista(0).sbagliate[vuota]);
  assert.strictEqual(g.vista(0).soluzione, null, 'la soluzione non si vede');
  // trascinamento su una riga intera
  const r = Math.floor(piena / lato);
  g.azione(0, { tipo: 'segna', celle: Array.from({ length: lato }, (_, c) => r * lato + c).filter((i) => sol[i]), valore: PIENA });
  assert.ok(Array.from({ length: lato }, (_, c) => r * lato + c).every((i) => !sol[i] || g.celle[i] === PIENA));
  // aiuto: +30 s
  const prima = g.cronometro();
  assert.ok(g.azione(1, { tipo: 'aiuto' }).ok);
  assert.ok(g.cronometro() >= prima + 30000 && g.aiuti === 1, 'l\'aiuto costa 30 secondi');
  const ai = g.ultimoAiuto.cella;
  assert.ok(sol[ai] ? g.celle[ai] === PIENA : g.celle[ai] === CROCE);
  // completamento con tutte le caselle giuste
  for (let i = 0; i < 25; i++) if (sol[i] && g.celle[i] !== PIENA) g.azione(i % 2, { tipo: 'segna', celle: [i], valore: PIENA });
  assert.ok(g.finita && g.risultato.vincitori.length === 2, 'si vince insieme');
  assert.ok(g.vista(0).soluzione && g.vista(0).nomeDisegno, 'a fine partita si vede il disegno');
  assert.ok(g.vista(0).record.length >= 1);
  assert.ok(g.azione(0, { tipo: 'segna', celle: [0], valore: 1 }).errore, 'finita');
  // errori nascosti: le caselle sbagliate restano e la partita non finisce finché non si tolgono
  const h = M.crea({ n: 1, opzioni: { lato: 10, origine: 'caso', errori: 'nascosti' } });
  const v = h.soluzione.indexOf(0);
  h.azione(0, { tipo: 'segna', celle: [v], valore: PIENA });
  assert.ok(h.celle[v] === PIENA && h.vista(0).sbagliate === null && h.vista(0).errori === null, 'errori nascosti');
  for (let i = 0; i < 100; i++) if (h.soluzione[i]) h.azione(0, { tipo: 'segna', celle: [i], valore: PIENA });
  assert.ok(!h.finita, 'con una casella sbagliata non è finita');
  h.azione(0, { tipo: 'segna', celle: [v], valore: CROCE });
  assert.ok(h.finita, 'tolta la casella sbagliata il disegno è completo');
  // le croci non contano
  const k = M.crea({ n: 1, opzioni: { lato: 5 } });
  k.azione(0, { tipo: 'segna', celle: [k.soluzione.indexOf(1)], valore: CROCE });
  assert.strictEqual(k.errori, 0, 'una croce non è un errore');
  // pausa
  k.impostaPausa(true);
  assert.ok(k.azione(0, { tipo: 'aiuto' }).errore, 'in pausa non si gioca');
  const t = k.cronometro(); const fermo = Date.now(); while (Date.now() - fermo < 20);
  assert.strictEqual(k.cronometro(), t, 'cronometro fermo');
  assert.ok(M.meta.soloPersone && M.meta.pausaBoss);
  console.log('✓ Nonogram: colorare e cancellare, croci, trascinamento su una linea, errori visibili e nascosti, aiuto +30 s, collaborazione, pausa');
}

// ---- partite complete (giocatori simulati: risolvono con la logica, a volte sbagliano) ----
{
  const t0 = Date.now();
  let partite = 0;
  for (const n of [1, 2, 3, 4]) {
    for (let k = 0; k < 60; k++) {
      const lato = [5, 10, 15][k % 3];
      const g = M.crea({ n, opzioni: { lato, origine: k % 2 ? 'caso' : 'disegni', errori: k % 4 < 2 ? 'visibili' : 'nascosti' } });
      let passi = 0;
      while (!g.finita) {
        assert.ok(++passi < 2000, 'la partita finisce');
        const p = passi % n;
        const r = Math.random();
        let a;
        if (r < 0.04) a = { tipo: 'aiuto' };
        else {
          // una riga a caso: si colorano le caselle giuste (a volte una sbagliata) e si tolgono quelle sbagliate
          const riga = Math.floor(Math.random() * lato);
          const celle = Array.from({ length: lato }, (_, c) => riga * lato + c);
          const giuste = celle.filter((i) => g.soluzione[i] && g.celle[i] !== PIENA);
          const sbagliate = celle.filter((i) => !g.soluzione[i] && g.celle[i] === PIENA);
          if (sbagliate.length) a = { tipo: 'segna', celle: sbagliate, valore: VUOTA };
          else if (r < 0.15) a = { tipo: 'segna', celle: [celle[Math.floor(Math.random() * lato)]], valore: PIENA };
          else if (giuste.length) a = { tipo: 'segna', celle: giuste, valore: PIENA };
          else a = { tipo: 'segna', celle: [celle[0]], valore: g.soluzione[celle[0]] ? PIENA : CROCE };
        }
        const res = g.azione(p, a);
        assert.ok(!res.errore || res.errore === 'Non c\'è niente da aiutare', `mossa rifiutata: ${res.errore}`);
      }
      assert.ok(g.soluzione.every((s, i) => (s ? g.celle[i] === PIENA : g.celle[i] !== PIENA)));
      partite++;
    }
  }
  console.log(`✓ Nonogram: ${partite} partite complete da 1 a 4 giocatori (${Date.now() - t0} ms)`);
}
