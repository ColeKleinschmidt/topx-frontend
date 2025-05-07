import { useState, useEffect } from 'react';
import "../css/NavigationBar.css"; 

const NavigationBar = ({ setPage, page }) => {

    return (
        <div className="navigation-bar">
            <div onClick={() => setPage("friends")} className={`navigation-element ${page === "friends" && "underline" }`}>
                <h2>Friends</h2>
            </div>
            <div onClick={() => setPage("feed")} className={`navigation-element ${page === "feed" && "underline" }`}>
                <h2>Feed</h2>
            </div>
            <div onClick={() => setPage("profile")} className={`navigation-element ${page === "profile" && "underline" }`}>
                <h2>Profile</h2>
            </div>
        </div>
    )
}

export default NavigationBar;