import "../css/ListDetail.css";
import { useCallback, useEffect, useRef, useState } from "react";
import NavigationBar from "../../components/class/NavigationBar.jsx";
import List from "../../components/class/List.jsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setNotifications } from "../../store/notificationsSlice.js";
import { setBlockedUsers } from "../../store/blockedUsersSlice.js";
import { deleteCommentAPI, getAllNotificationsAPI, getBlockedUsersAPI, getFriendsAPI, getListAPI, getUserByIdAPI, postCommentAPI as addCommentAPI, shareListAPI, showCommentsAPI, updateListAPI, getUserId } from "../../backend/apis.js";
import defaultAvatar from "../../assets/icons/User Icon.png";
import { IoIosSend } from "react-icons/io";
import { FiEdit2 } from "react-icons/fi";

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
    const [comments, setComments] = useState([]);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState("");
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [deletingCommentIds, setDeletingCommentIds] = useState({});
    const shareRef = useRef(null);
    const location = useLocation();
    const navigationOwner = location.state?.owner;
    const navigationOwnerId = location.state?.ownerId || navigationOwner?._id || navigationOwner?.id;
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.user.current);
    const [isEditing, setIsEditing] = useState(false);
    const [editedList, setEditedList] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const loggedInUserId = getUserId();
    const normalizedOwnerId = list?.ownerId || navigationOwnerId || owner?._id || owner?.id;
    const isOwner = loggedInUserId && normalizedOwnerId && String(normalizedOwnerId) === String(loggedInUserId);

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

    const normalizeEditableItems = useCallback((items = []) => {
        if (!Array.isArray(items) || items.length === 0) return [{ title: "", image: "" }];
        return items.map((item) => ({
            title: item?.title || item?.name || "",
            image: item?.image || item?.img || item?.url || "",
        }));
    }, []);

    const prepareEditableList = useCallback((baseList) => {
        if (!baseList) return null;
        return {
            title: baseList?.title || baseList?.name || "",
            listItems: normalizeEditableItems(baseList?.items || baseList?.listItems || []),
        };
    }, [normalizeEditableItems]);

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
                    likes: Number(listData?.likes) || 0,
                    comments: Number(listData?.comments) || 0,
                    userHasLiked: Boolean(listData?.userHasLiked),
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

    const hasUnsavedChanges = useCallback(() => {
        if (!isEditing || !editedList || !list) return false;
        const baseline = prepareEditableList(list);
        const titlesMatch = (baseline.title || "").trim() === (editedList.title || "").trim();
        const baselineItems = baseline.listItems || [];
        const editedItems = editedList.listItems || [];
        if (baselineItems.length !== editedItems.length) return true;
        const itemsMatch = baselineItems.every((item, idx) => {
            const candidate = editedItems[idx];
            return (item.title || "").trim() === (candidate?.title || "").trim()
                && (item.image || "") === (candidate?.image || "");
        });
        return !(titlesMatch && itemsMatch);
    }, [editedList, isEditing, list, prepareEditableList]);

    const enterEditMode = () => {
        if (!list) return;
        setEditedList(prepareEditableList(list));
        setIsEditing(true);
        setShareOpen(false);
        setSaveError("");
    };

    const cancelEditMode = useCallback(() => {
        setIsEditing(false);
        setEditedList(null);
        setSaving(false);
        setSaveError("");
    }, []);

    const handleToggleEdit = () => {
        if (!isEditing) {
            enterEditMode();
            return;
        }
        if (hasUnsavedChanges()) {
            const confirmDiscard = window.confirm("You have unsaved changes. If you exit edit mode now, those changes will be lost. Continue?");
            if (!confirmDiscard) return;
        }
        cancelEditMode();
    };

    const hasEmptyItem = editedList?.listItems?.some((item) => !item.title?.trim());
    const canSave = Boolean(
        isEditing &&
        editedList &&
        editedList.title?.trim().length > 0 &&
        editedList.listItems?.length === 10 &&
        !hasEmptyItem
    );

    const handleSaveList = async () => {
        if (!canSave) return;
        setSaving(true);
        setSaveError("");
        const listIdentifier = list?._id || list?.id || listId;
        const payload = {
            title: editedList.title.trim(),
            items: editedList.listItems,
        };
        try {
            const response = await updateListAPI(listIdentifier, payload);
            const potentialError = response?.error || response?.message;
            if (response === null || response === undefined || (typeof potentialError === "string" && potentialError.toLowerCase().includes("error"))) {
                throw new Error(potentialError || "Unable to save list");
            }
            setList((prev) => ({
                ...(prev || {}),
                title: payload.title,
                items: payload.items,
                ownerId: normalizedOwnerId,
            }));
            setIsEditing(false);
            setEditedList(null);
        } catch (err) {
            console.error("Failed to save list", err);
            setSaveError("Unable to save changes right now.");
        } finally {
            setSaving(false);
        }
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

    const normalizeCommentUserId = (comment) => {
        if (!comment) return null;
        const user = comment.user || comment.author || {};
        return user._id || user.id || comment.userId || null;
    };

    const normalizeCommentUser = (comment) => {
        const user = comment?.user || comment?.author || {};
        return {
            _id: user._id || user.id || null,
            username: user.username || user.name || "User",
            profilePic: user.profilePic || user.profilePicture || defaultAvatar,
        };
    };

    const normalizeCommentTimestamp = (comment) => {
        const raw = comment?.createdAt || comment?.timestamp || comment?.date;
        const date = raw ? new Date(raw) : new Date();
        if (Number.isNaN(date.getTime())) return "Just now";
        return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    };

    const fetchComments = useCallback(async () => {
        if (!listId) return;
        setCommentsLoading(true);
        setCommentsError("");
        try {
            const response = await showCommentsAPI(listId);
            const incoming = response?.comments || response || [];
            const commentsArray = Array.isArray(incoming) ? incoming : [];
            setComments(commentsArray);
            setList((prev) => ({ ...(prev || {}), comments: commentsArray.length }));
        } catch (err) {
            console.error("Failed to load comments", err);
            setCommentsError("Unable to load comments right now.");
        } finally {
            setCommentsLoading(false);
        }
    }, [listId]);

    const handleToggleComments = () => {
        const nextVisible = !commentsVisible;
        setCommentsVisible(nextVisible);
        if (nextVisible && comments.length === 0 && !commentsLoading) {
            fetchComments();
        }
    };

    const handleAddComment = async () => {
        if (!listId) return;
        const trimmed = newComment.trim();
        const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
        if (!trimmed) {
            setCommentsError("Please enter a comment before submitting.");
            return;
        }
        if (wordCount > 500) {
            setCommentsError("Comments are limited to 500 words.");
            return;
        }
        setSubmittingComment(true);
        setCommentsError("");
        try {
            const response = await addCommentAPI(listId, trimmed);
            const createdComment = response?.comment || response;
            if (!createdComment || typeof createdComment !== "object") {
                throw new Error("Unable to add comment");
            }
            const normalizedUser = normalizeCommentUser(createdComment);
            const userFromStore = currentUser
                ? {
                      _id: currentUser._id || currentUser.id || normalizedUser?._id || loggedInUserId,
                      username: currentUser.username || currentUser.name || normalizedUser?.username || "You",
                      profilePic:
                          currentUser.profilePic ||
                          currentUser.profilePicture ||
                          normalizedUser?.profilePic ||
                          defaultAvatar,
                  }
                : null;

            const fallbackUser = {
                _id: normalizedUser?._id || loggedInUserId,
                username: normalizedUser?.username || "You",
                profilePic: normalizedUser?.profilePic || defaultAvatar,
            };

            const normalizedComment = {
                ...createdComment,
                comment: createdComment?.comment || createdComment?.text || createdComment?.content || trimmed,
                user: userFromStore ? { ...normalizedUser, ...userFromStore } : fallbackUser,
                createdAt:
                    createdComment?.createdAt ||
                    createdComment?.timestamp ||
                    createdComment?.date ||
                    new Date().toISOString(),
            };
            setComments((prev) => [normalizedComment, ...prev]);
            setList((prev) => ({ ...(prev || {}), comments: (prev?.comments || 0) + 1 }));
            setNewComment("");
        } catch (err) {
            console.error("Failed to add comment", err);
            setCommentsError("Unable to add your comment right now.");
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!listId || !commentId) return;
        setDeletingCommentIds((prev) => ({ ...prev, [commentId]: true }));
        setCommentsError("");
        try {
            await deleteCommentAPI(listId, commentId);
            setComments((prev) => prev.filter((comment) => (comment?._id || comment?.id) !== commentId));
            setList((prev) => ({ ...(prev || {}), comments: Math.max((prev?.comments || 1) - 1, 0) }));
        } catch (err) {
            console.error("Failed to delete comment", err);
            setCommentsError("Unable to delete this comment right now.");
        } finally {
            setDeletingCommentIds((prev) => ({ ...prev, [commentId]: false }));
        }
    };

    const commentWordCount = newComment.trim() ? newComment.trim().split(/\s+/).filter(Boolean).length : 0;
    const isCommentTooLong = commentWordCount > 500;

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
                        <div className="list-detail-actions">
                            {isOwner && (
                                <button
                                    type="button"
                                    className={`edit-list-button ${isEditing ? "active" : ""}`}
                                    onClick={handleToggleEdit}
                                >
                                    <FiEdit2 size={16} />
                                    <span>{isEditing ? "Editing" : "Edit list"}</span>
                                </button>
                            )}
                            <div className="actions-right">
                                {isEditing && (
                                    <div className="save-controls">
                                        <button
                                            type="button"
                                            className={`save-list-button ${canSave ? "ready" : ""}`}
                                            disabled={!canSave || saving}
                                            onClick={handleSaveList}
                                        >
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                        {!canSave && (
                                            <p className="save-status muted">Add a title and exactly 10 items to save.</p>
                                        )}
                                        {saveError && <p className="save-status error">{saveError}</p>}
                                    </div>
                                )}
                                <div className="share-dropdown-wrapper" ref={shareRef}>
                                    <div type="button" className="share-list-button" onClick={toggleShareDropdown} aria-expanded={shareOpen} aria-haspopup="true">
                                        <IoIosSend size={26} color="black"/>
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
                        </div>
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
                            <List
                                list={list}
                                editable={isEditing}
                                setList={isEditing ? setEditedList : undefined}
                            />
                        </div>
                        <div className="comments-section">
                            <button
                                type="button"
                                className="toggle-comments"
                                onClick={handleToggleComments}
                            >
                                {commentsVisible ? "Hide comments" : `Show comments (${list?.comments ?? 0})`}
                            </button>
                            {commentsVisible && (
                                <div className="comments-panel">
                                    {commentsError && <p className="comment-error">{commentsError}</p>}
                                    {commentsLoading ? (
                                        <p className="comment-status">Loading comments...</p>
                                    ) : (
                                        <>
                                            <div className="comment-input-card">
                                                <div className="comment-input-row">
                                                    <img
                                                        src={defaultAvatar}
                                                        alt="Your avatar"
                                                        className="comment-avatar"
                                                    />
                                                    <div className="comment-input-area">
                                                        <textarea
                                                            value={newComment}
                                                            onChange={(event) => setNewComment(event.target.value)}
                                                            placeholder="Write a comment..."
                                                            color={"black"}
                                                            rows={3}
                                                        />
                                                        <div className="comment-actions">
                                                            <span className={`word-count ${isCommentTooLong ? "limit-exceeded" : ""}`}>
                                                                {commentWordCount}/500 words
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={handleAddComment}
                                                                disabled={submittingComment || isCommentTooLong}
                                                            >
                                                                {submittingComment ? "Posting..." : "Post"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="comment-list">
                                                {comments.length === 0 && (
                                                    <p className="comment-status">No comments yet. Be the first to join in!</p>
                                                )}
                                                {comments.map((comment) => {
                                                    const commentId = comment?._id || comment?.id;
                                                    const author = normalizeCommentUser(comment);
                                                    const commentOwnerId = normalizeCommentUserId(comment);
                                                    const canDeleteComment =
                                                        loggedInUserId &&
                                                        commentOwnerId &&
                                                        String(loggedInUserId) === String(commentOwnerId);
                                                    const commentBody = comment?.comment || comment?.text || comment?.content || "";
                                                    const commentTimestamp = normalizeCommentTimestamp(comment);
                                                    return (
                                                        <div key={commentId || commentBody} className="comment-item">
                                                            <div className="comment-author">
                                                                <img
                                                                    src={author.profilePic || defaultAvatar}
                                                                    alt={`${author.username}'s avatar`}
                                                                />
                                                                <div className="comment-meta">
                                                                    <p className="comment-username">{author.username}</p>
                                                                    <p className="comment-timestamp">{commentTimestamp}</p>
                                                                    <p className="comment-text">{commentBody}</p>
                                                                </div>
                                                            </div>
                                                            {canDeleteComment && (
                                                                <button
                                                                type="button"
                                                                className="delete-comment"
                                                                onClick={() => handleDeleteComment(commentId)}
                                                                disabled={Boolean(commentId && deletingCommentIds[commentId])}
                                                            >
                                                                {commentId && deletingCommentIds[commentId] ? "Deleting..." : "Delete"}
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            </div>
                                        </>
                                    )}
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
