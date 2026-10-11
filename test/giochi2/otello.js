// Reversi: regole (cattura in 8 direzioni, passo, fine partita), annulla mossa e partite tra computer
const assert = require('assert');
process.env.TEST_VELOCE = process.env.TEST_VELOCE || '1';
const M = require('../../giochi2/otello');
const { girate, mossePossibili, classifica, iniziale } = M._test;
const VELOCE = !!process.env.TEST_VELOCE;

// ---- posizione iniziale: 4 mosse possibili per il nero, ognuna gira una pedina ----
{
  const g = M.crea({ n: 2, primo: 0, opzioni: {}, bot: [null, null] });
  const v = g.vista(0);
  assert.deepStrictEqual(v.conteggio, [2, 2]);
  assert.deepStrictEqual([...v.mosse].sort((a, b) => a - b), [19, 26, 37, 44], 'mosse iniziali del nero: d3, c4, f5, e6');
  assert.strictEqual(v.colori[0], 'nero');
  assert.ok(g.azione(1, { tipo: 'metti', cella: 19 }).errore, 'non è il suo turno');
  assert.ok(g.azione(0, { tipo: 'metti', cella: 0 }).errore, 'angolo: non gira niente');
  assert.ok(g.azione(0, { tipo: 'metti', cella: 27 }).errore, 'casella occupata');
  assert.ok(g.azione(0, { tipo: 'metti', cella: 'x' }).errore, 'input non valido');
  assert.ok(g.azione(0, null).errore);
  assert.ok(g.azione(0, { tipo: 'metti', cella: 19 }).ok);
  assert.deepStrictEqual(g.vista(0).conteggio, [4, 1], 'd3 gira d4');
  assert.deepStrictEqual(g.girate, [27]);
  assert.strictEqual(g.turno, 1);
}

// ---- cattura in più direzioni insieme ----
{
  const c = new Array(64).fill(null);
  // il bianco (1) è chiuso in tre direzioni attorno alla casella 27 (d4)
  c[28] = 1; c[29] = 0;      // a destra
  c[35] = 1; c[43] = 0;      // in basso
  c[36] = 1; c[45] = 0;      // in diagonale
  c[19] = 1;                 // in alto: nessuna pedina nera dopo, non si gira
  const g = girate(c, 27, 0).sort((a, b) => a - b);
  assert.deepStrictEqual(g, [28, 35, 36], 'si gira in tutte le direzioni chiuse, non nelle altre');
  // una fila lunga
  const d = new Array(64).fill(null);
  for (let k = 1; k <= 6; k++) d[k] = 1;
  d[7] = 0;
  assert.strictEqual(girate(d, 0, 0).length, 6, 'gira tutta la fila');
  d[7] = null;
  assert.strictEqual(girate(d, 0, 0).length, 0, 'senza la pedina in fondo non gira niente');
}

// ---- passo e fine partita ----
{
  const g = M.crea({ n: 2, primo: 0, opzioni: {}, bot: [null, null] });
  // nero in a1, bianco in b1 e a2: il nero mette in c1 e gira b1; il bianco non ha mosse e passa
  const c = new Array(64).fill(null);
  c[0] = 0; c[1] = 1; c[8] = 1;
  g.celle = c; g.turno = 0;
  assert.ok(g.azione(0, { tipo: 'metti', cella: 2 }).ok);
  assert.ok(!g.finita && g.turno === 0 && g.passato === 1, 'il bianco passa: tocca ancora al nero');
  assert.deepStrictEqual(g.vista(1).mosse, [16]);
  // il nero mette in a3 e gira a2: il bianco non ha più pedine, nessuno può muovere → fine
  assert.ok(g.azione(0, { tipo: 'metti', cella: 16 }).ok);
  assert.ok(g.finita && g.risultato.vincitori[0] === 0, 'partita finita');
  assert.strictEqual(g.risultato.fazioni[0].punti, 64, 'le caselle vuote vanno a chi vince');
  assert.strictEqual(g.risultato.fazioni[1].punti, 0);
}

// ---- annulla contro il computer ----
{
  const g = M.crea({ n: 2, primo: 0, opzioni: {}, bot: [null, 'medio'] });
  assert.ok(g.azione(0, { tipo: 'annulla' }).errore, 'niente da annullare');
  g.azione(0, { tipo: 'metti', cella: 19 });
  g.azione(1, M.bot(g, 1, 'medio'));
  assert.ok(g.vista(0).puoAnnullare);
  assert.ok(g.azione(0, { tipo: 'annulla' }).ok);
  assert.deepStrictEqual(g.celle, iniziale().map((x) => (x === null ? null : x)), 'si torna alla posizione iniziale');
  assert.strictEqual(g.turno, 0);
  const h = M.crea({ n: 2, primo: 0, opzioni: {}, bot: [null, null] });
  h.azione(0, { tipo: 'metti', cella: 19 });
  assert.ok(h.azione(0, { tipo: 'annulla' }).errore, 'tra persone non si annulla');
}

// ---- il difficile è veloce e vede la fine ----
{
  const g = M.crea({ n: 2, primo: 0, opzioni: {}, bot: [null, null] });
  const t0 = Date.now();
  delete process.env.TEST_VELOCE;
  const lista = classifica(g.celle, 0, 6, 220);
  const ms = Date.now() - t0;
  if (VELOCE) process.env.TEST_VELOCE = '1';
  assert.ok(ms < 300, `il difficile pensa al massimo 300 ms (${ms} ms)`);
  assert.ok(lista.length === 4 && classifica.prof >= 4, `profondità raggiunta ${classifica.prof}`);
  // angolo disponibile: lo prende
  const c = new Array(64).fill(null);
  c[9] = 1; c[18] = 0; c[27] = 0; c[28] = 1; c[36] = 0; c[20] = 1;
  const b = classifica(c, 0, 4, 100);
  assert.strictEqual(b[0].i, 0, 'prende l\'angolo');
}

// ---- partite complete tra computer ----
{
  const LIV = ['facile', 'medio', 'difficile'];
  const N = 210;
  const vittorie = { facile: 0, medio: 0, difficile: 0 };
  const sfide = { 'difficile-medio': [0, 0], 'medio-facile': [0, 0] };
  let errori = 0;
  const t0 = Date.now();
  for (let k = 0; k < N; k++) {
    const liv = [LIV[k % 3], LIV[(k + 1 + Math.floor(k / 3)) % 3]];
    const g = M.crea({ n: 2, primo: k % 2, opzioni: {}, bot: liv });
    let passi = 0;
    while (!g.finita) {
      assert.ok(++passi < 200, 'la partita finisce');
      const t = g.turno;
      assert.ok(mossePossibili(g.celle, t).length > 0, 'chi è di turno può muovere');
      const prima = g.celle.filter((x) => x !== null).length;
      const r = g.azione(t, M.bot(g, t, liv[t]));
      if (r.errore) { errori++; break; }
      assert.strictEqual(g.celle.filter((x) => x !== null).length, prima + 1, 'una pedina in più a ogni mossa');
    }
    if (!g.finita) continue;
    const f = g.risultato.fazioni;
    assert.ok(f[0].punti + f[1].punti <= 64);
    assert.ok(!mossePossibili(g.celle, 0).length && !mossePossibili(g.celle, 1).length, 'a fine partita nessuno può muovere');
    for (const v of g.risultato.vincitori) vittorie[liv[v]]++;
    const chiave = `${liv[0]}-${liv[1]}`, rov = `${liv[1]}-${liv[0]}`;
    if (sfide[chiave]) { if (g.risultato.vincitori[0] === 0) sfide[chiave][0]++; else if (g.risultato.vincitori[0] === 1) sfide[chiave][1]++; }
    if (sfide[rov]) { if (g.risultato.vincitori[0] === 1) sfide[rov][0]++; else if (g.risultato.vincitori[0] === 0) sfide[rov][1]++; }
  }
  assert.strictEqual(errori, 0, 'i computer non fanno mai mosse rifiutate');
  const [dv, mv] = sfide['difficile-medio'], [m2, f2] = sfide['medio-facile'];
  assert.ok(dv > mv, `il difficile batte il medio (${dv}-${mv})`);
  assert.ok(m2 > f2, `il medio batte il facile (${m2}-${f2})`);
  console.log(`✓ Reversi: cattura in 8 direzioni, passo, fine partita, annulla mossa, ${N} partite tra computer (difficile-medio ${dv}-${mv}, medio-facile ${m2}-${f2}, ${Date.now() - t0} ms)`);
}
