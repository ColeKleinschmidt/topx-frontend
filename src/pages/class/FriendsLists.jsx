import "../css/FriendsLists.css";
import { useEffect, useMemo, useRef, useState } from 'react';
import { getFriendsListsAPI, getUserByIdAPI, getUsersAPI, sendFriendRequestAPI, getUserId } from "../../backend/apis.js";
import List from "../../components/class/List.jsx";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import defaultAvatar from "../../assets/icons/User Icon.png";

const FriendsLists = ({ onFindFriends = () => {} }) => {
    const [loadingLists, setLoadingLists] = useState(true);
    const [lists, setLists] = useState([]);
    const [owners, setOwners] = useState({});
    const [page, setPage] = useState(1);
    const hasFetchedLists = useRef(false);
    const navigate = useNavigate();
    const blockedUsers = useSelector((state) => state.blockedUsers.items);
    const notifications = useSelector((state) => state.notifications.items);
    const loggedInUserId = getUserId();
    const blockedSet = useMemo(() => new Set((blockedUsers || []).map(u => typeof u === 'object' ? String(u._id || u.id) : String(u)).filter(Boolean)), [blockedUsers]);

    // Sidebar suggested users
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [friendRequests, setFriendRequests] = useState({});

    const outgoingRequestSet = useMemo(() => {
        const set = new Set();
        (notifications || []).forEach(n => {
            if (n?.type !== 'friendRequest') return;
            const senderId = String(n?.sender?._id || n?.senderId || n?.fromUserId || n?.from || n?.sender || '');
            const receiverId = String(n?.receiver?._id || n?.receiverId || n?.toUserId || n?.to || n?.receiver || '');
            if (senderId && loggedInUserId && senderId === String(loggedInUserId)) {
                set.add(receiverId);
            }
        });
        return set;
    }, [notifications, loggedInUserId]);

    useEffect(() => {
        getUsersAPI(1, 20).then(res => {
            const all = res?.users ?? [];
            const filtered = all.filter(u => {
                const id = String(u._id || u.id || '');
                if (!id || id === String(loggedInUserId)) return false;
                if (blockedSet.has(id)) return false;
                if (outgoingRequestSet.has(id)) return false;
                return true;
            });
            // pick 4 random suggestions
            const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, 4);
            setSuggestedUsers(shuffled);
        }).catch(() => {});
    }, [blockedSet, outgoingRequestSet, loggedInUserId]);

    const handleSuggestAddFriend = async (userId) => {
        if (friendRequests[userId]) return;
        setFriendRequests(prev => ({ ...prev, [userId]: 'pending' }));
        try {
            await sendFriendRequestAPI(userId);
            setFriendRequests(prev => ({ ...prev, [userId]: 'sent' }));
        } catch {
            setFriendRequests(prev => ({ ...prev, [userId]: 'error' }));
        }
    };

    useEffect(() => {
        if (hasFetchedLists.current) return;
        hasFetchedLists.current = true;
        getLists();
    },[])

    const getLists = () => {
        getFriendsListsAPI(page, 10).then(async (response) => {
            if (response.lists !== undefined && response.lists !== null) {
                const newLists = response.lists;
                setLists((prev) => {
                    const combinedLists = [...prev, ...newLists];
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

                const ownerIds = [...new Set(newLists.map(l => l.userId || l.ownerId || l.user?._id || l.user?.id || l.owner?._id || l.owner?.id || l.creatorId).filter(Boolean))];
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
                setLoadingLists(false);
            } else {
                if (response?.message && response.message.toLowerCase() !== 'unauthorized') {
                    console.warn('getFriendsLists error:', response.message);
                }
                setLoadingLists(false);
            }
        })
    }

    const handleOpenList = (listId, ownerId) => {
        if (!listId) return;
        navigate(`/list/${listId}`, { state: { ownerId } });
    };

    const visibleLists = lists.filter(l => {
        const ownerId = l.userId || l.ownerId || l.user?._id || l.user?.id || l.owner?._id || l.owner?.id || l.creatorId;
        return !ownerId || !blockedSet.has(String(ownerId));
    });

    return (
        <div className="friends-lists-outer">
            <div className="friends-lists-feed">
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
                            <div className="empty-icon">🌟</div>
                            <h3 className="empty-title">No friends yet, discover new users</h3>
                            <p className="empty-text">
                                Find people with similar tastes and follow their lists to spark new ideas.
                            </p>
                        </div>
                    )}
                    {loadingLists && (
                        <div className="lists-spinner-wrapper">
                            <div className="lists-spinner" />
                        </div>
                    )}
                </div>
            </div>

            <div className="friends-lists-sidebar">
                <div className="sidebar-widget">
                    <p className="sidebar-widget-title">People you may know</p>
                    <div className="sidebar-user-list">
                        {suggestedUsers.map(u => {
                            const id = String(u._id || u.id);
                            const status = friendRequests[id];
                            return (
                                <div className="sidebar-user-row" key={id}>
                                    <div className="sidebar-user-info" onClick={() => navigate(`/profile/${id}`)} role="button" tabIndex={0}>
                                        <div className="sidebar-avatar">
                                            <img src={u.profilePic || u.profilePicture || defaultAvatar} alt={u.username} />
                                        </div>
                                        <div className="sidebar-user-meta">
                                            <span className="sidebar-username">{u.username}</span>
                                            <span className="sidebar-handle">@{(u.username || '').toLowerCase()}</span>
                                        </div>
                                    </div>
                                    <button
                                        className={`sidebar-add-btn${status ? ' sidebar-add-btn--sent' : ''}`}
                                        onClick={() => handleSuggestAddFriend(id)}
                                        disabled={!!status}
                                    >
                                        {status === 'sent' ? 'Sent' : status === 'pending' ? '...' : 'Add'}
                                    </button>
                                </div>
                            );
                        })}
                        {suggestedUsers.length === 0 && (
                            <p className="sidebar-empty">No suggestions right now.</p>
                        )}
                    </div>
                    <button className="sidebar-find-btn" onClick={onFindFriends}>
                        Find new Friends
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FriendsLists;

