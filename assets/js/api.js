const ENDPOINT = "http://localhost:8080/";

const createAccountAPI = async (username, email, password) => {
    const data = {
        username: username,
        email: email,
        password: password
    }
    alert('fetching backend call');
    const backend_query = await fetch(`http://localhost:8080/createAccount`, {
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

const loginAPI = async (email, password) => {
    const data = {
        email: email,
        password: password,
    }
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
    if(backend_query.ok){
        const response = await backend_query.json();
        console.log(response);
        return response;
    }else{
        return { message: 'nr' };
    }

}

const authStatusAPI = async (email, password) => {
    const backend_query = await fetch(`${ENDPOINT}authStatus`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
        }
    });
    if(backend_query.ok){
        const response = await backend_query.json();
        console.log(response);
        return response;
    }else{
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
    console.log(response);
    return response;
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