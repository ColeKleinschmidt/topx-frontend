import "../css/ListDetail.css";
import { useCallback, useEffect, useRef, useState } from "react";
import NavigationBar from "../../components/class/NavigationBar.jsx";
import List from "../../components/class/List.jsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setNotifications } from "../../store/notificationsSlice.js";
import { setBlockedUsers } from "../../store/blockedUsersSlice.js";
import { getAllNotificationsAPI, getBlockedUsersAPI, getFriendsAPI, getListAPI, getUserByIdAPI, shareListAPI } from "../../backend/apis.js";
import defaultAvatar from "../../assets/icons/User Icon.png";
import { IoIosSend } from "react-icons/io";

const ListDetail = () => {
    const { listId } = useParams();
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(null);
    const [owner, setOwner] = useState(null);
    const [ownerLoading, setOwnerLoading] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [friends, setFriends] = useState([]);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [friendsError, setFriendsError] = useState(null);
    const [selectedFriends, setSelectedFriends] = useState({});
    const [shareStatus, setShareStatus] = useState({ state: "idle", message: "" });
    const shareRef = useRef(null);
    const location = useLocation();
    const navigationOwner = location.state?.owner;
    const navigationOwnerId = location.state?.ownerId || navigationOwner?._id || navigationOwner?.id;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleNavigate = (targetPage) => {
        setPage(targetPage);
        navigate(`/${targetPage}`);
    };

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
        } catch (err) {
            console.error("Failed to refresh notifications or blocked users", err);
        }
    }, [dispatch]);

    const resolveOwnerId = useCallback((listData) => {
        const candidates = [
            listData?.userId,
            listData?.user?._id,
            listData?.user?.id,
            listData?.user,
            listData?.ownerId,
            listData?.owner?._id,
            listData?.owner?.id,
            listData?.owner,
            listData?.creatorId,
            navigationOwnerId,
        ];
        const ownerCandidate = candidates.find(Boolean);
        if (ownerCandidate && typeof ownerCandidate === "object") {
            return ownerCandidate._id || ownerCandidate.id || null;
        }
        return ownerCandidate || null;
    }, [navigationOwnerId]);

    const normalizeFriendId = useCallback((friend) => {
        if (!friend) return null;
        if (typeof friend === "string") return friend;
        return (
            friend._id ||
            friend.id ||
            friend.userId ||
            friend.friendId ||
            friend?.friend?._id ||
            friend?.friend?.id ||
            friend?.friend?.userId ||
            friend?.user?._id ||
            friend?.user?.id ||
            friend?.user?.userId ||
            null
        );
    }, []);

    const normalizeFriendData = useCallback((friend) => {
        const friendId = normalizeFriendId(friend);
        if (!friendId) return null;
        const base = typeof friend === "object" ? friend : {};
        const candidateUser =
            base.user ||
            base.friend ||
            base.profile ||
            base.owner ||
            null;

        const username =
            base.username ||
            base.name ||
            candidateUser?.username ||
            candidateUser?.name ||
            base.displayName ||
            null;

        const profilePicture =
            base.profilePic ||
            base.profilePicture ||
            candidateUser?.profilePic ||
            candidateUser?.profilePicture ||
            candidateUser?.avatar ||
            base.avatar ||
            null;

        const email = base.email || candidateUser?.email || null;

        return {
            ...base,
            _id: friendId,
            username,
            profilePic: profilePicture,
            email,
        };
    }, [normalizeFriendId]);

    const fetchFriends = useCallback(async () => {
        setFriendsLoading(true);
        setFriendsError(null);
        try {
            const response = await getFriendsAPI();
            const rawFriends = response?.friends || response?.data || response || [];
            const friendArray = Array.isArray(rawFriends) ? rawFriends : rawFriends?.friends || [];
            const normalizedFriends = friendArray
                .map((friend) => normalizeFriendData(friend))
                .filter(Boolean);
            setFriends(normalizedFriends);
        } catch (err) {
            console.error("Failed to load friends", err);
            setFriendsError("Unable to load friends right now.");
        } finally {
            setFriendsLoading(false);
        }
    }, [normalizeFriendData]);

    useEffect(() => {
        refreshNotifications();
    }, [refreshNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shareRef.current && !shareRef.current.contains(event.target)) {
                setShareOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchList = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getListAPI(listId);
                const notFoundMessage =
                    typeof response?.message === "string" &&
                    response.message.toLowerCase().includes("could not find list");

                if (notFoundMessage) {
                    throw new Error("LIST_NOT_FOUND");
                }

                const listData = response?.list || response?.data || response;
                if (!listData || Object.keys(listData).length === 0) {
                    throw new Error("LIST_NOT_FOUND");
                }
                const items = listData?.items || listData?.listItems || [];
                const ownerId = resolveOwnerId(listData);
                setList({
                    _id: listData?._id || listData?.id || listId,
                    title: listData?.title || listData?.name || "Untitled list",
                    ownerId,
                    items,
                });

                if (navigationOwner) {
                    setOwner(navigationOwner);
                } else if (ownerId) {
                    setOwnerLoading(true);
                    try {
                        const ownerResponse = await getUserByIdAPI(ownerId);
                        const ownerData = ownerResponse?.user || ownerResponse;
                        setOwner(ownerData || null);
                    } catch (ownerError) {
                        console.error("Failed to load list owner", ownerError);
                        setOwner(null);
                    } finally {
                        setOwnerLoading(false);
                    }
                } else {
                    setOwner(null);
                }
            } catch (err) {
                console.error("Failed to load list", err);
                setList(null);
                setError("Sorry, this list couldn't be found.");
            } finally {
                setLoading(false);
            }
        };

        if (listId) {
            fetchList();
        }
    }, [listId, resolveOwnerId, navigationOwner]);

    const toggleShareDropdown = () => {
        setShareStatus({ state: "idle", message: "" });
        setShareOpen((prev) => {
            const nextOpen = !prev;
            if (nextOpen && !friendsLoading && friends.length === 0 && !friendsError) {
                fetchFriends();
            }
            return nextOpen;
        });
    };

    const toggleFriendSelection = (friendId) => {
        if (!friendId) return;
        setSelectedFriends((prev) => ({ ...prev, [friendId]: !prev[friendId] }));
    };

    const handleShareList = async () => {
        const listIdentifier = list?._id || list?.id || listId;
        if (!listIdentifier) return;
        const chosenFriends = Object.entries(selectedFriends)
            .filter(([, isSelected]) => isSelected)
            .map(([friendId]) => friendId)
            .filter(Boolean);

        if (chosenFriends.length === 0) {
            setShareStatus({ state: "error", message: "Select at least one friend." });
            return;
        }

        setShareStatus({ state: "pending", message: "" });
        try {
            const results = await Promise.allSettled(chosenFriends.map(async (friendId) => {
                console.log("Sharing list with friend:", friendId);
                const response = await shareListAPI(friendId, listIdentifier);
                const errorMessage = response?.error || response?.message;
                if (response === null || response === undefined || (typeof errorMessage === "string" && errorMessage.toLowerCase().includes("error"))) {
                    throw new Error(errorMessage || "Share failed");
                }
                return response;
            }));
            const failures = results.filter((result) => result.status === "rejected");
            console.log("Share results:", results, "Failures:", failures);
            if (failures.length === 0) {
                setShareStatus({ state: "success", message: "Shared with selected friends." });
            } else if (failures.length < chosenFriends.length) {
                setShareStatus({ state: "partial", message: "Shared with some friends. Please try again for the rest." });
            } else {
                setShareStatus({ state: "error", message: "Unable to share the list right now." });
            }
        } catch (error) {
            console.error("Failed to share list", error);
            setShareStatus({ state: "error", message: "Unable to share the list right now." });
        }
    };

    return (
        <div className="home-container">
            <NavigationBar setPage={handleNavigate} page={page} onNotificationsUpdated={refreshNotifications} />
            <div className="home-content list-detail-content">
                {loading && <p className="list-detail-status">Loading list...</p>}
                {error && !loading && (
                    <div className="list-detail-error">
                        <h2>Sorry, this list couldn&apos;t be found.</h2>
                        <p>Please check the link and try again.</p>
                    </div>
                )}
                {!loading && !error && list && (
                    <div className="list-detail-wrapper">
                        <div className="list-share-card">
                            {(list.ownerId || owner) && (
                                <div
                                    type="button"
                                    className="list-owner"
                                    onClick={() => navigate(`/profile/${(owner && owner._id) || list.ownerId}`)}
                                >
                                    <div className="owner-avatar">
                                        <img src={owner?.profilePic || owner?.profilePicture || defaultAvatar} alt={`${owner?.username || "User"} avatar`} />
                                    </div>
                                    <div className="owner-meta">
                                        <p className="owner-label">Author</p>
                                        <p className="owner-name">{owner?.username || "View profile"}</p>
                                        {ownerLoading && <span className="owner-loading">Loading user...</span>}
                                    </div>
                                </div>
                            )}
                            <List list={list} />
                        </div>
                        <div className="share-dropdown-wrapper" ref={shareRef}>
                            <div type="button" className="share-list-button" onClick={toggleShareDropdown} aria-expanded={shareOpen} aria-haspopup="true">
                                <IoIosSend size={30} color="black"/>
                            </div>
                            {shareOpen && (
                                <div className="share-dropdown">
                                    <div className="share-dropdown-header">
                                        <p>Share this list</p>
                                    </div>
                                    {friendsLoading && <p className="share-dropdown-status">Loading friends...</p>}
                                    {!friendsLoading && friendsError && <p className="share-dropdown-status error">{friendsError}</p>}
                                    {!friendsLoading && !friendsError && friends.length === 0 && (
                                        <p className="share-dropdown-status">No friends available to share with yet.</p>
                                    )}
                                    {!friendsLoading && !friendsError && friends.length > 0 && (
                                        <div className="share-friends-list">
                                            {friends.map((friend) => {
                                                const friendId = friend?._id || friend?.id;
                                                const isSelected = Boolean(friendId && selectedFriends[friendId]);
                                                return (
                                                    <label key={friendId || friend?.username} className={`share-friend-option ${isSelected ? "selected" : ""}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleFriendSelection(friendId)}
                                                        />
                                                        <div className="share-friend-avatar">
                                                            <img src={friend?.profilePic || friend?.profilePicture || defaultAvatar} alt={friend?.username || "Friend"} />
                                                        </div>
                                                        <div className="share-friend-meta">
                                                            <p className="share-friend-name">{friend?.username || friend?.name || "Friend"}</p>
                                                            {friend?.email && <span className="share-friend-subtext">{friend.email}</span>}
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div className="share-dropdown-footer">
                                        <button
                                            type="button"
                                            className="share-action"
                                            onClick={handleShareList}
                                            disabled={shareStatus.state === "pending" || friends.length === 0 || friendsLoading}
                                        >
                                            {shareStatus.state === "pending" ? "Sharing..." : "Share"}
                                        </button>
                                        {shareStatus.message && (
                                            <p className={`share-dropdown-status ${shareStatus.state}`}>
                                                {shareStatus.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListDetail;
