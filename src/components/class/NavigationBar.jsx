import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import "../css/NavigationBar.css"; 
import { IoIosCheckmarkCircle, IoIosCompass } from "react-icons/io";
import { BsLink } from "react-icons/bs";
import { FaBell } from "react-icons/fa";
import { IoIosSend, IoIosSearch } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { removeNotification, setNotifications } from "../../store/notificationsSlice.js";
import { setBlockedUsers } from "../../store/blockedUsersSlice.js";
import { acceptFriendRequestAPI, declineFriendRequestAPI, getAllNotificationsAPI, getBlockedUsersAPI, getListAPI, getUserByIdAPI } from "../../backend/apis.js";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserId } from "../../backend/apis.js";
import { removeNotificationAPI } from "../../backend/apis.js";

const NavigationBar = ({ setPage, page, onNotificationsUpdated = async () => {} }) => {

    const [showFriendRequests, setShowFriendRequests] = useState(false);
    const [showShares, setShowShares] = useState(false);
    const notifications = useSelector((state) => state.notifications.items);
    const blockedUsers = useSelector((state) => state.blockedUsers.items);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);
    const sharesRef = useRef(null);
    const loggedInUserId = getUserId();
    const [userDetails, setUserDetails] = useState({});
    const [listDetails, setListDetails] = useState({});
    const [loadingUsers, setLoadingUsers] = useState({});
    const [loadingLists, setLoadingLists] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    const refreshNotifications = useCallback(async () => {
        if (onNotificationsUpdated) {
            await onNotificationsUpdated();
            return;
        }
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
            console.error("Failed to refresh notifications", error);
        }
    }, [dispatch, onNotificationsUpdated]);

    const blockedSet = useMemo(() => new Set((blockedUsers || []).map((u) => {
        if (!u) return null;
        if (typeof u === "object") {
            return String(u._id || u.id);
        }
        return String(u);
    }).filter(Boolean)), [blockedUsers]);

    const normalizeId = useCallback((value) => {
        if (!value) return null;
        if (typeof value === "object") {
            if (value._id) return String(value._id);
            if (value.id) return String(value.id);
        }
        return String(value);
    }, []);

    useEffect(() => {
        if (location.pathname !== "/search") {
            setSearchTerm("");
            return;
        }
        const params = new URLSearchParams(location.search);
        setSearchTerm(params.get("q") || "");
    }, [location.pathname, location.search]);

    const handleSearchSubmit = useCallback(() => {
        const trimmed = searchTerm.trim();
        if (!trimmed) return;
        if (setPage) {
            setPage("search");
        }
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }, [navigate, searchTerm, setPage]);

    const handleSearchKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSearchSubmit();
        }
    };

    const friendRequestNotifications = useMemo(
        () => notifications.filter((notification) => {
            if (notification?.type !== "friendRequest") return false;
            const senderId = normalizeId(
                notification?.sender?._id
                || notification?.senderId
                || notification?.fromUserId
                || notification?.from
                || notification?.sender
            );
            return senderId && !blockedSet.has(senderId);
        }),
        [notifications, blockedSet, normalizeId]
    );

    const shareNotifications = useMemo(
        () => notifications.filter((notification) => {
            if (notification?.type !== "share") return false;
            const senderId = normalizeId(
                notification?.sender?._id
                || notification?.senderId
                || notification?.fromUserId
                || notification?.from
                || notification?.sender
            );
            return senderId && !blockedSet.has(senderId);
        }),
        [notifications, blockedSet, normalizeId]
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowFriendRequests(false);
            }
            if (sharesRef.current && !sharesRef.current.contains(event.target)) {
                setShowShares(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const getNotificationRequestId = (notification) =>
        notification._id;

    const getNotificationListId = (notification) =>
        notification.listId;

    const getListTitle = (notification) =>
        notification?.listTitle
        || notification?.list?.title
        || notification?.title
        || "View list";

    const isForLoggedInUser = useCallback((notification) => {
        if (!loggedInUserId) return false;
        const receiverId = notification.receiver;
        return receiverId && receiverId.toString() === normalizeId(loggedInUserId)?.toString();
    }, [loggedInUserId, normalizeId]);

    const handleFriendRequestAction = async (notification, action) => {
        const requestId = getNotificationRequestId(notification);
        if (!requestId) return;
        try {
            if (action === "accept") {
                await acceptFriendRequestAPI(requestId);
            } else {
                await declineFriendRequestAPI(requestId);
            }
            await refreshNotifications();
        } catch (error) {
            console.error(`Failed to ${action} friend request`, error);
        }
    };

    const handleNavigateToList = (notification) => {
        const listId = getNotificationListId(notification);
        if (!listId) return;
        navigate(`/list/${listId}`);
        setShowShares(false);
    };

    const handleRemoveShareNotification = async (event, notification) => {
        event.preventDefault();
        event.stopPropagation();

        const notificationId = getNotificationRequestId(notification);
        if (!notificationId) return;

        try {
            const response = await removeNotificationAPI(notificationId);
            if (response?.success !== false) {
                dispatch(removeNotification(notificationId));
            }
        } catch (error) {
            console.error("Failed to remove share notification", error);
        }
    };

    const handleShareKeyDown = (event, notification) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleNavigateToList(notification);
        }
    };

    const ensureUserLoaded = useCallback(async (userId) => {
        if (!userId || userDetails[userId] || loadingUsers[userId]) return;
        setLoadingUsers((prev) => ({ ...prev, [userId]: true }));
        try {
            const response = await getUserByIdAPI(userId);
            const user = response?.user || response;
            if (user) {
                setUserDetails((prev) => ({ ...prev, [userId]: user }));
            }
        } catch (error) {
            console.error("Failed to load user", error);
        } finally {
            setLoadingUsers((prev) => ({ ...prev, [userId]: false }));
        }
    }, [loadingUsers, userDetails]);

    const ensureListLoaded = useCallback(async (listId) => {
        if (!listId || listDetails[listId] || loadingLists[listId]) return;
        setLoadingLists((prev) => ({ ...prev, [listId]: true }));
        try {
            const response = await getListAPI(listId);
            const list = response?.list || response?.data || response;
            if (list) {
                setListDetails((prev) => ({ ...prev, [listId]: list }));
            }
        } catch (error) {
            console.error("Failed to load list", error);
        } finally {
            setLoadingLists((prev) => ({ ...prev, [listId]: false }));
        }
    }, [listDetails, loadingLists]);

    useEffect(() => {
        if (showFriendRequests) {
            friendRequestNotifications
                .filter(isForLoggedInUser)
                .forEach((notification) => {
                    const senderId = normalizeId(
                        notification?.sender?._id
                        || notification?.senderId
                        || notification?.fromUserId
                        || notification?.from
                        || notification?.sender
                    );
                    if (senderId) {
                        ensureUserLoaded(senderId);
                    }
                });
        }
    }, [showFriendRequests, friendRequestNotifications, ensureUserLoaded, isForLoggedInUser, normalizeId]);

    useEffect(() => {
        if (showShares) {
            shareNotifications
                .filter(isForLoggedInUser)
                .forEach((notification) => {
                    const senderId = normalizeId(
                        notification?.sender?._id
                        || notification?.senderId
                        || notification?.fromUserId
                        || notification?.from
                        || notification?.sender
                    );
                    const listId = getNotificationListId(notification);
                    if (senderId) ensureUserLoaded(senderId);
                    if (listId) ensureListLoaded(listId);
                });
        }
    }, [showShares, shareNotifications, ensureUserLoaded, ensureListLoaded, isForLoggedInUser, normalizeId]);

    return (
        <div className="navigation-bar">
            <div className={'logo-container'}>
                <h2>Topx</h2>
            </div>
            <div className="navigation-container">
                <div onClick={() => setPage("myLists")} className={`navigation-element ${page === "myLists" ? "underline" : ""}`}>
                    <IoIosCheckmarkCircle color="white" size={25} />
                    <h2>My lists</h2>
                </div>
                <div onClick={() => setPage("discoverLists")} className={`navigation-element ${page === "discoverLists" ? "underline" : ""}`}>
                    <IoIosCompass color="white" size={28} />
                    <h2>Discover lists</h2>
                </div>
                <div onClick={() => setPage("friendsLists")} className={`navigation-element ${page === "friendsLists" ? "underline" : ""}`}>
                    <BsLink color="white" size={40} />
                    <h2>Friend lists</h2>
                </div>
                <div className="search-wrapper">
                    <input
                        className="search-lists"
                        placeholder="Search lists"
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />
                    <button
                        type="button"
                        className="search-trigger"
                        aria-label="Search lists"
                        onClick={handleSearchSubmit}
                    >
                        <IoIosSearch className="search-lists-icon" size={20} color="#FF6B6B"/>
                    </button>
                </div>
            </div>
            <div className={'profile-buttons'}> 
                <div className="dropdown-wrapper" ref={dropdownRef}>
                    <div onClick={() => { setShowFriendRequests((prev) => !prev); setShowShares(false); refreshNotifications(); }} className="notifications-button">
                        <FaBell color="white" size={20}/>
                        {friendRequestNotifications.filter(isForLoggedInUser).length > 0 && (
                            <span className="notification-badge">{friendRequestNotifications.filter(isForLoggedInUser).length}</span>
                        )}
                    </div>
                    {showFriendRequests && (
                        <div className="notification-dropdown">
                            {friendRequestNotifications.filter(isForLoggedInUser).length === 0 ? (
                                <p className="notification-empty">No friend requests</p>
                            ) : (
                                friendRequestNotifications.filter(isForLoggedInUser).map((notification) => {
                                    const senderId = normalizeId(
                                        notification?.sender?._id
                                        || notification?.senderId
                                        || notification?.fromUserId
                                        || notification?.from
                                        || notification?.sender
                                    );
                                    const user = senderId ? userDetails[senderId] : null;
                                    const loadingUser = senderId ? loadingUsers[senderId] : false;
                                    const username = user?.username || user?.name || (loadingUser ? "Loading user..." : "Unknown user");
                                    const avatar = user?.profilePicture || user?.profilePic || user?.avatar;
                                    const requestId = getNotificationRequestId(notification);
                                    return (
                                        <div key={requestId || senderId || username} className="notification-item">
                                            <div className="notification-user">
                                                <div className="notification-avatar">
                                                    {avatar ? <img src={avatar} alt={username} /> : <div className="avatar-placeholder" />}
                                                </div>
                                                <div className="notification-meta">
                                                    <p className="notification-title">{username}</p>
                                                    <p className="notification-subtitle">sent you a friend request</p>
                                                </div>
                                            </div>
                                            {loadingUser ? (
                                                <p className="notification-loading">Loading...</p>
                                            ) : (
                                                <div className="notification-actions">
                                                    <button className="secondary-button stacked" onClick={() => handleFriendRequestAction(notification, "accept")}>Accept</button>
                                                    <button className="decline-button stacked" onClick={() => handleFriendRequestAction(notification, "decline")}>Decline</button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
                <div className="dropdown-wrapper" ref={sharesRef}>
                    <div onClick={() => { setShowShares((prev) => !prev); setShowFriendRequests(false); refreshNotifications(); }} className="shared-button">
                        <IoIosSend color="white" size={25}/>
                        {shareNotifications.filter(isForLoggedInUser).length > 0 && (
                            <span className="notification-badge">{shareNotifications.filter(isForLoggedInUser).length}</span>
                        )}
                    </div>
                    {showShares && (
                        <div className="notification-dropdown">
                            {shareNotifications.filter(isForLoggedInUser).length === 0 ? (
                                <p className="notification-empty">No shares yet</p>
                            ) : (
                                shareNotifications.filter(isForLoggedInUser).map((notification) => {
                                    const senderId = normalizeId(
                                        notification?.sender?._id
                                        || notification?.senderId
                                        || notification?.fromUserId
                                        || notification?.from
                                        || notification?.sender
                                    );
                                    const user = senderId ? userDetails[senderId] : null;
                                    const avatar = user?.profilePicture || user?.profilePic || user?.avatar;
                                    const username = user?.username || user?.name || (loadingUsers[senderId] ? "Loading user..." : "Unknown user");
                                    const listId = getNotificationListId(notification);
                                    const list = listId ? listDetails[listId] : null;
                                    const listTitle = list?.title || list?.name || (loadingLists[listId] ? "Loading list..." : getListTitle(notification));
                                    const notificationId = getNotificationRequestId(notification) || listTitle || listId;
                                    return (
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            key={notificationId}
                                            className="notification-item share-item"
                                            onClick={() => handleNavigateToList(notification)}
                                            onKeyDown={(event) => handleShareKeyDown(event, notification)}
                                        >
                                            <div className="share-notification-header">
                                                <div className="notification-user">
                                                    <div className="notification-avatar">
                                                        {avatar ? <img src={avatar} alt={username} /> : <div className="avatar-placeholder" />}
                                                    </div>
                                                    <div className="notification-meta">
                                                        <p className="notification-title">{username}</p>
                                                        <p className="notification-subtitle">shared “{listTitle}” with you</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="remove-notification-button"
                                                    aria-label="Remove share notification"
                                                    onClick={(event) => handleRemoveShareNotification(event, notification)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            {(loadingUsers[senderId] || loadingLists[listId]) && (
                                                <p className="notification-loading">Loading...</p>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
                <div
                    onClick={() => {
                        setShowFriendRequests(false);
                        setShowShares(false);
                        setPage("profile");
                        navigate("/profile");
                    }}
                    className="profile-button"
                >
                    <MdAccountCircle color="white" size={25}/>
                </div>
            </div>

        </div>
    )
}

export default NavigationBar;
