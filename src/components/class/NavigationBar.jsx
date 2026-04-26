import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import "../css/NavigationBar.css"; 
import { IoIosCheckmarkCircle } from "react-icons/io";
import { BsLink } from "react-icons/bs";
import { IoIosSend, IoIosSearch } from "react-icons/io";
import { MdAccountCircle, MdOutlineExplore } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { removeNotification, setNotifications } from "../../store/notificationsSlice.js";
import { setBlockedUsers } from "../../store/blockedUsersSlice.js";
import { acceptFriendRequestAPI, declineFriendRequestAPI, getAllNotificationsAPI, getBlockedUsersAPI, getListAPI, getUserByIdAPI, logoutAPI } from "../../backend/apis.js";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserId } from "../../backend/apis.js";
import { removeNotificationAPI } from "../../backend/apis.js";
import topXlogo from "../../assets/images/topxlogo.webp";

const NavigationBar = ({ setPage, page, onNotificationsUpdated = async () => {} }) => {

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeSection, setActiveSection] = useState(null); // 'notifications' | 'shares' | null
    const notifications = useSelector((state) => state.notifications.items);
    const blockedUsers = useSelector((state) => state.blockedUsers.items);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const profileMenuRef = useRef(null);
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
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
                setActiveSection(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const preventScroll = (e) => {
            if (e.target.closest('.profile-menu-dropdown') || e.target.closest('.profile-section-content')) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        let scrollHandler;
        
        if (showProfileMenu) {
            const scrollY = window.scrollY;
            scrollHandler = () => { window.scrollTo(0, scrollY); };
            window.addEventListener('wheel', preventScroll, { passive: false });
            window.addEventListener('touchmove', preventScroll, { passive: false });
            window.addEventListener('scroll', scrollHandler);
        } else {
            window.removeEventListener('wheel', preventScroll);
            window.removeEventListener('touchmove', preventScroll);
        }
        
        return () => {
            window.removeEventListener('wheel', preventScroll);
            window.removeEventListener('touchmove', preventScroll);
            if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
        };
    }, [showProfileMenu]);


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
        setShowProfileMenu(false);
        setActiveSection(null);
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
        if (activeSection === 'notifications') {
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
    }, [activeSection, friendRequestNotifications, ensureUserLoaded, isForLoggedInUser, normalizeId]);

    useEffect(() => {
        if (activeSection === 'shares') {
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
    }, [activeSection, shareNotifications, ensureUserLoaded, ensureListLoaded, isForLoggedInUser, normalizeId]);

    const handleLogout = async () => {
        try {
            await logoutAPI();
            document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            localStorage.removeItem("user");
            navigate("/");
        } catch (error) {
            console.error("Failed to logout", error);
        }
    };

    const totalNotifications = friendRequestNotifications.filter(isForLoggedInUser).length
        + shareNotifications.filter(isForLoggedInUser).length;

    return (
        <div className="navigation-bar">
            <div className="nav-content">
                <div className={'logo-container'} onClick={() => { document.activeElement?.blur(); setPage("myLists"); navigate("/myLists"); }} style={{ cursor: 'pointer' }}>
                    <img src={topXlogo} alt="TopX" className="nav-logo" />
                </div>
                <div className="navigation-container">
                    <div onClick={() => { setPage("forYou"); navigate("/forYou"); }} className={`navigation-element ${page === "forYou" ? "underline" : ""}`}>
                        <MdOutlineExplore color="white" size={25} />
                        <h2>For you</h2>
                    </div>
                    <div onClick={() => { setPage("myLists"); navigate("/myLists"); }} className={`navigation-element ${page === "myLists" ? "underline" : ""}`}>
                        <IoIosCheckmarkCircle color="white" size={25} />
                        <h2>My lists</h2>
                    </div>
                    <div onClick={() => { setPage("friendsLists"); navigate("/friendsLists"); }} className={`navigation-element ${page === "friendsLists" ? "underline" : ""}`}>
                        <BsLink color="white" size={25} />
                        <h2>Friend's lists</h2>
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
            <div className="profile-buttons" ref={profileMenuRef}>
                <div
                    className="profile-menu-trigger"
                    onClick={() => {
                        setShowProfileMenu((prev) => {
                            if (!prev) refreshNotifications();
                            return !prev;
                        });
                    }}
                >
                    <MdAccountCircle color="white" size={30}/>
                    {totalNotifications > 0 && (
                        <span className="notification-badge">{totalNotifications}</span>
                    )}
                </div>

                {showProfileMenu && (
                    <div className="profile-menu-dropdown">
                        <button className="profile-menu-item" onClick={() => { setShowProfileMenu(false); setActiveSection(null); setPage("profile"); navigate("/profile"); }}>
                            <MdAccountCircle size={18} />
                            <span>Profile</span>
                        </button>

                        <button
                            className={`profile-menu-item${activeSection === 'notifications' ? ' active' : ''}`}
                            onClick={() => setActiveSection((s) => s === 'notifications' ? null : 'notifications')}
                        >
                            <span className="profile-menu-item-left">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                                <span>Notifications</span>
                            </span>
                            {friendRequestNotifications.filter(isForLoggedInUser).length > 0 && (
                                <span className="profile-menu-badge">{friendRequestNotifications.filter(isForLoggedInUser).length}</span>
                            )}
                        </button>
                        {activeSection === 'notifications' && (
                            <div className="profile-section-content">
                                {friendRequestNotifications.filter(isForLoggedInUser).length === 0 ? (
                                    <p className="notification-empty">No friend requests</p>
                                ) : (
                                    friendRequestNotifications.filter(isForLoggedInUser).map((notification) => {
                                        const senderId = normalizeId(
                                            notification?.sender?._id || notification?.senderId
                                            || notification?.fromUserId || notification?.from || notification?.sender
                                        );
                                        const user = senderId ? userDetails[senderId] : null;
                                        const loadingUser = senderId ? loadingUsers[senderId] : false;
                                        const username = user?.username || user?.name || (loadingUser ? "Loading..." : "Unknown user");
                                        const avatar = user?.profilePicture || user?.profilePic || user?.avatar;
                                        const requestId = getNotificationRequestId(notification);
                                        return (
                                            <div key={requestId || senderId || username} className="notification-item">
                                                <div className="notification-user">
                                                    <div className="notification-avatar">
                                                        {avatar ? <img src={avatar} alt={username} /> : <div className="avatar-placeholder" />}
                                                    </div>
                                                    <div className="notification-meta">
                                                        <p className={`notification-title ${senderId ? 'clickable' : ''}`}
                                                            onClick={(e) => { if (senderId) { e.stopPropagation(); navigate(`/profile/${senderId}`); } }}>
                                                            {username}
                                                        </p>
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

                        <button
                            className={`profile-menu-item${activeSection === 'shares' ? ' active' : ''}`}
                            onClick={() => setActiveSection((s) => s === 'shares' ? null : 'shares')}
                        >
                            <span className="profile-menu-item-left">
                                <IoIosSend size={18} />
                                <span>Shares</span>
                            </span>
                            {shareNotifications.filter(isForLoggedInUser).length > 0 && (
                                <span className="profile-menu-badge">{shareNotifications.filter(isForLoggedInUser).length}</span>
                            )}
                        </button>
                        {activeSection === 'shares' && (
                            <div className="profile-section-content">
                                {shareNotifications.filter(isForLoggedInUser).length === 0 ? (
                                    <p className="notification-empty">No shares yet</p>
                                ) : (
                                    shareNotifications.filter(isForLoggedInUser).map((notification) => {
                                        const senderId = normalizeId(
                                            notification?.sender?._id || notification?.senderId
                                            || notification?.fromUserId || notification?.from || notification?.sender
                                        );
                                        const user = senderId ? userDetails[senderId] : null;
                                        const avatar = user?.profilePicture || user?.profilePic || user?.avatar;
                                        const username = user?.username || user?.name || (loadingUsers[senderId] ? "Loading..." : "Unknown user");
                                        const listId = getNotificationListId(notification);
                                        const list = listId ? listDetails[listId] : null;
                                        const listTitle = list?.title || list?.name || (loadingLists[listId] ? "Loading list..." : getListTitle(notification));
                                        const notificationId = getNotificationRequestId(notification) || listTitle || listId;
                                        return (
                                            <div role="button" tabIndex={0} key={notificationId}
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
                                                            <p className="notification-subtitle">shared &ldquo;{listTitle}&rdquo; with you</p>
                                                        </div>
                                                    </div>
                                                    <button type="button" className="remove-notification-button"
                                                        aria-label="Remove share notification"
                                                        onClick={(event) => handleRemoveShareNotification(event, notification)}>Ã—</button>
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

                        <div className="profile-menu-divider" />

                        <button className="profile-menu-item" onClick={() => {}}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                            <span>Switch account</span>
                        </button>

                        <button className="profile-menu-item danger" onClick={handleLogout}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
            </div>
        </div>
    )
}

export default NavigationBar;

