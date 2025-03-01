(async () => 
    {
        const username = window.location.pathname.split('/')[2];
        const userResponse = await getUserByUsernameAPI(username);
        const currentUserId = getCookie("userID");
    
        const container = document.getElementById("user-container");
        container.innerHTML = ""; // Clear existing content
    
        if (userResponse.message === "no user found") 
        {
            container.innerHTML = "<h1>No user found</h1>";
            return;
        }
    
        const user = userResponse.user;
    
        // Create Profile Picture
        const profilePic = document.createElement("img");
        profilePic.src = user.profilePicture;
        profilePic.alt = "Profile Picture";
        profilePic.classList.add("profile-pic");
    
        // Create Username Element
        const usernameElement = document.createElement("h2");
        usernameElement.textContent = user.username;
        usernameElement.classList.add("username");
    
        // Create Friends Count and Joined Date
        const userInfoContainer = document.createElement("div");
        userInfoContainer.classList.add("user-info-container");
        userInfoContainer.innerHTML = `
            <span class="label">Friends:</span> <span class="value">${user.friends.length}</span>
            <span class="divider">|</span>
            <span class="label">Joined:</span> <span class="value">${new Date(user.createdTimestamp).toLocaleDateString()}</span>
        `;
    
        // Create Action Button (Add Friend) if it's not the current user
        let actionButtonContainer = null;
        if (user._id !== currentUserId) 
        {
            actionButtonContainer = document.createElement("div");
            actionButtonContainer.classList.add("action-button-container");
    
            const actionButton = document.createElement("button");
            actionButton.textContent = "Add Friend";
            actionButton.classList.add("add-friend-btn");
            actionButton.addEventListener("click", async () => 
            {
                const response = await sendFriendRequestAPI(user._id);
                if (response.message === "success") 
                {
                    actionButton.textContent = "Pending...";
                    actionButton.disabled = true;
                    actionButton.classList.add("pending-btn");
                } 
                else 
                {
                    alert(response.message);
                }
            });
    
            actionButtonContainer.appendChild(actionButton);
        }
    
        // Create Horizontal Divider
        const horizontalDivider = document.createElement("div");
        horizontalDivider.classList.add("user-info-divider");
    
        // Create Lists Header
        const listsHeader = document.createElement("h2");
        listsHeader.textContent = "Lists";
        listsHeader.classList.add("my-lists-heading");
    
        // Create Lists Divider
        const listsDivider = document.createElement("div");
        listsDivider.classList.add("lists-divider");
    
        // Create Lists Container
        const listsContainer = document.createElement("div");
        listsContainer.classList.add("lists-container");
    
        // Append elements to container
        container.append(profilePic, usernameElement);
        if (actionButtonContainer) 
        {
            container.append(actionButtonContainer);
        }
        container.append(userInfoContainer, horizontalDivider, listsHeader, listsDivider, listsContainer);
    
        // Fetch and Display User's Lists
        async function fetchUserLists() 
        {
            try 
            {
                const response = await fetch("/getListsByUserId", 
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: user._id, page: 1, limit: 10 }),
                });
    
                const data = await response.json();
    
                if (data.message === "success" && data.lists.length > 0) 
                {
                    displayLists(data.lists);
                } 
                else 
                {
                    const noListsMessage = document.createElement("p");
                    noListsMessage.textContent = "This user has not posted any lists.";
                    noListsMessage.classList.add("no-lists");
                    listsContainer.appendChild(noListsMessage);
                }
            } 
            catch (error) 
            {
                console.error("Error fetching user lists:", error);
            }
        }
    
        function displayLists(lists) 
        {
            listsContainer.innerHTML = ""; // Clear previous content
    
            lists.forEach(list => 
            {
                const listCard = document.createElement("div");
                listCard.classList.add("list-card");
                listCard.style.backgroundColor = list.backgroundColor || "#444";
    
                listCard.innerHTML = `
                    <h3 class="list-title">${list.title}</h3>
                    <div class="list-items">
                        ${list.items.slice(0, 3).map(item => 
                        `
                            <div class="list-item">
                                <img src="${item.image}" alt="${item.title}">
                                <span>${item.title}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
    
                listsContainer.appendChild(listCard);
            });
        }
    
        fetchUserLists();
    
    })();
    