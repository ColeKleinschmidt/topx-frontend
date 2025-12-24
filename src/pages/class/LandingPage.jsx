import "../css/LandingPage.css";
import { useEffect, useState } from 'react';
import topXlogo from "../../assets/images/TopXLogo.png";
import backgroundImage from "../../assets/images/IndexBackground.png";
import { useNavigate } from 'react-router-dom';
import { authStatusAPI, loginAPI, createAccountAPI } from "../../backend/apis.js";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/userSlice.js";

export default function LandingPage() {

    const [page, setPage] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        authStatusAPI().then((response) => {
            if (response.authenticated) {
                navigate("/friendsLists");
            }
        })
    },[]);

    useEffect(() => {
        setEmail("");
        setPassword("");
        setUsername("");
        setErrorMessage("");
    },[page]);

    const signUp = () => {
        if (username.trim() === "" || email.trim() === "" || password === "") {
            setErrorMessage("Please fill in all fields");
            return;
        }

        createAccountAPI(username.trim(), email.trim(), password).then((response) => {
            if (response.user !== undefined && response.user !== null) {
                // If successful, navigate to the feed page
                localStorage.setItem("user", JSON.stringify(response.user));
                dispatch(setUser(response.user));
                setErrorMessage("");
                navigate("/friendsLists");
            }else {
                // If unsuccessful, surface the error message
                const message = response?.message || "Unable to create account. Please try again.";
                setErrorMessage(message);
            }
        })
    }

    const login = () => {
        if (email.trim() === "" || password === "") {
            setErrorMessage("Please fill in all fields");
            return;
        }

        loginAPI(email.trim(), password).then((response) => {
            if (response.user !== undefined && response.user !== null) {
                // If successful, navigate to the feed page
                localStorage.setItem("user", JSON.stringify(response.user));
                dispatch(setUser(response.user));
                setErrorMessage("");
                navigate("/friendsLists");
            }else {
                // If unsuccessful, surface the error message
                const message = response?.message || "Unable to log in. Please try again.";
                setErrorMessage(message);
            }
        })
    }

    return (
        <div id="content" style={{ backgroundImage: `url('${backgroundImage}')` }}>
            {/* Welcome Card */}
            <div className="welcome-card">
                <img src={topXlogo} alt="TopX Logo" className="welcome-logo" />
                <h1>Welcome to TopX</h1>
                <p className="welcome-subtext">Let's hear your favorites</p>

                {/*<!-- Sign Up Form-->*/}
                <div id="signup-form" className={`form-container ${page !== "register" && "hidden"}`}>
                    <h2 id="form-title">Sign Up</h2>
                    <form>
                        <label htmlFor="signup-username" className="form-label">Username</label>
                        <input onChange={(e) => {setUsername(e.target.value); setErrorMessage("");}} type="text" id="signup-username" placeholder="Enter your username" className="form-input" />

                        <label htmlFor="signup-email" className="form-label">Email</label>
                        <input onChange={(e) => {setEmail(e.target.value); setErrorMessage("");}} type="email" id="signup-email" placeholder="Enter your email" className="form-input" />

                        <label htmlFor="signup-password" className="form-label">Password</label>
                        <input onChange={(e) => {setPassword(e.target.value); setErrorMessage("");}} type="password" id="signup-password" placeholder="Create a password" className="form-input" />

                        {errorMessage && <div className="error-banner">{errorMessage}</div>}
                    
                        <button onClick={() => signUp()} type="button" className="form-button" id="signup-button">Continue</button>
                    </form>
                    <div className="welcome-card-footer">
                        <span id="toggle-text">Already a member?</span>
                        <div onClick={() => setPage("login")} id="toggle-link">Log In</div>
                    </div>
                </div>

                {/*<!-- Log In Form -->*/}
                <div id="login-form" className={`form-container ${page !== "login" && "hidden"}`}>
                    <h2 id="form-title">Log In</h2>
                    <form>
                        <label htmlFor="login-email" className="form-label">Email</label>
                        <input onChange={(e) => {setEmail(e.target.value); setErrorMessage("");}} type="email" id="login-email" placeholder="Enter your email" className="form-input" />

                        <label htmlFor="login-password" className="form-label">Password</label>
                        <input onChange={(e) => {setPassword(e.target.value); setErrorMessage("");}} type="password" id="login-password" placeholder="Enter your password" className="form-input" />

                        {errorMessage && <div className="error-banner">{errorMessage}</div>}

                        <button onClick={() => login()} type="button" className="form-button" id="login-button">Log In</button>
                    </form>
                    <div className="welcome-card-footer">
                        <span id="toggle-text">Don't have an account?</span>
                        <div onClick={() => setPage("register")} id="toggle-link">Sign Up</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
