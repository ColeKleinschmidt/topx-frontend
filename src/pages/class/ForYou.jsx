import "../css/FriendsLists.css";
import { useEffect, useMemo, useRef, useState } from 'react';
import { getListsAPI, getUserByIdAPI } from "../../backend/apis.js";
import List from "../../components/class/List.jsx";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ForYou = () => {
    const [loadingLists, setLoadingLists] = useState(true);
    const [lists, setLists] = useState([]);
    const [owners, setOwners] = useState({});
    const [page, setPage] = useState(1);
    const hasFetchedLists = useRef(false);
    const navigate = useNavigate();
    const blockedUsers = useSelector((state) => state.blockedUsers.items);
    const blockedSet = useMemo(() => new Set((blockedUsers || []).map(u => typeof u === 'object' ? String(u._id || u.id) : String(u)).filter(Boolean)), [blockedUsers]);

    useEffect(() => {
        if (hasFetchedLists.current) return;
        hasFetchedLists.current = true;
        getLists();
    }, []);

    const getLists = () => {
        getListsAPI(page, 20).then(async (response) => {
            const newLists = response?.lists ?? [];
            if (newLists.length > 0) {
                setLists((prev) => {
                    const combined = [...prev, ...newLists];
                    const seen = new Set();
                    return combined.filter((list) => {
                        const key = list._id || list.id;
                        if (!key) return true;
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    });
                });
                setPage((prev) => prev + 1);

                // Fetch owner info for unique owner IDs
                const ownerIds = [...new Set(
                    newLists
                        .map(l => l.userId || l.ownerId || l.user?._id || l.user?.id || l.owner?._id || l.owner?.id || l.creatorId)
                        .filter(Boolean)
                )];
                const fetched = {};
                await Promise.all(ownerIds.map(async (id) => {
                    try {
                        const res = await getUserByIdAPI(id);
                        if (res?.user || res?.username) {
                            fetched[id] = res.user || res;
                        }
                    } catch {}
                }));
                setOwners((prev) => ({ ...prev, ...fetched }));
            }
            setLoadingLists(false);
        }).catch(() => setLoadingLists(false));
    };

    const handleOpenList = (listId, ownerId) => {
        if (!listId) return;
        navigate(`/list/${listId}`, { state: { ownerId } });
    };

    const visibleLists = lists.filter(l => {
        const ownerId = l.userId || l.ownerId || l.user?._id || l.user?.id || l.owner?._id || l.owner?.id || l.creatorId;
        return !ownerId || !blockedSet.has(String(ownerId));
    });

    return (
        <div className="friends-lists-container">
            <div className="lists">
                {visibleLists.map((list, index) => {
                    const ownerId = list.userId || list.ownerId || list.user?._id || list.user?.id || list.owner?._id || list.owner?.id || list.creatorId;
                    const ownerData = owners[ownerId];
                    return (
                        <List
                            key={list._id || list.id || index}
                            list={list}
                            owner={ownerId ? { _id: ownerId, ...ownerData } : undefined}
                            onClick={() => handleOpenList(list._id || list.id, ownerId)}
                        />
                    );
                })}
                {!loadingLists && visibleLists.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">✨</div>
                        <h3 className="empty-title">No lists yet</h3>
                        <p className="empty-text">Check back soon for new lists from the community.</p>
                    </div>
                )}
            </div>
            {loadingLists && (
                <div className="lists-spinner-wrapper">
                    <div className="lists-spinner" />
                </div>
            )}
        </div>
    );
};

export default ForYou;
