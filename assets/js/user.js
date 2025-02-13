(async () => {
    const username = window.location.pathname.split('-')[1];
    const userResponse = await getUserAPI(username);
    const user = userResponse.user;
    const pendingRequests = new Set();

    const currentUserId = getCookie("userID");

    const container = document.getElementById("user-container");
    container.innerHTML = ""; // Clear existing content

    if (user.message === "no user found") {
        const noUserFound = document.createElement("h1");
        noUserFound.innerHTML = "No user found";

        container.appendChild(noUserFound);
    }else {
        // Create profile picture
        const profilePic = document.createElement("img");
        profilePic.src = user.profilePicture;
        profilePic.alt = "Profile Picture";
        profilePic.style.width = "150px";
        profilePic.style.height = "150px";
        profilePic.style.borderRadius = "50%";
        profilePic.style.display = "block";
        profilePic.style.margin = "0 auto";
        profilePic.style.objectFit = "cover";
        
        // Create username element
        const username = document.createElement("h2");
        username.textContent = user.username;
        username.style.textAlign = "center";
        
        // Create friends count
        const friendsCount = document.createElement("p");
        friendsCount.textContent = `Friends: ${user.friends.length}`;
        friendsCount.style.textAlign = "center";

        const actionButton = document.createElement("button");

        const outgoingRequest = doesFriendRequestExist(currentUserId, user._id);
        const incomingRequest = doesFriendRequestExist(user._id, currentUserId);

        if (pendingRequests.has(user._id) || outgoingRequest.exist) {
            actionButton.textContent = "Pending...";
            actionButton.disabled = true;
            actionButton.classList.add("pending-btn");
            container.appendChild(profilePic);
            container.appendChild(username);
            container.appendChild(friendsCount);
            container.appendChild(actionButton);
        } else if (incomingRequest.exist) {
            const buttons = document.createElement("div");
            buttons.style.display = "flex";
            buttons.style.flexDirection = "column";
            buttons.style.justifyContent = 'center';
            buttons.style.alignItems = "center";

            const acceptButton = document.createElement("button");
            const declineButton = document.createElement("button");
            acceptButton.textContent = "Accept";
            acceptButton.classList.add("accept-friend-btn");
            acceptButton.addEventListener("click", () => acceptFriend(incomingRequest.id, acceptButton, declineButton));

            
            declineButton.textContent = "Decline";
            declineButton.classList.add("decline-friend-btn");
            declineButton.addEventListener("click", () => declineFriend(incomingRequest.id, acceptButton, declineButton));

            buttons.appendChild(acceptButton);
            buttons.appendChild(declineButton);

            container.appendChild(profilePic);
            container.appendChild(username);
            container.appendChild(friendsCount);
            container.appendChild(buttons);
        } else {
            actionButton.textContent = "Add Friend";
            actionButton.classList.add("add-friend-btn");
            actionButton.addEventListener("click", () => addFriend(user._id, actionButton));
            container.appendChild(profilePic);
            container.appendChild(username);
            container.appendChild(friendsCount);
            container.appendChild(actionButton);
        }
    }

    async function addFriend(userId, button) {
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

    async function acceptFriend(requestId, acceptButton, declineButton) {
        try {
            const request = await acceptFriendRequestAPI(requestId);
            if (request.message == "success") {
                declineButton.remove();
                acceptButton.disabled = true;
                acceptButton.textContent = "Friends";
            } else {
                alert(request.message);
            }
            
        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    }

    async function declineFriend(requestId, acceptButton, declineButton) {
        try {
            const request = await declineFriendRequestAPI(requestId);
            if (request.message == "success") {
                declineButton.remove();
                acceptButton.textContent = "Add Friend";
                acceptButton.classList.remove("accept-friend-btn");
                acceptButton.classList.add("add-friend-btn");
                acceptButton.addEventListener("click", () => addFriend(user._id, actionButton));

            } else {
                alert(request.message);
            }
        } catch (error) {
            console.error("Error declining friend request:", error);
        }
    }


})();