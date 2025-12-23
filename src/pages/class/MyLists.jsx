import "../css/MyLists.css";
import { useEffect, useRef, useState } from 'react';
import { getUserListsAPI, getUserId } from "../../backend/apis.js";
import List from "../../components/class/List.jsx";
import { useNavigate } from "react-router-dom";
//import { } from "../../backend/apis.js";

const MyLists = ({ onCreateList = () => {}, onEmptyChange = () => {} }) => {
    const [loadingLists, setLoadingLists] = useState(true);
    const [lists, setLists] = useState([]);
    const [page, setPage] = useState(1);
    const [userId, setUserId] = useState(null);
    const hasFetchedLists = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        const id = getUserId();
        setUserId(id);
        if (hasFetchedLists.current) return;
        hasFetchedLists.current = true;
        getLists(id);
    },[])

    useEffect(() => {
        const isEmpty = !loadingLists && lists.length === 0;
        onEmptyChange(isEmpty);
    }, [lists, loadingLists, onEmptyChange]);

    const getLists = (id = userId) => {
        getUserListsAPI(id, page, 10).then((response) => {
            if (response?.lists) {
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
            } else {
                // If unsuccessful, alert the user
                alert(response.message);
            }
            setLoadingLists(false);
        })
    }

    const handleOpenList = (listId) => {
        if (!listId) return;
        navigate(`/list/${listId}`, { state: { ownerId: userId } });
    };
    const isEmpty = !loadingLists && lists.length === 0;

    return (
        <div className="my-lists-container">
            <div className="my-lists-top-bar">
                <h2 className="my-lists-header">My Lists</h2>
            </div>
            <div className="lists">
                {lists.map((list, index) => (
                    <List key={list._id || list.id || index} list={list} onClick={() => handleOpenList(list._id || list.id)} />
                ))}
                {isEmpty && (
                    <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <h3 className="empty-title">You don't have any lists yet</h3>
                        <p className="empty-text">
                            Start curating your favorites and keep them all in one place. Create your first one here!
                        </p>
                        <button className="my-lists-primary-action" onClick={onCreateList}>
                            Create a list
                        </button>
                    </div>
                )}
            </div>
            {loadingLists && <h2 className="loading-lists">Loading...</h2>}
        </div>
    )
}

export default MyLists;
