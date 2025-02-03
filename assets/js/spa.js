function loadPage(route) 
{
    const routes = 
    {
        '/': { path: './index.html', title: 'TopX' },
        '/friends': { path: './friends.html', title: 'TopX | Friends' },
        '/feed': { path: './feed.html', title: 'TopX | Feed' },
        '/createlist': { path: './createlist.html', title: 'TopX | Create List' },
        '/settings': { path: './settings.html', title: 'TopX | Settings' },
        '404': { path: './404.html', title: 'Page Not Found' },
    };

    const content = document.getElementById('content');
    const body = document.body;
    const routeData = routes[route] || routes['404'];

    // Toggle the main-page class based on the route
    if (route === '/') 
    {
        body.classList.add('main-page'); // Apply background image
    } 
    else 
    {
        body.classList.remove('main-page'); // Remove background image
    }

    // Load SPA content dynamically
    fetch(routeData.path)
        .then(response => 
        {
            if (!response.ok) 
            {
                throw new Error(`Failed to load page: ${response.status}`);
            }
            return response.text();
        })
        .then(html => 
        {
            content.innerHTML = html;

            // Update the document title
            document.title = routeData.title;
        })
        .catch(error => 
        {
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

    // Handle link clicks for SPA navigation
    document.addEventListener('click', (event) => 
    {
        const link = event.target.closest('a[href^="/"]');
        if (link) 
        {
            event.preventDefault();
            const route = link.getAttribute('href');
            loadPage(route);
        }

        // Handle button clicks for SPA navigation via data-route
        const button = event.target.closest('button[data-route]');
        if (button) 
        {
            const route = button.getAttribute('data-route');
            loadPage(route);
        }
    });

    // Handle back/forward navigation
    window.addEventListener('popstate', (event) => 
    {
        const route = event.state?.route || '/';
        loadPage(route);
    });
});
