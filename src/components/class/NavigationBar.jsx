import { useState, useEffect } from 'react';
import "../css/NavigationBar.css"; 

const NavigationBar = ({ setPage, page }) => {

    return (
        <div className="navigation-bar">
            <div className={'logo-container'}>
                <h2>Topx</h2>
            </div>
            <div className="navigation-container">
                <div onClick={() => setPage("friends")} className={`navigation-element ${page === "friends" && "underline" }`}>
                    <h2>My lists</h2>
                </div>
                <div onClick={() => setPage("feed")} className={`navigation-element ${page === "feed" && "underline" }`}>
                    <h2>Friend lists</h2>
                </div>
                <input className="search-lists" placeholder="Search lists" type="text" />
            </div>
            <div className={'profile-buttons'}>
                <div onClick={() => alert("notifications")} className="notifications-button">
                    alert
                </div>
                <div onClick={() => alert("messages")} className="messages-button">
                    something
                </div>
                <div onClick={() => alert("profile")} className="profile-button">
                something
                </div>
            </div>

        </div>
    )
}

export default NavigationBar;