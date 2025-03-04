(async () => 
    {
        const username = window.location.pathname.split('/')[2];
        const userResponse = await getUserByUsernameAPI(username);
        const currentUserId = getCookie("userID");
    
        const container = document.getElementById("user-container");
        container.innerHTML = "";
    
        if (userResponse.message === "no user found") 
        {
            container.innerHTML = "<h1>No user found</h1>";
            return;
        }
    
        const user = userResponse.user;
    
        let isBlocked = false;
        try 
        {
            const blockedResponse = await fetch(`/getBlockedUsers`);
            const blockedData = await blockedResponse.json();
    
            if (blockedData.blockedUsers && Array.isArray(blockedData.blockedUsers)) 
            {
                isBlocked = blockedData.blockedUsers.includes(user._id.toString());
            }
        } 
        catch (error) 
        {
            console.error("❌ Error fetching blocked users:", error);
        }
    
        if (localStorage.getItem(`blocked_${user._id}`) === "true") 
        {
            isBlocked = true;
        }
    
        let isPending = false;
        try 
        {
            const pendingResponse = await fetch(`/getPendingFriendRequests`);
            const pendingData = await pendingResponse.json();
    
            if (pendingData.requests && Array.isArray(pendingData.requests)) 
            {
                isPending = pendingData.requests.includes(user._id.toString());
            }
        } 
        catch (error) 
        {
            console.error("❌ Error fetching pending friend requests:", error);
        }
    
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
    
        // Create Action Button Container (Add Friend & Block)
        let actionButtonContainer = null;
        let blockButton = null;
        if (user._id !== currentUserId) 
        {
            actionButtonContainer = document.createElement("div");
            actionButtonContainer.classList.add("action-button-container");
    
            const actionButton = document.createElement("button");
            actionButton.classList.add("add-friend-btn");
    
            if (isPending) 
            {
                actionButton.textContent = "Pending...";
                actionButton.disabled = true;
                actionButton.classList.add("pending-btn");
            } 
            else 
            {
                actionButton.textContent = "Add Friend";
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
            }
    
            blockButton = document.createElement("button");
            blockButton.classList.add("block-btn");
            blockButton.textContent = isBlocked ? "Unblock" : "Block";
    
            blockButton.addEventListener("click", async () => 
            {
                try 
                {
                    const response = await fetch("/toggleBlockUser", 
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: currentUserId, blockedUserId: user._id })
                    });
    
                    const data = await response.json();
                    console.log("Block API response:", data);
    
                    if (data.message === "blocked") 
                    {
                        isBlocked = true;
                        blockButton.textContent = "Unblock";
                        localStorage.setItem(`blocked_${user._id}`, "true");
                        listsContainer.innerHTML = "<p class='blocked-message'>You have blocked this user.</p>";
                    } 
                    else if (data.message === "unblocked") 
                    {
                        isBlocked = false;
                        blockButton.textContent = "Block";
                        localStorage.removeItem(`blocked_${user._id}`);
                        fetchUserLists();
                    } 
                    else 
                    {
                        console.error("Unexpected response:", data);
                        alert("Error updating block status");
                    }
                } 
                catch (error) 
                {
                    console.error("Block API Error:", error);
                    alert("Error updating block status");
                }
            });
    
            actionButtonContainer.appendChild(actionButton);
            actionButtonContainer.appendChild(blockButton);
        }
    
        const horizontalDivider = document.createElement("div");
        horizontalDivider.classList.add("user-info-divider");
    
        const listsHeader = document.createElement("h2");
        listsHeader.textContent = "Lists";
        listsHeader.classList.add("my-lists-heading");
    
        const listsDivider = document.createElement("div");
        listsDivider.classList.add("lists-divider");
    
        const listsContainer = document.createElement("div");
        listsContainer.classList.add("lists-container");
    
        container.append(profilePic, usernameElement);
        if (actionButtonContainer) 
        {
            container.append(actionButtonContainer);
        }
        container.append(userInfoContainer, horizontalDivider, listsHeader, listsDivider, listsContainer);
    
        if (blockButton && (isBlocked || localStorage.getItem(`blocked_${user._id}`) === "true")) 
        {
            blockButton.textContent = "Unblock";
        }
    
        if (isBlocked || localStorage.getItem(`blocked_${user._id}`) === "true") 
        {
            listsContainer.innerHTML = "<p class='blocked-message'>You have blocked this user.</p>";
        } 
        else 
        {
            fetchUserLists();
        }
    
        async function fetchUserLists() 
        {
            if (isBlocked || localStorage.getItem(`blocked_${user._id}`) === "true") return;
    
            try 
            {
                const response = await fetch("/getListsByUserId", 
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: user._id, page: 1, limit: 10 }),
                });
    
                const data = await response.json();
    
                listsContainer.innerHTML = "";
    
                if (data.message === "success" && data.lists.length > 0) 
                {
                    displayLists(data.lists);
                } 
                else 
                {
                    listsContainer.innerHTML = "<p class='no-lists'>This user has not posted any lists.</p>";
                }
            } 
            catch (error) 
            {
                console.error("Error fetching user lists:", error);
            }
        }
    
        function displayLists(lists) 
        {
            lists.forEach(list => 
            {
                const listCard = document.createElement("div");
                listCard.classList.add("list-card");
                listCard.style.backgroundColor = list.backgroundColor || "#444";
    
                const itemsHtml = list.items.slice(0, 5).map(item => `
                    <div class="list-item">
                        <img src="${item.image}" alt="${item.title}">
                        <span>${item.title}</span>
                    </div>
                `).join('');
    
                const ellipses = list.items.length > 5 ? `<div class="list-ellipsis"><strong>More...</strong></div>` : '';
    
                listCard.innerHTML = `<h3 class="list-title">${list.title}</h3><div class="list-items">${itemsHtml}${ellipses}</div>`;
    
                listsContainer.appendChild(listCard);
            });
        }
    
        fetchUserLists();
    
    })();
    