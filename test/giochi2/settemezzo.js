// Controlli di Sette e mezzo: valori e matta, carta coperta, sballo, banco a 5 o 6, pagamenti, consiglio,
// centinaia di mani tra computer da 1 a 6 giocatori e forza dei tre livelli (sulle stesse carte).
const assert = require('assert');
const M = require('../../giochi2/settemezzo');
const { conta, mazzo40, MATTA } = M._test;
const { mescola } = require('../../giochi/carte');

const C = (id) => { const m = id.match(/^(\d+)([dcsb])$/); return { id, rango: Number(m[1]), seme: m[2] }; };
const Cs = (s) => s.split(' ').map(C);
const P = (s) => conta(Cs(s)).punti;

// ---- valori ----
{
  assert.strictEqual(mazzo40().length, 40);
  assert.strictEqual(new Set(mazzo40().map((c) => c.id)).size, 40);
  assert.strictEqual(P('3c 4s'), 7);
  assert.strictEqual(P('8c 9s 10b'), 1.5, 'le figure valgono mezzo punto');
  assert.strictEqual(P('7c 8s'), 7.5);
  assert.ok(conta(Cs('7c 8s')).setteMezzo, 'sette e mezzo con due carte');
  assert.ok(!conta(Cs('3c 4s 8b')).setteMezzo && P('3c 4s 8b') === 7.5, 'con tre carte è un sette e mezzo normale');
  assert.ok(conta(Cs('7c 1s')).sballato && P('7c 1s') === 8, 'oltre 7 e mezzo si sballa');
  assert.strictEqual(MATTA, '10d');
  assert.strictEqual(P('10d'), 7, 'la matta da sola vale 7 (il massimo che può valere)');
  assert.ok(conta(Cs('10d 7c')).setteMezzo && P('10d 7c') === 7.5, 'matta + 7: vale mezzo');
  assert.ok(conta(Cs('10d 9c')).setteMezzo, 'matta + figura: la matta vale 7');
  assert.strictEqual(P('10d 5c 8s'), 7.5, 'la matta vale 2');
  assert.strictEqual(P('10d 4c 3s'), 7.5, 'la matta vale mezzo');
  assert.strictEqual(P('10d 4c 2s'), 7, 'la matta vale 1 (meglio di mezzo)');
  assert.ok(conta(Cs('10d 7c 6s')).sballato && P('10d 7c 6s') === 13.5, 'se si sballa la matta vale il minimo');
  assert.strictEqual(P('10c'), 0.5, 'il re degli altri semi vale mezzo');
  console.log('✓ Sette e mezzo: valori (figure mezzo punto), re di denari matta che vale quello che serve, sette e mezzo con due carte, sballo');
}

// ---- svolgimento di una mano ----
const nuova = (n, opzioni = {}) => M.crea({ n, primo: 0, opzioni, fiche: Array(n).fill(1000) });
// mazzo truccato: le carte escono nell'ordine dato (pop dalla fine)
const trucca = (g, ordine) => { const resto = mazzo40().filter((c) => !ordine.includes(c.id)); g.mazzo = [...resto, ...Cs(ordine.join(' ')).reverse()]; };
{
  const g = nuova(2);
  assert.ok(g.azione(0, { tipo: 'carta' }).errore, 'prima si punta');
  assert.ok(g.azione(0, { tipo: 'punta', importo: 0 }).errore && g.azione(0, { tipo: 'punta', importo: 2000 }).errore && g.azione(0, { tipo: 'punta', importo: 1.5 }).errore, 'puntata non valida');
  assert.ok(g.azione(0, null).errore && g.azione(0, { tipo: 'boh' }).errore);
  // ordine delle carte: giocatore 0, giocatore 1, banco, poi le carte chieste
  trucca(g, ['5c', '3s', '4b', '2c', '9d', '7s', '1b', '1c']);
  assert.ok(!g.azione(0, { tipo: 'punta', importo: 100 }).errore && g.fiche[0] === 900);
  assert.ok(!g.azione(1, { tipo: 'punta', importo: 50 }).errore && g.fase === 'turni' && g.turno === 0, 'tutti hanno puntato: si gioca');
  const v1 = g.vista(1);
  assert.strictEqual(v1.mani[0].carte[0], null, 'la carta coperta degli altri non si vede');
  assert.ok(v1.mani[1].carte[0] && v1.mani[1].carte[0].id === '3s', 'la propria sì');
  assert.strictEqual(v1.banco.carte[0], null, 'la carta del banco è coperta');
  assert.ok(!JSON.stringify(v1).includes('"5c"') && !JSON.stringify(v1).includes('"4b"'), 'niente carte coperte nella vista degli altri');
  assert.ok(g.azione(1, { tipo: 'carta' }).errore, 'non è il suo turno');
  assert.ok(!g.azione(0, { tipo: 'carta' }).errore && g.mani[0].carte.length === 2 && g.turno === 0, '5 + 2 = 7, continua');
  assert.ok(!g.azione(0, { tipo: 'stai' }).errore && g.turno === 1);
  assert.ok(!g.azione(1, { tipo: 'carta' }).errore && g.mani[1].carte.length === 2, '3 + mezzo');
  assert.ok(!g.azione(1, { tipo: 'carta' }).errore && g.mani[1].stato === 'sballato' && g.vista(0).mani[1].carte[0].id === '3s', '3 e mezzo + 7: sballa, e la sua carta si scopre');
  assert.ok(g.fase === 'banco' && g.inAttesa, 'tocca al banco');
  g.avanza(); // banco: 4 + 1 = 5
  assert.strictEqual(conta(g.banco).punti, 5);
  g.avanza(); // sta a 5: pagamenti
  assert.strictEqual(g.fase, 'pagamenti');
  assert.ok(g.mani[0].esito === 'vince' && g.fiche[0] === 1100, '7 batte 5: vince alla pari');
  assert.ok(g.mani[1].esito === 'sballato' && g.fiche[1] === 950, 'chi sballa perde anche se il banco non sballa');
  g.avanza();
  assert.ok(g.fase === 'puntate' && g.mazzo.length === 40, 'nuova mano, mazzo rimescolato');
}
{
  // il banco vince le parità; sette e mezzo con due carte paga doppio; il banco a 6 pesca ancora con 5
  const g = nuova(3, { banco: 6 });
  trucca(g, ['7c', '5s', '6b', '1d', '8c', '1s', '2b', '3c']);
  for (let i = 0; i < 3; i++) g.azione(i, { tipo: 'punta', importo: 100 });
  g.azione(0, { tipo: 'carta' }); // 7 + fante: sette e mezzo
  assert.ok(g.mani[0].stato === 'stai' && g.turno === 1, 'a 7 e mezzo ci si ferma da soli');
  g.azione(1, { tipo: 'carta' }); // 5 + 1 = 6
  g.azione(1, { tipo: 'stai' });
  g.azione(2, { tipo: 'stai' }); // 6
  while (g.inAttesa && g.fase === 'banco') g.avanza();
  assert.strictEqual(conta(g.banco).punti, 6, 'banco a 6: con 1 + 2 = 3 pesca ancora, con il 3 arriva a 6');
  assert.strictEqual(g.mani[0].esito, 'settemezzo');
  assert.strictEqual(g.fiche[0], 900 + 300, 'sette e mezzo paga doppio');
  assert.ok(g.mani[1].esito === 'perde' && g.mani[2].esito === 'perde' && g.fiche[1] === 900, 'parità: vince il banco');
}
{
  // il banco sballa: vincono tutti quelli rimasti
  const g = nuova(1);
  trucca(g, ['4c', '3s', '5b']);
  g.azione(0, { tipo: 'punta', importo: 10 });
  g.azione(0, { tipo: 'stai' });
  while (g.inAttesa && g.fase === 'banco') g.avanza();
  assert.ok(conta(g.banco).sballato && g.mani[0].esito === 'vince' && g.fiche[0] === 1010, 'il banco con 3 pesca un 5 e sballa');
  // se sballano tutti il banco non pesca
  const h = nuova(1);
  trucca(h, ['7c', '1s', '7b', '4d']);
  h.azione(0, { tipo: 'punta', importo: 10 });
  h.azione(0, { tipo: 'carta' });
  while (h.inAttesa && h.fase === 'banco') h.avanza();
  assert.ok(h.banco.length === 1 && h.mani[0].esito === 'sballato', 'tutti sballati: il banco non pesca');
  // tempo scaduto: si sta
  const t = nuova(1);
  t.azione(0, { tipo: 'punta', importo: 10 });
  if (t.fase === 'turni') { t.inizioDecisione -= 31000; assert.ok(t.controllaTempo() && t.mani[0].stato === 'stai', 'tempo scaduto: stai'); }
  console.log('✓ Sette e mezzo: puntate, carta coperta segreta, carta o stai, sballo immediato, banco che sta a 5 o a 6, pagamenti alla pari, sette e mezzo doppio, parità al banco, tempo per decidere');
}
{
  // il consiglio: probabilità di sballare calcolata sulle carte non viste
  const g = nuova(1);
  trucca(g, ['6c', '9s', '1b']);
  g.azione(0, { tipo: 'punta', importo: 10 });
  g.azione(0, { tipo: 'carta' }); // 6 + asso = 7 (il cavallo è la carta coperta del banco)
  const c = g.vista(0).consiglio;
  // carte non viste: 40 - 2 = 38 (quella del banco è coperta, quindi conta). Con 7 sballa con qualsiasi carta dall'asso
  // al 7 (28 meno il 6 e l'asso già visti = 26); le figure e la matta no
  assert.strictEqual(c.sballo, Math.round((26 / 38) * 100), `probabilità di sballare (${c.sballo}%)`);
  assert.strictEqual(c.mossa, 'stai', 'con 7 il difficile sta');
  console.log(`✓ Sette e mezzo: consiglio con la probabilità di sballare sulle carte non viste (${c.sballo}% con 7)`);
}

// ---- tante mani tra computer ----
const LIVELLI = ['facile', 'medio', 'difficile'];
for (const n of [1, 2, 3, 4, 5, 6]) {
  const g = M.crea({ n, primo: 0, opzioni: { banco: n % 2 ? 5 : 6 }, fiche: Array(n).fill(1000) });
  let mani = 0, passi = 0;
  while (mani < 150) {
    assert.ok(++passi < 100000, 'bloccato');
    if (g.inAttesa) { if (g.fase === 'pagamenti') mani++; g.avanza(); continue; }
    if (g.fase === 'puntate') {
      const att = g.attesi();
      if (!att.length) { for (let i = 0; i < n; i++) if (g.fiche[i] <= 0) g.ricarica(i, 1000); continue; }
      for (const i of att) assert.ok(!g.azione(i, M.bot(g, i, LIVELLI[i % 3])).errore, 'puntata del computer');
      continue;
    }
    const r = g.azione(g.turno, M.bot(g, g.turno, LIVELLI[g.turno % 3]));
    assert.ok(!r.errore, `mossa del computer rifiutata: ${r.errore}`);
    assert.ok(g.fiche.every((f) => f >= 0), 'fiche mai negative');
  }
}
console.log('✓ Sette e mezzo: 150 mani tra computer per ogni numero di giocatori da 1 a 6, nessuna mossa rifiutata, fiche mai negative');

// ---- forza dei livelli: stesse carte per tutti e tre, resa media per puntata ----
for (const soglia of [5, 6]) {
  const resa = { facile: 0, medio: 0, difficile: 0 };
  const N = 8000;
  for (let k = 0; k < N; k++) {
    const mazzo = mescola(mazzo40());
    for (const l of LIVELLI) {
      const g = M.crea({ n: 1, primo: 0, opzioni: { banco: soglia }, fiche: [1000] });
      g.mazzo = mazzo.slice();
      g.azione(0, { tipo: 'punta', importo: 1 });
      while (g.fase === 'turni') g.azione(0, M.bot(g, 0, l));
      while (g.fase === 'banco') g.avanza();
      resa[l] += g.mani[0].vincita;
    }
  }
  for (const l of LIVELLI) resa[l] = Math.round((resa[l] / N) * 1000) / 10;
  assert.ok(resa.difficile > resa.medio && resa.medio > resa.facile, `banco a ${soglia}: ${JSON.stringify(resa)}`);
  console.log(`✓ Sette e mezzo, banco a ${soglia}: resa media sulle stesse carte facile ${resa.facile}%, medio ${resa.medio}%, difficile ${resa.difficile}%`);
}
