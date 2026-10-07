// LE BANDIERE di "Indovina la bandiera": disegnate qui in SVG (niente immagini esterne). Ogni bandiera è alta 200 e
// larga W (300 = proporzioni 3:2, 400 = 2:1, 200 = quadrata…). Gli stemmi più complicati sono semplificati, ma i colori
// e la disposizione sono quelli veri. fama: 1 = famosa, 2 = media, 3 = difficile.
// Il disegno resta sul server: al browser arriva solo l'SVG della domanda, mai il nome, finché non si risponde.

// ---- colori ----
const C = {
  rosso: '#ce1126', rossoS: '#c8102e', cremisi: '#a51931', bordeaux: '#8d1b3d', arancio: '#ff8200', zafferano: '#ff9933',
  giallo: '#fcd116', oro: '#ffcc00', verde: '#009246', verdeS: '#006a4e', verdeC: '#14b53a',
  blu: '#0033a0', navy: '#012169', azzurro: '#75aadb', celeste: '#4997d0', bianco: '#ffffff', nero: '#000000', marrone: '#8b5a2b',
};

// ---- pezzi di disegno ----
const r = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const sfondo = (W, c) => r(0, 0, W, 200, c);
const cerchio = (x, y, raggio, c) => `<circle cx="${x}" cy="${y}" r="${raggio}" fill="${c}"/>`;
const poli = (punti, c) => `<polygon points="${punti.map((p) => p.join(',')).join(' ')}" fill="${c}"/>`;
const giro = (s, ang, x, y) => `<g transform="rotate(${ang} ${x} ${y})">${s}</g>`;
function strisceH(W, colori, pesi = colori.map(() => 1)) {
  const tot = pesi.reduce((a, b) => a + b, 0);
  let y = 0;
  return colori.map((c, i) => { const h = (200 * pesi[i]) / tot; const s = r(0, y.toFixed(2), W, (h + 0.5).toFixed(2), c); y += h; return s; }).join('');
}
function strisceV(W, colori, pesi = colori.map(() => 1)) {
  const tot = pesi.reduce((a, b) => a + b, 0);
  let x = 0;
  return colori.map((c, i) => { const w = (W * pesi[i]) / tot; const s = r(x.toFixed(2), 0, (w + 0.5).toFixed(2), 200, c); x += w; return s; }).join('');
}
// stella a "punte" punte; ang = gradi (0 = una punta in alto)
function stella(x, y, R, c, ang = 0, punte = 5, interno = punte === 5 ? 0.382 : 0.5) {
  const p = [];
  for (let k = 0; k < punte * 2; k++) {
    const a = ((ang + (k * 180) / punte) * Math.PI) / 180;
    const rr = k % 2 ? R * interno : R;
    p.push([(x + rr * Math.sin(a)).toFixed(1), (y - rr * Math.cos(a)).toFixed(1)]);
  }
  return poli(p, c);
}
// mezzaluna: cerchio pieno meno un cerchio del colore di sfondo spostato di dx
const luna = (x, y, R, dx, c, fondo, r2 = R * 0.8) => cerchio(x, y, R, c) + cerchio(x + dx, y, r2, fondo);
// croce scandinava (spostata verso l'asta); bordo = croce con il bordo (Norvegia, Islanda)
function croceNord(W, fondo, croce, bordo = null) {
  const x = W * 0.36, y = 100, s = bordo ? 26 : 30;
  let o = sfondo(W, fondo);
  if (bordo) o += r(x - s / 2 - 13, 0, s + 26, 200, bordo) + r(0, y - s / 2 - 13, W, s + 26, bordo);
  return o + r(x - s / 2, 0, s, 200, croce) + r(0, y - s / 2, W, s, croce);
}
// scudo semplice (per gli stemmi semplificati)
const scudo = (x, y, w, h, c, bordo = 'none', dentro = '') => `<path d="M${x - w / 2},${y - h / 2} h${w} v${h * 0.55} q0,${h * 0.45} ${-w / 2},${h * 0.45} q${-w / 2},0 ${-w / 2},${-h * 0.45} z" fill="${c}" stroke="${bordo}" stroke-width="3"/>${dentro}`;
// Union Jack nel riquadro (x, y, w, h)
const unionJack = (x, y, w, h) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 60 30" preserveAspectRatio="none"><rect width="60" height="30" fill="${C.navy}"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="${C.rossoS}" stroke-width="2"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="${C.rossoS}" stroke-width="6"/></svg>`;
// sole con raggi
function sole(x, y, R, c, raggi = 16, lungo = 1.6) {
  let s = '';
  for (let k = 0; k < raggi; k++) s += giro(poli([[x - R * 0.18, y], [x + R * 0.18, y], [x, y - R * lungo]], c), (360 * k) / raggi, x, y);
  return s + cerchio(x, y, R, c);
}
// "scritta" stilizzata (per le bandiere con testo arabo)
const scritta = (x, y, w, c) => `<path d="M${x},${y} q${w * 0.1},-12 ${w * 0.2},0 t${w * 0.2},0 t${w * 0.2},0 t${w * 0.2},0 t${w * 0.2},0" stroke="${c}" stroke-width="5" fill="none"/>`;
// foglia d'acero
const ACERO = [[0, -1], [0.12, -0.72], [0.32, -0.82], [0.26, -0.34], [0.58, -0.62], [0.52, -0.44], [0.88, -0.5], [0.76, -0.26], [0.92, -0.12], [0.5, 0.2], [0.56, 0.36], [0.06, 0.3], [0.06, 0.78], [-0.06, 0.78], [-0.06, 0.3], [-0.56, 0.36], [-0.5, 0.2], [-0.92, -0.12], [-0.76, -0.26], [-0.88, -0.5], [-0.52, -0.44], [-0.58, -0.62], [-0.26, -0.34], [-0.32, -0.82], [-0.12, -0.72]];
const acero = (x, y, s, c) => poli(ACERO.map(([a, b]) => [(x + a * s).toFixed(1), (y + b * s).toFixed(1)]), c);
// croce del Sud (Australia, Nuova Zelanda…) e simili
const stelleSparse = (lista, c, punte = 5) => lista.map(([x, y, R]) => stella(x, y, R, c, 0, punte)).join('');

// ---- le bandiere: [nome, fama, W, disegno] ----
const B = [];
const f = (nome, fama, W, ...pezzi) => B.push({ nome, fama, W, svg: pezzi.join('') });

// EUROPA
f('Italia', 1, 300, strisceV(300, [C.verde, C.bianco, C.rosso]));
f('Francia', 1, 300, strisceV(300, ['#002395', C.bianco, '#ed2939']));
f('Germania', 1, 333, strisceH(333, [C.nero, '#dd0000', '#ffce00']));
f('Spagna', 1, 300, strisceH(300, ['#aa151b', '#f1bf00', '#aa151b'], [1, 2, 1]), scudo(95, 100, 34, 44, '#aa151b', '#f1bf00', r(80, 95, 30, 10, '#f1bf00')), r(68, 78, 8, 50, '#ccc'), r(114, 78, 8, 50, '#ccc'), poli([[80, 74], [110, 74], [104, 64], [86, 64]], '#f1bf00'));
f('Portogallo', 1, 300, strisceV(300, ['#046a38', '#da291c'], [2, 3]), cerchio(120, 100, 40, '#ffe900'), cerchio(120, 100, 30, '#046a38'), scudo(120, 100, 32, 40, C.bianco, '#da291c', r(114, 88, 12, 22, '#002d72')));
f('Regno Unito', 1, 400, unionJack(0, 0, 400, 200));
f('Irlanda', 1, 400, strisceV(400, ['#169b62', C.bianco, '#ff883e']));
f('Belgio', 1, 260, strisceV(260, [C.nero, '#fdda24', '#ef3340']));
f('Paesi Bassi', 1, 300, strisceH(300, ['#ae1c28', C.bianco, '#21468b']));
f('Lussemburgo', 3, 333, strisceH(333, ['#ed2939', C.bianco, '#00a1de']));
f('Austria', 1, 300, strisceH(300, ['#c8102e', C.bianco, '#c8102e']));
f('Svizzera', 1, 200, sfondo(200, '#da291c'), r(85, 40, 30, 120, C.bianco), r(40, 85, 120, 30, C.bianco));
f('Danimarca', 1, 265, croceNord(265, '#c8102e', C.bianco));
f('Svezia', 1, 320, croceNord(320, '#006aa7', '#fecc00'));
f('Norvegia', 1, 275, croceNord(275, '#ba0c2f', '#00205b', C.bianco));
f('Finlandia', 1, 327, croceNord(327, C.bianco, '#002f6c'));
f('Islanda', 2, 278, croceNord(278, '#02529c', '#dc1e35', C.bianco));
f('Polonia', 1, 320, strisceH(320, [C.bianco, '#dc143c']));
f('Repubblica Ceca', 2, 300, strisceH(300, [C.bianco, '#d7141a']), poli([[0, 0], [150, 100], [0, 200]], '#11457e'));
f('Slovacchia', 2, 300, strisceH(300, [C.bianco, '#0b4ea2', '#ee1c25']), scudo(105, 100, 64, 84, '#ee1c25', C.bianco, r(101, 70, 8, 52, C.bianco) + r(88, 82, 34, 6, C.bianco) + r(84, 96, 42, 6, C.bianco) + `<path d="M75,128 q15,-16 30,0 q15,-16 30,0 v8 h-60 z" fill="#0b4ea2"/>`));
f('Ungheria', 2, 400, strisceH(400, ['#ce2939', C.bianco, '#477050']));
f('Romania', 2, 300, strisceV(300, ['#002b7f', '#fcd116', '#ce1126']));
f('Bulgaria', 2, 333, strisceH(333, [C.bianco, '#00966e', '#d62612']));
f('Grecia', 1, 300, strisceH(300, Array.from({ length: 9 }, (_, i) => (i % 2 ? C.bianco : '#0d5eaf'))), r(0, 0, 111, 111, '#0d5eaf'), r(44, 0, 23, 111, C.bianco), r(0, 44, 111, 23, C.bianco));
f('Croazia', 2, 400, strisceH(400, ['#ff0000', C.bianco, '#171796']), `<g>${Array.from({ length: 25 }, (_, k) => r(165 + (k % 5) * 14, 52 + Math.floor(k / 5) * 16, 14, 16, ((k % 5) + Math.floor(k / 5)) % 2 ? C.bianco : '#ff0000')).join('')}</g>`, `<rect x="165" y="52" width="70" height="80" fill="none" stroke="#171796" stroke-width="3"/>`);
f('Slovenia', 3, 400, strisceH(400, [C.bianco, '#005da4', '#ed1c24']), scudo(110, 72, 52, 64, '#005da4', '#ed1c24', `<path d="M88,90 l12,-18 l10,12 l10,-12 l12,18 z" fill="${C.bianco}"/>` + stella(110, 56, 5, '#ffdd00')));
f('Serbia', 2, 300, strisceH(300, ['#c6363c', '#0c4076', C.bianco]), scudo(100, 92, 46, 60, '#c6363c', '#e8c55a', `<path d="M90,78 l10,22 l10,-22 l-4,30 h-12 z" fill="${C.bianco}"/>`), poli([[84, 56], [116, 56], [110, 46], [90, 46]], '#e8c55a'));
f('Ucraina', 1, 300, strisceH(300, ['#0057b7', '#ffd700']));
f('Russia', 1, 300, strisceH(300, [C.bianco, '#0039a6', '#d52b1e']));
f('Bielorussia', 3, 400, strisceH(400, ['#c8313e', '#4aa657'], [2, 1]), r(0, 0, 40, 200, C.bianco), Array.from({ length: 8 }, (_, k) => poli([[20, 6 + k * 25], [32, 18 + k * 25], [20, 30 + k * 25], [8, 18 + k * 25]], '#c8313e')).join(''));
f('Lituania', 2, 333, strisceH(333, ['#fdb913', '#006a44', '#c1272d']));
f('Lettonia', 3, 400, strisceH(400, ['#9e3039', C.bianco, '#9e3039'], [2, 1, 2]));
f('Estonia', 2, 314, strisceH(314, ['#0072ce', C.nero, C.bianco]));
f('Albania', 2, 280, sfondo(280, '#e41e20'), `<path d="M140,48 l-14,16 l-36,-20 l14,30 l-30,-4 l28,24 l-22,8 l34,6 l-6,22 l22,-14 l10,30 l10,-30 l22,14 l-6,-22 l34,-6 l-22,-8 l28,-24 l-30,4 l14,-30 l-36,20 z" fill="${C.nero}"/>`);
f('Macedonia del Nord', 3, 400, sfondo(400, '#d20000'), poli([[0, 0], [60, 0], [200, 100]], '#ffe600'), poli([[400, 0], [340, 0], [200, 100]], '#ffe600'), poli([[0, 200], [60, 200], [200, 100]], '#ffe600'), poli([[400, 200], [340, 200], [200, 100]], '#ffe600'), poli([[170, 0], [230, 0], [200, 100]], '#ffe600'), poli([[170, 200], [230, 200], [200, 100]], '#ffe600'), poli([[0, 80], [0, 120], [200, 100]], '#ffe600'), poli([[400, 80], [400, 120], [200, 100]], '#ffe600'), cerchio(200, 100, 34, '#d20000'), cerchio(200, 100, 28, '#ffe600'));
f('Bosnia ed Erzegovina', 3, 400, sfondo(400, '#002395'), poli([[110, 0], [310, 0], [310, 200]], '#fecb00'), Array.from({ length: 9 }, (_, k) => stella(82 + k * 22, -8 + k * 24, 10, C.bianco)).join(''));
f('Montenegro', 3, 400, sfondo(400, '#d3ae3b'), r(10, 10, 380, 180, '#c40308'), `<path d="M200,60 l-40,-10 l10,40 l-20,30 l30,-4 l20,30 l20,-30 l30,4 l-20,-30 l10,-40 z" fill="#d3ae3b"/>`);
f('Moldavia', 3, 400, strisceV(400, ['#0046ae', '#ffd200', '#cc092f']), scudo(200, 104, 50, 60, '#cc092f', '#b07e3a', `<path d="M186,92 q14,-14 28,0 v20 h-28 z" fill="#b07e3a"/>`), `<path d="M168,70 q32,-34 64,0" stroke="#b07e3a" stroke-width="8" fill="none"/>`);
f('Malta', 2, 300, strisceV(300, [C.bianco, '#cf142b']), r(16, 16, 40, 40, '#cf142b'), r(20, 20, 32, 32, '#bbb'), r(31, 20, 10, 32, '#999'), r(20, 31, 32, 10, '#999'));
f('Cipro', 2, 300, sfondo(300, C.bianco), `<path d="M80,90 l40,-14 l60,-6 l60,-24 l-30,30 l-40,18 l-30,16 l-50,4 z" fill="#d57800"/>`, `<path d="M110,140 q40,20 80,0" stroke="#4e5b31" stroke-width="7" fill="none"/>`);
f('Monaco', 2, 250, strisceH(250, ['#ce1126', C.bianco]));
f('San Marino', 3, 267, strisceH(267, [C.bianco, '#5eb6e4']), scudo(133, 104, 46, 58, '#5eb6e4', '#d4a017', r(118, 88, 8, 22, C.bianco) + r(129, 82, 8, 28, C.bianco) + r(140, 88, 8, 22, C.bianco)), poli([[110, 70], [156, 70], [148, 58], [118, 58]], '#d4a017'));
f('Città del Vaticano', 2, 200, strisceV(200, ['#ffe000', C.bianco]), `<g stroke="#d4a017" stroke-width="8" stroke-linecap="round"><line x1="122" y1="130" x2="172" y2="70"/></g><g stroke="#aaa" stroke-width="8" stroke-linecap="round"><line x1="172" y1="130" x2="122" y2="70"/></g>`, poli([[132, 66], [162, 66], [156, 46], [138, 46]], '#d4a017'));
f('Andorra', 3, 286, strisceV(286, ['#10069f', '#fedd00', '#d50032'], [8, 9, 8]), scudo(143, 100, 50, 60, '#fedd00', '#c7a228', r(122, 76, 20, 24, '#d50032') + r(144, 76, 20, 24, '#fedd00') + r(122, 100, 20, 24, '#fedd00') + r(144, 100, 20, 24, '#d50032')));
f('Liechtenstein', 3, 333, strisceH(333, ['#002b7f', '#ce1126']), poli([[50, 70], [100, 70], [108, 30], [90, 46], [75, 22], [60, 46], [42, 30]], '#ffd83d'));
f('Turchia', 1, 300, sfondo(300, '#e30a17'), luna(110, 100, 50, 13, C.bianco, '#e30a17', 40), stella(167, 100, 25, C.bianco, -90));
f('Georgia', 2, 300, sfondo(300, C.bianco), r(130, 0, 40, 200, '#ff0000'), r(0, 80, 300, 40, '#ff0000'), ...[[65, 40], [235, 40], [65, 160], [235, 160]].map(([x, y]) => r(x - 4, y - 18, 8, 36, '#ff0000') + r(x - 18, y - 4, 36, 8, '#ff0000')));
f('Armenia', 2, 400, strisceH(400, ['#d90012', '#0033a0', '#f2a800']));
f('Azerbaigian', 2, 400, strisceH(400, ['#00b5e2', '#ef3340', '#509e2f']), luna(190, 100, 30, 8, C.bianco, '#ef3340', 25), stella(228, 100, 12, C.bianco, 0, 8));
f('Kosovo', 3, 280, sfondo(280, '#244aa5'), `<path d="M108,82 l20,-12 l30,4 l18,22 l-6,34 l-26,8 l-28,-12 l-12,-24 z" fill="#d0a650"/>`, Array.from({ length: 6 }, (_, k) => stella(80 + k * 24, 52 - Math.sin((k / 5) * Math.PI) * 16, 9, C.bianco)).join(''));

// AMERICHE
{
  let s = strisceH(380, Array.from({ length: 13 }, (_, i) => (i % 2 ? C.bianco : '#b22234'))) + r(0, 0, 152, 107.7, '#3c3b6e');
  for (let riga = 0; riga < 9; riga++) for (let k = 0; k < (riga % 2 ? 5 : 6); k++) s += stella((152 / 12) * (riga % 2 ? 2 + 2 * k : 1 + 2 * k), (107.7 / 10) * (riga + 1), 4.6, C.bianco);
  f('Stati Uniti', 1, 380, s);
}
f('Canada', 1, 400, strisceV(400, ['#d80621', C.bianco, '#d80621']), acero(200, 96, 64, '#d80621'));
f('Messico', 1, 350, strisceV(350, ['#006847', C.bianco, '#ce1126']), `<path d="M150,126 q25,22 50,0" stroke="#006847" stroke-width="7" fill="none"/>`, `<ellipse cx="175" cy="96" rx="20" ry="24" fill="#8b5a2b"/>`, cerchio(170, 70, 9, '#8b5a2b'), `<path d="M160,118 h30" stroke="#5b8c32" stroke-width="5"/>`);
f('Brasile', 1, 286, sfondo(286, '#009c3b'), poli([[24, 100], [143, 17], [262, 100], [143, 183]], '#ffdf00'), cerchio(143, 100, 50, '#002776'), `<path d="M95,88 q50,-14 96,24" stroke="${C.bianco}" stroke-width="9" fill="none"/>`, stelleSparse([[120, 120, 4], [140, 130, 4], [160, 120, 3], [150, 140, 3], [128, 140, 3], [170, 132, 3]], C.bianco));
f('Argentina', 1, 320, strisceH(320, ['#74acdf', C.bianco, '#74acdf']), sole(160, 100, 14, '#f6b40e', 16, 1.7));
f('Cile', 1, 300, strisceH(300, [C.bianco, '#d52b1e']), r(0, 0, 100, 100, '#0039a6'), stella(50, 50, 20, C.bianco));
f('Perù', 2, 300, strisceV(300, ['#d91023', C.bianco, '#d91023']));
f('Colombia', 2, 300, strisceH(300, ['#fcd116', '#003893', '#ce1126'], [2, 1, 1]));
f('Venezuela', 2, 300, strisceH(300, ['#ffcc00', '#00247d', '#cf142b']), Array.from({ length: 8 }, (_, k) => { const a = (-70 + k * 20) * (Math.PI / 180); return stella(150 + Math.sin(a) * 46, 128 - Math.cos(a) * 46, 7, C.bianco); }).join(''));
f('Ecuador', 3, 300, strisceH(300, ['#ffdd00', '#034ea2', '#ed1c24'], [2, 1, 1]), `<ellipse cx="150" cy="100" rx="22" ry="28" fill="#6ba3d6" stroke="#c8a400" stroke-width="4"/>`, `<path d="M118,70 q32,-30 64,0" stroke="#5a3d1e" stroke-width="7" fill="none"/>`);
f('Bolivia', 2, 293, strisceH(293, ['#d52b1e', '#f9e300', '#007934']));
f('Paraguay', 3, 367, strisceH(367, ['#d52b1e', C.bianco, '#0038a8']), cerchio(183, 100, 22, '#0038a8'), cerchio(183, 100, 18, C.bianco), stella(183, 100, 8, '#ffd700'), `<path d="M166,108 q17,16 34,0" stroke="#009b3a" stroke-width="3" fill="none"/>`);
f('Uruguay', 2, 300, strisceH(300, Array.from({ length: 9 }, (_, i) => (i % 2 ? '#0038a8' : C.bianco))), r(0, 0, 111, 111, C.bianco), sole(55, 55, 16, '#fcd116', 16, 1.9));
f('Cuba', 2, 400, strisceH(400, ['#002a8f', C.bianco, '#002a8f', C.bianco, '#002a8f']), poli([[0, 0], [173, 100], [0, 200]], '#cf142b'), stella(58, 100, 28, C.bianco));
f('Giamaica', 2, 400, sfondo(400, '#009b3a'), poli([[0, 0], [0, 200], [200, 100]], C.nero), poli([[400, 0], [400, 200], [200, 100]], C.nero), `<path d="M0,0 L400,200 M400,0 L0,200" stroke="#fed100" stroke-width="28"/>`);
f('Panama', 2, 300, r(0, 0, 150, 100, C.bianco), r(150, 0, 150, 100, '#da121a'), r(0, 100, 150, 100, '#072357'), r(150, 100, 150, 100, C.bianco), stella(75, 50, 22, '#072357'), stella(225, 150, 22, '#da121a'));
f('Costa Rica', 3, 333, strisceH(333, ['#002b7f', C.bianco, '#ce1126', C.bianco, '#002b7f'], [1, 1, 2, 1, 1]));
f('Guatemala', 3, 320, strisceV(320, ['#4997d0', C.bianco, '#4997d0']), `<path d="M136,118 q24,24 48,0" stroke="#4e8d3a" stroke-width="7" fill="none"/>`, `<rect x="146" y="78" width="28" height="34" fill="#f5f0dc" stroke="#888"/>`, `<path d="M150,86 h20 M150,94 h20 M150,102 h20" stroke="#888" stroke-width="2"/>`);
f('Honduras', 3, 400, strisceH(400, ['#0073cf', C.bianco, '#0073cf']), stelleSparse([[200, 100, 9], [164, 86, 9], [236, 86, 9], [164, 114, 9], [236, 114, 9]], '#0073cf'));
f('El Salvador', 3, 355, strisceH(355, ['#0047ab', C.bianco, '#0047ab']), poli([[177, 80], [197, 116], [157, 116]], '#ffd700'), `<path d="M150,120 q27,20 54,0" stroke="#3a7d32" stroke-width="5" fill="none"/>`);
f('Nicaragua', 3, 333, strisceH(333, ['#0067c6', C.bianco, '#0067c6']), poli([[166, 80], [188, 116], [144, 116]], '#3ea0dd'), `<circle cx="166" cy="102" r="25" fill="none" stroke="#c8a400" stroke-width="3"/>`);
f('Repubblica Dominicana', 3, 300, r(0, 0, 130, 85, '#002d62'), r(170, 0, 130, 85, '#ce1126'), r(0, 115, 130, 85, '#ce1126'), r(170, 115, 130, 85, '#002d62'), r(130, 0, 40, 200, C.bianco), r(0, 85, 300, 30, C.bianco), scudo(150, 100, 26, 30, '#002d62', '#ce1126'));
f('Haiti', 3, 333, strisceH(333, ['#00209f', '#d21034']), r(126, 70, 80, 60, C.bianco), poli([[166, 76], [176, 116], [156, 116]], '#016a16'));
f('Trinidad e Tobago', 3, 333, sfondo(333, '#ce1126'), `<path d="M30,-10 L303,210" stroke="${C.bianco}" stroke-width="70"/>`, `<path d="M30,-10 L303,210" stroke="${C.nero}" stroke-width="50"/>`);
f('Bahamas', 3, 400, strisceH(400, ['#00abc9', '#fae042', '#00abc9']), poli([[0, 0], [170, 100], [0, 200]], C.nero));
f('Barbados', 3, 300, strisceV(300, ['#00267f', '#ffc726', '#00267f']), `<path d="M150,140 v-74 M126,72 q0,30 24,30 q24,0 24,-30" stroke="${C.nero}" stroke-width="8" fill="none"/>`);

// AFRICA
f('Egitto', 1, 300, strisceH(300, ['#ce1126', C.bianco, C.nero]), `<path d="M150,76 l-14,10 l-20,-6 l10,20 l10,4 v14 h28 v-14 l10,-4 l10,-20 l-20,6 z" fill="#c09300"/>`);
f('Marocco', 1, 300, sfondo(300, '#c1272d'), `<polygon points="150,62 172,130 114,88 186,88 128,130" fill="none" stroke="#006233" stroke-width="7" stroke-linejoin="round"/>`);
f('Algeria', 2, 300, strisceV(300, ['#006233', C.bianco]), luna(150, 100, 46, 12, '#d21034', C.bianco, 38), stella(168, 100, 18, '#d21034', -90));
f('Tunisia', 2, 300, sfondo(300, '#e70013'), cerchio(150, 100, 50, C.bianco), luna(140, 100, 37, 9, '#e70013', C.bianco, 30), stella(158, 100, 19, '#e70013', -90));
f('Libia', 3, 400, strisceH(400, ['#e70013', C.nero, '#239e46'], [1, 2, 1]), luna(190, 100, 30, 8, C.bianco, C.nero, 24), stella(222, 100, 13, C.bianco, -90));
f('Nigeria', 1, 400, strisceV(400, ['#008751', C.bianco, '#008751']));
f('Ghana', 2, 300, strisceH(300, ['#ce1126', '#fcd116', '#006b3f']), stella(150, 100, 30, C.nero));
f('Senegal', 2, 300, strisceV(300, ['#00853f', '#fdef42', '#e31b23']), stella(150, 100, 28, '#00853f'));
f('Mali', 3, 300, strisceV(300, ['#14b53a', '#fcd116', '#ce1126']));
f('Guinea', 3, 300, strisceV(300, ['#ce1126', '#fcd116', '#009460']));
f('Camerun', 2, 300, strisceV(300, ['#007a5e', '#ce1126', '#fcd116']), stella(150, 100, 24, '#fcd116'));
f('Costa d\'Avorio', 2, 300, strisceV(300, ['#f77f00', C.bianco, '#009e60']));
f('Ciad', 3, 300, strisceV(300, ['#002664', '#fecb00', '#c60c30']));
f('Niger', 3, 233, strisceH(233, ['#e05206', C.bianco, '#0db02b']), cerchio(116, 100, 22, '#e05206'));
f('Burkina Faso', 3, 300, strisceH(300, ['#ef2b2d', '#009e49']), stella(150, 100, 30, '#fcd116'));
f('Benin', 3, 300, r(0, 0, 120, 200, '#008751'), r(120, 0, 180, 100, '#fcd116'), r(120, 100, 180, 100, '#e8112d'));
f('Togo', 3, 324, strisceH(324, ['#006a4e', '#ffce00', '#006a4e', '#ffce00', '#006a4e']), r(0, 0, 120, 120, '#d21034'), stella(60, 60, 30, C.bianco));
f('Gabon', 3, 267, strisceH(267, ['#009e60', '#fcd116', '#3a75c4']));
f('Kenya', 2, 300, strisceH(300, [C.nero, C.bianco, '#bb0000', C.bianco, '#006600'], [6, 1, 6, 1, 6]), `<ellipse cx="150" cy="100" rx="24" ry="56" fill="#bb0000" stroke="${C.nero}" stroke-width="6"/>`, `<ellipse cx="150" cy="100" rx="8" ry="22" fill="${C.bianco}"/>`, `<path d="M118,40 L182,160 M182,40 L118,160" stroke="${C.bianco}" stroke-width="4"/>`);
f('Etiopia', 2, 400, strisceH(400, ['#078930', '#fcdd09', '#da121a']), cerchio(200, 100, 46, '#0f47af'), `<polygon points="200,64 220,124 168,86 232,86 180,124" fill="none" stroke="#fcdd09" stroke-width="5"/>`);
f('Sudafrica', 1, 300, r(0, 0, 300, 100, '#de3831'), r(0, 100, 300, 100, '#002395'), `<path d="M0,0 L130,100 L0,200 M130,100 H300" stroke="${C.bianco}" stroke-width="66" fill="none"/>`, `<path d="M0,0 L130,100 L0,200 M130,100 H300" stroke="#007a4d" stroke-width="40" fill="none"/>`, poli([[0, 30], [92, 100], [0, 170]], '#ffb612'), poli([[0, 48], [70, 100], [0, 152]], C.nero));
f('Tanzania', 3, 300, poli([[0, 0], [300, 0], [0, 200]], '#1eb53a'), poli([[300, 0], [300, 200], [0, 200]], '#00a3dd'), `<path d="M300,0 L0,200" stroke="#fcd116" stroke-width="64"/>`, `<path d="M300,0 L0,200" stroke="${C.nero}" stroke-width="44"/>`);
f('Uganda', 3, 300, strisceH(300, [C.nero, '#fcdc04', '#d90000', C.nero, '#fcdc04', '#d90000']), cerchio(150, 100, 38, C.bianco), cerchio(150, 92, 12, '#9ca69c'), `<path d="M150,104 v28" stroke="${C.nero}" stroke-width="4"/>`, cerchio(150, 82, 6, '#d90000'));
f('Ruanda', 3, 300, strisceH(300, ['#00a1de', '#fad201', '#20603d'], [2, 1, 1]), sole(244, 46, 14, '#fad201', 24, 1.8));
f('Repubblica Democratica del Congo', 3, 267, sfondo(267, '#007fff'), `<path d="M0,200 L267,0" stroke="#f7d618" stroke-width="56"/>`, `<path d="M0,200 L267,0" stroke="#ce1021" stroke-width="40"/>`, stella(50, 46, 30, '#f7d618'));
f('Angola', 3, 300, strisceH(300, ['#cc092f', C.nero]), `<path d="M128,80 a32,32 0 1 0 44,0" stroke="#ffcb00" stroke-width="9" fill="none"/>`, `<path d="M128,128 l46,-60" stroke="#ffcb00" stroke-width="8"/>`, stella(150, 90, 11, '#ffcb00'));
f('Mozambico', 3, 300, strisceH(300, ['#007168', C.bianco, C.nero, C.bianco, '#fce100'], [6, 1, 6, 1, 6]), poli([[0, 0], [130, 100], [0, 200]], '#d21034'), stella(46, 100, 24, '#fce100'));
f('Zimbabwe', 3, 400, strisceH(400, ['#319208', '#ffd200', '#de2010', C.nero, '#de2010', '#ffd200', '#319208']), poli([[0, 0], [170, 100], [0, 200]], C.bianco), `<polygon points="0,0 170,100 0,200" fill="none" stroke="${C.nero}" stroke-width="5"/>`, stella(56, 100, 30, '#de2010'), poli([[48, 82], [70, 82], [66, 120], [52, 120]], '#ffd200'));
f('Madagascar', 3, 300, r(0, 0, 100, 200, C.bianco), r(100, 0, 200, 100, '#fc3d32'), r(100, 100, 200, 100, '#007e3a'));
f('Somalia', 3, 300, sfondo(300, '#4189dd'), stella(150, 100, 46, C.bianco));
f('Sudan', 3, 400, strisceH(400, ['#d21034', C.bianco, C.nero]), poli([[0, 0], [140, 100], [0, 200]], '#007229'));
f('Botswana', 3, 300, sfondo(300, '#75aadb'), r(0, 80, 300, 40, C.bianco), r(0, 88, 300, 24, C.nero));
f('Namibia', 3, 300, poli([[0, 0], [300, 0], [0, 200]], '#003580'), poli([[300, 0], [300, 200], [0, 200]], '#009543'), `<path d="M0,200 L300,0" stroke="${C.bianco}" stroke-width="60"/>`, `<path d="M0,200 L300,0" stroke="#d21034" stroke-width="44"/>`, sole(60, 46, 16, '#ffce00', 12, 1.8));
f('Zambia', 3, 300, sfondo(300, '#198a00'), r(200, 70, 33, 130, '#de2010'), r(233, 70, 33, 130, C.nero), r(266, 70, 34, 130, '#ef7d00'), `<path d="M210,48 q22,-22 44,0 q-22,-8 -44,0" fill="#ef7d00" stroke="#ef7d00" stroke-width="6"/>`);
f('Liberia', 3, 380, strisceH(380, Array.from({ length: 11 }, (_, i) => (i % 2 ? C.bianco : '#bf0a30'))), r(0, 0, 91, 91, '#002868'), stella(45, 45, 24, C.bianco));
f('Sierra Leone', 3, 300, strisceH(300, ['#1eb53a', C.bianco, '#0072c6']));
f('Gambia', 3, 300, strisceH(300, ['#ce1126', C.bianco, '#0c1c8c', C.bianco, '#3a7728'], [6, 1, 4, 1, 6]));
f('Capo Verde', 3, 340, sfondo(340, '#003893'), r(0, 110, 340, 40, C.bianco), r(0, 123, 340, 14, '#cf2027'), Array.from({ length: 10 }, (_, k) => stella(126 + Math.sin((k / 10) * Math.PI * 2) * 40, 130 - Math.cos((k / 10) * Math.PI * 2) * 40, 8, '#f7d116')).join(''));
f('Mauritius', 3, 300, strisceH(300, ['#ea2839', '#1a206d', '#ffd500', '#00a551']));

// ASIA
f('Cina', 1, 300, sfondo(300, '#ee1c25'), stella(50, 50, 30, '#ffff00'), stella(100, 20, 10, '#ffff00', 23), stella(120, 40, 10, '#ffff00', 45), stella(120, 70, 10, '#ffff00', 70), stella(100, 90, 10, '#ffff00', 21));
f('Giappone', 1, 300, sfondo(300, C.bianco), cerchio(150, 100, 60, '#bc002d'));
{
  const tri = (righe) => righe.map((rotta, k) => (rotta ? r(-15, -14 + k * 11, 13, 7, C.nero) + r(2, -14 + k * 11, 13, 7, C.nero) : r(-15, -14 + k * 11, 30, 7, C.nero))).join('');
  const a = 33.7;
  const posa = (s, ang) => `<g transform="translate(150 100) rotate(${ang}) translate(0 -78)">${s}</g>`;
  f('Corea del Sud', 1, 300, sfondo(300, C.bianco),
    `<g transform="rotate(${a} 150 100)"><circle cx="150" cy="100" r="50" fill="#003478"/><path d="M100,100 a50,50 0 0 1 100,0 a25,25 0 0 1 -50,0 a25,25 0 0 0 -50,0" fill="#c60c30"/></g>`,
    posa(tri([0, 0, 0]), -a), posa(tri([1, 0, 1]), a), posa(tri([0, 1, 0]), 180 + a), posa(tri([1, 1, 1]), 180 - a));
}
f('Corea del Nord', 2, 400, strisceH(400, ['#024fa2', C.bianco, '#ed1c27', C.bianco, '#024fa2'], [6, 1, 17, 1, 6]), cerchio(140, 100, 40, C.bianco), stella(140, 100, 38, '#ed1c27'));
f('India', 1, 300, strisceH(300, ['#ff9933', C.bianco, '#138808']), `<circle cx="150" cy="100" r="25" fill="none" stroke="#000080" stroke-width="4"/>`, `<g stroke="#000080" stroke-width="1.6">${Array.from({ length: 12 }, (_, k) => `<line x1="${150 + 25 * Math.cos((k * Math.PI) / 12)}" y1="${100 + 25 * Math.sin((k * Math.PI) / 12)}" x2="${150 - 25 * Math.cos((k * Math.PI) / 12)}" y2="${100 - 25 * Math.sin((k * Math.PI) / 12)}"/>`).join('')}</g>`);
f('Pakistan', 2, 300, sfondo(300, '#01411c'), r(0, 0, 75, 200, C.bianco), luna(190, 100, 52, -16, C.bianco, '#01411c', 44), giro(stella(208, 70, 16, C.bianco), 30, 208, 70));
f('Bangladesh', 2, 333, sfondo(333, '#006a4e'), cerchio(150, 100, 66, '#f42a41'));
f('Indonesia', 2, 300, strisceH(300, ['#ce1126', C.bianco]));
f('Thailandia', 2, 300, strisceH(300, ['#a51931', C.bianco, '#2d2a4a', C.bianco, '#a51931'], [1, 1, 2, 1, 1]));
f('Vietnam', 1, 300, sfondo(300, '#da251d'), stella(150, 100, 60, '#ffff00'));
f('Filippine', 2, 400, strisceH(400, ['#0038a8', '#ce1126']), poli([[0, 0], [173, 100], [0, 200]], C.bianco), sole(58, 100, 16, '#fcd116', 8, 2), stelleSparse([[14, 22, 8], [14, 178, 8], [146, 100, 8]], '#fcd116'));
f('Malesia', 2, 400, strisceH(400, Array.from({ length: 14 }, (_, i) => (i % 2 ? C.bianco : '#cc0001'))), r(0, 0, 200, 114, '#010066'), luna(70, 57, 40, 10, '#ffcc00', '#010066', 34), stella(135, 57, 30, '#ffcc00', 0, 14, 0.45));
f('Singapore', 2, 300, strisceH(300, ['#ef3340', C.bianco]), luna(56, 50, 34, 14, C.bianco, '#ef3340', 31), stelleSparse([[96, 26, 7], [80, 40, 7], [112, 40, 7], [86, 60, 7], [106, 60, 7]], C.bianco));
f('Arabia Saudita', 2, 300, sfondo(300, '#006c35'), scritta(80, 84, 140, C.bianco), scritta(90, 104, 120, C.bianco), `<path d="M80,136 h134 l8,-5" stroke="${C.bianco}" stroke-width="6" fill="none"/>`);
f('Emirati Arabi Uniti', 2, 400, strisceH(400, ['#00732f', C.bianco, C.nero]), r(0, 0, 100, 200, '#ff0000'));
f('Qatar', 3, 500, sfondo(500, '#8a1538'), poli([[0, 0], [140, 0], ...Array.from({ length: 17 }, (_, k) => [k % 2 ? 175 : 140, (200 / 18) * (k + 1)]), [140, 200], [0, 200]], C.bianco));
f('Bahrein', 3, 333, sfondo(333, '#ce1126'), poli([[0, 0], [100, 0], ...Array.from({ length: 9 }, (_, k) => [k % 2 ? 100 : 140, 20 * (k + 1)]), [100, 200], [0, 200]], C.bianco));
f('Kuwait', 3, 400, strisceH(400, ['#007a3d', C.bianco, '#ce1126']), poli([[0, 0], [100, 66], [100, 133], [0, 200]], C.nero));
f('Oman', 3, 400, strisceH(400, [C.bianco, '#db161b', '#008000']), r(0, 0, 100, 200, '#db161b'), `<path d="M30,30 l40,40 M70,30 l-40,40" stroke="${C.bianco}" stroke-width="5"/>`, r(46, 30, 8, 44, C.bianco));
f('Yemen', 3, 300, strisceH(300, ['#ce1126', C.bianco, C.nero]));
f('Iraq', 3, 300, strisceH(300, ['#ce1126', C.bianco, C.nero]), scritta(105, 102, 90, '#007a3d'));
f('Siria', 3, 300, strisceH(300, ['#ce1126', C.bianco, C.nero]), stella(110, 100, 18, '#007a3d'), stella(190, 100, 18, '#007a3d'));
f('Giordania', 3, 400, strisceH(400, [C.nero, C.bianco, '#007a3d']), poli([[0, 0], [200, 100], [0, 200]], '#ce1126'), stella(66, 100, 18, C.bianco, 0, 7));
f('Israele', 1, 275, sfondo(275, C.bianco), r(0, 20, 275, 30, '#0038b8'), r(0, 150, 275, 30, '#0038b8'), `<g fill="none" stroke="#0038b8" stroke-width="7"><polygon points="137,62 168,116 106,116"/><polygon points="137,138 106,84 168,84"/></g>`);
f('Iran', 2, 350, strisceH(350, ['#239f40', C.bianco, '#da0000']), `<path d="M175,80 q-20,20 0,40 q20,-20 0,-40 M160,86 q-10,14 6,30 M190,86 q10,14 -6,30" stroke="#da0000" stroke-width="5" fill="none"/>`, `<path d="M0,66 h350 M0,134 h350" stroke="${C.bianco}" stroke-width="3" stroke-dasharray="10 6"/>`);
f('Libano', 2, 300, strisceH(300, ['#ed1c24', C.bianco, '#ed1c24'], [1, 2, 1]), poli([[150, 56], [184, 104], [166, 104], [194, 136], [106, 136], [134, 104], [116, 104]], '#00a651'), r(145, 136, 10, 10, '#00a651'));
f('Nepal', 2, 245, `<path d="M4,4 L200,96 H72 L196,196 H4 Z" fill="#dc143c" stroke="#003893" stroke-width="8" stroke-linejoin="round"/>`, luna(56, 80, 26, 0, C.bianco, '#dc143c', 0), `<path d="M34,70 a24,20 0 0 0 44,0 a22,14 0 0 1 -44,0" fill="${C.bianco}"/>`, sole(58, 150, 16, C.bianco, 12, 1.6));
f('Bhutan', 3, 300, poli([[0, 0], [300, 0], [0, 200]], '#ffd520'), poli([[300, 0], [300, 200], [0, 200]], '#ff4e12'), `<path d="M90,140 q30,-60 70,-40 q40,20 60,-40" stroke="${C.bianco}" stroke-width="16" fill="none" stroke-linecap="round"/>`);
f('Mongolia', 3, 400, strisceV(400, ['#c4272f', '#015197', '#c4272f']), cerchio(66, 68, 12, '#f9cf02'), r(50, 88, 32, 8, '#f9cf02'), r(50, 150, 32, 8, '#f9cf02'), r(40, 88, 8, 70, '#f9cf02'), r(84, 88, 8, 70, '#f9cf02'), `<path d="M66,104 a12,12 0 0 1 0,24 a12,12 0 0 0 0,24" stroke="#f9cf02" stroke-width="6" fill="none"/>`);
f('Kazakistan', 3, 400, sfondo(400, '#00afca'), sole(210, 82, 30, '#fec50c', 32, 1.5), `<path d="M150,134 q60,-30 120,0 q-60,-10 -120,0" fill="#fec50c" stroke="#fec50c" stroke-width="6"/>`, r(20, 0, 14, 200, '#fec50c'));
f('Uzbekistan', 3, 400, strisceH(400, ['#0099b5', '#ce1126', C.bianco, '#ce1126', '#1eb53a'], [31, 2, 31, 2, 31]), luna(48, 32, 22, 8, C.bianco, '#0099b5', 19), stelleSparse([[96, 22, 5], [116, 22, 5], [136, 22, 5], [116, 42, 5], [136, 42, 5], [96, 42, 5], [136, 62, 5]], C.bianco));
f('Laos', 3, 300, strisceH(300, ['#ce1126', '#002868', '#ce1126'], [1, 2, 1]), cerchio(150, 100, 40, C.bianco));
f('Cambogia', 3, 300, strisceH(300, ['#032ea1', '#e00025', '#032ea1'], [1, 2, 1]), poli([[96, 138], [96, 112], [112, 112], [118, 84], [130, 84], [138, 62], [150, 50], [162, 62], [170, 84], [182, 84], [188, 112], [204, 112], [204, 138]], C.bianco));
f('Myanmar', 3, 300, strisceH(300, ['#fecb00', '#34b233', '#ea2839']), stella(150, 108, 66, C.bianco));
f('Afghanistan', 3, 300, strisceV(300, [C.nero, '#d32011', '#007a36']), cerchio(150, 100, 34, C.bianco), cerchio(150, 100, 28, '#d32011'), r(138, 88, 24, 22, C.bianco));
f('Sri Lanka', 3, 400, sfondo(400, '#ffbe29'), r(12, 12, 50, 176, '#00534e'), r(62, 12, 50, 176, '#eb7400'), r(124, 12, 264, 176, '#8d153a'), `<path d="M190,140 q20,-60 60,-50 q30,-30 60,0 v60 h-20 v-30 q-30,10 -50,-6 v36 z" fill="#ffbe29"/>`, r(330, 40, 6, 110, '#ffbe29'));

// OCEANIA
f('Australia', 1, 400, sfondo(400, '#00008b'), unionJack(0, 0, 200, 100), stella(100, 150, 30, C.bianco, 0, 7, 0.45), stella(300, 170, 14, C.bianco, 0, 7, 0.45), stella(250, 88, 13, C.bianco, 0, 7, 0.45), stella(300, 30, 13, C.bianco, 0, 7, 0.45), stella(345, 78, 13, C.bianco, 0, 7, 0.45), stella(325, 110, 7, C.bianco));
f('Nuova Zelanda', 1, 400, sfondo(400, '#012169'), unionJack(0, 0, 200, 100), ...[[300, 168, 16], [252, 92, 14], [300, 40, 13], [346, 82, 14]].map(([x, y, R]) => stella(x, y, R, C.bianco) + stella(x, y, R * 0.72, '#c8102e')));
f('Figi', 3, 400, sfondo(400, '#68bfe5'), unionJack(0, 0, 200, 100), scudo(300, 110, 70, 86, C.bianco, '#c8102e', r(265, 67, 70, 18, '#c8102e')));
f('Papua Nuova Guinea', 3, 267, poli([[0, 0], [267, 200], [0, 200]], C.nero), poli([[0, 0], [267, 0], [267, 200]], '#ce1126'), stelleSparse([[66, 110, 10], [40, 140, 9], [92, 140, 9], [66, 176, 10], [76, 150, 5]], C.bianco), `<path d="M150,70 q30,-30 70,-20 q-20,10 -30,30 q-20,0 -40,-10" fill="#fcd116"/>`);
f('Samoa', 3, 400, sfondo(400, '#ce1126'), r(0, 0, 200, 100, '#002b7f'), stelleSparse([[100, 22, 12], [70, 48, 12], [130, 44, 10], [100, 80, 13], [116, 60, 6]], C.bianco));
f('Palau', 3, 320, sfondo(320, '#4aadd6'), cerchio(140, 100, 60, '#ffde00'));
f('Tonga', 3, 400, sfondo(400, '#c10000'), r(0, 0, 166, 100, C.bianco), r(70, 18, 26, 64, '#c10000'), r(51, 37, 64, 26, '#c10000'));

const PAESI = B.map((b, i) => ({ ...b, id: i }));
module.exports = { PAESI };
