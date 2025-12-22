//when true, pinging server will ping the local server. When false, it will ping real API.
const local_server = true;
//paste your local ip address here so expo can connect to local functions emulator
export const local_ip_address = 'http://192.168.86.186';

const ENDPOINT = local_server ? local_ip_address + ":8080/" : "https://topx-backend.onrender.com/"; 

export const getUserId = () => {
    const user = localStorage.getItem("user");
    if (user) {
        const parsedUser = JSON.parse(user);
        return parsedUser._id;
    }
    return null;
}


//Test Fully Updated Test Test
export const createAccountAPI = async (username, email, password) => {
    const data = {
        username: username,
        email: email,
        password: password
    }
    const backend_query = await fetch(`${ENDPOINT}createAccount`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    const response = await backend_query.json();
    return response;
}

export const loginAPI = async (email, password) => {
    const data = {
        email: email,
        password: password,
    };
    const backend_query = await fetch(`${ENDPOINT}login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    if (backend_query.ok) {
        const response = await backend_query.json();
        console.log(response);

        // Emit a custom event with the user's data
        window.dispatchEvent(new CustomEvent("userLoggedIn", { detail: { user: response.user } }));
        return response;
    } else {
        return { message: 'nr' };
    }
};

export const authStatusAPI = async () => 
    {
        const backend_query = await fetch(`${ENDPOINT}authStatus`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json'
            }
        });
        if (backend_query.ok) 
        {
            const response = await backend_query.json();
            return response; // Includes profilePicture
        } 
        else 
        {
            return { message: 'nr' };
        }
    };
const logoutAPI = async () => {
    const backend_query = await fetch(`${ENDPOINT}logout`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        }
    });
    if (backend_query.ok) {
        const response = await backend_query.json();
        deleteCookie("userId");
        return response;
    } else {
        return { message: 'nr' };
    }
}

const getAllUsersAPI = async () => {
    const backend_query = await fetch(`${ENDPOINT}getAllUsers`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        },
    });
    const response = await backend_query.json();
    return response;
}

export const getUsersAPI = async (page = 1, limit = 12) => {
    const backend_query = await fetch(`${ENDPOINT}getUsers?page=${page}&limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        },
    });
    const response = await backend_query.json();
    return response;
}

const uploadProfilePictureAPI = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
        const backend_query = await fetch(`${ENDPOINT}uploadProfilePicture`, {
            method: 'POST',
            credentials: 'include', // Ensure session cookies are sent
            body: formData,
        });

        if (backend_query.ok) {
            const response = await backend_query.json();
            return response;
        } else {
            const errorResponse = await backend_query.json();
            return { message: 'Upload failed', error: errorResponse };
        }
    } catch (error) {
        console.error("Error during upload:", error);
        return { message: 'Error', error };
    }
}

export const sendFriendRequestAPI = async (recipientID) => {
    const data = {
        receiver: recipientID
    };
    const backend_query = await fetch(`${ENDPOINT}sendFriendRequest`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    const response = await backend_query.json();
    console.log(response);
    return response;
}

export const getAllNotificationsAPI = async () => {
    const backend_query = await fetch(`${ENDPOINT}getAllNotifications`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        }
    });
    const response = await backend_query.json();
    console.log(response);
    return response;
}

export const acceptFriendRequestAPI = async (requestId) => {
    const data = {
        requestId: requestId
    }
    const backend_query = await fetch(`${ENDPOINT}acceptFriendRequest`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    const response = await backend_query.json();
    console.log(response);
    return response;
}

export const declineFriendRequestAPI = async (requestId) => {
    const data = {
        requestId: requestId
    }
    const backend_query = await fetch(`${ENDPOINT}declineFriendRequest`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    const response = await backend_query.json();
    console.log(response);
    return response;
}

const removeFriendAPI = async (userId) => {
    const data = {
        user: userId
    }
    const backend_query = await fetch(`${ENDPOINT}removeFriend`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    const response = await backend_query.json();
    console.log(response);
    return response;
}

export const findItemsAPI = async (title) => {
    const data = {
        title: title
    }
    const backend_query = await fetch(`${ENDPOINT}findItems`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    const response = await backend_query.json();
    console.log(response);
    return response;
}

export const getListsAPI = async (page, limit) => {
    const data = {
        page: page,
        limit: limit
    }
    const backend_query = await fetch(`${ENDPOINT}getLists`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    const response = await backend_query.json();
    console.log(response);
    return response;
}

const getListAPI = async (listId) => {
    data = {
        listId
    }
    const backend_query = await fetch(`${ENDPOINT}getList`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    const response = await backend_query.json();
    console.log(response);
    return response;
}

const getFriendsAPI = async (listId) => {
    const backend_query = await fetch(`${ENDPOINT}getFriends`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        }
    });
    const response = await backend_query.json();
    console.log(response);
    return response;
}


const getUserByUsernameAPI = async (username) => {
    data = {
        username: username
    }
    const backend_query = await fetch(`${ENDPOINT}getUserByUsername`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    const response = await backend_query.json();
    console.log(response);
    return response;
}

const shareListAPI = async (userId, listId) => {
    data = {
        userId: userId,
        listId: listId
    }
    const backend_query = await fetch(`${ENDPOINT}shareList`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    const response = await backend_query.json();
    console.log(response);
    return response;
}

const getUserByIdAPI = async (id) => {
    data = {
        id: id
    }
    const backend_query = await fetch(`${ENDPOINT}getUserById`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    const response = await backend_query.json();
    console.log(response);
    return response;
}

const createListAPI = async (list) => {
    const backend_query = await fetch(`${ENDPOINT}createList`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(list),
    });
    const response = await backend_query.json();
    console.log(response);
    return response;
}

window.fetchImages = async (query) => {
    const url = `${ENDPOINT}scrape-images?q=${query}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.images;
    } catch (error) {
        console.error("Error fetching images:", error);
        throw error;
    }
};

export const getUserListsAPI = async (userId, page = 1, limit = 10) => 
{
    const data = { userId, page, limit };

    const backend_query = await fetch(`${ENDPOINT}getListsByUserId`, 
    {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });

    const response = await backend_query.json();
    console.log(response);
    return response;
};

async function ignoreUser(userId, ignoredUserId) 
{
    try 
    {
        const response = await fetch(`${ENDPOINT}ignoreUser"`, 
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, ignoredUserId })
        });

        return await response.json();
    } 
    catch (error) 
    {
        console.error("Error ignoring user:", error);
        return { message: "Error" };
    }
}

async function toggleBlockUser(userId, blockedUserId) 
{
    try 
    {
        const response = await fetch(`${ENDPOINT}/toggleBlockUser`, 
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, blockedUserId })
        });

        const data = await response.json();
        console.log("toggleBlockUser API response:", data);
        return data;
    } 
    catch (error) 
    {
        console.error("Error toggling block status:", error);
        return { message: "Error" };
    }
}

async function getBlockedUsers() 
{
    try 
    {
        const response = await fetch(`${ENDPOINT}/getBlockedUsers`, 
        { 
            method: "GET", 
            headers: { "Content-Type": "application/json" } 
        });

        return await response.json();
    } 
    catch (error) 
    {
        console.error("Error fetching blocked users:", error);
        return { blockedUsers: [] }; // Return an empty array to prevent crashes
    }
}

//------------------TEMPLATE API CALL------------------//
/*
const api = async () => {
    data = {}
    const backend_query = await fetch(`${ENDPOINT}api`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    const response = await backend_query.json();
    console.log(response);
    return response;
}
*/
