// 2048: scorrimento e fusioni, stessa sequenza di tessere per tutti, sfida a tempo, computer col loro ritmo
const assert = require('assert');
const M = require('../../giochi2/duemila');
const { scorri, puoMuovere, tesseraN, Griglia, OBIETTIVO } = M._test;

// ---- scorrimento e fusioni ----
{
  const c = [2, 2, 2, 2, 4, 0, 4, 0, 2, 4, 8, 16, 0, 0, 0, 2];
  const s = scorri(c, 'sx');
  assert.deepStrictEqual(s.celle.slice(0, 4), [4, 4, 0, 0], 'quattro 2: due fusioni');
  assert.deepStrictEqual(s.celle.slice(4, 8), [8, 0, 0, 0]);
  assert.deepStrictEqual(s.celle.slice(8, 12), [2, 4, 8, 16], 'niente da fondere');
  assert.deepStrictEqual(s.celle.slice(12, 16), [2, 0, 0, 0]);
  assert.strictEqual(s.punti, 4 + 4 + 8);
  assert.deepStrictEqual(scorri([2, 2, 4, 0, ...new Array(12).fill(0)], 'sx').celle.slice(0, 4), [4, 4, 0, 0], 'una tessera appena fusa non si fonde ancora');
  assert.deepStrictEqual(scorri([0, 2, 2, 2, ...new Array(12).fill(0)], 'dx').celle.slice(0, 4), [0, 0, 2, 4], 'si fondono prima quelle verso cui si scorre');
  const su = scorri([2, 0, 0, 0, 2, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0], 'su');
  assert.deepStrictEqual([su.celle[0], su.celle[4], su.celle[8]], [4, 8, 0]);
  assert.ok(!scorri([2, 4, 8, 16, ...new Array(12).fill(0)], 'sx').mosso, 'niente si muove');
  assert.ok(!puoMuovere([2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2]), 'griglia bloccata');
  assert.ok(puoMuovere([2, 2, 4, 8, 4, 8, 2, 4, 2, 4, 8, 2, 4, 2, 4, 8]));
}

// ---- stessa sequenza di tessere per tutti ----
{
  assert.deepStrictEqual(tesseraN(123, 7), tesseraN(123, 7));
  let quattro = 0;
  for (let k = 0; k < 2000; k++) if (tesseraN(99, k).v === 4) quattro++;
  assert.ok(quattro > 120 && quattro < 300, `circa il 10% di 4 (${quattro}/2000)`);
  const a = new Griglia(555), b = new Griglia(555);
  assert.deepStrictEqual(a.valori(), b.valori(), 'stessa partenza');
  for (const d of ['sx', 'giu', 'dx', 'su', 'sx', 'giu']) { a.muovi(d); b.muovi(d); }
  assert.deepStrictEqual(a.valori(), b.valori(), 'stesse mosse, stesse tessere');
  const g = M.crea({ n: 3, opzioni: { minuti: 2 }, bot: [null, null, null] });
  assert.deepStrictEqual(g.griglie[0].valori(), g.griglie[2].valori(), 'nella sfida tutti partono uguali');
  assert.ok(g.fine - g.inizio === 120000, 'tempo della sfida');
  assert.deepStrictEqual(g.attesi(), [0, 1, 2]);
  assert.ok(g.azione(0, { tipo: 'muovi', dir: 'diagonale' }).errore);
  assert.ok(g.azione(0, null).errore);
  const prima = g.griglie[1].valori();
  for (const d of ['sx', 'su', 'dx', 'giu']) g.azione(0, { tipo: 'muovi', dir: d });
  assert.deepStrictEqual(g.griglie[1].valori(), prima, 'la griglia degli altri non cambia');
  const v = g.vista(1);
  assert.ok(v.altri.length === 3 && v.tessere.every((t) => t.id && t.v), 'vista con le tessere e gli altri');
  assert.ok(!('seme' in v), 'il seme non si manda (si potrebbero prevedere le tessere)');
}

// ---- animazioni: le tessere conservano il nome, le fusioni dicono da quali tessere vengono ----
{
  const gr = new Griglia(1);
  gr.t = new Array(16).fill(null);
  gr.t[0] = { id: 101, v: 2 }; gr.t[1] = { id: 102, v: 2 }; gr.t[3] = { id: 103, v: 8 };
  gr.nId = 200;
  assert.ok(gr.muovi('dx'));
  assert.strictEqual(gr.t[3].id, 103, 'la tessera che scorre tiene il suo nome');
  assert.strictEqual(gr.fusioni.length, 1);
  assert.deepStrictEqual([...gr.fusioni[0].da].sort(), [101, 102]);
  assert.strictEqual(gr.t[2].v, 4);
  assert.ok(gr.nuova && gr.t.some((x) => x && x.id === gr.nuova), 'una tessera nuova dopo la mossa');
  assert.strictEqual(gr.punti, 4);
}

// ---- 2048 nella sfida: vince chi ci arriva prima ----
{
  const g = M.crea({ n: 2, opzioni: {}, bot: [null, null] });
  g.griglie[1].t = new Array(16).fill(null);
  g.griglie[1].t[0] = { id: 1, v: 1024 }; g.griglie[1].t[1] = { id: 2, v: 1024 };
  g.azione(1, { tipo: 'muovi', dir: 'sx' });
  assert.ok(g.finita && g.risultato.vincitori[0] === 1, 'chi arriva a 2048 vince subito');
  // da soli si continua dopo il 2048
  const s = M.crea({ n: 1, opzioni: {}, bot: [null] });
  s.griglie[0].t = new Array(16).fill(null);
  s.griglie[0].t[0] = { id: 1, v: 1024 }; s.griglie[0].t[1] = { id: 2, v: 1024 };
  s.azione(0, { tipo: 'muovi', dir: 'sx' });
  assert.ok(!s.finita && s.griglie[0].vinto && s.griglie[0].max === OBIETTIVO, 'da soli si continua');
  // da soli la partita finisce quando non ci sono più mosse
  s.griglie[0].t = [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 0].map((v, i) => (v ? { id: 50 + i, v } : null));
  s.griglie[0].nId = 100;
  // l'unica mossa riempie la casella vuota: con il seme la tessera nuova può bloccare la griglia o no
  for (let k = 0; k < 20 && !s.finita; k++) {
    const d = ['dx', 'giu', 'sx', 'su'].find((x) => scorri(s.griglie[0].valori(), x).mosso);
    if (!d) break;
    s.azione(0, { tipo: 'muovi', dir: d });
  }
  if (!puoMuovere(s.griglie[0].valori())) assert.ok(s.finita && s.vista(0).record.length >= 1, 'bloccato: fine e classifica');
  // pausa delle dispense (solo da soli)
  const p = M.crea({ n: 1, opzioni: {}, bot: [null] });
  assert.ok(p.pausaBoss && !M.crea({ n: 2, opzioni: {}, bot: [null, null] }).pausaBoss);
  p.impostaPausa(true);
  assert.ok(p.azione(0, { tipo: 'muovi', dir: 'sx' }).errore, 'in pausa non si gioca');
}

// ---- sfide complete tra computer (tempo simulato): il ritmo e la bravura contano ----
{
  const LIV = ['facile', 'medio', 'difficile'];
  const t0 = Date.now();
  const vinte = { facile: 0, medio: 0, difficile: 0 }, punti = { facile: [0, 0], medio: [0, 0], difficile: [0, 0] };
  const _now = Date.now; let T = _now(); Date.now = () => T;
  let partite = 0;
  try {
    for (const n of [2, 3, 4]) {
      for (let k = 0; k < 50; k++) {
        const liv = Array.from({ length: n }, (_, i) => LIV[(i + k) % 3]);
        const g = M.crea({ n, opzioni: { minuti: [2, 3, 5][k % 3] }, bot: liv });
        assert.deepStrictEqual(g.attesi(), [], 'il server non aspetta i computer');
        let passi = 0;
        while (!g.finita) {
          assert.ok(++passi < 100000, 'la partita finisce');
          const s = g.scadenza();
          assert.ok(s, 'c\'è sempre una scadenza');
          T = Math.max(T, s);
          // le mosse del computer passano da azione: nessuna deve essere rifiutata
          const az = g.azione.bind(g);
          let rifiutata = null;
          g.azione = (p, a) => { const r = az(p, a); if (r.errore) rifiutata = r.errore; return r; };
          g.controllaTempo();
          g.azione = az;
          assert.ok(!rifiutata, `mossa del computer rifiutata: ${rifiutata}`);
        }
        partite++;
        assert.ok(T - g.inizio <= g.minuti * 60000 + 5, 'finisce entro il tempo');
        for (let i = 0; i < n; i++) { punti[liv[i]][0] += g.griglie[i].punti; punti[liv[i]][1]++; }
        for (const v of g.risultato.vincitori) vinte[liv[v]]++;
      }
    }
  } finally { Date.now = _now; }
  const media = LIV.map((l) => Math.round(punti[l][0] / punti[l][1]));
  assert.ok(media[2] > media[1] && media[1] > media[0], `punti medi f/m/d ${media.join('/')}`);
  assert.ok(vinte.difficile > vinte.medio && vinte.medio > vinte.facile, `vittorie ${JSON.stringify(vinte)}`);
  console.log(`✓ 2048: fusioni, stessa sequenza di tessere, 2048 vince subito, ${partite} sfide tra computer da 2 a 4 col loro ritmo (punti medi f/m/d ${media.join('/')}, vittorie ${LIV.map((l) => vinte[l]).join('/')}, ${Date.now() - t0} ms)`);
}

// ---- partite da soli fino alla fine ----
{
  const t0 = Date.now();
  for (let k = 0; k < 100; k++) {
    const g = M.crea({ n: 1, opzioni: {}, bot: [null] });
    let passi = 0;
    while (!g.finita) {
      assert.ok(++passi < 20000);
      const r = g.azione(0, M.bot(g, 0, ['facile', 'medio'][k % 2]));
      assert.ok(!r.errore);
    }
    assert.ok(!puoMuovere(g.griglie[0].valori()), 'finisce solo quando è bloccata');
  }
  console.log(`✓ 2048: 100 partite da soli fino all'ultima mossa (${Date.now() - t0} ms)`);
}
