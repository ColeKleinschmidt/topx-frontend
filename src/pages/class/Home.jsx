import "../css/Home.css";
import { useState, useEffect } from 'react';
import NavigationBar from "../../components/class/NavigationBar.jsx";
import { authStatusAPI, findItemsAPI } from "../../backend/apis.js";
import { useNavigate } from 'react-router-dom';
import MyLists from "./MyLists.jsx";
import FriendsLists from "./FriendsLists.jsx";
import Profile from "./Profile.jsx";

const Home = ({ route }) => {

    const [page, setPage] = useState(route);
    const [showNewList, setShowNewList] = useState(false);

    const navigate = useNavigate();

    const newList = () => {
        
    }

    // useEffect(() => {
    //     authStatusAPI().then((response) => {
    //         if (!response.authenticated) {
    //             navigate("/");
    //         }
    //     })
    // },[]);

    const async searchItem = (item) => {
        findItemsAPI(item).then((response) => {
            
        })
    }
    
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
                        <input onChange={(x) => {searchItem(x.target.value)} placholder="Title" className="titleInput"} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;