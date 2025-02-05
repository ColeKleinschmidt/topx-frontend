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

            // Trigger specific scripts based on route
            if (route === '/settings') 
            {
                const settingsScript = document.createElement('script');
                settingsScript.src = 'assets/js/settings.js';
                document.body.appendChild(settingsScript);
            }
        })
        .catch(() => 
        {
            content.innerHTML = '<p>Error loading content. Please try again later.</p>';
        });

    // Update browser URL without reloading the page
    history.pushState({ route }, '', route);
}

document.addEventListener('DOMContentLoaded', () => 
{
    // Check authentication and load the appropriate page
    authStatusAPI().then((response) => 
    {
        if (response.authenticated) 
        {
            loadPage("/feed");
        } 
        else 
        {
            const route = window.location.pathname;
            loadPage(route);
        }
    });

    // Attach SPA navigation to both <a> and <button> elements with data-spa="true"
    const attachSPAListeners = () => 
    {
        const spaElements = document.querySelectorAll('[data-spa="true"]');

        spaElements.forEach((spaElement) => 
        {
            spaElement.addEventListener('click', (event) => 
            {
                event.preventDefault();
                const route = spaElement.getAttribute('href') || spaElement.getAttribute('data-route');
                if (route) 
                {
                    loadPage(route);
                }
            });
        });
    };

    // Attach listeners initially
    attachSPAListeners();

    // Observe DOM changes for dynamically added elements
    const observer = new MutationObserver(() => 
    {
        attachSPAListeners();
    });

    // Start observing the document for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Handle back/forward navigation
    window.addEventListener('popstate', (event) => 
    {
        const route = event.state?.route || '/';
        loadPage(route);
    });
});
