(() => 
    {
        const friendsListContainer = document.getElementById("friends-list");
        const pendingRequests = new Set();
        const currentUserId = getCookie("userID");
    
        async function fetchUsers() 
        {
            try 
            {
                console.log("📢 Fetching friends list...");
        
                // Fetch all users (friends + suggested users)
                const usersResponse = await getUsersAPI();
                if (usersResponse.message !== "success") 
                {
                    throw usersResponse.message;
                }
        
                console.log("✅ Users fetched:", usersResponse.users);
        
                let ignoredUsers = [];
                let outgoingRequests = new Set(); // ✅ Store pending friend requests
        
                // Fetch ignored users separately
                try 
                {
                    const ignoredResponse = await fetch(`/getIgnoredUsers`);
                    const ignoredData = await ignoredResponse.json();
        
                    if (ignoredData.ignoredUsers && Array.isArray(ignoredData.ignoredUsers)) 
                    {
                        ignoredUsers = ignoredData.ignoredUsers.map(id => id.toString());
                        console.log("🚫 Ignored Users:", ignoredUsers);
                    } 
                    else 
                    {
                        console.log("⚠️ No ignored users found.");
                    }
                } 
                catch (ignoredError) 
                {
                    console.error("❌ Error fetching ignored users:", ignoredError);
                }
        
                // ✅ Fetch pending friend requests
                try 
                {
                    const pendingResponse = await fetch(`/getPendingFriendRequests`);
                    const pendingData = await pendingResponse.json();
        
                    if (pendingData.requests && Array.isArray(pendingData.requests)) 
                    {
                        outgoingRequests = new Set(pendingData.requests.map(id => id.toString())); // ✅ Convert to Set for quick lookup
                        console.log("⏳ Pending Friend Requests:", outgoingRequests);
                    } 
                    else 
                    {
                        console.log("⚠️ No pending requests found.");
                    }
                } 
                catch (pendingError) 
                {
                    console.error("❌ Error fetching pending friend requests:", pendingError);
                }
        
                // ✅ Filter out ignored users and pass pendingRequests to renderUsers
                const filteredUsers = usersResponse.users.filter(user => 
                    !ignoredUsers.includes(user._id.toString()) // Exclude ignored users
                );
        
                console.log("✅ Rendering Users (Filtered):", filteredUsers);
                renderUsers(filteredUsers, outgoingRequests);
            } 
            catch (error) 
            {
                console.error("❌ Error fetching users:", error);
            }
        }        
    
        async function renderUsers(users, outgoingRequests) 
        {
            friendsListContainer.innerHTML = "";
        
            if (!users || users.length === 0) 
            {
                console.log("⚠️ No users to render.");
                friendsListContainer.innerHTML = "<p>No friends found.</p>";
                return;
            }
        
            for (const user of users) 
            {
                console.log(`✅ Creating User Card for: ${user.username}`);
        
                const userCard = document.createElement("div");
                userCard.classList.add("friend-item");
        
                const profileImg = document.createElement("img");
                profileImg.src = user.profilePicture;
                profileImg.alt = user.username;
                profileImg.classList.add("profile-pic");
        
                const userInfo = document.createElement("div");
                userInfo.classList.add("user-info");
        
                const username = document.createElement("p");
                username.textContent = user.username;
                username.classList.add("username");
        
                // Clicking username redirects to their profile
                username.addEventListener("click", (event) => 
                {
                    event.stopPropagation();
                    visitUserProfile(user.username);
                });
        
                const accountAge = document.createElement("p");
                const createdDate = new Date(user.createdTimestamp);
                const formattedDate = createdDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
                accountAge.textContent = `TopX user since ${formattedDate}`;
                accountAge.classList.add("account-age");
        
                const friendsCount = document.createElement("p");
                friendsCount.textContent = `Friends: ${user.friends.length}`;
                friendsCount.classList.add("friends-count");
        
                // ✅ Action buttons container
                const buttonContainer = document.createElement("div");
                buttonContainer.classList.add("action-buttons");
        
                // ✅ Add Friend Button
                const actionButton = document.createElement("button");
                actionButton.classList.add("add-friend-btn");
                actionButton.textContent = "Add Friend";
        
                // ✅ If there is a pending request, disable the button
                if (outgoingRequests.has(user._id.toString())) 
                {
                    actionButton.textContent = "Pending...";
                    actionButton.disabled = true;
                    actionButton.classList.add("pending-btn");
                } 
                else 
                {
                    actionButton.addEventListener("click", (event) => addFriend(event, user._id, actionButton));
                }
        
                // ✅ Ignore Button
                const ignoreButton = document.createElement("button");
                ignoreButton.textContent = "Ignore";
                ignoreButton.classList.add("ignore-friend-btn");
        
                ignoreButton.addEventListener("click", async (event) => 
                {
                    event.stopPropagation();
        
                    console.log(`🚫 Ignoring user: ${user.username} (${user._id})`);
                    const response = await ignoreUser(currentUserId, user._id);
        
                    if (response.message === "User ignored successfully.") 
                    {
                        console.log(`✅ User ${user.username} ignored successfully.`);
                        userCard.remove(); // Remove from UI immediately
                    } 
                    else 
                    {
                        console.error(`❌ Error ignoring user: ${response.message}`);
                    }
                });
        
                // Append buttons to container
                buttonContainer.appendChild(actionButton);
                buttonContainer.appendChild(ignoreButton);
        
                userInfo.appendChild(username);
                userInfo.appendChild(accountAge);
                userInfo.appendChild(friendsCount);
                userCard.appendChild(profileImg);
                userCard.appendChild(userInfo);
                userCard.appendChild(buttonContainer);
        
                friendsListContainer.appendChild(userCard);
            }
        }
    
        async function addFriend(event, userId, button) 
        {
            event.stopPropagation();
    
            console.log(`📤 Sending friend request to user ID: ${userId}`);
    
            try 
            {
                const response = await sendFriendRequestAPI(userId);
                console.log("📥 Friend request API response:", response);
    
                if (response.message === "success") 
                {
                    pendingRequests.add(userId);
                    button.textContent = "Pending...";
                    button.disabled = true;
                    button.classList.add("pending-btn");
                } 
                else 
                {
                    console.error("❌ Friend request failed:", response.message);
                    alert(response.message);
                }
            } 
            catch (error) 
            {
                console.error("❌ Error adding friend:", error);
            }
        }
    
        fetchUsers();
    
    })();
    