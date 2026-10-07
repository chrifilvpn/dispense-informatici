// DISPENSE — Sistemi e Reti: gli argomenti, ognuno con la sua pagina (usa gli aiuti di boss-pagina.js: nota, ide, terminale, figura…).
(() => {
  const { nota, ide, terminale, figura, tabella, RETE_SVG } = window.BossAiuti;
  void ide; void figura;
  window.BossContenuti = window.BossContenuti || {};
  window.BossContenuti.sistemi = {
    id: 'sistemi', nome: 'Sistemi e Reti', prof: 'Prof. M. Rossi',
    argomenti: [
      { id: 'osi', titolo: 'Il modello ISO/OSI', minuti: 12, giorni: -30, corpo: () => `
        <p class="st-intro">Il modello <b>ISO/OSI</b> (Open Systems Interconnection) divide la comunicazione in rete in <b>7 livelli</b>. Ogni livello offre servizi a quello superiore e usa quelli del livello inferiore: così ogni parte si può progettare e cambiare senza toccare le altre.</p>
        <h2 id="st-s1">1. I sette livelli</h2>
        ${tabella(['N.', 'Livello', 'Funzione', 'Esempi', 'Unità di dati'], [
          ['7', 'Applicazione', 'Servizi per l\'utente e i programmi', 'HTTP, SMTP, DNS, FTP', 'dati'],
          ['6', 'Presentazione', 'Formato dei dati, codifica, cifratura, compressione', 'TLS, JPEG, UTF-8', 'dati'],
          ['5', 'Sessione', 'Apertura, gestione e chiusura del dialogo', 'RPC, NetBIOS', 'dati'],
          ['4', 'Trasporto', 'Comunicazione tra processi, affidabilità, controllo di flusso', 'TCP, UDP', 'segmento'],
          ['3', 'Rete', 'Indirizzamento logico e instradamento', 'IP, ICMP', 'pacchetto'],
          ['2', 'Collegamento', 'Consegna sulla stessa rete, indirizzi fisici, rilevazione errori', 'Ethernet, Wi-Fi (802.11)', 'frame'],
          ['1', 'Fisico', 'Trasmissione dei bit sul mezzo', 'cavo UTP, fibra, onde radio', 'bit'],
        ])}
        <h2 id="st-s2">2. Incapsulamento</h2>
        <p>Scendendo dai livelli alti verso il fisico, ogni livello aggiunge al dato una propria <b>intestazione</b> (header): è l'<b>incapsulamento</b>. Il destinatario fa il percorso inverso (<b>decapsulamento</b>) e ogni livello legge solo l'intestazione che gli spetta.</p>
        <ul><li>Livello 4: header TCP (porte, numeri di sequenza).</li><li>Livello 3: header IP (indirizzi IP di origine e destinazione).</li><li>Livello 2: header e trailer Ethernet (indirizzi MAC, FCS per il controllo errori).</li></ul>
        ${nota('info', 'Per ricordarli', 'Dal basso: «<b>F</b>isico, <b>C</b>ollegamento, <b>R</b>ete, <b>T</b>rasporto, <b>S</b>essione, <b>P</b>resentazione, <b>A</b>pplicazione».')}
        <h2 id="st-s3">3. Dispositivi e livelli</h2>
        <ul><li><b>Hub</b> e ripetitori: livello 1 (ripetono i bit su tutte le porte).</li><li><b>Switch</b>: livello 2 (inoltrano i frame in base al MAC).</li><li><b>Router</b>: livello 3 (instradano i pacchetti in base all'IP).</li></ul>
        ${nota('avviso', 'Attenzione', 'ISO/OSI è un modello di riferimento: Internet usa in pratica la pila TCP/IP, che accorpa alcuni livelli.')}` },
      { id: 'tcpip', titolo: 'Il modello TCP/IP', minuti: 10, giorni: -27, corpo: () => `
        <p class="st-intro">La pila <b>TCP/IP</b> è il modello usato davvero in Internet. Ha <b>4 livelli</b> (in alcuni testi 5, separando fisico e collegamento).</p>
        <h2 id="st-s1">1. Confronto con ISO/OSI</h2>
        ${tabella(['TCP/IP', 'Corrisponde in ISO/OSI a', 'Protocolli'], [
          ['Applicazione', 'Applicazione, Presentazione, Sessione', 'HTTP, HTTPS, DNS, DHCP, SMTP, IMAP, SSH'],
          ['Trasporto', 'Trasporto', 'TCP, UDP'],
          ['Internet', 'Rete', 'IPv4, IPv6, ICMP, ARP*'],
          ['Accesso alla rete', 'Collegamento e Fisico', 'Ethernet, Wi-Fi, PPP'],
        ])}
        <p><small>* ARP lavora tra livello 2 e livello 3: traduce un indirizzo IP nell'indirizzo MAC corrispondente.</small></p>
        <h2 id="st-s2">2. Porte e socket</h2>
        <p>Al livello di trasporto ogni applicazione è identificata da un numero di <b>porta</b> (16 bit, da 0 a 65535). La coppia <i>indirizzo IP + porta</i> si chiama <b>socket</b>.</p>
        ${tabella(['Porta', 'Servizio'], [['20/21', 'FTP'], ['22', 'SSH'], ['25', 'SMTP'], ['53', 'DNS'], ['67/68', 'DHCP'], ['80', 'HTTP'], ['443', 'HTTPS']])}
        <h2 id="st-s3">3. Strumenti da terminale</h2>
        ${terminale('Prompt dei comandi', 'C:\\> ipconfig /all\nC:\\> ping 8.8.8.8\nC:\\> tracert www.example.com\nC:\\> netstat -an', 'ipconfig mostra la configurazione, ping verifica la raggiungibilità (ICMP), tracert mostra i router attraversati, netstat le connessioni aperte.')}` },
      { id: 'ipv4', titolo: 'Indirizzamento IPv4 e subnetting', minuti: 14, giorni: -24, corpo: () => `
        <p class="st-intro">Ogni dispositivo collegato a una rete IP ha bisogno di un indirizzo che lo identifichi. In questa lezione vediamo com'è fatto un indirizzo IPv4, a cosa serve la <b>subnet mask</b> e come si divide una rete in sottoreti più piccole, con un esempio completo sulla rete del nostro istituto.</p>
        <h2 id="st-s1">1. Com'è fatto un indirizzo IPv4</h2>
        <p>Un indirizzo IPv4 è un numero di <b>32 bit</b>. Per leggerlo più facilmente lo scriviamo in <i>notazione decimale puntata</i>: quattro numeri da 0 a 255 (gli <b>ottetti</b>), separati da un punto.</p>
        <div class="st-tabella"><table><thead><tr><th>Decimale</th><th>192</th><th>168</th><th>10</th><th>37</th></tr></thead>
          <tbody><tr><td>Binario</td><td><code>11000000</code></td><td><code>10101000</code></td><td><code>00001010</code></td><td><code>00100101</code></td></tr></tbody></table></div>
        <p>L'indirizzo è diviso in due parti: la <b>parte di rete</b>, uguale per tutti i dispositivi della stessa rete, e la <b>parte host</b>, che identifica il singolo dispositivo.</p>
        <h2 id="st-s2">2. La subnet mask</h2>
        <p>La subnet mask indica quanti bit appartengono alla rete. Ha tutti 1 nella parte di rete e tutti 0 nella parte host. Si può scrivere per esteso (<code>255.255.255.0</code>) o in notazione <b>CIDR</b> (<code>/24</code>, cioè 24 bit a 1).</p>
        <p>Per trovare l'indirizzo di rete si fa l'<b>AND bit a bit</b> tra indirizzo e maschera. Con <code>192.168.10.37/24</code> otteniamo la rete <code>192.168.10.0</code> e il broadcast <code>192.168.10.255</code>: restano 2<sup>8</sup> − 2 = <b>254 host</b> utilizzabili.</p>
        ${nota('info', 'Indirizzi privati (RFC 1918)', 'Non sono instradati su Internet e si usano nelle reti locali: <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code> e <code>192.168.0.0/16</code>. Per uscire su Internet il router usa il NAT.')}
        <h2 id="st-s3">3. Esempio: la rete dell'istituto</h2>
        <p>Dobbiamo dividere <code>192.168.10.0/24</code> in <b>4 sottoreti</b> uguali: due laboratori, la segreteria e il Wi-Fi. Per avere 4 sottoreti servono 2 bit in più (2<sup>2</sup> = 4), quindi la nuova maschera è <code>/26</code> (<code>255.255.255.192</code>). Ogni sottorete ha 2<sup>6</sup> − 2 = <b>62 host</b>.</p>
        <div class="st-tabella"><table><thead><tr><th>Sottorete</th><th>Indirizzo di rete</th><th>Primo host (gateway)</th><th>Ultimo host</th><th>Broadcast</th></tr></thead><tbody>
          <tr><td>LAB1</td><td><code>192.168.10.0/26</code></td><td><code>.1</code></td><td><code>.62</code></td><td><code>.63</code></td></tr>
          <tr><td>LAB2</td><td><code>192.168.10.64/26</code></td><td><code>.65</code></td><td><code>.126</code></td><td><code>.127</code></td></tr>
          <tr><td>SEGRETERIA</td><td><code>192.168.10.128/26</code></td><td><code>.129</code></td><td><code>.190</code></td><td><code>.191</code></td></tr>
          <tr><td>WI-FI</td><td><code>192.168.10.192/26</code></td><td><code>.193</code></td><td><code>.254</code></td><td><code>.255</code></td></tr></tbody></table></div>
        ${figura(RETE_SVG, 'Figura 1 – Topologia logica: il router R1 ha un\'interfaccia per ogni sottorete e fa da gateway.')}
        <h2 id="st-s4">4. Verifica dalla riga di comando</h2>
        <p>Da un PC del LAB1 controlliamo la configurazione con <code>ipconfig</code> e proviamo a raggiungere il gateway con <code>ping</code>. La maschera <code>255.255.255.192</code> conferma che il PC è nella sottorete /26.</p>
        ${terminale('Prompt dei comandi', String.raw`
C:\Users\studente>ipconfig

Configurazione IP di Windows

Scheda Ethernet Ethernet:

   Suffisso DNS specifico per connessione: lab.itis.local
   Indirizzo IPv4. . . . . . . . . . . . : 192.168.10.37
   Subnet mask . . . . . . . . . . . . . : 255.255.255.192
   Gateway predefinito . . . . . . . . . : 192.168.10.1

C:\Users\studente>ping 192.168.10.1

Esecuzione di Ping 192.168.10.1 con 32 byte di dati:
Risposta da 192.168.10.1: byte=32 durata<1ms TTL=255
Risposta da 192.168.10.1: byte=32 durata<1ms TTL=255
Risposta da 192.168.10.1: byte=32 durata=1ms TTL=255
Risposta da 192.168.10.1: byte=32 durata<1ms TTL=255

Statistiche Ping per 192.168.10.1:
    Pacchetti: Trasmessi = 4, Ricevuti = 4, Persi = 0 (0% persi),

C:\Users\studente>`, 'Figura 2 – Output di ipconfig e ping su un PC del laboratorio.')}
        <h2 id="st-s5">5. Esercizi</h2>
        <ol class="st-esercizi">
          <li>Dato l'indirizzo <code>172.16.45.130/20</code>, calcola indirizzo di rete, broadcast e numero di host.</li>
          <li>Dividi <code>10.0.8.0/22</code> in 8 sottoreti uguali e scrivi la tabella come nell'esempio.</li>
          <li>Il PC <code>192.168.10.70/26</code> può comunicare direttamente con <code>192.168.10.60/26</code>? Motiva la risposta.</li>
        </ol>
        ${nota('avviso', 'Per la verifica', 'Portate la calcolatrice non programmabile: le conversioni binario ↔ decimale vanno fatte a mano.')}` },
      { id: 'dns', titolo: 'DNS: il sistema dei nomi', minuti: 9, giorni: -20, corpo: () => `
        <p class="st-intro">Il <b>DNS</b> (Domain Name System) traduce i nomi di dominio, come <code>www.scuola.it</code>, negli indirizzi IP che servono per comunicare. È un database <b>distribuito</b> e <b>gerarchico</b>.</p>
        <h2 id="st-s1">1. La gerarchia dei domini</h2>
        <p>Si legge da destra a sinistra: la <b>radice</b> (il punto finale, di solito sottinteso), i domini di primo livello (<b>TLD</b>: <code>.it</code>, <code>.com</code>, <code>.org</code>), i domini di secondo livello (<code>scuola.it</code>) e i nomi degli host (<code>www</code>).</p>
        <h2 id="st-s2">2. Come avviene una risoluzione</h2>
        <ol><li>Il PC chiede il nome al suo <b>resolver</b> (di solito il DNS del router o del provider).</li><li>Se non ha la risposta in cache, il resolver interroga un <b>root server</b>, che lo rimanda ai server del TLD <code>.it</code>.</li><li>I server <code>.it</code> lo rimandano ai server <b>autoritativi</b> di <code>scuola.it</code>, che danno la risposta.</li><li>La risposta resta in <b>cache</b> per il tempo indicato dal <b>TTL</b>.</li></ol>
        <h2 id="st-s3">3. I record principali</h2>
        ${tabella(['Record', 'Significato'], [['A', 'nome → indirizzo IPv4'], ['AAAA', 'nome → indirizzo IPv6'], ['CNAME', 'alias verso un altro nome'], ['MX', 'server di posta del dominio'], ['NS', 'server autoritativi del dominio'], ['PTR', 'indirizzo → nome (risoluzione inversa)']])}
        ${terminale('Terminale', '$ nslookup www.example.com\nServer:  192.168.1.1\nName:    www.example.com\nAddress: 93.184.215.14', 'nslookup (o dig su Linux) interroga il DNS.')}
        ${nota('info', 'Trasporto', 'Il DNS usa soprattutto UDP sulla porta 53; usa TCP per risposte grandi e per i trasferimenti di zona tra server.')}` },
      { id: 'dhcp', titolo: 'DHCP: configurazione automatica', minuti: 8, giorni: -18, corpo: () => `
        <p class="st-intro">Il <b>DHCP</b> (Dynamic Host Configuration Protocol) assegna in automatico a ogni dispositivo la configurazione di rete: indirizzo IP, subnet mask, gateway predefinito e server DNS.</p>
        <h2 id="st-s1">1. Lo scambio DORA</h2>
        ${tabella(['Messaggio', 'Da → a', 'Significato'], [['Discover', 'client → broadcast', 'c\'è un server DHCP?'], ['Offer', 'server → client', 'ti propongo questo indirizzo'], ['Request', 'client → broadcast', 'accetto l\'offerta di quel server'], ['Acknowledge', 'server → client', 'confermato, ecco la configurazione']])}
        <p>Il client usa la porta UDP <b>68</b>, il server la porta UDP <b>67</b>. All'inizio il client non ha un indirizzo, perciò Discover e Request viaggiano in broadcast (<code>255.255.255.255</code>).</p>
        <h2 id="st-s2">2. Lease, pool e prenotazioni</h2>
        <ul><li><b>Pool</b>: l'intervallo di indirizzi che il server può assegnare.</li><li><b>Lease</b>: la durata del prestito; a metà del tempo il client prova a rinnovarlo.</li><li><b>Prenotazione</b>: un indirizzo fisso legato al MAC di un dispositivo (utile per stampanti e server).</li><li><b>Esclusioni</b>: indirizzi del pool da non assegnare (per esempio quello del router).</li></ul>
        ${nota('avviso', 'Attenzione', 'Se non trova un server DHCP, Windows si assegna un indirizzo 169.254.x.x (APIPA): è il segno che la configurazione automatica non ha funzionato.')}
        <h2 id="st-s3">3. Più sottoreti</h2>
        <p>I messaggi broadcast non attraversano i router: se il server DHCP è in un'altra sottorete, il router deve fare da <b>relay agent</b> (comando <code>ip helper-address</code> sui router Cisco).</p>` },
      { id: 'http', titolo: 'HTTP e HTTPS', minuti: 11, giorni: -15, corpo: () => `
        <p class="st-intro"><b>HTTP</b> (HyperText Transfer Protocol) è il protocollo del web: il client (il browser) manda una <b>richiesta</b>, il server risponde con una <b>risposta</b>. È <b>senza stato</b>: ogni richiesta è indipendente dalle altre.</p>
        <h2 id="st-s1">1. Richiesta e risposta</h2>
        ${terminale('Richiesta e risposta HTTP', 'GET /index.html HTTP/1.1\nHost: www.example.com\nUser-Agent: Mozilla/5.0\n\nHTTP/1.1 200 OK\nContent-Type: text/html; charset=utf-8\nContent-Length: 1256\n\n<!DOCTYPE html> ...', 'La prima riga della richiesta contiene metodo, risorsa e versione; la risposta inizia con il codice di stato.')}
        <h2 id="st-s2">2. Metodi e codici di stato</h2>
        ${tabella(['Metodo', 'Uso'], [['GET', 'leggere una risorsa'], ['POST', 'inviare dati (es. un modulo)'], ['PUT', 'sostituire una risorsa'], ['PATCH', 'modificare in parte una risorsa'], ['DELETE', 'eliminare una risorsa']])}
        ${tabella(['Classe', 'Significato', 'Esempi'], [['2xx', 'successo', '200 OK, 201 Created'], ['3xx', 'reindirizzamento', '301 Moved Permanently, 304 Not Modified'], ['4xx', 'errore del client', '400 Bad Request, 401, 403 Forbidden, 404 Not Found'], ['5xx', 'errore del server', '500 Internal Server Error, 503']])}
        <h2 id="st-s3">3. HTTPS</h2>
        <p>HTTPS è HTTP dentro una connessione cifrata con <b>TLS</b> (porta 443). Il server presenta un <b>certificato</b> firmato da un'autorità di certificazione (CA): il browser lo verifica, poi client e server concordano una chiave di sessione simmetrica con cui cifrano i dati.</p>
        ${nota('info', 'Stato e cookie', 'Per ricordarsi di un utente tra una richiesta e l\'altra (per esempio il login) si usano i cookie: il server li imposta con Set-Cookie e il browser li rimanda a ogni richiesta.')}` },
      { id: 'vlan', titolo: 'Switch e VLAN', minuti: 10, giorni: -12, corpo: () => `
        <p class="st-intro">Lo <b>switch</b> collega i dispositivi di una LAN e inoltra i frame solo verso la porta giusta, grazie alla sua <b>tabella MAC</b>. Le <b>VLAN</b> permettono di dividere uno stesso switch in più reti logiche separate.</p>
        <h2 id="st-s1">1. Come impara lo switch</h2>
        <ul><li>Quando riceve un frame legge il <b>MAC di origine</b> e lo associa alla porta di ingresso.</li><li>Se conosce il MAC di destinazione, inoltra il frame solo su quella porta; altrimenti lo invia su tutte le altre (<b>flooding</b>).</li><li>I frame broadcast (<code>FF:FF:FF:FF:FF:FF</code>) vanno a tutti: lo switch separa i domini di collisione ma <b>non</b> il dominio di broadcast.</li></ul>
        <h2 id="st-s2">2. Le VLAN</h2>
        <p>Una VLAN è un dominio di broadcast separato. Porte di VLAN diverse non si vedono: per farle comunicare serve un <b>router</b> (o uno switch di livello 3).</p>
        ${tabella(['Tipo di porta', 'Uso'], [['Access', 'appartiene a una sola VLAN; ci si collegano i PC'], ['Trunk', 'trasporta più VLAN tra switch o verso il router; i frame hanno il tag 802.1Q']])}
        ${terminale('Switch Cisco (Packet Tracer)', 'Switch(config)# vlan 10\nSwitch(config-vlan)# name LAB1\nSwitch(config)# interface fa0/1\nSwitch(config-if)# switchport mode access\nSwitch(config-if)# switchport access vlan 10\nSwitch(config)# interface gi0/1\nSwitch(config-if)# switchport mode trunk', 'Creazione della VLAN 10, porta access e porta trunk.')}
        ${nota('info', 'Router-on-a-stick', 'Un solo cavo trunk tra switch e router e una sottointerfaccia per VLAN (es. gi0/0.10 con encapsulation dot1Q 10): è il modo classico di fare routing tra VLAN.')}` },
      { id: 'routing', titolo: 'Routing statico e dinamico', minuti: 12, giorni: -9, corpo: () => `
        <p class="st-intro">Il <b>routing</b> è la scelta del percorso che un pacchetto segue per arrivare in un'altra rete. Ogni router decide consultando la propria <b>tabella di routing</b>.</p>
        <h2 id="st-s1">1. La tabella di routing</h2>
        <p>Ogni riga contiene una rete di destinazione, la maschera, il <b>next hop</b> (il prossimo router) o l'interfaccia di uscita. Vince la riga con il <b>prefisso più lungo</b> che corrisponde (longest prefix match). La <b>default route</b> <code>0.0.0.0/0</code> vale per tutto ciò che non ha una riga più precisa.</p>
        ${terminale('Router Cisco', 'Router(config)# ip route 192.168.20.0 255.255.255.0 10.0.0.2\nRouter(config)# ip route 0.0.0.0 0.0.0.0 10.0.0.1\nRouter# show ip route', 'Una rotta statica verso 192.168.20.0/24 e la rotta di default.')}
        <h2 id="st-s2">2. Statico o dinamico</h2>
        ${tabella(['', 'Statico', 'Dinamico'], [['Configurazione', 'a mano, rotta per rotta', 'i router si scambiano le informazioni'], ['Adattamento ai guasti', 'no', 'sì, ricalcola i percorsi'], ['Adatto a', 'reti piccole, rotta di default', 'reti medie e grandi']])}
        <h2 id="st-s3">3. Protocolli di routing</h2>
        <ul><li><b>RIP</b> (distance vector): sceglie il percorso con meno salti (hop), massimo 15.</li><li><b>OSPF</b> (link state): ogni router conosce la mappa della rete e calcola i percorsi con l'algoritmo di Dijkstra; il costo dipende dalla banda.</li><li><b>BGP</b>: collega i grandi sistemi autonomi di Internet.</li></ul>
        ${nota('avviso', 'TTL', 'Ogni router diminuisce di 1 il campo TTL del pacchetto: a 0 il pacchetto viene scartato. Così un errore di routing non fa girare i pacchetti all\'infinito.')}` },
      { id: 'trasporto', titolo: 'Livello di trasporto: TCP e UDP', minuti: 11, giorni: -6, corpo: () => `
        <p class="st-intro">Il livello di trasporto porta i dati da un <b>processo</b> a un altro, usando i numeri di porta. I due protocolli principali sono <b>TCP</b> e <b>UDP</b>.</p>
        <h2 id="st-s1">1. Confronto</h2>
        ${tabella(['', 'TCP', 'UDP'], [['Connessione', 'sì (three-way handshake)', 'no'], ['Affidabilità', 'riscontri (ACK) e ritrasmissioni', 'nessuna garanzia'], ['Ordine dei dati', 'garantito (numeri di sequenza)', 'non garantito'], ['Controllo di flusso e congestione', 'sì (finestra scorrevole)', 'no'], ['Header', '20 byte (minimo)', '8 byte'], ['Usato da', 'HTTP, SMTP, SSH, FTP', 'DNS, DHCP, streaming, giochi online, VoIP']])}
        <h2 id="st-s2">2. Il three-way handshake</h2>
        <ol><li>Il client manda un segmento <b>SYN</b> con il suo numero di sequenza iniziale.</li><li>Il server risponde con <b>SYN-ACK</b>.</li><li>Il client conferma con <b>ACK</b>: la connessione è aperta.</li></ol>
        <p>La chiusura avviene con i segmenti <b>FIN</b> e <b>ACK</b> in entrambe le direzioni.</p>
        <h2 id="st-s3">3. La finestra</h2>
        <p>Con la <b>finestra scorrevole</b> il mittente può inviare più segmenti senza aspettare ogni ACK; il destinatario comunica quanta memoria ha libera (<i>receive window</i>), così non viene sommerso di dati.</p>
        ${nota('info', 'Perché UDP?', 'Per una videochiamata un pacchetto in ritardo è inutile: meglio perderlo che aspettarlo. UDP è più leggero e veloce, e l\'applicazione gestisce da sola eventuali perdite.')}` },
      { id: 'sicurezza', titolo: 'Sicurezza di rete e firewall', minuti: 12, giorni: -3, corpo: () => `
        <p class="st-intro">Proteggere una rete significa garantire <b>riservatezza</b>, <b>integrità</b> e <b>disponibilità</b> dei dati (la triade CIA). Il <b>firewall</b> è uno degli strumenti principali.</p>
        <h2 id="st-s1">1. Tipi di firewall</h2>
        ${tabella(['Tipo', 'Come lavora'], [['Packet filter', 'controlla ogni pacchetto in base a IP, porta e protocollo (livelli 3 e 4)'], ['Stateful', 'ricorda le connessioni aperte e lascia passare le risposte'], ['Application gateway / proxy', 'analizza il contenuto a livello applicazione'], ['Next generation (NGFW)', 'unisce le funzioni precedenti a IPS e controllo delle applicazioni']])}
        <h2 id="st-s2">2. Regole e ACL</h2>
        <p>Le regole si leggono dall'alto in basso e si applica la <b>prima</b> che corrisponde; alla fine c'è di solito un <b>deny implicito</b>. Una buona politica è «vieta tutto, poi permetti solo ciò che serve».</p>
        ${terminale('ACL estesa (Cisco)', 'Router(config)# access-list 110 permit tcp 192.168.10.0 0.0.0.255 any eq 443\nRouter(config)# access-list 110 deny ip any any\nRouter(config)# interface gi0/0\nRouter(config-if)# ip access-group 110 in', 'Solo HTTPS in uscita dalla rete 192.168.10.0/24; tutto il resto è bloccato. Le ACL usano la wildcard mask (0.0.0.255).')}
        <h2 id="st-s3">3. DMZ, VPN e attacchi comuni</h2>
        <ul><li><b>DMZ</b>: una zona separata per i server raggiungibili da Internet (web, posta), così un attacco non arriva direttamente alla LAN interna.</li><li><b>VPN</b>: un tunnel cifrato attraverso Internet (IPsec, OpenVPN, WireGuard).</li><li>Attacchi: <b>DoS/DDoS</b>, <b>phishing</b>, <b>man in the middle</b>, <b>scansione delle porte</b>, <b>malware</b>.</li></ul>
        ${nota('avviso', 'NAT non è un firewall', 'Il NAT nasconde gli indirizzi interni, ma non sostituisce un firewall con regole precise.')}` },
    ],
  };
})();
