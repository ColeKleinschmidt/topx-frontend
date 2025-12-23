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
    const navigate = useNavigate();

    const loadLists = useCallback(async (pageToLoad) => {
        if (loadingRef.current || (!hasMore && pageToLoad !== 1)) return;

        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const response = await getListsAPI(pageToLoad, PAGE_SIZE);
            const incomingLists = response?.lists ?? [];

            setLists((prev) => (pageToLoad === 1 ? incomingLists : [...prev, ...incomingLists]));
            setHasMore(incomingLists.length === PAGE_SIZE);
            setPage(pageToLoad + 1);
        } catch (err) {
            console.error("Error fetching discover lists", err);
            setError("Unable to load lists right now. Please try again.");
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [hasMore]);

    useEffect(() => {
        loadLists(1);
    }, [loadLists]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !loading && hasMore) {
                    loadLists(page);
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
    }, [loadLists, loading, hasMore, page]);

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
