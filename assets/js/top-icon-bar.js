function loadTopIconBar(containerId, url) {
    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById(containerId);

        if (!container) {
            console.error(`Container with ID '${containerId}' not found.`);
            return;
        }

        console.log(`Attempting to fetch: ${url}`);

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch top icon bar: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                container.innerHTML = html;

                // Handle SPA navigation
                const links = container.querySelectorAll('.icon-link');
                links.forEach(link => {
                    link.addEventListener('click', (event) => {
                        event.preventDefault();
                        const route = link.getAttribute('href');
                        if (route) {
                            // Use the SPA routing system to load the route
                            if (typeof loadPage === 'function') {
                                loadPage(route); // Call the SPA's loadPage function
                            } else {
                                console.error(`Route '${route}' is not defined.`);
                            }
                        }
                    });
                });

                const loginLink = document.getElementById('login');
                const authLinks = document.querySelector('.auth-links');
                const userActions = document.querySelector('.user-actions');
                const centerIcons = document.querySelectorAll('.icon-link[data-requires-login]');

                // Disable center icons initially
                centerIcons.forEach(icon => icon.classList.add('disabled'));

                if (loginLink && authLinks && userActions) {
                    loginLink.addEventListener('click', (event) => {
                        event.preventDefault();

                        // Hide "Sign Up | Log In" and show user account actions
                        authLinks.style.display = 'none';
                        userActions.style.display = 'flex';

                        // Enable center icons
                        centerIcons.forEach(icon => icon.classList.remove('disabled'));

                        // Redirect to feed
                        if (typeof loadPage === 'function') {
                            loadPage('/feed');
                        } else {
                            console.error(`Route '/feed' is not defined.`);
                        }
                    });
                }

                // Handle "Log In" on welcome card
                const welcomeLoginLink = document.querySelector('.welcome-card-footer .login-link');
                if (welcomeLoginLink) {
                    welcomeLoginLink.addEventListener('click', (event) => {
                        event.preventDefault();

                        // Hide "Sign Up | Log In" and show user account actions
                        authLinks.style.display = 'none';
                        userActions.style.display = 'flex';

                        // Enable center icons
                        centerIcons.forEach(icon => icon.classList.remove('disabled'));

                        // Redirect to feed
                        if (typeof loadPage === 'function') {
                            loadPage('/feed');
                        } else {
                            console.error(`Route '/feed' is not defined.`);
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Fetch error:', error.message);
            });
    });
}
