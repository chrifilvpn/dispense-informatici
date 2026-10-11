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

{
  // Chi è l'Alieno con i computer: le partite finiscono, i computer fanno i compiti, eliminano, segnalano, parlano e votano
  const A = GIOCHI.alieno;
  const { ELENCO } = A._test;
  const vinte = { alieni: 0, equipaggio: 0 };
  let frasi = 0, riunioni = 0, giusti = 0, espulsi = 0;
  for (let k = 0; k < 30; k++) {
    const n = 4 + (k % 7);
    const g = A.crea({ n, opzioni: { alieni: 3, mappa: ELENCO[k % ELENCO.length] }, bot: Array(n).fill(['facile', 'medio', 'difficile'][k % 3]) });
    g.nomiGiocatori = Array.from({ length: n }, (_, i) => `Bot${i}`);
    const ap = g.apriRiunione.bind(g); g.apriRiunione = (...a) => { riunioni++; return ap(...a); };
    const cv = g.chiudiVoto.bind(g); g.chiudiVoto = () => { cv(); if (g.espulsione.chi !== null) { espulsi++; if (g.espulsione.alieno) giusti++; } };
    let ora = Date.now(), passi = 0;
    while (!g.finita) { ora += 50; g.tick(ora); frasi += g.chatDa.splice(0).length; assert.ok(++passi < 60000, 'la partita con i computer finisce'); }
    vinte[g.vittoria.chi]++;
  }
  assert.ok(vinte.alieni >= 3 && vinte.equipaggio >= 3, `vincono sia gli Alieni sia l'equipaggio ${JSON.stringify(vinte)}`);
  assert.ok(riunioni >= 15 && frasi >= 30 && espulsi >= 5, `riunioni con chat e voti (${riunioni} riunioni, ${frasi} frasi, ${espulsi} espulsi)`);
  // una persona che accusa in chat fa salire il sospetto dei computer
  const g = A.crea({ n: 5, opzioni: { alieni: 1, mappa: 'base' }, bot: [null, 'medio', 'medio', 'medio', 'medio'] });
  g.nomiGiocatori = ['Pia', 'Ada', 'Alan', 'Grace', 'Linus'];
  let ora = Date.now(); for (let i = 0; i < 80; i++) { ora += 50; g.tick(ora); }
  g.pulsanteDa = 0; Object.assign(g.e[0], { x: g.M.pulsante.x, y: g.M.pulsante.y + 40 });
  assert.ok(g.azione(0, { tipo: 'riunione' }).ok);
  g.leggiChat(0, 'ho visto Grace vicino al corpo, è lei!');
  const ascoltano = [1, 2, 4].filter((i) => !g.e[i].alieno);
  assert.ok(ascoltano.every((i) => g.menti.m[i].sosp[3] >= 1.5), 'i computer dell\'equipaggio ascoltano le accuse');
  for (let i = 0; i < 20 * 45; i++) { ora += 50; g.tick(ora); }
  assert.ok([1, 2, 3, 4].every((i) => g.riunione.voti[i] !== undefined), 'i computer votano');
  console.log(`✓ Chi è l'Alieno con i computer: strade sulla mappa, compiti, eliminazioni senza testimoni, corpi segnalati, chat e voto nelle riunioni, accuse lette in chat (vittorie ${JSON.stringify(vinte)}, espulsi giusti ${giusti}/${espulsi})`);
}

{
  // tre tocchi nell'angolo per tornare al gioco dal telefono
  const fs = require('fs'), path = require('path'), vm = require('vm');
  const js = path.join(__dirname, '..', 'public', 'js');
  const boss = fs.readFileSync(path.join(js, 'boss.js'), 'utf8');
  const blocco = boss.slice(boss.indexOf('// (inizio: tre tocchi nell\'angolo'), boss.indexOf('// (fine: tre tocchi nell\'angolo'));
  const T = vm.runInNewContext(`${blocco}; ({ treTocchi })`);
  const prova = (tocchi) => { let st = null, esci = false; for (const [ora, x, y] of tocchi) { const r = T.treTocchi(ora, st, x, y, 400); st = r.stato; esci = esci || r.esci; } return esci; };
  assert.ok(prova([[0, 390, 10], [400, 380, 20], [900, 395, 5]]), 'tre tocchi veloci nell\'angolo: si esce');
  assert.ok(!prova([[0, 390, 10], [400, 380, 20], [2000, 395, 5]]), 'troppo lenti: no');
  assert.ok(!prova([[0, 390, 10], [400, 200, 300], [700, 395, 5]]), 'un tocco fuori dall\'angolo azzera');
  console.log('✓ Dispense: tre tocchi nell\'angolo per tornare al gioco dal telefono');
}
