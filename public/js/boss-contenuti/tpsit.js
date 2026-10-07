// DISPENSE — TPSIT: gli argomenti, ognuno con la sua pagina (usa gli aiuti di boss-pagina.js: nota, ide, terminale, figura…).
(() => {
  const { nota, ide, terminale, figura, tabella, THREAD_SVG, J_RUNNABLE, J_CONTO, J_BUFFER } = window.BossAiuti;
  void ide; void terminale; void figura; void tabella;
  window.BossContenuti = window.BossContenuti || {};
  window.BossContenuti.tpsit = {
    id: 'tpsit', nome: 'TPSIT', prof: 'Prof.ssa L. Bianchi',
    argomenti: [
      { id: 'clientserver', titolo: 'Architettura client-server', minuti: 9, giorni: -28, corpo: () => `
        <p class="st-intro">Nell'architettura <b>client-server</b> un programma, il <b>server</b>, offre un servizio e resta in attesa; altri programmi, i <b>client</b>, gli inviano richieste e ricevono risposte.</p>
        <h2 id="st-s1">1. Ruoli</h2>
        ${tabella(['', 'Client', 'Server'], [['Chi inizia', 'apre la comunicazione', 'aspetta le richieste'], ['Quanti', 'molti', 'uno (o un gruppo)'], ['Esempi', 'browser, app, client di posta', 'server web, database, server di posta']])}
        <h2 id="st-s2">2. Architetture a livelli</h2>
        <ul><li><b>Two-tier</b>: il client parla direttamente con il server dei dati.</li><li><b>Three-tier</b>: presentazione (browser), logica applicativa (server web o applicativo), dati (DBMS). È lo schema tipico delle applicazioni web.</li></ul>
        <h2 id="st-s3">3. Server iterativo e concorrente</h2>
        <p>Un server <b>iterativo</b> serve un client alla volta. Un server <b>concorrente</b> crea un <b>thread</b> (o un processo) per ogni client, così più client sono serviti insieme.</p>
        ${nota('info', 'Peer-to-peer', 'Nel modello P2P ogni nodo è contemporaneamente client e server (es. BitTorrent): non c\'è un server centrale.')}` },
      { id: 'thread', titolo: 'Thread in Java: creazione e sincronizzazione', minuti: 18, giorni: -21, corpo: () => `
        <p class="st-intro">Un <b>thread</b> è un flusso di esecuzione all'interno di un processo. I thread dello stesso processo condividono la memoria: questo li rende leggeri e veloci da creare, ma obbliga a <b>sincronizzarli</b> quando accedono agli stessi dati.</p>
        <h2 id="st-s1">1. Processi e thread</h2>
        <p>Un processo ha un proprio spazio di indirizzamento; i suoi thread condividono heap, variabili statiche e file aperti, mentre ognuno ha il proprio <b>stack</b> e il proprio program counter. Il cambio di contesto tra thread è quindi molto più economico di quello tra processi.</p>
        <h2 id="st-s2">2. Ciclo di vita di un thread</h2>
        <p>In Java lo stato di un thread si legge con <code>getState()</code> e appartiene all'enum <code>Thread.State</code>.</p>
        ${figura(THREAD_SVG, 'Figura 1 – Gli stati di Thread.State e le transizioni principali.')}
        <h2 id="st-s3">3. Creare un thread</h2>
        <p>Il modo consigliato è implementare l'interfaccia <code>Runnable</code> e passare l'oggetto al costruttore di <code>Thread</code>. Il metodo <code>start()</code> crea il nuovo flusso ed esegue <code>run()</code>; chiamare direttamente <code>run()</code> lo eseguirebbe nel thread corrente.</p>
        ${ide('Contatore.java', 'java', J_RUNNABLE, 'Esempio 1 – Due thread che contano in parallelo; join() attende la loro terminazione.')}
        <h2 id="st-s4">4. Race condition</h2>
        <p>L'istruzione <code>saldo = saldo + importo</code> non è <b>atomica</b>: il thread legge il valore, lo somma e lo riscrive. Se due thread si alternano in mezzo a queste operazioni, un aggiornamento va perso.</p>
        ${ide('Conto.java', 'java', J_CONTO, 'Esempio 2 – Conto condiviso senza sincronizzazione.')}
        ${terminale('studente@lab4: ~/tpsit/thread', `
studente@lab4:~/tpsit/thread$ javac Conto.java
studente@lab4:~/tpsit/thread$ java Conto
Saldo finale: 137482 (atteso 200000)
studente@lab4:~/tpsit/thread$ java Conto
Saldo finale: 151906 (atteso 200000)
studente@lab4:~/tpsit/thread$ `, 'Figura 2 – Ogni esecuzione dà un risultato diverso: è il segnale tipico di una race condition.')}
        <p>La soluzione è rendere il metodo una <b>sezione critica</b> con <code>synchronized</code>: un solo thread alla volta può eseguirlo sullo stesso oggetto, perché deve prima ottenere il suo <i>monitor</i>.</p>
        <h2 id="st-s5">5. Produttore e consumatore</h2>
        <p>Con <code>wait()</code> un thread rilascia il monitor e si sospende finché un altro non chiama <code>notify()</code> o <code>notifyAll()</code>. La condizione va sempre ricontrollata in un <code>while</code>, per via dei risvegli spuri.</p>
        ${ide('Buffer.java', 'java', J_BUFFER, 'Esempio 3 – Buffer circolare limitato condiviso tra produttori e consumatori.')}
        ${nota('info', 'Approfondimento', 'Nelle applicazioni reali si preferiscono le classi di <code>java.util.concurrent</code>: <code>ReentrantLock</code>, <code>Semaphore</code>, <code>ArrayBlockingQueue</code> ed <code>ExecutorService</code>. Le vedremo nell\'unità 4.')}
        <h2 id="st-s6">6. Esercizi</h2>
        <ol class="st-esercizi">
          <li>Correggi <code>Conto.java</code> con <code>synchronized</code> e verifica che il saldo sia sempre 200000.</li>
          <li>Scrivi un programma con 3 produttori e 2 consumatori che usano la classe <code>Buffer</code>.</li>
          <li>Spiega perché in <code>preleva()</code> si usa <code>while</code> e non <code>if</code>.</li>
        </ol>` },
      { id: 'socket', titolo: 'Socket in Java', minuti: 14, giorni: -14, corpo: () => `
        <p class="st-intro">Un <b>socket</b> è l'estremità di una comunicazione di rete: indirizzo IP più porta. In Java si usano <code>ServerSocket</code> (lato server) e <code>Socket</code> (lato client) per le connessioni TCP.</p>
        <h2 id="st-s1">1. Il server</h2>
        ${ide('Server.java', 'java', `import java.io.*;
import java.net.*;

public class Server {
    public static void main(String[] args) throws IOException {
        try (ServerSocket server = new ServerSocket(5000)) {
            while (true) {
                Socket client = server.accept();          // aspetta un client
                new Thread(() -> gestisci(client)).start(); // server concorrente
            }
        }
    }
    static void gestisci(Socket s) {
        try (s; BufferedReader in = new BufferedReader(new InputStreamReader(s.getInputStream()));
             PrintWriter out = new PrintWriter(s.getOutputStream(), true)) {
            String riga;
            while ((riga = in.readLine()) != null) out.println("ECO: " + riga);
        } catch (IOException e) { System.err.println(e.getMessage()); }
    }
}`, 'Server eco concorrente: un thread per ogni client.')}
        <h2 id="st-s2">2. Il client</h2>
        ${ide('Client.java', 'java', `try (Socket s = new Socket("localhost", 5000);
     PrintWriter out = new PrintWriter(s.getOutputStream(), true);
     BufferedReader in = new BufferedReader(new InputStreamReader(s.getInputStream()))) {
    out.println("ciao");
    System.out.println(in.readLine()); // ECO: ciao
}`, 'Il client si collega, invia una riga e legge la risposta.')}
        <h2 id="st-s3">3. TCP e UDP in Java</h2>
        <p>Per UDP si usano <code>DatagramSocket</code> e <code>DatagramPacket</code>: non c'è connessione e ogni pacchetto viaggia da solo.</p>
        ${nota('avviso', 'Attenzione', '<code>accept()</code> e <code>readLine()</code> sono bloccanti: senza thread il server resterebbe fermo sul primo client.')}` },
      { id: 'rest', titolo: 'Servizi web e API REST', minuti: 12, giorni: -10, corpo: () => `
        <p class="st-intro">Un <b>servizio web</b> mette a disposizione funzioni attraverso HTTP. Lo stile più diffuso è <b>REST</b>: ogni <b>risorsa</b> ha un indirizzo (URI) e si manipola con i metodi HTTP.</p>
        <h2 id="st-s1">1. Risorse e metodi</h2>
        ${tabella(['Operazione', 'Metodo', 'URI', 'Codice tipico'], [['Elenco studenti', 'GET', '/api/studenti', '200'], ['Uno studente', 'GET', '/api/studenti/42', '200 o 404'], ['Nuovo studente', 'POST', '/api/studenti', '201 Created'], ['Modifica', 'PUT / PATCH', '/api/studenti/42', '200 o 204'], ['Cancellazione', 'DELETE', '/api/studenti/42', '204 No Content']])}
        <h2 id="st-s2">2. I vincoli di REST</h2>
        <ul><li>Architettura <b>client-server</b>.</li><li><b>Stateless</b>: ogni richiesta contiene tutto ciò che serve (per esempio il token di autenticazione).</li><li>Risposte <b>cacheable</b> quando possibile.</li><li><b>Interfaccia uniforme</b>: URI per le risorse, metodi HTTP per le azioni, rappresentazioni in JSON (o XML).</li></ul>
        <h2 id="st-s3">3. Una chiamata dal browser</h2>
        ${ide('app.js', 'js', `const risposta = await fetch('/api/studenti', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nome: 'Anna', classe: '5B' }),
});
if (risposta.status === 201) console.log(await risposta.json());`, 'fetch invia una richiesta POST con un corpo JSON.')}
        ${nota('info', 'Idempotenza', 'GET, PUT e DELETE sono idempotenti: ripeterli dà lo stesso risultato. POST no: ogni chiamata può creare una risorsa nuova.')}` },
      { id: 'xmljson', titolo: 'Formati di dati: XML e JSON', minuti: 10, giorni: -7, corpo: () => `
        <p class="st-intro">Per scambiarsi dati, client e server usano formati di testo strutturati: <b>XML</b> e <b>JSON</b>.</p>
        <h2 id="st-s1">1. Lo stesso dato nei due formati</h2>
        ${ide('studente.xml', 'html', `<?xml version="1.0" encoding="UTF-8"?>
<studente matricola="42">
  <nome>Anna</nome>
  <classe>5B</classe>
  <voti><voto materia="TPSIT">8</voto></voti>
</studente>`, 'XML: elementi con tag di apertura e chiusura, attributi.')}
        ${ide('studente.json', 'js', `{
  "matricola": 42,
  "nome": "Anna",
  "classe": "5B",
  "voti": [{ "materia": "TPSIT", "voto": 8 }]
}`, 'JSON: oggetti tra graffe, array tra quadre, chiavi tra virgolette.')}
        <h2 id="st-s2">2. Confronto</h2>
        ${tabella(['', 'XML', 'JSON'], [['Sintassi', 'tag e attributi', 'coppie chiave: valore'], ['Tipi di dato', 'tutto testo', 'stringa, numero, booleano, null, oggetto, array'], ['Validazione', 'DTD, XML Schema (XSD)', 'JSON Schema'], ['Peso', 'più verboso', 'più compatto']])}
        <h2 id="st-s3">3. Ben formato e valido</h2>
        <p>Un XML è <b>ben formato</b> se rispetta la sintassi (un solo elemento radice, tag chiusi e annidati correttamente). È <b>valido</b> se rispetta anche il suo schema (DTD o XSD).</p>
        ${nota('avviso', 'JSON e JavaScript', 'In JSON le chiavi vanno sempre tra virgolette doppie e non sono ammessi commenti né virgole finali.')}` },
      { id: 'cloud', titolo: 'Il cloud computing', minuti: 9, giorni: -3, corpo: () => `
        <p class="st-intro">Il <b>cloud computing</b> offre risorse informatiche (server, archiviazione, programmi) come servizio attraverso Internet, pagando in base all'uso.</p>
        <h2 id="st-s1">1. Modelli di servizio</h2>
        ${tabella(['Modello', 'Cosa offre', 'Esempi'], [['IaaS', 'macchine virtuali, reti, dischi', 'Amazon EC2, Azure VM'], ['PaaS', 'piattaforma per eseguire le proprie applicazioni', 'Render, Heroku, Google App Engine'], ['SaaS', 'applicazioni pronte all\'uso', 'Gmail, Microsoft 365, Google Docs']])}
        <h2 id="st-s2">2. Modelli di distribuzione</h2>
        <ul><li><b>Pubblico</b>: infrastruttura condivisa del fornitore.</li><li><b>Privato</b>: dedicato a una sola organizzazione.</li><li><b>Ibrido</b>: un misto dei due.</li></ul>
        <h2 id="st-s3">3. Vantaggi e rischi</h2>
        <p>Vantaggi: <b>scalabilità</b> (si aggiungono risorse quando servono), niente investimento iniziale in hardware, accesso da ovunque. Rischi: dipendenza dalla connessione e dal fornitore (<i>lock-in</i>), privacy e posizione dei dati (GDPR).</p>
        ${nota('info', 'Virtualizzazione e container', 'Il cloud si basa sulla virtualizzazione (hypervisor) e sempre più sui container (Docker), più leggeri delle macchine virtuali.')}` },
    ],
  };
})();
