import "../css/Home.css";
import { useEffect, useState, useCallback } from 'react';
import NavigationBar from "../../components/class/NavigationBar.jsx";
import MyLists from "./MyLists.jsx";
import FriendsLists from "./FriendsLists.jsx";
import Profile from "./Profile.jsx";
import List from "../../components/class/List.jsx";
import FindFriends from "./FindFriends.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setNotifications } from "../../store/notificationsSlice.js";
import { getAllNotificationsAPI } from "../../backend/apis.js";

const Home = ({ route }) => {

    const [page, setPage] = useState(route);
    const [showNewList, setShowNewList] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (page !== "myLists" && showNewList) {
            setShowNewList(false);
        }
    }, [page, showNewList]);

    useEffect(() => {
        if (!page) return;
        const targetBase = `/${page}`;
        const isOnTargetBase = location.pathname === targetBase || location.pathname.startsWith(`${targetBase}/`);
        if (!isOnTargetBase) {
            navigate(targetBase, { replace: true });
        }
    }, [page, navigate, location.pathname]);

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
        if (document.cookie || localStorage.getItem("user")) {
            refreshNotifications();
        }
    }, [refreshNotifications]);
    
    return (
        <div className="home-container">
            <NavigationBar setPage={setPage} page={page} onNotificationsUpdated={refreshNotifications}/>
            <div className="home-content">
                {page === "myLists" ? (
                    <MyLists />
                ) : page === "friendsLists" ? (
                    <FriendsLists onFindFriends={() => setPage("findFriends")} />
                ) : page === "findFriends" ? (
                    <FindFriends onBackToFriends={() => setPage("friendsLists")} onNotificationsUpdated={refreshNotifications} />
                ) : page === "profile" && (
                    <Profile />
                )}

            </div>
            {page === "myLists" && (
                <>
                    <div className={`newListContainer ${showNewList && "animate"}`}>
                        <List editable={true} />
                    </div>
                    <div className={`newList ${showNewList ? "active" : ""}`} onClick={() => {setShowNewList(!showNewList)}}>+</div>
                </>
            )}
        </div>
    )
}

export default Home;
