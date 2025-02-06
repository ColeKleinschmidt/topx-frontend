function loadTopIconBar(containerId, url) 
{
    document.addEventListener("DOMContentLoaded", () => 
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

                const links = container.querySelectorAll(".icon-link");
                links.forEach(link => 
                {
                    link.addEventListener("click", (event) => 
                    {
                        event.preventDefault();
                        const route = link.getAttribute("href");
                        if (route) 
                        {
                            if (typeof loadPage === "function") 
                            {
                                loadPage(route);

                                // Refresh user icon on settings page load
                                if (route.includes("settings.html")) 
                                {
                                    handleUserAuthentication();
                                }
                            } 
                            else 
                            {
                                console.error(`Route '${route}' is not defined.`);
                            }
                        }
                    });
                });

                const loginLink = document.getElementById("login");
                const authLinks = document.querySelector(".auth-links");
                const userActions = document.querySelector(".user-actions");
                const centerIcons = document.querySelectorAll(".icon-link[data-requires-login]");
                const userIcon = document.querySelector(".user-icon img");
                const accountDropdown = document.querySelector(".account-dropdown-menu");
                const sharedButton = document.querySelector(".shared-icon img");
                const sharedDropdown = document.querySelector(".shared-dropdown-menu");
                const notificationsButton = document.querySelector(".notification-icon img");
                const notificationsDropdown = document.querySelector(".notifications-dropdown-menu");
                const displayButton = document.querySelector(".display-button");
                const displayDropdown = document.querySelector(".display-dropdown-menu");

                centerIcons.forEach(icon => 
                {
                    icon.classList.add("disabled");
                    icon.style.visibility = "hidden";
                });

                async function handleUserAuthentication() 
                {
                    const data = await authStatusAPI();

                    if (data.authenticated) 
                    {
                        authLinks.style.display = "none";
                        userActions.style.display = "flex";

                        centerIcons.forEach(icon => 
                        {
                            icon.classList.remove("disabled");
                            icon.style.visibility = "visible";
                        });

                        if (data.user.profilePicture) 
                        {
                            console.log("🔄 Updating user icon dynamically:", data.user.profilePicture);
                            userIcon.src = data.user.profilePicture;
                        }

                        // Add account header with username and profile picture
                        if (accountDropdown) 
                        {
                            const accountHeader = `
                                <div class="account-header">
                                    <img src="${data.user.profilePicture}" alt="Profile Picture" class="account-profile-picture">
                                    <span class="account-username">${data.user.username}</span>
                                </div>
                                <hr class="dropdown-divider">
                            `;
                            if (!accountDropdown.querySelector(".account-header")) 
                            {
                                accountDropdown.insertAdjacentHTML("afterbegin", accountHeader);
                            }
                        }
                    } 
                    else 
                    {
                        authLinks.style.display = "flex";
                        userActions.style.display = "none";

                        centerIcons.forEach(icon => 
                        {
                            icon.classList.add("disabled");
                            icon.style.visibility = "hidden";
                        });
                    }
                }

                handleUserAuthentication();

                // Listen for profile picture update from settings
                window.addEventListener("profilePictureUpdated", (event) => 
                {
                    if (event.detail.imageUrl) 
                    {
                        console.log("🔄 Updating user icon dynamically:", event.detail.imageUrl);
                        userIcon.src = event.detail.imageUrl;

                        handleUserAuthentication();
                    }
                });

                if (loginLink && authLinks && userActions) 
                {
                    loginLink.addEventListener("click", (event) => 
                    {
                        event.preventDefault();
                        loginRedirect();
                    });
                }

                function closeAllMenus(exceptMenu) 
                {
                    const menus = [accountDropdown, sharedDropdown, notificationsDropdown, displayDropdown];
                    menus.forEach(menu => 
                    {
                        if (menu !== exceptMenu && menu && menu.classList.contains("visible")) 
                        {
                            menu.classList.remove("visible");
                            menu.style.display = "none";
                        }
                    });
                }

                function toggleMenu(button, dropdown, isChild = false) 
                {
                    button.addEventListener("click", (event) => 
                    {
                        event.stopPropagation();
                        if (!isChild) closeAllMenus(dropdown);
                        dropdown.classList.toggle("visible");
                        dropdown.style.display = dropdown.classList.contains("visible") ? "block" : "none";
                    });

                    document.addEventListener("click", (event) => 
                    {
                        if (!dropdown.contains(event.target) && !button.contains(event.target)) 
                        {
                            dropdown.style.display = "none";
                            dropdown.classList.remove("visible");
                        }
                    });
                }

                if (userIcon && accountDropdown) 
                {
                    toggleMenu(userIcon, accountDropdown);

                    const logoutButton = document.querySelector(".logout-button");
                    if (logoutButton) 
                    {
                        logoutButton.addEventListener("click", async () => 
                        {
                            await logoutAPI();
                            window.location.href = "/";
                        });
                    }
                }

                if (sharedButton && sharedDropdown) 
                {
                    toggleMenu(sharedButton, sharedDropdown);
                }

                if (notificationsButton && notificationsDropdown) 
                {
                    toggleMenu(notificationsButton, notificationsDropdown);
                }

                if (displayButton && displayDropdown) 
                {
                    toggleMenu(displayButton, displayDropdown, true);
                }

                const darkModeClass = "dark-mode";
                const darkModeOn = document.querySelector('input[name="display"][value="on"]');
                const darkModeOff = document.querySelector('input[name="display"][value="off"]');

                function applyDarkMode(state) 
                {
                    if (state === "on") 
                    {
                        document.body.classList.add(darkModeClass);
                    } 
                    else 
                    {
                        document.body.classList.remove(darkModeClass);
                    }
                }

                const savedDarkMode = localStorage.getItem("darkMode") || "off";
                applyDarkMode(savedDarkMode);

                if (darkModeOn && darkModeOff) 
                {
                    darkModeOn.checked = savedDarkMode === "on";
                    darkModeOff.checked = savedDarkMode === "off";

                    darkModeOn.addEventListener("change", () => 
                    {
                        localStorage.setItem("darkMode", "on");
                        applyDarkMode("on");
                    });

                    darkModeOff.addEventListener("change", () => 
                    {
                        localStorage.setItem("darkMode", "off");
                        applyDarkMode("off");
                    });
                }
            })
            .catch(error => 
            {
                console.error("Fetch error:", error.message);
            });
    });
}
