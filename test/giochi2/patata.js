// Controlli di Patata bollente (giochi2/patata.js)
const assert = require('assert');
const { GIOCHI } = require('../../giochi');

const VELOCE = !!process.env.TEST_VELOCE;
const M = GIOCHI.patata;
const { Patata, intervallo, IMMUNITA, MICCE, V, VELOCE: PIU_VELOCE } = M._test;
const LIV = ['facile', 'medio', 'difficile'];
// porta la partita alla fase di gioco
const parti = (g) => { let ora = Date.now(); while (g.fase !== 'gioco') { ora += 33; g.fineFase = Math.min(g.fineFase, ora); g.tick(ora); } return ora; };
// fa avanzare il mondo di "sec" secondi, un passo alla volta (senza i computer)
const avanti = (g, sec) => { for (let k = 0; k < sec / 0.02; k++) { g.tempoRound += 0.02; if (g.passo(0.02)) return true; } return false; };

{
  assert.strictEqual(M.meta.id, 'patata');
  assert.deepStrictEqual(M.meta.giocatori, [3, 4, 5, 6, 7, 8]);
  assert.ok(M.meta.tempoReale && M.meta.pausaBoss && M.meta.regole.length >= 8);
  assert.ok(M.meta.regole.some((r) => /facile/.test(r) && /medio/.test(r) && /difficile/.test(r)), 'le regole spiegano i computer');

  // ---- la patata passa toccando un altro, e non torna subito indietro (1 secondo di immunità) ----
  const g = M.crea({ n: 4, opzioni: { round: 1 }, bot: [null, null, null, null] });
  parti(g);
  g.tempoRound = 1; g.passo(0.02);
  assert.ok(g.bomba, 'all\'inizio del round la patata arriva a qualcuno');
  const e = g.e;
  e[0].x = 300; e[0].y = 120; e[1].x = 330; e[1].y = 120; e[2].x = 800; e[2].y = 120; e[3].x = 800; e[3].y = 520;
  g.bomba.chi = 0; g.bomba.da = null; g.bomba.accesa = g.tempoRound; g.bomba.durata = 99;
  g.passo(0.02);
  assert.strictEqual(g.bomba.chi, 1, 'toccando il giocatore 1 la patata passa a lui');
  assert.strictEqual(g.bomba.da, 0);
  // restano attaccati: per meno di un secondo la patata non torna al giocatore 0
  avanti(g, IMMUNITA * 0.8);
  assert.strictEqual(g.bomba.chi, 1, 'niente ping-pong: chi l\'ha appena data non la riprende subito');
  // ma si può passare subito a un altro
  e[2].x = e[1].x + 20; e[2].y = e[1].y + 20;
  g.passo(0.02);
  assert.strictEqual(g.bomba.chi, 2, 'subito a un terzo invece sì');
  // dopo il secondo di immunità torna a valere anche verso chi l'ha data
  e[0].x = 300; e[0].y = 300; e[1].x = 330; e[1].y = 300; e[2].x = 900; e[2].y = 500; e[3].x = 120; e[3].y = 520;
  g.bomba.chi = 1; g.bomba.da = 0; g.bomba.dal = g.tempoRound - IMMUNITA - 0.01;
  g.passo(0.02);
  assert.strictEqual(g.bomba.chi, 0, 'dopo 1 s si può ridare a chi l\'ha data');

  // ---- chi ha la patata è più veloce ----
  const h = M.crea({ n: 3, opzioni: { round: 1 }, bot: [null, null, null] });
  parti(h);
  h.tempoRound = 1; h.passo(0.02);
  h.bomba.chi = 0; h.bomba.durata = 99;
  h.e[0].x = 150; h.e[0].y = 150; h.e[1].x = 150; h.e[1].y = 470; h.e[2].x = 850; h.e[2].y = 310;
  h.inp[0].x = 1; h.inp[1].x = 1;
  avanti(h, 1);
  const d0 = h.e[0].x - 150, d1 = h.e[1].x - 150;
  assert.ok(Math.abs(d1 - V) < 8 && Math.abs(d0 - V * PIU_VELOCE) < 8, `il portatore corre il 15% in più (${d0.toFixed(0)} contro ${d1.toFixed(0)})`);

  // ---- lo scoppio: chi tiene la patata è eliminato, chi è vicino viene sbalzato, poi riparte da un altro ----
  const s = M.crea({ n: 3, opzioni: { round: 1 }, bot: [null, null, null] });
  parti(s);
  s.tempoRound = 1; s.passo(0.02);
  s.e[0].x = 500; s.e[0].y = 310; s.e[1].x = 560; s.e[1].y = 310; s.e[2].x = 900; s.e[2].y = 500;
  s.bomba.chi = 0; s.bomba.accesa = s.tempoRound; s.bomba.durata = 0.5;
  // la vista non dice quanto manca: solo da quanto è accesa (e lo sfrigolio dell'ultimo istante)
  const st = JSON.stringify(s.statoTick(1));
  assert.ok(!/durata/.test(st) && 'ma' in s.statoTick(1).b, 'il tempo della miccia resta segreto');
  avanti(s, 0.6);
  assert.ok(s.e[0].fuori && s.ordine[0] === 0, 'scoppia in mano al giocatore 0: eliminato');
  assert.strictEqual(s.bomba, null);
  assert.ok(Math.hypot(s.e[1].kx, s.e[1].ky) > 50, 'l\'onda dell\'esplosione sbalza via chi è vicino');
  avanti(s, 2.5);
  assert.ok(s.bomba && s.bomba.chi !== 0 && !s.e[s.bomba.chi].fuori, 'la patata riparte da uno dei rimasti');
  s.bomba.durata = 0; const fine = avanti(s, 3);
  assert.ok(fine && s.vivi().length === 1, 'resta uno solo: il round finisce');
  s.fineRound();
  const vinc = s.vivi()[0], perso = s.ordine[1];
  assert.strictEqual(s.punti[vinc], 2 + 2, 'l\'ultimo rimasto: un punto per ogni eliminato più 2');
  assert.strictEqual(s.punti[0], 0); assert.strictEqual(s.punti[perso], 1, 'il secondo eliminato: un punto');

  // ---- micce e ticchettio ----
  for (const [nome, [a, b]] of Object.entries(MICCE)) {
    const x = M.crea({ n: 3, opzioni: { round: 1, miccia: nome }, bot: [null, null, null] });
    parti(x); x.tempoRound = 1; x.passo(0.02);
    assert.ok(x.bomba.durata >= a && x.bomba.durata <= b, `miccia ${nome} tra ${a} e ${b} secondi`);
  }
  assert.ok(intervallo(0) > intervallo(5) && intervallo(5) > intervallo(15) && intervallo(60) >= 0.11, 'il ticchettio accelera');

  // ---- pausa e input ripulito ----
  const q = M.crea({ n: 3, opzioni: {}, bot: [null, 'medio', 'medio'] });
  const ora = parti(q);
  q.input(0, { x: 7, y: -4, t: 2 });
  assert.ok(Math.hypot(q.inp[0].x, q.inp[0].y) <= 1.0001, 'input limitato');
  q.impostaPausa(true);
  const t0 = q.tempoRound; q.tick(ora + 5000);
  assert.strictEqual(q.tempoRound, t0, 'in pausa il tempo non corre');
  JSON.stringify(q.vista(0));
  console.log('✓ Patata bollente: passaggio per contatto, 1 s di immunità contro il ping-pong, portatore più veloce, miccia segreta (3 durate) con ticchettio che accelera, scoppio con eliminazione e onda, ripartenza, punti, pausa');
}

// ---- partite complete tra computer: per ogni numero di giocatori ----
{
  const quante = VELOCE ? 12 : 150;
  const vitt = { facile: 0, medio: 0, difficile: 0 }, punti = { facile: 0, medio: 0, difficile: 0 };
  let passaggi = 0, partite = 0;
  const t0 = Date.now();
  for (const n of M.meta.giocatori) {
    for (let k = 0; k < quante; k++) {
      const l = Array.from({ length: n }, (_, i) => LIV[(i + k) % 3]);
      const opz = { round: k % 10 === 0 ? 3 : 1, miccia: ['normale', 'corta', 'lunga'][k % 3] };
      const g = M.crea({ n, opzioni: opz, bot: l });
      let ora = Date.now(), passi = 0;
      while (!g.finita) {
        ora += 33; if (g.fase === 'via' || g.fase === 'pausaRound') g.fineFase = Math.min(g.fineFase, ora);
        g.tick(ora);
        assert.ok(++passi < 60000, 'la partita finisce');
        if (g.fase === 'gioco' && g.bomba) assert.ok(!g.e[g.bomba.chi].fuori, 'la patata è sempre in mano a uno in gioco');
      }
      partite++;
      passaggi += g.passaggi.reduce((a, b) => a + b, 0);
      assert.ok(g.risultato && (g.risultato.vincitori.length === 1 || g.risultato.pareggio), 'c\'è un vincitore');
      if (opz.round === 1) assert.strictEqual(g.risultato.vincitori.length, 1, 'con un round c\'è sempre un vincitore');
      assert.strictEqual(g.scoppiTot.reduce((a, b) => a + b, 0), (n - 1) * g.nRound, 'in ogni round scoppiano in n-1');
      JSON.stringify(g.vista(0));
      l.forEach((x, i) => { punti[x] += g.punti[i]; });
      if (g.risultato.vincitori.length) vitt[l[g.risultato.vincitori[0]]]++;
    }
  }
  assert.ok(passaggi > partite * 3, 'i computer si passano la patata');
  if (!VELOCE) {
    assert.ok(vitt.difficile > vitt.medio && vitt.medio > vitt.facile, `il difficile vince di più ${JSON.stringify(vitt)}`);
    assert.ok(punti.difficile > punti.medio && punti.medio > punti.facile, `e fa più punti ${JSON.stringify(punti)}`);
  }
  console.log(`✓ Patata bollente: ${partite} partite tra computer da 3 a 8 giocatori, tutte finite con un vincitore, ${passaggi} passaggi (vittorie f/m/d ${vitt.facile}/${vitt.medio}/${vitt.difficile}, ${Date.now() - t0} ms)`);
}
