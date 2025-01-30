// SPA routes with HTML Chrome Tab titles
const routes = 
{
    '/': { title: 'TopX', file: './index.html' },
    '/friends': { title: 'TopX | Friends', file: './friends.html' },
    '/feed': { title: 'TopX | Feed', file: './feed.html' },
    '/createlist': { title: 'TopX | Create List', file: './createlist.html' },
    '404': { title: 'Page Not Found', file: './404.html' }
};

function loadPage(route) 
{
    const page = routes[route] || routes['404']; // Get the page by route, or use the default route
    document.title = page.title; // Update the page title

    // Update active state for links
    updateActiveLink(route);

    // Fetch the content from the associated HTML file
    fetch(page.file)
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
            document.getElementById('content').innerHTML = html;
        })
        .catch(error => 
        {
            console.error('Error loading page:', error);
            document.getElementById('content').innerHTML = '<p>Error loading content. Please try again later.</p>';
        });

    // Update browser URL without reloading the page
    history.pushState({ route }, page.title, route);
}

function updateActiveLink(route) 
{
    const links = document.querySelectorAll('.icon-link');
    links.forEach(link => link.classList.remove('active'));

    const activeLink = document.querySelector(`.icon-link[href="${route}"]`);
    if (activeLink) {
        activeLink.classList.add('active'); // Add active class to the current route's link
    }
}

function handleNavigation() 
{
    document.addEventListener('click', (event) => 
    {
        // Find the closest link with an href starting with #
        const link = event.target.closest('a[href^="/"]');
        if (link) 
        {
            event.preventDefault();
            const route = link.getAttribute('href');
            loadPage(route);
        }
    });

    window.addEventListener('popstate', (event) => 
    {
        const route = event.state?.route || '/';
        loadPage(route);
    });
}

function initializeSPA() 
{
    const route = window.location.pathname;
    loadPage(route);
    handleNavigation();
}

document.addEventListener('DOMContentLoaded', initializeSPA);