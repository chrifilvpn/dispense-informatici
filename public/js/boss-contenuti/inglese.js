// DISPENSE — Inglese: gli argomenti, ognuno con la sua pagina (usa gli aiuti di boss-pagina.js: nota, ide, terminale, figura…).
(() => {
  const { nota, ide, terminale, figura, tabella } = window.BossAiuti;
  void ide; void terminale; void figura; void tabella;
  window.BossContenuti = window.BossContenuti || {};
  window.BossContenuti.inglese = {
    id: 'inglese', nome: 'Inglese', prof: 'Prof.ssa L. Bianchi',
    argomenti: [
      { id: 'cloud', titolo: 'Cloud computing and data centres', minuti: 9, giorni: -26, corpo: () => `
        <p class="st-intro"><b>Cloud computing</b> is the delivery of computing services — servers, storage, databases, networking and software — over the Internet. Instead of buying and maintaining their own machines, companies <i>rent</i> resources from a provider and pay only for what they use.</p>
        <h2 id="st-s1">1. Key vocabulary</h2>
        <div class="st-tabella"><table><thead><tr><th>English</th><th>Meaning</th><th>Italiano</th></tr></thead><tbody>
          <tr><td><b>on-premises</b></td><td>hardware kept in the company's own building</td><td>in sede</td></tr>
          <tr><td><b>scalability</b></td><td>the ability to add or remove resources quickly</td><td>scalabilità</td></tr>
          <tr><td><b>downtime</b></td><td>the time when a service is not available</td><td>tempo di inattività</td></tr>
          <tr><td><b>backup</b></td><td>a copy of data kept in a safe place</td><td>copia di sicurezza</td></tr>
          <tr><td><b>latency</b></td><td>the delay before data starts to arrive</td><td>latenza</td></tr>
          <tr><td><b>provider</b></td><td>the company that sells the service</td><td>fornitore</td></tr></tbody></table></div>
        <h2 id="st-s2">2. Service models: IaaS, PaaS and SaaS</h2>
        <p>With <b>IaaS</b> (Infrastructure as a Service) you rent virtual machines, storage and networks, and you manage the operating system yourself. With <b>PaaS</b> (Platform as a Service) the provider also manages the operating system and the runtime: developers only upload their code. With <b>SaaS</b> (Software as a Service) you simply use a finished application in the browser, like webmail or an online office suite.</p>
        ${nota('info', 'Remember', 'The higher you go (IaaS → PaaS → SaaS), the less you manage and the less control you have.')}
        <h2 id="st-s3">3. Inside a data centre</h2>
        <p>A data centre is a building full of <b>racks</b> of servers. It needs a reliable power supply (with <b>UPS</b> units and generators), a cooling system, fast network links and strong physical security. Providers build data centres in different <b>regions</b>, so that a service can keep working even if one site goes offline.</p>
        <h2 id="st-s4">4. Advantages and disadvantages</h2>
        <p>The main <b>advantages</b> are lower initial costs, scalability, automatic updates and access from anywhere. The main <b>disadvantages</b> are the need for a stable Internet connection, less control over where the data is stored, and the risk of depending on a single provider (<i>vendor lock-in</i>).</p>
        <h2 id="st-s5">Exercises</h2>
        <ol class="st-esercizi">
          <li>Match each service to its model (IaaS, PaaS or SaaS): an online spreadsheet, a virtual server with Linux, a platform where you deploy a web app.</li>
          <li>Write 80–100 words: "Should our school move its files to the cloud?" Give two advantages and one disadvantage.</li>
          <li>Translate into English: «Il fornitore garantisce un tempo di inattività inferiore a un'ora all'anno».</li>
        </ol>` },
      { id: 'grammar', titolo: 'Present perfect vs past simple · Conditionals', minuti: 12, giorni: -19, corpo: () => `
        <p class="st-intro">Two topics for this unit: when to use the <b>present perfect</b> and when the <b>past simple</b>, and how to build <b>conditional sentences</b>. Both are essential in technical English, for example when you describe what a program <i>has done</i> or what <i>will happen if</i> a user clicks a button.</p>
        <h2 id="st-s1">1. Present perfect</h2>
        <p>Form: <b>have / has + past participle</b>. We use it for actions that happened at an unspecified time before now, or that started in the past and continue now. Typical words: <i>ever, never, already, yet, just, since, for</i>.</p>
        <div class="st-tabella"><table><thead><tr><th>Affirmative</th><th>Negative</th><th>Question</th></tr></thead><tbody>
          <tr><td>I have installed the update.</td><td>I haven't installed it yet.</td><td>Have you installed it?</td></tr>
          <tr><td>She has worked here since 2020.</td><td>She hasn't worked here for long.</td><td>How long has she worked here?</td></tr></tbody></table></div>
        <h2 id="st-s2">2. Past simple</h2>
        <p>Form: <b>verb + -ed</b> (regular) or the second column of irregular verbs (<i>go → went, write → wrote</i>). We use it for finished actions at a <b>specific time</b> in the past. Typical words: <i>yesterday, last week, in 2019, two days ago</i>.</p>
        ${nota('info', 'Present perfect or past simple?', 'If you say WHEN, use the past simple: «I fixed the bug yesterday». If the time is not important or not finished, use the present perfect: «I have fixed the bug» (it works now).')}
        <h2 id="st-s3">3. Conditionals</h2>
        <div class="st-tabella"><table><thead><tr><th>Type</th><th>Form</th><th>Use</th><th>Example</th></tr></thead><tbody>
          <tr><td><b>Zero</b></td><td>if + present, present</td><td>facts, things always true</td><td>If you heat water to 100 °C, it boils.</td></tr>
          <tr><td><b>First</b></td><td>if + present, will + verb</td><td>real, possible future</td><td>If the server crashes, we will lose the data.</td></tr>
          <tr><td><b>Second</b></td><td>if + past simple, would + verb</td><td>imaginary or unlikely situations</td><td>If I had more RAM, the game would run faster.</td></tr></tbody></table></div>
        ${nota('avviso', 'Common mistake', 'Never put «will» or «would» after «if»: ✗ If it will rain… → ✓ If it rains… In the second conditional we often say «If I were you» for all persons.')}
        <h2 id="st-s4">Exercises</h2>
        <ol class="st-esercizi">
          <li>Put the verbs in the present perfect or past simple: «I (write) the report last night, but I (not send) it yet».</li>
          <li>Complete with the first conditional: «If you (click) this link, the browser (open) a new tab».</li>
          <li>Write three second-conditional sentences starting with «If I were a programmer…».</li>
          <li>Find and correct the mistake: «If the battery will be low, the laptop turns off».</li>
        </ol>` },
      { id: 'networks', titolo: 'Computer networks: key vocabulary', minuti: 8, giorni: -12, corpo: () => `
        <p class="st-intro">This unit reviews the <b>vocabulary of computer networks</b> that you need to read technical documentation and describe a network in English.</p>
        <h2 id="st-s1">1. Types of network</h2>
        ${tabella(['Term', 'Meaning'], [['LAN', 'Local Area Network: a network in a building, for example a school'], ['WAN', 'Wide Area Network: it connects networks over long distances'], ['WLAN', 'Wireless LAN, usually Wi-Fi'], ['VPN', 'Virtual Private Network: a secure tunnel over the Internet']])}
        <h2 id="st-s2">2. Devices</h2>
        <ul><li>A <b>router</b> forwards packets between different networks.</li><li>A <b>switch</b> connects devices in the same LAN and forwards frames using MAC addresses.</li><li>An <b>access point</b> lets wireless devices join the network.</li><li>A <b>firewall</b> filters traffic according to a set of rules.</li></ul>
        <h2 id="st-s3">3. Useful phrases</h2>
        <ul><li>«The server <b>is connected to</b> the switch <b>via</b> a Gigabit Ethernet cable.»</li><li>«Each device <b>is assigned</b> an IP address <b>by</b> the DHCP server.» (passive voice)</li><li>«If the router fails, the whole network <b>goes down</b>.»</li></ul>
        ${nota('info', 'False friends', '«Actually» means «in realtà», not «attualmente» (= currently); «to install» and «to set up» are both common for software and devices.')}` },
      { id: 'security', titolo: 'Cybersecurity: threats and good practice', minuti: 9, giorni: -5, corpo: () => `
        <p class="st-intro"><b>Cybersecurity</b> is the practice of protecting systems, networks and data from digital attacks. This unit presents the main threats and some good habits.</p>
        <h2 id="st-s1">1. Common threats</h2>
        ${tabella(['Threat', 'Description'], [['Malware', 'malicious software, such as viruses, worms and trojans'], ['Ransomware', 'it encrypts your files and asks for a ransom'], ['Phishing', 'fake emails or websites that steal passwords'], ['DDoS attack', 'many computers flood a server so that it stops working']])}
        <h2 id="st-s2">2. Good practice</h2>
        <ul><li>Use <b>strong, unique passwords</b> and a password manager.</li><li>Turn on <b>two-factor authentication</b> (2FA).</li><li><b>Update</b> your operating system and apps regularly.</li><li>Make <b>backups</b> and keep one copy offline.</li></ul>
        <h2 id="st-s3">3. Modal verbs for advice</h2>
        <p>We use <b>should</b> and <b>must</b> to give advice and rules: «You <b>should</b> change your password every few months.» «Employees <b>must not</b> share their credentials.»</p>
        ${nota('avviso', 'Reading tip', 'In security texts, «to breach» means to break into a system; a «data breach» is an incident in which data are stolen.')}` },
    ],
  };
})();
