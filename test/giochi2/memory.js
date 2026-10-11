// Memory: coppie, turni, carte sbagliate che restano scoperte un attimo, partita da soli, memoria dei computer
const assert = require('assert');
const M = require('../../giochi2/memory');
const { MENTE } = M._test;

// ---- regole di base ----
{
  const g = M.crea({ n: 2, primo: 0, opzioni: { coppie: 8, tema: 'cibo' }, bot: [null, null] });
  assert.strictEqual(g.carte.length, 16);
  assert.strictEqual(g.tema, 'cibo');
  for (let f = 0; f < 18; f++) assert.ok([0, 2].includes(g.carte.filter((x) => x === f).length), 'ogni figura c\'è due volte (o mai)');
  const v0 = g.vista(0);
  assert.ok(v0.carte.every((c) => c.f === null), 'all\'inizio le figure sono tutte nascoste');
  assert.ok(g.azione(1, { tipo: 'gira', carta: 0 }).errore, 'non è il suo turno');
  assert.ok(g.azione(0, { tipo: 'gira', carta: 99 }).errore, 'carta inesistente');
  assert.ok(g.azione(0, { tipo: 'gira', carta: 'a' }).errore);
  assert.ok(g.azione(0, { tipo: 'boh' }).errore);
  // una coppia sbagliata: resta scoperta, poi tocca all'altro
  const a = 0, b = g.carte.findIndex((x, i) => i > 0 && x !== g.carte[0]);
  assert.ok(g.azione(0, { tipo: 'gira', carta: a }).ok);
  assert.ok(g.azione(0, { tipo: 'gira', carta: a }).errore, 'la stessa carta due volte no');
  assert.strictEqual(g.vista(1).carte[a].f, g.carte[a], 'la carta girata la vedono tutti');
  assert.ok(g.azione(0, { tipo: 'gira', carta: b }).ok);
  assert.ok(g.inAttesa && g.vista(0).sbagliate.length === 2, 'le carte sbagliate restano scoperte un attimo');
  assert.ok(g.pausaMs >= 800);
  assert.ok(g.azione(0, { tipo: 'gira', carta: 3 }).errore, 'durante la pausa non si gira');
  g.avanza();
  assert.strictEqual(g.turno, 1);
  assert.ok(g.vista(0).carte[a].f === null, 'poi si ricoprono');
  // una coppia giusta: è sua e rigioca
  const f = g.carte[5], c = g.carte.findIndex((x, i) => i !== 5 && x === f);
  g.azione(1, { tipo: 'gira', carta: 5 }); g.azione(1, { tipo: 'gira', carta: c });
  assert.ok(!g.inAttesa && g.turno === 1 && g.punti[1] === 1, 'coppia trovata: rigioca');
  assert.ok(g.azione(1, { tipo: 'gira', carta: c }).errore, 'una coppia presa non si gira più');
  assert.strictEqual(g.vista(0).carte[c].presa, 1);
}

// ---- da soli: mosse, tempo e classifica ----
{
  const g = M.crea({ n: 1, opzioni: { coppie: 8, tema: 'bandiere' }, bot: [null] });
  // partita perfetta (barando: si conoscono le carte)
  const fatte = new Set();
  for (let i = 0; i < g.carte.length; i++) {
    if (fatte.has(i)) continue;
    const j = g.carte.findIndex((x, k) => k !== i && x === g.carte[i]);
    fatte.add(i); fatte.add(j);
    assert.ok(g.azione(0, { tipo: 'gira', carta: i }).ok && g.azione(0, { tipo: 'gira', carta: j }).ok);
  }
  assert.ok(g.finita && g.risultato.fazioni[0].punti === 8 && g.risultato.crescente, 'da soli contano le mosse (meno è meglio)');
  assert.ok(g.vista(0).record.length >= 1 && g.vista(0).posizioneRecord === 0, 'la partita entra in classifica');
  // pausa delle dispense
  const h = M.crea({ n: 1, opzioni: {}, bot: [null] });
  assert.strictEqual(h.pausaBoss, true);
  h.impostaPausa(true);
  assert.ok(h.azione(0, { tipo: 'gira', carta: 0 }).errore, 'in pausa non si gioca');
  const t = h.cronometro(); const fermo = Date.now(); while (Date.now() - fermo < 20);
  assert.strictEqual(h.cronometro(), t, 'il cronometro è fermo');
  h.impostaPausa(false);
  assert.ok(h.azione(0, { tipo: 'gira', carta: 0 }).ok);
}

// ---- la memoria dei computer ----
{
  assert.ok(MENTE.facile.capienza < MENTE.medio.capienza && MENTE.medio.capienza < MENTE.difficile.capienza);
  // il difficile, dopo aver visto due carte uguali, le prende
  const g = M.crea({ n: 2, primo: 0, opzioni: { coppie: 12 }, bot: [null, 'difficile'] });
  const f = g.carte[0], j = g.carte.findIndex((x, i) => i > 0 && x === f);
  g.menti[1] = new Map([[0, f], [j, f]]);
  g.turno = 1;
  const m1 = M.bot(g, 1, 'difficile').carta; g.azione(1, { tipo: 'gira', carta: m1 });
  const m2 = M.bot(g, 1, 'difficile').carta; g.azione(1, { tipo: 'gira', carta: m2 });
  assert.deepStrictEqual([m1, m2].sort((a, b) => a - b), [0, j].sort((a, b) => a - b), 'ricorda la coppia e la prende');
  assert.strictEqual(g.punti[1], 1);
  // la carta girata da un altro la memorizza (il difficile quasi sempre)
  let viste = 0;
  for (let t = 0; t < 50; t++) {
    const h = M.crea({ n: 2, primo: 0, opzioni: {}, bot: [null, 'difficile'] });
    h.azione(0, { tipo: 'gira', carta: 3 });
    if (h.menti[1] && h.menti[1].get(3) === h.carte[3]) viste++;
  }
  assert.ok(viste >= 40, `il difficile ricorda quasi tutto (${viste}/50)`);
  // il facile tiene poche carte in testa
  const e = M.crea({ n: 2, primo: 0, opzioni: { coppie: 18 }, bot: [null, 'facile'] });
  for (let i = 0; i < 30; i++) { e.scoperte = []; e.inAttesa = false; e.turno = 0; e.azione(0, { tipo: 'gira', carta: i }); }
  assert.ok((e.menti[1] ? e.menti[1].size : 0) <= MENTE.facile.capienza, 'il facile dimentica');
}

// ---- partite complete tra computer ----
{
  const LIV = ['facile', 'medio', 'difficile'];
  const t0 = Date.now();
  const righe = [];
  const coppieV = { facile: 0, medio: 0, difficile: 0 }, partiteL = { facile: 0, medio: 0, difficile: 0 };
  for (const n of [1, 2, 3, 4, 5, 6]) {
    const N = n === 1 ? 150 : 200;
    let mosseSolo = { facile: 0, medio: 0, difficile: 0 };
    for (let k = 0; k < N; k++) {
      const liv = Array.from({ length: n }, (_, i) => LIV[(i + k) % 3]);
      const coppie = [8, 12, 18][k % 3];
      const g = M.crea({ n, primo: k % n, opzioni: { coppie, tema: M.meta.opzioni[1].valori[k % 4] }, bot: liv });
      let passi = 0;
      while (!g.finita) {
        assert.ok(++passi < 5000, 'la partita finisce');
        if (g.inAttesa) { g.avanza(); continue; }
        const t = g.turno;
        const r = g.azione(t, M.bot(g, t, liv[t]));
        assert.ok(!r.errore, `mossa del computer rifiutata: ${r.errore}`);
      }
      assert.strictEqual(g.prese.filter((x) => x === null).length, 0, 'tutte le coppie trovate');
      if (n === 1) mosseSolo[liv[0]] += g.mosse[0] / coppie;
      else {
        assert.strictEqual(g.punti.reduce((a, b) => a + b, 0), coppie, 'le coppie sono tutte di qualcuno');
        for (let i = 0; i < n; i++) { coppieV[liv[i]] += g.punti[i] / coppie; partiteL[liv[i]]++; }
      }
    }
    if (n === 1) {
      for (const l of LIV) mosseSolo[l] /= N / 3;
      assert.ok(mosseSolo.difficile < mosseSolo.medio && mosseSolo.medio < mosseSolo.facile, `da soli il difficile usa meno mosse: ${JSON.stringify(mosseSolo)}`);
      righe.push(`da soli mosse per coppia f/m/d ${LIV.map((l) => mosseSolo[l].toFixed(2)).join('/')}`);
    }
  }
  const quota = LIV.map((l) => coppieV[l] / partiteL[l]);
  assert.ok(quota[2] > quota[1] && quota[1] > quota[0], `in gruppo il difficile trova più coppie: ${quota.map((x) => x.toFixed(2)).join('/')}`);
  console.log(`✓ Memory: coppie, turni, carte sbagliate in pausa, classifica da soli, ${150 + 5 * 200} partite tra computer da 1 a 6 (${righe.join('; ')}; quota di coppie f/m/d ${quota.map((x) => x.toFixed(2)).join('/')}, ${Date.now() - t0} ms)`);
}
