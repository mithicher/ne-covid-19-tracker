self.addEventListener('install', (event) => {
	event.waitUntil(
	  caches.open('v1').then((cache) => {
		return cache.addAll([
		 'index.html',
		  './',
		  './tailwind.css',
		  './alpine.js'
		]);
	  })
	);
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
	const currentCaches = ['v1', 'runtime'];
	event.waitUntil(
	  caches.keys().then(cacheNames => {
		return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
	  }).then(cachesToDelete => {
		return Promise.all(cachesToDelete.map(cacheToDelete => {
		  return caches.delete(cacheToDelete);
		}));
	  }).then(() => self.clients.claim())
	);
  });

self.addEventListener('fetch', function(event) {
	event.respondWith(caches.match(event.request).then(function(response) {
	  // caches.match() always resolves
	  // but in case of success response will have value
	  if (response !== undefined) {
		return response;
	  } else {
		return fetch(event.request).then(function (response) {
		  // response may be used only once
		  // we need to save clone to put one copy in cache
		  // and serve second one
		  let responseClone = response.clone();
		  
		  caches.open('v1').then(function (cache) {
			cache.put(event.request, responseClone);
		  });
		  return response;
		}).catch(function () {
		//   return caches.match('/sw-test/gallery/myLittleVader.jpg');
		});
	  }
	}));
  });