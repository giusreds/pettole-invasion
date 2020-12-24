// (c)2020 Giuseppe Rossi
// Service Worker

// Set a name for the current cache
const cacheName = 'pettoleinvasion';
const cacheVersion = 1.12;

// Default files to always cache
var cacheFiles = [
	'index.html',
	'manifest.json',
	'assets/font.ttf',
	'assets/style.css',
	'assets/script.js',
	'https://cdn.jsdelivr.net/gh/giusreds/pwadapter@dist/pwadapter.min.js', // PWAdapter
	'https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js',   		// jQuery
	'https://cdn.jsdelivr.net/npm/js-cookie@rc/dist/js.cookie.min.js' 		// Cookie JS
];
// Not to be cached
var blackList = [
	'script.google.com',
	'countapi.xyz',        // API Contatore
	'google-analytics',	   // Google Analytics
	'analytics.google.com',
	'googletagmanager.com'
];


var _cache = cacheName + "_v" + cacheVersion.toString();
self.addEventListener('install', function (e) {
	console.log('[ServiceWorker] Installed');

	// e.waitUntil Delays the event until the Promise is resolved
	e.waitUntil(

		// Open the cache
		caches.open(_cache).then(function (cache) {

			// Add all the default files to the cache
			console.log('[ServiceWorker] Caching cacheFiles');
			return cache.addAll(cacheFiles);
		})
	); // end e.waitUntil
});


self.addEventListener('activate', function (e) {
	console.log('[ServiceWorker] Activated');

	e.waitUntil(

		// Get all the cache keys (cacheName)
		caches.keys().then(function (cacheNames) {
			return Promise.all(cacheNames.map(function (thisCacheName) {

				// If a cached item is saved under a previous cacheName
				if (thisCacheName.includes(cacheName) && thisCacheName != _cache) {

					// Delete that cached file
					console.log('[ServiceWorker] Removing Cached Files from Cache - ', thisCacheName);
					return caches.delete(thisCacheName);
				}
			}));
		})
	); // end e.waitUntil

});


self.addEventListener('fetch', function (e) {
	// console.log('[ServiceWorker] Fetch', e.request.url);
	
	if (e.request.method != 'GET' || isBlackListed(e.request.url)) {
		// console.log("[ServiceWorker] Request not cached", e.request.url);
		return;
	}

	// e.respondWidth Responds to the fetch event
	e.respondWith(

		// Check in cache for the request being made
		caches.match(e.request)


			.then(function (response) {

				// If the request is in the cache
				if (response) {
					// console.log("[ServiceWorker] Found in Cache", e.request.url, response);
					// Return the cached version
					return response;
				}
				// If the request is NOT in the cache, fetch and cache
				return fetch(e.request)
					.then(function (response) {

						if (!response) {
							// console.log("[ServiceWorker] No response from fetch ")
							return response;
						}

						//  Open the cache
						return caches.open(_cache).then(function (cache) {

							// Put the fetched response in the cache
							cache.put(e.request, response.clone());
							// console.log('[ServiceWorker] New Data Cached', e.request.url);

							// Return the response
							return response;


						}); // end caches.open

					})
					.catch(function (err) {
						// console.log('[ServiceWorker] Error Fetching & Caching New Data', err);
					});


			}) // end caches.match(e.request)
	); // end e.respondWith
});


// Detect if URL is blacklisted
function isBlackListed(str) {
	for (var i = 0; i < blackList.length; i++) {
		if (str.indexOf(blackList[i]) != -1)
			return true;
	}
	return false;
}