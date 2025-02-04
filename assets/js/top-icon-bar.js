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
                const userIcon = document.querySelector('.user-icon img');

                centerIcons.forEach(icon => 
                {
                    icon.classList.add('disabled');
                    icon.style.visibility = 'hidden';
                });

                async function handleUserAuthentication() 
                {
                    const response = await fetch("http://localhost:8080/authStatus", 
                    {
                        credentials: "include",
                    });

                    const data = await response.json();

                    if (data.authenticated) 
                    {
                        authLinks.style.display = 'none';
                        userActions.style.display = 'flex';

                        centerIcons.forEach(icon => 
                        {
                            icon.classList.remove('disabled');
                            icon.style.visibility = 'visible';
                        });

                        if (data.user.profilePicture) 
                        {
                            userIcon.src = data.user.profilePicture;
                        }
                    } 
                    else 
                    {
                        authLinks.style.display = 'flex';
                        userActions.style.display = 'none';

                        centerIcons.forEach(icon => 
                        {
                            icon.classList.add('disabled');
                            icon.style.visibility = 'hidden';
                        });
                    }
                }

                handleUserAuthentication();

                // Update user icon dynamically when changed from settings.html
                window.addEventListener("profilePictureUpdated", (event) => 
                {
                    if (event.detail.imageUrl) 
                    {
                        userIcon.src = event.detail.imageUrl;
                    }
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

                const accountDropdown = document.querySelector('.account-dropdown-menu');
                const sharedButton = document.querySelector('.shared-icon img');
                const sharedDropdown = document.querySelector('.shared-dropdown-menu');
                const notificationsButton = document.querySelector('.notification-icon img');
                const notificationsDropdown = document.querySelector('.notifications-dropdown-menu');
                const displayButton = document.querySelector('.display-button');
                const displayDropdown = document.querySelector('.display-dropdown-menu');

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

                    // Only close Display menu if clicking outside both account & display menus
                    if (
                        exceptMenu !== displayDropdown &&
                        displayDropdown &&
                        displayDropdown.classList.contains('visible') &&
                        !accountDropdown.contains(exceptMenu)
                    ) 
                    {
                        displayDropdown.classList.remove('visible');
                    }
                }

                function toggleMenu(button, dropdown) 
                {
                    button.addEventListener('click', (event) => 
                    {
                        event.stopPropagation();
                        closeAllMenus(dropdown);
                        dropdown.classList.toggle('visible');
                    });

                    document.addEventListener('click', (event) => 
                    {
                        if (!dropdown.contains(event.target) && !button.contains(event.target)) 
                        {
                            dropdown.classList.remove('visible');
                        }
                    });
                }

                if (userIcon && accountDropdown) 
                {
                    toggleMenu(userIcon, accountDropdown);

                    const logoutButton = document.querySelector('.logout-button');
                    if (logoutButton) 
                    {
                        logoutButton.addEventListener('click', () => 
                        {
                            window.location.href = '/';
                        });
                    }
                }

                // Ensure Display submenu toggles correctly inside the account menu
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
                }

                if (sharedButton && sharedDropdown) 
                {
                    toggleMenu(sharedButton, sharedDropdown);
                }

                if (notificationsButton && notificationsDropdown) 
                {
                    toggleMenu(notificationsButton, notificationsDropdown);
                }

                // Fully working Dark Mode toggle (Corrected logic)
                const darkModeClass = 'dark-mode';
                const darkModeOn = document.querySelector('input[name="display"][value="on"]');
                const darkModeOff = document.querySelector('input[name="display"][value="off"]');

                function applyDarkMode(state) 
                {
                    if (state === 'on') 
                    {
                        document.body.classList.add(darkModeClass);
                    } 
                    else 
                    {
                        document.body.classList.remove(darkModeClass);
                    }
                }

                // Load stored dark mode preference (default is OFF)
                const savedDarkMode = localStorage.getItem('darkMode') || 'off';
                applyDarkMode(savedDarkMode);

                if (darkModeOn && darkModeOff) 
                {
                    darkModeOn.checked = savedDarkMode === 'on';
                    darkModeOff.checked = savedDarkMode === 'off';

                    darkModeOn.addEventListener('change', () => 
                    {
                        localStorage.setItem('darkMode', 'on');
                        applyDarkMode('on');
                    });

                    darkModeOff.addEventListener('change', () => 
                    {
                        localStorage.setItem('darkMode', 'off');
                        applyDarkMode('off');
                    });
                }

            })
            .catch(error => 
            {
                console.error('Fetch error:', error.message);
            });
    });
}
