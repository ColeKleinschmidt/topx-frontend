import "../css/Home.css";
import { useState, useEffect } from 'react';
import NavigationBar from "../../components/class/NavigationBar.jsx";
import { authStatusAPI } from "../../backend/apis.js";
import { useNavigate } from 'react-router-dom';
import MyLists from "./MyLists.jsx";
import FriendsLists from "./FriendsLists.jsx";
import Profile from "./Profile.jsx";
import List from "../../components/class/List.jsx";

const Home = ({ route }) => {

    const [page, setPage] = useState(route);
    const [showNewList, setShowNewList] = useState(false);

    const navigate = useNavigate();
    
    return (
        <div className="home-container">
            <NavigationBar setPage={setPage} page={page}/>
            <div className="home-content">
                {page === "myLists" ? (
                    <MyLists />
                ) : page === "friendsLists" ? (
                    <FriendsLists />
                ) : page === "profile" && (
                    <Profile />
                )}
                <div className={`newList ${showNewList ? "active" : ""}`} onClick={() => {setShowNewList(!showNewList)}}>+</div>
                <div className="newListContainerWrapper">
                    <div className={`newListContainer ${showNewList && "animate"}`}>
                        <List editable={true} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;