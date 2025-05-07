import "../css/Home.css";
import { useState, useEffect } from 'react';
import NavigationBar from "../../components/class/NavigationBar.jsx";
import { authStatusAPI } from "../../backend/apis.js";
import { useNavigate } from 'react-router-dom';
import MyLists from "./MyLists.jsx";
import FriendsLists from "./FriendsLists.jsx";
import Profile from "./Profile.jsx";

const Home = ({ route }) => {

    const [page, setPage] = useState(route);

    const navigate = useNavigate();

    // useEffect(() => {
    //     authStatusAPI().then((response) => {
    //         if (!response.authenticated) {
    //             navigate("/");
    //         }
    //     })
    // },[]);
    
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
            </div>
        </div>
    )
}

export default Home;