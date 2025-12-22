import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../css/FindFriends.css";
import { acceptFriendRequestAPI, declineFriendRequestAPI, getUsersAPI, sendFriendRequestAPI } from "../../backend/apis.js";
import defaultAvatar from "../../assets/icons/User Icon.png";

const PAGE_SIZE = 12;

const FindFriends = ({ onBackToFriends = () => {}, notifications = [], onNotificationsUpdated = () => {} }) => {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);
    const [friendRequests, setFriendRequests] = useState({});
    const [incomingRequestStatus, setIncomingRequestStatus] = useState({});

    const listContainerRef = useRef(null);
    const loadMoreRef = useRef(null);
    const loadingRef = useRef(false);

    const loadUsers = useCallback(async (pageToLoad) => {
        if (loadingRef.current || (!hasMore && pageToLoad !== 1)) return;

        loadingRef.current = true;
        setLoading(true);
        setError(null);
        try {
            const response = await getUsersAPI(pageToLoad, PAGE_SIZE);
            const incomingUsers = response?.users ?? [];

            setUsers((prev) => pageToLoad === 1 ? incomingUsers : [...prev, ...incomingUsers]);
            setHasMore(incomingUsers.length === PAGE_SIZE);
            setPage(pageToLoad + 1);
        } catch (err) {
            console.error("Error fetching users", err);
            setError("Unable to load users right now. Please try again.");
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [hasMore]);

    useEffect(() => {
        loadUsers(1);
    }, [loadUsers]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !loading && hasMore) {
                    loadUsers(page);
                }
            },
            { root: listContainerRef.current, rootMargin: "0px 0px 200px 0px" }
        );

        const sentinel = loadMoreRef.current;
        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => {
            if (sentinel) observer.unobserve(sentinel);
        };
    }, [loadUsers, loading, hasMore, page]);

    const handleAddFriend = async (userId) => {
        if (friendRequests[userId] === "sent") return;

        setFriendRequests((prev) => ({ ...prev, [userId]: "pending" }));
        try {
            await sendFriendRequestAPI(userId);
            setFriendRequests((prev) => ({ ...prev, [userId]: "sent" }));
        } catch (err) {
            console.error("Error sending friend request", err);
            setFriendRequests((prev) => ({ ...prev, [userId]: "error" }));
        }
    };

    const incomingFriendRequests = useMemo(() => {
        const requestsBySender = {};
        notifications.forEach((notification) => {
            if (notification?.type !== "friendRequest") return;
            const senderId = notification?.sender?._id
                || notification?.senderId
                || notification?.user?._id
                || notification?.userId
                || notification?.fromUserId
                || notification?.from;
            const requestId = notification?.requestId || notification?._id || notification?.id;

            if (senderId && requestId) {
                requestsBySender[senderId] = { requestId, notification };
            }
        });
        return requestsBySender;
    }, [notifications]);

    const handleRespondToRequest = async (senderId, requestId, action) => {
        if (!requestId) return;

        setIncomingRequestStatus((prev) => ({ ...prev, [senderId]: `${action}ing` }));
        try {
            if (action === "accept") {
                await acceptFriendRequestAPI(requestId);
            } else {
                await declineFriendRequestAPI(requestId);
            }
            onNotificationsUpdated();
            setIncomingRequestStatus((prev) => ({ ...prev, [senderId]: `${action}ed` }));
        } catch (err) {
            console.error(`Error trying to ${action} friend request`, err);
            setIncomingRequestStatus((prev) => ({ ...prev, [senderId]: "error" }));
        }
    };

    return (
        <div className="find-friends-container">
            <div className="find-friends-top-bar">
                <div className="find-friends-heading">
                    <p className="eyebrow">Community</p>
                    <h2 className="title">Discover new friends</h2>
                    <p className="subtitle">Browse and connect with creators and curators across TopX.</p>
                </div>
                <div className="actions">
                    <button className="secondary-button" onClick={onBackToFriends}>Back to Friends Lists</button>
                </div>
            </div>

            <div className="find-friends-list" ref={listContainerRef}>
                {users.map((user) => (
                    <div className="friend-card" key={user._id ?? user.username}>
                        <div className="friend-avatar">
                            <img src={user.profilePic || user.profilePicture || defaultAvatar} alt={`${user.username}'s profile`} />
                        </div>
                        <div className="friend-details">
                            <h3>{user.username}</h3>
                            <p className="muted">@{user.username?.toLowerCase()}</p>
                        </div>
                        {incomingFriendRequests[user._id] ? (
                            <div className="friend-request-actions">
                                <button
                                    className="secondary-button"
                                    onClick={() => handleRespondToRequest(user._id, incomingFriendRequests[user._id].requestId, "decline")}
                                    disabled={["declining", "accepting", "accepted", "declined"].includes(incomingRequestStatus[user._id])}
                                >
                                    {incomingRequestStatus[user._id]?.startsWith("declin") ? "Declined" : "Decline"}
                                </button>
                                <button
                                    className="add-friend-button"
                                    onClick={() => handleRespondToRequest(user._id, incomingFriendRequests[user._id].requestId, "accept")}
                                    disabled={["declining", "accepting", "accepted", "declined"].includes(incomingRequestStatus[user._id])}
                                >
                                    {incomingRequestStatus[user._id]?.startsWith("accept") ? "Accepted" : "Accept"}
                                </button>
                            </div>
                        ) : (
                            <button
                                className="add-friend-button"
                                onClick={() => handleAddFriend(user._id)}
                                disabled={friendRequests[user._id] === "pending" || friendRequests[user._id] === "sent"}
                            >
                                {friendRequests[user._id] === "sent" ? "Request sent" : "Add Friend"}
                            </button>
                        )}
                    </div>
                ))}

                <div ref={loadMoreRef} className="list-footer">
                    {loading && <p className="status">Loading more users...</p>}
                    {!hasMore && users.length > 0 && <p className="status">You&apos;ve seen everyone for now.</p>}
                    {error && <p className="status error">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default FindFriends;
