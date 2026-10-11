// Controlli di Biglie (pari o dispari) (giochi2/biglie.js)
const assert = require('assert');
const { GIOCHI } = require('../../giochi');

const VELOCE = !!process.env.TEST_VELOCE;
const M = GIOCHI.biglie;
const { stimaPari, tabella } = M._test;

// gioca una partita: ogni posto è un livello del computer oppure una funzione (una "persona" finta)
function partita(a, b, opzioni = {}, primo = 0, controlla = null) {
  const g = M.crea({ n: 2, primo, opzioni });
  const chi = [a, b];
  let passi = 0;
  while (!g.finita) {
    assert.ok(++passi < 5000, 'la partita finisce');
    if (g.inAttesa) { g.avanza(); continue; }
    const t = g.turno;
    const az = typeof chi[t] === 'function' ? chi[t](g, t) : M.bot(g, t, chi[t]);
    const prima = g.biglie.slice();
    const r = g.azione(t, az);
    assert.ok(r.ok, `mossa rifiutata (${chi[t]}): ${r.errore} ${JSON.stringify(az)}`);
    assert.strictEqual(g.biglie[0] + g.biglie[1], prima[0] + prima[1], 'le biglie non si creano e non spariscono');
    if (controlla) controlla(g, t, az, prima);
  }
  return g;
}

{
  assert.strictEqual(M.meta.id, 'biglie');
  assert.deepStrictEqual(M.meta.giocatori, [2]);
  assert.ok(M.meta.regole.length >= 7 && M.meta.regole.some((r) => /facile/.test(r) && /difficile/.test(r)));

  // ---- una mano: nasconde, scommette, si apre ----
  const g = M.crea({ n: 2, primo: 0, opzioni: {} });
  assert.deepStrictEqual(g.biglie, [10, 10]);
  assert.strictEqual(g.turno, 0, 'comincia a nascondere il primo');
  assert.ok(g.azione(1, { tipo: 'nascondi', quante: 3 }).errore, 'non è il suo turno');
  assert.ok(g.azione(0, { tipo: 'scommetti', punta: 2, pari: true }).errore, 'prima si nasconde');
  for (const q of [0, 11, 2.5, '3x', null, -1]) assert.ok(g.azione(0, { tipo: 'nascondi', quante: q }).errore, `nascondere ${q} non vale`);
  assert.ok(g.azione(0, null).errore && g.azione(0, { tipo: 'boh' }).errore);
  assert.ok(g.azione(0, { tipo: 'nascondi', quante: 3 }).ok);
  assert.strictEqual(g.vista(1).inPugno, null, 'chi scommette non vede quante sono');
  assert.strictEqual(g.vista(0).inPugno, 3, 'chi le ha nascoste sì');
  assert.ok(!JSON.stringify(g.vista(1)).includes('"inPugno":3'));
  assert.strictEqual(g.turno, 1);
  assert.ok(g.azione(1, { tipo: 'scommetti', punta: 11, pari: true }).errore, 'non si scommettono più biglie di quelle che si hanno');
  assert.ok(g.azione(1, { tipo: 'scommetti', punta: 2, pari: 'pari' }).errore, 'pari o dispari: sì o no');
  assert.ok(g.azione(1, { tipo: 'scommetti', punta: 4, pari: false }).ok);
  assert.deepStrictEqual(g.biglie, [6, 14], '3 è dispari: indovinato, prende le 4 scommesse');
  assert.ok(g.inAttesa && g.vista(0).inPugno === 3 && g.vista(1).inPugno === 3, 'la mano aperta la vedono tutti');
  assert.ok(g.azione(0, { tipo: 'nascondi', quante: 1 }).errore, 'durante la pausa non si gioca');
  g.avanza();
  assert.ok(g.nasconde === 1 && g.turno === 1 && g.fase === 'nascondi', 'poi i ruoli si scambiano');
  // sbaglia: dà all'altro le biglie scommesse
  g.azione(1, { tipo: 'nascondi', quante: 14 });
  g.azione(0, { tipo: 'scommetti', punta: 5, pari: false });
  assert.deepStrictEqual(g.biglie, [1, 19], '14 è pari: sbagliato, dà le 5 scommesse');
  g.avanza();
  // con una biglia sola si può nascondere solo quella (dispari per forza)
  assert.ok(g.azione(0, { tipo: 'nascondi', quante: 2 }).errore, 'con una biglia se ne nasconde una');
  g.azione(0, { tipo: 'nascondi', quante: 1 });
  const sicuro = M.bot(g, 1, 'medio');
  assert.ok(sicuro.pari === false && M.bot(g, 1, 'difficile').pari === false, 'il computer sa che una biglia sola è dispari');
  // se indovina prende al massimo quelle che l'altro ha
  g.azione(1, { tipo: 'scommetti', punta: 10, pari: false });
  assert.deepStrictEqual(g.biglie, [0, 20], 'si prende al massimo quello che l\'altro ha');
  g.avanza();
  assert.ok(g.finita && g.risultato.vincitori[0] === 1 && g.risultato.fazioni[1].punti === 20, 'chi prende tutte le biglie vince');
  assert.ok(g.azione(0, { tipo: 'nascondi', quante: 1 }).errore, 'a partita finita non si gioca');

  // ---- con il limite di mani vince chi ne ha di più; a pari biglie è pareggio ----
  const l = M.crea({ n: 2, primo: 0, opzioni: { mani: 10, biglie: 20 } });
  assert.deepStrictEqual(l.biglie, [20, 20]);
  for (let k = 0; k < 10; k++) {
    const h = l.turno; l.azione(h, { tipo: 'nascondi', quante: 2 });
    l.azione(1 - h, { tipo: 'scommetti', punta: 1, pari: true }); // chi scommette indovina sempre: una a testa
    l.avanza();
  }
  assert.ok(l.finita && l.mano === 10 && l.risultato.pareggio && l.risultato.vincitori.length === 0, 'dopo 10 mani con le stesse biglie: pareggio');
  const l2 = M.crea({ n: 2, primo: 1, opzioni: { mani: 10 } });
  for (let k = 0; k < 10; k++) { const h = l2.turno; l2.azione(h, { tipo: 'nascondi', quante: 2 }); l2.azione(1 - h, { tipo: 'scommetti', punta: 1, pari: k >= 5 || h === 1 }); l2.avanza(); } // nelle prime 5 mani il posto 0 ne guadagna una a mano
  assert.ok(l2.finita && l2.mano === 10 && l2.biglie[0] === 14 && l2.risultato.vincitori[0] === 0, 'dopo 10 mani vince chi ne ha di più');
  console.log('✓ Biglie: nascondere e scommettere, mano segreta, vincite e perdite (al massimo quelle dell\'avversario), ruoli che si scambiano, biglia sola = dispari, fine con tutte le biglie o dopo 10/20 mani, pareggio');
}

// ---- il computer difficile: stima e calcolo ----
{
  // chi nasconde sempre pari viene scoperto
  const storia = Array.from({ length: 6 }, () => ({ nasconde: 0, quante: 4, aveva: 10 }));
  assert.ok(stimaPari(storia, 0, 10).p > 0.7, 'chi nasconde sempre pari');
  const alterna = Array.from({ length: 6 }, (_, k) => ({ nasconde: 0, quante: k % 2 ? 3 : 2, aveva: 10 }));
  assert.ok(stimaPari(alterna, 0, 10).p > 0.6, 'chi alterna: dopo un dispari viene un pari');
  // la tabella: con una biglia sola chi nasconde ha già perso, chi scommette ha già vinto
  const t = tabella(20, 0);
  assert.ok(t.N[1] === 0 && t.S[19] === 1 && Math.abs(t.S[10] - 0.5) < 0.01, 'tabella delle probabilità');
  console.log('✓ Biglie: il difficile riconosce le abitudini (sempre pari, alternare) e conosce le situazioni vinte');
}

// ---- partite complete tra computer ----
{
  const N = VELOCE ? 60 : 400;
  const t0 = Date.now();
  let partite = 0, mani = 0;
  for (const opz of [{}, { mani: 10 }, { mani: 20 }, { biglie: 20 }, { biglie: 20, mani: 10 }]) {
    for (const a of ['facile', 'medio', 'difficile']) for (const b of ['facile', 'medio', 'difficile']) {
      for (let k = 0; k < N / 5; k++) {
        const g = partita(a, b, opz, k % 2, (x, tt, az, prima) => {
          // il difficile non resta mai con una biglia sola quando perde una scommessa
          if ((tt === 0 ? a : b) === 'difficile' && az.tipo === 'scommetti' && !x.limite && prima[1 - tt] > 1) assert.ok(prima[tt] - az.punta !== 1, 'il difficile non si lascia una biglia sola');
        });
        partite++; mani += g.mano;
        assert.ok(g.risultato.vincitori.length === 1 || (g.limite && g.risultato.pareggio));
        if (!g.limite) assert.ok(g.biglie.includes(0), 'senza limite si finisce quando uno ha preso tutto');
      }
    }
  }
  // forza: si vince di più contro i livelli più bassi
  const vinte = (a, b, k, opz = {}) => { let v = 0; for (let i = 0; i < k; i++) { const g = partita(a, b, opz, i % 2); if (g.risultato.vincitori[0] === 0) v++; } return v / k; };
  const K = VELOCE ? 300 : 4000;
  const df = vinte('difficile', 'facile', K), mf = vinte('medio', 'facile', K), dm = vinte('difficile', 'medio', K);
  // una persona prevedibile: nasconde quasi sempre 2 (pari)
  const pigro = (g, p) => (g.fase === 'nascondi' ? { tipo: 'nascondi', quante: Math.random() < 0.8 && g.biglie[p] >= 2 ? 2 : 1 } : { tipo: 'scommetti', punta: Math.max(1, Math.ceil(g.biglie[p] / 2)), pari: Math.random() < 0.5 });
  const dp = vinte('difficile', pigro, K, { biglie: 20 }), fp = vinte('facile', pigro, K, { biglie: 20 });
  if (!VELOCE) {
    assert.ok(df > 0.53 && mf > 0.53, `difficile e medio battono il facile (${df}, ${mf})`);
    assert.ok(dm > 0.485, `il difficile non è più debole del medio (${dm})`);
    assert.ok(dp > 0.55 && dp > fp + 0.05, `il difficile approfitta di chi è prevedibile (${dp} contro ${fp} del facile)`);
  }
  console.log(`✓ Biglie: ${partite} partite tra computer (tutti i livelli, 10 o 20 biglie, con e senza limite), ${(mani / partite).toFixed(1)} mani in media, nessuna mossa rifiutata; vittorie: difficile-facile ${(df * 100).toFixed(0)}%, medio-facile ${(mf * 100).toFixed(0)}%, difficile-medio ${(dm * 100).toFixed(0)}%, difficile contro una persona prevedibile ${(dp * 100).toFixed(0)}% (${Date.now() - t0} ms)`);
}
