// Dati di geografia per i quiz che usano il motore di "Indovina la bandiera": capitale e continente di ogni paese
// (gli stessi paesi delle bandiere, con gli stessi nomi). Nessun "meta": è solo un file di dati.
const CAPITALI = {
  Italia: 'Roma', Francia: 'Parigi', Germania: 'Berlino', Spagna: 'Madrid', Portogallo: 'Lisbona', 'Regno Unito': 'Londra',
  Irlanda: 'Dublino', Belgio: 'Bruxelles', 'Paesi Bassi': 'Amsterdam', Lussemburgo: 'Lussemburgo', Austria: 'Vienna',
  Svizzera: 'Berna', Danimarca: 'Copenaghen', Svezia: 'Stoccolma', Norvegia: 'Oslo', Finlandia: 'Helsinki', Islanda: 'Reykjavík',
  Polonia: 'Varsavia', 'Repubblica Ceca': 'Praga', Slovacchia: 'Bratislava', Ungheria: 'Budapest', Romania: 'Bucarest',
  Bulgaria: 'Sofia', Grecia: 'Atene', Croazia: 'Zagabria', Slovenia: 'Lubiana', Serbia: 'Belgrado', Ucraina: 'Kiev',
  Russia: 'Mosca', Bielorussia: 'Minsk', Lituania: 'Vilnius', Lettonia: 'Riga', Estonia: 'Tallinn', Albania: 'Tirana',
  'Macedonia del Nord': 'Skopje', 'Bosnia ed Erzegovina': 'Sarajevo', Montenegro: 'Podgorica', Moldavia: 'Chișinău',
  Malta: 'La Valletta', Cipro: 'Nicosia', Monaco: 'Monaco', 'San Marino': 'San Marino', 'Città del Vaticano': 'Città del Vaticano',
  Andorra: 'Andorra la Vella', Liechtenstein: 'Vaduz', Turchia: 'Ankara', Georgia: 'Tbilisi', Armenia: 'Erevan',
  Azerbaigian: 'Baku', Kosovo: 'Pristina',
  'Stati Uniti': 'Washington', Canada: 'Ottawa', Messico: 'Città del Messico', Brasile: 'Brasília', Argentina: 'Buenos Aires',
  Cile: 'Santiago', Perù: 'Lima', Colombia: 'Bogotà', Venezuela: 'Caracas', Ecuador: 'Quito', Bolivia: 'Sucre',
  Paraguay: 'Asunción', Uruguay: 'Montevideo', Cuba: "L'Avana", Giamaica: 'Kingston', Panama: 'Panama', 'Costa Rica': 'San José',
  Guatemala: 'Città del Guatemala', Honduras: 'Tegucigalpa', 'El Salvador': 'San Salvador', Nicaragua: 'Managua',
  'Repubblica Dominicana': 'Santo Domingo', Haiti: 'Port-au-Prince', 'Trinidad e Tobago': 'Port of Spain', Bahamas: 'Nassau',
  Barbados: 'Bridgetown',
  Egitto: 'Il Cairo', Marocco: 'Rabat', Algeria: 'Algeri', Tunisia: 'Tunisi', Libia: 'Tripoli', Nigeria: 'Abuja', Ghana: 'Accra',
  Senegal: 'Dakar', Mali: 'Bamako', Guinea: 'Conakry', Camerun: 'Yaoundé', "Costa d'Avorio": 'Yamoussoukro', Ciad: "N'Djamena",
  Niger: 'Niamey', 'Burkina Faso': 'Ouagadougou', Benin: 'Porto-Novo', Togo: 'Lomé', Gabon: 'Libreville', Kenya: 'Nairobi',
  Etiopia: 'Addis Abeba', Sudafrica: 'Pretoria', Tanzania: 'Dodoma', Uganda: 'Kampala', Ruanda: 'Kigali',
  'Repubblica Democratica del Congo': 'Kinshasa', Angola: 'Luanda', Mozambico: 'Maputo', Zimbabwe: 'Harare',
  Madagascar: 'Antananarivo', Somalia: 'Mogadiscio', Sudan: 'Khartum', Botswana: 'Gaborone', Namibia: 'Windhoek',
  Zambia: 'Lusaka', Liberia: 'Monrovia', 'Sierra Leone': 'Freetown', Gambia: 'Banjul', 'Capo Verde': 'Praia', Mauritius: 'Port Louis',
  Cina: 'Pechino', Giappone: 'Tokyo', 'Corea del Sud': 'Seul', 'Corea del Nord': 'Pyongyang', India: 'Nuova Delhi',
  Pakistan: 'Islamabad', Bangladesh: 'Dacca', Indonesia: 'Giacarta', Thailandia: 'Bangkok', Vietnam: 'Hanoi', Filippine: 'Manila',
  Malesia: 'Kuala Lumpur', Singapore: 'Singapore', 'Arabia Saudita': 'Riad', 'Emirati Arabi Uniti': 'Abu Dhabi', Qatar: 'Doha',
  Bahrein: 'Manama', Kuwait: 'Kuwait', Oman: 'Mascate', Yemen: 'Sana’a', Iraq: 'Baghdad', Siria: 'Damasco', Giordania: 'Amman',
  Israele: 'Gerusalemme', Iran: 'Teheran', Libano: 'Beirut', Nepal: 'Kathmandu', Bhutan: 'Thimphu', Mongolia: 'Ulan Bator',
  Kazakistan: 'Astana', Uzbekistan: 'Tashkent', Laos: 'Vientiane', Cambogia: 'Phnom Penh', Myanmar: 'Naypyidaw',
  Afghanistan: 'Kabul', 'Sri Lanka': 'Sri Jayawardenepura Kotte',
  Australia: 'Canberra', 'Nuova Zelanda': 'Wellington', Figi: 'Suva', 'Papua Nuova Guinea': 'Port Moresby', Samoa: 'Apia',
  Palau: 'Ngerulmud', Tonga: "Nuku'alofa",
};
// note per il ripasso, quando la risposta può sorprendere
const NOTE = {
  Bolivia: 'Sucre è la capitale costituzionale; il governo sta a La Paz.',
  "Costa d'Avorio": 'La capitale è Yamoussoukro, ma la città più grande è Abidjan.',
  Israele: 'Molti paesi tengono le ambasciate a Tel Aviv.',
  Tanzania: 'Dodoma è la capitale; la città più grande è Dar es Salaam.',
  Nigeria: 'Abuja ha preso il posto di Lagos nel 1991.',
  Australia: 'Canberra fu costruita apposta per non scegliere tra Sydney e Melbourne.',
  Kazakistan: 'Astana si è chiamata anche Nur-Sultan dal 2019 al 2022.',
  Myanmar: 'Naypyidaw ha sostituito Yangon nel 2005.',
  'Sri Lanka': 'Colombo è la capitale commerciale.',
  Brasile: 'Brasília fu inaugurata nel 1960 al posto di Rio de Janeiro.',
  Turchia: 'Non è Istanbul: la capitale è Ankara dal 1923.',
  Canada: 'Non è Toronto: la capitale è Ottawa.',
  Svizzera: 'Berna è la "città federale".',
  Benin: 'Porto-Novo è la capitale ufficiale; il governo sta a Cotonou.',
  Pakistan: 'Non è Karachi: la capitale è Islamabad.',
  Marocco: 'Non è Casablanca: la capitale è Rabat.',
};

// continenti: l'elenco delle bandiere è in ordine (Europa, Americhe, Africa, Asia, Oceania); qui si segna il primo
// paese di ogni continente
const { PAESI } = require('../giochi/bandiere-dati');
const INIZI = { 'Italia': 'Europa', 'Stati Uniti': 'Americhe', Egitto: 'Africa', Cina: 'Asia', Australia: 'Oceania' };
const CONTINENTE = {};
let cont = null;
for (const p of PAESI) { cont = INIZI[p.nome] || cont; CONTINENTE[p.nome] = cont; }

module.exports = { CAPITALI, NOTE, CONTINENTE };
