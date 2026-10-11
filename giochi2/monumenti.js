// DOVE SI TROVA? Il quiz dei monumenti: compare il nome di un monumento famoso e 4 città: scegli quella giusta.
// Stesso motore di "Indovina la bandiera" (vedi geo-quiz.js); i monumenti sono in monumenti-dati.js.
const { MONUMENTI_BANCA: B, opzioniComuni, regoleComuni, gioco } = require('./geo-quiz');

module.exports = gioco(B, {
  id: 'monumenti',
  nome: 'Dove si trova il monumento?',
  descrizione: `${B.elementi.length} monumenti e meraviglie del mondo (tanti italiani): sai dire in che città si trovano?`,
  alias: ['monumenti', 'monumento', 'meraviglie', 'storia', 'arte', 'geografia', 'quiz', 'città', 'viaggi'],
  opzioni: opzioniComuni(B.elementi, 'Monumenti'),
  regole: [
    'Compare il nome di un monumento (o di una meraviglia naturale) e 4 luoghi: tocca quello dove si trova davvero, prima che finisca il tempo.',
    'Dopo la risposta compare una riga che racconta il monumento: è il modo più veloce per impararli.',
    ...regoleComuni,
  ],
});
