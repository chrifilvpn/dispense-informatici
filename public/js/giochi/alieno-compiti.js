// CHI È L'ALIENO — i compiti nuovi (minigiochi): scorri, leva, allinea, ordina, ruota, consegna, calibra, labirinto.
// Tutti funzionano col mouse, col dito (pointer events) e con la tastiera (spazio, frecce, invio). La schermata è
// identica per gli Alieni (i loro compiti sono finti, ma nessuno se ne accorge guardando).
window.AlienoCompiti = (() => {
  const TITOLI = {
    scorri: 'Trascina la tessera fino in fondo (o tieni premuta la freccia →)',
    leva: 'Abbassa la leva e aspetta che la spia diventi verde',
    allinea: 'Tieni il cursore dentro la zona verde: tieni premuto per salire, lascia per scendere',
    ordina: 'Tocca gli oggetti dal più piccolo al più grande',
    ruota: 'Gira i tre pannelli finché tutte le frecce puntano in alto',
    consegna: 'Tieni premuto per prendere (o per consegnare)',
    calibra: 'Porta ogni cursore sulla sua tacca, poi conferma',
    labirinto: 'Porta il punto all\'uscita (frecce, pulsanti o tocca la casella accanto)',
  };
  const mescola = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const vivo = (el) => document.body.contains(el);

  function monta(st, campo, esito, fine, sbaglio, box) {
    const tipo = st.tipo;
    if (tipo === 'scorri') {
      campo.innerHTML = '<div class="al-binario"><div class="al-tessera" tabindex="0">▶</div><span class="al-arrivo">🏁</span></div>';
      const bin = campo.querySelector('.al-binario'), tes = campo.querySelector('.al-tessera');
      let pos = 0, trascina = null, fatto = false;
      const metti = (v) => { pos = Math.max(0, Math.min(1, v)); tes.style.left = `calc(${pos * 100}% - ${pos * 3}rem)`; if (pos >= 0.97 && !fatto) { fatto = true; tes.classList.add('ok'); fine(); } };
      tes.addEventListener('pointerdown', (e) => { if (fatto) return; e.preventDefault(); trascina = { x: e.clientX, p: pos }; try { tes.setPointerCapture(e.pointerId); } catch (_) { /* niente */ } });
      tes.addEventListener('pointermove', (e) => { if (!trascina) return; const w = bin.getBoundingClientRect().width - tes.offsetWidth; metti(trascina.p + (e.clientX - trascina.x) / Math.max(1, w)); });
      const su = () => { if (trascina && !fatto && pos < 0.97) metti(0); trascina = null; }; // lasciata a metà torna indietro
      tes.addEventListener('pointerup', su); tes.addEventListener('pointercancel', su);
      box._tasto = (k) => { if (!fatto && (k === 'arrowright' || k === ' ')) metti(pos + 0.08); };
    } else if (tipo === 'leva') {
      campo.innerHTML = '<div class="al-levabox"><button type="button" class="al-manico" aria-label="Leva"></button><i class="al-spia"></i></div>';
      const leva = campo.querySelector('.al-levabox'), spia = campo.querySelector('.al-spia');
      let fatto = false;
      const tira = () => { if (fatto) return; fatto = true; leva.classList.add('giu'); setTimeout(() => { if (vivo(spia)) { spia.classList.add('verde'); fine(); } }, 1300); };
      campo.querySelector('.al-manico').addEventListener('click', tira);
      box._tasto = (k) => { if (k === ' ' || k === 'arrowdown' || k === 'enter') tira(); };
    } else if (tipo === 'allinea') {
      campo.innerHTML = '<div class="al-pozzo"><div class="al-zona"></div><div class="al-ago"></div></div><div class="al-progresso"><i></i></div><button type="button" class="bottone primario al-su">Tieni premuto ⬆</button>';
      const zona = campo.querySelector('.al-zona'), ago = campo.querySelector('.al-ago'), barra = campo.querySelector('.al-progresso i'), bt = campo.querySelector('.al-su');
      let y = 0.2, v = 0, giu = false, dentro = 0, ult = performance.now(), t0 = ult, fatto = false;
      const giro = () => {
        if (fatto || !vivo(ago)) return;
        const ora = performance.now(), dt = Math.min(0.05, (ora - ult) / 1000); ult = ora;
        const z = 0.5 + 0.32 * Math.sin((ora - t0) / 900) * Math.cos((ora - t0) / 1700); // la zona si sposta piano
        v += (giu ? 1.6 : -1.4) * dt; v *= 0.92; y = Math.max(0, Math.min(1, y + v * dt * 3)); if (y === 0 || y === 1) v = 0;
        zona.style.bottom = `${(z - 0.1) * 100}%`; ago.style.bottom = `${y * 100}%`;
        const ok = Math.abs(y - z) < 0.1; ago.classList.toggle('dentro', ok);
        dentro = Math.max(0, dentro + (ok ? dt : -dt * 0.5)); barra.style.width = `${Math.min(100, (dentro / 2.5) * 100)}%`;
        if (dentro >= 2.5) { fatto = true; fine(); return; }
        requestAnimationFrame(giro);
      };
      giro();
      bt.addEventListener('pointerdown', (e) => { e.preventDefault(); giu = true; }); for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) bt.addEventListener(ev, () => { giu = false; });
      box._spazioGiu = (x) => { giu = x; };
    } else if (tipo === 'ordina') {
      const n = 5, misure = mescola([...Array(n).keys()]);
      const icone = ['🪨', '📦', '🧪', '🐚', '🥫'], ic = icone[Math.floor(Math.random() * icone.length)];
      campo.innerHTML = `<div class="al-oggetti">${misure.map((m) => `<button type="button" class="al-ogg" data-m="${m}" style="font-size:${1.1 + m * 0.45}rem">${ic}</button>`).join('')}</div>`;
      let prossimo = 0;
      campo.addEventListener('click', (e) => {
        const b = e.target.closest('.al-ogg'); if (!b || b.classList.contains('ok')) return;
        if (Number(b.dataset.m) === prossimo) { b.classList.add('ok'); b.textContent = `${prossimo + 1}`; prossimo++; window.Nuovi.suono([[500 + prossimo * 80, 0.05]], { volume: 0.05 }); if (prossimo === n) fine(); }
        else { sbaglio('Non è il più piccolo rimasto: si ricomincia'); prossimo = 0; campo.querySelectorAll('.al-ogg.ok').forEach((x) => { x.classList.remove('ok'); x.textContent = ic; }); }
      });
    } else if (tipo === 'ruota') {
      const giri = [0, 0, 0].map(() => 1 + Math.floor(Math.random() * 7)); // quanti ottavi di giro mancano
      campo.innerHTML = `<div class="al-pannelli">${giri.map((g, k) => `<button type="button" class="al-pannello" data-k="${k}"><i style="transform:rotate(${g * 45}deg)">⬆</i></button>`).join('')}</div><p class="piccolo">Tocca un pannello per girarlo (tastiera: 1, 2, 3)</p>`;
      let fatto = false;
      const gira = (k) => { if (fatto) return; giri[k] = (giri[k] + 1) % 8; const b = campo.querySelectorAll('.al-pannello')[k]; b.querySelector('i').style.transform = `rotate(${giri[k] * 45}deg)`; b.classList.toggle('ok', giri[k] === 0); window.Nuovi.suono([[400 + k * 60, 0.03]], { volume: 0.04 }); if (giri.every((g) => g === 0)) { fatto = true; fine(); } };
      campo.addEventListener('click', (e) => { const b = e.target.closest('.al-pannello'); if (b) gira(Number(b.dataset.k)); });
      box._tasto = (k) => { if (['1', '2', '3'].includes(k)) gira(Number(k) - 1); };
    } else if (tipo === 'consegna') {
      const arrivo = !!st.arrivo;
      campo.innerHTML = `<div class="al-pacco ${arrivo ? 'arrivo' : ''}"><span>${arrivo ? '📦➡️🎯' : '📦'}</span><div class="al-progresso"><i></i></div></div><button type="button" class="bottone primario al-tieni">${arrivo ? 'Tieni premuto: consegna' : 'Tieni premuto: prendi'}</button>`;
      const barra = campo.querySelector('.al-progresso i'), bt = campo.querySelector('.al-tieni');
      let c = 0, giu = false, ult = performance.now(), fatto = false;
      const giro = () => { if (fatto || !vivo(barra)) return; const ora = performance.now(), dt = (ora - ult) / 1000; ult = ora; c = Math.max(0, Math.min(1, c + (giu ? dt / 1.6 : -dt / 3))); barra.style.width = `${c * 100}%`; if (c >= 1) { fatto = true; fine(); esito.textContent = arrivo ? '✅ Consegnato!' : '📦 Preso! Portalo nell\'altra postazione (la vedi sulla mappa)'; return; } requestAnimationFrame(giro); };
      giro();
      bt.addEventListener('pointerdown', (e) => { e.preventDefault(); giu = true; }); for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) bt.addEventListener(ev, () => { giu = false; });
      box._spazioGiu = (x) => { giu = x; };
    } else if (tipo === 'calibra') {
      const mete = [0, 1, 2].map(() => 10 + Math.floor(Math.random() * 80));
      campo.innerHTML = `<div class="al-cursori">${mete.map((m, k) => `<label><span>${['A', 'B', 'C'][k]}</span><span class="al-slider"><input type="range" min="0" max="100" value="${m > 50 ? 5 : 95}" data-k="${k}"><i style="left:${m}%"></i></span></label>`).join('')}</div><button type="button" class="bottone primario al-conferma">Conferma</button>`;
      const ok = () => [...campo.querySelectorAll('input')].every((x, k) => Math.abs(Number(x.value) - mete[k]) <= 4);
      campo.addEventListener('input', () => campo.querySelectorAll('input').forEach((x, k) => x.parentElement.classList.toggle('ok', Math.abs(Number(x.value) - mete[k]) <= 4)));
      campo.querySelector('.al-conferma').addEventListener('click', () => { if (ok()) { campo.querySelector('.al-conferma').disabled = true; fine(); } else sbaglio('Qualche cursore non è sulla tacca'); });
    } else if (tipo === 'labirinto') {
      const N = 7, muri = labirinto(N); let r = 0, c = 0; const uscita = [N - 1, N - 1];
      campo.innerHTML = `<div class="al-lab" style="--n:${N}">${Array.from({ length: N * N }, (_, i) => { const rr = Math.floor(i / N), cc = i % N, m = muri[rr][cc]; return `<div class="al-cella ${m.n ? 'n' : ''} ${m.s ? 's' : ''} ${m.o ? 'o' : ''} ${m.e ? 'e' : ''}" data-r="${rr}" data-c="${cc}"></div>`; }).join('')}</div>
        <div class="al-frecce"><button type="button" data-d="n">▲</button><button type="button" data-d="o">◀</button><button type="button" data-d="s">▼</button><button type="button" data-d="e">▶</button></div>`;
      const celle = campo.querySelectorAll('.al-cella');
      let fatto = false;
      const disegna = () => { celle.forEach((x) => x.classList.remove('io')); celle[r * N + c].classList.add('io'); celle[uscita[0] * N + uscita[1]].classList.add('uscita'); };
      const muovi = (d) => {
        if (fatto) return;
        const [dr, dc] = { n: [-1, 0], s: [1, 0], o: [0, -1], e: [0, 1] }[d];
        if (muri[r][c][d]) { sbaglio('C\'è un muro'); return; }
        r += dr; c += dc; esito.textContent = ''; disegna();
        if (r === uscita[0] && c === uscita[1]) { fatto = true; fine(); }
      };
      disegna();
      campo.addEventListener('click', (e) => {
        const f = e.target.closest('[data-d]'); if (f) return muovi(f.dataset.d);
        const x = e.target.closest('.al-cella'); if (!x) return;
        const rr = Number(x.dataset.r), cc = Number(x.dataset.c);
        if (Math.abs(rr - r) + Math.abs(cc - c) === 1) muovi(rr < r ? 'n' : rr > r ? 's' : cc < c ? 'o' : 'e');
      });
      box._tasto = (k) => { const d = { arrowup: 'n', arrowdown: 's', arrowleft: 'o', arrowright: 'e', w: 'n', s: 's', a: 'o', d: 'e' }[k]; if (d) muovi(d); };
    } else return false;
    return true;
  }
  // labirinto perfetto (un solo percorso) con una visita in profondità; ogni cella sa dove ha i muri
  function labirinto(N) {
    const m = Array.from({ length: N }, () => Array.from({ length: N }, () => ({ n: true, s: true, o: true, e: true, v: false })));
    const pila = [[0, 0]]; m[0][0].v = true;
    const opp = { n: 's', s: 'n', o: 'e', e: 'o' }, D = { n: [-1, 0], s: [1, 0], o: [0, -1], e: [0, 1] };
    while (pila.length) {
      const [r, c] = pila[pila.length - 1];
      const vie = Object.keys(D).filter((d) => { const rr = r + D[d][0], cc = c + D[d][1]; return rr >= 0 && cc >= 0 && rr < N && cc < N && !m[rr][cc].v; });
      if (!vie.length) { pila.pop(); continue; }
      const d = vie[Math.floor(Math.random() * vie.length)], rr = r + D[d][0], cc = c + D[d][1];
      m[r][c][d] = false; m[rr][cc][opp[d]] = false; m[rr][cc].v = true; pila.push([rr, cc]);
    }
    return m;
  }
  return { TITOLI, monta, labirinto };
})();
