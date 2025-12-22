import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import "../css/NavigationBar.css"; 
import { IoIosCheckmarkCircle } from "react-icons/io";
import { BsLink } from "react-icons/bs";
import { FaBell } from "react-icons/fa";
import { IoIosSend, IoIosSearch } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setNotifications } from "../../store/notificationsSlice.js";
import { acceptFriendRequestAPI, declineFriendRequestAPI, getAllNotificationsAPI } from "../../backend/apis.js";
import { useNavigate } from "react-router-dom";
import { getUserId } from "../../backend/apis.js";

const NavigationBar = ({ setPage, page, onNotificationsUpdated = async () => {} }) => {

    const [showFriendRequests, setShowFriendRequests] = useState(false);
    const [showShares, setShowShares] = useState(false);
    const notifications = useSelector((state) => state.notifications.items);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const sharesRef = useRef(null);
    const loggedInUserId = getUserId();

    const refreshNotifications = useCallback(async () => {
        if (onNotificationsUpdated) {
            await onNotificationsUpdated();
            return;
        }
        try {
            const response = await getAllNotificationsAPI();
            if (response?.notifications) {
                dispatch(setNotifications(response.notifications));
            }
        } catch (error) {
            console.error("Failed to refresh notifications", error);
        }
    }, [dispatch, onNotificationsUpdated]);

    const friendRequestNotifications = useMemo(
        () => notifications.filter((notification) => notification?.type === "friendRequest"),
        [notifications]
    );

    const shareNotifications = useMemo(
        () => notifications.filter((notification) => notification?.type === "share"),
        [notifications]
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

    const normalizeId = (value) => {
        if (!value) return null;
        if (typeof value === "object") {
            if (value._id) return String(value._id);
            if (value.id) return String(value.id);
        }
        return String(value);
    };

    const getNotificationUser = (notification) =>
        notification?.sender || notification?.user || notification?.from || notification?.fromUser || notification?.actor || {};

    const getNotificationRequestId = (notification) =>
        notification?.requestId || notification?._id || notification?.id;

    const getNotificationListId = (notification) =>
        notification?.listId
        || notification?.list?.id
        || notification?.list?._id
        || notification?.list?._id
        || notification?.list?.listId;

    const getListTitle = (notification) =>
        notification?.listTitle
        || notification?.list?.title
        || notification?.title
        || "View list";

    const isForLoggedInUser = useCallback((notification) => {
        if (!loggedInUserId) return false;
        const receiverId = normalizeId(
            notification?.receiver?._id
            || notification?.receiverId
            || notification?.to
            || notification?.toUserId
            || notification?.user?._id
            || notification?.userId
        );
        return receiverId && receiverId.toString() === normalizeId(loggedInUserId)?.toString();
    }, [loggedInUserId]);

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

    return (
        <div className="navigation-bar">
            <div className={'logo-container'}>
                <h2>Topx</h2>
            </div>
            <div className="navigation-container">
                <div onClick={() => setPage("myLists")} className={`navigation-element ${page === "friends" && "underline" }`}>
                    <IoIosCheckmarkCircle color="white" size={25} />
                    <h2>My lists</h2>
                </div>
                <div onClick={() => setPage("friendsLists")} className={`navigation-element ${page === "feed" && "underline" }`}>
                    <BsLink color="white" size={40} />
                    <h2>Friend lists</h2>
                </div>
                <input className="search-lists" placeholder="Search lists" type="text" />
                <IoIosSearch className="search-lists-icon" size={20} color="#FF6B6B"/>
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
                                    const user = getNotificationUser(notification);
                                    const username = user?.username || user?.name || "Unknown user";
                                    const avatar = user?.profilePicture || user?.profilePic || user?.avatar;
                                    const requestId = getNotificationRequestId(notification);
                                    return (
                                        <div key={requestId || username} className="notification-item">
                                            <div className="notification-user">
                                                <div className="notification-avatar">
                                                    {avatar ? <img src={avatar} alt={username} /> : <div className="avatar-placeholder" />}
                                                </div>
                                                <div className="notification-meta">
                                                    <p className="notification-title">{username}</p>
                                                    <p className="notification-subtitle">sent you a friend request</p>
                                                </div>
                                            </div>
                                            <div className="notification-actions">
                                                <button className="secondary-button stacked" onClick={() => handleFriendRequestAction(notification, "accept")}>Accept</button>
                                                <button className="decline-button stacked" onClick={() => handleFriendRequestAction(notification, "decline")}>Decline</button>
                                            </div>
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
                                    const user = getNotificationUser(notification);
                                    const username = user?.username || user?.name || "Unknown user";
                                    const avatar = user?.profilePicture || user?.profilePic || user?.avatar;
                                    const listTitle = getListTitle(notification);
                                    const notificationId = getNotificationRequestId(notification) || listTitle;
                                    return (
                                        <button type="button" key={notificationId} className="notification-item share-item" onClick={() => handleNavigateToList(notification)}>
                                            <div className="notification-user">
                                                <div className="notification-avatar">
                                                    {avatar ? <img src={avatar} alt={username} /> : <div className="avatar-placeholder" />}
                                                </div>
                                                <div className="notification-meta">
                                                    <p className="notification-title">{username}</p>
                                                    <p className="notification-subtitle">shared “{listTitle}” with you</p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
                <div onClick={() => alert("profile")} className="profile-button">
                    <MdAccountCircle color="white" size={25}/>
                </div>
            </div>

        </div>
    )
}

export default NavigationBar;
