// Controlli del Burraco: combinazioni, pozzetto, chiusura, punteggi, copia delle regole nel browser
// e centinaia di partite tra computer in 2 e in 4.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const M = require('../../giochi2/burraco');
const R = require('../../giochi2/burraco-regole');
const { valuta, punti } = R;

const C = (id) => {
  if (id[0] === 'X') return { id, jolly: true, rango: 0, seme: null };
  const m = id.match(/^(\d+)([cqfp])(b?)$/);
  return { id, rango: Number(m[1]), seme: m[2] };
};
const Cs = (s) => s.split(' ').map(C);
const ordine = (v) => v.carte.map((c) => c.id).join(' ');

// ---- combinazioni ----
{
  assert.strictEqual(valuta(Cs('5c 6c 7c')).tipo, 'scala');
  assert.strictEqual(valuta(Cs('5c 6c 8c')), null, 'buco senza matta');
  assert.strictEqual(ordine(valuta(Cs('5c 2f 7c'))), '5c 2f 7c', 'la pinella riempie il buco');
  assert.strictEqual(valuta(Cs('5c 2f 7c')).matta, '2f');
  assert.strictEqual(valuta(Cs('1c 2c 3c')).matta, null, 'pinella al suo posto: carta normale');
  assert.strictEqual(valuta(Cs('2c 3c 4c 5c 6c 7c 8c')).burraco, 'pulito', 'burraco pulito con il 2 naturale');
  assert.strictEqual(valuta(Cs('12c 13c 1c')).tipo, 'scala', 'asso sopra il re');
  assert.strictEqual(valuta(Cs('13c 1c 3c')), null, 'niente giro dal re al 3');
  assert.strictEqual(valuta(Cs('13c 1c 2c')).matta, '2c', 'K-A-2: il 2 fa da matta (donna), niente giro');
  assert.strictEqual(valuta(Cs('1c 2c 3c 4c 5c 6c 7c 8c 9c 10c 11c 12c 13c 1cb')).carte.length, 14, 'da asso ad asso');
  assert.strictEqual(valuta(Cs('5c 6c X1 2q')), null, 'al massimo una matta');
  assert.strictEqual(valuta(Cs('5c X1 X2')), null);
  assert.strictEqual(valuta(Cs('5c 6q 7c')), null, 'scala di un solo seme');
  assert.strictEqual(valuta(Cs('2c 3c 4c 2q')).matta, '2q', 'pinella naturale più una matta');
  assert.strictEqual(valuta(Cs('7c 7c 7q')).tipo, 'gruppo', 'combinazione con semi uguali (due mazzi)');
  assert.strictEqual(valuta(Cs('7c 7q X1')).matta, 'X1');
  assert.strictEqual(valuta(Cs('7c 7q 2p')).matta, '2p');
  assert.strictEqual(valuta(Cs('7c 2q 2p')), null, 'una sola matta nella combinazione');
  assert.strictEqual(valuta(Cs('2c 2q 2p')), null, 'niente combinazioni di soli 2');
  assert.strictEqual(valuta(Cs('7c 7q 7f 7p 7cb 7qb 7fb')).burraco, 'pulito');
  assert.strictEqual(valuta(Cs('7c 7q 7f 7p 7cb 7qb X1')).burraco, 'sporco');
  assert.strictEqual(valuta(Cs('7c 7q')), null, 'almeno 3 carte');
  // attaccare: la matta si sposta in fondo quando arriva la carta vera
  const m = valuta(Cs('5c 6c 2q'));
  assert.strictEqual(m.carte[2].id, '2q');
  const m2 = valuta([...m.carte, C('7c')], 'scala');
  assert.ok(m2 && m2.carte.length === 4 && m2.matta === '2q', 'la matta passa in fondo');
  assert.strictEqual(valuta([...valuta(Cs('7c 7q 7f')).carte, C('8c')], 'gruppo'), null, 'nella combinazione solo lo stesso valore');
  // punti delle carte
  assert.deepStrictEqual(Cs('X1 2c 1c 8c 13c 3c 7c').map(punti), [30, 20, 15, 10, 10, 5, 5]);
  console.log('✓ Burraco: scale e combinazioni, matte (jolly e pinelle), pinella al suo posto, asso basso/alto, burraco pulito/sporco, punti delle carte');
}

// ---- la copia delle regole nel browser dà gli stessi risultati ----
{
  const finestra = { Nuovi: { esc: (s) => String(s), primaVolta: () => false, suono() {} }, Carte: {}, Tavoli: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../public/js/giochi2/burraco.js'), 'utf8'), { window: finestra, Carte: finestra.Carte, localStorage: { getItem: () => null, setItem() {} } });
  const vb = finestra.Tavoli.burraco._valuta;
  const mazzo = require('../../giochi/carte').mazzoDoppio();
  let valide = 0;
  for (let k = 0; k < 6000; k++) {
    const n = 3 + Math.floor(Math.random() * 6);
    // metà delle prove con carte vicine (stesso seme o stesso valore), così escono anche combinazioni valide
    let carte;
    if (k % 2) { const s = 'cqfp'[k % 4], da = 1 + Math.floor(Math.random() * 9); carte = mazzo.filter((c) => c.jolly || c.rango === 2 || (c.seme === s && c.rango >= da && c.rango < da + n + 1)).sort(() => Math.random() - 0.5).slice(0, n); }
    else carte = [...mazzo].sort(() => Math.random() - 0.5).slice(0, n);
    const a = valuta(carte), b = vb(carte);
    assert.strictEqual(JSON.stringify(a && ordine(a)), JSON.stringify(b && b.carte.map((c) => c.id).join(' ')), `stesso risultato per ${carte.map((c) => c.id)}`);
    if (a) valide++;
  }
  assert.ok(valide > 200, `abbastanza combinazioni valide provate (${valide})`);
  console.log(`✓ Burraco: la copia delle regole nel browser dà gli stessi risultati del server (6000 prove, ${valide} valide)`);
}

// ---- regole della partita ----
const nuova = (n = 2, opzioni = {}) => M.crea({ n, primo: 0, opzioni });
const totale = (g) => g.tallone.length + g.scarti.length + g.pozzetti.length * 11 + g.mani.flat().length + g.combinazioni.flat().reduce((s, m) => s + m.carte.length, 0);
{
  const g = nuova(2);
  assert.strictEqual(totale(g), 108, '108 carte');
  assert.ok(g.mani.every((m) => m.length === 11) && g.pozzetti.length === 2 && g.pozzetti.every((p) => p.length === 11) && g.scarti.length === 1, '11 carte a testa, due pozzetti da 11, uno scarto');
  const g4 = nuova(4);
  assert.ok(g4.aSquadre && g4.mani.every((m) => m.length === 11) && g4.tallone.length === 108 - 44 - 22 - 1, 'in 4: a coppie, tallone giusto');
  // la vista non mostra le carte degli altri
  const v = g.vista(0);
  assert.ok(!JSON.stringify(v).includes(JSON.stringify(g.mani[1][0])) || g.mani[1].some((c) => g.mani[0].some((x) => x.id === c.id)), 'niente carte degli altri nella vista');
  assert.ok(v.mano === g.mani[0] && !('pozzettiCarte' in v) && v.carteInMano[1] === 11);
  // turno e pesca
  const t = g.turno;
  assert.ok(g.azione(1 - t, { tipo: 'pesca', da: 'tallone' }).errore, 'non è il suo turno');
  assert.ok(g.azione(t, { tipo: 'scarta', carta: g.mani[t][0].id }).errore, 'prima si pesca');
  assert.ok(g.azione(t, null).errore && g.azione(t, { tipo: 42 }).errore && g.azione(t, { tipo: 'boh' }).errore, 'input non valido');
  const s0 = g.scarti[0];
  assert.ok(!g.azione(t, { tipo: 'pesca', da: 'scarti' }).errore && g.mani[t].includes(s0) && !g.scarti.length && g.mani[t].length === 12, 'si prendono tutti gli scarti');
  assert.ok(g.azione(t, { tipo: 'pesca', da: 'tallone' }).errore, 'si pesca una volta sola');
  assert.ok(g.azione(t, { tipo: 'cala', carte: [g.mani[t][0].id, g.mani[t][0].id, g.mani[t][1].id] }).errore, 'carte ripetute');
  assert.ok(g.azione(t, { tipo: 'cala', carte: ['zz', 'yy', 'xx'] }).errore, 'carte che non ha');
  assert.ok(!g.azione(t, { tipo: 'scarta', carta: g.mani[t][0].id }).errore && g.turno === 1 - t && g.scarti.length === 1, 'scarto e passa il turno');
}

// mano fatta su misura per provare calate, attacchi, pozzetto e chiusura
function prepara(n, mani, { tallone } = {}) {
  const g = nuova(n);
  g.mani = mani.map(Cs);
  if (tallone) g.tallone = Cs(tallone);
  g.turno = 0; g.fase = 'gioca';
  return g;
}
{
  // calare e attaccare; non si attacca agli avversari
  const g = prepara(2, ['5c 6c 7c 8c 9q 9f 9p 3q', '5q 6q 7q 1p 1q']);
  assert.ok(!g.azione(0, { tipo: 'cala', carte: ['5c', '6c', '7c'] }).errore && g.combinazioni[0].length === 1);
  const id = g.combinazioni[0][0].id;
  assert.ok(!g.azione(0, { tipo: 'attacca', combinazione: id, carte: ['8c'] }).errore && g.combinazioni[0][0].carte.length === 4, 'attacco');
  assert.ok(g.azione(0, { tipo: 'attacca', combinazione: id, carte: ['9q'] }).errore, 'carta sbagliata');
  g.combinazioni[1].push({ id: 'avv', squadra: 1, ...valuta(Cs('9c 10c 11c')) });
  g.mani[0].push(C('12c'));
  assert.ok(g.azione(0, { tipo: 'attacca', combinazione: 'avv', carte: ['12c'] }).errore, 'non si attacca alle combinazioni degli avversari');
  // in 4: si attacca alle combinazioni del compagno
  const h = prepara(4, ['8c 3q 4q', '1f 1q 1p', '9c 3f 4f', '13p 13q 13f']);
  h.combinazioni[0].push({ id: 'k', squadra: 0, ...valuta(Cs('5c 6c 7c')) });
  assert.ok(!h.azione(0, { tipo: 'attacca', combinazione: 'k', carte: ['8c'] }).errore, 'attacco alla combinazione della coppia');
}
{
  // pozzetto al volo: chi cala tutte le carte prende il pozzetto e continua
  const g = prepara(2, ['5c 6c 7c', '5q 6q 7q 9p']);
  const pozz = g.pozzetti[g.pozzetti.length - 1];
  assert.ok(!g.azione(0, { tipo: 'cala', carte: ['5c', '6c', '7c'] }).errore);
  assert.ok(g.pozzettoPreso[0] && g.mani[0] === pozz && g.turno === 0 && g.fase === 'gioca' && g.pozzetti.length === 1, 'pozzetto preso al volo, si continua');
  // pozzetto dopo lo scarto: si prende e si gioca dal turno dopo
  const h = prepara(2, ['9c', '5q 6q 7q 9p']);
  assert.ok(!h.azione(0, { tipo: 'scarta', carta: '9c' }).errore && h.pozzettoPreso[0] && h.mani[0].length === 11 && h.turno === 1, 'scarta l\'ultima e prende il pozzetto');
  // con il pozzetto preso: bisogna tenere una carta da scartare, e una sola solo con un burraco
  const k = prepara(2, ['5c 6c 7c 9q', '5q 6q 7q 9p']);
  k.pozzettoPreso[0] = true; k.pozzetti.pop();
  assert.ok(/burraco/.test(k.azione(0, { tipo: 'cala', carte: ['5c', '6c', '7c'] }).errore || ''), 'senza burraco non si resta con una carta');
  const k2 = prepara(2, ['5c 6c 7c', '5q 6q 7q 9p']);
  k2.pozzettoPreso[0] = true; k2.pozzetti.pop();
  assert.ok(/scartare/.test(k2.azione(0, { tipo: 'cala', carte: ['5c', '6c', '7c'] }).errore || ''), 'non si cala l\'ultima carta col pozzetto preso');
  // chiusura: serve un burraco
  const z = prepara(2, ['9q 4c', '5q 6q 7q 9p 1p']);
  z.pozzettoPreso[0] = true; z.pozzetti.pop();
  assert.ok(!z.azione(0, { tipo: 'scarta', carta: '4c' }).errore, 'scarto normale');
  z.turno = 0; z.fase = 'gioca';
  assert.ok(/burraco/.test(z.azione(0, { tipo: 'scarta', carta: '9q' }).errore || ''), 'senza burraco non si chiude');
  z.combinazioni[0].push({ id: 'b', squadra: 0, ...valuta(Cs('3c 4c 5c 6c 7c 8c 9c')) }); // burraco pulito: 7 carte (5 da 5 e 2 da 10)
  z.combinazioni[1].push({ id: 'c', squadra: 1, ...valuta(Cs('10f 11f 12f 2c')) });
  const prima = [...z.totali];
  assert.ok(!z.azione(0, { tipo: 'scarta', carta: '9q' }).errore && z.fase === 'riepilogo', 'chiusura');
  const r = z.riepilogo.righe;
  assert.strictEqual(r[0].chiusura, 100);
  assert.strictEqual(r[0].burraco, 200);
  assert.strictEqual(r[0].tavolo, 5 * 5 + 2 * 10);
  assert.strictEqual(r[0].smazzata, 45 + 200 + 100);
  assert.strictEqual(r[1].tavolo, 10 + 10 + 10 + 20, 'la pinella in tavola vale 20');
  assert.strictEqual(r[1].mano, -(5 + 5 + 5 + 10 + 15), 'carte in mano sottratte');
  assert.strictEqual(r[1].pozzetto, -100, 'pozzetto non preso: -100');
  assert.strictEqual(z.totali[1], prima[1] + 50 - 40 - 100);
  // partita a una sola smazzata: finisce subito
  const u = M.crea({ n: 2, primo: 0, opzioni: { obiettivo: 1 } });
  u.mani = [Cs('4c'), Cs('9p')]; u.turno = 0; u.fase = 'gioca'; u.pozzettoPreso[0] = true; u.pozzetti.pop();
  u.combinazioni[0].push({ id: 'b', squadra: 0, ...valuta(Cs('3c 4c 5c 6c 7c 8c X1')) });
  u.azione(0, { tipo: 'scarta', carta: '4c' });
  assert.ok(u.finita && u.risultato.vincitori.join() === '0' && u.risultato.fazioni[0].punti === 30 + 25 + 10 + 100 + 100, 'una sola smazzata: vince chi ha più punti');
  // tallone finito: la smazzata si chiude senza i 100 della chiusura
  const w = prepara(2, ['9q 4c 8f', '5q 6q 7q 9p 1p'], { tallone: '13c' });
  w.fase = 'pesca';
  w.azione(0, { tipo: 'pesca', da: 'tallone' });
  w.azione(0, { tipo: 'scarta', carta: '4c' });
  assert.ok(w.fase === 'riepilogo' && w.riepilogo.tallone && w.riepilogo.righe.every((x) => x.chiusura === 0), 'tallone finito: smazzata chiusa');
  assert.ok(w.inAttesa && !w.finita, 'si aspetta "Continua"');
  w.avanza();
  assert.ok(w.fase === 'pesca' && w.mani.every((m) => m.length === 11) && w.nSmazzata === 1, 'nuova smazzata');
  console.log('✓ Burraco: pesca o scarti tutti, calare e attaccare (solo alla propria squadra, in 4 alla coppia), pozzetto al volo e dopo lo scarto, carta da tenere, chiusura solo con burraco, punteggi, tallone finito');
}

// ---- partite tra computer ----
const LIVELLI = ['facile', 'medio', 'difficile'];
function partita(n, livelli, obiettivo, controlli = true) {
  const g = M.crea({ n, primo: Math.floor(Math.random() * n), opzioni: { obiettivo } });
  let passi = 0, errori = 0;
  while (!g.finita) {
    assert.ok(++passi < 200000, 'la partita deve finire');
    if (g.inAttesa) { g.avanza(); continue; }
    const p = g.turno;
    const r = g.azione(p, M.bot(g, p, livelli[p]));
    if (r.errore) { errori++; g.sblocca(p); }
    if (controlli && g.fase !== 'riepilogo') {
      assert.strictEqual(totale(g), 108, 'nessuna carta sparisce');
      for (const m of g.combinazioni.flat()) assert.ok(valuta(m.carte, m.tipo), 'combinazione valida in tavola');
    }
  }
  return { g, errori };
}
for (const n of [2, 4]) {
  let errori = 0, smazzate = 0;
  const t0 = Date.now();
  for (let k = 0; k < 300; k++) {
    const liv = Array.from({ length: n }, (_, i) => LIVELLI[(k + i * (1 + (k % 2))) % 3]);
    const r = partita(n, liv, k % 10 === 0 ? 2005 : k % 3 === 0 ? 1005 : 1, true);
    errori += r.errori; smazzate += r.g.nSmazzata;
    assert.ok(r.g.risultato && r.g.risultato.fazioni.length === 2);
  }
  assert.strictEqual(errori, 0, 'i computer non fanno mai mosse rifiutate');
  // forza dei livelli: in 2 partite intere a 1005 punti; in 4 (dove conta anche il compagno) i punti fatti in
  // tante smazzate, una coppia di livelli contro l'altra
  const vinte = {};
  for (const [a, b] of [['difficile', 'medio'], ['medio', 'facile']]) {
    const k2 = `${a}-${b}`;
    vinte[k2] = [0, 0];
    for (let k = 0; k < (n === 2 ? 80 : 500); k++) {
      const liv = Array.from({ length: n }, (_, i) => ((i + k) % 2 ? b : a));
      const { g } = partita(n, liv, n === 2 ? 1005 : 1, false);
      const ta = liv[0] === a ? 0 : 1;
      if (n === 4) { vinte[k2][0] += g.totali[ta]; vinte[k2][1] += g.totali[1 - ta]; }
      else if (!g.risultato.pareggio) vinte[k2][liv[g.risultato.vincitori[0]] === a ? 0 : 1]++;
    }
    assert.ok(vinte[k2][0] > vinte[k2][1], `${a} più forte di ${b} in ${n}: ${vinte[k2]}`);
    if (n === 4) vinte[k2] = vinte[k2].map((x) => `${Math.round(x / 500)} punti a smazzata`);
  }
  console.log(`✓ Burraco in ${n}: 300 partite tra computer (${smazzate} smazzate) senza mosse rifiutate, carte sempre 108, tutte finite; ${n === 2 ? 'partite a 1005 vinte' : 'media'} difficile-medio ${vinte['difficile-medio'].join(' / ')}, medio-facile ${vinte['medio-facile'].join(' / ')} (${Date.now() - t0} ms)`);
}
