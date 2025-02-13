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

if (getCookie("userID") !== "") {
    getNotifications();
}


