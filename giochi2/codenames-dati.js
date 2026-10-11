// NOMI IN CODICE: la raccolta di parole (comuni e concrete) e la rete di associazioni che usa il computer.
// Ogni parola ha da 3 a 6 TEMI scelti da un vocabolario di circa 150 temi. Il capitano computer cerca il tema che
// copre più parole della sua squadra (e nessuna pericolosa) e lo dice come indizio; l'agente computer cerca sul tavolo
// le parole che hanno quel tema. Ogni tema ha uno o più NOMI da usare come indizio (il primo valido sul tavolo:
// se "mare" è una delle parole in gioco, il capitano dirà "oceano").

// tema: nomi possibili come indizio (una parola sola, dal più naturale)
const TEMI = {
  animale: ['animale', 'bestia'],
  uccello: ['uccello', 'volatile'],
  pesce: ['pesce', 'pinna'],
  insetto: ['insetto', 'ronzio'],
  mare: ['mare', 'oceano'],
  acqua: ['acqua', 'liquido'],
  fiume: ['fiume', 'corrente'],
  montagna: ['montagna', 'vetta'],
  bosco: ['bosco', 'foresta'],
  fattoria: ['fattoria', 'stalla'],
  casa: ['casa', 'abitazione'],
  cucina: ['cucina', 'chef'],
  cibo: ['cibo', 'mangiare'],
  frutta: ['frutta', 'frutto'],
  verdura: ['verdura', 'ortaggio'],
  dolce: ['dolce', 'zucchero'],
  bevanda: ['bevanda', 'bere'],
  scuola: ['scuola', 'lezione'],
  libro: ['libro', 'lettura'],
  sport: ['sport', 'atleta'],
  calcio: ['calcio', 'stadio'],
  gioco: ['gioco', 'giocattolo'],
  musica: ['musica', 'canzone'],
  arte: ['arte', 'museo'],
  cinema: ['cinema', 'film'],
  teatro: ['teatro', 'palcoscenico'],
  tecnologia: ['tecnologia', 'elettronica'],
  computer: ['computer', 'informatica'],
  comunicazione: ['comunicazione', 'messaggio'],
  elettricita: ['elettricità', 'energia'],
  luce: ['luce', 'illuminazione'],
  fuoco: ['fuoco', 'fiamma'],
  caldo: ['caldo', 'calore'],
  freddo: ['freddo', 'gelo'],
  inverno: ['inverno', 'neve'],
  estate: ['estate', 'afa'],
  notte: ['notte', 'buio'],
  cielo: ['cielo', 'firmamento'],
  spazio: ['spazio', 'universo'],
  meteo: ['meteo', 'clima'],
  viaggio: ['viaggio', 'turista'],
  veicolo: ['veicolo', 'trasporto'],
  strada: ['strada', 'traffico'],
  citta: ['città', 'metropoli'],
  navigazione: ['navigazione', 'nautica'],
  volare: ['volare', 'volo'],
  corpo: ['corpo', 'anatomia'],
  testa: ['testa', 'cranio'],
  mano: ['mano', 'dita'],
  piede: ['piede', 'passo'],
  occhio: ['occhio', 'vista'],
  bocca: ['bocca', 'denti'],
  salute: ['salute', 'medicina'],
  vestito: ['vestito', 'abbigliamento'],
  gioiello: ['gioiello', 'prezioso'],
  oro: ['oro', 'dorato'],
  denaro: ['denaro', 'soldi'],
  lavoro: ['lavoro', 'mestiere'],
  ufficio: ['ufficio', 'impiegato'],
  legge: ['legge', 'giustizia'],
  guerra: ['guerra', 'battaglia'],
  arma: ['arma', 'armi'],
  antico: ['antico', 'antichità'],
  medioevo: ['medioevo', 'cavalleria'],
  egitto: ['egitto', 'faraoni'],
  regno: ['regno', 'sovrano'],
  religione: ['religione', 'fede'],
  magia: ['magia', 'incantesimo'],
  fiaba: ['fiaba', 'favola'],
  mitologia: ['mitologia', 'leggenda'],
  paura: ['paura', 'spavento'],
  natale: ['natale', 'dicembre'],
  festa: ['festa', 'celebrazione'],
  amore: ['amore', 'romantico'],
  famiglia: ['famiglia', 'parenti'],
  bambino: ['bambino', 'infanzia'],
  scienza: ['scienza', 'esperimento'],
  chimica: ['chimica', 'molecola'],
  matematica: ['matematica', 'calcolo'],
  numero: ['numero', 'cifra'],
  forma: ['forma', 'geometria'],
  colore: ['colore', 'tinta'],
  rosso: ['rosso', 'scarlatto'],
  verde: ['verde', 'smeraldo'],
  bianco: ['bianco', 'candido'],
  nero: ['nero', 'scuro'],
  giallo: ['giallo', 'paglierino'],
  blu: ['blu', 'azzurro'],
  metallo: ['metallo', 'acciaio'],
  legno: ['legno', 'falegname'],
  pietra: ['pietra', 'roccia'],
  vetro: ['vetro', 'trasparente'],
  carta: ['carta', 'cartoleria'],
  rotondo: ['rotondo', 'cerchio'],
  piccolo: ['piccolo', 'minuscolo'],
  grande: ['grande', 'enorme'],
  veloce: ['veloce', 'rapido'],
  lento: ['lento', 'lentezza'],
  rumore: ['rumore', 'suono'],
  odore: ['odore', 'profumo'],
  giardino: ['giardino', 'prato'],
  fiore: ['fiore', 'petalo'],
  albero: ['albero', 'fusto'],
  campagna: ['campagna', 'agricoltura'],
  sole: ['sole', 'raggio'],
  luna: ['luna', 'lunare'],
  vento: ['vento', 'soffio'],
  spiaggia: ['spiaggia', 'bagnante'],
  deserto: ['deserto', 'duna'],
  isola: ['isola', 'arcipelago'],
  artico: ['artico', 'polare'],
  giungla: ['giungla', 'savana'],
  italia: ['italia', 'italiano'],
  tempo: ['tempo', 'orologio'],
  attrezzo: ['attrezzo', 'utensile'],
  tagliente: ['tagliente', 'lama'],
  punta: ['punta', 'appuntito'],
  pulizia: ['pulizia', 'igiene'],
  sonno: ['sonno', 'dormire'],
  circo: ['circo', 'acrobata'],
  pirata: ['pirata', 'corsaro'],
  west: ['west', 'cowboy'],
  latte: ['latte', 'latticini'],
  forno: ['forno', 'panetteria'],
  chiave: ['chiave', 'serratura'],
  segreto: ['segreto', 'spia'],
  posta: ['posta', 'spedizione'],
  scrittura: ['scrittura', 'scrivere'],
  disegno: ['disegno', 'disegnare'],
  televisione: ['televisione', 'tv'],
  preistoria: ['preistoria', 'cavernicolo'],
  corsa: ['corsa', 'gara'],
  palla: ['palla', 'sferico'],
  squadra: ['squadra', 'compagni'],
  premio: ['premio', 'vittoria'],
  domestico: ['domestico', 'cuccia'],
  coda: ['coda', 'codino'],
  corda: ['corda', 'nodo'],
  rete: ['rete', 'intreccio'],
  ruota: ['ruota', 'pneumatico'],
  motore: ['motore', 'benzina'],
  edilizia: ['edilizia', 'cantiere'],
  torre: ['torre', 'campanile'],
  tesoro: ['tesoro', 'bottino'],
  negozio: ['negozio', 'commercio'],
  cucito: ['cucito', 'sarta'],
  pesca: ['pesca', 'pescatore'],
  elettrodomestico: ['elettrodomestico', 'presa'],
  cavallo: ['cavallo', 'equitazione'],
  ferrovia: ['ferrovia', 'binario'],
  colazione: ['colazione', 'mattino'],
  ospedale: ['ospedale', 'pronto'],
  carnevale: ['carnevale', 'travestimento'],
  sedere: ['sedere', 'seduta'],
  volume: ['volume', 'capiente'],
};

// parola: temi (separati da spazi). Le parole sono comuni e concrete, adatte a ragazzi delle superiori.
const PAROLE = `
cane: animale domestico coda rumore
gatto: animale domestico coda notte
cavallo: animale fattoria corsa west medioevo
mucca: animale fattoria latte campagna
pecora: animale fattoria bianco campagna
maiale: animale fattoria cibo campagna
gallina: animale fattoria uccello colazione
gallo: animale fattoria uccello rumore colazione
coniglio: animale domestico magia campagna
topo: animale piccolo computer casa
leone: animale giungla regno giallo
tigre: animale giungla veloce
elefante: animale giungla grande circo
giraffa: animale giungla grande giallo
scimmia: animale giungla albero circo
orso: animale bosco montagna inverno
lupo: animale bosco notte fiaba luna
volpe: animale bosco fiaba rosso coda
cervo: animale bosco natale
scoiattolo: animale bosco albero piccolo
serpente: animale giungla paura deserto
coccodrillo: animale giungla acqua fiume
cammello: animale deserto egitto viaggio
pinguino: animale artico freddo uccello
foca: animale artico mare freddo
balena: animale mare grande blu
delfino: animale mare acqua blu
squalo: animale mare pesce paura
polpo: animale mare cucina
medusa: animale mare mitologia acqua
granchio: animale mare spiaggia rosso
tonno: pesce mare cibo cucina
salmone: pesce cibo cucina fiume
aquila: uccello animale montagna volare
gufo: uccello animale notte bosco
pappagallo: uccello animale giungla verde pirata
corvo: uccello animale nero
colomba: uccello animale bianco religione
cigno: uccello animale bianco acqua
gabbiano: uccello mare spiaggia volare
farfalla: insetto fiore volare giardino colore
ape: insetto fiore dolce giardino
formica: insetto piccolo lavoro
zanzara: insetto estate notte rumore
ragno: animale paura rete casa
mosca: insetto rumore piccolo
lumaca: animale lento giardino
tartaruga: animale lento mare
rana: animale acqua verde fiaba
drago: mitologia fuoco medioevo fiaba volare
unicorno: mitologia magia bianco cavallo
dinosauro: preistoria animale grande
mammut: preistoria animale freddo grande
asino: animale fattoria scuola
capra: animale fattoria montagna
anatra: animale uccello acqua fattoria
oca: animale uccello fattoria gioco
pulcino: animale uccello fattoria giallo piccolo
criceto: animale domestico piccolo
canarino: animale uccello giallo domestico
pavone: animale uccello colore coda
struzzo: animale uccello deserto veloce
ghepardo: animale giungla veloce corsa
ippopotamo: animale giungla acqua grande
rinoceronte: animale giungla grande
zebra: animale giungla bianco nero strada
koala: animale albero sonno lento
panda: animale bianco nero bosco
riccio: animale bosco punta
talpa: animale giardino segreto
pipistrello: animale notte volare paura
lucertola: animale sole giardino
cavalletta: insetto verde giardino
coccinella: insetto rosso giardino piccolo
lombrico: animale giardino pesca
scorpione: animale deserto paura coda
tricheco: animale artico mare
seppia: animale mare nero cucina
ostrica: mare gioiello cucina
gambero: mare cucina rosso
aragosta: mare cucina rosso
renna: natale animale freddo artico
mela: frutta albero rosso cibo scienza
pera: frutta albero verde cibo
banana: frutta giallo giungla cibo
arancia: frutta albero cibo bevanda colazione
limone: frutta giallo albero bevanda
fragola: frutta rosso dolce estate
ciliegia: frutta rosso albero dolce
uva: frutta campagna bevanda
anguria: frutta estate verde rosso grande
cocco: frutta albero isola spiaggia
ananas: frutta giallo isola
noce: albero frutta bosco
castagna: albero bosco fuoco cibo
carota: verdura campagna cibo inverno
pomodoro: verdura rosso cucina italia
patata: verdura cucina campagna cibo
cipolla: verdura cucina odore
aglio: verdura cucina odore paura
zucca: verdura fiaba festa cucina
fungo: bosco cucina cibo
peperoncino: verdura rosso caldo cucina
insalata: verdura verde cucina
pane: cibo forno cucina colazione
pizza: cibo forno italia
pasta: cibo cucina italia
formaggio: cibo latte giallo odore
burro: cibo latte cucina giallo colazione
uovo: cibo cucina uccello bianco colazione
cioccolato: dolce cibo bevanda
torta: dolce festa forno cibo
gelato: dolce freddo estate
biscotto: dolce forno cibo colazione
caramella: dolce colore bambino
miele: dolce giallo insetto colazione
zucchero: dolce bianco cucina
sale: cucina bianco mare
pepe: cucina nero odore
olio: cucina cibo italia
caffè: bevanda nero italia caldo colazione
tè: bevanda caldo acqua
latte: bevanda bianco fattoria colazione
succo: bevanda frutta colazione
vino: bevanda rosso festa italia
minestra: cibo cucina caldo
panino: cibo forno scuola
salame: cibo italia rosso
prosciutto: cibo italia fattoria
popcorn: cinema cibo festa
spaghetti: cibo italia cucina
lasagna: cibo italia forno
risotto: cibo italia cucina
polenta: cibo italia giallo
cornetto: dolce forno colazione
crostata: dolce forno frutta
panettone: dolce natale italia
marmellata: dolce frutta colazione
yogurt: latte cibo bianco colazione
mozzarella: latte cibo bianco italia
cono: forma dolce strada
cannuccia: bevanda piccolo estate
letto: casa sonno legno
divano: casa televisione sonno sedere
sedia: casa legno scuola ufficio sedere
tavolo: casa legno cucina ufficio
armadio: casa legno vestito volume
lampada: casa luce elettricita
specchio: casa vetro fiaba
finestra: casa vetro computer
porta: casa legno chiave calcio rete
chiave: casa metallo segreto musica
tappeto: casa magia volare
cuscino: casa sonno testa
coperta: casa sonno freddo inverno
frigorifero: casa cucina freddo elettrodomestico
forno: cucina caldo fuoco elettrodomestico
pentola: cucina metallo fuoco
padella: cucina metallo fuoco
cucchiaio: cucina metallo cibo
forchetta: cucina metallo punta
coltello: cucina tagliente arma metallo
piatto: cucina cibo rotondo
bicchiere: cucina vetro bevanda
bottiglia: vetro bevanda mare volume
tazza: cucina bevanda caldo colazione
lavatrice: casa elettrodomestico acqua pulizia
scopa: pulizia magia gioco casa
sapone: pulizia acqua odore
spugna: pulizia acqua mare
doccia: pulizia acqua casa
vasca: pulizia acqua casa
asciugamano: pulizia casa spiaggia
spazzolino: pulizia bocca casa
dentifricio: pulizia bocca bianco
pettine: pulizia testa casa
telecomando: televisione tecnologia casa mano
radio: musica tecnologia elettricita comunicazione
telefono: tecnologia comunicazione rumore
computer: tecnologia ufficio elettricita scuola rete
tastiera: computer musica ufficio mano
mouse: computer mano tecnologia
schermo: computer televisione cinema luce
stampante: computer ufficio carta
robot: tecnologia metallo cinema
batteria: elettricita musica tecnologia
lampadina: luce elettricita vetro
candela: luce fuoco festa religione
torcia: luce notte fuoco
fiammifero: fuoco legno piccolo
camino: casa fuoco caldo natale inverno
orologio: tempo metallo rotondo
sveglia: tempo sonno rumore colazione
calendario: tempo carta numero
campana: religione rumore metallo natale torre
matita: scrittura disegno legno scuola
penna: scrittura scuola uccello
gomma: scuola ruota disegno
quaderno: scuola carta scrittura
zaino: scuola viaggio montagna volume
lavagna: scuola nero scrittura
banco: scuola legno negozio
righello: scuola matematica disegno
compasso: scuola matematica forma navigazione
calcolatrice: matematica scuola tecnologia numero
libro: scuola carta scrittura
dizionario: libro scuola scrittura
mappa: viaggio pirata tesoro carta
mappamondo: viaggio scuola rotondo
forbici: tagliente scuola carta cucito
colla: scuola carta disegno
busta: posta carta ufficio
francobollo: posta carta piccolo
lettera: posta carta scrittura amore
cartolina: posta viaggio carta
pacco: posta natale volume
giornale: carta comunicazione libro
cartella: scuola ufficio computer
scrivania: ufficio legno computer
graffetta: ufficio metallo carta piccolo
timbro: ufficio posta carta
pallone: palla calcio sport rotondo
rete: calcio pesca computer
racchetta: sport palla mano
bicicletta: sport ruota strada veicolo
sci: sport inverno montagna
pattini: sport inverno freddo ruota
casco: sport testa veicolo guerra
medaglia: premio sport metallo oro
coppa: premio sport metallo bevanda
trofeo: premio sport oro
arbitro: sport calcio legge
fischietto: sport calcio rumore
stadio: calcio sport citta
canestro: sport palla squadra
piscina: sport acqua estate blu
corda: sport circo navigazione montagna
maratona: corsa sport antico
cronometro: tempo sport corsa
traguardo: corsa sport premio
podio: premio sport corsa
scacchi: gioco bianco nero regno torre
dado: gioco forma numero cucina
domino: gioco nero bianco
puzzle: gioco forma bambino
bambola: gioco bambino casa
aquilone: gioco volare vento cielo coda
altalena: gioco giardino bambino corda
trottola: gioco rotondo bambino
biglia: gioco vetro rotondo
videogioco: gioco computer tecnologia
chitarra: musica legno corda
pianoforte: musica legno nero bianco
violino: musica legno corda
tromba: musica metallo rumore
tamburo: musica rumore guerra
flauto: musica legno fiaba
arpa: musica corda religione
microfono: musica tecnologia teatro
concerto: musica festa teatro
orchestra: musica teatro grande
nota: musica scrittura scuola
disco: musica rotondo nero
cuffie: musica tecnologia testa
pennello: arte disegno pulizia
quadro: arte forma casa
statua: arte pietra antico
museo: arte antico citta
fotografia: arte tecnologia cinema famiglia
attore: cinema teatro lavoro
regista: cinema teatro lavoro
sipario: teatro rosso cinema
maschera: teatro festa segreto carnevale
clown: circo teatro bambino
pagliaccio: circo bambino paura carnevale
giocoliere: circo palla mano
trapezio: circo forma volare
tenda: circo deserto viaggio casa
biglietto: cinema teatro viaggio carta ferrovia
auto: veicolo strada motore ruota
camion: veicolo strada motore grande
autobus: veicolo strada citta scuola
treno: veicolo viaggio veloce ferrovia
aereo: veicolo volare viaggio cielo
elicottero: veicolo volare rumore
nave: navigazione mare viaggio grande
barca: navigazione mare acqua pesca
sottomarino: navigazione mare guerra
vela: navigazione mare vento
ancora: navigazione mare metallo pirata
timone: navigazione mare ruota
faro: mare luce torre navigazione
porto: mare navigazione citta
razzo: spazio volare veloce fuoco luna
astronauta: spazio lavoro luna
satellite: spazio tecnologia cielo
moto: veicolo motore strada veloce
monopattino: veicolo ruota strada
semaforo: strada citta luce colore
benzina: motore veicolo odore
ponte: citta fiume edilizia navigazione
galleria: strada montagna arte ferrovia
autostrada: strada viaggio veloce
volante: veicolo ruota rotondo
taxi: veicolo citta giallo
ambulanza: veicolo salute rumore ospedale
polizia: legge veicolo citta
pompiere: fuoco lavoro acqua rosso
grattacielo: citta edilizia grande cielo torre
piazza: citta italia strada
fontana: citta acqua giardino
parco: citta giardino albero
negozio: citta denaro lavoro
mercato: negozio cibo citta
supermercato: negozio cibo denaro
banca: denaro citta ufficio
cantiere: edilizia lavoro rumore
gru: edilizia uccello grande metallo
mattone: edilizia rosso casa
cemento: edilizia pietra citta
scala: casa edilizia musica
martello: attrezzo metallo edilizia legge
chiodo: attrezzo metallo punta
cacciavite: attrezzo metallo punta
sega: attrezzo tagliente legno
trapano: attrezzo rumore elettricita
pinza: attrezzo metallo mano
ascia: attrezzo tagliente legno arma
pala: attrezzo giardino spiaggia
rastrello: attrezzo giardino campagna
secchio: pulizia acqua spiaggia volume
albero: bosco natale legno
foglia: albero verde bosco
rosa: fiore rosso amore giardino
girasole: fiore giallo sole estate
tulipano: fiore giardino colore
margherita: fiore bianco italia
cactus: deserto verde punta west
erba: giardino verde campagna
fieno: fattoria campagna giallo cavallo
grano: campagna giallo forno
seme: giardino campagna piccolo
radice: albero matematica giardino
ramo: albero legno bosco
pino: albero bosco montagna natale
quercia: albero bosco legno
palma: albero spiaggia isola deserto
vulcano: montagna fuoco isola caldo
lago: acqua montagna pesca
cascata: acqua montagna rumore fiume
onda: mare acqua spiaggia vento blu
conchiglia: mare spiaggia animale
sabbia: spiaggia deserto tempo giallo
scoglio: mare pietra spiaggia
grotta: montagna pietra preistoria tesoro
sasso: pietra gioco piccolo
diamante: gioiello pietra vetro denaro tesoro
perla: gioiello mare bianco rotondo tesoro
anello: gioiello oro rotondo amore mano
collana: gioiello oro rotondo
corona: gioiello regno oro testa
argento: metallo gioiello premio luna chimica
ferro: metallo vestito attrezzo
rame: metallo rosso elettricita chimica
moneta: denaro metallo rotondo oro tesoro
banconota: denaro carta numero
portafoglio: denaro vestito carta
salvadanaio: denaro bambino volume
forziere: tesoro pirata legno chiave
nuvola: cielo meteo bianco
pioggia: meteo acqua cielo
neve: inverno freddo bianco meteo
ghiaccio: freddo acqua inverno artico
fulmine: meteo luce elettricita cielo rumore
tuono: meteo rumore cielo
arcobaleno: colore cielo meteo
tempesta: meteo vento mare
nebbia: meteo bianco freddo
stella: spazio cielo notte natale
pianeta: spazio rotondo cielo
cometa: spazio cielo natale coda
telescopio: spazio scienza vetro occhio luna
meteorite: spazio pietra fuoco preistoria
alba: sole cielo luce colazione
tramonto: sole cielo rosso
ombra: sole nero luce
oasi: deserto acqua viaggio
piramide: egitto antico forma pietra
mummia: egitto antico paura
sfinge: egitto antico mitologia
faraone: egitto antico regno
naso: corpo odore testa
orecchio: corpo rumore testa
dente: bocca bianco corpo
lingua: bocca corpo scuola
capelli: testa corpo colore
barba: testa corpo natale
cervello: testa corpo scienza
polmone: corpo salute ospedale
scheletro: corpo paura scienza
ginocchio: corpo sport corsa
dito: mano corpo piccolo
unghia: mano corpo piede
gamba: corpo piede corsa
braccio: corpo mano sport
pancia: corpo cibo grande
medico: salute lavoro ospedale
infermiere: salute lavoro ospedale
ospedale: salute citta edilizia
farmacia: salute negozio citta
pillola: salute piccolo rotondo
siringa: salute punta ospedale
cerotto: salute bambino ospedale
termometro: salute caldo freddo scienza
dentista: salute bocca lavoro
occhiali: occhio vetro vestito
lente: occhio vetro scienza
microscopio: scienza vetro occhio piccolo
provetta: scienza chimica vetro
atomo: scienza chimica piccolo
magnete: scienza metallo elettricita
cappello: vestito testa magia west
sciarpa: vestito inverno freddo
guanto: vestito mano inverno
cappotto: vestito inverno freddo
camicia: vestito ufficio bianco
cravatta: vestito ufficio festa
pantaloni: vestito corpo piede
scarpa: vestito piede fiaba
stivale: vestito piede italia west
calzino: vestito piede natale
pigiama: vestito sonno notte
costume: vestito spiaggia estate carnevale
maglione: vestito inverno caldo
bottone: vestito cucito rotondo piccolo
ago: cucito punta metallo
filo: cucito corda elettricita
lana: cucito caldo inverno fattoria
seta: cucito vestito insetto
borsa: vestito denaro viaggio
valigia: viaggio vestito volume
ombrello: meteo vestito spiaggia
tasca: vestito denaro piccolo
cintura: vestito sport veicolo
castello: medioevo regno fiaba pietra torre
cavaliere: medioevo cavallo guerra regno
spada: medioevo arma guerra tagliente
scudo: medioevo guerra arma
armatura: medioevo guerra metallo
arco: arma sport legno
freccia: arma punta sport
lancia: arma punta medioevo
cannone: arma guerra pirata rumore
bomba: guerra arma rumore
carrarmato: guerra veicolo metallo
soldato: guerra lavoro arma
re: regno gioco fiaba
regina: regno gioco fiaba
principe: regno fiaba cavallo
principessa: regno fiaba amore
trono: regno oro sedere
strega: magia fiaba paura notte
mago: magia fiaba circo
fata: magia fiaba volare
bacchetta: magia fiaba legno
pozione: magia bevanda chimica
fantasma: paura notte bianco
vampiro: paura notte bocca
mostro: paura fiaba grande
gigante: fiaba grande mitologia
nano: fiaba piccolo bosco
orco: fiaba paura grande
sirena: mare mitologia fiaba rumore coda
bandiera: pirata italia vento
uncino: pirata metallo punta
sceriffo: west legge cavallo
pistola: west arma rumore
diligenza: west veicolo cavallo
gladiatore: antico guerra cinema
colosseo: antico italia citta
tempio: antico religione edilizia
colonna: antico edilizia pietra
anfora: antico mare bevanda
papiro: egitto antico carta
fossile: preistoria pietra scienza
clava: preistoria arma legno
angelo: religione volare bianco natale
presepe: natale religione bambino famiglia
regalo: natale festa amore
slitta: natale inverno freddo veicolo
pupazzo: inverno gioco bambino
palloncino: festa gioco volare colore
coriandoli: festa colore carta carnevale
petardo: festa rumore fuoco
nastro: natale festa corda
fiocco: natale inverno bianco
campanello: casa rumore ruota
lenzuolo: casa sonno bianco paura
culla: bambino sonno legno
biberon: bambino latte bevanda
ciuccio: bambino bocca sonno
pannolino: bambino pulizia piccolo
passeggino: bambino ruota strada
nonna: famiglia fiaba cucina
gemelli: famiglia bambino numero
sposa: amore festa bianco famiglia
bacio: amore bocca fiaba
cuoco: cucina lavoro cibo
cameriere: lavoro cucina bevanda
contadino: campagna lavoro fattoria
pescatore: pesca mare lavoro rete
marinaio: navigazione mare lavoro
pilota: volare veicolo lavoro corsa
postino: posta lavoro carta
maestro: scuola lavoro musica
pittore: arte lavoro colore
scultore: arte pietra lavoro
idraulico: acqua lavoro attrezzo
elettricista: elettricita lavoro attrezzo
meccanico: motore lavoro attrezzo
muratore: edilizia lavoro casa
poliziotto: legge lavoro citta
scienziato: scienza lavoro chimica
giornalista: lavoro comunicazione scrittura televisione
fornaio: forno lavoro colazione
giudice: legge lavoro premio
avvocato: legge lavoro ufficio
detective: segreto legge occhio
prigione: legge chiave metallo
catena: metallo ruota legge
lucchetto: chiave metallo segreto
cassaforte: denaro chiave metallo segreto
codice: segreto computer legge
password: segreto computer chiave
virus: salute computer piccolo
email: computer posta comunicazione
cavo: elettricita tecnologia computer
presa: elettricita casa elettrodomestico
spina: elettricita fiore punta
pila: elettricita gioco tecnologia
lampione: luce strada citta notte
cartello: strada citta legge
parcheggio: strada citta veicolo
marciapiede: strada citta piede
biblioteca: libro scuola citta
pagina: libro carta numero
copertina: libro carta colore
poesia: libro scrittura amore
inchiostro: scrittura nero colore
diario: libro segreto scrittura scuola
galassia: spazio cielo grande
alieno: spazio paura cinema
astronave: spazio veicolo volare
palestra: sport scuola corpo
golf: sport palla vestito
tennis: sport palla rete
pallavolo: sport palla squadra rete
rugby: sport palla squadra
maglia: sport vestito calcio squadra
allenatore: sport calcio lavoro squadra
tifoso: calcio sport rumore
campione: premio sport oro
collina: campagna montagna verde
valle: montagna campagna fiume
ghiacciaio: montagna freddo artico
iceberg: artico freddo mare
igloo: artico freddo casa
binario: ferrovia viaggio metallo
stazione: ferrovia viaggio citta
locomotiva: ferrovia veicolo motore
vagone: ferrovia veicolo volume
cesto: fattoria cibo legno
scatola: carta natale casa volume
borraccia: bevanda montagna sport
lanterna: luce fuoco notte
bussola: navigazione viaggio montagna
acquario: pesce acqua casa vetro
sardina: pesce mare cibo piccolo
trota: pesce fiume pesca cibo
mirtillo: frutta blu bosco piccolo
bradipo: animale lento albero giungla
antenna: televisione tecnologia casa insetto
panchina: sedere giardino legno citta
poltrona: sedere casa teatro
binocolo: occhio vetro viaggio
`;

// legge il testo: { parola: [temi] }
function leggi(testo) {
  const out = {};
  for (const riga of testo.trim().split('\n')) {
    const [p, t] = riga.split(':');
    out[p.trim()] = t.trim().split(/\s+/);
  }
  return out;
}

module.exports = { TEMI, ASSOCIAZIONI: leggi(PAROLE) };
