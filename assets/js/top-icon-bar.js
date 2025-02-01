function loadTopIconBar(containerId, url) 
{
    document.addEventListener('DOMContentLoaded', () => 
    {
        const container = document.getElementById(containerId);

        if (!container) 
        {
            console.error(`Container with ID '${containerId}' not found.`);
            return;
        }

        console.log(`Attempting to fetch: ${url}`);

        fetch(url)
            .then(response => 
            {
                if (!response.ok) 
                {
                    throw new Error(`Failed to fetch top icon bar: ${response.status}`);
                }
                return response.text();
            })
            .then(html => 
            {
                container.innerHTML = html;

                const links = container.querySelectorAll('.icon-link');
                links.forEach(link => 
                {
                    link.addEventListener('click', (event) => 
                    {
                        event.preventDefault();
                        const route = link.getAttribute('href');
                        if (route) 
                        {
                            if (typeof loadPage === 'function') 
                            {
                                loadPage(route);
                            } 
                            else 
                            {
                                console.error(`Route '${route}' is not defined.`);
                            }
                        }
                    });
                });

                const loginLink = document.getElementById('login');
                const authLinks = document.querySelector('.auth-links');
                const userActions = document.querySelector('.user-actions');
                const centerIcons = document.querySelectorAll('.icon-link[data-requires-login]');

                centerIcons.forEach(icon => 
                {
                    icon.classList.add('disabled');
                    icon.style.visibility = 'hidden';
                });

                if (loginLink && authLinks && userActions) 
                {
                    loginLink.addEventListener('click', (event) => 
                    {
                        event.preventDefault();

                        authLinks.style.display = 'none';
                        userActions.style.display = 'flex';

                        centerIcons.forEach(icon => 
                        {
                            icon.classList.remove('disabled');
                            icon.style.visibility = 'visible';
                        });

                        if (typeof loadPage === 'function') 
                        {
                            loadPage('/feed');
                        } 
                        else 
                        {
                            console.error(`Route '/feed' is not defined.`);
                        }
                    });
                }

                const welcomeLoginLink = document.querySelector('.welcome-card-footer .login-link');
                if (welcomeLoginLink) 
                {
                    welcomeLoginLink.addEventListener('click', (event) => 
                    {
                        event.preventDefault();

                        authLinks.style.display = 'none';
                        userActions.style.display = 'flex';

                        centerIcons.forEach(icon => 
                        {
                            icon.classList.remove('disabled');
                            icon.style.visibility = 'visible';
                        });

                        if (typeof loadPage === 'function') 
                        {
                            loadPage('/feed');
                        } 
                        else 
                        {
                            console.error(`Route '/feed' is not defined.`);
                        }
                    });
                }

                const userIcon = document.querySelector('.user-icon');
                const accountDropdown = document.querySelector('.account-dropdown-menu');
                const sharedButton = document.querySelector('.shared-icon img');
                const sharedDropdown = document.querySelector('.shared-dropdown-menu');
                const notificationsButton = document.querySelector('.notification-icon img');
                const notificationsDropdown = document.querySelector('.notifications-dropdown-menu');
                const displayButton = document.querySelector('.display-button');
                const displayDropdown = document.querySelector('.display-dropdown-menu');

                // Function to close all menus except the specified one
                function closeAllMenus(exceptMenu) 
                {
                    const menus = [accountDropdown, sharedDropdown, notificationsDropdown];
                    menus.forEach(menu => 
                    {
                        if (menu !== exceptMenu && menu && menu.classList.contains('visible')) 
                        {
                            menu.classList.remove('visible');
                        }
                    });

                    // Close Display menu unless explicitly excluded
                    if (exceptMenu !== displayDropdown && displayDropdown && displayDropdown.classList.contains('visible')) 
                    {
                        displayDropdown.classList.remove('visible');
                    }
                }

                // Account dropdown logic
                if (userIcon && accountDropdown) 
                {
                    userIcon.addEventListener('click', () => 
                    {
                        closeAllMenus(accountDropdown);
                        accountDropdown.classList.toggle('visible');
                    });

                    document.addEventListener('click', (event) => 
                    {
                        if (
                            !userIcon.contains(event.target) &&
                            !accountDropdown.contains(event.target) &&
                            !displayDropdown.contains(event.target)
                        ) 
                        {
                            accountDropdown.classList.remove('visible');
                            displayDropdown.classList.remove('visible');
                        }
                    });

                    const logoutButton = document.querySelector('.logout-button');
                    if (logoutButton) 
                    {
                        logoutButton.addEventListener('click', () => 
                        {
                            window.location.href = '/';
                        });
                    }
                }

                // Display dropdown logic
                if (displayButton && displayDropdown) 
                {
                    displayButton.addEventListener('click', (event) => 
                    {
                        event.stopPropagation();
                        displayDropdown.classList.toggle('visible');
                        displayDropdown.style.display = displayDropdown.classList.contains('visible') ? 'block' : 'none';
                    });

                    document.addEventListener('click', (event) => 
                    {
                        if (
                            !displayButton.contains(event.target) &&
                            !displayDropdown.contains(event.target) &&
                            !accountDropdown.contains(event.target)
                        ) 
                        {
                            displayDropdown.style.display = 'none';
                            displayDropdown.classList.remove('visible');
                        }
                    });

                    const radioButtons = displayDropdown.querySelectorAll('input[name="display"]');
                    const darkModeClass = 'dark-mode';

                    radioButtons.forEach(radio => 
                    {
                        radio.addEventListener('change', (event) => 
                        {
                            if (event.target.value === 'on') 
                            {
                                document.body.classList.add(darkModeClass);
                            } 
                            else 
                            {
                                document.body.classList.remove(darkModeClass);
                            }
                        });
                    });
                }

                // Shared dropdown logic
                if (sharedButton && sharedDropdown) 
                {
                    sharedButton.addEventListener('click', () => 
                    {
                        closeAllMenus(sharedDropdown);
                        sharedDropdown.classList.toggle('visible');
                    });

                    document.addEventListener('click', (event) => 
                    {
                        if (
                            !sharedButton.contains(event.target) &&
                            !sharedDropdown.contains(event.target)
                        ) 
                        {
                            sharedDropdown.classList.remove('visible');
                        }
                    });
                }

                // Notifications dropdown logic
                if (notificationsButton && notificationsDropdown) 
                {
                    notificationsButton.addEventListener('click', () => 
                    {
                        closeAllMenus(notificationsDropdown);
                        notificationsDropdown.classList.toggle('visible');
                    });

                    document.addEventListener('click', (event) => 
                    {
                        if (
                            !notificationsButton.contains(event.target) &&
                            !notificationsDropdown.contains(event.target)
                        ) 
                        {
                            notificationsDropdown.classList.remove('visible');
                        }
                    });
                }

                // Global click handler to close all menus
                document.addEventListener('click', (event) => 
                {
                    if (
                        !accountDropdown.contains(event.target) &&
                        !sharedDropdown.contains(event.target) &&
                        !notificationsDropdown.contains(event.target) &&
                        !userIcon.contains(event.target) &&
                        !sharedButton.contains(event.target) &&
                        !notificationsButton.contains(event.target) &&
                        !displayDropdown.contains(event.target) &&
                        !displayButton.contains(event.target)
                    ) 
                    {
                        closeAllMenus(null);
                    }
                });
            })
            .catch(error => 
            {
                console.error('Fetch error:', error.message);
            });
    });
}
