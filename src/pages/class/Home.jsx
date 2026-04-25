import "../css/Home.css";
import { useEffect, useState, useCallback } from 'react';
import NavigationBar from "../../components/class/NavigationBar.jsx";
import MyLists from "./MyLists.jsx";
import FriendsLists from "./FriendsLists.jsx";
import Profile from "./Profile.jsx";
import List from "../../components/class/List.jsx";
import FindFriends from "./FindFriends.jsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setNotifications } from "../../store/notificationsSlice.js";
import { setBlockedUsers } from "../../store/blockedUsersSlice.js";
import { getAllNotificationsAPI, getBlockedUsersAPI } from "../../backend/apis.js";
import SearchResults from "./SearchResults.jsx";

const Home = ({ route }) => {

    const [page, setPage] = useState(route);
    const [showNewList, setShowNewList] = useState(false);
    const [showQuickCreate, setShowQuickCreate] = useState(true);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = useParams();

    useEffect(() => {
        if (page !== "myLists" && showNewList) {
            setShowNewList(false);
        }
    }, [page, showNewList]);

    useEffect(() => {
        // Sync page state with current location
        if (location.pathname.startsWith('/profile')) {
            if (page !== 'profile') setPage('profile');
        } else if (location.pathname.startsWith('/findFriends')) {
            if (page !== 'findFriends') setPage('findFriends');
        } else if (location.pathname.startsWith('/friendsLists')) {
            if (page !== 'friendsLists') setPage('friendsLists');
        } else if (location.pathname.startsWith('/myLists')) {
            if (page !== 'myLists') setPage('myLists');
        } else if (location.pathname.startsWith('/search')) {
            if (page !== 'search') setPage('search');
        }
    }, [location.pathname, page]);

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
        if (document.cookie || localStorage.getItem("user")) {
            refreshNotifications();
        }
    }, [refreshNotifications]);

    useEffect(() => {
        if (showNewList) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showNewList]);
    
    return (
        <div className="home-container">
            <NavigationBar setPage={setPage} page={page} onNotificationsUpdated={refreshNotifications}/>
            <div className="home-content">
                {page === "myLists" ? (
                    <MyLists
                        onCreateList={() => setShowNewList(true)}
                    />
                ) : page === "friendsLists" ? (
                    <FriendsLists onFindFriends={() => setPage("findFriends")} />
                ) : page === "findFriends" ? (
                    <FindFriends onBackToFriends={() => setPage("friendsLists")} onNotificationsUpdated={refreshNotifications} />
                ) : page === "search" ? (
                    <SearchResults />
                ) : page === "profile" && (
                    <Profile userId={userId} />
                )}

            </div>
            {page === "myLists" && (
                <>
                    {showNewList && (
                        <div className="newListOverlay" onClick={() => setShowNewList(false)} />
                    )}
                    <div className={`newListContainer ${showNewList && "animate"}`}>
                        <List editable={true} showSubmitButton />
                    </div>
                    {showQuickCreate && (
                        <div className={`newList ${showNewList ? "active" : ""}`} onClick={() => {setShowNewList(!showNewList)}}>+</div>
                    )}
                </>
            )}
        </div>
    )
}

export default Home;
