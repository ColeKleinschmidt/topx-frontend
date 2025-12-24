import "../css/FriendsLists.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { getFriendsListsAPI } from "../../backend/apis.js";
import List from "../../components/class/List.jsx";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

const FriendsLists = ({ onFindFriends = () => {} }) => {
    const [loadingLists, setLoadingLists] = useState(true);
    const [lists, setLists] = useState([]);
    const [page, setPage] = useState(1);
    const hasFetchedLists = useRef(false);
    const loadingRef = useRef(false);
    const [hasMore, setHasMore] = useState(true);
    const loadMoreRef = useRef(null);
    const navigate = useNavigate();

    const getLists = useCallback(async (pageToLoad) => {
        if (loadingRef.current || (!hasMore && pageToLoad !== 1)) return;

        loadingRef.current = true;
        setLoadingLists(true);

        try {
            const response = await getFriendsListsAPI(pageToLoad, PAGE_SIZE);
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

            setHasMore(newItemsCount === PAGE_SIZE);

            if (newItemsCount > 0) {
                setPage(pageToLoad + 1);
            }
        } catch (error) {
            console.error("Failed to fetch friends lists", error);
            alert("Unable to load friends lists right now. Please try again later.");
        } finally {
            loadingRef.current = false;
            setLoadingLists(false);
        }
    }, [hasMore]);

    useEffect(() => {
        if (hasFetchedLists.current) return;
        hasFetchedLists.current = true;
        getLists(1);
    }, [getLists]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !loadingLists && hasMore) {
                    getLists(page);
                }
            },
            { root: null, rootMargin: "0px 0px 300px 0px" }
        );

        const sentinel = loadMoreRef.current;
        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => {
            if (sentinel) observer.unobserve(sentinel);
        };
    }, [getLists, loadingLists, hasMore, page]);

    const handleOpenList = (listId, ownerId) => {
        if (!listId) return;
        navigate(`/list/${listId}`, { state: { ownerId } });
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
                <div ref={loadMoreRef} className="load-more-sentinel" aria-hidden="true" />
            </div>
            {loadingLists && <h2 className="loading-lists">Loading...</h2>}
        </div>
    )
}

export default FriendsLists;
