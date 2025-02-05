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

    // Prevent unnecessary route reloading
    if (route === window.location.pathname) 
    {
        return;
    }

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
            content.innerHTML = '<p>Error loading content. Please try again later.</p>';
        });

    // Update browser URL without reloading the page
    history.pushState({ route }, '', route);
}

document.addEventListener('DOMContentLoaded', () => 
{
    const route = window.location.pathname;
    loadPage(route);

    // Handle SPA navigation links
    const spaLinks = document.querySelectorAll('a[data-spa="true"]');
    spaLinks.forEach((spaLink) => 
    {
        spaLink.addEventListener('click', (event) => 
        {
            event.preventDefault();
            loadPage(spaLink.getAttribute('href'));
        });
    });

    // Handle back/forward navigation
    window.addEventListener('popstate', (event) => 
    {
        const route = event.state?.route || '/';
        loadPage(route);
    });
});
