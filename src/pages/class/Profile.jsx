import "../css/Profile.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    acceptFriendRequestAPI,
    declineFriendRequestAPI,
    deleteCookie,
    getAllNotificationsAPI,
    getBlockedUsersAPI,
    uploadProfilePictureAPI,
    getUserByIdAPI,
    getUserId,
    getUserListsAPI,
    logoutAPI,
    removeFriendAPI,
    sendFriendRequestAPI,
    toggleBlockUserAPI
} from "../../backend/apis.js";
import List from "../../components/class/List.jsx";
import defaultAvatar from "../../assets/icons/User Icon.png";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FiMoreVertical, FiUploadCloud } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { setNotifications } from "../../store/notificationsSlice.js";
import { setBlockedUsers } from "../../store/blockedUsersSlice.js";

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId: routeUserId } = useParams();

    const dispatch = useDispatch();
    const notifications = useSelector((state) => state.notifications.items);
    const blockedUsers = useSelector((state) => state.blockedUsers.items);
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
    const [friendSearch, setFriendSearch] = useState("");
    const [blockedOpen, setBlockedOpen] = useState(false);
    const [blockedSearch, setBlockedSearch] = useState("");
    const [blockedUserDetails, setBlockedUserDetails] = useState({});
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listsLoading, setListsLoading] = useState(true);
    const [friendAction, setFriendAction] = useState("idle");
    const [blocking, setBlocking] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const friendsMenuRef = useRef(null);
    const blockedMenuRef = useRef(null);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const refreshNotifications = useCallback(async () => {
        try {
            const [notificationsResponse, blockedResponse] = await Promise.all([
                getAllNotificationsAPI(),
                getBlockedUsersAPI(),
            ]);
            if (notificationsResponse?.notifications) {
                dispatch(setNotifications(notificationsResponse.notifications));
            }
            if (blockedResponse?.blockedUsers) {
                dispatch(setBlockedUsers(blockedResponse.blockedUsers));
            }
        } catch (error) {
            console.error("Failed to refresh notifications or blocked users", error);
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

    // Fetch details for blocked users (only on own profile)
    useEffect(() => {
        if (!viewingOwnProfile || !blockedUsers?.length) return;
        const toFetch = blockedUsers
            .map(u => typeof u === 'object' ? String(u._id || u.id) : String(u))
            .filter(id => id && !blockedUserDetails[id]);
        if (!toFetch.length) return;
        Promise.all(toFetch.map(async (id) => {
            try {
                const res = await getUserByIdAPI(id);
                return [id, res?.user || res];
            } catch { return [id, null]; }
        })).then(entries => {
            const next = {};
            entries.forEach(([id, data]) => { if (data) next[id] = data; });
            setBlockedUserDetails(prev => ({ ...prev, ...next }));
        });
    }, [blockedUsers, viewingOwnProfile]);

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

    const blockedSet = useMemo(() => new Set((blockedUsers || []).map((u) => {
        if (!u) return null;
        if (typeof u === "object") return String(u._id || u.id);
        return String(u);
    }).filter(Boolean)), [blockedUsers]);

    const isBlocked = useMemo(() => blockedSet.has(String(targetUserId)), [blockedSet, targetUserId]);

    const handleToggleBlock = async () => {
        if (!targetUserId || !loggedInUserId) return;
        setBlocking(true);
        try {
            const wasBlocked = isBlocked;
            const response = await toggleBlockUserAPI(loggedInUserId, targetUserId);
            if (response?.blockedUsers) {
                dispatch(setBlockedUsers(response.blockedUsers));
            } else {
                const current = Array.isArray(blockedUsers) ? blockedUsers : [];
                if (wasBlocked) {
                    dispatch(setBlockedUsers(current.filter((id) => String(id) !== String(targetUserId))));
                } else {
                    dispatch(setBlockedUsers([...current, targetUserId]));
                }
            }
            // When blocking, also remove friend relationship
            if (!wasBlocked && friendStatus === "friends") {
                try { await removeFriendAPI(targetUserId); } catch {}
                setUser((prev) => ({ ...prev, friends: (prev?.friends || []).filter((id) => String(id) !== String(loggedInUserId)) }));
                setFriends((prev) => prev.filter(f => String(f._id || f.id) !== String(targetUserId)));
            }
        } catch (error) {
            console.error("Failed to toggle block status", error);
        } finally {
            setBlocking(false);
            setMenuOpen(false);
        }
    };

    const handleOpenFriendProfile = (friendId) => {
        if (!friendId) return;
        setFriendsOpen(false);
        navigate(`/profile/${friendId}`);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
            if (friendsOpen && friendsMenuRef.current && !friendsMenuRef.current.contains(event.target)) {
                setFriendsOpen(false);
            }
            if (blockedOpen && blockedMenuRef.current && !blockedMenuRef.current.contains(event.target)) {
                setBlockedOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen, friendsOpen, blockedOpen]);

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

    const handleOpenList = (listId) => {
        if (!listId) return;
        navigate(`/list/${listId}`, { state: { owner: user, ownerId: targetUserId } });
    };

    const handleAvatarClick = () => {
        if (!viewingOwnProfile) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const response = await uploadProfilePictureAPI(file);
            if (response?.imageUrl) {
                setUser((prev) => {
                    const nextUser = { ...(prev || {}), profilePic: response.imageUrl, profilePicture: response.imageUrl };
                    const stored = localStorage.getItem("user");
                    if (stored) {
                        try {
                            const parsed = JSON.parse(stored);
                            const updated = { ...parsed, profilePic: response.imageUrl, profilePicture: response.imageUrl };
                            localStorage.setItem("user", JSON.stringify(updated));
                        } catch (error) {
                            console.error("Failed to update local user cache", error);
                        }
                    }
                    return nextUser;
                });
            } else {
                console.error("Upload did not return an imageUrl", response);
            }
        } catch (error) {
            console.error("Failed to upload profile picture", error);
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-header-inner">
                    <div className="avatar-wrapper">
                        <div className="avatar hero-avatar">
                            <img src={user?.profilePic || user?.profilePicture || defaultAvatar} alt={`${user?.username || "User"} avatar`} />
                        </div>
                        {viewingOwnProfile && (
                            <>
                                <button
                                    type="button"
                                    className="upload-indicator"
                                    onClick={handleAvatarClick}
                                    disabled={uploading}
                                    aria-label="Upload profile picture"
                                >
                                    <FiUploadCloud size={18} />
                                    <span>{uploading ? "Uploading..." : "Upload"}</span>
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden-file-input"
                                    onChange={handleFileChange}
                                />
                            </>
                        )}
                    </div>
                    <div className="user-meta hero-meta">
                        <h2>{user?.username || "User"}</h2>
                        <p className="muted">@{(user?.username || "user").toLowerCase()}</p>
                        {loading && <p className="muted small">Loading profile...</p>}
                    </div>
                    <div className="profile-actions">
                        {!viewingOwnProfile && renderFriendButton()}
                    </div>
                    <div className="friends-indicator-wrapper" ref={friendsMenuRef}>
                        <button className="friends-indicator" onClick={() => { setFriendsOpen((prev) => !prev); setFriendSearch(""); }}>
                            {friends.length} {friends.length === 1 ? "friend" : "friends"}
                            {friendsOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                        </button>
                        {friendsOpen && (
                            <div className="friends-dropdown">
                                {friends.length > 0 && (
                                    <>
                                        <input
                                            className="friends-search-input"
                                            type="text"
                                            placeholder="Search friends..."
                                            value={friendSearch}
                                            onChange={(e) => setFriendSearch(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="friends-dropdown-list">
                                            {friends
                                                .filter((f) => (f.username || "").toLowerCase().includes(friendSearch.toLowerCase()))
                                                .map((friend) => (
                                                    <button
                                                        className="friend-dropdown-item"
                                                        key={friend._id}
                                                        onClick={() => handleOpenFriendProfile(friend._id || friend.id)}
                                                    >
                                                        <div className="friend-avatar small">
                                                            <img src={friend.profilePic || friend.profilePicture || defaultAvatar} alt={`${friend.username} avatar`} />
                                                        </div>
                                                        <span className="friend-name">{friend.username}</span>
                                                    </button>
                                                ))}
                                            {friends.filter((f) => (f.username || "").toLowerCase().includes(friendSearch.toLowerCase())).length === 0 && (
                                                <p className="muted no-friends">No matches found.</p>
                                            )}
                                        </div>
                                    </>
                                )}
                                {friends.length === 0 && !loading && <p className="muted no-friends">No friends yet.</p>}
                                {friends.length === 0 && loading && <p className="muted no-friends">Loading friends...</p>}
                            </div>
                        )}
                    </div>
                    {viewingOwnProfile && blockedUsers && blockedUsers.length > 0 && (
                        <div className="friends-indicator-wrapper" ref={blockedMenuRef}>
                            <button className="friends-indicator blocked-indicator" onClick={() => { setBlockedOpen(prev => !prev); setBlockedSearch(""); }}>
                                {blockedUsers.length} blocked {blockedUsers.length === 1 ? "user" : "users"}
                                {blockedOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                            </button>
                            {blockedOpen && (
                                <div className="friends-dropdown">
                                    {blockedUsers.length > 3 && (
                                        <input
                                            className="friends-search-input"
                                            type="text"
                                            placeholder="Search blocked users..."
                                            value={blockedSearch}
                                            onChange={(e) => setBlockedSearch(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    )}
                                    <div className="friends-dropdown-list">
                                        {(blockedUsers || [])
                                            .map(u => typeof u === 'object' ? String(u._id || u.id) : String(u))
                                            .filter(id => {
                                                const detail = blockedUserDetails[id];
                                                const name = detail?.username || id;
                                                return name.toLowerCase().includes(blockedSearch.toLowerCase());
                                            })
                                            .map((id) => {
                                                const detail = blockedUserDetails[id];
                                                return (
                                                    <div key={id} className="friend-dropdown-item blocked-user-item">
                                                        <div className="friend-avatar small">
                                                            <img src={detail?.profilePic || detail?.profilePicture || defaultAvatar} alt="avatar" />
                                                        </div>
                                                        <span className="friend-name">{detail?.username || "User"}</span>
                                                        <button
                                                            className="unblock-btn"
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                try {
                                                                    const res = await toggleBlockUserAPI(loggedInUserId, id);
                                                                    if (res?.blockedUsers) {
                                                                        dispatch(setBlockedUsers(res.blockedUsers));
                                                                    } else {
                                                                        dispatch(setBlockedUsers((blockedUsers || []).filter(u => (typeof u === 'object' ? String(u._id || u.id) : String(u)) !== id)));
                                                                    }
                                                                } catch {}
                                                            }}
                                                        >
                                                            Unblock
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {!viewingOwnProfile && (
                    <div className="profile-menu" ref={menuRef}>
                        <button
                            className="menu-button"
                            aria-label="More actions"
                            onClick={() => setMenuOpen((prev) => !prev)}
                        >
                            <FiMoreVertical size={20} />
                        </button>
                        {menuOpen && (
                            <div className="menu-dropdown">
                                <button
                                    className="menu-item"
                                    onClick={handleToggleBlock}
                                    disabled={blocking}
                                >
                                    {blocking ? "Processing..." : isBlocked ? "Unblock user" : "Block user"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="lists-section">
                <div className="section-header">
                    <h3>{viewingOwnProfile ? "My Lists" : `${user?.username || "User"}'s Lists`}</h3>
                    {listsLoading && <p className="muted">Loading...</p>}
                </div>
                {isBlocked ? (
                    <p className="muted blocked-lists-message">You have blocked this user. <span>Unblock them to see their lists.</span></p>
                ) : (
                    <>
                        <div className="lists-grid">
                            {lists.map((list) => (
                                <List key={list._id || list.title} list={list} owner={viewingOwnProfile ? undefined : user} onClick={() => handleOpenList(list._id || list.id)} />
                            ))}
                        </div>
                        {!listsLoading && lists.length === 0 && <p className="muted">No lists yet.</p>}
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;
