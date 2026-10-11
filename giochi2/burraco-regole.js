// Regole delle combinazioni del Burraco (file di dati senza meta: il caricatore dei giochi lo ignora).
// Le stesse funzioni sono copiate nel disegno del browser (public/js/giochi2/burraco.js): un test controlla
// che diano gli stessi risultati.
// Carte: { id, rango: 1..13 (0 per il jolly), seme: 'c'|'q'|'f'|'p', jolly? }. I 2 (pinelle) e i jolly sono matte.
const SEMI = ['c', 'q', 'f', 'p'];

// punti di una carta (sul tavolo si sommano, in mano si tolgono)
const punti = (c) => (c.jolly ? 30 : c.rango === 2 ? 20 : c.rango === 1 ? 15 : c.rango >= 8 ? 10 : 5);
const eMatta = (c) => !!c.jolly || c.rango === 2;

// Scala: carte dello stesso seme in fila (l'asso sta sotto il 2 o sopra il re; da asso ad asso fanno 14 carte),
// al massimo una matta. Una pinella del seme giusto al suo posto (A-2-3, 2-3-4…) è una carta normale.
function provaScala(nat, matta) {
  if (nat.length < 2 || nat.some((c) => c.jolly)) return null;
  const s = nat[0].seme;
  if (!nat.every((c) => c.seme === s)) return null;
  const assi = nat.filter((c) => c.rango === 1);
  if (assi.length > 2) return null;
  const altre = nat.filter((c) => c.rango !== 1);
  // modi di mettere gli assi: in basso (1) o in alto (14)
  const modi = assi.length === 0 ? [[]] : assi.length === 1 ? [[1], [14]] : [[1, 14]];
  let migliore = null;
  for (const m of modi) {
    const pos = [...altre.map((c) => c.rango), ...m];
    const carte = [...altre, ...assi];
    if (new Set(pos).size !== pos.length) continue;
    const min = Math.min(...pos), max = Math.max(...pos);
    const buchi = max - min + 1 - pos.length;
    if (buchi > (matta ? 1 : 0)) continue;
    let posMatta = null;
    if (matta) {
      if (buchi === 1) { for (let x = min; x <= max; x++) if (!pos.includes(x)) posMatta = x; }
      else if (max < 14) posMatta = max + 1;
      else if (min > 1) posMatta = min - 1;
      else continue;
    }
    const da = posMatta != null ? Math.min(min, posMatta) : min;
    const a = posMatta != null ? Math.max(max, posMatta) : max;
    const fila = [];
    for (let x = da; x <= a; x++) fila.push(x === posMatta ? matta : carte[pos.indexOf(x)]);
    const r = { tipo: 'scala', seme: s, carte: fila, matta: matta ? matta.id : null, da, a };
    // a parità meglio la scala più "bassa" (l'asso sotto), così resta spazio per attaccare in alto
    if (!migliore) migliore = r;
  }
  return migliore;
}

// Combinazione (tris): almeno 3 carte dello stesso valore, semi qualsiasi, al massimo una matta. Non di soli 2.
function provaGruppo(nat, matta) {
  if (nat.length < 2 || nat.some((c) => c.jolly)) return null;
  const r = nat[0].rango;
  if (r === 2 || !nat.every((c) => c.rango === r)) return null;
  const ordinate = [...nat].sort((a, b) => SEMI.indexOf(a.seme) - SEMI.indexOf(b.seme));
  return { tipo: 'gruppo', rango: r, carte: matta ? [...ordinate, matta] : ordinate, matta: matta ? matta.id : null };
}

// Controlla un gruppo di carte: restituisce la combinazione (con le carte in ordine) oppure null.
// tipo: 'scala' o 'gruppo' per forzare il tipo (quando si attacca a una combinazione che c'è già).
function valuta(carte, tipo) {
  if (!Array.isArray(carte) || carte.length < 3 || carte.some((c) => !c)) return null;
  if (carte.filter((c) => c.jolly).length > 1) return null;
  const jolly = carte.find((c) => c.jolly);
  // possibili matte: il jolly, oppure (senza jolly) nessuna o una qualsiasi delle pinelle
  const scelte = jolly ? [jolly] : [null, ...carte.filter((c) => c.rango === 2)];
  for (const t of tipo ? [tipo] : ['scala', 'gruppo']) {
    for (const m of scelte) {
      const nat = carte.filter((c) => c !== m);
      const v = t === 'scala' ? provaScala(nat, m) : provaGruppo(nat, m);
      if (v) return completa(v);
    }
  }
  return null;
}

function completa(v) {
  v.punti = v.carte.reduce((s, c) => s + punti(c), 0);
  v.burraco = v.carte.length >= 7 ? (v.matta ? 'sporco' : 'pulito') : null;
  return v;
}

// bonus di una combinazione: burraco pulito 200, sporco 100
const bonus = (m) => (m.burraco === 'pulito' ? 200 : m.burraco === 'sporco' ? 100 : 0);

if (typeof module === 'object' && module.exports) module.exports = { SEMI, punti, eMatta, valuta, bonus };
