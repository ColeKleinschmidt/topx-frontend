const ENDPOINT = "http://localhost:8080/";

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
    if(backend_query.ok){
        const response = await backend_query.json();
        console.log(response);
        return response;
    }else{
        return { message: 'nr' };
    }

}

export const loginAPI = async (email, password) => {
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

export const authStatusAPI = async (email, password) => {
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



//------------------TEMPLATE API CALL------------------//
/*
export const api = async () => {
    const data = {
    }
    const backend_query = await fetch(`${ENDPOINT}endpoint`, {
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
*/