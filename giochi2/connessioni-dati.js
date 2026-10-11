// CONNESSIONI: la raccolta dei puzzle, scritti a mano e controllati uno per uno.
// Ogni puzzle sono 4 righe (una per gruppo), separate da una riga vuota, in ordine di difficoltà:
// giallo (facile), verde, blu, viola (difficile: giochi di parole, frasi fatte, parole nascoste).
// Formato di una riga:   Tema: PAROLA, PAROLA, PAROLA, PAROLA | spiegazione facoltativa
// Le "trappole" sono volute: una parola sembra andare in due gruppi, ma solo una divisione funziona davvero
// (di solito uno dei due gruppi ha esattamente quattro candidati). La spiegazione lo racconta a fine gruppo.
const TESTO = `
Pianeti del sistema solare: MERCURIO, SATURNO, URANO, NETTUNO | Mercurio è anche un elemento chimico, ma serve ai pianeti
Elementi chimici: FERRO, RAME, ZINCO, ORO
___ di mare: STELLA, RICCIO, LUPO, FRUTTI | stella di mare, riccio di mare, lupo di mare, frutti di mare
Iniziano con un numero: DUELLO, TRENO, NOVELLA, OTTOBRE | DUE-llo, TRE-no, NOVE-lla, OTTO-bre

Tonalità di rosso: CREMISI, PORPORA, SCARLATTO, BORDEAUX
Formaggi italiani: PARMIGIANO, GORGONZOLA, FONTINA, ASIAGO | Asiago è anche un paese del Veneto, ma qui è il formaggio
Città del Veneto: VERONA, PADOVA, VICENZA, TREVISO
Iniziano con una nota musicale: REMO, MIELE, LAVAGNA, SOLDATO | RE-mo, MI-ele, LA-vagna, SOL-dato

Strumenti a corde: CHITARRA, VIOLINO, ARPA, MANDOLINO
Serpenti: COBRA, VIPERA, BOA, ANACONDA
Linguaggi di programmazione: PYTHON, JAVA, RUBY, SWIFT | Python vuol dire pitone, ma è un linguaggio
___ nera: SCATOLA, PECORA, VEDOVA, CRONACA | scatola nera, pecora nera, vedova nera, cronaca nera

Pasta corta: PENNE, FUSILLI, RIGATONI, FARFALLE | le farfalle sono insetti, ma qui sono pasta
Insetti: FORMICA, ZANZARA, CICALA, GRILLO | il Grillo Parlante è di Pinocchio, ma il grillo serve agli insetti
Personaggi di Pinocchio: GEPPETTO, MANGIAFUOCO, LUCIGNOLO, VOLPE | la Volpe, compagna del Gatto
Palindromi (si leggono uguali al contrario): OSSO, RADAR, AVEVA, OTTO

Capitali europee: PARIGI, BERLINO, MADRID, LISBONA
Fiumi italiani: PO, TEVERE, ARNO, ADIGE
Vulcani italiani: ETNA, VESUVIO, STROMBOLI, VULCANO
Modelli di auto italiane: PANDA, PUNTO, TIPO, MITO

Sport con la palla: CALCIO, TENNIS, BASKET, PALLAVOLO
Ossa del corpo umano: FEMORE, TIBIA, OMERO, RADIO | Omero è anche un poeta, ma l'omero serve alle ossa
Poeti dell'antichità: VIRGILIO, OVIDIO, SAFFO, ORAZIO
Iniziano con un mezzo di trasporto: AUTORE, MOTORE, TRAMONTO, BUSSOLA | AUTO-re, MOTO-re, TRAM-onto, BUS-sola

Animali della fattoria: MUCCA, PECORA, MAIALE, CAPRA
Segni zodiacali: ARIETE, TORO, LEONE, BILANCIA | ariete e toro sono animali della fattoria, la bilancia sta in cucina…
Utensili da cucina: MESTOLO, PENTOLA, COLINO, GRATTUGIA
Nascondono una parte del corpo: MANOVRA, PIEDISTALLO, TESTARDO, OCCHIALI | MANO-vra, PIEDI-stallo, TESTA-rdo, OCCHI-ali

Materie scolastiche: STORIA, GEOGRAFIA, MATEMATICA, CHIMICA
Periferiche del computer: TASTIERA, MOUSE, MONITOR, STAMPANTE | la tastiera è anche uno strumento musicale
Strumenti musicali: PIANOFORTE, FLAUTO, TROMBA, TAMBURO
Contengono tutte e cinque le vocali: AIUOLE, SEQUOIA, PNEUMATICO, EQUAZIONE

Frutta: KIWI, PERA, BANANA, ANANAS
Città toscane: FIRENZE, PISA, SIENA, LUCCA | c'è anche la torre di Pisa, ma Pisa serve alla Toscana
Torre di ___: BABELE, LONDRA, CONTROLLO, GUARDIA | torre di Babele, di Londra, di controllo, di guardia
___ d'oro: PALLONE, NOZZE, CUORE, LEONE | Pallone d'oro, nozze d'oro, cuore d'oro, Leone d'oro

Imperatori romani: AUGUSTO, NERONE, CALIGOLA, TRAIANO
Re di Roma: ROMOLO, NUMA, TULLO, SERVIO | Romolo, Numa Pompilio, Tullo Ostilio, Servio Tullio
Personaggi dei Promessi sposi: RENZO, LUCIA, ABBONDIO, INNOMINATO
Colpo di ___: FULMINE, STATO, SCENA, GENIO | colpo di fulmine, di Stato, di scena, di genio

Continenti: ASIA, AFRICA, OCEANIA, AMERICA | l'Europa è un continente, ma qui serve alle lune
Lune di Giove: IO, EUROPA, GANIMEDE, CALLISTO | i quattro satelliti scoperti da Galileo
Mari italiani: TIRRENO, ADRIATICO, IONIO, LIGURE
___ magico: TAPPETO, QUADRATO, TOCCO, NUMERO | tappeto magico, quadrato magico, tocco magico, numero magico

Unità di misura dei dati: BIT, BYTE, KILOBYTE, GIGABYTE
Componenti del computer: PROCESSORE, RAM, DISCO, ALIMENTATORE
Tasti della tastiera: INVIO, SPAZIO, ESC, MAIUSC
Termini informatici che in inglese sono animali: MOUSE, BUG, WORM, PYTHON | topo, insetto, verme, pitone

Grandi autori italiani: DANTE, PETRARCA, BOCCACCIO, MANZONI
Personaggi della Divina Commedia: VIRGILIO, BEATRICE, ULISSE, FARINATA
Poemi dell'antichità: ILIADE, ODISSEA, ENEIDE, METAMORFOSI
___ di carta: TIGRE, CASTELLO, FAZZOLETTO, BARCHETTA | tigre di carta, castello di carta, fazzoletto di carta, barchetta di carta

Sport invernali: SCI, BOB, CURLING, SLITTINO
Ruoli nel calcio: PORTIERE, TERZINO, MEDIANO, ATTACCANTE
Termini del tennis: ACE, SET, DRITTO, ROVESCIO
Nascondono un metallo: TESORO, FERROVIA, CARAMELLA, CROMOSOMA | tes-ORO, FERRO-via, ca-RAME-lla, CROMO-soma

Spezie: PEPE, CANNELLA, ZAFFERANO, PAPRIKA
Erbe aromatiche: BASILICO, ROSMARINO, SALVIA, ORIGANO
Dolci italiani: TIRAMISÙ, CANNOLO, PANETTONE, BABÀ
Con la doppia Z: PIZZA, PAZZO, MEZZO, RAZZO

Generi musicali: ROCK, JAZZ, BLUES, RAP
Compositori italiani: VERDI, PUCCINI, ROSSINI, VIVALDI | Verdi è anche un colore al plurale, ma serve ai compositori
Colori al plurale: ROSSI, NERI, BIANCHI, GIALLI
Indicazioni di tempo musicale: ADAGIO, ALLEGRO, ANDANTE, PRESTO | sembrano parole comuni, ma sono scritte sugli spartiti

Felini: LEONE, TIGRE, GIAGUARO, LINCE | esistono il pesce leone e il pesce tigre, ma qui sono felini
Uccelli: AQUILA, PASSERO, GABBIANO, PICCIONE
Pesci: TONNO, SALMONE, TROTA, MERLUZZO
Pesce ___: SPADA, PALLA, GATTO, PAGLIACCIO | pesce spada, pesce palla, pesce gatto, pesce pagliaccio

Stanze della casa: CUCINA, BAGNO, SOGGIORNO, CAMERA
Mobili: ARMADIO, DIVANO, TAVOLO, SEDIA | anche il comodino è un mobile, ma serve all'ultimo gruppo
Elettrodomestici: FRIGO, FORNO, LAVATRICE, TOSTAPANE
Iniziano con una città italiana: ROMANZO, ASTICE, BARILE, COMODINO | ROMA-nzo, ASTI-ce, BARI-le, COMO-dino

Mezzi di trasporto: TRENO, AEREO, NAVE, AUTOBUS
Parti della bicicletta: PEDALE, CATENA, SELLA, MANUBRIO | anche il cavallo ha la sella, ma serve alla bici
Finimenti del cavallo: STAFFA, BRIGLIA, MORSO, REDINI
Porta___: FOGLIO, CENERE, BANDIERA, CHIAVI | portafoglio, portacenere, portabandiera, portachiavi

Grandi esploratori: COLOMBO, MAGELLANO, VESPUCCI, POLO | Marco Polo: la polo è anche una maglia, ma serve agli esploratori
Sport in acqua: NUOTO, PALLANUOTO, TUFFI, CANOTTAGGIO
Capi d'abbigliamento: FELPA, CANOTTIERA, GIACCA, CAMICIA
___ d'Italia: GIRO, BANCA, UNITÀ, CAMPIONE | Giro d'Italia, Banca d'Italia, Unità d'Italia, campione d'Italia

Verdure: CAROTA, ZUCCHINA, MELANZANA, SPINACI
Legumi: FAGIOLI, CECI, LENTICCHIE, PISELLI
Cereali: GRANO, ORZO, MAIS, RISO
Finiscono con ORO: LAVORO, ALLORO, DECORO, POMODORO | il pomodoro è anche un ortaggio, ma serve qui

Nell'astuccio: MATITA, GOMMA, PENNA, RIGHELLO
Pesci di mare: ORATA, SPIGOLA, SOGLIOLA, SARDINA
Figure geometriche: CERCHIO, QUADRATO, TRIANGOLO, ROMBO | il rombo è anche un pesce e il triangolo uno strumento
Strumenti a percussione: TAMBURO, PIATTI, XILOFONO, NACCHERE

Stagioni: PRIMAVERA, ESTATE, AUTUNNO, INVERNO
Fenomeni atmosferici: PIOGGIA, NEVE, GRANDINE, NEBBIA
Punti cardinali (con altri nomi): LEVANTE, PONENTE, MERIDIONE, SETTENTRIONE | est, ovest, sud, nord
Venti: SCIROCCO, MAESTRALE, LIBECCIO, TRAMONTANA | anche levante e ponente sono venti, ma servono ai punti cardinali

In bagno: SPAZZOLINO, DENTIFRICIO, SAPONE, ASCIUGAMANO
Professioni sanitarie: MEDICO, INFERMIERE, DENTISTA, FARMACISTA
Artigiani: FALEGNAME, IDRAULICO, ELETTRICISTA, FABBRO
Contengono MANO: ROMANO, MANOVELLA, MANOPOLA, SCIAMANO | anche asciugaMANO, ma serve al bagno

Paesi del Sud America: BRASILE, ARGENTINA, CILE, PERÙ
Paesi asiatici: CINA, GIAPPONE, INDIA, COREA
Paesi africani: EGITTO, MAROCCO, KENYA, SENEGAL
Nascondono un paese: CILENTO, PERUGIA, MALIZIA, CUBATURA | CILE-nto, PERU-gia, MALI-zia, CUBA-tura

Parti della cellula: NUCLEO, MEMBRANA, CITOPLASMA, MITOCONDRIO | anche memb-RANA nasconde un animale, ma serve alla cellula
Organi del corpo: CUORE, FEGATO, POLMONE, RENE
Gas: OSSIGENO, AZOTO, ELIO, IDROGENO
Nascondono un animale: RATTOPPO, FALCONE, CANESTRO, BOATO | RATTO-ppo, FALCO-ne, CANE-stro, BOA-to

Personaggi delle fiabe: CENERENTOLA, BIANCANEVE, RAPERONZOLO, POLLICINO
I sette nani: BRONTOLO, PISOLO, MAMMOLO, GONGOLO
Sinonimi di sonnellino: PISOLINO, RIPOSINO, PENNICHELLA, SIESTA
A ___ (modi di dire): CASO, MEMORIA, VISTA, BRACCIO | a caso, a memoria, a vista, a braccio

Regioni italiane: PIEMONTE, LIGURIA, CALABRIA, SARDEGNA
Capoluoghi di regione: TORINO, GENOVA, CATANZARO, CAGLIARI
Isole minori italiane: ELBA, CAPRI, ISCHIA, LAMPEDUSA
Insalata ___: RUSSA, MISTA, VERDE, CAPRESE | insalata russa, mista, verde, caprese

Sul telefono: APP, NOTIFICA, SCHERMO, BATTERIA | la batteria è anche uno strumento, ma serve al telefono
Parti di un'email: OGGETTO, MITTENTE, DESTINATARIO, ALLEGATO
Comandi di modifica: COPIA, INCOLLA, TAGLIA, ANNULLA
Strumenti a percussione: TIMPANO, GONG, BONGO, CAMPANA

Personaggi del Risorgimento: GARIBALDI, MAZZINI, CAVOUR, MAMELI
Repubbliche marinare: VENEZIA, GENOVA, PISA, AMALFI
Grandi famiglie del Rinascimento: MEDICI, SFORZA, ESTE, GONZAGA
Anagrammi di ROMA: ORMA, RAMO, MORA, ARMO

Attrezzi da palestra: MANUBRI, BILANCIERE, PANCA, CYCLETTE
Arti marziali giapponesi: KARATE, JUDO, KENDO, SUMO | anche queste sono parole giapponesi, ma formano un gruppo a sé
Atletica leggera: MARATONA, OSTACOLI, STAFFETTA, DECATHLON
Parole giapponesi entrate nell'italiano: KARAOKE, TSUNAMI, SUSHI, EMOJI

Generi letterari: ROMANZO, POESIA, FAVOLA, SAGGIO
Figure retoriche: METAFORA, SIMILITUDINE, ANAFORA, ONOMATOPEA | anche l'iperbole è una figura retorica, ma serve alle coniche
Parti di un libro: CAPITOLO, INDICE, COPERTINA, PREFAZIONE
Curve della matematica (coniche): PARABOLA, ELLISSE, IPERBOLE, CIRCONFERENZA

Condimenti: OLIO, ACETO, SALE, PEPE
Pizze classiche: MARGHERITA, MARINARA, DIAVOLA, CAPRICCIOSA | la margherita è anche un fiore, ma serve alle pizze
Fiori: ROSA, TULIPANO, GIGLIO, VIOLA
Salse e sughi: PESTO, RAGÙ, BESCIAMELLA, MAIONESE

Dei dell'Olimpo: ZEUS, ERA, ATENA, ARES | anche Apollo è un dio, ma serve allo spazio
Eroi greci: ACHILLE, ULISSE, PERSEO, TESEO
Programmi spaziali: GEMINI, MERCURY, SOYUZ, APOLLO
Con una S davanti diventano un'altra parola: PORCO, PALLA, CARPA, CAVO | sporco, spalla, scarpa, scavo (e anche sera, ma Era serve agli dei)

Dita della mano: POLLICE, INDICE, MEDIO, ANULARE
Parti dell'occhio: IRIDE, PUPILLA, CORNEA, RETINA
Valute: EURO, DOLLARO, STERLINA, YEN
Muscoli: BICIPITE, TRICIPITE, DELTOIDE, QUADRICIPITE

Strumenti a fiato: FLAUTO, CLARINETTO, SASSOFONO, TROMBA | esiste la tromba marina, ma qui è uno strumento a fiato
Uccelli marini: GABBIANO, ALBATROS, PELLICANO, CORMORANO
Parti di una nave: PRUA, POPPA, TIMONE, ALBERO
___ marina: STELLA, BREZZA, CORRENTE, FANTERIA | stella marina, brezza marina, corrente marina, fanteria marina

Formati di file: PDF, JPG, MP3, DOCX
Linguaggi del web: HTML, CSS, JAVASCRIPT, PHP
Sistemi operativi: WINDOWS, LINUX, ANDROID, IOS
Dispositivi di rete: ROUTER, MODEM, SWITCH, HUB

Fiumi del mondo: NILO, DANUBIO, AMAZZONI, GANGE
Deserti: SAHARA, GOBI, KALAHARI, ATACAMA
Catene montuose: ALPI, ANDE, HIMALAYA, APPENNINI
Monete antiche: DENARO, SESTERZIO, FIORINO, DUCATO

Persone a scuola: PRESIDE, BIDELLO, PROFESSORE, STUDENTE
Oggetti della classe: LAVAGNA, CATTEDRA, BANCO, GESSO | gesso e lavagna (l'ardesia) sono anche rocce, ma servono alla classe
Giudizi scolastici: SUFFICIENTE, DISTINTO, OTTIMO, BUONO
Rocce: MARMO, GRANITO, BASALTO, TUFO

Colori dell'arcobaleno: ROSSO, ARANCIONE, GIALLO, VERDE | il giallo è anche un genere di film, ma serve all'arcobaleno
Generi di film: HORROR, WESTERN, FANTASY, COMMEDIA
Premi dei festival del cinema: OSCAR, LEONE, ORSO, PALMA | Leone d'oro, Orso d'oro, Palma d'oro (Sergio Leone era un regista, ma qui è il premio)
Registi italiani: FELLINI, SORRENTINO, TORNATORE, MONICELLI

Cuccioli: PULCINO, VITELLO, AGNELLO, PULEDRO
Versi degli animali: MUGGITO, RAGLIO, NITRITO, BELATO
Case degli animali: TANA, NIDO, ALVEARE, STALLA | si dice anche "fare il nido", ma serve alle case degli animali
Fare il ___: PALO, TIFO, FILO, PIENO | fare il palo, il tifo, il filo, il pieno

Civiltà antiche: EGIZI, GRECI, ROMANI, ETRUSCHI | anche ROMAni contiene ROMA, ma serve alle civiltà
Monumenti di Roma: COLOSSEO, PANTHEON, CAMPIDOGLIO, VITTORIANO
Meraviglie del mondo antico: PIRAMIDE, FARO, COLOSSO, MAUSOLEO | piramide di Giza, faro di Alessandria, colosso di Rodi, mausoleo di Alicarnasso
Contengono ROMA: AROMA, ROMANZO, CROMATICO, ROMANTICO

Sport con la racchetta: TENNIS, PADEL, SQUASH, BADMINTON
Sport di squadra: RUGBY, HOCKEY, PALLAMANO, BASEBALL
Termini del calcio: RIGORE, FUORIGIOCO, PUNIZIONE, AUTOGOL
Attrezzi da lavoro: MARTELLO, CACCIAVITE, PINZA, SEGA

Bevande calde: CAFFÈ, TÈ, CIOCCOLATA, TISANA
Tipi di caffè: ESPRESSO, MACCHIATO, CORRETTO, RISTRETTO
Ordini religiosi: FRANCESCANI, DOMENICANI, BENEDETTINI, CAPPUCCINI | i cappuccini sono anche caffè, ma qui sono frati
Lettere greche: ALFA, BETA, GAMMA, DELTA

Lingue ufficiali della Svizzera: TEDESCO, FRANCESE, ITALIANO, ROMANCIO | anche "alla francese" si dice in cucina, ma serve alla Svizzera
Paesi con l'euro: FRANCIA, GERMANIA, SPAGNA, GRECIA
Paesi europei senza l'euro: SVIZZERA, NORVEGIA, POLONIA, UNGHERIA
In cucina "alla ___": CARBONARA, MILANESE, NORMA, PIZZAIOLA

Giochi di carte: SCOPA, BRISCOLA, TRESSETTE, BURRACO | anche la scopa serve a pulire, ma qui è un gioco
Per pulire casa: SPUGNA, STRACCIO, PALETTA, SECCHIO
Semi delle carte napoletane: COPPE, DENARI, SPADE, BASTONI
Armi antiche: PUGNALE, LANCIA, ALABARDA, BALESTRA

Alberi: QUERCIA, PINO, ABETE, BETULLA
Parti di una pianta: RADICE, FUSTO, FOGLIA, FIORE | anche la radice quadrata è matematica, ma serve alla pianta
Termini di matematica: POTENZA, FRAZIONE, ESPONENTE, DIVISORE
Nascondono un albero: COLMO, LACERO, SPINOSO, SPALMARE | c-OLMO, l-ACERO, s-PINO-so, s-PALMA-re

Mezzi pubblici: TRAM, METRO, AUTOBUS, FILOBUS | il metro è anche un'unità di misura, ma qui è la metropolitana
Parti della strada: MARCIAPIEDE, CORSIA, INCROCIO, ROTONDA
Cartelli stradali: STOP, PRECEDENZA, DIVIETO, OBBLIGO
Unità di misura: LITRO, GRAMMO, SECONDO, VOLT

Voci del canto: SOPRANO, TENORE, BARITONO, BASSO
Opere di Verdi: AIDA, RIGOLETTO, TRAVIATA, NABUCCO
Teatri italiani: SCALA, FENICE, REGIO, MASSIMO | la fenice è anche un animale mitologico, ma qui è il teatro di Venezia
Creature mitologiche: DRAGO, GRIFONE, UNICORNO, CENTAURO

Pasta lunga: SPAGHETTI, BUCATINI, LINGUINE, TAGLIATELLE
Pasta ripiena: TORTELLINI, RAVIOLI, AGNOLOTTI, CAPPELLETTI
Specialità siciliane: CANNOLI, CASSATA, GRANITA, ARANCINI | gli arancini sono di riso, ma qui contano come specialità siciliane
Piatti a base di riso: RISOTTO, SUPPLÌ, PAELLA, SUSHI

Numeri primi: DUE, TRE, CINQUE, SETTE | il due è anche pari, ma serve ai numeri primi
Numeri pari: QUATTRO, SEI, OTTO, DIECI
Risultati delle operazioni: SOMMA, DIFFERENZA, PRODOTTO, QUOZIENTE
Numero ___: VERDE, CIVICO, ROMANO, ATOMICO | numero verde, civico, romano, atomico

Grandezze fisiche: MASSA, VELOCITÀ, FORZA, ENERGIA | Massa è anche una città toscana, ma serve alla fisica
Scienziati: GALILEO, NEWTON, EINSTEIN, VOLTA
In laboratorio: PROVETTA, BECCHER, MICROSCOPIO, BILANCIA
Città toscane: PRATO, AREZZO, LIVORNO, GROSSETO

Nel castello: TORRE, FOSSATO, MURA, MERLI | merli e torre sembrano uccelli e scacchi, ma servono al castello
Uccelli al plurale: PASSERI, CORVI, PICCHI, FRINGUELLI
Pezzi degli scacchi: RE, ALFIERE, CAVALLO, PEDONE
Personaggi della leggenda di re Artù: ARTÙ, LANCILLOTTO, MERLINO, GINEVRA

Calzature: STIVALI, SANDALI, CIABATTE, MOCASSINI
Accessori: CINTURA, SCIARPA, CRAVATTA, GUANTI
Tessuti: SETA, LANA, COTONE, LINO
Strumenti del sarto: AGO, FILO, DITALE, FORBICI

Paesi nordici: SVEZIA, NORVEGIA, DANIMARCA, FINLANDIA | anche la Finlandia finisce in -landia, ma serve ai paesi nordici
Finiscono in -LANDA o -LANDIA: OLANDA, IRLANDA, THAILANDIA, GROENLANDIA
Capitali dell'Europa dell'Est: VARSAVIA, PRAGA, BUDAPEST, BUCAREST
Valute europee di ieri e di oggi: CORONA, EURO, ZLOTY, FIORINO

Parole del web: LINK, PAGINA, BROWSER, SITO
Sicurezza informatica: PASSWORD, ANTIVIRUS, FIREWALL, BACKUP
Programmi dannosi: VIRUS, TROJAN, WORM, RANSOMWARE
Concetti di programmazione: VARIABILE, CICLO, FUNZIONE, ARRAY

Colori degli anelli olimpici: BLU, NERO, VERDE, ROSSO
Medaglie (anche quella del quarto posto): ORO, ARGENTO, BRONZO, LEGNO
Città che hanno ospitato le Olimpiadi: ATENE, ROMA, TORINO, LONDRA
Attrezzi della ginnastica artistica: ANELLI, TRAVE, PARALLELE, CAVALLO

Corpi celesti: STELLA, PIANETA, COMETA, ASTEROIDE | anche Stella è un nome, ma serve al cielo
Fasi della luna: NUOVA, CRESCENTE, PIENA, CALANTE
Costellazioni: ORIONE, CASSIOPEA, ANDROMEDA, PEGASO
Nomi di ragazza: AURORA, CELESTE, SERENA, MARINA

Poeti italiani del Novecento: UNGARETTI, MONTALE, QUASIMODO, SABA | Quasimodo è anche il gobbo di Notre-Dame, ma qui è il poeta
Scrittori italiani dell'Ottocento: LEOPARDI, FOSCOLO, VERGA, PASCOLI
Scrittori stranieri: SHAKESPEARE, CERVANTES, TOLSTOJ, DICKENS
Personaggi di romanzi famosi: ROBINSON, PINOCCHIO, HEIDI, DRACULA

Giochi da tavolo classici: SCACCHI, DAMA, TRIS, DOMINO
Maschere di Carnevale: ARLECCHINO, PULCINELLA, COLOMBINA, BALANZONE
Titoli nobiliari: CONTE, MARCHESE, DUCA, BARONE
___ di Natale: ALBERO, BABBO, CANTO, PRANZO

Animali della savana: LEONE, GIRAFFA, ELEFANTE, GHEPARDO | anche la zebra vive nella savana, ma serve alle squadre
Simboli delle squadre di calcio: LUPA, ZEBRA, BISCIONE, AQUILA | la lupa della Roma, la zebra della Juve, il biscione dell'Inter, l'aquila della Lazio
Soprannomi delle squadre: NERAZZURRI, ROSSONERI, BIANCONERI, GIALLOROSSI
Contengono GOL: GOLFO, GOLOSO, ANGOLO, MONGOLFIERA

Energie rinnovabili: SOLARE, EOLICO, IDROELETTRICO, GEOTERMICO
Raccolta differenziata: PLASTICA, CARTA, VETRO, ORGANICO | anche vETRO contiene ETRO, ma serve alla differenziata
Ambienti naturali: FORESTA, DESERTO, TUNDRA, SAVANA
Contengono ETRO: DIETRO, METRO, TETRO, PETROLIO

Invenzioni italiane: RADIO, PILA, BAROMETRO, PIANOFORTE | la pila è anche un mucchio, ma qui è quella di Volta
Inventori e scienziati italiani: MARCONI, VOLTA, TORRICELLI, MEUCCI
Rivoluzioni: FRANCESE, RUSSA, INDUSTRIALE, AMERICANA
Sinonimi di mucchio: CUMULO, CATASTA, AMMASSO, MONTE

I cinque sensi (quattro di loro): VISTA, UDITO, OLFATTO, TATTO | il tatto è anche una qualità, ma serve ai sensi
Gusti del gelato: CIOCCOLATO, PISTACCHIO, STRACCIATELLA, NOCCIOLA
Sapori: DOLCE, SALATO, AMARO, ACIDO
Qualità di una persona raffinata: GARBO, STILE, CLASSE, ELEGANZA
`;

const COLORI = ['giallo', 'verde', 'blu', 'viola'];

// "Tema: A, B, C, D | spiegazione" → { tema, parole, spiegazione, colore, livello }
function leggi(testo) {
  const blocchi = testo.trim().split(/\n\s*\n/);
  return blocchi.map((b) => b.trim().split('\n').map((riga, livello) => {
    const [prima, spiegazione] = riga.split('|').map((x) => x.trim());
    const i = prima.lastIndexOf(':');
    return {
      tema: prima.slice(0, i).trim(),
      parole: prima.slice(i + 1).split(',').map((p) => p.trim()),
      spiegazione: spiegazione || '',
      colore: COLORI[livello],
      livello,
    };
  }));
}

module.exports = { PUZZLE: leggi(TESTO), COLORI };
