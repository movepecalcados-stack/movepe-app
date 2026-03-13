const CACHE = 'movepé-v3';
const ASSETS = [
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Sempre busca versão mais recente da rede (network first)
self.addEventListener('fetch', e => {
  if (e.request.url.includes('index.html') || e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'NOTIFY') {
    const { title, body, tag } = e.data;
    self.registration.showNotification(title, {
      body,
      tag: tag || 'movepé-story',
      icon: './icons/icon-192x192.png',
      badge: './icons/icon-192x192.png',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      actions: [
        { action: 'open_ig', title: '📱 Abrir Instagram' },
        { action: 'dismiss',  title: 'Dispensar' }
      ]
    });
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'open_ig') {
    clients.openWindow('https://www.instagram.com/');
  } else {
    clients.openWindow('./index.html');
  }
});
