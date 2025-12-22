import "../css/Home.css";
import { useEffect, useState } from 'react';
import NavigationBar from "../../components/class/NavigationBar.jsx";
import MyLists from "./MyLists.jsx";
import FriendsLists from "./FriendsLists.jsx";
import Profile from "./Profile.jsx";
import List from "../../components/class/List.jsx";
import FindFriends from "./FindFriends.jsx";
import { useNavigate } from "react-router-dom";
import { getAllNotificationsAPI } from "../../backend/apis.js";

const Home = ({ route }) => {

    const [page, setPage] = useState(route);
    const [showNewList, setShowNewList] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (page !== "myLists" && showNewList) {
            setShowNewList(false);
        }
    }, [page, showNewList]);

    useEffect(() => {
        if (page) {
            navigate(`/${page}`, { replace: true });
        }
    }, [page, navigate]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await getAllNotificationsAPI();
                if (response?.notifications) {
                    setNotifications(response.notifications);
                }
            } catch (error) {
                console.error("Failed to load notifications", error);
            }
        };

        if (document.cookie || localStorage.getItem("user")) {
            fetchNotifications();
        }
    }, []);

    const refreshNotifications = async () => {
        try {
            const response = await getAllNotificationsAPI();
            if (response?.notifications) {
                setNotifications(response.notifications);
            }
        } catch (error) {
            console.error("Failed to refresh notifications", error);
        }
    };
    
    return (
        <div className="home-container">
            <NavigationBar setPage={setPage} page={page}/>
            <div className="home-content">
                {page === "myLists" ? (
                    <MyLists />
                ) : page === "friendsLists" ? (
                    <FriendsLists onFindFriends={() => setPage("findFriends")} />
                ) : page === "findFriends" ? (
                    <FindFriends
                        onBackToFriends={() => setPage("friendsLists")}
                        notifications={notifications}
                        onNotificationsUpdated={refreshNotifications}
                    />
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
