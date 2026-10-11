// INDOVINA LA CAPITALE: compare la bandiera con il nome del paese e 4 città: scegli la capitale giusta.
// Stesso motore di "Indovina la bandiera" (vedi geo-quiz.js).
const { CAPITALI_BANCA: B, opzioniComuni, regoleComuni, gioco } = require('./geo-quiz');

module.exports = gioco(B, {
  id: 'capitali',
  nome: 'Indovina la capitale',
  descrizione: `Il quiz delle capitali: ${B.elementi.length} paesi di tutto il mondo, con la loro bandiera. Da soli o in sfida.`,
  alias: ['capitali', 'capitale', 'geografia', 'quiz', 'città', 'stati', 'paesi'],
  opzioni: opzioniComuni(B.elementi, 'Paesi'),
  regole: [
    'Compare la bandiera e il nome di un paese, e sotto 4 città: tocca la capitale giusta prima che finisca il tempo (la barra in alto).',
    'Le risposte sbagliate sono capitali di paesi dello stesso continente, quindi non si va per esclusione così facilmente.',
    'Alcune capitali sono a sorpresa (Canberra, Ottawa, Ankara, Brasília…): nel ripasso c\'è una nota che spiega perché.',
    ...regoleComuni,
  ],
});
