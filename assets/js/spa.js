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

    console.log(`Requested route: ${route}`); // Debug log
    console.log(`Resolved path: ${routeData.path}`); // Debug log

    // Clear previous content
    content.innerHTML = '<p>Loading...</p>';

    // Load SPA content dynamically
    fetch(routeData.path)
        .then(response => 
        {
            console.log(`Fetching: ${routeData.path}, Status: ${response.status}`); // Debug log
            if (!response.ok) 
            {
                console.error(`Failed to fetch content for ${routeData.path}`);
                throw new Error(`Failed to load page: ${response.status}`);
            }
            return response.text();
        })
        .then(html => 
        {
            console.log(`Content fetched for ${routeData.path}`); // Debug log

            // Update content
            content.innerHTML = html;

            // Update the document title
            document.title = routeData.title;

            // Trigger specific scripts based on route
            if (route === '/settings') 
            {
                loadScript('assets/js/settings.js');
            }
        })
        .catch((error) => 
        {
            console.error(`Error loading content for route: ${route}`, error);
            content.innerHTML = '<p>Error loading content. Please try again later.</p>';
        });

    // Update browser URL without reloading the page
    history.pushState({ route }, '', route);

    // Toggle the main-page class based on the route
    if (route === '/') 
    {
        body.classList.add('main-page'); // Apply background image
    } 
    else 
    {
        body.classList.remove('main-page'); // Remove background image
    }
}

// Helper function to dynamically load scripts
function loadScript(src) 
{
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
    console.log(`Script loaded: ${src}`); // Debug log
}

document.addEventListener('DOMContentLoaded', () => 
{
    // Handle the current route on page load
    const currentRoute = window.location.pathname;
    console.log(`Loading current route: ${currentRoute}`); // Debug log
    loadPage(currentRoute);

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
                    console.log(`Navigating to route: ${route}`); // Debug log
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
        console.log(`Navigating back/forward to route: ${route}`); // Debug log
        loadPage(route);
    });
});
