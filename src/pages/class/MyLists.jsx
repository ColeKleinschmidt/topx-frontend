import "../css/MyLists.css";
import { useState, useEffect } from 'react';
import { getUserListsAPI, getUserId } from "../../backend/apis.js";
import List from "../../components/class/List.jsx";
//import { } from "../../backend/apis.js";

const MyLists = () => {
    const [loadingLists, setLoadingLists] = useState(true);
    const [lists, setLists] = useState([]);
    const [page, setPage] = useState(1);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const id = getUserId();
        setUserId(id);
        getLists(id);
    },[])

    const getLists = (id = userId) => {
        getUserListsAPI(id, page, 10).then((response) => {
            if (response.lists !== undefined && response.lists !== null) {
                setLists([...lists, ...response.lists]);
                setPage(page + 1);
                setLoadingLists(false);
            }else {
                // If unsuccessful, alert the user
                alert(response.message);
                setLoadingLists(false);
            }
        })
    }
    
    return (
        <div className="my-lists-container">
            <div className="my-lists-top-bar">
                <h2 className="my-lists-header">My Lists</h2>
            </div>
            <div className="lists">
                {lists.map((list, index) => (
                    <List key={index} list={list} />
                ))}
            </div>
            {loadingLists && <h2 className="loading-lists">Loading...</h2>}
        </div>
    )
}

export default MyLists;