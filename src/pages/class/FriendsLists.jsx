import "../css/FriendsLists.css";
import { useState, useEffect } from 'react';
import { getListsAPI } from "../../backend/apis.js";
import List from "../../components/class/List.jsx";
import { useNavigate } from "react-router-dom";

const FriendsLists = ({ onFindFriends = () => {} }) => {
    const [loadingLists, setLoadingLists] = useState(true);
    const [lists, setLists] = useState([]);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        getLists();
    },[])

    const getLists = () => {
        getListsAPI(page, 10).then((response) => {
            if (response.lists !== undefined && response.lists !== null) {
                setLists((prev) => [...prev, ...response.lists]);
                setPage((prev) => prev + 1);
                setLoadingLists(false);
            }else {
                // If unsuccessful, alert the user
                alert(response.message);
                setLoadingLists(false);
            }
        })
    }

    const handleOpenList = (listId) => {
        if (!listId) return;
        navigate(`/list/${listId}`);
    };
    
    return (
        <div className="friends-lists-container">
            <div className="friends-lists-top-bar">
                <h2 className="friends-lists-header">Friends Lists</h2>
                <button className="find-new-friends-button" onClick={onFindFriends}>
                    Find new Friends
                </button>
            </div>
            <div className="lists">
                {lists.map((list, index) => (
                    <List key={list._id || list.id || index} list={list} onClick={() => handleOpenList(list._id || list.id)} />
                ))}
            </div>
            {loadingLists && <h2 className="loading-lists">Loading...</h2>}
        </div>
    )
}

export default FriendsLists;
