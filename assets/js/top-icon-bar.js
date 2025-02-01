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

                // Handle SPA navigation
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
                const dropdownMenu = document.querySelector('.dropdown-menu');

                if (userIcon && dropdownMenu) 
                {
                    userIcon.addEventListener('click', () => 
                    {
                        dropdownMenu.classList.toggle('visible');
                    });

                    document.addEventListener('click', (event) => 
                    {
                        if (!userIcon.contains(event.target) && !dropdownMenu.contains(event.target)) 
                        {
                            dropdownMenu.classList.remove('visible');
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

                    const displayButton = document.querySelector('.display-button');
                    const displayDropdown = document.querySelector('.display-dropdown');

                    if (displayButton && displayDropdown) 
                    {
                        displayButton.addEventListener('click', (event) => 
                        {
                            event.stopPropagation();
                            displayDropdown.classList.toggle('visible');

                            if (displayDropdown.classList.contains('visible')) 
                            {
                                displayDropdown.style.display = 'block';
                            } 
                            else 
                            {
                                displayDropdown.style.display = 'none';
                            }
                        });

                        document.addEventListener('click', (event) => 
                        {
                            if (!displayButton.contains(event.target) && !displayDropdown.contains(event.target)) 
                            {
                                displayDropdown.style.display = 'none';
                            }
                        });

                        const radioButtons = displayDropdown.querySelectorAll('input[name="display"]');
                        const darkModeClass = 'dark-mode';

                        radioButtons.forEach((radio) => 
                        {
                            radio.addEventListener('change', (event) => 
                            {
                                if (event.target.value === 'on') 
                                {
                                    enableDarkMode();
                                } 
                                else 
                                {
                                    disableDarkMode();
                                }
                            });
                        });

                        function enableDarkMode() 
                        {
                            document.body.classList.add(darkModeClass);
                        }

                        function disableDarkMode() 
                        {
                            document.body.classList.remove(darkModeClass);
                        }
                    }
                }
            })
            .catch(error => 
            {
                console.error('Fetch error:', error.message);
            });
    });
}
