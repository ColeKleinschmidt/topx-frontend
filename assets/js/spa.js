function loadPage(route) 
{
    try 
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

        if (!content) 
        {
            console.error('Error: Content container not found.');
            return;
        }

        if (window.location.pathname !== route) 
        {
            history.pushState({ route }, '', route);
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

        console.log(`Loading page: ${routeData.path}`);

        fetch(routeData.path)
            .then(response => 
            {
                if (!response.ok) 
                {
                    throw new Error(`Failed to load page: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => 
            {
                content.innerHTML = ''; // Clear existing content before injecting new HTML
                content.innerHTML = html;
                document.title = routeData.title;

                // Ensure event listeners are re-attached if needed
                if (route !== '404') {
                    if (route === '/') {
                        route = '/index';
                    }
                    const scriptName = `assets/js${route}.js`;
                    const existingScript = document.querySelector(`script[src='${scriptName}']`);
                    if (existingScript) 
                    {
                        existingScript.remove();
                        console.log("removed: " + scriptName + " successfully");
                    }
                    const script = document.createElement("script");
                    script.src = `assets/js${route}.js`;
                    script.onload = () => console.log(`${script.src} script loaded successfully.`);
                    script.onerror = () => console.error("Failed to load settings.js.");
                    document.head.appendChild(script);

                }

            })
            .catch(error => 
            {
                console.error('Error loading page:', error);
                content.innerHTML = '<p>Error loading content. Please try again later.</p>';
            });
    } 
    catch (error) 
    {
        console.error('Unexpected error in loadPage():', error);
    }
}

// Event listeners for navigation and state changes
if (!window.spaInitialized) 
{
    window.spaInitialized = true;

    document.addEventListener('DOMContentLoaded', () => 
    {
        try 
        {
            const route = window.location.pathname;
            loadPage(route);
        } 
        catch (error) 
        {
            console.error('Error in DOMContentLoaded:', error);
        }
    });

    document.addEventListener('click', (event) => 
    {
        try 
        {
            const link = event.target.closest('a[href^="/"]');
            if (link) 
            {
                event.preventDefault();
                const route = link.getAttribute('href');
                if (window.location.pathname !== route) 
                {
                    loadPage(route);
                }
            }

            // Handle button clicks that navigate via data-route
            const button = event.target.closest('button[data-route]');
            if (button) 
            {
                event.preventDefault();
                const route = button.getAttribute('data-route');
                if (window.location.pathname !== route) 
                {
                    loadPage(route);
                }
            }
        } 
        catch (error) 
        {
            console.error('Error handling link or button click:', error);
        }
    });

    window.addEventListener('popstate', (event) => 
    {
        try 
        {
            const route = event.state?.route || '/';
            if (window.location.pathname !== route) 
            {
                loadPage(route);
            }
        } 
        catch (error) 
        {
            console.error('Error handling popstate event:', error);
        }
    });
}