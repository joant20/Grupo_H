/**
 * SERVICE WORKER DE NOTIFICACIONES PUSH (sw.js)
 *
 * Este archivo lo descarga el navegador y queda vivo en segundo plano.
 * Es el ÚNICO lugar donde el navegador puede mostrar un aviso push aunque
 * la pestaña de FoodApp esté cerrada (o el celular esté bloqueado).
 *
 * Flujo:
 *  - El backend manda un mensaje cifrado cuando la cocina cambia el estado.
 *  - El navegador lo desencripta y nos entrega aquí (evento "push").
 *  - Nosotros mostramos la notificación con el título y texto que vino.
 *  - Si el usuario hace clic, abrimos /mis-pedidos.
 */

// El usuario tocó la notificación: cerramos y abrimos el seguimiento.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ventanas) => {
      // Si la pestaña ya está abierta, la traemos al frente
      for (const ventana of ventanas) {
        if ('focus' in ventana) return ventana.focus();
      }
      // Si no, abrimos una nueva en Mis Pedidos
      return self.clients.openWindow('/mis-pedidos');
    })
  );
});

// Llegó un aviso desde el backend
self.addEventListener('push', (event) => {
  // El backend manda JSON: { titulo, cuerpo, tag, icono }
  let aviso = { titulo: 'FoodApp', cuerpo: 'Tu pedido cambió de estado' }

  try {
    aviso = { ...aviso, ...event.data.json() }
  } catch {
    // Si el mensaje no era JSON, mostramos el texto crudo
    if (event.data) aviso.cuerpo = event.data.text()
  }

  event.waitUntil(
    self.registration.showNotification(aviso.titulo, {
      body: aviso.cuerpo,
      // Mismo pedido => reemplaza el aviso anterior en vez de apilar 10
      tag: aviso.tag || 'foodapp-pedido',
      icon: aviso.icono || '/favicon.svg',
      badge: '/favicon.svg',
      data: { url: aviso.url || '/mis-pedidos' },
    })
  )
});
