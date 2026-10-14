/**
 * CONTROLADOR DE PEDIDOS (las "recetas" de /api/orders)
 *
 * Aquí vive la lógica de los pedidos:
 *  - crearPedido.............. POST   /api/orders       (cliente logueado)
 *  - crearPedidoInvitado...... POST   /api/orders/invitado (sin sesión, #76)
 *  - listarPedidos............ GET    /api/orders  (cliente: los suyos; cocina: activos; admin: todos)
 *  - obtenerPedido............ GET    /api/orders/:id
 *  - obtenerPedidoInvitado.... GET    /api/orders/invitado/:id?clave=... (sin sesión, #76)
 *  - cambiarEstadoPedido...... PATCH  /api/orders/:id/estado  (solo cocina/admin)
 *
 * Aviso (HU07): las notificaciones al cliente ya NO son por WhatsApp; ahora
 * las lanza el navegador desde el frontend (ver Frontend/src/lib/notificaciones.js).
 */
const crypto = require('crypto');
const Product = require('../models/Product');
const Orden = require('../models/Orden');
const { avisarCambioDeEstado } = require('../services/pushService');

// El modelo solo acepta minúsculas: sin esto POST /api/orders respondía 500
// cuando llegaba "Tarjeta" o "Efectivo" en mayúsculas (#69)
const normalizarMetodoPago = (valor) => String(valor || '').trim().toLowerCase();

// Los pedidos de INVITADO se borran solos 10 minutos después de terminar
// (entregado o cancelado). issue #76.
const MINUTOS_PARA_BORRAR_INVITADO = 10;

// Valida los items del body y arma la lista de productos con sus precios
// ACTUALES de la base de datos (el cliente ya no manda precios: eso evita
// que alguien mande un precio falso).
// Devuelve { status, mensaje } si algo falla, o { productosDelPedido, subtotal }.
const prepararProductos = async (items) => {
    const productosDelPedido = [];
    let subtotal = 0;

    for (const item of items) {
        const producto = await Product.findById(item.productId);

        if (!producto) {
            return { status: 404, mensaje: `Producto ${item.productId} no encontrado` };
        }
        if (!producto.disponible) {
            return { status: 400, mensaje: `${producto.nombre} ya no esta disponible` };
        }

        const subtotalItem = producto.precio * item.cantidad;
        subtotal += subtotalItem;

        productosDelPedido.push({
            nombre: producto.nombre,
            cantidad: item.cantidad,
            precioUnitario: producto.precio,
            subtotal: subtotalItem
        });
    }

    return { productosDelPedido, subtotal };
};

// Revisa que el body traiga lo mínimo para crear cualquier pedido.
const validarPedido = (body) => {
    const { items, nombreCompleto, direccionEntrega, metodoPago } = body;

    if (!items || items.length === 0) {
        return { status: 400, mensaje: 'El pedido debe tener al menos un producto' };
    }
    if (!String(nombreCompleto || '').trim()) {
        return { status: 400, mensaje: 'Falta el nombre de quien recibe el pedido' };
    }
    if (!String(direccionEntrega || '').trim()) {
        return { status: 400, mensaje: 'Falta la dirección o lugar de entrega' };
    }

    const pago = normalizarMetodoPago(metodoPago);
    if (!['efectivo', 'tarjeta', 'transferencia'].includes(pago)) {
        return { status: 400, mensaje: 'Método de pago no válido' };
    }

    return { pago };
};

// Construye la Orden (sin guardar) ya validada. La usa el cliente logueado
// y el invitado: misma comida, mismo formato.
const construirOrden = (body, usuarioId, pago, productosDelPedido, subtotal) => {
    const {
        nombreCompleto, direccionEntrega, numero, modoPedido,
        telefono, notas, ultimos4
    } = body;

    return new Orden({
        usuario: usuarioId,
        nombreCompleto,
        productos: productosDelPedido,
        subtotal,
        total: subtotal,
        direccionEntrega,
        metodoPago: pago,
        // Campos que antes se descartaban y ya se persisten (#70)
        numero,
        modoPedido,
        telefono: String(telefono || '').trim(),
        notas,
        // Solo los últimos 4 dígitos: la tarjeta completa jamás se guarda
        ultimos4: ultimos4 || null,
        // Primer paso del proceso que va a seguir el cliente
        historialEstados: [{ estado: 'Recibido', fecha: new Date() }]
    });
};

// POST /api/orders  (cliente con sesión iniciada)
const crearPedido = async (req, res) => {
    try {
        const { status, mensaje, pago } = validarPedido(req.body);
        if (status) return res.status(status).json({ mensaje });

        const listo = await prepararProductos(req.body.items);
        if (listo.status) return res.status(listo.status).json({ mensaje: listo.mensaje });

        const nuevoPedido = construirOrden(
            req.body, req.usuario.id, pago, listo.productosDelPedido, listo.subtotal
        );

        await nuevoPedido.save();
        res.status(201).json(nuevoPedido);

    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear el pedido', error: error.message });
    }
};

// POST /api/orders/invitado  (SIN sesión — issue #76)
//
// Igual que el pedido normal pero sin usuario. El backend devuelve una
// `claveInvitado`: con ella (y el id) el invitado puede ver su pedido en
// /mis-pedidos sin crear cuenta. Esa clave nunca se guarda en el navegador
// de otros, así que nadie más puede verlo.
const crearPedidoInvitado = async (req, res) => {
    try {
        const { status, mensaje, pago } = validarPedido(req.body);
        if (status) return res.status(status).json({ mensaje });

        const listo = await prepararProductos(req.body.items);
        if (listo.status) return res.status(listo.status).json({ mensaje: listo.mensaje });

        const nuevoPedido = construirOrden(
            req.body, null, pago, listo.productosDelPedido, listo.subtotal
        );
        // Clave secreta de 32 caracteres (no se adivina)
        nuevoPedido.claveInvitado = crypto.randomBytes(16).toString('hex');

        await nuevoPedido.save();
        res.status(201).json(nuevoPedido);

    } catch (error) {
        if (error.name === 'ValidationError') {
        return res.status(400).json({ mensaje: 'Datos inválidos', error: error.message });
        }
        res.status(500).json({ mensaje: 'Error al crear el pedido', error: error.message });
    }
};

// GET /api/orders
const listarPedidos = async (req, res) => {
    try {
        let filtro = {};

        if (req.usuario.rol === 'cliente') {
            // El cliente solo ve SUS pedidos (para seguimiento y su historial)
            filtro.usuario = req.usuario.id;
        } else if (req.usuario.rol === 'cocina') {
            // La cocina solo atiende comandas ACTIVAS: los entregados y
            // cancelados ya no son suyos (son historial del admin) — issue #32
            filtro.estado = { $nin: ['Entregado', 'Cancelado'] };
        }
        // el admin ve todo (necesita el historial para /admin/ventas)

        const pedidos = await Orden.find(filtro).sort({ createdAt: -1 });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al listar los pedidos', error: error.message });
    }
};

// GET /api/orders/:id
const obtenerPedido = async (req, res) => {
    try {
        const pedido = await Orden.findById(req.params.id);

        if (!pedido) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        if (req.usuario.rol === 'cliente' && pedido.usuario?.toString() !== req.usuario.id) {
            return res.status(403).json({ mensaje: 'No tienes permiso para ver este pedido' });
        }

        res.json(pedido);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ mensaje: 'ID de pedido inválido' });
        }
        res.status(500).json({ mensaje: 'Error al obtener el pedido', error: error.message });
    }
};

// GET /api/orders/invitado/:id?clave=...  (SIN sesión — issue #76)
//
// El invitado solo puede ver SU pedido: hace falta la clave secreta que le
// dio el backend al crearlo. Si la clave no coincide, responde 404 (para no
// revelar que el pedido existe).
const obtenerPedidoInvitado = async (req, res) => {
    try {
        const pedido = await Orden.findById(req.params.id);

        if (!pedido || !pedido.claveInvitado || pedido.claveInvitado !== req.query.clave) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        res.json(pedido);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ mensaje: 'ID de pedido inválido' });
        }
        res.status(500).json({ mensaje: 'Error al obtener el pedido', error: error.message });
    }
};

// PATCH /api/orders/:id/estado  (solo cocina/admin — issues #31, #33, #60)
//
// Acepta en el body: { estado: "En camino", estimacionMinutos: 25 }
// La estimación de llegada solo aplica cuando el pedido sale a domicilio.
const cambiarEstadoPedido = async (req, res) => {
    try {
        const { estado, estimacionMinutos } = req.body;
        const permitidos = ['Recibido', 'En preparación', 'En camino', 'Listo para recoger', 'Entregado', 'Cancelado'];

        if (!permitidos.includes(estado)) {
            return res.status(400).json({ mensaje: 'Estado no válido' });
        }

        // Si la cocina manda minutos raros (texto, negativos, gigantes) no
        // reventamos: usamos un valor razonable de 25 minutos.
        const minutos = Number(estimacionMinutos);
        const llegaEnMinutos = Number.isFinite(minutos) && minutos >= 1 && minutos <= 240
            ? Math.round(minutos)
            : 25;

        const pedido = await Orden.findById(req.params.id);
        if (!pedido) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        if (pedido.estado === estado) {
            return res.json(pedido); // nada cambió, no hay nada que notificar
        }

        pedido.estado = estado;
        // Cada cambio deja su registro con la hora (lo ve el cliente en Mis Pedidos)
        pedido.historialEstados.push({ estado, fecha: new Date() });

        // #60: al salir a domicilio guardamos CUÁNDO salió y EN CUÁNTOS MINUTOS
        // llega. El frontend usa estos dos campos para el contador en vivo.
        if (estado === 'En camino') {
            pedido.enCaminoDesde = new Date();
            pedido.estimacionMinutos = llegaEnMinutos;
        }

        // #76: un pedido de INVITADO que terminó (entregado o cancelado) se
        // borra solo 10 minutos después. server.js hace la limpieza.
        if (!pedido.usuario && (estado === 'Entregado' || estado === 'Cancelado')) {
            const en10Minutos = new Date(Date.now() + MINUTOS_PARA_BORRAR_INVITADO * 60000);
            pedido.borrarEn = en10Minutos;
        }

        await pedido.save();

        // Requisito del maestro: el BACKEND dispara el aviso push al dueño
        // en el momento en que la cocina/admin cambia el estado (En camino,
        // Listo para recoger, Entregado, etc.). El navegador del cliente lo
        // recibe aunque tenga la pestaña cerrada. Si no hay suscripciones o
        // no están las llaves VAPID, no pasa nada (el toast en pantalla
        // sigue siendo el respaldo).
        avisarCambioDeEstado(pedido);

        // Aviso al cliente (HU07): ya NO es WhatsApp; lo muestra el navegador
        // del cliente en su pantalla de seguimiento (se actualiza solo).
        res.json(pedido);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ mensaje: 'ID de pedido inválido' });
        }
        res.status(500).json({ mensaje: 'Error al actualizar el estado', error: error.message });
    }
};

// PATCH /api/orders/:id/recibido  (el DUEÑO del pedido — issues #59/#7)
//
// ¿Quién pone "Entregado"? Quien realmente sabe que el pedido llegó:
// el CLIENTE, con un botón en /mis-pedidos. La cocina no puede saberlo
// (el repartidor llega a la hora que llega).
//
// Reglas:
//  - Solo se confirma si el pedido está "En camino" o "Listo para recoger".
//  - Si el pedido es de un cliente logueado: hace falta su token JWT y que
//    coincida el dueño (nadie más puede confirmar SU pedido).
//  - Si el pedido es de INVITADO: no hay token; se valida con la clave
//    secreta que guardó ese navegador al hacer el pedido.
const confirmarRecepcion = async (req, res) => {
    try {
        const pedido = await Orden.findById(req.params.id);
        if (!pedido) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        // ¿De quién es este pedido?
        if (pedido.usuario) {
            // Cliente logueado: solo él puede confirmar el recibido
            if (!req.usuario || String(pedido.usuario) !== String(req.usuario.id)) {
                return res.status(403).json({ mensaje: 'Este pedido no te pertenece' });
            }
        } else {
            // Invitado: sin clave secreta no se puede (evita que cualquiera
            // entregue pedidos ajenos si adivina el id)
            const clave = req.body?.clave || req.query.clave;
            if (!pedido.claveInvitado || !clave || clave !== pedido.claveInvitado) {
                return res.status(403).json({ mensaje: 'Clave de pedido incorrecta' });
            }
        }

        // Solo se confirma entrega si el pedido ya salió de la cocina
        const estadosConfirmables = ['En camino', 'Listo para recoger'];
        if (!estadosConfirmables.includes(pedido.estado)) {
            return res.status(400).json({
                mensaje: `Solo se puede confirmar la entrega de un pedido "${estadosConfirmables.join('" o "')}" (este está "${pedido.estado}")`
            });
        }

        pedido.estado = 'Entregado';
        pedido.historialEstados.push({ estado: 'Entregado', fecha: new Date() });

        // El pedido de invitado empieza a contar sus 10 minutos de borrado
        // desde QUE EL CLIENTE CONFIRMA, no desde que la cocina dice (issue #76)
        if (!pedido.usuario) {
            pedido.borrarEn = new Date(Date.now() + MINUTOS_PARA_BORRAR_INVITADO * 60000);
        }

        await pedido.save();
        res.json(pedido);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ mensaje: 'ID de pedido inválido' });
        }
        res.status(500).json({ mensaje: 'Error al confirmar la recepción', error: error.message });
    }
};

module.exports = {
    crearPedido,
    crearPedidoInvitado,
    listarPedidos,
    obtenerPedido,
    obtenerPedidoInvitado,
    cambiarEstadoPedido,
    confirmarRecepcion
};
