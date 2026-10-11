// Controlli del Gioco del calamaro (giochi2/calamaro.js)
const assert = require('assert');
const { GIOCHI } = require('../../giochi');

const VELOCE = !!process.env.TEST_VELOCE;
const M = GIOCHI.calamaro;
const { dentro, inVita, CASA, VITA, Q, TESTA, PORTATA } = M._test;
const LIV = ['facile', 'medio', 'difficile'];
const parti = (g) => { let ora = Date.now(); while (g.fase !== 'gioco') { ora += 33; g.fineFase = Math.min(g.fineFase, ora); g.tick(ora); } return ora; };
const avanti = (g, sec) => { for (let k = 0; k < sec / 0.02; k++) { g.tempoRound += 0.02; if (g.passo(0.02)) return true; } return false; };
const metti = (e, x, y) => { e.x = x; e.y = y; e.kx = 0; e.ky = 0; };

{
  assert.strictEqual(M.meta.id, 'calamaro');
  assert.deepStrictEqual(M.meta.giocatori, [2, 3, 4, 5, 6, 7, 8]);
  assert.ok(M.meta.tempoReale && M.meta.pausaBoss && M.meta.regole.length >= 8);

  // ---- il disegno ----
  assert.ok(dentro(CASA.x, CASA.y) && dentro(250, 310) && dentro(450, 310) && dentro(600, 310) && dentro(TESTA.x, TESTA.y - 120), 'casa, corpo, vita, triangolo e testa sono dentro');
  assert.ok(!dentro(60, 310) && !dentro(450, 200) && !dentro(450, 420) && !dentro(950, 60) && !dentro(600, 140), 'partenza e cortile sono fuori');
  assert.ok(inVita(450, 310) && !inVita(450, 250));

  // ---- squadre fisse che si alternano ----
  const g = M.crea({ n: 4, opzioni: { round: 4 }, bot: [null, null, null, null] });
  assert.deepStrictEqual(g.squadra, [0, 1, 0, 1]);
  parti(g);
  assert.ok(g.e[0].att && g.e[2].att && !g.e[1].att && !g.e[3].att, 'round 1: attacca la squadra rossa (posti 1 e 3)');
  assert.ok(g.e[0].zoppo && !dentro(g.e[0].x, g.e[0].y), 'gli attaccanti partono fuori dal disegno, a zoppo');
  assert.ok(g.e.filter((e) => !e.att).every((e) => dentro(e.x, e.y)), 'i difensori dentro');

  // ---- a zoppo: lenti, e nel disegno si entra solo dalla vita ----
  const a = g.e[0];
  for (const e of g.e) metti(e, 950, 60 + e.id * 10); // gli altri lontano
  for (const e of [g.e[1], g.e[3]]) metti(e, CASA.x, CASA.y - 60 + e.id * 30);
  metti(a, 50, 310); g.inp[0].x = 1; g.inp[0].y = 0;
  avanti(g, 0.5);
  assert.ok(Math.abs(a.x - 50 - 50) < 3, `a zoppo si va alla metà della velocità (${a.x})`);
  avanti(g, 3);
  assert.ok(a.zoppo && a.x < Q.x0 && !a.fuori, 'il corpo del calamaro è chiuso: a zoppo non si entra');
  metti(a, 450, 220); g.inp[0].x = 0; g.inp[0].y = 1;
  avanti(g, 0.6);
  assert.ok(!a.zoppo && inVita(a.x, a.y), 'dalla linea della vita si entra e da lì si corre');
  const y0 = a.y; avanti(g, 0.2);
  assert.ok(a.y - y0 > 30, 'superata la vita si corre');
  // camminando non si esce dal disegno
  metti(a, 600, 310); g.inp[0].x = 0; g.inp[0].y = -1;
  avanti(g, 2);
  assert.ok(!a.fuori && dentro(a.x, a.y), 'camminando contro la linea non si esce');
  // un difensore spinto fuori è eliminato e i punti vanno a chi spinge
  const d = g.e[1];
  metti(a, 600, 230); metti(d, 600, 196); g.inp[0].y = 0; g.inp[1].x = 0; g.inp[1].y = 0;
  assert.ok(dentro(d.x, d.y));
  a.carica = 0; g.inp[0].tocchi++;
  avanti(g, 0.6);
  assert.ok(d.fuori && g.punti[0] === 2 && g.eliminati[0] === 1, 'il difensore spinto fuori dal disegno è eliminato: 2 punti a chi spinge');
  assert.ok(a.carica > 0, 'dopo la spinta bisogna ricaricare');
  // spinte a vuoto e con la spinta scarica non succede niente
  const prima = g.inp[0].tocchi; g.inp[0].tocchi++; avanti(g, 0.04);
  assert.ok(g.inp[0].tocchi === prima + 1 && g.e[3].kx === 0, 'la spinta tocca solo chi è a portata');
  // chi è a zoppo e viene spinto cade a terra un attimo, ma non è eliminato
  const z = g.e[2];
  metti(z, 450, 240); z.zoppo = true; metti(g.e[3], 450, 285); g.e[3].carica = 0; g.inp[3].tocchi++;
  avanti(g, 0.1);
  assert.ok(!z.fuori && z.zoppo && z.terra > g.tempoRound, 'a zoppo una spinta fa cadere a terra');
  assert.ok(!dentro(z.x, z.y) || inVita(z.x, z.y), 'e non butta dentro il disegno');
  // la casa: 5 punti, e il round finisce quando non ci sono più attaccanti in gioco
  metti(a, CASA.x - 60, CASA.y); g.inp[0].x = 1;
  avanti(g, 0.5);
  assert.ok(a.casa && g.punti[0] === 2 + 5 && g.case[0] === 1, 'chi tocca la casa prende 5 punti');
  z.fuori = true; z.el = g.tempoRound;
  assert.ok(avanti(g, 2), 'nessun attaccante in gioco: il round finisce');
  g.fineRound();
  assert.strictEqual(g.punti[3], 1, 'il difensore rimasto prende 1 punto (la casa è stata toccata)');
  // round 2: si scambiano i ruoli
  let ora = Date.now();
  g.fase = 'pausaRound'; g.fineFase = ora; g.tick(ora + 1);
  assert.ok(g.round === 2 && !g.e[0].att && g.e[1].att && g.e[3].att, 'round 2: attacca la squadra blu');
  // round senza casa toccata: i difensori rimasti prendono 3 punti
  const h = M.crea({ n: 2, opzioni: { round: 1, tempo: 45 }, bot: [null, null] });
  parti(h); assert.strictEqual(h.durata, 45);
  const fine = avanti(h, 46);
  assert.ok(fine, 'allo scadere del tempo il round finisce');
  h.fineRound(); assert.strictEqual(h.punti[1], 3, 'difesa perfetta: 1 + 2 punti');
  JSON.stringify(h.vista(0));
  // pausa
  const p = M.crea({ n: 3, opzioni: {}, bot: [null, 'medio', 'medio'] });
  ora = parti(p); p.impostaPausa(true); const t0 = p.tempoRound; p.tick(ora + 4000);
  assert.strictEqual(p.tempoRound, t0, 'in pausa il round si ferma');
  assert.ok(PORTATA > 30);
  console.log('✓ Il gioco del calamaro: disegno (corpo, vita, triangolo, testa), squadre fisse che si scambiano i ruoli, a zoppo lenti e si entra solo dalla vita, si corre dopo, non si esce camminando, spinta che elimina chi finisce fuori (+2), caduta a zoppo, casa (+5), difesa (+1, +2 se nessuno arriva), tempo, pausa');
}

// ---- partite complete tra computer ----
{
  const quante = VELOCE ? 8 : 120;
  const vitt = { facile: 0, medio: 0, difficile: 0 }, punti = { facile: 0, medio: 0, difficile: 0 };
  let partite = 0, case_ = 0, elim = 0, spinte = 0;
  const t0 = Date.now();
  for (const n of M.meta.giocatori) {
    for (let k = 0; k < quante; k++) {
      const l = Array.from({ length: n }, (_, i) => LIV[(i + k) % 3]);
      const opz = { round: k % 12 === 0 ? 4 : k % 2 ? 2 : 1, tempo: [60, 45, 90][k % 3] };
      const g = M.crea({ n, opzioni: opz, bot: l });
      let ora = Date.now(), passi = 0;
      while (!g.finita) {
        ora += 33; if (g.fase === 'via' || g.fase === 'pausaRound') g.fineFase = Math.min(g.fineFase, ora);
        g.tick(ora);
        if (g.fase === 'gioco') {
          spinte += g.spinte.length;
          for (const e of g.e) if (!e.fuori && !e.casa) assert.ok(e.zoppo ? !dentro(e.x, e.y) || inVita(e.x, e.y) : dentro(e.x, e.y), 'nessuno sta dove non può');
        }
        assert.ok(++passi < 80000, 'la partita finisce');
      }
      partite++;
      case_ += g.case.reduce((x, y) => x + y, 0); elim += g.eliminati.reduce((x, y) => x + y, 0);
      assert.ok(g.risultato && (g.risultato.vincitori.length === 1 || g.risultato.pareggio));
      JSON.stringify(g.vista(0));
      l.forEach((x, i) => { punti[x] += g.punti[i]; });
      if (g.risultato.vincitori.length) vitt[l[g.risultato.vincitori[0]]]++;
    }
  }
  assert.ok(case_ > partite * 0.5 && elim > partite * 0.5 && spinte > partite * 5, `i computer attaccano, spingono ed eliminano (case ${case_}, eliminazioni ${elim})`);
  if (!VELOCE) {
    assert.ok(vitt.difficile > vitt.medio && vitt.medio > vitt.facile, `il difficile vince di più ${JSON.stringify(vitt)}`);
    assert.ok(punti.difficile > punti.medio && punti.medio > punti.facile, `e fa più punti ${JSON.stringify(punti)}`);
  }
  // uno contro uno: il difficile batte il medio, che batte il facile
  const sfida = (a, b, k) => { let v = 0; for (let i = 0; i < k; i++) { const l = i % 2 ? [a, b] : [b, a]; const g = M.crea({ n: 2, opzioni: { round: 2 }, bot: l }); let ora = Date.now(); while (!g.finita) { ora += 33; if (g.fase !== 'gioco') g.fineFase = Math.min(g.fineFase, ora); g.tick(ora); } if (g.risultato.vincitori.length && l[g.risultato.vincitori[0]] === a) v++; } return v; };
  const K = VELOCE ? 6 : 80;
  const dm = sfida('difficile', 'medio', K), mf = sfida('medio', 'facile', K);
  if (!VELOCE) assert.ok(dm > K * 0.58 && mf > K * 0.55, `uno contro uno: difficile-medio ${dm}/${K}, medio-facile ${mf}/${K}`);
  console.log(`✓ Il gioco del calamaro: ${partite} partite tra computer da 2 a 8 giocatori, tutte finite (case toccate ${case_}, eliminazioni ${elim}); vittorie f/m/d ${vitt.facile}/${vitt.medio}/${vitt.difficile}; uno contro uno difficile-medio ${dm}/${K}, medio-facile ${mf}/${K} (${Date.now() - t0} ms)`);
}
