import "../css/LandingPage.css";
import { useEffect, useState } from 'react';
import topXlogo from "../../assets/images/topxlogo.webp";
import heroImage from "../../assets/images/topx-home.webp";
import { useNavigate } from 'react-router-dom';
import { authStatusAPI, loginAPI, createAccountAPI } from "../../backend/apis.js";
import { FaListOl, FaUserFriends, FaExchangeAlt, FaBullseye } from 'react-icons/fa';

export default function LandingPage() {

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("login"); // "login" or "signup"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        authStatusAPI().then((response) => {
            if (response.authenticated) {
                navigate("/myLists");
            }
        })
    },[]);

    useEffect(() => {
        setEmail("");
        setPassword("");
        setUsername("");
        setErrorMessage("");
    },[modalMode]);

    const openModal = (mode) => {
        setModalMode(mode);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setErrorMessage("");
    };

    const signUp = () => {
        if (username.trim() === "" || email.trim() === "" || password === "") {
            setErrorMessage("Please fill in all fields");
            return;
        }

        createAccountAPI(username.trim(), email.trim(), password).then((response) => {
            if (response.user !== undefined && response.user !== null) {
                localStorage.setItem("user", JSON.stringify(response.user));
                closeModal();
                window.location.href = "/myLists";
            } else {
                setErrorMessage(response.message || "Unable to create account");
            }
        })
    }

    const login = () => {
        if (email.trim() === "" || password === "") {
            setErrorMessage("Please fill in all fields");
            return;
        }

        loginAPI(email.trim(), password).then((response) => {
            console.log("Login response:", response);
            if (response.user !== undefined && response.user !== null) {
                localStorage.setItem("user", JSON.stringify(response.user));
                setErrorMessage("");
                closeModal();
                // Force a full page reload to ensure auth state is fresh
                window.location.href = "/myLists";
            } else {
                const message = response?.message || "Unable to log in. Please try again.";
                setErrorMessage(message);
            }
        }).catch((error) => {
            console.error("Login error:", error);
            setErrorMessage("Connection error. Please try again.");
        })
    }

    return (
        <div className="landing-page">
            {/* Header */}
            <header className="landing-header">
                <div className="header-content">
                    <div className="logo-section">
                        <img src={topXlogo} alt="TopX Logo" className="header-logo" />
                    </div>
                    <button className="login-signup-btn" onClick={() => openModal("login")}>
                        Login/Signup
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            The Social App<br />for Your Favorite Things
                        </h1>
                        <h3 className="hero-subtitle">
                            TopX is the easiest way to create and share top 10 lists of everything you love — from your favorite TV shows and travel spots to the best tacos in town.
                        </h3>
                    </div>
                    <div className="hero-image">
                        <img src={heroImage} alt="App Preview" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="features-title">What'z it?</h2>
                <div className="features-grid">
                    <div className="feature-box">
                        <div className="feature-icon">
                            <FaListOl />
                        </div>
                        <h3 className="feature-title">Top 10, Your Way</h3>
                        <p className="feature-description">
                            Create and customize top 10 lists for anything — no rules, just your opinions. Add photos, links, descriptions, or just keep it simple.
                        </p>
                    </div>

                    <div className="feature-box">
                        <div className="feature-icon">
                            <FaUserFriends />
                        </div>
                        <h3 className="feature-title">Social Discovery</h3>
                        <p className="feature-description">
                            Follow friends and tastemakers to see what they're ranking. Compare lists, find overlap, or debate what really belongs at the top.
                        </p>
                    </div>

                    <div className="feature-box">
                        <div className="feature-icon">
                            <FaExchangeAlt />
                        </div>
                        <h3 className="feature-title">Rank Remix</h3>
                        <p className="feature-description">
                            Inspired by someone's list? Clone it and make it your own with a few taps. Add your own spin and keep the conversation going.
                        </p>
                    </div>

                    <div className="feature-box">
                        <div className="feature-icon">
                            <FaBullseye />
                        </div>
                        <h3 className="feature-title">Search Less, Discover More</h3>
                        <p className="feature-description">
                            Find the best of anything, faster. Whether choosing your next binge-watch or building a weekend plan, see what people love most.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>© 2026 TopX Network. All rights reserved</p>
            </footer>

            {/* Login/Signup Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <img src={topXlogo} alt="TopX Logo" className="modal-logo" />
                        </div>
                        <button className="modal-close" onClick={closeModal}>×</button>
                        
                        {modalMode === "login" ? (
                            <div className="modal-form">
                                <h2 className="modal-title">Log In</h2>
                                <form>
                                    <label htmlFor="login-email" className="form-label">Email</label>
                                    <input 
                                        onChange={(e) => {setEmail(e.target.value); setErrorMessage("");}} 
                                        type="email" 
                                        id="login-email" 
                                        placeholder="Enter your email" 
                                        className="form-input" 
                                    />

                                    <label htmlFor="login-password" className="form-label">Password</label>
                                    <input 
                                        onChange={(e) => {setPassword(e.target.value); setErrorMessage("");}} 
                                        type="password" 
                                        id="login-password" 
                                        placeholder="Enter your password" 
                                        className="form-input" 
                                    />

                                    {errorMessage && <div className="error-banner">{errorMessage}</div>}

                                    <button onClick={() => login()} type="button" className="form-button">
                                        Log In
                                    </button>
                                </form>
                                <div className="modal-footer">
                                    <span>Don't have an account? </span>
                                    <span className="toggle-link" onClick={() => setModalMode("signup")}>Sign Up</span>
                                </div>
                            </div>
                        ) : (
                            <div className="modal-form">
                                <h2 className="modal-title">Sign Up</h2>
                                <form>
                                    <label htmlFor="signup-username" className="form-label">Username</label>
                                    <input 
                                        onChange={(e) => {setUsername(e.target.value); setErrorMessage("");}} 
                                        type="text" 
                                        id="signup-username" 
                                        placeholder="Enter your username" 
                                        className="form-input" 
                                    />

                                    <label htmlFor="signup-email" className="form-label">Email</label>
                                    <input 
                                        onChange={(e) => {setEmail(e.target.value); setErrorMessage("");}} 
                                        type="email" 
                                        id="signup-email" 
                                        placeholder="Enter your email" 
                                        className="form-input" 
                                    />
                                
                                    <label htmlFor="signup-password" className="form-label">Password</label>
                                    <input 
                                        onChange={(e) => {setPassword(e.target.value); setErrorMessage("");}} 
                                        type="password" 
                                        id="signup-password" 
                                        placeholder="Create a password" 
                                        className="form-input" 
                                    />

                                    {errorMessage && <div className="error-banner">{errorMessage}</div>}
                                
                                    <button onClick={() => signUp()} type="button" className="form-button">
                                        Continue
                                    </button>
                                </form>
                                <div className="modal-footer">
                                    <span>Already a member? </span>
                                    <span className="toggle-link" onClick={() => setModalMode("login")}>Log In</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
