// CHI È L'ALIENO — mappa "Stazione sottomarina": cupole, oblò, serbatoi e pompe in fondo al mare.
// L'espulso esce dal portellone e viene inghiottito da una grande creatura degli abissi.
module.exports = {
  id: 'abissi', nome: 'Stazione sottomarina', emoji: '🐙', espulsione: 'abissi',
  stanze: [
    { id: 'attracco', nome: 'Attracco', r: [3, 3, 12, 8] }, { id: 'oblo', nome: 'Sala degli oblò', r: [21, 2, 12, 8] },
    { id: 'sonar', nome: 'Sonar', r: [40, 3, 10, 8] }, { id: 'pompe', nome: 'Pompe', r: [54, 4, 8, 10] },
    { id: 'acquario', nome: 'Acquario', r: [3, 16, 11, 11] }, { id: 'cupola', nome: 'Cupola centrale', r: [22, 15, 14, 11] },
    { id: 'alloggi', nome: 'Alloggi', r: [42, 17, 11, 8] }, { id: 'cucina', nome: 'Cucina', r: [4, 32, 10, 7] },
    { id: 'serbatoi', nome: 'Serbatoi', r: [20, 31, 12, 9] }, { id: 'camera', nome: 'Decompressione', r: [40, 31, 16, 8] },
  ],
  corridoi: [
    [15, 5, 6, 3], [33, 5, 7, 2], [50, 6, 4, 3], [7, 11, 3, 5], [27, 10, 3, 5], [14, 20, 8, 3], [36, 20, 6, 2],
    [56, 14, 2, 6], [53, 18, 5, 2], [8, 27, 3, 5], [26, 26, 3, 5], [14, 35, 6, 2], [32, 34, 8, 2], [46, 25, 3, 6],
    [36, 11, 2, 9], // tubo di servizio
  ],
  mobili: [
    [28, 19, 2, 2, 'tavolo-pulsante'], [6, 19, 5, 3, 'vasca'], [22, 33, 2, 3, 'serbatoio'], [27, 33, 2, 3, 'serbatoio'], [42, 4, 5, 1, 'console'],
    [44, 19, 1, 2, 'letto'], [47, 19, 1, 2, 'letto'], [50, 19, 1, 2, 'letto'], [6, 34, 4, 1, 'bancone'], [50, 33, 2, 3, 'capsula'], [57, 6, 2, 2, 'pompa'],
    [25, 4, 2, 2, 'tavolino'],
  ],
  pulsante: [29, 20],
  stazioni: [
    { stanza: 'attracco', tipo: 'leva', nome: 'Aggancia il sottomarino' },
    { stanza: 'attracco', tipo: 'consegna', nome: 'Scarica le bombole', poi: 'camera-bombole' },
    { id: 'camera-bombole', stanza: 'camera', tipo: 'consegna', arrivo: true, nome: 'Riponi le bombole' },
    { stanza: 'oblo', tipo: 'scorri', nome: 'Pulisci l\'oblò' },
    { stanza: 'sonar', tipo: 'sequenza', nome: 'Ripeti gli impulsi del sonar' },
    { stanza: 'sonar', tipo: 'allinea', nome: 'Punta il sonar sul relitto' },
    { stanza: 'pompe', tipo: 'carica', nome: 'Sigilla la falla', tema: true },
    { stanza: 'pompe', tipo: 'ruota', nome: 'Chiudi la valvola della zavorra' },
    { stanza: 'acquario', tipo: 'tempismo', nome: 'Dai da mangiare ai pesci', tema: true },
    { stanza: 'acquario', tipo: 'ordina', nome: 'Ordina le conchiglie' },
    { stanza: 'cupola', tipo: 'interruttori', nome: 'Luci della cupola' },
    { stanza: 'alloggi', tipo: 'numeri', nome: 'Codice dell\'armadietto' },
    { stanza: 'cucina', tipo: 'tempismo', nome: 'Cuoci le alghe' },
    { stanza: 'cucina', tipo: 'fili', nome: 'Ripara il frigorifero' },
    { stanza: 'serbatoi', tipo: 'calibra', nome: 'Bilancia l\'ossigeno' },
    { stanza: 'serbatoi', tipo: 'consegna', nome: 'Prendi il filtro nuovo', poi: 'pompe-filtro' },
    { id: 'pompe-filtro', stanza: 'pompe', tipo: 'consegna', arrivo: true, nome: 'Monta il filtro nelle pompe' },
    { stanza: 'camera', tipo: 'labirinto', nome: 'Guida il drone nei tubi' },
    { stanza: 'camera', tipo: 'carica', nome: 'Pressurizza la camera' },
  ],
  tema: {
    fondo: 'abisso', corridoio: 'tubo', muro: ['#4b6f86', '#2c4a5e'], finestre: true,
    pavimenti: { attracco: ['#465a66', '#3f515c'], oblo: ['#2f4f68', '#29465d'], sonar: ['#26404f', '#213846'], pompe: ['#4a5560', '#424c56'], acquario: ['#2c5f6e', '#275563'], cupola: ['#3e5f73', '#375567'], alloggi: ['#6b6f86', '#606479'], cucina: ['#c9d3d8', '#bcc7cd'], serbatoi: ['#4f5a4a', '#465042'], camera: ['#5a5f69', '#50555e'] },
  },
  decori: [['corallo', 18, 13], ['corallo', 38, 28], ['alga', 1, 30], ['alga', 63, 20], ['bolle', 16, 28], ['bolle', 45, 12], ['corallo', 60, 36], ['alga', 34, 12], ['bolle', 3, 13]],
};
