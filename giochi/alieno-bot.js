// CHI È L'ALIENO: i COMPUTER. Si muovono sulla mappa a caselle cercando la strada più corta (una "mappa delle
// distanze" calcolata una volta per ogni postazione), fanno i compiti, ricordano chi hanno visto e dove, e nelle
// riunioni parlano e votano. Gli Alieni fingono i compiti ed eliminano solo quando nessuno li vede (il facile è
// imprudente, il difficile aspetta il momento giusto e a volte segnala lui stesso il corpo per sembrare innocente).
// Livelli: facile = lento, distratto, si fida di tutto; medio = attento; difficile = osserva tutto e ragiona.
const LIV = {
  facile: { nota: 0.6, reazione: 1.6, extra: [2.5, 6], soglia: 1, caso: 0.25, testimone: 0.6, prudenza: 1, parla: 1 },
  medio: { nota: 0.9, reazione: 0.7, extra: [0.8, 3], soglia: 1.5, caso: 0.08, testimone: 0.85, prudenza: 0, parla: 2 },
  difficile: { nota: 1, reazione: 0.25, extra: [0.3, 1.4], soglia: 2, caso: 0, testimone: 1, prudenza: 0, parla: 2 },
};
const caso = (a, b) => a + Math.random() * (b - a);
const pesca = (a) => a[Math.floor(Math.random() * a.length)];

// ---------------- strade: mappe delle distanze (in caselle) verso una casella ----------------
const CACHE = new WeakMap(); // mappa → { chiave: Int16Array }
function libera(M, c, r) { const k = M.mappa[r] && M.mappa[r][c]; return k !== undefined && k !== '#' && k !== 'M'; }
// distanze da ogni casella verso le caselle libere vicine a (c, r) (la postazione può stare dentro un mobile)
function distanze(M, c, r, COLS, RIGHE) {
  let cache = CACHE.get(M); if (!cache) { cache = {}; CACHE.set(M, cache); }
  const chiave = `${c},${r}`;
  if (cache[chiave]) return cache[chiave];
  const d = new Int16Array(COLS * RIGHE).fill(-1), coda = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (libera(M, c + dc, r + dr)) { d[(r + dr) * COLS + c + dc] = 0; coda.push([c + dc, r + dr]); }
  }
  for (let i = 0; i < coda.length; i++) {
    const [x, y] = coda[i], v = d[y * COLS + x];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= RIGHE || d[ny * COLS + nx] >= 0 || !libera(M, nx, ny)) continue;
      d[ny * COLS + nx] = v + 1; coda.push([nx, ny]);
    }
  }
  cache[chiave] = d;
  return d;
}

class Menti {
  constructor(g, consts) {
    this.g = g;
    Object.assign(this, consts); // T, COLS, RIGHE, RAGGI…
    this.m = Array.from({ length: g.n }, () => this.nuova());
  }
  nuova() { return { meta: null, attesa: 0, compitoFino: 0, visti: {}, sosp: {}, testimone: null, ultimo: null, fermo: 0, finta: null, scappa: 0, parlare: [], voto: null, autoSegnala: null }; }
  liv(p) { return LIV[this.g.bot[p]] || LIV.medio; }

  // ---------------- movimento ----------------
  // direzione verso il punto (x, y): segue la mappa delle distanze casella per casella (i fantasmi vanno dritti)
  vai(p, x, y) {
    const g = this.g, e = g.e[p], T = this.T;
    const dx0 = x - e.x, dy0 = y - e.y, l0 = Math.hypot(dx0, dy0);
    if (l0 < 8) return { x: 0, y: 0 };
    if (!e.vivo || this.passaggio(e, x, y)) {
      // in vista: dritto (con un piccolo aggiustamento se è incastrato)
      return this.sblocca(p, { x: dx0 / l0, y: dy0 / l0 });
    }
    const d = distanze(g.M, Math.floor(x / T), Math.floor(y / T), this.COLS, this.RIGHE);
    const c = Math.floor(e.x / T), r = Math.floor(e.y / T);
    let meglio = null, dm = d[r * this.COLS + c] >= 0 ? d[r * this.COLS + c] : 1e9;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const v = d[(r + dy) * this.COLS + c + dx];
      if (v >= 0 && v < dm) { dm = v; meglio = [c + dx, r + dy]; }
    }
    if (!meglio) return this.sblocca(p, { x: dx0 / l0, y: dy0 / l0 });
    const tx = meglio[0] * T + T / 2, ty = meglio[1] * T + T / 2, l = Math.hypot(tx - e.x, ty - e.y) || 1;
    return this.sblocca(p, { x: (tx - e.x) / l, y: (ty - e.y) / l });
  }
  // si può andare dritti da e a (x, y)? Né muri né mobili lungo la strada, tenendo conto della larghezza del corpo
  passaggio(e, x, y) {
    const g = this.g, dx = x - e.x, dy = y - e.y, l = Math.hypot(dx, dy);
    if (l > 600) return false;
    const nx = -dy / (l || 1), ny = dx / (l || 1), n = Math.ceil(l / 8);
    for (let k = 1; k <= n; k++) {
      const px = e.x + (dx * k) / n, py = e.y + (dy * k) / n;
      for (const o of [-16, 0, 16]) if (g.solido(px + nx * o, py + ny * o)) return false;
    }
    return true;
  }
  // se da un po' non si avvicina alla meta (spigolo, mobile, un altro giocatore), prova una direzione di lato
  sblocca(p, v) {
    const m = this.m[p], e = this.g.e[p];
    const t = this.g.tempoRound;
    if (m.lato && t < m.lato.fino) return m.lato.v;
    // ogni secondo si controlla se si è fatta strada
    if (!m.ultimo || t - m.ultimo.t >= 1) {
      const mosso = m.ultimo ? Math.hypot(e.x - m.ultimo.x, e.y - m.ultimo.y) : 99;
      m.fermo = mosso < 25 ? m.fermo + 1 : 0;
      m.ultimo = { x: e.x, y: e.y, t };
      if (m.fermo >= 2) { const a = Math.random() * Math.PI * 2; m.lato = { v: { x: Math.cos(a), y: Math.sin(a) }, fino: t + 0.6 }; m.fermo = 0; return m.lato.v; }
    }
    return v;
  }
  postazione(id) { const st = this.g.stazione(id); return st && { x: st.t[0] * this.T + this.T / 2, y: st.t[1] * this.T + this.T / 2 }; }
  // la prossima postazione: la più vicina tra i compiti da fare (per gli Alieni, finti, scelti un po' a caso)
  prossimoCompito(p) {
    const e = this.g.e[p];
    const da = e.compiti.filter((c) => !c.fatto);
    if (!da.length) return null;
    return da.map((c) => ({ c, q: this.postazione(c.st) })).filter((x) => x.q).sort((a, b) => Math.hypot(a.q.x - e.x, a.q.y - e.y) - Math.hypot(b.q.x - e.x, b.q.y - e.y))[0] || null;
  }

  // ---------------- ogni tick: memoria di cosa si vede ----------------
  osserva(p, t) {
    const g = this.g, e = g.e[p], m = this.m[p];
    if (!e.vivo) return;
    const vis = g.e.filter((o) => o.id !== p && o.vivo && g.vede(e, o));
    for (const o of vis) m.visti[o.id] = { t, x: o.x, y: o.y, stanza: g.stanzaDi(o.x, o.y) };
    // chi stava insieme a chi (vicini, lontano da me): se poi uno dei due viene trovato morto, l'altro è sospetto
    m.insieme = m.insieme || {};
    for (const a of vis) for (const b of vis) if (a.id < b.id && Math.hypot(a.x - b.x, a.y - b.y) < 170) { m.insieme[`${a.id},${b.id}`] = { t, stanza: g.stanzaDi(a.x, a.y) }; }
  }
  // un'eliminazione appena fatta: chi la vede (e se ne accorge) sa chi è stato
  eliminazione(killer, vittima) {
    const g = this.g;
    for (const o of g.e) {
      if (!g.bot[o.id] || !o.vivo || o.alieno || o.id === vittima.id) continue;
      if (g.vede(o, g.e[killer]) && Math.random() < this.liv(o.id).testimone) { this.m[o.id].testimone = { chi: killer, vittima: vittima.id, stanza: g.stanzaDi(vittima.x, vittima.y) }; this.m[o.id].sosp[killer] = (this.m[o.id].sosp[killer] || 0) + 10; }
    }
  }

  // ---------------- decisioni nel gioco libero ----------------
  pensa(p, ora) {
    const g = this.g, e = g.e[p], m = this.m[p], L = this.liv(p), t = g.tempoRound;
    if (g.fase2 === 'voto') { this.vota(p, t); return { x: 0, y: 0 }; }
    if (g.fase2 !== 'libero') return { x: 0, y: 0 };
    if (m.attesa > t) return { x: 0, y: 0 };
    // compito in corso: si finisce dopo il tempo minimo più un po' (il facile è lento)
    if (e.compito) {
      if (t >= m.compitoFino) { const r = g.azione(p, { tipo: 'finito', id: e.compito.id }); if (r.errore) m.compitoFino = t + 0.5; }
      return { x: 0, y: 0 };
    }
    if (!e.alieno && e.vivo) { const v = this.equipaggio(p, t, L); if (v) return v; }
    if (e.alieno && e.vivo) { const v = this.alieno(p, t, L); if (v) return v; }
    // compiti (veri o finti); i fantasmi continuano a fare i loro
    const prossimo = this.prossimoCompito(p);
    if (!prossimo) return this.gironzola(p, t);
    const d = Math.hypot(prossimo.q.x - e.x, prossimo.q.y - e.y);
    if (d < this.RAGGI.compito - 12) {
      if (g.azione(p, { tipo: 'inizia', id: prossimo.c.st }).ok) {
        const st = g.stazione(prossimo.c.st);
        const minimo = st.tipo === 'consegna' ? 3 : this.MIN[st.livello] || 5;
        m.compitoFino = t + minimo + caso(...L.extra);
      }
      return { x: 0, y: 0 };
    }
    return this.vai(p, prossimo.q.x, prossimo.q.y);
  }
  // senza compiti: va verso altri giocatori (in compagnia si è più al sicuro) o verso una stanza a caso
  gironzola(p, t) {
    const m = this.m[p], g = this.g, e = g.e[p];
    if (!m.meta || t > m.metaFino || Math.hypot(m.meta.x - e.x, m.meta.y - e.y) < 20) {
      const st = pesca(g.M.stazioni);
      m.meta = this.postazione(st.id); m.metaFino = t + caso(8, 18);
    }
    return this.vai(p, m.meta.x, m.meta.y);
  }
  equipaggio(p, t, L) {
    const g = this.g, e = g.e[p], m = this.m[p];
    // un corpo in vista: ci si avvicina e si segnala (dopo il tempo di reazione; il facile a volte non se ne accorge)
    const corpo = g.corpi.find((c) => g.vede(e, c));
    if (corpo) {
      if (m.corpoVisto !== corpo) { m.corpoVisto = corpo; m.notato = Math.random() < L.nota; m.segnalaDa = t + L.reazione; }
      if (m.notato) {
        if (Math.hypot(corpo.x - e.x, corpo.y - e.y) < this.RAGGI.segnala - 15) {
          if (t >= m.segnalaDa) { this.sospettiDalCorpo(p, corpo, t); g.azione(p, { tipo: 'segnala' }); return { x: 0, y: 0 }; }
          return { x: 0, y: 0 };
        }
        return this.vai(p, corpo.x, corpo.y);
      }
    }
    // ha visto un'eliminazione ma il corpo non c'è più in vista: corre al pulsante (se può usarlo)
    if (m.testimone && e.riunioni > 0) {
      const q = g.M.pulsante;
      if (Math.hypot(q.x - e.x, q.y - e.y) < this.RAGGI.pulsante - 15) { if (g.pulsanteDa <= 0) g.azione(p, { tipo: 'riunione' }); return { x: 0, y: 0 }; }
      return this.vai(p, q.x, q.y);
    }
    return null;
  }
  // chi era vicino al corpo poco prima diventa sospetto (il difficile ricorda meglio e più a lungo)
  sospettiDalCorpo(p, corpo, t) {
    const m = this.m[p], L = this.liv(p);
    const finestra = L === LIV.difficile ? 25 : L === LIV.medio ? 15 : 8;
    for (const [id, v] of Object.entries(m.visti)) {
      if (Number(id) === corpo.di || !this.g.e[id].vivo) continue;
      const d = Math.hypot(v.x - corpo.x, v.y - corpo.y);
      if (t - v.t < finestra && d < 420) m.sosp[id] = (m.sosp[id] || 0) + 2 * (1 - (t - v.t) / (finestra * 1.5));
      // l'ultimo visto con la vittima (il difficile ricorda di più)
      const ins = m.insieme && m.insieme[[Number(id), corpo.di].sort((x, y) => x - y).join(',')];
      if (ins && t - ins.t < finestra * 1.6) { m.sosp[id] = (m.sosp[id] || 0) + 3; m.conVittima = { chi: Number(id), vittima: corpo.di, stanza: ins.stanza }; }
      // alibi: visto da poco lontano dal corpo → difficilmente è stato lui
      else if (t - v.t < finestra && d > 650) m.sosp[id] = (m.sosp[id] || 0) - 1.5;
    }
  }
  alieno(p, t, L) {
    const g = this.g, e = g.e[p], m = this.m[p];
    // dopo un'eliminazione: via dalla scena (il difficile a volte torna a segnalare il corpo per sembrare innocente)
    if (m.autoSegnala && t >= m.autoSegnala.quando) {
      const c = g.corpi.find((q) => q.di === m.autoSegnala.di);
      m.autoSegnala = c && Math.hypot(c.x - e.x, c.y - e.y) < this.RAGGI.segnala - 15 ? (g.azione(p, { tipo: 'segnala' }), null) : c ? m.autoSegnala : null;
      if (c && m.autoSegnala) return this.vai(p, c.x, c.y);
    }
    if (m.scappa > t && m.meta) return this.vai(p, m.meta.x, m.meta.y);
    if (e.prontoUccidi > 0) return null;
    const umani = g.e.filter((o) => o.vivo && !o.alieno);
    // un bersaglio vicino e (se si è prudenti) nessun testimone
    const testimoni = (v) => g.e.filter((o) => o.vivo && !o.alieno && o.id !== v.id && (g.vede(o, e) || g.vede(o, v))).length;
    const vicini = umani.filter((o) => g.vede(e, o)).sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y));
    for (const v of vicini) {
      const d = Math.hypot(v.x - e.x, v.y - e.y);
      const ok = testimoni(v) <= L.prudenza && !(L === LIV.difficile && umani.some((o) => o.id !== v.id && Math.hypot(o.x - e.x, o.y - e.y) < 420));
      if (!ok) continue;
      if (d < this.RAGGI.uccidi - 12) {
        if (g.azione(p, { tipo: 'uccidi' }).ok) {
          // si scappa verso una postazione lontana
          const lontana = [...g.M.stazioni].sort((a, b) => Math.hypot(b.t[0] * this.T - e.x, b.t[1] * this.T - e.y) - Math.hypot(a.t[0] * this.T - e.x, a.t[1] * this.T - e.y))[Math.floor(Math.random() * 3)];
          m.meta = this.postazione(lontana.id); m.scappa = t + caso(5, 9);
          if (L === LIV.difficile && Math.random() < 0.18) m.autoSegnala = { di: v.id, quando: t + caso(2, 4) };
          return { x: 0, y: 0 };
        }
      }
      return this.vai(p, v.x, v.y); // si avvicina alla vittima
    }
    return null;
  }

  // ---------------- riunioni: chat e voto ----------------
  riunione(tipo, da, corpo) {
    const g = this.g, t = g.tempoRound;
    for (const o of g.e) {
      if (!g.bot[o.id] || !o.vivo) continue;
      const m = this.m[o.id], L = this.liv(o.id);
      m.voto = { quando: null, fatto: false };
      m.parlare = this.cosaDire(o.id, tipo, da, corpo).slice(0, L.parla).map((testo, k) => ({ testo, quando: t + caso(2, 10) + k * caso(5, 9) }));
    }
  }
  // le frasi del computer (i nomi si scrivono @numero: il server li sostituisce con il nome vero)
  cosaDire(p, tipo, da, corpo) {
    const g = this.g, e = g.e[p], m = this.m[p];
    const qui = g.stanzaDi(e.x, e.y), frasi = [];
    const sospetto = this.piuSospetto(p);
    if (!e.alieno) {
      if (m.testimone && g.e[m.testimone.chi].vivo) frasi.push(pesca([`Ho visto @${m.testimone.chi} eliminare @${m.testimone.vittima} in ${m.testimone.stanza}! È l'Alieno!`, `È @${m.testimone.chi}! L'ho visto con i miei occhi in ${m.testimone.stanza}`]));
      else if (tipo === 'corpo' && da === p) frasi.push(`Ho trovato @${corpo} in ${g.corpi.length ? qui : 'questa stanza'}.`);
      if (m.conVittima && m.conVittima.chi === sospetto && g.e[sospetto].vivo) frasi.push(`Ho visto @${sospetto} con @${m.conVittima.vittima} in ${m.conVittima.stanza} poco prima!`);
      else if (sospetto !== null && !(m.testimone && m.testimone.chi === sospetto)) {
        const v = m.visti[sospetto];
        frasi.push(v ? pesca([`@${sospetto} era vicino, in ${v.stanza}… sospetto`, `Io voto @${sospetto}: era in ${v.stanza} poco prima`]) : `Mi sembra sospetto @${sospetto}`);
      }
      // un alibi: con chi ero (aiuta a scagionare)
      const conMe = Object.entries(m.visti).filter(([id, v]) => this.g.e[id].vivo && Number(id) !== sospetto && this.g.tempoRound - v.t < 6).map(([id]) => Number(id));
      if (conMe.length && frasi.length < 2) frasi.push(`Io ero con @${conMe[0]} in ${m.visti[conMe[0]].stanza}`);
      if (!frasi.length) frasi.push(pesca([`Io ero in ${qui} a fare i compiti, non ho visto niente`, 'Non ho visto niente, salto il voto', `Ero in ${qui}. Qualcuno ha visto qualcosa?`, 'Non ho prove: meglio non espellere a caso']));
    } else {
      // l'Alieno mente: dice dov'era "facendo i compiti", accusa chi l'accusa o chi ha segnalato, o resta sul vago
      const compagno = g.e.find((o) => o.alieno && o.vivo && o.id !== p);
      frasi.push(compagno && this.liv(p) === LIV.difficile && Math.random() < 0.5 ? `Io ero con @${compagno.id} in ${qui}` : pesca([`Io ero in ${qui} a fare i compiti`, `Ero in ${qui}, tutto tranquillo`, `Ho appena finito un compito in ${qui}`]));
      const accusatori = Object.keys(m.accusato || {}).map(Number).filter((i) => g.e[i].vivo && !g.e[i].alieno);
      const bersaglio = accusatori.length ? accusatori[0] : tipo === 'corpo' && da !== p && !g.e[da].alieno && Math.random() < 0.4 ? da : null;
      if (bersaglio !== null) frasi.push(pesca([`@${bersaglio} è strano, l'ho visto girare da solo`, `Secondo me è @${bersaglio}`, `@${bersaglio} sta accusando a caso: sospetto`]));
    }
    return frasi;
  }
  // un'accusa letta in chat (di una persona o di un computer): fa salire il sospetto verso chi è nominato
  accusa(da, contro, peso = 1) {
    const g = this.g;
    if (!g.e[contro] || da === contro) return;
    for (const o of g.e) {
      if (!g.bot[o.id] || o.id === contro || o.id === da) continue;
      const m = this.m[o.id];
      if (o.alieno) { if (g.e[contro].alieno) { m.accusato = m.accusato || {}; m.accusato[da] = 1; } continue; } // un Alieno ricorda chi accusa i suoi
      // chi accusa un compagno che noi sappiamo innocente (noi stessi) diventa un po' sospetto
      m.sosp[contro] = (m.sosp[contro] || 0) + peso * (this.liv(o.id) === LIV.facile ? 1.3 : 0.8);
    }
    const bot = this.g.bot[contro] && this.m[contro];
    if (bot && !this.g.e[contro].alieno) bot.sosp[da] = (bot.sosp[da] || 0) + 0.7; // chi mi accusa ingiustamente mi insospettisce
  }
  // "ero con X": chi si fida abbassa il sospetto su X (e su chi parla); il difficile si fida meno di chi è sospetto
  scagiona(da, chi) {
    for (const o of this.g.e) {
      if (!this.g.bot[o.id] || o.alieno || o.id === chi) continue;
      const m = this.m[o.id];
      if ((m.sosp[da] || 0) >= 2 && this.liv(o.id) !== LIV.facile) continue;
      m.sosp[chi] = (m.sosp[chi] || 0) - 0.8; m.sosp[da] = (m.sosp[da] || 0) - 0.4;
    }
  }
  piuSospetto(p) {
    const g = this.g, m = this.m[p];
    let meglio = null, v = 0;
    for (const [id, s] of Object.entries(m.sosp)) if (Number(id) !== p && g.e[id].vivo && s > v) { v = s; meglio = Number(id); }
    return meglio !== null && v >= this.liv(p).soglia ? meglio : null;
  }
  // parlano durante la discussione e il voto (una frase per volta, a tempi diversi)
  chiacchiera(t) {
    const g = this.g, uscite = [];
    for (const o of g.e) {
      if (!g.bot[o.id] || !o.vivo) continue;
      const m = this.m[o.id];
      while (m.parlare.length && m.parlare[0].quando <= t) {
        const f = m.parlare.shift();
        uscite.push({ posto: o.id, testo: f.testo });
        const nominato = /@(\d+)/.exec(f.testo);
        if (nominato && /ero con/.test(f.testo)) this.scagiona(o.id, Number(nominato[1]));
        else if (nominato && /poco prima/.test(f.testo)) this.accusa(o.id, Number(nominato[1]), 2.5);
        else if (nominato && !/eliminare|trovato/.test(f.testo)) this.accusa(o.id, Number(nominato[1]), 1);
        else if (nominato && /eliminare/.test(f.testo)) this.accusa(o.id, Number(nominato[1]), 3);
      }
    }
    return uscite;
  }
  vota(p, t) {
    const g = this.g, m = this.m[p], e = g.e[p], L = this.liv(p);
    if (!e.vivo || !g.riunione || g.riunione.voti[p] !== undefined) return;
    if (!m.voto) m.voto = { quando: null };
    if (m.voto.quando === null) m.voto.quando = t + caso(3, 14);
    if (t < m.voto.quando) return;
    let chi = -1;
    if (Math.random() < L.caso) { const vivi = g.e.filter((o) => o.vivo && o.id !== p); chi = Math.random() < 0.5 ? -1 : pesca(vivi).id; }
    else if (!e.alieno) { const s = this.piuSospetto(p); chi = s === null ? -1 : s; }
    else {
      // l'Alieno vota l'umano più accusato (per mescolarsi alla folla), mai un altro Alieno
      const acc = {};
      for (const o of g.e) if (g.bot[o.id] && !o.alieno) for (const [id, s] of Object.entries(this.m[o.id].sosp)) acc[id] = (acc[id] || 0) + s;
      const cand = Object.entries(acc).filter(([id]) => g.e[id].vivo && !g.e[id].alieno && Number(id) !== p).sort((a, b) => b[1] - a[1]);
      chi = cand.length && cand[0][1] >= 1.5 ? Number(cand[0][0]) : -1;
    }
    g.azione(p, { tipo: 'vota', chi });
  }
  // dopo il voto si dimentica chi si era visto (tutti ripartono dal tavolo), ma i sospetti restano (un po' più deboli)
  dopoVoto(espulso) {
    for (const m of this.m) {
      m.visti = {}; m.insieme = {}; m.conVittima = null; m.corpoVisto = null; m.meta = null; m.parlare = []; m.voto = null; m.scappa = 0; m.autoSegnala = null;
      if (m.testimone && m.testimone.chi === espulso) m.testimone = null;
      for (const k of Object.keys(m.sosp)) m.sosp[k] *= 0.6;
      if (espulso !== null) delete m.sosp[espulso];
      m.attesa = this.g.tempoRound + caso(0.5, 2);
    }
  }
}

module.exports = { Menti, distanze, LIV };
