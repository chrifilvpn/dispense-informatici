// CHI È L'ALIENO — mappa "Isola vulcanica": sentieri di terra, ponti di corda sulla lava, capanne, pozze di lava e
// fumarole. L'espulso viene buttato nel vulcano, che risponde con una piccola eruzione.
module.exports = {
  id: 'vulcano', nome: 'Isola vulcanica', emoji: '🌋', espulsione: 'vulcano',
  stanze: [
    { id: 'spiaggia', nome: 'Spiaggia nera', r: [3, 3, 14, 8] }, { id: 'villaggio', nome: 'Villaggio', r: [24, 3, 12, 8] },
    { id: 'faro', nome: 'Faro', r: [45, 2, 15, 9] }, { id: 'capanne', nome: 'Capanne', r: [3, 16, 10, 10] },
    { id: 'piazza', nome: 'Piazza del fuoco', r: [26, 16, 13, 10] }, { id: 'sorgenti', nome: 'Sorgenti calde', r: [50, 15, 11, 11] },
    { id: 'orto', nome: 'Orto di cenere', r: [16, 28, 10, 7] }, { id: 'miniera', nome: 'Miniera di ossidiana', r: [3, 32, 12, 8] },
    { id: 'fumarole', nome: 'Fumarole', r: [30, 32, 13, 8] }, { id: 'osservatorio', nome: 'Osservatorio', r: [49, 32, 12, 8] },
  ],
  corridoi: [
    [17, 6, 7, 3], [36, 5, 9, 2], [7, 11, 3, 5], [30, 11, 3, 5], [54, 11, 3, 4], [13, 20, 13, 3], [39, 19, 11, 2],
    [6, 26, 3, 6], [34, 26, 3, 6], [26, 32, 4, 2], [15, 33, 1, 3], [43, 35, 6, 3], [55, 26, 3, 6],
    [20, 23, 2, 5], [39, 23, 6, 2], [44, 23, 2, 9], // sentieri secondari
  ],
  ponti: [[36, 5, 9, 2], [39, 19, 11, 2]], // ponti di corda (solo disegno)
  mobili: [
    [31, 20, 2, 2, 'tavolo-pulsante'], [6, 18, 2, 2, 'capanna'], [9, 22, 2, 2, 'capanna'], [27, 5, 2, 2, 'capanna'], [32, 7, 2, 2, 'capanna'],
    [50, 5, 2, 2, 'faro'], [56, 19, 2, 2, 'lava'], [52, 22, 2, 1, 'lava'], [35, 35, 3, 2, 'lava'], [40, 34, 1, 1, 'roccia'],
    [8, 35, 2, 2, 'roccia'], [12, 37, 1, 1, 'roccia'], [20, 31, 2, 1, 'aiuola'], [53, 35, 3, 2, 'telescopio'], [10, 5, 2, 1, 'barca'],
  ],
  pulsante: [32, 21],
  stazioni: [
    { stanza: 'spiaggia', tipo: 'tempismo', nome: 'Tira su la rete da pesca' },
    { stanza: 'spiaggia', tipo: 'consegna', nome: 'Riempi il secchio d\'acqua', poi: 'villaggio-acqua', tema: true },
    { id: 'villaggio-acqua', stanza: 'villaggio', tipo: 'consegna', arrivo: true, nome: 'Porta l\'acqua al villaggio' },
    { stanza: 'villaggio', tipo: 'interruttori', nome: 'Accendi le torce' },
    { stanza: 'faro', tipo: 'ruota', nome: 'Gira la lente del faro' },
    { stanza: 'faro', tipo: 'sequenza', nome: 'Segnali luminosi alle navi' },
    { stanza: 'capanne', tipo: 'ordina', nome: 'Ripara il ponte di corda', tema: true },
    { stanza: 'capanne', tipo: 'scorri', nome: 'Chiudi la porta della capanna' },
    { stanza: 'piazza', tipo: 'leva', nome: 'Suona il gong' },
    { stanza: 'sorgenti', tipo: 'carica', nome: 'Raffredda la valvola', tema: true },
    { stanza: 'sorgenti', tipo: 'calibra', nome: 'Regola la temperatura delle vasche' },
    { stanza: 'orto', tipo: 'tempismo', nome: 'Raccogli i peperoncini' },
    { stanza: 'miniera', tipo: 'labirinto', nome: 'Esci dai cunicoli con il carrello' },
    { stanza: 'miniera', tipo: 'fili', nome: 'Collega le lampade della miniera' },
    { stanza: 'fumarole', tipo: 'allinea', nome: 'Misura la pressione del vapore' },
    { stanza: 'fumarole', tipo: 'numeri', nome: 'Leggi i sismografi' },
    { stanza: 'osservatorio', tipo: 'consegna', nome: 'Preleva un campione di roccia', poi: 'orto-campione' },
    { id: 'orto-campione', stanza: 'orto', tipo: 'consegna', arrivo: true, nome: 'Analizza il campione nell\'orto' },
    { stanza: 'osservatorio', tipo: 'carica', nome: 'Carica la radio' },
  ],
  tema: {
    fondo: 'lava', corridoio: 'sentiero', muro: ['#5b4a42', '#3a2f2a'],
    pavimenti: { spiaggia: ['#3d3a3a', '#353232'], villaggio: ['#9a7a52', '#8d6e48'], faro: ['#8f8a80', '#827d74'], capanne: ['#a27f55', '#94734c'], piazza: ['#7a5a3e', '#6e5037'], sorgenti: ['#5f7f86', '#557379'], orto: ['#5b5448', '#524b40'], miniera: ['#3a3434', '#322d2d'], fumarole: ['#6d5b50', '#625147'], osservatorio: ['#7b7f88', '#70747c'] },
  },
  decori: [['fumarola', 32, 34], ['fumarola', 41, 38], ['fumarola', 47, 36], ['lava', 22, 9], ['roccia', 5, 13], ['palma', 4, 4], ['palma', 15, 9], ['palma', 58, 10], ['fumarola', 24, 25], ['roccia', 60, 30]],
};
