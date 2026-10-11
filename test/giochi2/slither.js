// SERPENTONI: movimento verso il mouse, cibo, turbo, scontri, rinascita, vista che segue il proprio serpente, e
// tante partite complete con 1-8 giocatori più i serpenti del computer di riempimento.
const assert = require('assert');
const { GIOCHI } = require('../../giochi');
const M = GIOCHI.slither;
const { L_INIZIO, RINASCITA, VISTA, larghezzaVista } = M._test;

const parti = (g) => { let ora = Date.now(); while (g.fase !== 'gioco') { ora += 50; g.fineFase = ora; g.tick(ora); } return ora; };
const passa = (g, sec) => { for (let k = 0; k < Math.round(sec / 0.05); k++) { g.tempoRound += 0.05; if (g.passo(0.05)) return true; } return false; };
const ferma = (g) => { g.cibo.clear(); g.griglia.clear(); g.ciboVoluto = () => 0; };

assert.strictEqual(M.meta.id, 'slither');
assert.deepStrictEqual(M.meta.giocatori, [1, 2, 3, 4, 5, 6, 7, 8]);
assert.ok(M.meta.regole.some((r) => /facile/.test(r) && /difficile/.test(r)));

// ---- opzioni: durata, quanti serpenti del computer, forza ----
{
  const g = M.crea({ n: 2, opzioni: { minuti: 5, computer: 10, forza: 'difficile' }, bot: [null, null] });
  assert.strictEqual(g.durata, 300);
  assert.strictEqual(g.s.length, 12, '2 giocatori + 10 serpenti del computer');
  assert.ok(g.s.slice(2).every((s) => s.extra && s.liv === 'difficile' && s.nome));
  const h = M.crea({ n: 1, opzioni: { minuti: 'boh', computer: 99, forza: 'x' }, bot: [null] });
  assert.ok(h.durata === 180 && h.s.length === 7 && h.forzaExtra === 'misti', 'valori strani: quelli predefiniti');
  assert.ok(h.cibo.size > 200, 'cibo sparso per l\'arena');
  for (const f of h.cibo.values()) assert.ok(Math.hypot(f.x, f.y) < h.R, 'il cibo è dentro l\'arena');
}

// ---- movimento: verso il mouse (rispetto al centro dello schermo) o con le frecce; cibo; turbo ----
{
  const g = M.crea({ n: 1, opzioni: { computer: 0 }, bot: [null] }); parti(g); ferma(g);
  const s = g.s[0]; Object.assign(s, { x: 0, y: 0, ang: 0, meta: 0 }); s.p = [{ x: 0, y: 0 }];
  g.input(0, { mx: VISTA / 2, my: VISTA / 2 - 300 }); passa(g, 1);
  assert.ok(Math.abs(s.ang + Math.PI / 2) < 0.05 && s.y < -100, 'gira verso il mouse (in su) e va avanti');
  g.input(0, { x: 1, y: 0 }); passa(g, 1);
  assert.ok(Math.abs(s.ang) < 0.05, 'con le frecce va a destra');
  g.input(0, { x: 0, y: 0, mx: VISTA, my: VISTA / 2 }); // il mouse a destra
  const L0 = s.L; g.metti({ x: s.x + Math.cos(s.ang) * 60, y: s.y + Math.sin(s.ang) * 60 }, 9); passa(g, 0.6);
  assert.strictEqual(s.L, L0 + 9, 'mangiando si allunga');
  // turbo: più veloce, ma si perde lunghezza e si lascia cibo
  s.L = 500; const x0 = s.x; g.input(0, { a: true }); passa(g, 1);
  assert.ok(s.x - x0 > 300 && s.L < 500 - 15 && g.cibo.size > 0, 'il turbo accelera, consuma lunghezza e lascia la scia');
  // il turbo va subito, già con la lunghezza di partenza
  s.L = L_INIZIO; const xa = s.x; passa(g, 0.5);
  assert.ok(s.inTurbo && s.x - xa > 150 && s.L < L_INIZIO, 'il turbo funziona anche appena nati');
  s.L = 70; const x1 = s.x; passa(g, 1); g.input(0, { a: false });
  assert.ok(s.x - x1 < 200 && s.L === 70, 'troppo corti niente turbo');
  assert.ok(s.p.length <= Math.ceil(s.L / 10) + 2, 'il corpo è lungo quanto deve');
}

// ---- scontri: la testa contro il corpo di un altro fa morire, il proprio corpo no, il bordo sì ----
{
  const g = M.crea({ n: 2, opzioni: { computer: 0 }, bot: [null, null] }); parti(g); ferma(g);
  const [a, b] = g.s;
  // b fermo in verticale a x = 200, a che arriva da sinistra
  Object.assign(b, { x: 200, y: -200, ang: Math.PI / 2, meta: Math.PI / 2, L: 600 }); b.p = Array.from({ length: 61 }, (_, k) => ({ x: 200, y: -200 + 600 - k * 10 }));
  b.y = 400; b.ang = Math.PI / 2; b.p.unshift({ x: 200, y: 400 });
  Object.assign(a, { x: 0, y: 100, ang: 0, meta: 0, L: 300 }); a.p = Array.from({ length: 31 }, (_, k) => ({ x: -k * 10, y: 100 }));
  g.input(0, { x: 1, y: 0 }); g.input(1, { x: 1, y: 0 });
  // b gira ma è lontano; a sbatte su b
  const prima = g.cibo.size;
  passa(g, 1.6);
  assert.ok(!a.vivo && b.vivo, 'a sbatte contro il corpo di b');
  assert.ok(g.cibo.size > prima + 5, 'il corpo di chi muore diventa cibo');
  assert.strictEqual(b.uccisioni, 1);
  assert.strictEqual(g.vistaTick(0).s.io[0], 0, 'morto');
  passa(g, RINASCITA + 0.1);
  assert.ok(a.vivo && a.L === L_INIZIO, 'dopo 3 secondi si rinasce piccoli');
  // il proprio corpo non fa niente: un serpente lungo che gira in tondo
  const h = M.crea({ n: 1, opzioni: { computer: 0 }, bot: [null] }); parti(h); ferma(h);
  const s = h.s[0]; s.L = 2000; h.input(0, { x: 0, y: 1 }); passa(h, 2); h.input(0, { x: -1, y: 0 }); passa(h, 1); h.input(0, { x: 0, y: -1 }); passa(h, 1); h.input(0, { x: 1, y: 0 }); passa(h, 1.5);
  assert.ok(s.vivo, 'toccare il proprio corpo non fa morire');
  // il bordo
  Object.assign(s, { x: h.R - 30, y: 0, ang: 0, meta: 0 }); s.p = [{ x: h.R - 30, y: 0 }]; h.input(0, { x: 1, y: 0 }); passa(h, 0.5);
  assert.ok(!s.vivo, 'fuori dal bordo si muore');
}

// ---- vista: si manda solo quello che si vede dal proprio serpente ----
{
  const g = M.crea({ n: 2, opzioni: { computer: 6 }, bot: [null, 'medio'] }); parti(g);
  const [a, b] = g.s;
  Object.assign(a, { x: -1200, y: 0 }); Object.assign(b, { x: 1200, y: 0 }); a.p = [{ x: -1200, y: 0 }]; b.p = [{ x: 1200, y: 0 }];
  for (const x of g.s.slice(2)) { x.x = 0; x.y = 1500; x.p = [{ x: 0, y: 1500 }]; }
  const v = g.vistaTick(0).s;
  assert.ok(v.s.some((x) => x.id === 0) && !v.s.some((x) => x.id === 1), 'l\'altro, lontano, non si vede');
  const larga = larghezzaVista(a.r || 10) * 0.75 + 60;
  for (let j = 0; j < v.f.length; j += 3) assert.ok(Math.abs(v.f[j] + 1200) <= larga + 1, 'solo il cibo vicino');
  assert.ok(JSON.stringify(g.vistaTick(0)).length < 12000, 'il tick è piccolo');
}

// ---- fine: vince il più lungo; chi è morto in quel momento conta zero ----
{
  const g = M.crea({ n: 3, opzioni: { computer: 0 }, bot: [null, null, null] }); parti(g);
  g.s[0].L = 800; g.s[1].L = 1200; g.s[2].L = 3000; g.s[2].vivo = false; g.s[2].morto = g.tempoRound;
  g.tempoRound = g.durata; g.fineRound(); g.chiudi();
  assert.deepStrictEqual(g.risultato.vincitori, [1]);
  assert.deepStrictEqual(g.risultato.fazioni.map((f) => f.punti), [80, 120, 0]);
  assert.strictEqual(g.risultato.etichetta, 'lunghezza');
}

// ---- partite complete: 1-8 giocatori computer + serpenti di riempimento ----
{
  const liv = ['facile', 'medio', 'difficile'];
  const st = { facile: { m: 0, n: 0, rec: 0 }, medio: { m: 0, n: 0, rec: 0 }, difficile: { m: 0, n: 0, rec: 0 } };
  const S = M._test.Serpentoni, mu = S.prototype.muori;
  let livelli = null;
  S.prototype.muori = function (s, da) { const l = s.liv || livelli[s.id]; if (l) st[l].m++; return mu.call(this, s, da); };
  let partite = 0, uccisioni = 0;
  const t0 = Date.now();
  for (let n = 1; n <= 8; n++) {
    for (let k = 0; k < 13; k++) {
      livelli = Array.from({ length: n }, (_, i) => liv[(i + k) % 3]);
      const g = M.crea({ n, opzioni: { minuti: 2, computer: [0, 3, 6, 10][k % 4], forza: ['misti', 'facile', 'medio', 'difficile'][k % 4] }, bot: livelli });
      const lunga = k === 0 && (n === 1 || n === 8);
      g.durata = lunga ? 120 : 20; // due partite durano davvero 2 minuti, le altre sono corte (per fare in fretta)
      let ora = Date.now(), passi = 0;
      while (!g.finita) {
        ora += 50; if (g.fase !== 'gioco') g.fineFase = Math.min(g.fineFase, ora);
        g.tick(ora);
        assert.ok(++passi < 10000, 'la partita finisce');
      }
      assert.ok(g.risultato.fazioni.length === n);
      if (n === 1) assert.deepStrictEqual(g.risultato.vincitori, [0]);
      for (const s of g.s) { assert.ok(Number.isFinite(s.L) && s.L > 0); if (s.vivo) assert.ok(Math.hypot(s.x, s.y) < g.R); }
      for (const s of g.s) { const l = s.liv || livelli[s.id]; st[l].n++; st[l].rec += s.record; uccisioni += s.uccisioni; }
      if (lunga) assert.ok(g.s.every((s) => s.record > L_INIZIO + 100), 'in due minuti tutti i computer crescono');
      partite++;
    }
  }
  S.prototype.muori = mu;
  for (const l of liv) assert.ok(st[l].rec / st[l].n > L_INIZIO + 20, `i computer ${l} mangiano`);
  assert.ok(uccisioni > 20, `i serpenti si fanno sbattere (${uccisioni})`);
  const morti = (l) => st[l].m / st[l].n;
  assert.ok(morti('facile') > morti('difficile'), `il facile muore più spesso del difficile ${JSON.stringify(st)}`);
  console.log(`✓ Serpentoni: verso il mouse o le frecce, cibo, turbo che consuma, scontri e cibo dai morti, rinascita dopo 3 s, bordo, vista solo vicina, vince il più lungo, ${partite} partite con 1-8 giocatori e serpenti del computer (morti per serpente f/m/d ${morti('facile').toFixed(2)}/${morti('medio').toFixed(2)}/${morti('difficile').toFixed(2)}) in ${Date.now() - t0} ms`);
}
