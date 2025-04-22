import "../css/LandingPage.css";
import topXlogo from "../../assets/images/TopXLogo.png";
import backgroundImage from "../../assets/images/IndexBackground.png";

export default function LandingPage() {

    return (
        <div id ="content" style={{ backgroundImage: `url('${backgroundImage}')` }}>
            {"<!-- Welcome Card -->"}
            <div className="welcome-card">
                <img src={topXlogo} alt="TopX Logo" className="welcome-logo" />
                <h1>Welcome to TopX</h1>
                <p className="welcome-subtext">Let's hear your favorites</p>

                {/*<!-- Sign Up Form-->*/}
                <div id="signup-form" className="form-container">
                    <h2 id="form-title">Sign Up</h2>
                    <form>
                        <label for="signup-username" className="form-label">Username</label>
                        <input type="text" id="signup-username" placeholder="Enter your username" className="form-input" />

                        <label for="signup-email" className="form-label">Email</label>
                        <input type="email" id="signup-email" placeholder="Enter your email" className="form-input" />
                    
                        <label for="signup-password" className="form-label">Password</label>
                        <input type="password" id="signup-password" placeholder="Create a password" className="form-input" />
                    
                        <button type="button" className="form-button" id="signup-button">Continue</button>
                    </form>
                </div>

                {/*<!-- Log In Form -->*/}
                <div id="login-form" className="form-container hidden">
                    <h2 id="form-title">Log In</h2>
                    <form>
                        <label for="login-email" className="form-label">Email</label>
                        <input type="email" id="login-email" placeholder="Enter your email" className="form-input" />

                        <label for="login-password" className="form-label">Password</label>
                        <input type="password" id="login-password" placeholder="Enter your password" className="form-input" />

                        <button type="button" className="form-button" id="login-button">Log In</button>
                    </form>
                </div>
                <div className="welcome-card-footer">
                    <span id="toggle-text">Already a member?</span>
                    <a href="#" id="toggle-link">Log In</a>
                </div>
            </div>
        </div>
    )
}