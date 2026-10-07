// CHI È L'ALIENO — mappa "Base polare": hangar delle motoslitte, igloo, radar, generatore e carotaggi nel ghiaccio.
// L'espulso scivola sul ghiaccio e cade in una crepa.
module.exports = {
  id: 'polare', nome: 'Base polare', emoji: '❄️', espulsione: 'polare',
  stanze: [
    { id: 'hangar', nome: 'Hangar', r: [3, 3, 14, 9] }, { id: 'radar', nome: 'Radar', r: [24, 3, 10, 7] },
    { id: 'serra', nome: 'Serra calda', r: [41, 3, 11, 8] }, { id: 'igloo', nome: 'Igloo', r: [55, 4, 7, 8] },
    { id: 'mensa', nome: 'Mensa', r: [4, 18, 10, 9] }, { id: 'sala', nome: 'Sala riunioni', r: [22, 16, 14, 10] },
    { id: 'generatore', nome: 'Generatore', r: [44, 17, 13, 9] }, { id: 'carotaggi', nome: 'Carotaggi', r: [3, 32, 13, 8] },
    { id: 'magazzino', nome: 'Magazzino viveri', r: [22, 32, 10, 8] }, { id: 'aurora', nome: 'Osservatorio aurora', r: [40, 31, 15, 9] },
  ],
  corridoi: [
    [17, 6, 7, 3], [34, 5, 7, 2], [52, 6, 3, 2], [8, 12, 3, 6], [28, 10, 3, 6], [14, 21, 8, 3], [36, 20, 8, 2],
    [57, 12, 2, 7], [56, 17, 3, 2], [7, 27, 3, 5], [26, 26, 3, 6], [16, 35, 6, 2], [32, 35, 8, 2], [48, 26, 3, 5],
    [18, 12, 2, 9], // la galleria di neve
  ],
  mobili: [
    [28, 20, 2, 2, 'tavolo-pulsante'], [6, 6, 2, 1, 'motoslitta'], [11, 8, 2, 1, 'motoslitta'], [30, 4, 2, 3, 'antenna'],
    [44, 6, 2, 2, 'aiuola'], [48, 5, 2, 2, 'aiuola'], [57, 7, 3, 2, 'igloo'], [7, 21, 2, 1, 'tavolino'], [10, 23, 2, 1, 'tavolino'],
    [48, 19, 2, 3, 'motore'], [52, 19, 2, 3, 'motore'], [8, 35, 2, 2, 'trivella'], [24, 34, 2, 2, 'cassa'], [28, 36, 2, 1, 'cassa'], [46, 34, 3, 2, 'telescopio'],
  ],
  pulsante: [29, 21],
  stazioni: [
    { stanza: 'hangar', tipo: 'carica', nome: 'Scalda il motore della motoslitta' },
    { stanza: 'hangar', tipo: 'fili', nome: 'Ripara i fari' },
    { stanza: 'radar', tipo: 'allinea', nome: 'Punta il radar' },
    { stanza: 'radar', tipo: 'sequenza', nome: 'Invia il messaggio in codice' },
    { stanza: 'serra', tipo: 'tempismo', nome: 'Raccogli le fragole' },
    { stanza: 'serra', tipo: 'consegna', nome: 'Prendi la verdura', poi: 'mensa-verdura' },
    { id: 'mensa-verdura', stanza: 'mensa', tipo: 'consegna', arrivo: true, nome: 'Porta la verdura in mensa' },
    { stanza: 'igloo', tipo: 'scorri', nome: 'Spala la neve dall\'ingresso' },
    { stanza: 'mensa', tipo: 'ordina', nome: 'Metti in ordine le tazze' },
    { stanza: 'sala', tipo: 'leva', nome: 'Accendi il riscaldamento' },
    { stanza: 'generatore', tipo: 'carica', nome: 'Sciogli il ghiaccio dal generatore', tema: true },
    { stanza: 'generatore', tipo: 'calibra', nome: 'Bilancia la corrente' },
    { stanza: 'carotaggi', tipo: 'ruota', nome: 'Gira la trivella' },
    { stanza: 'carotaggi', tipo: 'consegna', nome: 'Estrai la carota di ghiaccio', poi: 'aurora-carota', tema: true },
    { id: 'aurora-carota', stanza: 'aurora', tipo: 'consegna', arrivo: true, nome: 'Analizza la carota di ghiaccio' },
    { stanza: 'magazzino', tipo: 'numeri', nome: 'Inventario dei viveri' },
    { stanza: 'magazzino', tipo: 'interruttori', nome: 'Accendi i congelatori' },
    { stanza: 'aurora', tipo: 'labirinto', nome: 'Segui l\'aurora col telescopio' },
    { stanza: 'aurora', tipo: 'tempismo', nome: 'Fotografa l\'aurora' },
  ],
  tema: {
    fondo: 'neve', corridoio: 'ghiaccio', muro: ['#c9dbe8', '#8fa9bd'], finestre: true,
    pavimenti: { hangar: ['#6b7580', '#626b75'], radar: ['#4f6272', '#475868'], serra: ['#4f6b45', '#48623f'], igloo: ['#dfeaf2', '#d2e0ea'], mensa: ['#9a7d5a', '#8d7152'], sala: ['#6a7285', '#61687a'], generatore: ['#4a4f5a', '#434852'], carotaggi: ['#b8d0e0', '#aac5d7'], magazzino: ['#7a6a52', '#6e604a'], aurora: ['#34405a', '#2e3950'] },
  },
  decori: [['ghiacciolo', 20, 2], ['cumulo', 1, 14], ['cumulo', 38, 13], ['cumulo', 62, 28], ['pinguino', 20, 28], ['ghiacciolo', 38, 1], ['cumulo', 17, 41], ['pinguino', 60, 15]],
};
