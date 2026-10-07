// CHI È L'ALIENO — mappa "Pianeta pianta": giungla aliena con fiori giganti, liane, funghi luminosi, serre e radici.
// L'espulso viene mangiato (senza niente di brutto da vedere) da una pianta carnivora gigante.
module.exports = {
  id: 'pianta', nome: 'Pianeta pianta', emoji: '🌿', espulsione: 'pianta',
  stanze: [
    { id: 'spore', nome: 'Serra delle spore', r: [4, 4, 12, 9] }, { id: 'radura', nome: 'Radura dei fiori', r: [22, 3, 14, 9] },
    { id: 'nido', nome: 'Nido di liane', r: [44, 4, 14, 8] }, { id: 'funghi', nome: 'Bosco dei funghi', r: [3, 19, 12, 9] },
    { id: 'cuore', nome: 'Albero cuore', r: [24, 17, 14, 10] }, { id: 'palude', nome: 'Palude luminosa', r: [46, 18, 15, 9] },
    { id: 'radici', nome: 'Tunnel di radici', r: [15, 31, 10, 8] }, { id: 'laboratorio', nome: 'Laboratorio botanico', r: [3, 32, 9, 8] },
    { id: 'fiore', nome: 'Fiore gigante', r: [30, 31, 12, 9] }, { id: 'semi', nome: 'Deposito dei semi', r: [48, 31, 12, 9] },
  ],
  corridoi: [
    [16, 7, 6, 3], [36, 6, 8, 2], [8, 13, 3, 6], [28, 12, 3, 5], [51, 12, 3, 6], [15, 22, 9, 3], [38, 21, 8, 2],
    [6, 28, 3, 4], [12, 34, 3, 2], [33, 27, 3, 4], [25, 34, 5, 2], [42, 35, 6, 2], [53, 27, 3, 4],
    [19, 25, 2, 6], [42, 24, 2, 7], [42, 29, 6, 2], // passaggi tra le radici
  ],
  mobili: [
    [30, 21, 2, 2, 'tavolo-pulsante'], [34, 34, 4, 3, 'fiore-gigante'], [6, 22, 2, 2, 'fungo'], [11, 25, 1, 1, 'fungo'], [12, 20, 1, 1, 'fungo'],
    [52, 21, 3, 2, 'stagno'], [48, 7, 1, 1, 'liana'], [53, 9, 1, 1, 'liana'], [51, 34, 2, 2, 'sacco'], [56, 36, 1, 1, 'sacco'],
    [27, 6, 2, 2, 'fiore'], [32, 8, 1, 1, 'fiore'], [5, 35, 3, 1, 'bancone'], [8, 7, 2, 2, 'aiuola'], [18, 34, 1, 1, 'radice'], [22, 36, 1, 1, 'radice'],
  ],
  pulsante: [31, 22],
  stazioni: [
    { stanza: 'spore', tipo: 'tempismo', nome: 'Apri le capsule di spore' },
    { stanza: 'spore', tipo: 'calibra', nome: 'Regola l\'umidità della serra' },
    { stanza: 'radura', tipo: 'consegna', nome: 'Raccogli i semi', poi: 'semi-deposito', tema: true },
    { id: 'semi-deposito', stanza: 'semi', tipo: 'consegna', arrivo: true, nome: 'Metti i semi nel deposito' },
    { stanza: 'radura', tipo: 'sequenza', nome: 'Imita il canto dei fiori' },
    { stanza: 'nido', tipo: 'scorri', nome: 'Sposta le liane' },
    { stanza: 'nido', tipo: 'fili', nome: 'Intreccia le liane dello stesso colore' },
    { stanza: 'funghi', tipo: 'interruttori', nome: 'Accendi i funghi luminosi' },
    { stanza: 'funghi', tipo: 'numeri', nome: 'Conta gli anelli dei funghi' },
    { stanza: 'cuore', tipo: 'leva', nome: 'Apri la corteccia' },
    { stanza: 'palude', tipo: 'allinea', nome: 'Misura il livello della palude' },
    { stanza: 'palude', tipo: 'labirinto', nome: 'Attraversa le ninfee' },
    { stanza: 'radici', tipo: 'ruota', nome: 'Gira la valvola della linfa' },
    { stanza: 'laboratorio', tipo: 'ordina', nome: 'Ordina le provette' },
    { stanza: 'laboratorio', tipo: 'carica', nome: 'Carica l\'essiccatore' },
    { stanza: 'fiore', tipo: 'carica', nome: 'Innaffia il fiore gigante', tema: true },
    { stanza: 'fiore', tipo: 'consegna', nome: 'Prendi il polline', poi: 'laboratorio-polline' },
    { id: 'laboratorio-polline', stanza: 'laboratorio', tipo: 'consegna', arrivo: true, nome: 'Porta il polline in laboratorio' },
    { stanza: 'semi', tipo: 'tempismo', nome: 'Sigilla i barattoli' },
  ],
  tema: {
    fondo: 'giungla', corridoio: 'radici', muro: ['#2f5a32', '#1c3b20'],
    pavimenti: { spore: ['#3c5a3a', '#355034'], radura: ['#5a7d3c', '#527235'], nido: ['#4a6b3a', '#426034'], funghi: ['#3b4a5e', '#344256'], cuore: ['#6b5436', '#604b30'], palude: ['#2f5a5a', '#295050'], radici: ['#5a4632', '#4f3e2c'], laboratorio: ['#cfd8c8', '#c2ccba'], fiore: ['#6a4a6e', '#5f4263'], semi: ['#7a6a44', '#6e5f3c'] },
  },
  decori: [['fungo-luce', 4, 26], ['fungo-luce', 14, 27], ['liana', 45, 5], ['liana', 57, 5], ['fiore', 23, 4], ['fiore', 35, 11], ['fungo-luce', 60, 19], ['foglia', 2, 14], ['foglia', 38, 14], ['foglia', 62, 30]],
};
