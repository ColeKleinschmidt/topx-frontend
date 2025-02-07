const ENDPOINT = "http://127.0.0.1:8080/";

const createAccountAPI = async (username, email, password) => {
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

const loginAPI = async (email, password) => {
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

const authStatusAPI = async () => 
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

const sendFriendRequestAPI = async (recipientID) => {
    data = {
        receiver: recipientID
    }
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

const acceptFriendRequestAPI = async (requestId) => {
    data = {
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

const declineFriendRequestAPI = async (userId) => {
    data = {
        user: userId
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
    data = {
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

const findItemsAPI = async (title) => {
    data = {
        title: title
    }
    const backend_query = await fetch(`${ENDPOINT}findItems`, {
        method: 'GET',
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
