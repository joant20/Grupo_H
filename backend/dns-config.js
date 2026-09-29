
const dns = require('node:dns');

// Configurar los servidores DNS de Cloudflare
dns.setServers(['1.1.1.1', '1.0.0.1']);

console.log('DNS configurado correctamente');

module.exports = dns;
