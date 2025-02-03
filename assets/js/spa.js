function loadPage(route) {
    const routes = {
        '/': './index.html',
        '/friends': './friends.html',
        '/feed': './feed.html',
        '/createlist': './createlist.html',
        '404': './404.html',
    };

    const content = document.getElementById('content');
    const body = document.body;
    const page = routes[route] || routes['404'];

    // Toggle the main-page class based on the route
    if (route === '/') {
        body.classList.add('main-page'); // Apply background image
    } else {
        body.classList.remove('main-page'); // Remove background image
    }

    // Load SPA content dynamically
    fetch(page)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load page: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            content.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading page:', error);
            content.innerHTML = '<p>Error loading content. Please try again later.</p>';
        });

    // Update browser URL without reloading the page
    history.pushState({ route }, '', route);
}

// Event listeners for navigation and state changes
document.addEventListener('DOMContentLoaded', () => 
{
    const route = window.location.pathname;
    loadPage(route);

    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href^="/"]');
        if (link) {
            event.preventDefault();
            const route = link.getAttribute('href');
            loadPage(route);
        }
    });

    window.addEventListener('popstate', (event) => {
        const route = event.state?.route || '/';
        loadPage(route);
    });
});
