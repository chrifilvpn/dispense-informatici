// INDOVINA IL PAESE DALLA SAGOMA: compare il contorno di un paese (senza mappa intorno) e 4 nomi.
// Stesso motore di "Indovina la bandiera" (vedi geo-quiz.js); i contorni sono in sagome-dati.js.
const { SAGOME_BANCA: B, opzioniComuni, regoleComuni, gioco } = require('./geo-quiz');

module.exports = gioco(B, {
  id: 'sagome',
  nome: 'Indovina il paese dalla sagoma',
  descrizione: `Riconosci ${B.elementi.length} paesi solo dal contorno, come visti dall'alto senza niente intorno.`,
  alias: ['sagome', 'sagoma', 'contorno', 'forma', 'mappa', 'geografia', 'quiz', 'paesi', 'worldle'],
  opzioni: opzioniComuni(B.elementi, 'Paesi'),
  regole: [
    'Compare la sagoma di un paese (il suo contorno visto dall\'alto, con il nord in alto) e sotto 4 nomi: tocca quello giusto prima che finisca il tempo.',
    'Le sagome non sono in scala tra loro: un paese piccolo e uno enorme occupano lo stesso spazio. Le isole minuscole sono tolte.',
    'Le risposte sbagliate sono paesi dello stesso continente e con una forma simile (più larga o più alta).',
    ...regoleComuni,
  ],
});
