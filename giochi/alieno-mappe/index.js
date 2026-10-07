// CHI È L'ALIENO — le mappe a tema. Ogni mappa sta nel suo file (stanze, corridoi, mobili, postazioni dei compiti,
// pulsante delle riunioni, colori e decorazioni): qui si costruisce la griglia, si danno i numeri alle postazioni
// (le posizioni che mancano si scelgono da sole negli angoli della stanza), si controlla che sia tutto raggiungibile
// e si prepara l'anteprima in SVG per la sala d'attesa. Per aggiungere una mappa: un file nuovo e una riga in ELENCO.
const T = 40, COLS = 65, RIGHE = 42;
const ELENCO = ['base', 'vulcano', 'pianta', 'abissi', 'polare'];
// i compiti: semplici (2-4 s), medi (5-10 s), elaborati (10-20 s o in due postazioni)
const LIVELLO = {
  tempismo: 'semplice', carica: 'semplice', scorri: 'semplice', leva: 'semplice',
  fili: 'medio', sequenza: 'medio', numeri: 'medio', interruttori: 'medio', allinea: 'medio', ordina: 'medio', ruota: 'medio',
  consegna: 'elaborato', calibra: 'elaborato', labirinto: 'elaborato',
};

function costruisci(def) {
  const g = Array.from({ length: RIGHE }, () => new Array(COLS).fill('#'));
  const scava = ([x, y, w, h], ch = '.') => { for (let r = y; r < y + h; r++) for (let c = x; c < x + w; c++) if (r > 0 && c > 0 && r < RIGHE - 1 && c < COLS - 1) g[r][c] = ch; };
  for (const s of def.stanze) scava(s.r);
  for (const c of def.corridoi) scava(c);
  for (const m of def.mobili) scava(m, 'M');
  // postazioni: numero, posizione (quelle senza posizione vanno negli angoli liberi della loro stanza)
  const usate = new Set();
  const perId = {};
  const stazioni = def.stazioni.map((s, i) => {
    const st = { ...s, id: i + 1 };
    if (s.id) perId[s.id] = i + 1;
    if (!st.t) {
      const [x, y, w, h] = def.stanze.find((q) => q.id === s.stanza).r;
      const posti = [[x + 1, y + 1], [x + w - 2, y + h - 2], [x + w - 2, y + 1], [x + 1, y + h - 2], [x + (w >> 1), y + 1], [x + (w >> 1), y + h - 2], [x + 2, y + (h >> 1)], [x + w - 3, y + (h >> 1)]];
      st.t = posti.find(([c, r]) => g[r][c] === '.' && !usate.has(`${c},${r}`));
    }
    usate.add(`${st.t[0]},${st.t[1]}`);
    st.livello = LIVELLO[st.tipo];
    return st;
  });
  for (const st of stazioni) if (st.poi) st.poi = perId[st.poi];
  const mappa = g.map((r) => r.join(''));
  return { ...def, T, COLS, RIGHE, MW: COLS * T, MH: RIGHE * T, mappa, stazioni, pulsante: { x: def.pulsante[0] * T, y: def.pulsante[1] * T }, anteprima: anteprima(def, mappa) };
}
// l'anteprima per la sala d'attesa: pavimenti delle stanze, corridoi e pulsante (SVG semplice, niente script)
function anteprima(def, mappa) {
  const col = (id) => (def.tema.pavimenti[id] || ['#667'])[0];
  const fondo = { spazio: '#05070f', lava: '#5a1a0a', giungla: '#12301a', abisso: '#061a2c', neve: '#e8f0f6' }[def.tema.fondo] || '#111';
  let corr = '';
  for (let r = 0; r < mappa.length; r++) for (let c = 0; c < COLS; c++) if (mappa[r][c] !== '#' && !def.stanze.some((s) => c >= s.r[0] && c < s.r[0] + s.r[2] && r >= s.r[1] && r < s.r[1] + s.r[3])) corr += `M${c} ${r}h1v1h-1z`;
  return `<svg viewBox="0 0 ${COLS} ${RIGHE}" xmlns="http://www.w3.org/2000/svg"><rect width="${COLS}" height="${RIGHE}" fill="${fondo}"/>`
    + `<path d="${corr}" fill="${def.tema.muro[1]}"/>`
    + def.stanze.map((s) => `<rect x="${s.r[0]}" y="${s.r[1]}" width="${s.r[2]}" height="${s.r[3]}" rx="1" fill="${col(s.id)}" stroke="${def.tema.muro[0]}" stroke-width=".5"/>`).join('')
    + `<circle cx="${def.pulsante[0]}" cy="${def.pulsante[1]}" r="1.4" fill="#e8322a"/></svg>`;
}
// controlli: ogni postazione su un pavimento libero e tutto raggiungibile dal pulsante (anche le stanze)
function controlla(M) {
  const libero = (c, r) => r >= 0 && c >= 0 && r < RIGHE && c < COLS && M.mappa[r][c] === '.';
  const [pc, pr] = [Math.round(M.pulsante.x / T), Math.round(M.pulsante.y / T) + 2];
  const visti = new Set([`${pc},${pr}`]), coda = [[pc, pr]], errori = [];
  if (!libero(pc, pr)) errori.push('davanti al pulsante c\'è un ostacolo');
  while (coda.length) { const [c, r] = coda.shift(); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = `${c + a},${r + b}`; if (libero(c + a, r + b) && !visti.has(k)) { visti.add(k); coda.push([c + a, r + b]); } } }
  for (const st of M.stazioni) {
    if (!st.t || !libero(st.t[0], st.t[1])) errori.push(`${M.id}: postazione senza posto: ${st.nome}`);
    else if (!visti.has(`${st.t[0]},${st.t[1]}`)) errori.push(`${M.id}: postazione irraggiungibile: ${st.nome}`);
    if (!LIVELLO[st.tipo]) errori.push(`${M.id}: tipo sconosciuto ${st.tipo}`);
    if (st.tipo === 'consegna' && !st.arrivo && !M.stazioni.some((q) => q.id === st.poi && q.arrivo)) errori.push(`${M.id}: consegna senza arrivo: ${st.nome}`);
  }
  for (const s of M.stanze) { const [x, y, w, h] = s.r; let ok = false; for (let r = y; r < y + h && !ok; r++) for (let c = x; c < x + w; c++) if (visti.has(`${c},${r}`)) { ok = true; break; } if (!ok) errori.push(`${M.id}: stanza irraggiungibile: ${s.nome}`); }
  return errori;
}

const MAPPE = Object.fromEntries(ELENCO.map((id) => [id, costruisci(require(`./${id}`))]));
module.exports = { MAPPE, ELENCO, LIVELLO, T, COLS, RIGHE, controlla };
