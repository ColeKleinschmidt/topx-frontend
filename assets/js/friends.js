(() => {
    const friendsListContainer = document.getElementById("friends-list");
    const pendingRequests = new Set();

    async function fetchUsers() {
        try {
            const users = await getAllUsersAPI();
            if (users.message !== "success") {
                throw (users.message);
            }else {
                renderUsers(users.users);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    function renderUsers(users) {
        friendsListContainer.innerHTML = "";
        users.forEach(user => {
            const userCard = document.createElement("div");
            userCard.classList.add("friend-item");

            const profileImg = document.createElement("img");
            profileImg.src = user.profilePicture || "default-avatar.png";
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

            const addButton = document.createElement("button");
            if (pendingRequests.has(user._id)) {
                addButton.textContent = "Pending...";
                addButton.disabled = true;
                addButton.classList.add("pending-btn");
            } else {
                addButton.textContent = "Add Friend";
                addButton.classList.add("add-friend-btn");
                addButton.addEventListener("click", () => addFriend(user._id, addButton));
            }

            userInfo.appendChild(username);
            userInfo.appendChild(accountAge);
            userInfo.appendChild(friendsCount);

            userCard.appendChild(profileImg);
            userCard.appendChild(userInfo);
            userCard.appendChild(addButton);

            friendsListContainer.appendChild(userCard);
        });
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

    fetchUsers();
})();