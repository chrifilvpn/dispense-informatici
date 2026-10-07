// DISPENSE — domande di Inglese per esercitazioni e verifiche (formato in esercizi-sistemi.js).
(() => {
  const { S, VF, C, A, O } = window.BossAiuti.domande;
  window.BossEsercizi = window.BossEsercizi || {};
  window.BossEsercizi.inglese = {
    cloud: [
      S('What does SaaS stand for?', ['Storage as a Service', 'Software as a Service', 'System as a Server', 'Security as a Service'], 1, 'Software as a Service: ready-to-use applications.'),
      S('A data centre is…', ['a single laptop', 'a building with many servers', 'a type of cable', 'a programming language'], 1, 'Data centres host thousands of servers.'),
      S('«Scalable» means that a service…', ['is very cheap', 'can grow or shrink with demand', 'is always free', 'works offline'], 1, 'Resources can be added or removed.'),
      VF('In the public cloud, the infrastructure belongs to a provider.', true, 'For example AWS, Azure or Google Cloud.'),
      VF('«Downtime» is the time when a service is working perfectly.', false, 'Downtime is when a service is not available.'),
      C('Companies pay for cloud services on a pay-as-you-___ basis.', ['go'], 'Pay-as-you-go: you pay for what you use.'),
      A('Match the word with its meaning.', [['backup', 'copy of data'], ['provider', 'company that offers the service'], ['storage', 'space to keep data'], ['outage', 'service interruption']], 'Cloud vocabulary.'),
      S('Which is an example of IaaS?', ['Gmail', 'A rented virtual machine', 'Google Docs', 'Instagram'], 1, 'Infrastructure: virtual machines, networks, disks.'),
      O('Write two advantages of cloud computing.', 'You can access your data from anywhere, and you do not need to buy and maintain your own servers because resources scale with demand.', ['anywhere', 'server', 'scal']),
    ],
    grammar: [
      S('Choose the correct sentence.', ['I have finished the project yesterday.', 'I finished the project yesterday.', 'I have finish the project yesterday.', 'I finishing the project yesterday.'], 1, 'With a finished time (yesterday) we use the past simple.'),
      S('«If it rains, we ___ at home.»', ['stay', 'will stay', 'would stay', 'stayed'], 1, 'First conditional: if + present simple, will + verb.'),
      S('«If I ___ you, I would study more.»', ['am', 'was', 'were', 'will be'], 2, 'Second conditional: «If I were you».'),
      VF('«Have you ever used Linux?» is correct.', true, 'Present perfect with ever for life experiences.'),
      VF('«If the battery will be low, the laptop turns off» is correct.', false, 'No «will» after «if»: «If the battery is low…».'),
      C('She ___ (work) here since 2020. (present perfect)', ['has worked', "'s worked"], 'Present perfect with since.'),
      A('Match the sentence halves.', [['I have lived here', 'since 2019.'], ['She moved to Milan', 'last year.'], ['If it rains,', 'we will stay at home.'], ['If I were rich,', 'I would buy a new PC.']], 'Present perfect with since, past simple with last year, first and second conditional.'),
      S('«The game ___ faster if I had more RAM.»', ['runs', 'will run', 'would run', 'ran'], 2, 'Second conditional: would + verb.'),
      O('Write one sentence with the present perfect and one with the past simple about a computer.', 'I have installed a new operating system. / I installed it last Monday.', ['have', 'last', 'ed']),
    ],
    networks: [
      S('A LAN is a network…', ['that covers a whole country', 'in a limited area, like a school', 'only for phones', 'without devices'], 1, 'Local Area Network.'),
      S('Which device forwards packets between different networks?', ['Switch', 'Router', 'Hub', 'Printer'], 1, 'The router works with IP addresses.'),
      S('«Actually» means…', ['attualmente', 'in realtà', 'attivamente', 'appunto'], 1, 'False friend: «attualmente» is «currently».'),
      VF('An access point lets wireless devices join a network.', true, 'It connects Wi-Fi devices to the LAN.'),
      VF('A WAN covers a smaller area than a LAN.', false, 'A WAN covers long distances.'),
      C('Each device is ___ an IP address by the DHCP server. (passive)', ['assigned'], 'Passive voice: is assigned.'),
      A('Match the device with its job.', [['router', 'connects networks'], ['switch', 'connects devices in a LAN'], ['firewall', 'filters traffic'], ['modem', 'connects to the provider']], 'Network devices.'),
      S('«The whole network goes down» means that…', ['it becomes faster', 'it stops working', 'it is updated', 'it moves downstairs'], 1, 'To go down = to stop working.'),
      O('Describe your school network in two sentences.', 'The school network is a LAN with switches in every lab and a router that connects it to the Internet. Wireless devices join through access points.', ['lan', 'router', 'switch']),
    ],
    security: [
      S('What is phishing?', ['A type of cable', 'Fake emails or websites that steal data', 'A backup method', 'A fast network'], 1, 'Attackers pretend to be a trusted company.'),
      S('Ransomware…', ['cleans your disk', 'encrypts your files and asks for money', 'speeds up the PC', 'is an antivirus'], 1, 'You pay a ransom to get your files back (and it is not guaranteed).'),
      S('Which modal verb expresses a rule?', ['might', 'must', 'could', 'would'], 1, '«You must not share your password.»'),
      VF('Two-factor authentication adds a second check besides the password.', true, 'For example a code on your phone.'),
      VF('You should use the same password for every website.', false, 'Use strong, unique passwords.'),
      C('A ___ attack floods a server with requests from many computers.', ['ddos'], 'Distributed Denial of Service.'),
      A('Match the word with the definition.', [['malware', 'malicious software'], ['breach', 'data stolen from a system'], ['backup', 'copy of your files'], ['update', 'new version with fixes']], 'Security vocabulary.'),
      S('«You ___ update your apps regularly» (advice).', ['should', 'mustn\'t', 'can\'t', 'shouldn\'t'], 0, 'Should gives advice.'),
      O('Give three pieces of advice to stay safe online.', 'You should use strong, unique passwords; you should turn on two-factor authentication; you must not open links in suspicious emails.', ['password', 'should', 'email']),
    ],
  };
})();
