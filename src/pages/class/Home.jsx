import "../css/Home.css";
import { useState, useEffect } from 'react';
import NavigationBar from "../../components/class/NavigationBar.jsx";
import { authStatusAPI } from "../../backend/apis.js";
import { useNavigate } from 'react-router-dom';
import Feed from "./Feed.jsx";
import Friends from "./Friends.jsx";
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
                {page === "feed" ? (
                    <Feed />
                ) : page === "friends" ? (
                    <Friends />
                ) : page === "profile" && (
                    <Profile />
                )}
            </div>
        </div>
    )
}

export default Home;