self.addEventListener('install', e => {
  e.waitUntil(caches.open('noun-gpa-v1').then(cache => {
    return cache.addAll(['/noun-gpa-calculator/', '/noun-gpa-calculator/index.html', '/noun-gpa-calculator/style.css', '/noun-gpa-calculator/script.js']);
  }));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(resp => resp || fetch(e.request)));
});
