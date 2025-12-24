import "../css/Home.css";
import { useEffect, useState, useCallback } from 'react';
import NavigationBar from "../../components/class/NavigationBar.jsx";
import FriendsLists from "./FriendsLists.jsx";
import DiscoverLists from "./DiscoverLists.jsx";
import Profile from "./Profile.jsx";
import FindFriends from "./FindFriends.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setNotifications } from "../../store/notificationsSlice.js";
import { setBlockedUsers } from "../../store/blockedUsersSlice.js";
import { setUser } from "../../store/userSlice.js";
import { setTheme } from "../../store/themeSlice.js";
import { authStatusAPI, getAllNotificationsAPI, getBlockedUsersAPI } from "../../backend/apis.js";
import SearchResults from "./SearchResults.jsx";

const Home = ({ route }) => {

    const [page, setPage] = useState(route);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!page) return;
        const targetBase = `/${page}`;
        const isOnTargetBase = location.pathname === targetBase || location.pathname.startsWith(`${targetBase}/`);
        if (!isOnTargetBase) {
            if (page === "search") return;
            navigate(targetBase, { replace: true });
        }
    }, [page, navigate, location.pathname]);

    const refreshUserProfile = useCallback(async () => {
        try {
            const response = await authStatusAPI();
            const userProfile = response?.user || response?.profile || null;
            if (userProfile) {
                dispatch(setUser(userProfile));
                localStorage.setItem("user", JSON.stringify(userProfile));
                if (typeof userProfile.darkTheme === "boolean") {
                    dispatch(setTheme(userProfile.darkTheme ? "dark" : "light"));
                }
            }
        } catch (error) {
            console.error("Failed to refresh user profile", error);
        }
    }, [dispatch]);

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

    const refreshAppState = useCallback(async () => {
        await Promise.all([
            refreshUserProfile(),
            refreshNotifications(),
        ]);
    }, [refreshNotifications, refreshUserProfile]);

    useEffect(() => {
        if (document.cookie || localStorage.getItem("user")) {
            refreshAppState();
        }
    }, [refreshAppState]);
    
    return (
        <div className="home-container">
            <NavigationBar setPage={setPage} page={page} onNotificationsUpdated={refreshNotifications}/>
            <div className="home-content">
                {page === "discoverLists" ? (
                    <DiscoverLists />
                ) : page === "friendsLists" ? (
                    <FriendsLists onFindFriends={() => setPage("findFriends")} />
                ) : page === "findFriends" ? (
                    <FindFriends onBackToFriends={() => setPage("friendsLists")} onNotificationsUpdated={refreshNotifications} />
                ) : page === "search" ? (
                    <SearchResults />
                ) : page === "profile" && (
                    <Profile />
                )}

            </div>
        </div>
    )
}

export default Home;
