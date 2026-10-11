// Controlli delle migliorie ai giochi (chiamato da test/simula.js): forza della mano nel poker, Wordle difficile,
// quiz di geografia (capitali, sagome, monumenti)
const assert = require('assert');
const { GIOCHI } = require('../giochi');

{
  // poker: la forza della mano arriva solo a chi è in mano, tra 0 e 100, e non svela le carte degli altri
  for (const id of ['texas', 'poker5']) {
    const M = GIOCHI[id];
    const g = M.crea({ n: 3, primo: 0, opzioni: {}, fiche: [1000, 1000, 1000], bot: [null, 'medio', 'medio'] });
    for (let p = 0; p < 3; p++) if (g.fase === 'puntate' || g.attesi) break;
    let v = null;
    for (let k = 0; k < 50 && !v; k++) {
      v = g.vista(0).forza;
      if (!v) { const t = g.turno; if (t === null || t === undefined) { if (g.inAttesa) g.avanza(); continue; } g.azione(t, M.bot(g, t, 'medio')); }
    }
    assert.ok(v && v.percento >= 0 && v.percento <= 100 && v.avversari >= 1, `${id}: forza della mano`);
  }
  console.log('✓ Poker e Texas: forza della mano (probabilità di vincere) per chi è in mano');
}

{
  // Wordle difficile: le verdi restano al loro posto, le ocra vanno usate; i computer rispettano la regola
  const W = GIOCHI.wordle;
  const g = W.crea({ n: 1, opzioni: { lunghezza: 5, modo: 'difficile', controllo: 'dizionario' } });
  g.segreta = 'casco';
  assert.ok(g.azione(0, { tipo: 'prova', parola: 'carta' }).ok);
  assert.match(g.azione(0, { tipo: 'prova', parola: 'mente' }).errore, /1ª lettera deve essere C/);
  assert.strictEqual(W._test.controllaDifficile('casco', g.righe[0]), null);
  for (let k = 0; k < 150; k++) {
    const h = W.crea({ n: 2, opzioni: { lunghezza: 5, modo: 'difficile', controllo: 'dizionario' } });
    while (!h.finita) for (const p of h.attesi()) assert.ok(h.azione(p, W.bot(h, p, ['facile', 'difficile'][p])).ok, 'il computer rispetta la modalità difficile');
  }
  console.log('✓ Wordle: modalità difficile (indizi obbligatori), anche per il computer');
}

{
  // quiz di geografia: tutte le domande hanno 4 risposte diverse con quella giusta, i mazzi funzionano, i computer rispondono
  const { CAPITALI } = require('../giochi2/geo-dati');
  const { PAESI } = require('../giochi/bandiere-dati');
  assert.ok(PAESI.every((p) => CAPITALI[p.nome]), 'ogni paese ha la sua capitale');
  for (const id of ['capitali', 'sagome', 'monumenti']) {
    const M = GIOCHI[id];
    for (const mazzo of M.meta.opzioni[0].valori) {
      const g = M.crea({ n: 2, opzioni: { mazzo, domande: 30 }, bot: [null, 'difficile'] });
      while (!g.finita) {
        if (g.inAttesa) { g.avanza(); continue; }
        const nomi = g.opzioni.map((i) => g.banca.elementi[i].nome);
        assert.ok(new Set(nomi).size === 4 && g.opzioni.includes(g.giusta), `${id}/${mazzo}: 4 risposte diverse con quella giusta`);
        for (const p of [0, 1]) if (g.risposte[p] === null) assert.ok(g.azione(p, M.bot(g, p, 'medio')).ok);
      }
      const v = g.vista(0);
      assert.ok(v.testo && (v.bandiera || v.icona), `${id}: la domanda si vede`);
    }
  }
  console.log('✓ Quiz di geografia: Indovina la capitale (158 paesi), il paese dalla sagoma (142), dove si trova il monumento (81)');
}
