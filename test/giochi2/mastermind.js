// Codice segreto: risposta con pioli neri e bianchi, opzioni, sfida, computer (Knuth)
const assert = require('assert');
process.env.TEST_VELOCE = process.env.TEST_VELOCE || '1';
const M = require('../../giochi2/mastermind');
const { risposta, tuttiICodici, knuth, TENTATIVI } = M._test;

// ---- la risposta ----
assert.deepStrictEqual(risposta([0, 1, 2, 3], [0, 1, 2, 3]), [4, 0]);
assert.deepStrictEqual(risposta([3, 2, 1, 0], [0, 1, 2, 3]), [0, 4]);
assert.deepStrictEqual(risposta([0, 0, 1, 1], [0, 1, 2, 3]), [1, 1], 'i colori ripetuti contano una volta sola');
assert.deepStrictEqual(risposta([1, 1, 1, 1], [0, 1, 2, 3]), [1, 0]);
assert.deepStrictEqual(risposta([4, 4, 5, 5], [0, 1, 2, 3]), [0, 0]);
assert.deepStrictEqual(risposta([0, 0, 0, 1], [1, 0, 0, 0]), [2, 2]);
assert.deepStrictEqual(risposta([2, 2, 3, 3, 4], [3, 3, 2, 2, 4]), [1, 4]);
assert.deepStrictEqual(risposta([7, 6, 5, 7, 7], [7, 7, 7, 6, 0]), [1, 3]);
assert.strictEqual(tuttiICodici(6, 4, true).length, 1296);
assert.strictEqual(tuttiICodici(6, 4, false).length, 360);
assert.strictEqual(tuttiICodici(8, 5, true).length, 32768);
assert.strictEqual(tuttiICodici(8, 5, false).length, 6720);

// ---- regole della partita ----
{
  const g = M.crea({ n: 2, opzioni: { colori: 6, pioli: 4, ripetuti: 'no' } });
  assert.strictEqual(new Set(g.segreto).size, 4, 'senza ripetizioni il codice ha colori diversi');
  assert.ok(g.azione(0, { tipo: 'prova', codice: [0, 1, 2] }).errore, 'servono 4 pioli');
  assert.ok(g.azione(0, { tipo: 'prova', codice: [0, 1, 2, 6] }).errore, 'colore fuori dalla scelta');
  assert.ok(g.azione(0, { tipo: 'prova', codice: [0, 0, 1, 2] }).errore, 'niente colori ripetuti');
  assert.ok(g.azione(0, { tipo: 'prova', codice: 'ciao' }).errore);
  assert.ok(g.azione(0, null).errore);
  const sbagliato = tuttiICodici(6, 4, false).find((c) => c.join() !== g.segreto.join());
  assert.ok(g.azione(0, { tipo: 'prova', codice: sbagliato }).ok);
  const v1 = g.vista(1);
  assert.strictEqual(v1.altri[0].tentativi, 1);
  assert.strictEqual(v1.altri[0].righe[0].codice, null, 'i colori degli altri non si vedono');
  assert.strictEqual(v1.segreto, null, 'il segreto non si vede');
  assert.ok(g.azione(0, { tipo: 'prova', codice: g.segreto }).ok);
  assert.ok(g.fatto[0].vinto && g.fatto[0].tentativi === 2);
  assert.ok(g.azione(0, { tipo: 'prova', codice: g.segreto }).errore, 'chi ha finito aspetta');
  assert.deepStrictEqual(g.vista(0).segreto, g.segreto, 'chi ha finito vede il codice');
  assert.deepStrictEqual(g.attesi(), [1]);
  for (let k = 0; k < TENTATIVI; k++) g.azione(1, { tipo: 'prova', codice: sbagliato });
  assert.ok(g.finita && g.risultato.vincitori[0] === 0 && g.risultato.fazioni[0].punti === TENTATIVI - 1, '10 tentativi al massimo; punti = 11 − tentativi');
  // a parità di tentativi vince chi ha finito prima
  const h = M.crea({ n: 2, opzioni: {} });
  h.inizio -= 1000;
  h.azione(1, { tipo: 'prova', codice: h.segreto });
  h.inizio += 1000; // il secondo "arriva" più tardi
  h.fatto[1].ms = 100; h.azione(0, { tipo: 'prova', codice: h.segreto }); h.fatto[0].ms = 500;
  h.chiudi();
  assert.deepStrictEqual(h.risultato.vincitori, [1]);
  // ritiro nella sfida
  const s = M.crea({ n: 2, opzioni: {} });
  s.salta(0); s.salta(1);
  assert.ok(s.finita && !s.risultato.vincitori.length);
  // opzioni 8 colori e 5 pioli
  const o = M.crea({ n: 1, opzioni: { colori: 8, pioli: 5, ripetuti: 'si' } });
  assert.ok(o.segreto.length === 5 && o.segreto.every((x) => x >= 0 && x < 8));
  assert.ok(o.azione(0, { tipo: 'prova', codice: [7, 7, 7, 7, 7] }).ok, 'con i ripetuti si può');
  assert.strictEqual(o.pausaBoss, true);
}

// ---- Knuth: 4 pioli e 6 colori sempre in al massimo 6 tentativi (di solito 4-5), e veloce ----
{
  delete process.env.TEST_VELOCE;
  const tutti = tuttiICodici(6, 4, true);
  let max = 0, tot = 0, maxMs = 0;
  const prove = 25;
  for (let k = 0; k < prove; k++) {
    const g = M.crea({ n: 1, opzioni: {} });
    while (!g.finita) {
      const t0 = Date.now();
      const a = M.bot(g, 0, 'difficile');
      maxMs = Math.max(maxMs, Date.now() - t0);
      assert.ok(!g.azione(0, a).errore);
    }
    assert.ok(g.fatto[0].vinto, 'il difficile trova sempre il codice');
    max = Math.max(max, g.fatto[0].tentativi); tot += g.fatto[0].tentativi;
  }
  assert.ok(max <= 6, `Knuth: al massimo 6 tentativi (${max})`);
  assert.ok(maxMs < 1500, `una mossa del difficile in meno di 1,5 s (${maxMs} ms)`);
  // anche con lo spazio più grande (8 colori, 5 pioli) resta veloce
  const g = M.crea({ n: 1, opzioni: { colori: 8, pioli: 5 } });
  let lento = 0;
  while (!g.finita) { const t0 = Date.now(); g.azione(0, M.bot(g, 0, 'difficile')); lento = Math.max(lento, Date.now() - t0); }
  assert.ok(lento < 2500, `8 colori e 5 pioli: ${lento} ms al massimo`);
  assert.ok(knuth([tutti[5]], tutti, 6, 4) === tutti[5]);
  process.env.TEST_VELOCE = '1';
  console.log(`✓ Codice segreto: Knuth trova 4 pioli e 6 colori in media in ${(tot / prove).toFixed(2)} tentativi (massimo ${max}, ${maxMs} ms a mossa; 8×5: ${lento} ms)`);
}

// ---- partite complete tra computer ----
{
  const LIV = ['facile', 'medio', 'difficile'];
  const t0 = Date.now();
  const medie = { facile: [0, 0], medio: [0, 0], difficile: [0, 0] };
  const vinte = { facile: 0, medio: 0, difficile: 0 };
  let partite = 0;
  for (const n of [1, 2, 3, 4, 5, 6]) {
    const N = n === 1 ? 150 : 60;
    for (let k = 0; k < N; k++) {
      const liv = Array.from({ length: n }, (_, i) => LIV[(i + k) % 3]);
      const opzioni = { colori: [6, 8][k % 2], pioli: [4, 4, 5][k % 3], ripetuti: ['si', 'no'][Math.floor(k / 2) % 2] };
      const g = M.crea({ n, opzioni });
      let passi = 0;
      while (!g.finita) {
        assert.ok(++passi < 200, 'la partita finisce');
        for (const p of g.attesi()) {
          if (g.finita) break;
          const r = g.azione(p, M.bot(g, p, liv[p]));
          assert.ok(!r.errore, `mossa del computer rifiutata: ${r.errore}`);
        }
      }
      partite++;
      for (let i = 0; i < n; i++) {
        const f = g.fatto[i];
        medie[liv[i]][0] += f.vinto ? f.tentativi : TENTATIVI + 2; medie[liv[i]][1]++;
      }
      for (const v of g.risultato.vincitori) vinte[liv[v]]++;
      assert.ok(g.risultato.vincitori.every((v) => g.fatto[v].vinto));
    }
  }
  const m = LIV.map((l) => medie[l][0] / medie[l][1]);
  assert.ok(m[2] <= m[1] + 0.2 && m[1] < m[0] - 1, `il medio e il difficile usano meno tentativi del facile: ${m.map((x) => x.toFixed(2)).join('/')}`);
  console.log(`✓ Codice segreto: ${partite} partite tra computer da 1 a 6, tentativi medi f/m/d ${m.map((x) => x.toFixed(2)).join('/')}, vittorie ${LIV.map((l) => vinte[l]).join('/')} (${Date.now() - t0} ms)`);
}
