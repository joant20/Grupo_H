require('dotenv').config();
const BASE = 'http://localhost:4000';
const mongoose = require('mongoose');

const j = async (met, url, body, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(BASE + url, { method: met, headers, body: body ? JSON.stringify(body) : undefined });
  const texto = await r.text();
  let data = texto;
  try { data = JSON.parse(texto); } catch { /* respuesta en texto plano */ }
  return { status: r.status, data };
};

(async () => {
  const resultados = [];

  const root = await j('GET', '/');
  resultados.push([`GET /`, root.status, JSON.stringify(root.data).slice(0, 60)]);

  const lista = await j('GET', '/api/products');
  resultados.push([`GET /api/products`, lista.status, `productos: ${Array.isArray(lista.data) ? lista.data.length : 'N/A'}`]);

  const email = `test${Date.now()}@prueba.com`;
  const reg = await j('POST', '/api/users/register', { nombre: 'Test', email, password: '123456' });
  resultados.push([`POST /api/users/register`, reg.status, reg.data?.mensaje || JSON.stringify(reg.data).slice(0, 60)]);

  const log = await j('POST', '/api/users/login', { email, password: '123456' });
  resultados.push([`POST /api/users/login`, log.status, log.data?.mensaje || '']);
  const tokenCliente = log.data?.token;

  const sinToken = await j('POST', '/api/products', { nombre: 'x', descripcion: 'x', precio: 1 });
  resultados.push([`POST /api/products SIN token (debe 401)`, sinToken.status, sinToken.data?.mensaje || '']);

  const clienteCrear = await j('POST', '/api/products', { nombre: 'x', descripcion: 'x', precio: 1 }, tokenCliente);
  resultados.push([`POST /api/products como cliente (debe 403)`, clienteCrear.status, clienteCrear.data?.mensaje || '']);

  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.db.collection('users').updateOne({ email }, { $set: { rol: 'admin' } });

  const log2 = await j('POST', '/api/users/login', { email, password: '123456' });
  const tokenAdmin = log2.data?.token;
  resultados.push([`login como admin`, log2.status, `rol: ${log2.data?.usuario?.rol}`]);

  const crear = await j('POST', '/api/products', {
    nombre: 'Plato de prueba', descripcion: 'Prueba creación', precio: 99,
    categoria: 'Pruebas', tiempoPreparacion: 10, calorias: 100, destacado: false
  }, tokenAdmin);
  resultados.push([`POST /api/products como admin`, crear.status, crear.data?.mensaje || `id: ${crear.data?._id}`]);
  const idProducto = crear.data?._id;

  if (idProducto) {
    const upd = await j('PUT', `/api/products/${idProducto}`, { precio: 150 }, tokenAdmin);
    resultados.push([`PUT /api/products/:id`, upd.status, `precio: ${upd.data?.precio ?? upd.data?.mensaje}`]);

    const patch = await j('PATCH', `/api/products/${idProducto}/desactivar`, null, tokenAdmin);
    resultados.push([`PATCH /api/products/:id/desactivar`, patch.status, patch.data?.mensaje || '']);

    const uno = await j('GET', `/api/products/${idProducto}`);
    resultados.push([`GET /api/products/:id`, uno.status, `disponible: ${uno.data?.disponible}`]);
  }

  const idProdMalo = await j('GET', '/api/products/123');
  resultados.push([`GET /api/products/123 (id inválido, debe 400)`, idProdMalo.status, idProdMalo.data?.mensaje || '']);

  // limpieza
  if (idProducto) await mongoose.connection.db.collection('products').deleteOne({ _id: new mongoose.Types.ObjectId(idProducto) });
  await mongoose.connection.db.collection('users').deleteOne({ email });

  console.log('\n=== RESULTADOS ===');
  for (const [nombre, status, detalle] of resultados) {
    console.log(`${status}  ${nombre}  ->  ${detalle}`);
  }
  await mongoose.disconnect();
  process.exit(0);
})().catch(e => { console.error('ERROR SCRIPT:', e.message); process.exit(1); });
