// Controlli dei giochi della cartella giochi2: ogni file di test/giochi2 si esegue da solo (chiamato da test/simula.js)
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'giochi2');
for (const f of (fs.existsSync(dir) ? fs.readdirSync(dir) : []).filter((x) => x.endsWith('.js')).sort()) require(path.join(dir, f));
