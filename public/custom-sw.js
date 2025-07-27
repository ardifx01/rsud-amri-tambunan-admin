self.addEventListener('fetch', (event) => {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Jika fetch gagal, tampilkan halaman offline
          return caches.match('/offline');
        })
    );
  });