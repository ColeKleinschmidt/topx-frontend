function loadTopIconBar(containerId, url) 
{
    let menuOpen = false;
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
                let displayedAllNotifications = false;
                let displayedAllSharedLists = false;

                async function acceptFriend(event, requestId, notification) {
                    event.stopPropagation();
                    try {
                        const request = await acceptFriendRequestAPI(requestId);
                        if (request.message == "success") {
                            notification.remove();
                            removeNotification(requestId).then(() => {
                                countNotifications();
                            });
                        } else {
                            alert(request.message);
                        }
                        
                    } catch (error) {
                        console.error("Error accepting friend request:", error);
                    }
                }
            
                async function declineFriend(event, requestId, notification) {
                    event.stopPropagation();
                    try {
                        const request = await declineFriendRequestAPI(requestId);
                        if (request.message == "success") {
                            notification.remove();
                            removeNotification(requestId).then(() => {
                                countNotifications();
                            });
                            
                        } else {
                            alert(request.message);
                        }
                    } catch (error) {
                        console.error("Error declining friend request:", error);
                    }
                }

                async function displaySharedList() {
                    const notifications = getLocalStorage("notifications").filter(x => x.type === "share");
                    const currentUserId = getCookie("userID");
                    if (notifications.length > 0 && !displayedAllSharedLists) {
                        const message = document.querySelector(".shared-dropdown-message");
                        message.innerHTML = "Loading...";

                        let displayedSharedLists = [];
                        for (let i = 0; i < notifications.length; i++) {
                            console.log(notifications[i]);
                            try {
                                if (notifications[i].receiver === currentUserId) {
                                    const fetchUser = await getUserByIdAPI(notifications[i].sender);
                                    const user = fetchUser.user;
                                    
                                    if (user !== undefined && user !== null) {
                                        const notification = document.createElement("div");
                                        notification.classList.add("notification");
                                        notification.addEventListener("click", () => {
                                            visitList(notifications[i].listId);
                                        })

                                        const profileImg = document.createElement("img");
                                        profileImg.src = user.profilePicture;
                                        profileImg.alt = user.username;
                                        profileImg.classList.add("profile-pic-notification");
                                        profileImg.style.width = "20px";
                                        profileImg.style.height = "20px";
                                        profileImg.style.borderRadius = "50%";
                                        profileImg.styleobjectFit = "cover";

                                        const username = document.createElement("h4");
                                        username.textContent = user.username + " shared a list.";

                                        notification.appendChild(profileImg);
                                        notification.appendChild(username);
                                        displayedSharedLists.push(notification);

                                    }
                                }
                            } catch (error) {
                                console.log("could not load user: " + error);
                            }
                        }

                        if (displayedSharedLists.length > 0) {
                            message.innerHTML = "";
                        }else {
                            message.innerHTML = "No new shared items";
                            message.display = "none";
                        }

                        displayedSharedLists.map((x) => {
                            sharedDropdown.appendChild(x);
                            if (!displayedAllSharedLists) {
                                displayedAllSharedLists = true;
                            }
                        });
                    }
                }

                async function displayNotifiations() {
                    const notifications = getLocalStorage("notifications");
                    const currentUserId = getCookie("userID");
                    if (notifications.length > 0 && !displayedAllNotifications) {
                        const message = document.querySelector(".notifications-dropdown-message");
                        message.innerHTML = "Loading...";

                        let displayedNotifications = [];
                        for (let i = 0; i < notifications.length; i++) {
                            console.log(notifications[i]);
                            try {
                                if (notifications[i].type === 'friendRequest' && notifications[i].receiver === currentUserId) {
                                    const fetchUser = await getUserByIdAPI(notifications[i].sender);
                                    const user = fetchUser.user;
                                    
                                    if (user !== undefined && user !== null) {
                                        const notification = document.createElement("div");
                                        notification.classList.add("notification");

                                        const profileImg = document.createElement("img");
                                        profileImg.src = user.profilePicture;
                                        profileImg.alt = user.username;
                                        profileImg.classList.add("profile-pic-notification");
                                        profileImg.style.width = "20px";
                                        profileImg.style.height = "20px";
                                        profileImg.style.borderRadius = "50%";
                                        profileImg.styleobjectFit = "cover";

                                        const username = document.createElement("h4");
                                        username.textContent = user.username;

                                        const buttons = document.createElement("div");
                                        buttons.style.display = "flex";
                                        buttons.style.flexDirection = "column";
                                        buttons.style.justifyContent = 'center';
                                        buttons.style.alignItems = "center";
                        
                                        const acceptButton = document.createElement("button");
                                        acceptButton.textContent = "Accept";
                                        acceptButton.classList.add("accept-friend-btn");
                                        acceptButton.addEventListener("click", (event) => acceptFriend(event, notifications[i]._id, notification));
                        
                                        const declineButton = document.createElement("button");
                                        declineButton.textContent = "Decline";
                                        declineButton.classList.add("decline-friend-btn");
                                        declineButton.addEventListener("click", (event) => declineFriend(event, notifications[i]._id, notification));
                        
                                        buttons.appendChild(acceptButton);
                                        buttons.appendChild(declineButton);

                                        notification.appendChild(profileImg);
                                        notification.appendChild(username);
                                        notification.appendChild(buttons);
                                        displayedNotifications.push(notification);
                                    }else {
                                        throw (fetchUser.message);
                                    }
                                }
                            } catch (error) {
                                console.log("could not load user: " + error);
                            }
                        }

                        if (displayedNotifications.length > 0) {
                            message.innerHTML = "";
                        }else {
                            message.innerHTML = "No new notifications";
                            message.display = "none";
                        }

                        displayedNotifications.map((x) => {
                            notificationsDropdown.appendChild(x);
                            if (!displayedAllNotifications) {
                                displayedAllNotifications = true;
                            }
                        });
                    }
                }

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
                                const userProfileUrl = `/user-${data.user.username}`; // Dynamic profile URL

                                const accountHeader = `
                                    <a href="${userProfileUrl}" class="account-header" data-spa="true">
                                        <img src="${data.user.profilePicture}" alt="Profile Picture" class="account-profile-picture">
                                        <span class="account-username">${data.user.username}</span>
                                    </a>
                                    <hr class="dropdown-divider">
                                `;
                            
                                const existingHeader = accountDropdown.querySelector(".account-header");
                            
                                if (existingHeader) 
                                {
                                    existingHeader.outerHTML = accountHeader; // Replace existing header
                                } 
                                else 
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
                            menuOpen = false;
                        }
                    });
                
                    updateTooltipVisibility();
                }

                function toggleMenu(button, dropdown, isChild = false) 
                {
                    button.addEventListener("click", (event) => 
                    {
                        event.stopPropagation();
                        
                        if (!isChild) 
                        {
                            closeAllMenus(dropdown);
                        }
                
                        const isVisible = dropdown.classList.toggle("visible");
                        dropdown.style.display = isVisible ? "block" : "none";
                
                        // Set the menuOpen flag to true when a menu is opened
                        if (isVisible) 
                        {
                            menuOpen = true;
                            button.classList.add("active");
                            dropdown.classList.add("active");
                        } 
                        else 
                        {
                            menuOpen = false;
                            button.classList.remove("active");
                            dropdown.classList.remove("active");
                        }

                        if (dropdown.classList.contains("notifications-dropdown-menu")) {
                            displayNotifiations();
                            countNotifications();
                        }

                        if (dropdown.classList.contains("shared-dropdown-menu")) {
                            displaySharedList();
                            countShared();
                        }
                
                        updateTooltipVisibility();
                    });
                
                    document.addEventListener("click", (event) => 
                    {
                        if (!dropdown.contains(event.target) && !button.contains(event.target)) 
                        {
                            dropdown.style.display = "none";
                            dropdown.classList.remove("visible");
                            button.classList.remove("active");
                            menuOpen = false;
                            updateTooltipVisibility();
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

                function updateTooltipVisibility() 
                {
                    const body = document.body;
                    const menus = document.querySelectorAll(".account-dropdown-menu, .shared-dropdown-menu, .notifications-dropdown-menu");
                
                    let anyMenuOpen = Array.from(menus).some(menu => menu.classList.contains("visible"));
                
                    if (anyMenuOpen) 
                    {
                        body.classList.add("menu-open");
                    } 
                    else 
                    {
                        body.classList.remove("menu-open");
                    }
                }
                
                if (sharedButton && sharedDropdown) 
                {
                    toggleMenu(sharedButton, sharedDropdown);
                    setTimeout(() => {
                        countNotifications();
                    },50);
                    
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
