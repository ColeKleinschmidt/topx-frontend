import "../css/MyLists.css";
import { useState, useEffect } from 'react';
import { getUserListsAPI, getUserId } from "../../backend/apis.js";
import List from "../../components/class/List.jsx";
import { useNavigate } from "react-router-dom";
//import { } from "../../backend/apis.js";

const MyLists = () => {
    const [loadingLists, setLoadingLists] = useState(true);
    const [lists, setLists] = useState([]);
    const [page, setPage] = useState(1);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const id = getUserId();
        setUserId(id);
        getLists(id);
    },[])

    const getLists = (id = userId) => {
        getUserListsAPI(id, page, 10).then((response) => {
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
        navigate(`/list/${listId}`, { state: { ownerId: userId } });
    };
    
    return (
        <div className="my-lists-container">
            <div className="my-lists-top-bar">
                <h2 className="my-lists-header">My Lists</h2>
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

export default MyLists;
