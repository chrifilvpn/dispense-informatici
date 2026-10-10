// "ANNULLA MOSSA" contro il computer, per i giochi a turni in due (dama, forza 4, tris…).
// Prima di ogni mossa della persona si salva una copia dei campi che descrivono la partita; "annulla" torna a prima
// della sua ultima mossa (si annulla anche la risposta del computer). Con un'altra persona non si può.
function prepara(g, bot, campi) {
  g.annBot = [bot && bot[0] ? bot[0] : null, bot && bot[1] ? bot[1] : null];
  g.annCampi = campi;
  g.annIndietro = [];
  g.annullate = 0;
}
const controIlComputer = (g, p) => !!(g.annBot && !g.annBot[p] && g.annBot[1 - p]);
function salva(g, p) {
  if (!controIlComputer(g, p)) return;
  const f = {};
  for (const k of g.annCampi) f[k] = structuredClone(g[k]);
  g.annIndietro.push({ p, f });
  if (g.annIndietro.length > 300) g.annIndietro.shift();
}
const puo = (g, p) => !g.finita && controIlComputer(g, p) && g.annIndietro.some((x) => x.p === p);
function annulla(g, p) {
  if (!puo(g, p)) return { errore: 'Puoi annullare solo contro il computer, dopo una tua mossa' };
  let x; do { x = g.annIndietro.pop(); } while (x && x.p !== p);
  Object.assign(g, x.f);
  g.annullate++;
  if (g.annuncia) g.annuncia(p, 'annulla la mossa', 'mossa annullata ↶');
  return { ok: true };
}
module.exports = { prepara, salva, puo, annulla };
