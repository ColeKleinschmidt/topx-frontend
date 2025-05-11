import "../css/FriendsLists.css";
import { useState, useEffect } from 'react';
import { getListsAPI } from "../../backend/apis.js";
import List from "../../components/class/List.jsx";
//import { } from "../../backend/apis.js";

const FriendsLists = () => {
    const [loadingLists, setLoadingLists] = useState(true);
    const [lists, setLists] = useState([]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        getLists();
    },[])

    const getLists = () => {
        getListsAPI(page, 10).then((response) => {
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
        <div className="friends-lists-container">
            <div className="friends-lists-top-bar">
                <h2 className="friends-lists-header">Friend Lists</h2>
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

export default FriendsLists;