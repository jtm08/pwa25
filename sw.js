/*
 * Service Worker para la app Progressive Times.
 * Este archivo escucha eventos push y muestra notificaciones al usuario.
 * También maneja los clics en las notificaciones para abrir o enfocar la página correspondiente.
 */

// --- EVENTO PUSH ---
self.addEventListener('push', (event) => {
  // Muestra en la consola que se recibió un evento push.
  console.log('[ServiceWorker] Push event received');

  // Se crea un objeto vacío para guardar los datos que vengan del mensaje push.
  let payload = {};

  // Verifica si el evento push contiene datos.
  if (event.data) {
    try {
      // Intenta convertir el texto recibido (JSON) en un objeto JavaScript.
      payload = JSON.parse(event.data.text());
    } catch (err) {
      // Si ocurre un error al interpretar el JSON, se muestra en la consola.
      console.error('Error parsing push payload', err);
    }
  }

  // Título que aparecerá en la notificación.
  const title = 'Progressive Times';

  // Opciones de la notificación (contenido, ícono y enlace asociado).
  const options = {
    // Cuerpo del mensaje. Si no viene en el payload, se muestra un texto por defecto.
    body: payload.msg || 'You have a new message',
    // Icono que se mostrará en la notificación. Si no hay uno, usa el ícono por defecto.
    icon: payload.icon || '/images/newspaper.png',
    // URL o información adicional que se usará cuando el usuario haga clic.
    data: payload.url || '/'
  };

  // Espera a que se muestre la notificación antes de cerrar el proceso del Service Worker.
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// --- EVENTO CLICK EN LA NOTIFICACIÓN ---
self.addEventListener('notificationclick', (event) => {
  // Cierra la notificación cuando el usuario hace clic en ella.
  event.notification.close();

  // Recupera la URL guardada en el campo "data" de la notificación.
  const url = event.notification.data;

  // Usa waitUntil para asegurarse de que las acciones dentro se ejecuten correctamente.
  event.waitUntil(
    // Obtiene todas las ventanas (clients) abiertas de la aplicación.
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {

      // Recorre todas las ventanas abiertas del navegador.
      for (const client of clientList) {
        // Si ya existe una ventana con la misma URL y puede enfocarse...
        if (client.url === url && 'focus' in client) {
          // ... entonces la trae al frente (la enfoca).
          return client.focus();
        }
      }

      // Si no existe una ventana con esa URL, abre una nueva pestaña o ventana con esa dirección.
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
  