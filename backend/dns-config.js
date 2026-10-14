/**
 * DNS de respaldo (arregla fallos de conexión raros en Windows)
 *
 * A veces el DNS del sistema no resuelve bien los servidores de
 * MongoDB/Cloudinary y la conexión falla sin motivo aparente.
 * Este archivo le dice a Node que use los servidores DNS de Cloudflare
 * (1.1.1.1 y 1.0.0.1). Se carga al principio de src/server.js.
 */
const dns = require('node:dns');

dns.setServers(['1.1.1.1', '1.0.0.1']);

console.log('DNS configurado correctamente');

module.exports = dns;
