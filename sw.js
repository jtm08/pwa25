self.addEventListener(
    'fetch',
    function(event) {
        if (/\.jpg$/.test(event.request.url)) {
            event.respondWith(fetch('ct.jpg'));
        }
    }
);
