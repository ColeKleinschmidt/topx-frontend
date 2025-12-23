import "../css/FriendsLists.css";
import { useEffect, useRef, useState } from "react";
import { getFriendsListsAPI } from "../../backend/apis.js";
import List from "../../components/class/List.jsx";
import { useNavigate } from "react-router-dom";

const FriendsLists = ({ onFindFriends = () => {} }) => {
    const [loadingLists, setLoadingLists] = useState(true);
    const [lists, setLists] = useState([]);
    const [page, setPage] = useState(1);
    const hasFetchedLists = useRef(false);
    const loadingRef = useRef(false);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (hasFetchedLists.current) return;
        hasFetchedLists.current = true;
        getLists(1);
    }, [])

    const getLists = async (pageToLoad) => {
        if (loadingRef.current || !hasMore) return;

        loadingRef.current = true;
        setLoadingLists(true);

        try {
            const response = await getFriendsListsAPI(pageToLoad, 10);
            const incomingLists = response?.lists ?? [];
            let newItemsCount = 0;

            setLists((prev) => {
                const baseList = pageToLoad === 1 ? [] : [...prev];
                const seenIds = new Set(baseList.map((list) => list._id || list.id));

                incomingLists.forEach((list) => {
                    const key = list._id || list.id;
                    if (key && seenIds.has(key)) return;

                    seenIds.add(key);
                    baseList.push(list);
                    newItemsCount += 1;
                });

                return baseList;
            });

            if (newItemsCount > 0) {
                setPage(pageToLoad + 1);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to fetch friends lists", error);
            alert("Unable to load friends lists right now. Please try again later.");
        } finally {
            loadingRef.current = false;
            setLoadingLists(false);
        }
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
