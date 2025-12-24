import "../css/DiscoverLists.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { getListsAPI } from "../../backend/apis.js";
import List from "../../components/class/List.jsx";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

const DiscoverLists = () => {
    const [lists, setLists] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);

    const loadMoreRef = useRef(null);
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const nextPageRef = useRef(1);
    const hasInitialized = useRef(false);
    const navigate = useNavigate();

    const loadLists = useCallback(async (pageToLoad) => {
        const targetPage = pageToLoad ?? nextPageRef.current;
        const isReset = targetPage === 1;

        if (loadingRef.current || (!hasMoreRef.current && !isReset)) return;

        if (isReset) {
            hasMoreRef.current = true;
            nextPageRef.current = 1;
        }

        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const response = await getListsAPI(targetPage, PAGE_SIZE);
            const incomingLists = response?.lists ?? [];

            let newItemsCount = 0;

            setLists((prev) => {
                const baseList = isReset ? [] : [...prev];
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

            const moreAvailable = incomingLists.length === PAGE_SIZE;
            hasMoreRef.current = moreAvailable;
            setHasMore(moreAvailable);

            if (newItemsCount > 0) {
                nextPageRef.current = targetPage + 1;
                setPage(targetPage + 1);
            }
        } catch (err) {
            console.error("Error fetching discover lists", err);
            setError("Unable to load lists right now. Please try again.");
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        setPage(1);
        setHasMore(true);
        nextPageRef.current = 1;
        hasMoreRef.current = true;
        loadLists(1);
    }, [loadLists]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !loadingRef.current && hasMoreRef.current) {
                    loadLists(nextPageRef.current);
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
    }, [loadLists]);

    const handleOpenList = (listId, ownerId) => {
        if (!listId) return;
        navigate(`/list/${listId}`, { state: { ownerId } });
    };

    const isEmpty = !loading && lists.length === 0;

    return (
        <div className="discover-lists-container">
            <div className="discover-lists-top-bar">
                <h2 className="discover-lists-header">Discover Lists</h2>
                <p className="discover-lists-subtitle">
                    Explore what the community is creating and find inspiration for your next list.
                </p>
            </div>
            <div className="lists">
                {lists.map((list, index) => (
                    <List
                        key={list._id || list.id || index}
                        list={list}
                        onClick={() => handleOpenList(list._id || list.id, list.userId || list.ownerId)}
                    />
                ))}
                {isEmpty && (
                    <div className="empty-state">
                        <div className="empty-icon">🌍</div>
                        <h3 className="empty-title">No lists to show yet</h3>
                        <p className="empty-text">
                            Check back soon to see what everyone is sharing.
                        </p>
                    </div>
                )}
                {error && (
                    <div className="error-state">
                        <p>{error}</p>
                        <button className="retry-button" onClick={() => loadLists(page)} disabled={loading}>
                            Try again
                        </button>
                    </div>
                )}
                <div ref={loadMoreRef} className="load-more-sentinel" aria-hidden="true" />
            </div>
            {loading && <h2 className="loading-lists">Loading...</h2>}
        </div>
    );
};

export default DiscoverLists;
