(() => {
    const friendsListContainer = document.getElementById("friends-list");
    const pendingRequests = new Set();
    const currentUserId = getCookie("userID");

    async function fetchUsers() {
        try {
            const users = await getUsersAPI();
            if (users.message !== "success") {
                throw (users.message);
            }else {
                renderUsers(users.users);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    async function renderUsers(users) {
        friendsListContainer.innerHTML = "";
        for (const user of users) {
            const userCard = document.createElement("div");
            userCard.classList.add("friend-item");
            userCard.addEventListener("click", () => visitUserProfile(user.username));

            const profileImg = document.createElement("img");
            profileImg.src = user.profilePicture;
            profileImg.alt = user.username;
            profileImg.classList.add("profile-pic");

            const userInfo = document.createElement("div");
            userInfo.classList.add("user-info");

            const username = document.createElement("p");
            username.textContent = user.username;
            username.classList.add("username");

            const accountAge = document.createElement("p");
            const createdDate = new Date(user.createdTimestamp);
            const formattedDate = createdDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
            accountAge.textContent = `TopX user since ${formattedDate}`;
            accountAge.classList.add("account-age");

            const friendsCount = document.createElement("p");
            friendsCount.textContent = `Friends: ${user.friends.length}`;
            friendsCount.classList.add("friends-count");

            const actionButton = document.createElement("button");

            const outgoingRequest = doesFriendRequestExist(currentUserId, user._id);
            const incomingRequest = doesFriendRequestExist(user._id, currentUserId);

            if (pendingRequests.has(user._id) || outgoingRequest.exist) {
                actionButton.textContent = "Pending...";
                actionButton.disabled = true;
                actionButton.classList.add("pending-btn");
            } else if (incomingRequest.exist) {
                const buttons = document.createElement("div");
                buttons.style.display = "flex";
                buttons.style.flexDirection = "column";
                buttons.style.justifyContent = 'center';
                buttons.style.alignItems = "center";

                const acceptButton = document.createElement("button");
                acceptButton.textContent = "Accept";
                acceptButton.classList.add("accept-friend-btn");
                acceptButton.addEventListener("click", (event) => acceptFriend(event, incomingRequest.id, userCard));

                const declineButton = document.createElement("button");
                declineButton.textContent = "Decline";
                declineButton.classList.add("decline-friend-btn");
                declineButton.addEventListener("click", (event) => declineFriend(event, incomingRequest.id, userCard));

                buttons.appendChild(acceptButton);
                buttons.appendChild(declineButton);

                userInfo.appendChild(username);
                userInfo.appendChild(accountAge);
                userInfo.appendChild(friendsCount);
                userCard.appendChild(profileImg);
                userCard.appendChild(userInfo);
                userCard.appendChild(buttons);
                friendsListContainer.appendChild(userCard);
                continue;
            } else {
                actionButton.textContent = "Add Friend";
                actionButton.classList.add("add-friend-btn");
                actionButton.addEventListener("click", (event) => addFriend(event, user._id, actionButton));
            }

            userInfo.appendChild(username);
            userInfo.appendChild(accountAge);
            userInfo.appendChild(friendsCount);
            userCard.appendChild(profileImg);
            userCard.appendChild(userInfo);
            userCard.appendChild(actionButton);

            friendsListContainer.appendChild(userCard);
        }
    }

    async function addFriend(event, userId, button) {
        event.stopPropagation();
        try {
            const request = await sendFriendRequestAPI(userId);
            if (request.message == "success") {
                pendingRequests.add(userId);
                button.textContent = "Pending...";
                button.disabled = true;
                button.classList.add("pending-btn");
            }else {
                alert(request.message);
            }

        } catch (error) {
            console.error("Error adding friend:", error);
        }
    }

    async function acceptFriend(event, requestId, userCard) {
        event.stopPropagation();
        try {
            const request = await acceptFriendRequestAPI(requestId);
            if (request.message == "success") {
                userCard.remove();
                removeNotification(requestId);
            } else {
                alert(request.message);
            }
            
        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    }

    async function declineFriend(event, requestId, userCard) {
        event.stopPropagation();
        try {
            const request = await declineFriendRequestAPI(requestId);
            if (request.message == "success") {
                userCard.remove();
                removeNotification(requestId);
            } else {
                alert(request.message);
            }
        } catch (error) {
            console.error("Error declining friend request:", error);
        }
    }

    fetchUsers();
})();