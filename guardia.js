// GUARDIA: ban automatico per indirizzo con "punti sospetto".
// Ogni segnale (dati manomessi, scansioni, codici dei tavoli tentati a raffica, errori ripetuti…) dà dei punti
// all'indirizzo; i punti scendono col tempo (1 ogni 6 secondi). Oltre la soglia scatta il ban, sempre più lungo per
// chi ci ricasca: 10 minuti, 1 ora, 24 ore, 7 giorni (le recidive si ricordano per 30 giorni).
// - Gli indirizzi in IP_FIDATI (per esempio quello della scuola) non vengono mai bannati: per loro si chiude solo la
//   singola connessione che ha esagerato.
// - Con GUARDIA=prova (il valore predefinito finché non si è controllato come arrivano gli indirizzi su Render) i ban
//   vengono solo scritti nel log; con GUARDIA=attiva si applicano davvero.
// - Tutto in memoria: al riavvio del server si azzera. Ogni mappa ha un tetto di voci (le più vecchie escono).
'use strict';

// Map con un numero massimo di voci: aggiornare una voce la rende la più recente, oltre il tetto esce la più vecchia
class MappaLimitata extends Map {
  constructor(tetto = 20000) { super(); this.tetto = tetto; }
  set(k, v) {
    if (this.has(k)) this.delete(k);
    super.set(k, v);
    while (this.size > this.tetto) this.delete(this.keys().next().value);
    return this;
  }
}

const MINUTO = 60000;
const PREDEFINITI = {
  soglia: 50,
  decadimentoMs: 6000, // -1 punto ogni 6 secondi
  durate: [10 * MINUTO, 60 * MINUTO, 24 * 60 * MINUTO, 7 * 24 * 60 * MINUTO],
  memoriaRecidive: 30 * 24 * 60 * MINUTO,
  tetto: 20000,
};
// i segnali e i loro punti
const PUNTI = {
  dati: 10, // chiavi vietate o dati oltre i limiti
  scansione: 25, // /.env, /wp-login.php, ../ …
  codici: 5, // ogni tentativo di codice sbagliato oltre l'ottavo in un minuto
  abuso: 15, // disconnessione per troppi eventi rifiutati
  errore: 3, // errori ripetuti nei gestori per dati non validi
  connessioni: 10, // oltre il limite di connessioni per indirizzo
  raffica429: 2, // una raffica di risposte 429
  comandi: 2, // messaggi "!qualcosa" non validi oltre la soglia
  origine: 10, // WebSocket da un sito diverso
};

class Guardia {
  constructor(opz = {}) {
    Object.assign(this, PREDEFINITI, opz);
    this.fidati = new Set((opz.fidati || []).map(normalizzaIp).filter(Boolean));
    this.attiva = opz.attiva !== false;
    this.ora = opz.ora || (() => Date.now());
    this.log = opz.log || ((r) => console.warn(r));
    this.punti = new MappaLimitata(this.tetto); // ip -> { p, t, conn: Set di connessioni che hanno dato segnali }
    this.bans = new MappaLimitata(this.tetto); // ip -> { fino, motivo, livello }
    this.recidive = new MappaLimitata(this.tetto); // ip -> { n, ultimo }
    this.perConnessione = new WeakMap(); // connessione -> { p, t } (per gli indirizzi fidati)
    this.quandoBan = null; // (ip, ban, connessioni) => … chiude le connessioni attive
  }
  _scala(r) { const ora = this.ora(); r.p = Math.max(0, r.p - (ora - r.t) / this.decadimentoMs); r.t = ora; return r; }
  puntiDi(ip) { const r = this.punti.get(normalizzaIp(ip)); return r ? this._scala(r).p : 0; }
  fidato(ip) { return this.fidati.has(normalizzaIp(ip)); }
  // un segnale: restituisce 'ban' (indirizzo bannato adesso), 'chiudi' (solo quella connessione) o null
  segnala(ip, codice, connessione = null, punti = PUNTI[codice] || 1) {
    ip = normalizzaIp(ip);
    if (!ip) return null;
    if (this.bannato(ip)) return null;
    if (this.fidato(ip)) {
      if (!connessione) return null;
      const r = this._scala(this.perConnessione.get(connessione) || { p: 0, t: this.ora() });
      r.p += punti; this.perConnessione.set(connessione, r);
      return r.p >= this.soglia - 0.5 ? 'chiudi' : null;
    }
    const r = this._scala(this.punti.get(ip) || { p: 0, t: this.ora(), conn: new Set() });
    r.p += punti;
    if (connessione) r.conn.add(connessione);
    this.punti.set(ip, r);
    if (r.p < this.soglia - 0.5) return null; // (mezzo punto di margine: tra due segnali i punti sono già scesi un pochino)
    return this.banna(ip, codice, [...r.conn]);
  }
  banna(ip, motivo, connessioni = []) {
    ip = normalizzaIp(ip);
    const ora = this.ora();
    let rec = this.recidive.get(ip);
    if (!rec || ora - rec.ultimo > this.memoriaRecidive) rec = { n: 0, ultimo: ora };
    const durata = this.durate[Math.min(rec.n, this.durate.length - 1)];
    this.recidive.set(ip, { n: rec.n + 1, ultimo: ora });
    this.punti.delete(ip);
    const ban = { fino: ora + durata, motivo, livello: rec.n + 1, dal: ora };
    this.log(`[guardia] ${this.attiva ? 'BAN' : 'ban (solo prova, GUARDIA=prova)'} ${ip} · motivo ${motivo} · ${Math.round(durata / MINUTO)} min · volta n. ${rec.n + 1}`);
    if (!this.attiva) return null;
    this.bans.set(ip, ban);
    if (this.quandoBan) this.quandoBan(ip, ban, connessioni);
    return 'ban';
  }
  bannato(ip) {
    ip = normalizzaIp(ip);
    const b = this.bans.get(ip);
    if (!b) return 0;
    if (b.fino <= this.ora()) { this.bans.delete(ip); return 0; }
    return b.fino;
  }
  grazia(ip) { return this.bans.delete(normalizzaIp(ip)); }
  elenco() { const ora = this.ora(); return [...this.bans.entries()].filter(([, b]) => b.fino > ora).map(([ip, b]) => ({ ip, motivo: b.motivo, minuti: Math.ceil((b.fino - ora) / MINUTO), livello: b.livello })); }
}

// ---------- indirizzi ----------
function normalizzaIp(ip) { return String(ip || '').trim().replace(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/, '$1').toLowerCase(); }
// l'indirizzo vero: nell'elenco x-forwarded-for più l'indirizzo che si è collegato, si conta dalla fine quanti proxy
// fidati ci sono davanti al server (su Render di solito 1). Quello che sta prima l'ha scritto chi fa la richiesta e
// non conta: così un x-forwarded-for inventato non cambia niente.
function ipDaCatena(xff, remoto, hop = 1) {
  const catena = [...String(xff || '').split(',').map((x) => x.trim()).filter(Boolean), normalizzaIp(remoto)].filter(Boolean).map(normalizzaIp);
  if (!catena.length) return '?';
  return catena[Math.max(0, catena.length - 1 - hop)];
}
// Cloudflare: le reti da cui arrivano le sue richieste (per usare CF-Connecting-IP solo se arriva davvero da lì)
const CLOUDFLARE_V4 = ['173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '141.101.64.0/18', '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20', '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13', '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22'];
const CLOUDFLARE_V6 = ['2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32', '2405:8100::/32', '2a06:98c0::/29', '2c0f:f248::/32'];
const v4 = (ip) => { const p = ip.split('.').map(Number); return p.length === 4 && p.every((x) => x >= 0 && x <= 255) ? ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0 : null; };
function v6(ip) {
  if (!ip.includes(':')) return null;
  const [a, b] = ip.split('::'), sx = a ? a.split(':') : [], dx = b !== undefined && b ? b.split(':') : [];
  const gruppi = b === undefined ? sx : [...sx, ...new Array(8 - sx.length - dx.length).fill('0'), ...dx];
  if (gruppi.length !== 8) return null;
  return gruppi.map((g) => parseInt(g || '0', 16).toString(2).padStart(16, '0')).join('');
}
function inRete(ip, rete) {
  const [base, bit] = rete.split('/'), n = Number(bit);
  if (base.includes(':')) { const a = v6(ip), b = v6(base); return !!a && !!b && a.slice(0, n) === b.slice(0, n); }
  const a = v4(ip), b = v4(base); if (a === null || b === null) return false;
  const m = n === 0 ? 0 : (~0 << (32 - n)) >>> 0; return (a & m) === (b & m);
}
const daCloudflare = (ip) => [...CLOUDFLARE_V4, ...CLOUDFLARE_V6].some((r) => inRete(normalizzaIp(ip), r));
// l'indirizzo di una richiesta HTTP o di un handshake socket.io
function indirizzo(headers, remoto, { hop = 1, cloudflare = false } = {}) {
  const ip = ipDaCatena(headers && headers['x-forwarded-for'], remoto, hop);
  if (cloudflare && headers && headers['cf-connecting-ip'] && daCloudflare(ip)) return normalizzaIp(headers['cf-connecting-ip']);
  return ip;
}

// ---------- percorsi tipici delle scansioni automatiche ----------
const SCANSIONI = /(^|\/)(\.env|\.git|\.svn|\.ht|wp-login\.php|wp-admin|wp-content|xmlrpc\.php|phpmyadmin|pma|admin|administrator|config|cgi-bin|vendor\/phpunit|server-status|\.aws|\.ssh|etc\/passwd)(\/|$|\.|\?)/i;
function eScansione(url) {
  let u = String(url || '');
  if (/(\.\.|%2e%2e|%252e)/i.test(u)) return true; // tentativi di path traversal
  try { u = decodeURIComponent(u.split('?')[0]); } catch { return true; }
  return SCANSIONI.test(u);
}

// l'Origin di un handshake WebSocket: deve essere il sito stesso (o uno di ORIGINI_CONSENTITE)
function origineValida(headers, consentite = []) {
  const o = headers && headers.origin;
  if (!o) return true; // chi non è un browser non manda Origin: il pericolo (un sito che usa il tuo browser) non c'è
  let host;
  try { host = new URL(o).host.toLowerCase(); } catch { return false; }
  if (host === String((headers.host || '')).toLowerCase()) return true;
  return consentite.some((c) => { try { return new URL(c.includes('://') ? c : `https://${c}`).host.toLowerCase() === host; } catch { return false; } });
}

module.exports = { Guardia, MappaLimitata, PUNTI, indirizzo, ipDaCatena, normalizzaIp, daCloudflare, eScansione, origineValida };
