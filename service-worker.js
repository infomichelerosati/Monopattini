// service-worker.js

// Il nome della cache è versionato. Se aggiorni i file dell'app,
// incrementa la versione (es. v2) per forzare l'aggiornamento.
const CACHE_NAME = 'monopattini-prontuario-cache-v2'; // Versione incrementata per includere le icone
const urlsToCache = [
  '/',
  'index.html',
  'icon-192x192.png', // Aggiunta icona alla cache
  'icon-512x512.png'  // Aggiunta icona alla cache
];

// Evento di installazione: apre la cache e vi aggiunge i file principali dell'app.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperta e file principali aggiunti.');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento di fetch: intercetta le richieste di rete.
// Usa una strategia "cache-first": se la risorsa è in cache, la serve da lì.
// Altrimenti, la richiede alla rete, la aggiunge alla cache per usi futuri e la restituisce.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se la risorsa è in cache, la restituisce.
        if (response) {
          return response;
        }

        // Altrimenti, la scarica dalla rete.
        return fetch(event.request).then(
          response => {
            // Controlla che la risposta sia valida prima di metterla in cache.
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona la risposta. Una risposta è uno stream e può essere consumata una sola volta.
            // Ne serve una copia per la cache e una per il browser.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Evento di attivazione: pulisce le vecchie cache non più utilizzate.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Se la cache non è nella whitelist (cioè è una vecchia versione), viene eliminata.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Eliminazione vecchia cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

