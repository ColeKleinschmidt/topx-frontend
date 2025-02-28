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
        countNotifications();
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
    if (notifications.filter(x => x.receiver === currentUserId).length > 0) {
        const notificationsIndicator = document.createElement("div");
        notificationsIndicator.classList.add("notifications-indicator");

        notificationIcon.appendChild(notificationsIndicator);
    }
}

function visitUserProfile(username) {
    pathName = "/user/" + username;
    window.location.pathname = pathName;
    //loadPage(pathName);
}

if (getCookie("userID") !== "") {
    getNotifications();
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

    listContainer.appendChild(profilePic);
    listContainer.appendChild(title);
    
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


