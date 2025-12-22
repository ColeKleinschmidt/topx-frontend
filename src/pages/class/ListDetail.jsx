import "../css/ListDetail.css";
import { useCallback, useEffect, useState } from "react";
import NavigationBar from "../../components/class/NavigationBar.jsx";
import List from "../../components/class/List.jsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setNotifications } from "../../store/notificationsSlice.js";
import { setBlockedUsers } from "../../store/blockedUsersSlice.js";
import { getAllNotificationsAPI, getBlockedUsersAPI, getListAPI, getUserByIdAPI } from "../../backend/apis.js";
import defaultAvatar from "../../assets/icons/User Icon.png";

const ListDetail = () => {
    const { listId } = useParams();
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(null);
    const [owner, setOwner] = useState(null);
    const [ownerLoading, setOwnerLoading] = useState(false);
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

    useEffect(() => {
        refreshNotifications();
    }, [refreshNotifications]);

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
                        {(list.ownerId || owner) && (
                            <button
                                type="button"
                                className="list-owner"
                                onClick={() => navigate(`/profile/${(owner && owner._id) || list.ownerId}`)}
                            >
                                <div className="owner-avatar">
                                    <img src={owner?.profilePic || owner?.profilePicture || defaultAvatar} alt={`${owner?.username || "User"} avatar`} />
                                </div>
                                <div className="owner-meta">
                                    <p className="owner-label">List by</p>
                                    <p className="owner-name">{owner?.username || "View profile"}</p>
                                    {ownerLoading && <span className="owner-loading">Loading user...</span>}
                                </div>
                            </button>
                        )}
                        <List list={list} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListDetail;
