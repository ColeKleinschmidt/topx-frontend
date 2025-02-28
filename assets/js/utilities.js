function setCookieWithMonthExpiration(name, value) {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cookieName = `${name}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
  
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i].trim();
      if (cookie.indexOf(cookieName) === 0) {
        return cookie.substring(cookieName.length, cookie.length);
      }
    }
    return "";
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function setLocalStorageWithMonthExpiration(key, value) {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    const item = {
        value: value,
        expiration: date.getTime(),
    };
    localStorage.setItem(key, JSON.stringify(item));
}

function deleteLocalStorage(key) {
    localStorage.removeItem(key);
}

function getLocalStorage(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return "";
    try {
        const item = JSON.parse(itemStr);
        if (item.expiration && new Date().getTime() > item.expiration) {
            localStorage.removeItem(key);
            return "";
        }
        return item.value || "";
    } catch (error) {
        return ""; // Return empty if parsing fails
    }
}

async function getNotifications() {
    const notifications = await getAllNotificationsAPI();
    if (notifications.message === "success") {
        setLocalStorageWithMonthExpiration("notifications", notifications.notifications);
        setTimeout(() => {
            countNotifications();
            countShared();
        },500)
    }
}

function doesFriendRequestExist(sender, receiver) {
    const notifications = getLocalStorage("notifications");
    
    if (!notifications) return { exist: false, id: null };

    for (const notification of notifications) {
        if (notification.type === "friendRequest" && 
            notification.receiver === receiver && 
            notification.sender === sender) {
            return { exist: true, id: notification._id };
        }
    }

    return { exist: false, id: null };
}

function removeNotification(id) {
    let notifications = getLocalStorage("notifications");

    notifications = notifications.filter(x => x !== id);

    setLocalStorageWithMonthExpiration("notifications", notifications);
}

function countNotifications() {
    const notifications = getLocalStorage("notifications");
    const currentUserId = getCookie("userID");
    const notificationIcon = document.querySelector(".notification-icon");
    if (notifications.filter(x => x.receiver === currentUserId && x.type !== "share").length > 0) {
        const notificationsIndicator = document.createElement("div");
        notificationsIndicator.classList.add("notifications-indicator");

        notificationIcon.appendChild(notificationsIndicator);
    }
}

function countShared() {
    const notifications = getLocalStorage("notifications");
    const currentUserId = getCookie("userID");
    const sharedIcon = document.querySelector(".shared-icon");
    if (notifications.filter(x => x.receiver === currentUserId && x.type === "share").length > 0) {
        const notificationsIndicator = document.createElement("div");
        notificationsIndicator.classList.add("notifications-indicator");

        sharedIcon.appendChild(notificationsIndicator);
    }
}

function visitUserProfile(username) {
    pathName = "/user/" + username;
    window.location.pathname = pathName;
    //loadPage(pathName);
}

function visitList(listId) {
    pathName = "/list/" + listId;
    window.location.pathname = pathName;
    //loadPage(pathName);
}

if (getCookie("userID") !== "") {
    getNotifications();
}

async function openShareList(element, list) {
    const shareList = document.createElement("div");
    shareList.classList.add("share-list-menu");
    shareList.addEventListener("blur", () => {
        shareList.remove();
    })

    const message = document.createElement("div");
    message.innerHTML = "Loading...";

    shareList.appendChild(message);

    const getFriends = await getFriendsAPI();

    const friends = getFriends?.friends || [];

    let availableFriends = [];
    for (let i = 0; i < friends.length; i++) {
        const user = friends[i];
        try {
            if (user !== undefined && user !== null) {
                const userRow = document.createElement("div");
                userRow.classList.add("friend-share-list");
                userRow.addEventListener("click", async () => {
                    const listShared = await shareListAPI(user._id, list);
                    if (listShared.message === "success") {
                        alert("shared list successfully");
                        shareList.remove();
                    }else {
                        alert("could not share list: " + listShared.message);
                    }
                })  

                const profileImg = document.createElement("img");
                profileImg.src = user.profilePicture;
                profileImg.alt = user.username;
                profileImg.classList.add("profile-pic-notification");
                profileImg.style.width = "50px";
                profileImg.style.height = "50px";
                profileImg.style.borderRadius = "50%";
                profileImg.style.marginRight = "20px";
                profileImg.styleobjectFit = "cover";

                const username = document.createElement("h4");
                username.textContent = user.username;

                userRow.appendChild(profileImg);
                userRow.appendChild(username);
                availableFriends.push(userRow);
            }
        } catch (error) {
            console.log("could not load user: " + error);
        }
    }

    if (availableFriends.length > 0) {
        message.innerHTML = "";
    }else {
        message.innerHTML = "No friends available";
    }

    availableFriends.map((x) => {
        shareList.appendChild(x);
    });

    element.appendChild(shareList);
    
}

function generateListElement (list) {
    const listContainer = document.createElement("div");
    listContainer.classList.add("list-container");
    listContainer.style.backgroundColor = list.backgroundColor;

    const profilePic = document.createElement("img");
    profilePic.src = list.user.profilePicture;
    profilePic.alt = list.user.username;
    profilePic.classList.add("list-profile-pic");
    
    const title = document.createElement("h2");
    title.textContent = list.title;

    const shareIcon = document.createElement("div");
    const shareIconImage = document.createElement("img");
    shareIconImage.src = "assets/images/Shared Icon.png";
    shareIconImage.classList.add("shared-icon-list-img");
    shareIcon.classList.add("shared-icon-list-container");
    shareIcon.appendChild(shareIconImage);
    shareIcon.addEventListener("click", () => {
        openShareList(shareIcon, list._id);
    });

    listContainer.appendChild(profilePic);
    listContainer.appendChild(title);
    listContainer.appendChild(shareIcon);
    
    const itemsContainer = document.createElement("div");
    itemsContainer.classList.add("items-container");
    
    list.items.forEach((item,i) => {
        const itemRow = document.createElement("div");
        itemRow.classList.add("item-row");

        const itemNum = document.createElement("span");
        itemNum.classList.add("item-num")
        itemNum.textContent = `${i+1 == 10 ? "x" : i+1}`;
        
        const itemName = document.createElement("span");
        itemName.textContent = item.title;
        itemName.classList.add('item-name');
        
        const itemImage = document.createElement("img");
        itemImage.src = item.image;
        itemImage.alt = item.title;
        itemImage.classList.add("item-image");
        
        itemRow.appendChild(itemNum);
        itemRow.appendChild(itemName);
        itemRow.appendChild(itemImage);
        itemsContainer.appendChild(itemRow);
    });
    
    listContainer.appendChild(itemsContainer);

    return listContainer;
}


