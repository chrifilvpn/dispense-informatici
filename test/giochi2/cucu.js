// Cucù (Asso che corre): scambi, re che bloccano, mazziere col mazzo, vite e partite complete tra computer.
const assert = require('assert');
process.env.TEST_VELOCE = '1';
const M = require('../../giochi2/cucu');
const { valore } = M._test;
const C = (id) => ({ id, rango: Number(id.slice(0, -1)), seme: id.slice(-1) });
const LIVELLI = ['facile', 'medio', 'difficile'];
const re = (c) => c.rango === 13;

// valori: asso 1 … 7, fante 8, cavallo 9, re 10
assert.deepStrictEqual(['1c', '7q', '11f', '12p', '13c'].map((x) => valore(C(x))), [1, 7, 8, 9, 10]);

// prepara un giro con carte decise (senza re in mano a chi deve muovere per primo)
function giro(n, carte) {
  const g = M.crea({ n, primo: 0, opzioni: {} });
  for (const j of g.ordine) { g.carte[j] = C(carte[j]); g.originali[j] = g.carte[j]; }
  g.mazzo = g.mazzo.filter((c) => !carte.includes(c.id));
  g.storia = []; g.mostrati = []; g.k = 0; g.inAttesa = false; g.turno = g.ordine[0];
  return g;
}
{
  // in 3: mazziere 0, ordine 1, 2, 0
  const g = giro(3, ['5c', '2q', '9f']);
  assert.deepStrictEqual(g.ordine, [1, 2, 0], 'parte chi è dopo il mazziere, il mazziere per ultimo');
  assert.ok(g.azione(0, { tipo: 'tieni' }).errore, 'fuori turno');
  assert.ok(g.azione(1, { tipo: 'boh' }).errore, 'mossa non valida');
  assert.ok(!g.azione(1, { tipo: 'scambia' }).errore);
  assert.strictEqual(g.carte[1].id, '9f'); assert.strictEqual(g.carte[2].id, '2q');
  assert.ok(g.azione(2, { tipo: 'tieni' }).errore, 'durante l\'animazione si aspetta');
  // chi ha ricevuto sa chi ha la sua carta (e viceversa); gli altri vedono solo lo scambio
  assert.deepStrictEqual(g.vista(2).so.map((x) => [x.posto, x.carta.id]), [[1, '9f']]);
  assert.deepStrictEqual(g.vista(1).so.map((x) => [x.posto, x.carta.id]), [[2, '2q']]);
  assert.strictEqual(g.vista(0).carte[1], null, 'le carte degli altri restano coperte');
  assert.strictEqual(g.vista(0).so.length, 0);
  g.avanza();
  assert.strictEqual(g.turno, 2);
  assert.ok(!g.azione(2, { tipo: 'scambia' }).errore); // 2 dà il 2 al mazziere e prende il 5
  g.avanza();
  assert.deepStrictEqual(g.vista(1).so.map((x) => [x.posto, x.carta.id]), [[0, '2q']], 'la carta nota segue gli scambi');
  assert.strictEqual(g.turno, 0);
  const cima = g.mazzo[g.mazzo.length - 1];
  assert.ok(!g.azione(0, { tipo: 'scambia' }).errore, 'il mazziere cambia col mazzo');
  assert.strictEqual(g.carte[0].id, cima.id, 'e tiene la carta pescata');
  assert.strictEqual(g.scartata.id, '2q');
  g.avanza();
  assert.strictEqual(g.fase, 'scoperta');
  const min = Math.min(...g.ordine.map((j) => valore(g.carte[j])));
  assert.deepStrictEqual(g.esito.perdenti, g.ordine.filter((j) => valore(g.carte[j]) === min), 'perde chi ha la più bassa');
  assert.ok(g.vista(1).carte.every((c) => c), 'alla scoperta si vedono tutte');
}
{
  // il re blocca lo scambio e si mostra
  const g = giro(3, ['5c', '2q', '13f']);
  assert.ok(!g.azione(1, { tipo: 'scambia' }).errore);
  assert.strictEqual(g.carte[1].id, '2q', 'lo scambio con chi ha il re salta');
  assert.strictEqual(g.carte[2].id, '13f');
  assert.ok(g.vista(0).carte[2] && g.vista(0).carte[2].id === '13f', 'il re è scoperto per tutti');
  g.avanza();
  assert.ok(g.inAttesa && g.storia.at(-1).tipo === 'cucu', 'chi ha il re non sceglie: cucù');
  g.avanza();
  assert.strictEqual(g.turno, 0);
}
{
  // parità sulla più bassa: perdono tutti; se uscissero tutti il giro non conta
  const g = giro(3, ['5c', '3q', '3f']);
  g.vite = [3, 1, 3];
  for (const p of [1, 2, 0]) { g.azione(p, { tipo: 'tieni' }); g.avanza(); }
  assert.deepStrictEqual(g.esito.perdenti.sort(), [1, 2]);
  assert.deepStrictEqual(g.vite, [3, 0, 2]);
  const h = giro(3, ['4c', '4q', '4f']);
  h.vite = [1, 1, 1];
  for (const p of [1, 2, 0]) { h.azione(p, { tipo: 'tieni' }); h.avanza(); }
  assert.ok(h.esito.annullato && h.vite.every((v) => v === 1) && !h.finita, 'giro annullato');
}

// ---- partite complete tra computer ----
let totali = 0;
const t0 = Date.now();
for (const n of [3, 4, 5, 6, 7, 8]) {
  const N = 300;
  for (let k = 0; k < N; k++) {
    const vite = k % 2 ? 3 : 5;
    const g = M.crea({ n, primo: k % n, opzioni: { vite } });
    const livelli = Array.from({ length: n }, (_, i) => LIVELLI[(i + k) % 3]);
    let passi = 0;
    while (!g.finita) {
      assert.ok(++passi < 50000, 'la partita deve finire');
      if (g.inAttesa) {
        const prima = g.vite.reduce((a, b) => a + b, 0);
        const fase = g.fase;
        g.avanza();
        if (fase === 'scambi' && g.fase === 'scoperta') {
          const e = g.esito;
          assert.strictEqual(g.vite.reduce((a, b) => a + b, 0), prima - (e.annullato ? 0 : e.perdenti.length), 'una vita in meno per ogni perdente');
          const min = Math.min(...g.ordine.map((j) => valore(g.carte[j])));
          assert.ok(e.perdenti.every((j) => valore(g.carte[j]) === min));
        }
        continue;
      }
      const t = g.turno;
      assert.ok(!re(g.carte[t]), 'chi ha il re non deve scegliere');
      const prima = g.carte.map((c) => c && c.id);
      const r = g.azione(t, M.bot(g, t, livelli[t]));
      assert.ok(!r.errore, `mossa del computer rifiutata: ${r.errore}`);
      const e = g.storia.at(-1);
      if (e.tipo === 'scambia') assert.ok(!re(C(prima[t])) && !re(C(prima[e.con])), 'i re non passano di mano');
      const viste = new Set(g.carte.filter(Boolean).map((c) => c.id));
      assert.strictEqual(viste.size, g.carte.filter(Boolean).length, 'nessuna carta doppia');
    }
    assert.strictEqual(g.vite.filter((v) => v > 0).length, 1, 'resta uno solo');
    assert.deepStrictEqual(g.risultato.vincitori, [g.vite.findIndex((v) => v > 0)]);
    totali++;
  }
}
console.log(`✓ Cucù: ${totali} partite tra computer da 3 a 8 giocatori, re che bloccano, mazziere col mazzo, vite giuste (${Date.now() - t0} ms)`);

// ---- forza del computer: vite perse per giro ----
function perse(n, livs, N) {
  const pe = {}, gi = {};
  for (let k = 0; k < N; k++) {
    const g = M.crea({ n, primo: k % n, opzioni: { vite: 5 } });
    const liv = Array.from({ length: n }, (_, i) => livs[(i + k) % livs.length]);
    while (!g.finita) {
      if (g.inAttesa) {
        const fase = g.fase;
        g.avanza();
        if (fase === 'scambi' && g.fase === 'scoperta') {
          for (const j of g.ordine) gi[liv[j]] = (gi[liv[j]] || 0) + 1;
          if (!g.esito.annullato) for (const j of g.esito.perdenti) pe[liv[j]] = (pe[liv[j]] || 0) + 1;
        }
        continue;
      }
      g.azione(g.turno, M.bot(g, g.turno, liv[g.turno]));
    }
  }
  return Object.fromEntries(Object.keys(gi).map((l) => [l, (pe[l] || 0) / gi[l]]));
}
{
  const a = perse(4, ['facile', 'medio'], 250);
  assert.ok(a.facile > a.medio + 0.03, `il facile perde più vite del medio (${a.facile.toFixed(3)} / ${a.medio.toFixed(3)})`);
  const b = perse(8, ['medio', 'difficile'], 500);
  assert.ok(b.difficile < b.medio, `il difficile perde meno vite del medio (${b.difficile.toFixed(3)} / ${b.medio.toFixed(3)})`);
  console.log(`✓ Cucù: vite perse per giro facile ${a.facile.toFixed(3)} / medio ${a.medio.toFixed(3)} in 4, medio ${b.medio.toFixed(3)} / difficile ${b.difficile.toFixed(3)} in 8`);
}
