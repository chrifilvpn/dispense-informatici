// DISPENSE — Informatica: gli argomenti, ognuno con la sua pagina (usa gli aiuti di boss-pagina.js: nota, ide, terminale, figura…).
(() => {
  const { nota, ide, terminale, figura, tabella, BOX_SVG, H_PAGINA, C_STILE, annoScolastico } = window.BossAiuti;
  void ide; void terminale; void figura; void tabella;
  window.BossContenuti = window.BossContenuti || {};
  window.BossContenuti.informatica = {
    id: 'informatica', nome: 'Informatica', prof: 'Prof. G. Conti',
    argomenti: [
      { id: 'htmlcss', titolo: 'HTML e CSS: struttura della pagina e box model', minuti: 11, giorni: -30, corpo: () => `
        <p class="st-intro">Una pagina web è fatta di <b>contenuto</b> (HTML), <b>presentazione</b> (CSS) e <b>comportamento</b> (JavaScript). In questa lezione costruiamo la struttura di una pagina con i tag semantici di HTML5 e impariamo come il browser calcola le dimensioni di ogni elemento.</p>
        <h2 id="st-s1">1. Lo scheletro di un documento HTML5</h2>
        <p>Ogni pagina inizia con il <code>&lt;!DOCTYPE html&gt;</code>. Nell'<code>&lt;head&gt;</code> vanno le informazioni sulla pagina (codifica, titolo, fogli di stile); nel <code>&lt;body&gt;</code> il contenuto visibile.</p>
        ${ide('index.html', 'html', H_PAGINA, 'Esempio 1 – Pagina con i tag semantici header, nav, main, article e footer.')}
        <h2 id="st-s2">2. Tag semantici</h2>
        <p>I tag semantici descrivono il <i>ruolo</i> del contenuto: <code>&lt;header&gt;</code> per l'intestazione, <code>&lt;nav&gt;</code> per i menu, <code>&lt;main&gt;</code> per il contenuto principale, <code>&lt;article&gt;</code> per un contenuto autonomo e <code>&lt;footer&gt;</code> per il piè di pagina. Aiutano i motori di ricerca e gli screen reader, e rendono il codice più leggibile di una serie di <code>&lt;div&gt;</code>.</p>
        <h2 id="st-s3">3. Collegare il foglio di stile</h2>
        ${ide('style.css', 'css', C_STILE, 'Esempio 2 – Foglio di stile con Flexbox per l\'intestazione.')}
        <div class="st-browser"><div class="st-browser-barra"><span class="st-pallini"><i></i><i></i><i></i></span><span class="st-url">localhost:5500/index.html</span></div>
          <div class="st-anteprima"><div class="an-head"><b>Laboratorio 5B</b><span><u>Home</u><u>Orario</u><u>Progetti</u></span></div>
          <div class="an-scheda"><b>Progetto: stazione meteo</b><p>Arduino, sensore DHT11 e pagina web con i dati.</p></div><div class="an-foot">ITIS - Anno scolastico ${annoScolastico}</div></div></div>
        <p class="st-didascalia">Figura 1 – Il risultato nel browser (estensione Live Server).</p>
        <h2 id="st-s4">4. Il box model</h2>
        <p>Il browser tratta ogni elemento come un rettangolo formato da quattro aree: <b>content</b>, <b>padding</b>, <b>border</b> e <b>margin</b>. Con il valore predefinito <code>box-sizing: content-box</code> la larghezza impostata vale solo per il contenuto; con <code>border-box</code> comprende anche padding e bordo.</p>
        ${figura(BOX_SVG, 'Figura 2 – Le aree del box model.')}
        ${nota('info', 'Esempio di calcolo', 'Con <code>width: 320px</code>, <code>padding: 16px</code> e <code>border: 2px</code>: in <code>content-box</code> la scheda occupa 320 + 32 + 4 = <b>356px</b>; in <code>border-box</code> occupa esattamente <b>320px</b> e il contenuto si riduce a 284px.')}
        <h2 id="st-s5">5. Esercizi</h2>
        <ol class="st-esercizi">
          <li>Aggiungi alla pagina una sezione con tre schede affiancate usando Flexbox.</li>
          <li>Calcola lo spazio occupato da un <code>div</code> con <code>width: 200px; padding: 10px 20px; border: 3px solid; margin: 15px</code>.</li>
          <li>Valida la pagina con il validatore del W3C e correggi gli eventuali errori.</li>
        </ol>` },
      { id: 'database', titolo: 'Database relazionali', minuti: 10, giorni: -25, corpo: () => `
        <p class="st-intro">Un <b>database relazionale</b> organizza i dati in <b>tabelle</b> (relazioni) collegate tra loro. Il <b>DBMS</b> (MySQL, PostgreSQL, SQLite…) li gestisce garantendo integrità, sicurezza e accesso concorrente.</p>
        <h2 id="st-s1">1. Termini</h2>
        ${tabella(['Termine', 'Significato'], [['Tabella (relazione)', 'insieme di righe con la stessa struttura'], ['Riga (tupla, record)', 'un elemento, per esempio uno studente'], ['Colonna (attributo, campo)', 'una proprietà, con il suo dominio (tipo)'], ['Chiave primaria', 'attributo (o insieme) che identifica ogni riga in modo univoco'], ['Chiave esterna', 'attributo che fa riferimento alla chiave primaria di un\'altra tabella']])}
        <h2 id="st-s2">2. Integrità</h2>
        <ul><li><b>Integrità di entità</b>: la chiave primaria non può essere NULL né ripetuta.</li><li><b>Integrità referenziale</b>: una chiave esterna deve corrispondere a una riga esistente (o essere NULL).</li><li><b>Vincoli di dominio</b>: tipi di dato, CHECK, NOT NULL.</li></ul>
        <h2 id="st-s3">3. Transazioni e proprietà ACID</h2>
        <p>Una <b>transazione</b> è un gruppo di operazioni che vanno eseguite tutte o nessuna: <b>A</b>tomicità, <b>C</b>onsistenza, <b>I</b>solamento, <b>D</b>urabilità.</p>
        ${nota('info', 'Esempio', 'Un bonifico toglie da un conto e aggiunge a un altro: se si interrompe a metà, il DBMS annulla tutto (ROLLBACK).')}` },
      { id: 'sql', titolo: 'Il linguaggio SQL', minuti: 14, giorni: -20, corpo: () => `
        <p class="st-intro"><b>SQL</b> è il linguaggio standard dei database relazionali. Si divide in <b>DDL</b> (definire le strutture), <b>DML</b> (manipolare i dati), <b>DCL</b> (permessi) e <b>DQL</b> (interrogazioni, SELECT).</p>
        <h2 id="st-s1">1. Creare le tabelle</h2>
        ${ide('scuola.sql', 'sql', `CREATE TABLE classi (
  id_classe INT PRIMARY KEY,
  sezione   VARCHAR(5) NOT NULL
);
CREATE TABLE studenti (
  matricola INT PRIMARY KEY,
  cognome   VARCHAR(40) NOT NULL,
  nome      VARCHAR(40) NOT NULL,
  id_classe INT,
  FOREIGN KEY (id_classe) REFERENCES classi(id_classe)
);`, 'DDL: due tabelle collegate da una chiave esterna.')}
        <h2 id="st-s2">2. Interrogazioni</h2>
        ${ide('query.sql', 'sql', `-- studenti della 5B in ordine alfabetico
SELECT s.cognome, s.nome
FROM studenti s JOIN classi c ON s.id_classe = c.id_classe
WHERE c.sezione = '5B'
ORDER BY s.cognome;

-- quanti studenti per classe, solo le classi con più di 20 studenti
SELECT c.sezione, COUNT(*) AS numero
FROM studenti s JOIN classi c ON s.id_classe = c.id_classe
GROUP BY c.sezione
HAVING COUNT(*) > 20;`, 'JOIN, WHERE, GROUP BY e HAVING.')}
        ${tabella(['Clausola', 'A cosa serve'], [['WHERE', 'filtra le righe prima del raggruppamento'], ['GROUP BY', 'raggruppa le righe con lo stesso valore'], ['HAVING', 'filtra i gruppi (dopo le funzioni di aggregazione)'], ['ORDER BY', 'ordina il risultato (ASC o DESC)'], ['COUNT, SUM, AVG, MIN, MAX', 'funzioni di aggregazione']])}
        <h2 id="st-s3">3. Modificare i dati</h2>
        ${ide('dml.sql', 'sql', `INSERT INTO studenti (matricola, cognome, nome, id_classe) VALUES (42, 'Rossi', 'Anna', 3);
UPDATE studenti SET id_classe = 4 WHERE matricola = 42;
DELETE FROM studenti WHERE matricola = 42;`, 'DML: INSERT, UPDATE, DELETE.')}
        ${nota('avviso', 'Attenzione', 'UPDATE e DELETE senza WHERE modificano o cancellano tutte le righe della tabella.')}` },
      { id: 'normalizzazione', titolo: 'La normalizzazione', minuti: 12, giorni: -15, corpo: () => `
        <p class="st-intro">La <b>normalizzazione</b> elimina le ridondanze da una tabella, per evitare le <b>anomalie</b> di inserimento, modifica e cancellazione. Si procede per <b>forme normali</b>.</p>
        <h2 id="st-s1">1. Le forme normali</h2>
        ${tabella(['Forma', 'Condizione'], [['1NF', 'ogni attributo contiene un solo valore atomico (niente elenchi o gruppi ripetuti) e c\'è una chiave primaria'], ['2NF', '1NF e ogni attributo non chiave dipende da tutta la chiave, non da una sua parte'], ['3NF', '2NF e nessun attributo non chiave dipende da un altro attributo non chiave (niente dipendenze transitive)']])}
        <h2 id="st-s2">2. Un esempio</h2>
        <p>Tabella <code>Esami(matricola, codCorso, nomeStudente, nomeCorso, voto)</code> con chiave (matricola, codCorso). <code>nomeStudente</code> dipende solo da <code>matricola</code> e <code>nomeCorso</code> solo da <code>codCorso</code>: è in 1NF ma non in 2NF.</p>
        <p>Si scompone in: <code>Studenti(matricola, nomeStudente)</code>, <code>Corsi(codCorso, nomeCorso)</code>, <code>Esami(matricola, codCorso, voto)</code>.</p>
        <h2 id="st-s3">3. Dipendenza transitiva</h2>
        <p>In <code>Studenti(matricola, cap, citta)</code> la città dipende dal CAP, che dipende dalla matricola: è una dipendenza transitiva. Per la 3NF si sposta <code>(cap, citta)</code> in una tabella a parte.</p>
        ${nota('info', 'Anomalie', 'Se il nome di un corso è ripetuto su mille righe, cambiarlo richiede mille modifiche (anomalia di aggiornamento): è il segno che la tabella va normalizzata.')}` },
      { id: 'er', titolo: 'Progettazione: il modello E/R', minuti: 12, giorni: -10, corpo: () => `
        <p class="st-intro">La progettazione di un database parte dal modello concettuale <b>Entità/Relazioni</b> (E/R), passa allo <b>schema logico</b> (le tabelle) e arriva allo schema fisico nel DBMS.</p>
        <h2 id="st-s1">1. Elementi del modello E/R</h2>
        ${tabella(['Elemento', 'Rappresentazione', 'Esempio'], [['Entità', 'rettangolo', 'Studente, Corso'], ['Attributo', 'ovale (o pallino)', 'nome, data di nascita'], ['Identificatore', 'attributo sottolineato', 'matricola'], ['Associazione', 'rombo', 'Studente <i>frequenta</i> Corso']])}
        <h2 id="st-s2">2. Cardinalità</h2>
        <ul><li><b>1:1</b> — una persona ha una sola carta d'identità.</li><li><b>1:N</b> — una classe ha molti studenti, ogni studente una classe.</li><li><b>N:M</b> — uno studente segue molti corsi e ogni corso ha molti studenti.</li></ul>
        <h2 id="st-s3">3. Dal modello E/R alle tabelle</h2>
        <ul><li>Ogni entità diventa una tabella, l'identificatore diventa chiave primaria.</li><li>Associazione <b>1:N</b>: la chiave del lato 1 diventa chiave esterna nella tabella del lato N.</li><li>Associazione <b>N:M</b>: si crea una tabella nuova con le due chiavi esterne (e gli attributi dell'associazione).</li></ul>
        ${nota('info', 'Esempio', 'Studente N:M Corso → Iscrizioni(matricola, codCorso, anno), con chiave primaria (matricola, codCorso).')}` },
      { id: 'php', titolo: 'Programmazione lato server con PHP', minuti: 13, giorni: -5, corpo: () => `
        <p class="st-intro">I linguaggi <b>lato server</b> (PHP, Node.js, Python, Java) generano le pagine sul server, leggono i dati inviati dai moduli e dialogano con il database. Il browser riceve solo il risultato, di solito HTML o JSON.</p>
        <h2 id="st-s1">1. Leggere un modulo</h2>
        ${ide('saluto.php', 'php', `<?php
$nome = trim($_POST['nome'] ?? '');
if ($nome === '') { http_response_code(400); exit('Nome mancante'); }
echo '<p>Ciao, ' . htmlspecialchars($nome) . '!</p>';`, 'I dati del modulo arrivano in $_POST (o $_GET); htmlspecialchars evita di inserire codice HTML nella pagina.')}
        <h2 id="st-s2">2. Interrogare il database con PDO</h2>
        ${ide('studenti.php', 'php', `<?php
$db = new PDO('mysql:host=localhost;dbname=scuola;charset=utf8mb4', 'utente', 'password');
$q = $db->prepare('SELECT cognome, nome FROM studenti WHERE id_classe = ?');
$q->execute([$_GET['classe'] ?? 0]);
foreach ($q->fetchAll(PDO::FETCH_ASSOC) as $s) {
    echo htmlspecialchars($s['cognome'] . ' ' . $s['nome']) . '<br>';
}`, 'Query preparata: i parametri non vengono mai incollati nel testo della query.')}
        <h2 id="st-s3">3. Sessioni</h2>
        <p>Con <code>session_start()</code> PHP associa al browser un identificativo (in un cookie) e conserva i dati in <code>$_SESSION</code>: è il modo classico per gestire il login.</p>
        ${nota('avviso', 'SQL injection', 'Mai costruire una query concatenando i dati dell\'utente: si usano sempre le query preparate (prepare/execute).')}` },
    ],
  };
})();
