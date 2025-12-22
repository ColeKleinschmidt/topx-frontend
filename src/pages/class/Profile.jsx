import "../css/Profile.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    acceptFriendRequestAPI,
    declineFriendRequestAPI,
    deleteCookie,
    getAllNotificationsAPI,
    getUserByIdAPI,
    getUserId,
    getUserListsAPI,
    logoutAPI,
    removeFriendAPI,
    sendFriendRequestAPI
} from "../../backend/apis.js";
import List from "../../components/class/List.jsx";
import defaultAvatar from "../../assets/icons/User Icon.png";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { setNotifications } from "../../store/notificationsSlice.js";

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId: routeUserId } = useParams();

    const dispatch = useDispatch();
    const notifications = useSelector((state) => state.notifications.items);
    const loggedInUserId = getUserId();
    const viewingOwnProfile = useMemo(() => {
        if (routeUserId) return routeUserId === loggedInUserId;
        const searchParams = new URLSearchParams(location.search);
        const queryId = searchParams.get("id");
        return !queryId || queryId === loggedInUserId;
    }, [routeUserId, loggedInUserId, location.search]);

    const targetUserId = useMemo(() => {
        if (routeUserId) return routeUserId;
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get("id") || loggedInUserId;
    }, [location.search, loggedInUserId, routeUserId]);

    const [user, setUser] = useState(null);
    const [friends, setFriends] = useState([]);
    const [friendsOpen, setFriendsOpen] = useState(false);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listsLoading, setListsLoading] = useState(true);
    const [friendAction, setFriendAction] = useState("idle");

    const refreshNotifications = useCallback(async () => {
        try {
            const response = await getAllNotificationsAPI();
            if (response?.notifications) {
                dispatch(setNotifications(response.notifications));
            }
        } catch (error) {
            console.error("Failed to refresh notifications", error);
        }
    }, [dispatch]);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const response = await getUserByIdAPI(targetUserId);
                const fetchedUser = response?.user || response;
                setUser(fetchedUser);

                const friendIds = fetchedUser?.friends || [];
                const friendDetails = await Promise.all(friendIds.map(async (id) => {
                    try {
                        const friendRes = await getUserByIdAPI(id);
                        return friendRes?.user || friendRes;
                    } catch (error) {
                        console.error("Failed to load friend", id, error);
                        return null;
                    }
                }));
                setFriends(friendDetails.filter(Boolean));
            } catch (error) {
                console.error("Failed to load user", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchLists = async () => {
            setListsLoading(true);
            try {
                const response = await getUserListsAPI(targetUserId, 1, 20);
                setLists(response?.lists || []);
            } catch (error) {
                console.error("Failed to load lists", error);
            } finally {
                setListsLoading(false);
            }
        };

        if (targetUserId) {
            fetchUser();
            fetchLists();
            refreshNotifications();
        }
    }, [targetUserId, refreshNotifications]);

    const normalizeId = useCallback((value) => {
        if (!value) return null;
        if (typeof value === "object") {
            if (value._id) return String(value._id);
            if (value.id) return String(value.id);
        }
        return String(value);
    }, []);

    const incomingRequest = useMemo(() => {
        return notifications
            .filter((n) => n?.type === "friendRequest")
            .map((n) => {
                const receiverId = normalizeId(n?.receiver || n?.receiverId || n?.toUserId || n?.to);
                const senderId = normalizeId(n?.sender || n?.senderId || n?.fromUserId || n?.from);
                const requestId = normalizeId(n?.requestId || n?._id || n?.id);
                return { receiverId, senderId, requestId };
            })
            .find(
                ({ receiverId, senderId }) =>
                    receiverId === normalizeId(loggedInUserId) && senderId === normalizeId(targetUserId)
            );
    }, [notifications, normalizeId, loggedInUserId, targetUserId]);

    const outgoingRequest = useMemo(() => {
        return notifications
            .filter((n) => n?.type === "friendRequest")
            .map((n) => {
                const receiverId = normalizeId(n?.receiver || n?.receiverId || n?.toUserId || n?.to);
                const senderId = normalizeId(n?.sender || n?.senderId || n?.fromUserId || n?.from);
                return { receiverId, senderId };
            })
            .find(
                ({ receiverId, senderId }) =>
                    senderId === normalizeId(loggedInUserId) && receiverId === normalizeId(targetUserId)
            );
    }, [notifications, normalizeId, loggedInUserId, targetUserId]);

    const friendStatus = useMemo(() => {
        if (!user || !loggedInUserId) return "unknown";
        if (viewingOwnProfile) return "self";
        if (friendAction === "sent") return "outgoing";

        const friendsArray = user.friends || [];
        const isFriend = friendsArray.some((id) => normalizeId(id) === normalizeId(loggedInUserId));
        if (isFriend) return "friends";
        if (incomingRequest) return "pending";
        if (outgoingRequest) return "outgoing";
        return "none";
    }, [user, loggedInUserId, viewingOwnProfile, normalizeId, incomingRequest, outgoingRequest, friendAction]);

    const handleAddFriend = async () => {
        if (!targetUserId) return;
        setFriendAction("pending");
        try {
            await sendFriendRequestAPI(targetUserId);
            setFriendAction("sent");
        } catch (error) {
            console.error("Failed to send friend request", error);
            setFriendAction("idle");
        }
    };

    const handleAccept = async () => {
        if (!incomingRequest?.requestId) return;
        setFriendAction("accepting");
        try {
            await acceptFriendRequestAPI(incomingRequest.requestId);
            setUser((prev) => ({ ...prev, friends: [...(prev?.friends || []), loggedInUserId] }));
            refreshNotifications();
        } catch (error) {
            console.error("Failed to accept friend", error);
        } finally {
            setFriendAction("idle");
        }
    };

    const handleDecline = async () => {
        if (!incomingRequest?.requestId) return;
        setFriendAction("declining");
        try {
            await declineFriendRequestAPI(incomingRequest.requestId);
            refreshNotifications();
        } catch (error) {
            console.error("Failed to decline friend", error);
        } finally {
            setFriendAction("idle");
        }
    };

    const handleRemoveFriend = async () => {
        if (!targetUserId) return;
        setFriendAction("removing");
        try {
            await removeFriendAPI(targetUserId);
            setUser((prev) => ({ ...prev, friends: (prev?.friends || []).filter((id) => id !== loggedInUserId) }));
        } catch (error) {
            console.error("Failed to remove friend", error);
        } finally {
            setFriendAction("idle");
        }
    };

    const handleLogout = async () => {
        try {
            await logoutAPI();
            deleteCookie("user");
            localStorage.removeItem("user");
            navigate("/");
        } catch (error) {
            console.error("Failed to logout", error);
        }
    };

    const renderFriendButton = () => {
        if (friendStatus === "self") return null;
        if (friendStatus === "friends") {
            return (
                <button className="remove-friend" onClick={handleRemoveFriend} disabled={friendAction !== "idle"}>
                    {friendAction === "removing" ? "Removing..." : "Remove Friend"}
                </button>
            );
        }
        if (friendStatus === "pending") {
            return (
                <div className="pending-actions">
                    <button className="secondary-button" onClick={handleDecline} disabled={friendAction !== "idle" && friendAction !== "declining"}>
                        {friendAction === "declining" ? "Declining..." : "Decline"}
                    </button>
                    <button className="primary-button" onClick={handleAccept} disabled={friendAction !== "idle" && friendAction !== "accepting"}>
                        {friendAction === "accepting" ? "Accepting..." : "Accept"}
                    </button>
                </div>
            );
        }
        if (friendStatus === "outgoing") {
            return (
                <button className="secondary-button" disabled>
                    Pending
                </button>
            );
        }

        return (
            <button className="primary-button" onClick={handleAddFriend} disabled={friendAction !== "idle"}>
                {friendAction === "pending" ? "Pending..." : "Add Friend"}
            </button>
        );
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="user-info">
                    <div className="avatar">
                        <img src={user?.profilePic || user?.profilePicture || defaultAvatar} alt={`${user?.username || "User"} avatar`} />
                    </div>
                    <div className="user-meta">
                        <h2>{user?.username || "User"}</h2>
                        <p className="muted">@{(user?.username || "user").toLowerCase()}</p>
                        {loading && <p className="muted small">Loading profile...</p>}
                    </div>
                </div>
                <div className="header-actions">
                    {!viewingOwnProfile && renderFriendButton()}
                    {viewingOwnProfile && (
                        <button className="secondary-button" onClick={handleLogout}>
                            Logout
                        </button>
                    )}
                </div>
            </div>

            <div className="friends-section">
                <button className="friends-toggle" onClick={() => setFriendsOpen((prev) => !prev)}>
                    <div>
                        <p className="eyebrow">Friends</p>
                        <h3>{friends.length} {friends.length === 1 ? "friend" : "friends"}</h3>
                    </div>
                    {friendsOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </button>
                {friendsOpen && (
                    <div className="friends-list">
                        {friends.map((friend) => (
                            <div className="friend-row" key={friend._id}>
                                <div className="friend-avatar">
                                    <img src={friend.profilePic || friend.profilePicture || defaultAvatar} alt={`${friend.username} avatar`} />
                                </div>
                                <div className="friend-name">{friend.username}</div>
                            </div>
                        ))}
                        {friends.length === 0 && !loading && <p className="muted">No friends yet.</p>}
                        {friends.length === 0 && loading && <p className="muted">Loading friends...</p>}
                    </div>
                )}
            </div>

            <div className="lists-section">
                <div className="section-header">
                    <h3>{viewingOwnProfile ? "My Lists" : `${user?.username || "User"}'s Lists`}</h3>
                    {listsLoading && <p className="muted">Loading...</p>}
                </div>
                <div className="lists-grid">
                    {lists.map((list) => (
                        <List key={list._id || list.title} list={list} />
                    ))}
                </div>
                {!listsLoading && lists.length === 0 && <p className="muted">No lists yet.</p>}
            </div>
        </div>
    );
};

export default Profile;
