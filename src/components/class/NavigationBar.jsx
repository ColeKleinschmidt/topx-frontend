import { useState, useEffect } from 'react';
import "../css/NavigationBar.css"; 
import { IoIosCheckmarkCircle } from "react-icons/io";
import { BsLink } from "react-icons/bs";
import { FaBell } from "react-icons/fa";
import { IoIosSend, IoIosSearch } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";

const NavigationBar = ({ setPage, page }) => {

    return (
        <div className="navigation-bar">
            <div className={'logo-container'}>
                <h2>Topx</h2>
            </div>
            <div className="navigation-container">
                <div onClick={() => setPage("myLists")} className={`navigation-element ${page === "friends" && "underline" }`}>
                    <IoIosCheckmarkCircle color="white" size={25} />
                    <h2>My lists</h2>
                </div>
                <div onClick={() => setPage("friendsLists")} className={`navigation-element ${page === "feed" && "underline" }`}>
                    <BsLink color="white" size={40} />
                    <h2>Friend lists</h2>
                </div>
                <input className="search-lists" placeholder="Search lists" type="text" />
                <IoIosSearch className="search-lists-icon" size={20} color="#FF6B6B"/>
            </div>
            <div className={'profile-buttons'}> 
                <div onClick={() => alert("notifications")} className="notifications-button">
                    <FaBell color="white" size={20}/>
                </div>
                <div onClick={() => alert("shared")} className="shared-button">
                    <IoIosSend color="white" size={25}/>
                </div>
                <div onClick={() => alert("profile")} className="profile-button">
                    <MdAccountCircle color="white" size={25}/>
                </div>
            </div>

        </div>
    )
}

export default NavigationBar;