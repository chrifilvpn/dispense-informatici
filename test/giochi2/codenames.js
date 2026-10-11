// Test di NOMI IN CODICE: la raccolta di parole e la rete dei temi, la mappa segreta, i controlli sull'indizio, il
// turno degli agenti (voti, scopri, passa, numero + 1, assassino, ultima parola), cosa vede chi, l'orologio, e migliaia
// di partite complete tra computer (il difficile deve battere spesso il facile).
const assert = require('assert');
const { GIOCHI } = require('../../giochi');
const { TEMI, ASSOCIAZIONI } = require('../../giochi2/codenames-dati');

const M = GIOCHI.codenames;
const { controllaIndizio, interpreta, ROSSI, BLU, NEUTRO, ASSASSINO } = M._test;

// ---- la raccolta ----
const parole = Object.keys(ASSOCIAZIONI);
assert.ok(parole.length >= 400, `servono almeno 400 parole (sono ${parole.length})`);
assert.ok(Object.keys(TEMI).length >= 140, 'circa 150 temi');
const usi = {};
for (const [w, temi] of Object.entries(ASSOCIAZIONI)) {
  assert.ok(/^[a-zàèéìòù]{2,12}$/.test(w), `parola strana «${w}»`);
  assert.ok(temi.length >= 3 && temi.length <= 6, `«${w}» deve avere da 3 a 6 temi`);
  assert.strictEqual(new Set(temi).size, temi.length, `«${w}»: temi ripetuti`);
  for (const t of temi) { assert.ok(TEMI[t], `«${w}»: tema sconosciuto ${t}`); usi[t] = (usi[t] || 0) + 1; }
}
for (const [t, nomi] of Object.entries(TEMI)) {
  assert.ok((usi[t] || 0) >= 4, `il tema ${t} deve legare almeno 4 parole`);
  assert.ok(nomi.length >= 2, `il tema ${t} ha bisogno di un nome di riserva`);
  for (const n of nomi) assert.ok(!controllaIndizio(n, 1, []), `il nome ${n} deve essere un indizio valido`);
}
console.log(`✓ Nomi in codice: ${parole.length} parole, ${Object.keys(TEMI).length} temi, ogni parola con 3-6 temi e ogni tema con almeno 4 parole`);

// ---- l'indizio ----
const tavolo = ['girasole', 'gatto', 'mare', 'ape', 'treno'];
assert.strictEqual(controllaIndizio('animale', 2, tavolo), null);
assert.strictEqual(controllaIndizio('Città', 1, tavolo), null, 'accenti e maiuscole vanno bene');
assert.ok(controllaIndizio('mare', 1, tavolo), 'non una parola sul tavolo');
assert.ok(controllaIndizio('MARE', 1, tavolo), 'nemmeno in maiuscolo');
assert.ok(controllaIndizio('sole', 1, tavolo), 'non una parte di una parola sul tavolo');
assert.ok(controllaIndizio('gatti', 1, tavolo), 'non un\'altra forma di una parola sul tavolo');
assert.ok(controllaIndizio('marea', 1, tavolo), 'non una parola che contiene una parola sul tavolo');
assert.ok(controllaIndizio('acqua salata', 1, tavolo), 'una parola sola');
assert.ok(controllaIndizio('dell\'acqua', 1, tavolo), 'niente apostrofi');
assert.ok(controllaIndizio('r2d2', 1, tavolo), 'niente numeri');
assert.ok(controllaIndizio('', 1, tavolo));
assert.ok(controllaIndizio('animale', 0, tavolo) && controllaIndizio('animale', 10, tavolo) && controllaIndizio('animale', 'due', tavolo), 'numero da 1 a 9');
assert.strictEqual(controllaIndizio('mare', 1, ['gatto']), null, 'le parole già scoperte non contano');
assert.ok(interpreta('animale').animale === 1 && interpreta('oceano').mare === 1, 'il computer capisce i nomi dei temi');
assert.ok(interpreta('acquatico').acqua > 0, 'e le parole che ci somigliano');
assert.ok(interpreta('pinguino').artico > 0, 'e le parole della raccolta');
console.log('✓ Nomi in codice: l\'indizio è una parola sola, non una del tavolo né una sua parte o forma, con un numero da 1 a 9');

// ---- squadre, capitani e mappa ----
for (const n of M.meta.giocatori) {
  for (let primo = 0; primo < 6; primo++) {
    const g = M.crea({ n, primo, opzioni: {} });
    assert.deepStrictEqual(g.membri[0], Array.from({ length: n }, (_, i) => i).filter((i) => i % 2 === 0), 'rossi ai posti pari');
    assert.strictEqual(g.capitani[0] % 2, 0); assert.strictEqual(g.capitani[1] % 2, 1);
    const conta = [0, 0, 0, 0];
    for (const c of g.mappa) conta[c]++;
    assert.strictEqual(conta[g.iniziale], 9); assert.strictEqual(conta[1 - g.iniziale], 8);
    assert.strictEqual(conta[NEUTRO], 7); assert.strictEqual(conta[ASSASSINO], 1);
    assert.strictEqual(new Set(g.parole).size, 25);
    assert.strictEqual(g.turno, g.capitani[g.iniziale], 'comincia il capitano della squadra con 9 parole');
    for (let p = 0; p < n; p++) {
      const v = g.vista(p);
      if (g.capitani.includes(p)) assert.deepStrictEqual(v.mappa, g.mappa, 'il capitano vede la mappa');
      else assert.strictEqual(v.mappa, null, 'gli agenti non vedono la mappa');
      assert.ok(!JSON.stringify(v).includes('"mappa":[') || g.capitani.includes(p));
    }
  }
  // il capitano cambia a ogni partita
  const caps = new Set(Array.from({ length: n }, (_, k) => M.crea({ n, primo: k, opzioni: {} }).capitani.join()));
  assert.ok(caps.size >= 2, 'il capitano gira');
}
console.log('✓ Nomi in codice: squadre a posti alterni, capitano a turno, mappa 9/8/7/1 vista solo dai capitani');

// ---- un turno completo ----
function nuova(n = 4) {
  const g = M.crea({ n, primo: 0, opzioni: {} });
  g.iniziale = ROSSI; g.sq = ROSSI;
  g.mappa = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3];
  g.parole = ['mela', 'pera', 'banana', 'uva', 'limone', 'arancia', 'ciliegia', 'fragola', 'ananas', 'cane', 'gatto', 'topo', 'leone', 'tigre', 'orso', 'lupo', 'volpe', 'sedia', 'tavolo', 'letto', 'divano', 'armadio', 'specchio', 'porta', 'bomba'];
  g.iniziaIndizio();
  return g;
}
{
  const g = nuova();
  const [capR, capB] = g.capitani;
  const agR = g.agenti(ROSSI)[0], agB = g.agenti(BLU)[0];
  assert.ok(g.azione(agR, { tipo: 'indizio', parola: 'frutta', numero: 2 }).errore, 'l\'indizio lo dà il capitano');
  assert.ok(g.azione(capB, { tipo: 'indizio', parola: 'frutta', numero: 2 }).errore, 'non tocca ai blu');
  assert.ok(g.azione(agR, { tipo: 'scopri', carta: 0 }).errore, 'prima serve l\'indizio');
  assert.ok(g.azione(capR, { tipo: 'indizio', parola: 'mela', numero: 2 }).errore, 'parola sul tavolo');
  assert.ok(g.azione(capR, { tipo: 'indizio', parola: 'frutta', numero: 2 }).ok);
  assert.strictEqual(g.fase, 'ricerca');
  assert.deepStrictEqual(g.attesi(), [agR], 'tocca agli agenti rossi');
  assert.ok(g.azione(capR, { tipo: 'scopri', carta: 0 }).errore, 'il capitano non scopre');
  assert.ok(g.azione(agB, { tipo: 'scopri', carta: 0 }).errore, 'gli agenti dell\'altra squadra aspettano');
  assert.ok(g.azione(agR, { tipo: 'passa' }).errore, 'almeno una parola prima di passare');
  assert.ok(g.azione(agR, { tipo: 'scopri', carta: 99 }).errore);
  assert.ok(g.azione(agR, { tipo: 'scopri', carta: 'x' }).errore);
  // voto: si vede ai compagni, non agli avversari
  assert.ok(g.azione(agR, { tipo: 'vota', carta: 3 }).ok);
  assert.strictEqual(g.vista(agR).voti[agR], 3);
  assert.strictEqual(g.vista(agB).voti, null, 'gli avversari non vedono i voti');
  assert.ok(g.azione(agR, { tipo: 'vota', carta: 3 }).ok);
  assert.strictEqual(g.voti[agR], null, 'toccare di nuovo toglie il voto');
  // numero + 1 parole giuste, poi il turno passa da solo
  for (const c of [0, 1, 2]) assert.ok(g.azione(agR, { tipo: 'scopri', carta: c }).ok);
  assert.ok(g.inAttesa, 'tre parole con indizio da 2: fine turno');
  assert.ok(g.azione(agR, { tipo: 'scopri', carta: 3 }).errore, 'durante la pausa niente mosse');
  g.avanza();
  assert.strictEqual(g.sq, BLU); assert.strictEqual(g.turno, capB);
  assert.ok(g.azione(agR, { tipo: 'scopri', carta: 3 }).errore);
  // il blu scopre una neutrale: fine turno
  assert.ok(g.azione(capB, { tipo: 'indizio', parola: 'animale', numero: 3 }).ok);
  assert.ok(g.azione(agB, { tipo: 'scopri', carta: 9 }).ok && !g.inAttesa);
  assert.ok(g.azione(agB, { tipo: 'scopri', carta: 9 }).errore, 'già scoperta');
  assert.ok(g.azione(agB, { tipo: 'scopri', carta: 17 }).ok && g.inAttesa, 'neutrale: fine turno');
  g.avanza();
  // il rosso scopre una parola blu: fine turno; poi passa dopo una giusta
  g.azione(capR, { tipo: 'indizio', parola: 'albero', numero: 1 });
  g.azione(agR, { tipo: 'scopri', carta: 10 });
  assert.ok(g.inAttesa && g.restano(BLU) === 6, 'la parola blu resta scoperta per i blu');
  g.avanza();
  g.azione(capB, { tipo: 'indizio', parola: 'bosco', numero: 2 });
  g.azione(agB, { tipo: 'scopri', carta: 11 });
  assert.ok(g.azione(agB, { tipo: 'passa' }).ok && g.inAttesa);
  g.avanza();
  // l'assassino: la squadra che lo scopre perde subito
  g.azione(capR, { tipo: 'indizio', parola: 'guerra', numero: 1 });
  g.azione(agR, { tipo: 'scopri', carta: 24 });
  assert.ok(g.finita && g.vincitore === BLU && g.motivo === 'assassino');
  assert.deepStrictEqual(g.risultato.vincitori, g.membri[BLU]);
  assert.strictEqual(g.vista(agR).risultato.titolo, 'Vincono i Blu!');
  assert.strictEqual(g.vista(agB).risultato.titolo, undefined, 'chi vince legge "Avete vinto!"');
  assert.ok(g.vista(agR).mappa, 'a fine partita tutti vedono la mappa');
  assert.strictEqual(g.registro.length, 5);
}
{
  // l'ultima parola vince, anche se a scoprirla sono gli avversari
  const g = nuova();
  const [capR] = g.capitani; const agR = g.agenti(ROSSI)[0];
  for (let i = 0; i < 9; i++) if (i !== 4) g.scoperte[i] = { colore: 0, chi: agR };
  for (let i = 9; i < 17; i++) if (i !== 16) g.scoperte[i] = { colore: 1, chi: agR };
  g.azione(capR, { tipo: 'indizio', parola: 'albero', numero: 1 });
  g.azione(agR, { tipo: 'scopri', carta: 16 });
  assert.ok(g.finita && g.vincitore === BLU && g.motivo === 'regalo');
  const h = nuova();
  for (let i = 0; i < 8; i++) h.scoperte[i] = { colore: 0, chi: 1 };
  h.azione(h.capitani[0], { tipo: 'indizio', parola: 'frutta', numero: 1 });
  h.azione(h.agenti(ROSSI)[0], { tipo: 'scopri', carta: 8 });
  assert.ok(h.finita && h.vincitore === ROSSI && h.motivo === 'tutte');
}
{
  // l'orologio: il capitano che non decide riceve l'indizio dal computer; gli agenti lenti perdono il turno
  const g = M.crea({ n: 4, primo: 0, opzioni: { tempo: 90 } });
  assert.ok(g.scadenza() > Date.now());
  g.fineTempo = Date.now() - 1;
  assert.ok(g.controllaTempo() && g.fase === 'ricerca' && g.registro.length === 1, 'indizio dato dal computer');
  g.fineTempo = Date.now() - 1;
  const sq = g.sq;
  assert.ok(g.controllaTempo() && g.inAttesa);
  g.avanza();
  assert.strictEqual(g.sq, 1 - sq);
  assert.strictEqual(M.crea({ n: 4, opzioni: {} }).scadenza(), null, 'senza opzione niente orologio');
}
{
  // squadra mista: gli agenti computer propongono (votano) e lasciano decidere alle persone
  const g = M.crea({ n: 6, primo: 0, opzioni: {}, bot: [null, 'medio', 'medio', 'medio', null, 'medio'] });
  g.sq = ROSSI; g.iniziale = ROSSI; g.iniziaIndizio();
  const ind = M.bot(g, g.capitani[ROSSI], 'difficile');
  assert.ok(g.azione(g.capitani[ROSSI], ind).ok);
  const agenti = g.agenti(ROSSI); // 2 (computer) e 4 (persona)
  assert.deepStrictEqual(agenti, [2, 4]);
  assert.deepStrictEqual(g.attesi(), [2, 4]);
  const m = M.bot(g, 2, 'medio');
  assert.strictEqual(m.tipo, 'vota', 'il computer propone');
  assert.ok(g.azione(2, m).ok);
  assert.deepStrictEqual(g.attesi(), [4], 'poi aspetta la persona');
  assert.strictEqual(g.vista(4).voti[2], m.carta, 'la persona vede il consiglio');
}
console.log('✓ Nomi in codice: voti visibili ai compagni, scopri fino a numero + 1, passa, neutrale e avversaria chiudono il turno, assassino, ultima parola, orologio, computer che consigliano');

// ---- partite complete tra computer ----
const VELOCE = !!process.env.TEST_VELOCE;
function partita(n, livelli, persone = []) {
  const bot = Array.from({ length: n }, (_, i) => (persone.includes(i) ? null : livelli[i % 2]));
  const g = M.crea({ n, primo: Math.floor(Math.random() * 10), opzioni: {}, bot });
  let mosse = 0;
  while (!g.finita) {
    assert.ok(++mosse < 1500, 'la partita deve finire');
    if (g.inAttesa) { g.avanza(); continue; }
    let p = g.turno;
    if (p == null) {
      const a = g.attesi();
      assert.ok(a.length, 'durante la ricerca c\'è sempre qualcuno che può muovere');
      p = a[Math.floor(Math.random() * a.length)];
    }
    const r = g.azione(p, M.bot(g, p, bot[p] || 'medio'));
    assert.ok(r.ok, `mossa del computer rifiutata: ${r.errore}`);
  }
  return g;
}
let totale = 0;
const LIV = ['facile', 'medio', 'difficile'];
for (const n of M.meta.giocatori) {
  const quante = VELOCE ? 150 : 400;
  for (let k = 0; k < quante; k++) {
    const g = partita(n, [LIV[k % 3], LIV[(k + 1 + Math.floor(k / 3)) % 3]], k % 4 === 0 ? [0] : []);
    totale++;
    assert.ok(g.risultato.vincitori.length > 0 && g.risultato.fazioni.length === 2);
    const trovate = g.risultato.fazioni[g.vincitore].punti;
    if (g.motivo === 'tutte' || g.motivo === 'regalo') assert.strictEqual(trovate, g.mappa.filter((c) => c === g.vincitore).length);
    for (const r of g.registro) assert.ok(!controllaIndizio(r.parola, r.numero, []), `indizio del computer non valido: ${r.parola}`);
  }
}
// il difficile batte il facile (metà partite da rossi, metà da blu)
let vinteDifficile = 0;
const sfide = VELOCE ? 300 : 800;
for (let k = 0; k < sfide; k++) {
  const difficileRossi = k % 2 === 0;
  const g = partita(4 + (k % 5), difficileRossi ? ['difficile', 'facile'] : ['facile', 'difficile']);
  if (g.vincitore === (difficileRossi ? ROSSI : BLU)) vinteDifficile++;
  totale++;
}
assert.ok(vinteDifficile / sfide > 0.75, `il difficile deve vincere spesso contro il facile (${vinteDifficile}/${sfide})`);
console.log(`✓ Nomi in codice: ${totale} partite complete tra computer (da 4 a 8 giocatori, anche con persone in squadra), nessuna mossa rifiutata; il difficile batte il facile ${Math.round((vinteDifficile / sfide) * 100)}% delle volte`);
