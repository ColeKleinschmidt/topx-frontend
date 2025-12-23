import "../css/FriendsLists.css";
import { useEffect, useRef, useState } from 'react';
import { getFriendsListsAPI } from "../../backend/apis.js";
import List from "../../components/class/List.jsx";
import { useNavigate } from "react-router-dom";

const FriendsLists = ({ onFindFriends = () => {} }) => {
    const [loadingLists, setLoadingLists] = useState(true);
    const [lists, setLists] = useState([]);
    const [page, setPage] = useState(1);
    const hasFetchedLists = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (hasFetchedLists.current) return;
        hasFetchedLists.current = true;
        getLists();
    },[])

    const getLists = () => {
        getFriendsListsAPI(page, 10).then((response) => {
            if (response.lists !== undefined && response.lists !== null) {
                setLists((prev) => {
                    const combinedLists = [...prev, ...response.lists];
                    const seenIds = new Set();

                    return combinedLists.filter((list) => {
                        const key = list._id || list.id;
                        if (!key) return true;
                        if (seenIds.has(key)) return false;
                        seenIds.add(key);
                        return true;
                    });
                });
                setPage((prev) => prev + 1);
                setLoadingLists(false);
            }else {
                // If unsuccessful, alert the user
                alert(response.message);
                setLoadingLists(false);
            }
        })
    }

    const handleOpenList = (listId, ownerId) => {
        if (!listId) return;
        navigate(`/list/${listId}`, { state: { ownerId } });
    };
    const isEmpty = !loadingLists && lists.length === 0;

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
                    <List
                        key={list._id || list.id || index}
                        list={list}
                        onClick={() => handleOpenList(list._id || list.id, list.userId || list.ownerId)}
                    />
                ))}
                {!loadingLists && lists.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🌟</div>
                        <h3 className="empty-title">No friends yet, discover new users</h3>
                        <p className="empty-text">
                            Find people with similar tastes and follow their lists to spark new ideas.
                        </p>
                    </div>
                )}
            </div>
            {loadingLists && <h2 className="loading-lists">Loading...</h2>}
        </div>
    )
}

export default FriendsLists;
